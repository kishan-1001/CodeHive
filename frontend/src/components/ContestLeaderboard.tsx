import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Medal, Crown } from 'lucide-react';
import { api } from '../services/api';

interface LeaderboardUser {
    rank: number;
    user_id: number;
    username: string;
    name: string;
    avatar_url: string;
    total_score: number;
    last_submission_time: string;
}

interface ContestLeaderboardProps {
    contestId: string;
}

const ContestLeaderboard: React.FC<ContestLeaderboardProps> = ({ contestId }) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    const getAvatarSrc = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        if (path.startsWith('/api')) return path;
        return `/api${path.startsWith('/') ? path : `/${path}`}`;
    };

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await api.get(`/contests/${contestId}/leaderboard`);
                if (Array.isArray(data)) {
                    setLeaderboard(data);
                }
            } catch (err) {
                console.error("Failed to fetch contest leaderboard", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [contestId]);

    const topThree = leaderboard.slice(0, 3);

    return (
        <div className="space-y-8">
            {/* Top 3 Podium */}
            {topThree.length > 0 && (
                <div className="flex flex-col md:flex-row justify-center items-end gap-6 mb-12 px-4">
                    {/* 2nd Place */}
                    {topThree[1] && (
                        <div className="order-2 md:order-1 flex flex-col items-center">
                            <div className="relative group">
                                <div className="w-20 h-20 rounded-full border-4 border-gray-400 overflow-hidden mb-4 shadow-[0_0_20px_rgba(156,163,175,0.3)]">
                                    <img
                                        src={getAvatarSrc(topThree[1].avatar_url) || `https://ui-avatars.com/api/?name=${topThree[1].name}&background=9ca3af&color=fff&size=256`}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -top-4 -right-2 transform rotate-12">
                                    <Medal className="w-8 h-8 text-gray-400 drop-shadow-lg" />
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-white mb-1">{topThree[1].name || "Unknown"}</div>
                                <div className="text-gray-400 font-mono text-sm">{topThree[1].total_score} pts</div>
                            </div>
                            <div className="mt-4 w-full h-24 bg-gradient-to-t from-gray-800/50 to-transparent rounded-t-2xl border-x border-t border-gray-700/50 flex items-end justify-center pb-4">
                                <span className="text-3xl font-black text-gray-600/30">#2</span>
                            </div>
                        </div>
                    )}

                    {/* 1st Place */}
                    {topThree[0] && (
                        <div className="order-1 md:order-2 flex flex-col items-center z-10 -mb-4">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                                <div className="relative w-24 h-24 rounded-full border-4 border-amber-400 overflow-hidden mb-6 shadow-[0_0_30px_rgba(251,191,36,0.5)]">
                                    <img
                                        src={getAvatarSrc(topThree[0].avatar_url) || `https://ui-avatars.com/api/?name=${topThree[0].name}&background=fbd38d&color=fff&size=256`}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                                    <Crown className="w-10 h-10 text-amber-400 drop-shadow-lg animate-bounce" />
                                </div>
                            </div>
                            <div className="text-center scale-110">
                                <div className="font-bold text-lg text-amber-400 mb-1">{topThree[0].name || "Unknown"}</div>
                                <div className="text-amber-200/80 font-mono text-lg font-bold">{topThree[0].total_score} pts</div>
                            </div>
                            <div className="mt-6 w-full h-32 bg-gradient-to-t from-amber-900/30 to-transparent rounded-t-2xl border-x border-t border-amber-500/30 flex items-end justify-center pb-6 relative overflow-hidden">
                                <div className="absolute inset-0 bg-amber-500/10 blur-xl"></div>
                                <span className="text-5xl font-black text-amber-500/30 relative z-10">#1</span>
                            </div>
                        </div>
                    )}

                    {/* 3rd Place */}
                    {topThree[2] && (
                        <div className="order-3 md:order-3 flex flex-col items-center">
                            <div className="relative group">
                                <div className="w-20 h-20 rounded-full border-4 border-orange-700 overflow-hidden mb-4 shadow-[0_0_20px_rgba(194,65,12,0.3)]">
                                    <img
                                        src={getAvatarSrc(topThree[2].avatar_url) || `https://ui-avatars.com/api/?name=${topThree[2].name}&background=c2410c&color=fff&size=256`}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -top-4 -left-2 transform -rotate-12">
                                    <Medal className="w-8 h-8 text-orange-700 drop-shadow-lg" />
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-white mb-1">{topThree[2].name || "Unknown"}</div>
                                <div className="text-gray-400 font-mono text-sm">{topThree[2].total_score} pts</div>
                            </div>
                            <div className="mt-4 w-full h-20 bg-gradient-to-t from-gray-800/50 to-transparent rounded-t-2xl border-x border-t border-gray-700/50 flex items-end justify-center pb-4">
                                <span className="text-3xl font-black text-gray-600/30">#3</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="grid grid-cols-12 px-6 py-4 bg-gray-900 border-b border-gray-800 text-sm font-bold text-gray-400 uppercase tracking-widest">
                    <div className="col-span-1 text-center">Rank</div>
                    <div className="col-span-7">User</div>
                    <div className="col-span-4 text-right">Points</div>
                </div>

                <div className="divide-y divide-gray-800/50">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading leaderboard...</div>
                    ) : leaderboard.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-700" />
                            <p>No participants found for this contest.</p>
                        </div>
                    ) : (
                        leaderboard.map((user) => (
                            <div key={user.user_id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-gray-800/30 transition-colors">
                                <div className={`col-span-1 text-center font-mono font-bold text-lg ${user.rank <= 3 ? 'text-amber-400' : 'text-gray-500'}`}>
                                    #{user.rank}
                                </div>
                                <div className="col-span-7 flex items-center gap-4">
                                    <Link to={`/profile/${user.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                        <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden">
                                            <img
                                                src={getAvatarSrc(user.avatar_url) || `https://ui-avatars.com/api/?name=${user.name || user.username}&background=random`}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{user.name || user.username}</div>
                                            <div className="text-xs text-gray-500">@{user.username}</div>
                                        </div>
                                    </Link>
                                </div>
                                <div className="col-span-4 text-right font-mono font-bold text-amber-400 text-lg">
                                    {user.total_score}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContestLeaderboard;
