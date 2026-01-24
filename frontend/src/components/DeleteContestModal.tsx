import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteContestModalProps {
    contestTitle: string;
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteContestModal: React.FC<DeleteContestModalProps> = ({ contestTitle, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-gray-900 border border-red-500/30 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-red-500/20">

                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-24 bg-red-500/5 blur-3xl rounded-full pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-50"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 text-center relative z-10">
                    <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-red-500/20 shadow-[0_0_30px_-10px_rgba(239,68,68,0.3)]">
                        <Trash2 className="w-10 h-10 text-red-500" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Delete Contest?</h2>

                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 text-left">
                        <div className="flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                            <div className="text-sm text-red-200/80 leading-relaxed">
                                Are you sure you want to delete <span className="font-bold text-red-400">{contestTitle}</span>?
                                <br />
                                This action cannot be undone.
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors border border-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/20 hover:shadow-red-500/20 hover:scale-[1.02]"
                        >
                            Yes, Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteContestModal;
