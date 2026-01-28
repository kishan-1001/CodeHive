import React, { useState, useEffect } from 'react';
import { X, MessageCircle, User, Heart, Reply, CornerDownRight } from 'lucide-react';
import { postsAPI } from '../services/api';
import { Link } from 'react-router-dom';

interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  author_name: string;
  username: string;
  avatar_url?: string;
  like_count: number;
  is_liked: boolean;
  parent_id: number | null;
  replies?: Comment[];
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
  postTitle: string;
  initialComments?: Comment[];
  onCommentAdded?: () => void;
}

const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  postId,
  postTitle,
  initialComments = [],
  onCommentAdded
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  useEffect(() => {
    if (isOpen && postId) {
      fetchComments();
    }
  }, [isOpen, postId]);

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const fetchedComments = await postsAPI.getComments(postId);
      // Build tree
      const commentMap = new Map<number, Comment>();
      const roots: Comment[] = [];

      fetchedComments.forEach((c: any) => {
        const comment: Comment = { ...c, replies: [] };
        commentMap.set(c.id, comment);
      });

      fetchedComments.forEach((c: any) => {
        const comment = commentMap.get(c.id)!;
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          if (parent) {
            parent.replies?.push(comment);
          } else {
            roots.push(comment); // Orphaned reply, treat as root for now
          }
        } else {
          roots.push(comment);
        }
      });

      setComments(roots);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleLike = async (commentId: number) => {
    try {
      const response = await postsAPI.likeComment(commentId);
      const isLiked = response.message === 'Liked';

      // Update local state recursively
      const updateLikeState = (list: Comment[]): Comment[] => {
        return list.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              is_liked: isLiked,
              like_count: isLiked ? c.like_count + 1 : c.like_count - 1
            };
          }
          if (c.replies?.length) {
            return { ...c, replies: updateLikeState(c.replies) };
          }
          return c;
        });
      };

      setComments(prev => updateLikeState(prev));
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent, parentId: number | null = null) => {
    e.preventDefault();
    const content = parentId ? replyContent : newComment;

    if (!content.trim()) return;

    setIsLoading(true);
    try {
      await postsAPI.commentOnPost(postId, { content, parent_id: parentId || undefined });
      if (parentId) {
        setReplyContent('');
        setReplyingTo(null);
      } else {
        setNewComment('');
      }
      await fetchComments();
      onCommentAdded?.();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment, depth?: number }) => {
    const [showReplies, setShowReplies] = useState(false);
    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
      <div className={`flex flex-col ${depth > 0 ? 'ml-8 mt-3 relative' : 'mt-4'}`}>
        {depth > 0 && (
          <div className="absolute -left-6 top-4 w-4 h-4 border-l-2 border-b-2 border-gray-700 rounded-bl-lg"></div>
        )}
        <div className="bg-transparent rounded-lg p-0">
          <div className="flex gap-3">
            <Link
              to={`/profile/${comment.username}`}
              className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden shrink-0 border border-gray-700 mt-1 hover:border-amber-500/50 transition-colors"
              onClick={onClose}
            >
              {comment.avatar_url ? (
                <img
                  src={comment.avatar_url}
                  alt={comment.author_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-gray-400" />
              )}
            </Link>

            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <Link
                  to={`/profile/${comment.username}`}
                  className="text-gray-200 font-semibold text-sm hover:text-amber-500 transition-colors"
                  onClick={onClose}
                >
                  {comment.author_name}
                </Link>
                <span className="text-gray-500 text-xs">
                  {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed mb-2">{comment.content}</p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLike(comment.id)}
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors group ${comment.is_liked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'
                    }`}
                >
                  <Heart className={`w-3.5 h-3.5 group-hover:scale-110 transition-transform ${comment.is_liked ? 'fill-pink-500' : ''}`} />
                  {comment.like_count || 0}
                </button>

                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <Reply className="w-3.5 h-3.5" />
                  Reply
                </button>
              </div>

              {replyingTo === comment.id && (
                <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-3 flex gap-2 animate-fadeIn">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Reply to ${comment.author_name}...`}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !replyContent.trim()}
                    className="bg-amber-500 text-black px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-400 transition-colors"
                  >
                    Reply
                  </button>
                </form>
              )}

              {hasReplies && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="mt-2 flex items-center gap-2 text-xs font-medium text-amber-500 hover:text-amber-400 transition-colors"
                >
                  <div className="w-8 h-[1px] bg-gray-700"></div>
                  {showReplies ? 'Hide replies' : `View ${comment.replies?.length} replies`}
                </button>
              )}
            </div>
          </div>
        </div>

        {hasReplies && showReplies && (
          <div className="comments-tree animate-fadeIn">
            {comment.replies!
              .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              .map(reply => (
                <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
              ))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md h-full bg-[#0a0a0a] border-l border-white/10 shadow-2xl animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-[#0a0a0a]/95 backdrop-blur absolute top-0 left-0 right-0 z-10">
          <div className="flex items-center gap-3">
            {/* <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center border border-amber-400/20">
              <MessageCircle className="w-5 h-5 text-amber-500" />
            </div> */}
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Comments</h2>
              <p className="text-gray-500 text-xs truncate max-w-[240px] mt-0.5">{postTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent pt-24 px-6 pb-6">
          {isLoadingComments ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-20 opacity-0 animate-fadeIn" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
                <MessageCircle className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-gray-300 font-medium mb-1">No comments yet</h3>
              <p className="text-gray-500 text-sm">Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {comments
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Newest root comments first
                .map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
            </div>
          )}
        </div>

        {/* Comment Form */}
        <div className="p-4 border-t border-gray-800 bg-[#0a0a0a] z-20">
          <form onSubmit={(e) => handleSubmit(e, null)} className="relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !newComment.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-amber-500 text-black rounded-lg hover:bg-amber-400 disabled:opacity-0 disabled:pointer-events-none transition-all duration-200"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <CornerDownRight className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
