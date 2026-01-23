import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, RefreshCw, Layout, Award } from 'lucide-react';
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

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/home');
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
            <Header onSignOut={handleLogout} />

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

                    {/* Leaderboard Table */}
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl mb-8">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-800/50">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">Rank</th>
                                        <th className="px-8 py-5 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">User</th>
                                        <th className="px-8 py-5 text-right text-sm font-semibold text-gray-400 uppercase tracking-wider">Universal Score</th>
                                        <th className="px-8 py-5 text-center text-sm font-semibold text-gray-400 uppercase tracking-wider">Breakdown</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {/* Pinned User Row (Sticky Top) */}
                                    {myRank && (
                                        <tr className="bg-amber-500/10 border-b border-amber-500/20 relative">
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg bg-amber-500 text-black border border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                                                    #{myRank.rank}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {myRank.avatar_url ? (
                                                        <img className="h-12 w-12 rounded-full border-2 border-amber-500/50" src={myRank.avatar_url} alt="" />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center border-2 border-amber-500/50 text-lg font-bold">
                                                            {myRank.name ? myRank.name.charAt(0).toUpperCase() : 'U'}
                                                        </div>
                                                    )}
                                                    <div className="ml-4">
                                                        <div className="text-lg font-bold text-white flex items-center gap-2">
                                                            {myRank.name || "You"}
                                                            <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded-full font-bold">YOU</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right whitespace-nowrap">
                                                <span className="text-2xl font-black text-amber-400">
                                                    {Number(myRank.universal_score).toFixed(0)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="flex justify-center flex-wrap gap-3">
                                                    {myRank.platform_details && myRank.platform_details.map((api, idx) => (
                                                        <div key={idx} className="flex items-center gap-1.5 bg-gray-900/80 px-2.5 py-1 rounded-full border border-gray-700/50 text-xs">
                                                            {getPlatformIcon(api.platform)}
                                                            <span className="text-gray-300">{Number(api.score).toFixed(0)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                    {/* Spacer/Divider if pinned user exists */}\
                                    {/* {myRank && <tr className="h-4 bg-gray-900/50 border-b border-gray-800"></tr>} */}
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="px-8 py-6"><div className="h-6 w-8 bg-gray-800 rounded"></div></td>
                                                <td className="px-8 py-6"><div className="h-10 w-48 bg-gray-800 rounded"></div></td>
                                                <td className="px-8 py-6"><div className="h-6 w-24 bg-gray-800 rounded ml-auto"></div></td>
                                                <td className="px-8 py-6"><div className="h-8 w-32 bg-gray-800 rounded mx-auto"></div></td>
                                            </tr>
                                        ))
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-16 text-center text-gray-500">
                                                <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                                <p className="text-xl">No users found.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr
                                                key={user.user_id}
                                                className="group hover:bg-gray-800/30 transition-colors"
                                            >
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className={`
                            flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg
                            ${user.rank === 1 && !searchDebounce ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                            user.rank === 2 && !searchDebounce ? 'bg-gray-300/10 text-gray-300 border border-gray-300/20' :
                                                                user.rank === 3 && !searchDebounce ? 'bg-amber-700/10 text-amber-700 border border-amber-700/20' :
                                                                    'text-gray-500'
                                                        }
                          `}>
                                                        {(!searchDebounce && user.rank <= 3) ? <Award className="w-5 h-5" /> : `#${user.rank}`}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {user.avatar_url ? (
                                                            <img className="h-12 w-12 rounded-full border-2 border-gray-800 group-hover:border-gray-700" src={user.avatar_url} alt="" />
                                                        ) : (
                                                            <div className="h-12 w-12 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center border-2 border-gray-800 group-hover:border-gray-700 text-lg font-bold">
                                                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                            </div>
                                                        )}
                                                        <div className="ml-4">
                                                            <div className="text-lg font-medium text-white group-hover:text-amber-400 transition-colors">
                                                                {user.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right whitespace-nowrap">
                                                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-600">
                                                        {Number(user.universal_score).toFixed(0)}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex justify-center flex-wrap gap-3">
                                                        {user.platform_details && user.platform_details.map((api, idx) => (
                                                            <div key={idx} className="flex items-center gap-1.5 bg-gray-800 px-2.5 py-1 rounded-full border border-gray-700 text-xs">
                                                                {getPlatformIcon(api.platform)}
                                                                <span className="text-gray-300">{Number(api.score).toFixed(0)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
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
