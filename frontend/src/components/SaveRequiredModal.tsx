import React from 'react';
import { AlertCircle, Save, X } from 'lucide-react';

interface SaveRequiredModalProps {
    platformLabel: string;
    onClose: () => void;
}

const SaveRequiredModal: React.FC<SaveRequiredModalProps> = ({ platformLabel, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-gray-900 border border-amber-500/30 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-amber-500/20">

                {/* Background Decor */}
                <div className="absolute top-0 left-0 p-24 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-50"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 text-center relative z-10">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-amber-500/20 shadow-[0_0_30px_-10px_rgba(245,158,11,0.3)]">
                        <AlertCircle className="w-10 h-10 text-amber-500" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Username Not Saved</h2>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8 text-left">
                        <div className="flex gap-3">
                            <Save className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-200/80 leading-relaxed">
                                Please save your <span className="font-bold text-amber-400">{platformLabel}</span> username first.
                                <br /><br />
                                We need to save it to your profile before we can verify your ownership.
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-all shadow-lg shadow-amber-900/20 hover:shadow-amber-500/20 hover:scale-[1.02]"
                    >
                        Got it, I'll Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaveRequiredModal;
