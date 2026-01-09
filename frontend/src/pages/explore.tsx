import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, User, ChevronDown } from 'lucide-react';
import Header from '../components/Header';
import KnowledgeDropModal from '../components/KnowledgeDropModal';
import CommentModal from '../components/CommentModal';
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
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPosts, setExpandedPosts] = useState<{ [key: number]: boolean }>({});

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

  const openCommentModal = (post: Post) => {
    setSelectedPostForComments(post);
    setIsCommentModalOpen(true);
  };

  const closeCommentModal = () => {
    setIsCommentModalOpen(false);
    setSelectedPostForComments(null);
  };

  const handleCommentAdded = () => {
    fetchPosts(); // Refresh posts to update comment count
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

      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={closeCommentModal}
        postId={selectedPostForComments?.id || 0}
        postTitle={selectedPostForComments?.title || ''}
        onCommentAdded={handleCommentAdded}
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

                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-2 text-gray-400"
                    >
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{post.like_count}</span>
                    </button>
                    <button
                      onClick={() => openCommentModal(post)}
                      className="flex items-center gap-2 text-gray-400"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{post.comment_count}</span>
                    </button>
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
