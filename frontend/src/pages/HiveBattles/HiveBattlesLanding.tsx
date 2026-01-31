import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { roomAPI } from '../../services/api';
import { PlusSquare, LogIn, Users, Zap, Shield, Trophy, AlertTriangle } from 'lucide-react';
import BattleHistory from './BattleHistory';
import Modal from '../../components/Modal';

const HiveBattlesLanding: React.FC = () => {
    const navigate = useNavigate();
    const [joinCode, setJoinCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

    // Auto-fill code from URL query param
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code) {
            setJoinCode(code.toUpperCase());
        }
    }, []);

    const handleJoin = async () => {
        if (!joinCode.trim()) {
            setErrorModal({ isOpen: true, message: 'Please enter a room code' });
            return;
        }

        setIsJoining(true);
        try {
            const response = await roomAPI.joinRoom(joinCode.toUpperCase().trim());
            navigate(`/hive-battles/${response.roomId}`);
        } catch (error: any) {
            // Extract plain message if possible
            const msg = error.message || 'Failed to join room. Check the code and try again.';
            setErrorModal({ isOpen: true, message: msg });
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020202] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900/40 via-[#020202] to-[#020202] text-white font-sans selection:bg-amber-500/30">
            <Header />

            <div className="pt-32 px-6 pb-20 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* ... (Existing Layout) ... */}
                    <div className="lg:col-span-2">
                        {/* Hero Section */}
                        <div className="text-left mb-12 relative">
                            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] -z-10"></div>
                        </div>

                        {/* Main Actions */}
                        <div className="grid md:grid-cols-2 gap-6 mb-12">
                            {/* Create Room Card */}
                            <div className="bg-[#0a0a0a] rounded-xl border border-gray-800 hover:border-amber-500/30 transition-all hover:transform hover:-translate-y-1 group relative overflow-hidden shadow-2xl shadow-black/50">
                                {/* Window Bar */}
                                <div className="h-9 bg-white/5 border-b border-white/5 px-4 flex items-center justify-between select-none">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 group-hover:bg-red-500/80 transition-colors" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 group-hover:bg-yellow-500/80 transition-colors" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/20 group-hover:bg-green-500/80 transition-colors" />
                                    </div>
                                    <div className="text-[10px] font-mono text-gray-600 group-hover:text-gray-500 transition-colors">
                                        create_battle.sh
                                    </div>
                                </div>

                                <div className="p-8 relative">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all pointer-events-none"></div>

                                    <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                        <PlusSquare className="w-7 h-7 text-amber-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-3 font-mono text-gray-200">Create Room</h2>
                                    <p className="text-gray-500 mb-8 text-sm leading-relaxed font-mono">
                                        <span className="text-amber-500/50 mr-2">$</span>
                                        Host a new battle. Customize topics, difficulty, and time limits.
                                    </p>
                                    <button
                                        onClick={() => navigate('/hive-battles/create')}
                                        className="w-full py-4 rounded-lg bg-amber-500/10 border border-amber-500/50 text-amber-500 font-bold hover:bg-amber-500 hover:text-gray-900 transition-all flex items-center justify-center gap-2 font-mono"
                                    >
                                        <Zap className="w-4 h-4 fill-current" />
                                        ./init_battle
                                    </button>
                                </div>
                            </div>

                            {/* Join Room Card */}
                            <div className="bg-[#0a0a0a] rounded-xl border border-gray-800 hover:border-blue-500/30 transition-all hover:transform hover:-translate-y-1 group relative overflow-hidden shadow-2xl shadow-black/50">
                                {/* Window Bar */}
                                <div className="h-9 bg-white/5 border-b border-white/5 px-4 flex items-center justify-between select-none">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 group-hover:bg-red-500/80 transition-colors" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 group-hover:bg-yellow-500/80 transition-colors" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/20 group-hover:bg-green-500/80 transition-colors" />
                                    </div>
                                    <div className="text-[10px] font-mono text-gray-600 group-hover:text-gray-500 transition-colors">
                                        join_lobby.sh
                                    </div>
                                </div>

                                <div className="p-8 relative">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all pointer-events-none"></div>

                                    <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                        <LogIn className="w-7 h-7 text-blue-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-3 font-mono text-gray-200">Join Room</h2>
                                    <p className="text-gray-500 mb-8 text-sm leading-relaxed font-mono">
                                        <span className="text-blue-500/50 mr-2">$</span>
                                        Enter a room code to join an existing lobby.
                                    </p>

                                    <div className="flex gap-2 relative z-10">
                                        <input
                                            type="text"
                                            placeholder="ENTER_CODE"
                                            value={joinCode}
                                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                            className="flex-1 min-w-0 bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-center tracking-widest font-mono text-lg text-gray-300 focus:border-blue-500/50 focus:bg-gray-900 outline-none transition-all placeholder:text-gray-700"
                                        />
                                        <button
                                            onClick={handleJoin}
                                            disabled={isJoining || !joinCode}
                                            className="flex-shrink-0 px-6 rounded-lg bg-blue-500/10 border border-blue-500/50 text-blue-500 font-bold hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                                        >
                                            ./join
                                        </button>
                                    </div>
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

            <Modal
                isOpen={errorModal.isOpen}
                onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
                title="Unable to Join"
            >
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                        <p className="text-gray-300 text-lg mb-2">{errorModal.message}</p>
                        <p className="text-gray-500 text-sm">
                            Please check the room code or try creating a new room.
                        </p>
                    </div>
                    <button
                        onClick={() => setErrorModal({ ...errorModal, isOpen: false })}
                        className="mt-2 text-gray-400 hover:text-white underline text-sm"
                    >
                        Dismiss
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default HiveBattlesLanding;
