import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  User,
  Compass,
  Code2,
  Bookmark,
  Trophy
} from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
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
  username?: string;
  avatar_url?: string;
  like_count: number;
  comment_count: number;
  is_saved: boolean;
}

const Explore: React.FC = () => {
  const navigate = useNavigate();

  const [isKnowledgeDropOpen, setIsKnowledgeDropOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPosts, setExpandedPosts] = useState<{ [key: number]: boolean }>({});
  const [activeTab, setActiveTab] = useState('explore');


  useEffect(() => {
    fetchPosts();
    fetchTopContributors();
  }, [activeTab]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let fetchedPosts;
      if (activeTab === 'saved') {
        fetchedPosts = await postsAPI.getSavedPosts();
      } else {
        fetchedPosts = await postsAPI.getPosts();
      }
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
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleSave = async (postId: number) => {
    try {
      const response = await postsAPI.toggleSavePost(postId);
      // Optimistic update
      setPosts(posts.map(p =>
        p.id === postId ? { ...p, is_saved: response.is_saved } : p
      ));

      // If we are in saved tab and we unsave, strictly we might want to remove it, 
      // but keeping it until refresh is often better UX or just re-fetch.
      if (activeTab === 'saved' && !response.is_saved) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const toggleExpand = (postId: number) => {
    setExpandedPosts({ ...expandedPosts, [postId]: !expandedPosts[postId] });
  };

  const getAvatarSrc = (path: string | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    if (path.startsWith('/api')) return path;
    return `/api${path}`;
  };

  const shouldTruncate = (content: string) => content.split(' ').length > 40;



  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [topContributors, setTopContributors] = useState<{ name: string; username: string; avatar_url: string; total_likes: string; bg?: string; color?: string }[]>([]);

  useEffect(() => {
    fetchPosts();
    fetchTopContributors();
  }, []);

  const fetchTopContributors = async () => {
    try {
      const contributors: any[] = await postsAPI.getTopContributors();
      // Add styling
      const styledContributors = contributors.map((c, idx) => ({
        ...c,
        bg: idx === 0 ? 'bg-emerald-400/10' : idx === 1 ? 'bg-rose-400/10' : 'bg-amber-400/10',
        color: idx === 0 ? 'text-emerald-400' : idx === 1 ? 'text-rose-400' : 'text-amber-400'
      }));
      setTopContributors(styledContributors);
    } catch (error) {
      console.error('Error fetching top contributors:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-amber-500/30">
      <Header onKnowledgeDropClick={() => setIsKnowledgeDropOpen(true)} />

      {/* Modals */}
      <KnowledgeDropModal
        isOpen={isKnowledgeDropOpen}
        onClose={() => setIsKnowledgeDropOpen(false)}
        onSuccess={fetchPosts}
      />

      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => {
          setIsCommentModalOpen(false);
          setSelectedPostForComments(null);
        }}
        postId={selectedPostForComments?.id || 0}
        postTitle={selectedPostForComments?.title || ''}
        onCommentAdded={() => fetchPosts()}
      />

      <div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Sidebar - Navigation & Trending */}
          <div className="hidden lg:block lg:col-span-3 space-y-8">
            <div className="sticky top-24 space-y-8">
              {/* Navigation */}
              <div className="space-y-1">
                {[
                  { name: 'Explore', icon: Compass, id: 'explore' },
                  { name: 'Saved', icon: Bookmark, id: 'saved' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${activeTab === item.id
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </button>
                ))}
              </div>


            </div>
          </div>

          {/* Center - Feed */}
          <div className="lg:col-span-6">
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2">Community Insights</h1>
              <p className="text-gray-400">Discover the latest coding wisdom from the community</p>
            </div>

            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#111] rounded-2xl p-6 border border-gray-800">
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton className="w-10 h-10 rounded-full bg-gray-800" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32 bg-gray-800" />
                        <Skeleton className="h-3 w-24 bg-gray-800" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-3/4 mb-4 bg-gray-800" />
                    <div className="space-y-2 mb-6">
                      <Skeleton className="h-4 w-full bg-gray-800" />
                      <Skeleton className="h-4 w-full bg-gray-800" />
                      <Skeleton className="h-4 w-2/3 bg-gray-800" />
                    </div>
                    <div className="flex justify-between">
                      <div className="flex gap-6">
                        <Skeleton className="h-5 w-12 bg-gray-800" />
                        <Skeleton className="h-5 w-12 bg-gray-800" />
                      </div>
                      <Skeleton className="h-5 w-5 bg-gray-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-[#111] rounded-2xl p-10 border border-gray-800 text-center">
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code2 className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No insights yet</h3>
                <p className="text-gray-400 mb-6">Be the first to share your knowledge with the community!</p>
                <button
                  onClick={() => setIsKnowledgeDropOpen(true)}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors"
                >
                  Share Insight
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div key={post.id} className="bg-[#111] rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-colors">
                    {/* Post Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden border border-gray-700">
                          {post.username ? (
                            <Link to={`/profile/${post.username}`} className="w-full h-full block">
                              {post.avatar_url ? (
                                <img src={getAvatarSrc(post.avatar_url) || ''} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 text-gray-400 m-auto mt-2.5" />
                              )}
                            </Link>
                          ) : (
                            <>
                              {post.avatar_url ? (
                                <img src={getAvatarSrc(post.avatar_url) || ''} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 text-gray-400" />
                              )}
                            </>
                          )}
                        </div>
                        <div>
                          {post.username ? (
                            <Link to={`/profile/${post.username}`} className="font-bold text-gray-200 hover:text-amber-500 transition-colors">
                              {post.author_name}
                            </Link>
                          ) : (
                            <h3 className="font-bold text-gray-200">{post.author_name}</h3>
                          )}
                          <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </div>

                    </div>

                    {/* Post Content */}
                    <div className="mb-4">
                      <h2 className="text-lg font-bold text-white mb-2">{post.title}</h2>
                      <div className={`text-gray-300 leading-relaxed ${!expandedPosts[post.id] && shouldTruncate(post.content) ? 'line-clamp-3' : ''}`}>
                        {post.content}
                      </div>
                      {shouldTruncate(post.content) && (
                        <button
                          onClick={() => toggleExpand(post.id)}
                          className="text-amber-500 text-sm font-medium mt-2 hover:underline"
                        >
                          {expandedPosts[post.id] ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-800 my-4"></div>

                    {/* Actions */}
                    <div className="flex items-center justify-between text-gray-400">
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleLike(post.id)}
                          className="flex items-center gap-2 hover:text-pink-500 transition-colors group"
                        >
                          <Heart className="w-5 h-5 group-hover:fill-pink-500/20" />
                          <span className="text-sm font-medium">{post.like_count || 0}</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedPostForComments(post);
                            setIsCommentModalOpen(true);
                          }}
                          className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">{post.comment_count || 0}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleSave(post.id)}
                        className={`transition-colors ${post.is_saved ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'}`}
                      >
                        <Bookmark className={`w-5 h-5 ${post.is_saved ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar - Widgets */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="sticky top-24 space-y-6">

              {/* Top Contributors */}
              <div className="bg-[#111] rounded-2xl p-5 border border-gray-800">
                <div className="flex items-center gap-2 mb-6 text-amber-500">
                  <Trophy className="w-4 h-4" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Top Contributors</h3>
                </div>

                <div className="space-y-4">
                  {topContributors.slice(0, 3).map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors" onClick={() => navigate(`/profile/${user.username}`)}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ${user.bg} ${user.color}`}>
                          {user.avatar_url ? (
                            <img src={getAvatarSrc(user.avatar_url) || ''} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-gray-200">{user.name}</h4>
                          <p className="text-[10px] text-gray-500">{user.total_likes} LIKES</p>
                        </div>
                      </div>
                      <button className="text-xs font-semibold text-amber-500 hover:text-amber-400">
                        View
                      </button>
                    </div>
                  ))}
                </div>


              </div>

              <button
                onClick={() => setIsKnowledgeDropOpen(true)}
                className="w-full mt-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors shadow-lg shadow-amber-500/20"
              >
                New Insight Post
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Explore;
