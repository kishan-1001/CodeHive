import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Medal, Crown, RefreshCw, Search } from 'lucide-react';

interface LeaderboardUser {
  user_id: number;
  username: string | null;
  name: string | null;
  avatar_url: string | null;
  practice_score: number;
  arena_score: number;
  contest_score: number;
  total_score: number;
  rank: number;
}

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null); // Store current user info
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination Logic
  const [itemsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      }
    } catch (error) {
      console.error("Failed to fetch current user", error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setLeaderboard(data);
    } catch (error) {
      console.error("Failed to load leaderboard", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch('/api/leaderboard/sync', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      await fetchLeaderboard(); // Reload after sync
    } catch (error) {
      console.error("Sync failed", error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchLeaderboard();
  }, []);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/home');
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-amber-500">Loading Leaderboard...</div>;

  const filteredLeaderboard = leaderboard.filter(user =>
    (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (user.username?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLeaderboard.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeaderboard.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const topThree = leaderboard.slice(0, 3);

  return (
    <div className="relative min-h-screen bg-gray-950 text-white selection:bg-amber-500/30 font-sans">
      <Header onSignOut={handleLogout} />

      {/* Controls - Absolute Positioned to Screen Left */}
      <div className="absolute top-28 left-4 md:left-8 z-10 flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500 w-64 transition-all shadow-lg"
          />
        </div>

        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-amber-400 font-bold transition-all disabled:opacity-50 text-sm shadow-lg"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Refresh Score'}
        </button>
      </div>

      <div className="pt-24 px-8 md:px-16 pb-20 max-w-7xl mx-auto">
        {/* Header Section (Empty now) */}
        <div className="relative text-center mb-12">
        </div>

        {/* Podium Section (Top 3) - Only show if NO search query */}
        {!searchQuery && topThree.length > 0 && (
          <div className="flex flex-col md:flex-row justify-center items-end gap-6 mb-16 px-4">
            {/* 2nd Place */}
            {topThree[1] && (
              <div className="order-2 md:order-1 flex flex-col items-center">
                <div className="relative group">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-gray-400 overflow-hidden mb-4 shadow-[0_0_20px_rgba(156,163,175,0.3)]">
                    <img src={topThree[1].avatar_url || `https://ui-avatars.com/api/?name=${topThree[1].name}&background=9ca3af&color=fff`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -top-6 -right-2 transform rotate-12">
                    <Medal className="w-10 h-10 text-gray-400 drop-shadow-lg" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl text-white mb-1">{topThree[1].name || topThree[1].username}</div>
                  <div className="text-gray-400 font-mono text-lg">{topThree[1].total_score} pts</div>
                </div>
                <div className="mt-4 w-full h-32 bg-gradient-to-t from-gray-800/50 to-transparent rounded-t-2xl border-x border-t border-gray-700/50 flex items-end justify-center pb-4">
                  <span className="text-4xl font-black text-gray-600/30">#2</span>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {topThree[0] && (
              <div className="order-1 md:order-2 flex flex-col items-center z-10 -mb-4">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                  <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-amber-400 overflow-hidden mb-6 shadow-[0_0_30px_rgba(251,191,36,0.5)]">
                    <img src={topThree[0].avatar_url || `https://ui-avatars.com/api/?name=${topThree[0].name}&background=fbd38d&color=fff`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                    <Crown className="w-12 h-12 text-amber-400 drop-shadow-lg animate-bounce" />
                  </div>
                </div>
                <div className="text-center scale-110">
                  <div className="font-bold text-2xl text-amber-400 mb-1">{topThree[0].name || topThree[0].username}</div>
                  <div className="text-amber-200/80 font-mono text-xl font-bold">{topThree[0].total_score} pts</div>
                </div>
                <div className="mt-6 w-full h-40 bg-gradient-to-t from-amber-900/30 to-transparent rounded-t-2xl border-x border-t border-amber-500/30 flex items-end justify-center pb-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-amber-500/10 blur-xl"></div>
                  <span className="text-6xl font-black text-amber-500/30 relative z-10">#1</span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div className="order-3 md:order-3 flex flex-col items-center">
                <div className="relative group">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-orange-700 overflow-hidden mb-4 shadow-[0_0_20px_rgba(194,65,12,0.3)]">
                    <img src={topThree[2].avatar_url || `https://ui-avatars.com/api/?name=${topThree[2].name}&background=c2410c&color=fff`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -top-6 -left-2 transform -rotate-12">
                    <Medal className="w-10 h-10 text-orange-700 drop-shadow-lg" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl text-white mb-1">{topThree[2].name || topThree[2].username}</div>
                  <div className="text-gray-400 font-mono text-lg">{topThree[2].total_score} pts</div>
                </div>
                <div className="mt-4 w-full h-24 bg-gradient-to-t from-gray-800/50 to-transparent rounded-t-2xl border-x border-t border-gray-700/50 flex items-end justify-center pb-4">
                  <span className="text-4xl font-black text-gray-600/30">#3</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-sm">

          {/* My Rank (Sticky Top) */}
          {currentUser && leaderboard.find(u => u.user_id === currentUser.id) && (
            <div className="bg-amber-500/10 border-b border-amber-500/20">
              {(() => {
                const myRankEntry = leaderboard.find(u => u.user_id === currentUser.id);
                if (!myRankEntry) return null;
                return (
                  <div className="grid grid-cols-12 px-6 py-4 items-center bg-amber-500/5">
                    <div className="col-span-1 text-center font-mono font-bold text-lg text-amber-400">
                      #{myRankEntry.rank}
                    </div>
                    <div className="col-span-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden ring-2 ring-amber-500 transition-all">
                        <img src={myRankEntry.avatar_url || `https://ui-avatars.com/api/?name=${myRankEntry.name}&background=random`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate">{myRankEntry.name || myRankEntry.username} (You)</div>
                        <div className="text-xs text-gray-500">@{myRankEntry.username}</div>
                      </div>
                    </div>
                    <div className="col-span-2 text-center text-amber-200/70 font-mono hidden md:block">
                      {myRankEntry.practice_score}
                    </div>
                    <div className="col-span-2 text-center text-amber-200/70 font-mono hidden md:block">
                      {myRankEntry.arena_score}
                    </div>
                    <div className="col-span-2 text-right font-black text-amber-400 font-mono text-lg">
                      {myRankEntry.total_score}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Table Header */}
          <div className="grid grid-cols-12 px-6 py-4 bg-gray-900 border-b border-gray-800 text-sm font-bold text-gray-400 uppercase tracking-widest">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-5">User</div>
            <div className="col-span-2 text-center text-xs hidden md:block">Practice</div>
            <div className="col-span-2 text-center text-xs hidden md:block">Arena</div>
            <div className="col-span-2 text-right">Total Score</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-800/50">
            {currentItems.map((user) => (
              <div key={user.user_id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-gray-800/30 transition-colors group">
                <div className={`col-span-1 text-center font-mono font-bold text-lg ${user.rank <= 3 ? 'text-amber-400' : 'text-white'}`}>
                  #{user.rank}
                </div>
                <div className="col-span-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden ring-2 ring-transparent group-hover:ring-amber-500/50 transition-all">
                    <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white truncate">{user.name || user.username}</div>
                    <div className="text-xs text-gray-500">@{user.username || 'user'}</div>
                  </div>
                </div>
                <div className="col-span-2 text-center text-gray-400 font-mono hidden md:block">
                  {user.practice_score}
                </div>
                <div className="col-span-2 text-center text-gray-400 font-mono hidden md:block">
                  {user.arena_score}
                </div>
                <div className="col-span-2 text-right font-black text-amber-400 font-mono text-lg">
                  {user.total_score}
                </div>
              </div>
            ))}

            {currentItems.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                No players found.
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {filteredLeaderboard.length > itemsPerPage && (
            <div className="px-6 py-4 border-t border-gray-800 flex justify-between items-center bg-gray-900/50">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm text-gray-300 font-medium transition-colors"
              >
                Previous
              </button>
              <span className="text-gray-500 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm text-gray-300 font-medium transition-colors"
              >
                Next
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
