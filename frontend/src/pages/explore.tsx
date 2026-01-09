import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, User, ChevronDown } from 'lucide-react';
import Header from '../components/Header';
import KnowledgeDropModal from '../components/KnowledgeDropModal';
import { postsAPI } from '../services/api';

interface Post {
  id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
  author_name: string;
  like_count: number;
  comment_count: number;
}

interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  author_name: string;
}

const Explore: React.FC = () => {
  const navigate = useNavigate();
  const [isKnowledgeDropOpen, setIsKnowledgeDropOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});
  const [expandedPosts, setExpandedPosts] = useState<{ [key: number]: boolean }>({});
  const [comments, setComments] = useState<{ [key: number]: Comment[] }>({});
  const commentRefs = useRef<{ [key: number]: HTMLElement | null }>({});
  const commentButtonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const submitButtonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/home');
  };

  const handleKnowledgeDropClick = () => {
    setIsKnowledgeDropOpen(true);
  };

  const fetchPosts = async () => {
    try {
      const fetchedPosts = await postsAPI.getPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleLike = async (postId: number) => {
    try {
      await postsAPI.likePost(postId);
      // Refresh posts to update like count
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const toggleComments = async (postId: number) => {
    const isCurrentlyOpen = showComments[postId];

    if (isCurrentlyOpen) {
      // Close this comment section
      setShowComments(prev => {
        const newState = { ...prev };
        delete newState[postId];
        return newState;
      });
    } else {
      // Close all comments and open this one
      setShowComments({ [postId]: true });

      // Fetch comments if not already fetched
      if (!comments[postId]) {
        try {
          const fetchedComments = await postsAPI.getComments(postId);
          setComments(prev => ({ ...prev, [postId]: fetchedComments }));
        } catch (error) {
          console.error('Error fetching comments:', error);
        }
      }
    }
  };

  const handleCommentSubmit = async (postId: number) => {
    const commentContent = commentInputs[postId]?.trim();
    if (!commentContent) return;

    try {
      await postsAPI.commentOnPost(postId, { content: commentContent });
      // Clear the input and refresh posts to update comment count
      setCommentInputs({ ...commentInputs, [postId]: '' });
      fetchPosts();
      // Refresh comments for this post
      const updatedComments = await postsAPI.getComments(postId);
      setComments({ ...comments, [postId]: updatedComments });
    } catch (error) {
      console.error('Error commenting on post:', error);
    }
  };

  const shouldTruncate = (content: string): boolean => {
    const words = content.split(' ');
    return words.length > 50;
  };

  const getTruncatedContent = (content: string): string => {
    const words = content.split(' ');
    return words.slice(0, 50).join(' ') + '...';
  };

  const toggleExpand = (postId: number) => {
    setExpandedPosts({ ...expandedPosts, [postId]: !expandedPosts[postId] });
  };

  useEffect(() => {
    fetchPosts();
  }, []);



  return (
    <div className="relative min-h-screen selection:bg-amber-400/30">
      {/* Background Orbs */}
      <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] -z-10"></div>

      <Header
        onSignOut={handleLogout}
        onKnowledgeDropClick={handleKnowledgeDropClick}
      />

      <KnowledgeDropModal
        isOpen={isKnowledgeDropOpen}
        onClose={() => setIsKnowledgeDropOpen(false)}
        onSuccess={fetchPosts}
      />

      <div className="relative min-h-screen pt-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            
            <p className="text-gray-400">Discover coding insights from the community</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 text-center">
              <p className="text-gray-400">No posts yet. Be the first to share your knowledge!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{post.author_name}</p>
                        <p className="text-gray-400 text-sm">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">{post.title}</h3>
                  <div className="mb-4">
                    <p className="text-gray-300 leading-relaxed">
                      {expandedPosts[post.id] || !shouldTruncate(post.content)
                        ? post.content
                        : getTruncatedContent(post.content)}
                    </p>
                    {shouldTruncate(post.content) && (
                      <button
                        onClick={() => toggleExpand(post.id)}
                        className="flex items-center gap-1 mt-2 text-amber-400 text-sm font-medium"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            expandedPosts[post.id] ? 'rotate-180' : ''
                          }`}
                        />
                        {expandedPosts[post.id] ? 'Show Less' : 'Read More'}
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-2 text-gray-400"
                      >
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">{post.like_count}</span>
                      </button>
                      <button
                        ref={(el) => { commentButtonRefs.current[post.id] = el; }}
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-2 text-gray-400"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{post.comment_count}</span>
                      </button>
                    </div>

                    {showComments[post.id] && (
                      <div className="border-t border-gray-700 pt-4">
                        {/* Display existing comments */}
                        {comments[post.id] && comments[post.id].length > 0 && (
                          <div className="mb-4">
                            <div className="max-h-60 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                              {comments[post.id]
                                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                .map((comment) => (
                                <div key={comment.id} className="bg-gray-700/30 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="w-6 h-6 rounded-full bg-amber-400/10 flex items-center justify-center">
                                      <User className="w-3 h-3 text-amber-400" />
                                    </div>
                                    <span className="text-white font-medium text-sm">{comment.author_name}</span>
                                    <span className="text-gray-400 text-xs">
                                      {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-gray-300 text-sm">{comment.content}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Comment input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            ref={(el) => { commentRefs.current[post.id] = el; }}
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                            onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                            placeholder="Write a comment..."
                            className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                          />
                          <button
                            ref={(el) => { submitButtonRefs.current[post.id] = el; }}
                            onClick={() => handleCommentSubmit(post.id)}
                            className="bg-amber-400 text-black px-4 py-2 rounded-lg hover:bg-amber-300 transition-colors font-medium"
                          >
                            Comment
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
