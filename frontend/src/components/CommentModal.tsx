import React, { useState, useEffect } from 'react';
import { X, MessageCircle, User } from 'lucide-react';
import { postsAPI } from '../services/api';

interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  author_name: string;
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
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
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
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      await postsAPI.commentOnPost(postId, { content: newComment });
      setNewComment('');
      await fetchComments();
      onCommentAdded?.();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-card rounded-2xl p-8 w-full max-w-2xl mx-4 shadow-2xl border border-white/10 animation-fadeIn h-[80vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="mb-6 flex items-center gap-3 flex-shrink-0">
          <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center border border-amber-400/20">
            <MessageCircle className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Comments</h2>
            <p className="text-gray-400 text-sm truncate max-w-md">{postTitle}</p>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 mb-6">
          {isLoadingComments ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((comment) => (
                <div key={comment.id} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-amber-400/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <span className="text-white font-medium text-sm">{comment.author_name}</span>
                      <span className="text-gray-400 text-xs ml-2">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="border-t border-gray-700 pt-4 flex-shrink-0">
          <div className="flex gap-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !newComment.trim()}
              className="bg-amber-400 text-black px-6 py-3 rounded-lg hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Comment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentModal;
