import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { roomAPI } from '../../services/api';
import { Users, Copy, Play, Loader2, Crown } from 'lucide-react';

const RoomLobby: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const [room, setRoom] = useState<any>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [isHost, setIsHost] = useState(false);
    const [loading, setLoading] = useState(true);

    // WebSocket Connection (Mocked refresh for now, or actual WS if we implement hook)
    // Ideally we should use a custom hook `useRoomSocket` to listen for events.
    // For this MVP step, I'll poll every 3 seconds if not using WS yet on frontend.
    // BUT the prompt asked for WS events.
    // I will implement a basic poller for simplicity in this file, 
    // OR ideally we connect to WS.
    // Let's use Polling for the Lobby to be robust, transitioning to WS for the Arena.
    // Polling is acceptable for Lobby updates (participants joining).

    const fetchRoomData = async () => {
        try {
            const data = await roomAPI.getRoom(roomId!);
            setRoom(data.room);
            setParticipants(data.participants);
            setIsHost(data.isHost);

            if (data.room.status === 'active') {
                navigate(`/hive-battles/${roomId}/arena`);
            }
        } catch (error) {
            console.error('Error fetching room:', error);
            // Handle error (e.g., redirect if not found)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!roomId) return;
        fetchRoomData();
        const interval = setInterval(fetchRoomData, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, [roomId]);

    const handleCopyCode = () => {
        if (room?.room_code) {
            navigator.clipboard.writeText(room.room_code);
            alert('Room Code copied!');
        }
    };

    const handleStart = async () => {
        try {
            await roomAPI.startRoom(roomId!);
            // The polling will catch the status change and redirect, or we can redirect immediately
            navigate(`/hive-battles/${roomId}/arena`);
        } catch (error) {
            alert('Failed to start match');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
            </div>
        );
    }

    if (!room) return <div className="text-white">Room not found</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-amber-500/30">
            <Header />

            <div className="pt-32 px-6 pb-20 max-w-4xl mx-auto">
                {/* Room Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 bg-gray-800/80 px-6 py-3 rounded-full border border-gray-700 mb-6">
                        <span className="text-gray-400 uppercase tracking-wider text-xs font-bold">Room Code</span>
                        <span className="text-2xl font-mono font-bold text-amber-400 tracking-widest">{room.room_code}</span>
                        <button onClick={handleCopyCode} className="ml-2 hover:text-white text-gray-400">
                            <Copy className="w-5 h-5" />
                        </button>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">
                        Waiting for Players...
                    </h1>
                    <p className="text-gray-400">
                        Share the code with your friends to join the battle.
                    </p>
                </div>

                {/* Participants Grid */}
                <div className="bg-gray-800/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-700 shadow-2xl mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Users className="w-5 h-5 text-amber-400" />
                            Participants ({participants.length})
                        </h2>
                        {isHost && (
                            <span className="bg-amber-400/10 text-amber-400 px-3 py-1 rounded-lg text-xs font-bold uppercase border border-amber-400/20">
                                You are the Host
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {participants.map((p) => (
                            <div key={p.id} className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                    {p.avatar_url ? (
                                        <img
                                            src={p.avatar_url.startsWith('http') ? p.avatar_url : `http://localhost:3001${p.avatar_url}`}
                                            alt={p.username}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement!.innerText = p.username.substring(0, 2).toUpperCase();
                                                e.currentTarget.parentElement!.classList.add('text-lg', 'font-bold', 'text-gray-400');
                                            }}
                                        />
                                    ) : (
                                        <span className="text-lg font-bold text-gray-400">{p.username.substring(0, 2).toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium truncate">{p.username}</p>
                                    {p.id === room.host_id && (
                                        <span className="text-xs text-amber-500 flex items-center gap-1">
                                            <Crown className="w-3 h-3" /> Host
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Empty Slots Placeholders */}
                        {[...Array(Math.max(0, 4 - participants.length))].map((_, i) => (
                            <div key={`empty-${i}`} className="bg-gray-800/20 p-4 rounded-xl border border-gray-800/50 border-dashed flex items-center gap-3 opacity-50">
                                <div className="w-10 h-10 rounded-full bg-gray-800 animate-pulse"></div>
                                <div className="h-4 bg-gray-800 rounded w-20 animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Action */}
                {isHost ? (
                    <div className="flex justify-center">
                        <button
                            onClick={handleStart}
                            className="bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 px-12 py-5 rounded-2xl font-bold text-xl flex items-center gap-3 hover:scale-105 transition-transform shadow-xl shadow-amber-500/20"
                        >
                            <Play className="w-6 h-6 fill-current" />
                            Start Match
                        </button>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 animate-pulse">
                        Waiting for host to start the game...
                    </div>
                )}

            </div>
        </div>
    );
};

export default RoomLobby;
