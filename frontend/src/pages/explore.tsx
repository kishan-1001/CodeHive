import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, User } from 'lucide-react';
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

const Explore: React.FC = () => {
  const navigate = useNavigate();
  const [isKnowledgeDropOpen, setIsKnowledgeDropOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="relative min-h-screen selection:bg-amber-400/30">
      {/* Custom Cursor/Glow Effect */}
      <div
        className="fixed pointer-events-none w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-amber-500/5 rounded-full blur-[100px] z-0 transition-transform duration-300 ease-out"
        style={{ left: mousePos.x, top: mousePos.y }}
      ></div>

      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
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
            <h1 className="text-3xl font-bold text-white mb-2">Knowledge Drop</h1>
            <p className="text-gray-400">Share and discover coding insights from the community</p>
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
                  <p className="text-gray-300 mb-4 leading-relaxed">{post.content}</p>

                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{post.like_count}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
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
