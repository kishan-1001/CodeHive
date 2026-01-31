import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomAPI } from '../../services/api';


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
        <div className="bg-[#0a0a0a] rounded-xl border border-gray-800 shadow-2xl shadow-black/50 overflow-hidden w-full flex flex-col h-full">
            {/* Window Bar */}
            <div className="h-9 bg-white/5 border-b border-white/5 px-4 flex items-center justify-between select-none shrink-0">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20" />
                </div>
                <div className="text-[10px] font-mono text-gray-600">
                    battle_history.log
                </div>
            </div>

            <div className="flex flex-col flex-1 min-h-0 bg-[#0a0a0a] p-4">
                <div className="flex items-center justify-between mb-4 px-1 shrink-0">
                    <h2 className="text-sm font-bold font-mono text-gray-400 flex items-center gap-2">
                        <span className="text-green-500">$</span> cat history.log
                    </h2>
                    <span className="text-[10px] font-mono text-gray-600">
                        {totalBattles} records
                    </span>
                </div>

                <div className="overflow-y-auto flex-1 space-y-1 custom-scrollbar pr-2 min-h-0">
                    {history.length === 0 ? (
                        <div className="text-center py-12 text-gray-600 font-mono text-xs">
                            <p>No records found.</p>
                            <p className="mt-2 opacity-50">Run ./create_battle.sh to start</p>
                        </div>
                    ) : (
                        history.map((battle) => (
                            <div
                                key={battle.id}
                                onClick={() => navigate(`/hive-battles/history/${battle.id}`)}
                                className="group flex items-center justify-between p-2 rounded hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-gray-800"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="font-mono text-xs text-gray-500 w-20 shrink-0">
                                        {new Date(battle.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-amber-500 font-mono text-sm font-bold">
                                                #{battle.rank}
                                            </span>
                                            <span className="text-gray-600 text-[10px] font-mono">
                                                of {battle.totalParticipants}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="font-mono text-xs text-gray-400 group-hover:text-green-400 transition-colors">
                                        {battle.score}pts
                                    </div>
                                    <div className="text-[10px] font-mono text-gray-700 group-hover:text-gray-500">
                                        ID:{battle.roomCode}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default BattleHistory;
