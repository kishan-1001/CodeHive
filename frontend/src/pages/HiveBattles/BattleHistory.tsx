import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomAPI } from '../../services/api';
import { Trophy, Clock, Hash } from 'lucide-react';

interface BattleHistoryItem {
    id: number;
    roomCode: string;
    date: string;
    score: number;
    rank: number;
    totalParticipants: number;
}

const BattleHistory: React.FC = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState<BattleHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await roomAPI.getRoomHistory();
                setHistory(data);
            } catch (err: any) {
                setError('Failed to load battle history');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) return <div className="text-gray-400 text-center py-4 text-xs">Loading history...</div>;
    if (error) return <div className="text-red-400 text-center py-4 text-xs">{error}</div>;

    const totalBattles = history.length;

    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden w-full flex flex-col">
            <div className="p-4 border-b border-gray-700 bg-gray-800/50">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        My Battle History
                    </h2>
                    <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full text-gray-300">
                        Total: {totalBattles}
                    </span>
                </div>
                <p className="text-gray-400 text-[10px]">Your recent performance in arenas.</p>
            </div>

            <div className="overflow-y-auto flex-1 p-3 space-y-2 custom-scrollbar max-h-[300px]">
                {history.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No battles played yet.</p>
                        <p className="text-xs mt-1">Join or create a room to start!</p>
                    </div>
                ) : (
                    history.map((battle) => (
                        <div
                            key={battle.id}
                            onClick={() => navigate(`/hive-battles/history/${battle.id}`)}
                            className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-800 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-mono text-amber-400 font-bold text-sm">#{battle.rank}</span>
                                        <span className="text-gray-400 text-[10px]">/ {battle.totalParticipants} Players</span>
                                    </div>
                                    <div className="text-xs font-bold text-white bg-gray-700/50 px-1.5 py-0.5 rounded text-[10px]">{battle.score} pts</div>
                                </div>
                                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" />
                                    {new Date(battle.date).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 group-hover:text-amber-400/80 transition-colors">
                                        <Hash className="w-2.5 h-2.5" />
                                        <span className="font-mono">{battle.roomCode}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BattleHistory;
