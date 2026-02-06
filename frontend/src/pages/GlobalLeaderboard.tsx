import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, RefreshCw, Layout, Award } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { api } from '../services/api';
import Header from '../components/Header';

interface PlatformDetail {
    platform: string | null;
    score: number;
}

interface LeaderboardUser {
    user_id: number;
    universal_score: number;
    rank: number;
    name: string;
    username: string;
    email: string;
    avatar_url: string | null;
    platform_details: PlatformDetail[];
}

const GlobalLeaderboard = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [myRank, setMyRank] = useState<LeaderboardUser | null>(null); // State for pinned user
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    // Pagination & Search
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [searchDebounce, setSearchDebounce] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchDebounce(search);
            setPage(1); // Reset to page 1 on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchLeaderboard();
    }, [page, searchDebounce]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '15',
                search: searchDebounce
            });
            const response = await api.get(`/leaderboard/global?${params.toString()}`);

            // Handle new response structure { data, meta }
            if (response.data && Array.isArray(response.data)) {
                setUsers(response.data);
                setTotalPages(response.meta.totalPages || 1);
            } else if (Array.isArray(response)) {
                // Fallback for old API if cached or racing
                setUsers(response);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyRank = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await api.get('/leaderboard/global/my-rank');
            // API returns the user object directly with rank
            if (response && response.rank) {
                setMyRank(response);
            }
        } catch (error) {
            console.error('Failed to fetch my rank', error);
        }
    };

    useEffect(() => {
        fetchMyRank();
    }, [syncing]); // Refetch when syncing completes

    const syncScore = async () => {
        setSyncing(true);
        try {
            await api.post('/leaderboard/global/sync', {});
            await fetchLeaderboard();
        } catch (error) {
            console.log('Failed to sync score');
        } finally {
            setSyncing(false);
        }
    };



    const getAvatarSrc = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `/api${path}`;
    };

    const getPlatformIcon = (platform: string | null) => {
        if (!platform) return <span className="text-gray-600">-</span>;
        switch (platform.toLowerCase()) {
            case 'leetcode': return <span className="text-yellow-500 font-bold">LC</span>;
            case 'codeforces': return <span className="text-blue-500 font-bold">CF</span>;
            case 'codechef': return <span className="text-orange-500 font-bold">CC</span>;
            case 'geeksforgeeks': return <span className="text-green-500 font-bold">GfG</span>;
            case 'hackerrank': return <span className="text-emerald-500 font-bold">HR</span>;
            default: return <span className="text-gray-400 font-bold">{platform.substring(0, 2)}</span>;
        }
    };

    return (
        <div className="relative min-h-screen bg-gray-950 text-white selection:bg-amber-500/30 font-sans">
            <Header />

            <div className="min-h-screen p-8 pt-24">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                        <div>
                            <h1 className="text-4xl font-bold flex items-center gap-3">
                                <Layout className="w-10 h-10 text-amber-500" />
                                Global Leaderboard
                            </h1>
                            <p className="text-gray-400 mt-2 text-lg">
                                Compare your Universal Score across all coding platforms.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            {/* Search Bar */}
                            <div className="relative flex-1 md:w-64">
                                <input
                                    type="text"
                                    placeholder="Search user..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-800 rounded-lg py-3 px-4 pl-10 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                />
                                <div className="absolute left-3 top-3.5 text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            <button
                                onClick={syncScore}
                                disabled={syncing}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${syncing
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    : 'bg-amber-500 hover:bg-amber-600 text-black shadow-lg hover:shadow-amber-500/20'
                                    }`}
                            >
                                <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                                {syncing ? 'Syncing...' : 'Refresh Score'}
                            </button>
                        </div>
                    </div>

                    {/* Leaderboard Table (Converted to Grid) */}
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl mb-8">

                        {/* My Rank (Sticky Top) - Just like Leaderboard.tsx */}
                        {myRank && (
                            <div className="bg-amber-500/10 border-b border-amber-500/20">
                                <div className="grid grid-cols-1 md:grid-cols-12 px-6 py-4 items-center bg-amber-500/5 gap-4 md:gap-0">
                                    <div className="col-span-2 md:col-span-1 text-center font-bold text-lg bg-amber-500 text-black w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mx-auto md:mx-0 shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                                        #{myRank.rank}
                                    </div>
                                    <div className="col-span-7 md:col-span-4 flex items-center justify-start gap-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-amber-500/50 overflow-hidden shrink-0">
                                            {myRank.avatar_url ? (
                                                <img src={getAvatarSrc(myRank.avatar_url) || ''} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                                                    {myRank.name ? myRank.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 text-left">
                                            <div className="font-bold text-white flex items-center gap-2 justify-start">
                                                {myRank.name || "You"}
                                                <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded-full font-bold">YOU</span>
                                            </div>
                                            <div className="text-xs text-amber-500/70">@{myRank.username || myRank.email?.split('@')[0] || 'user'}</div>
                                        </div>
                                    </div>
                                    <div className="col-span-3 md:col-span-2 text-right font-black text-amber-400 text-xl md:text-2xl">
                                        {Number(myRank.universal_score).toFixed(0)}
                                    </div>
                                    <div className="col-span-12 md:col-span-5 hidden md:flex justify-end flex-wrap gap-2">
                                        {myRank.platform_details && myRank.platform_details.map((api, idx) => (
                                            <div key={idx} className="flex items-center gap-1.5 bg-gray-900/80 px-2.5 py-1 rounded-full border border-gray-700/50 text-xs">
                                                {getPlatformIcon(api.platform)}
                                                <span className="text-gray-300">{Number(api.score).toFixed(0)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Table Header */}
                        <div className="grid grid-cols-12 px-6 py-4 bg-gray-800/50 border-b border-gray-800 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                            <div className="col-span-2 md:col-span-1 text-left">Rank</div>
                            <div className="col-span-7 md:col-span-4 text-left">User</div>
                            <div className="col-span-3 md:col-span-2 text-right">Universal Score</div>
                            <div className="col-span-5 text-center hidden md:block">Breakdown</div>
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-gray-800">
                            {loading ? (
                                [...Array(8)].map((_, i) => (
                                    <div key={i} className="grid grid-cols-12 px-6 py-6 items-center gap-4 md:gap-0 border-b border-gray-800 last:border-0 relative overflow-hidden">
                                        <div className="col-span-2 md:col-span-1 flex justify-start">
                                            <Skeleton className="h-8 w-8 rounded-full bg-gray-800" />
                                        </div>
                                        <div className="col-span-7 md:col-span-4 flex items-center gap-4 justify-start">
                                            <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gray-800" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-32 bg-gray-800" />
                                                <Skeleton className="h-3 w-20 bg-gray-800" />
                                            </div>
                                        </div>
                                        <div className="col-span-3 md:col-span-2 flex justify-end">
                                            <Skeleton className="h-8 w-24 bg-gray-800" />
                                        </div>
                                        <div className="col-span-5 hidden md:flex justify-end gap-2">
                                            <Skeleton className="h-6 w-16 rounded-full bg-gray-800" />
                                            <Skeleton className="h-6 w-16 rounded-full bg-gray-800" />
                                            <Skeleton className="h-6 w-16 rounded-full bg-gray-800" />
                                        </div>
                                    </div>
                                ))
                            ) : users.length === 0 ? (
                                <div className="p-16 text-center text-gray-500">
                                    <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                    <p className="text-xl">No users found.</p>
                                </div>
                            ) : (
                                users.map((user) => (
                                    <div
                                        key={user.user_id}
                                        className="grid grid-cols-12 px-6 py-6 items-center hover:bg-gray-800/30 transition-colors group gap-4 md:gap-0"
                                    >
                                        <div className="col-span-2 md:col-span-1 flex items-center justify-start">
                                            <div className={`
                                                flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full font-bold text-lg
                                                ${user.rank === 1 && !searchDebounce ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                    user.rank === 2 && !searchDebounce ? 'bg-gray-300/10 text-gray-300 border border-gray-300/20' :
                                                        user.rank === 3 && !searchDebounce ? 'bg-amber-700/10 text-amber-700 border border-amber-700/20' :
                                                            'text-gray-500'
                                                }
                                            `}>
                                                {(!searchDebounce && user.rank <= 3) ? <Award className="w-5 h-5" /> : `#${user.rank}`}
                                            </div>
                                        </div>

                                        <div
                                            className="col-span-7 md:col-span-4 flex items-center justify-start gap-4 cursor-pointer"
                                            onClick={() => navigate(`/profile/${user.username}`)}
                                        >
                                            {user.avatar_url ? (
                                                <img className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-gray-800 group-hover:border-gray-700 object-cover shrink-0" src={getAvatarSrc(user.avatar_url) || ''} alt="" />
                                            ) : (
                                                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center border-2 border-gray-800 group-hover:border-gray-700 text-lg font-bold shrink-0">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                            )}
                                            <div className="min-w-0 text-left">
                                                <div className="text-lg font-medium text-white group-hover:text-amber-400 transition-colors">
                                                    {user.name || user.username}
                                                </div>
                                                <div className="text-xs text-gray-500">@{user.username || user.email?.split('@')[0] || 'user'}</div>
                                            </div>
                                        </div>

                                        <div className="col-span-3 md:col-span-2 text-right">
                                            <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-600">
                                                {Number(user.universal_score).toFixed(0)}
                                            </span>
                                        </div>

                                        <div className="col-span-12 md:col-span-5 hidden md:flex justify-end flex-wrap gap-2">
                                            {user.platform_details && user.platform_details.map((api, idx) => (
                                                <div key={idx} className="flex items-center gap-1.5 bg-gray-800 px-2.5 py-1 rounded-full border border-gray-700 text-xs">
                                                    {getPlatformIcon(api.platform)}
                                                    <span className="text-gray-300">{Number(api.score).toFixed(0)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    {!loading && totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 pb-10">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`px-4 py-2 rounded-lg border border-gray-700 transition-colors ${page === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                Previous
                            </button>
                            <span className="text-gray-400 font-medium">
                                Page <span className="text-amber-500">{page}</span> of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className={`px-4 py-2 rounded-lg border border-gray-700 transition-colors ${page === totalPages ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
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

export default GlobalLeaderboard;
