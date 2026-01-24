import React from 'react';
import { AlertCircle, X, ChevronLeft } from 'lucide-react';

interface ErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, title = 'Error', message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-gray-900 border border-red-500/30 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-red-500/20">

                {/* Background Decor */}
                <div className="absolute top-0 left-0 p-24 bg-red-500/5 blur-3xl rounded-full pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-50"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 text-center relative z-10">
                    <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-red-500/20 shadow-[0_0_30px_-10px_rgba(239,68,68,0.3)]">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>

                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 text-left max-h-40 overflow-y-auto custom-scrollbar">
                        <p className="text-sm text-red-200/90 font-mono break-words leading-relaxed">
                            {message}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all border border-gray-700 hover:border-gray-600 flex items-center justify-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorModal;
