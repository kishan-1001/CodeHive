import React from 'react';
import { BadgeCheck, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ContestAlreadyFinishedModalProps {
    contestId: string;
    onClose: () => void;
}

const ContestAlreadyFinishedModal: React.FC<ContestAlreadyFinishedModalProps> = ({ contestId, onClose }) => {
    const navigate = useNavigate();

    return (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center group">

                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-24 bg-green-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-green-500/10 transition-all duration-1000" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-green-500/20 shadow-[0_0_30px_-10px_rgba(34,197,94,0.3)]">
                        <BadgeCheck className="w-10 h-10 text-green-400" />
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-2">Contest Completed</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        You have already finished this contest. <br />
                        Great job! You can view your performance analysis now.
                    </p>

                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={() => navigate(`/weekly-contest/${contestId}/feedback`)}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-green-900/20 transition-all transform hover:scale-[1.02]"
                        >
                            <BarChart2 className="w-5 h-5" />
                            View Results & Feedback
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl font-medium transition-colors"
                        >
                            Back to Contest
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContestAlreadyFinishedModal;
