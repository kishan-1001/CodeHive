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
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const response = await api.get('/leaderboard/global');
            if (Array.isArray(response)) {
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
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="text-4xl font-bold flex items-center gap-3">
                                <Layout className="w-10 h-10 text-amber-500" />
                                Global Leaderboard
                            </h1>
                            <p className="text-gray-400 mt-2 text-lg">
                                Compare your Universal Score across all coding platforms.
                            </p>
                        </div>

                        <button
                            onClick={syncScore}
                            disabled={syncing}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${syncing
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-amber-500 hover:bg-amber-600 text-black shadow-lg hover:shadow-amber-500/20'
                                }`}
                        >
                            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                            {syncing ? 'Syncing...' : 'Refresh My Score'}
                        </button>
                    </div>

                    {/* Leaderboard Table */}
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
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
                                                <p className="text-xl">No global stats yet.</p>
                                                <p className="text-sm mt-2">Connect your platforms and sync to appear here!</p>
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
                            ${user.rank === 1 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                            user.rank === 2 ? 'bg-gray-300/10 text-gray-300 border border-gray-300/20' :
                                                                user.rank === 3 ? 'bg-amber-700/10 text-amber-700 border border-amber-700/20' :
                                                                    'text-gray-500'
                                                        }
                          `}>
                                                        {user.rank <= 3 ? <Award className="w-5 h-5" /> : `#${user.rank}`}
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
                </div>
            </div>
        </div>
    );
};

export default GlobalLeaderboard;
