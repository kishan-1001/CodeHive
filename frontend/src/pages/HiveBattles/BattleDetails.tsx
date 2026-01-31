import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomAPI } from '../../services/api';
import Header from '../../components/Header';
import { Clock, Trophy, Users, AlertTriangle, ArrowLeft, Code } from 'lucide-react';

interface Participant {
    id: number;
    username: string;
    avatar_url?: string;
    score: number;
    time_taken: number;
}

interface Problem {
    id: number;
    title: string;
    difficulty: string;
    order_index: number;
}

interface RoomDetails {
    room: {
        id: number;
        room_code: string;
        created_at: string;
        host_name: string;
    };
    participants: Participant[];
    problems: Problem[];
}

const BattleDetails: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const [details, setDetails] = useState<RoomDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                if (!roomId) return;
                const data = await roomAPI.getRoom(roomId);
                setDetails(data);
            } catch (err: any) {
                setError('Failed to load battle details');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [roomId]);

    if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading details...</div>;

    if (error || !details) return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Error Loading Battle</h2>
            <p className="text-gray-400 mb-6">{error || 'Battle not found'}</p>
            <button onClick={() => navigate('/hive-battles')} className="text-amber-400 hover:text-amber-300">
                &larr; Back to HiveBattles
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-amber-500/30">
            <Header />

            <div className="pt-32 px-6 pb-20 max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/hive-battles')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Lobby
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                                <Trophy className="w-8 h-8 text-amber-500" />
                                Battle Report
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span className="font-mono bg-gray-800 px-2 py-1 rounded">#{details.room.room_code}</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {new Date(details.room.created_at).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    Hosted by {details.room.host_name}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">

                    {/* Leaderboard Section */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-gray-800/50 border border-gray-700 rounded-3xl overflow-hidden">
                            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                                <h2 className="text-xl font-bold">Leaderboard</h2>
                                <span className="bg-amber-500/10 text-amber-500 text-xs px-3 py-1 rounded-full border border-amber-500/20">
                                    {details.participants.length} Participants
                                </span>
                            </div>

                            <div className="divide-y divide-gray-700/50">
                                {details.participants.map((participant, index) => (
                                    <div key={participant.id} className="p-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`
                                                w-8 h-8 flex items-center justify-center rounded-lg font-bold
                                                ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                                    index === 1 ? 'bg-gray-400/20 text-gray-400' :
                                                        index === 2 ? 'bg-orange-500/20 text-orange-500' :
                                                            'bg-gray-800 text-gray-500'}
                                            `}>
                                                {index + 1}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                                                    {participant.avatar_url ? (
                                                        <img src={participant.avatar_url} alt={participant.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                                            {participant.username.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => navigate(`/profile/${participant.username}`)}
                                                    className="font-medium hover:text-blue-400 hover:underline text-left"
                                                >
                                                    {participant.username}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-lg font-bold text-amber-400">{participant.score} pts</div>
                                            <div className="text-xs text-gray-500">{participant.time_taken}s</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Problems Section */}
                    <div className="md:col-span-1">
                        <div className="bg-gray-800/50 border border-gray-700 rounded-3xl overflow-hidden sticky top-32">
                            <div className="p-6 border-b border-gray-700">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Code className="w-5 h-5 text-blue-400" />
                                    Problems
                                </h2>
                            </div>

                            <div className="p-4 space-y-3">
                                {details.problems.map((problem) => (
                                    <div key={problem.id} className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                                        <h3 className="font-medium mb-2">{problem.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`
                                                text-[10px] px-2 py-0.5 rounded border
                                                ${problem.difficulty === 'Easy' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                                                    problem.difficulty === 'Medium' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
                                                        'border-red-500/30 text-red-400 bg-red-500/10'}
                                            `}>
                                                {problem.difficulty}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {details.problems.length === 0 && (
                                    <div className="text-center py-4 text-gray-500 text-sm">
                                        No problems data available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BattleDetails;
