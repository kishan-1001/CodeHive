import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { roomAPI } from '../../services/api';
import { PlusSquare, LogIn, Users, Zap, Shield, Trophy } from 'lucide-react';
import BattleHistory from './BattleHistory';

const HiveBattlesLanding: React.FC = () => {
    const navigate = useNavigate();
    const [joinCode, setJoinCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    const handleJoin = async () => {
        if (!joinCode.trim()) {
            alert('Please enter a room code');
            return;
        }

        setIsJoining(true);
        try {
            const response = await roomAPI.joinRoom(joinCode.toUpperCase().trim());
            navigate(`/hive-battles/${response.roomId}`);
        } catch (error: any) {
            alert(error.message || 'Failed to join room. Check the code and try again.');
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-amber-500/30">
            <Header />

            <div className="pt-32 px-6 pb-20 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Hero & Actions */}
                    <div className="lg:col-span-2">
                        {/* Hero Section */}
                        <div className="text-left mb-12 relative">
                            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] -z-10"></div>
                        </div>

                        {/* Main Actions */}
                        <div className="grid md:grid-cols-2 gap-6 mb-12">
                            {/* Create Room Card */}
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl border border-gray-700 hover:border-amber-500/50 transition-all hover:transform hover:-translate-y-1 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>

                                <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6">
                                    <PlusSquare className="w-7 h-7 text-amber-400" />
                                </div>
                                <h2 className="text-2xl font-bold mb-3">Create Room</h2>
                                <p className="text-gray-400 mb-8 text-sm">
                                    Host a new battle. Customize topics, difficulty, and time limits. Be the game master.
                                </p>
                                <button
                                    onClick={() => navigate('/hive-battles/create')}
                                    className="w-full py-4 rounded-xl bg-amber-400 text-gray-900 font-bold hover:bg-amber-300 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Zap className="w-5 h-5 fill-current" />
                                    Create New Battle
                                </button>
                            </div>

                            {/* Join Room Card */}
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl border border-gray-700 hover:border-blue-500/50 transition-all hover:transform hover:-translate-y-1 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>

                                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
                                    <LogIn className="w-7 h-7 text-blue-400" />
                                </div>
                                <h2 className="text-2xl font-bold mb-3">Join Room</h2>
                                <p className="text-gray-400 mb-8 text-sm">
                                    Have a code? Enter it below to join an existing lobby and prepare for battle.
                                </p>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="CODE"
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                        className="flex-1 min-w-0 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-center tracking-widest font-mono text-lg focus:border-blue-400 outline-none transition-colors"
                                    />
                                    <button
                                        onClick={handleJoin}
                                        disabled={isJoining || !joinCode}
                                        className="flex-shrink-0 px-6 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Join
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="grid md:grid-cols-3 gap-6 text-center">
                            <div className="p-4 bg-gray-800/30 rounded-2xl border border-gray-800">
                                <Shield className="w-8 h-8 text-green-400 mx-auto mb-3" />
                                <h3 className="text-base font-bold mb-1">Private Lobbies</h3>
                                <p className="text-gray-500 text-xs">Play with friends in a focused environment.</p>
                            </div>
                            <div className="p-4 bg-gray-800/30 rounded-2xl border border-gray-800">
                                <Users className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                                <h3 className="text-base font-bold mb-1">Real-time Sync</h3>
                                <p className="text-gray-500 text-xs">Leaderboard updates live as players submit.</p>
                            </div>
                            <div className="p-4 bg-gray-800/30 rounded-2xl border border-gray-800">
                                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                                <h3 className="text-base font-bold mb-1">Live Scoring</h3>
                                <p className="text-gray-500 text-xs">Points for difficulty + speed.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Battle History */}
                    <div className="lg:col-span-1">
                        <BattleHistory />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HiveBattlesLanding;
