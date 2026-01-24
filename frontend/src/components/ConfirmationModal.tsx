import React from 'react';
import { AlertCircle, Trash2, Shield, X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string | React.ReactNode;
    confirmText?: string;
    confirmColor?: 'red' | 'blue' | 'amber' | 'purple';
    icon?: 'trash' | 'shield' | 'alert';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    confirmColor = 'red',
    icon = 'alert'
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (icon) {
            case 'trash': return <Trash2 className={`w-10 h-10 text-${confirmColor}-500`} />;
            case 'shield': return <Shield className={`w-10 h-10 text-${confirmColor}-500`} />;
            default: return <AlertTriangle className={`w-10 h-10 text-${confirmColor}-500`} />;
        }
    };

    const getButtonColor = () => {
        switch (confirmColor) {
            case 'blue': return 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20 hover:shadow-blue-500/20';
            case 'amber': return 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20 hover:shadow-amber-500/20';
            case 'purple': return 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20 hover:shadow-purple-500/20';
            default: return 'bg-red-600 hover:bg-red-500 shadow-red-900/20 hover:shadow-red-500/20';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`bg-gray-900 border border-${confirmColor}-500/30 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-${confirmColor}-500/20`}>

                {/* Background Decor */}
                <div className={`absolute top-0 right-0 p-24 bg-${confirmColor}-500/5 blur-3xl rounded-full pointer-events-none`} />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-50"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 text-center relative z-10">
                    <div className={`w-20 h-20 bg-${confirmColor}-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-${confirmColor}-500/20 shadow-[0_0_30px_-10px_rgba(0,0,0,0.3)]`}>
                        {getIcon()}
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>

                    <div className={`bg-${confirmColor}-500/10 border border-${confirmColor}-500/20 rounded-xl p-4 mb-8 text-left`}>
                        <div className="flex gap-3">
                            <AlertCircle className={`w-5 h-5 text-${confirmColor}-400 shrink-0 mt-0.5`} />
                            <div className={`text-sm text-${confirmColor}-200/80 leading-relaxed`}>
                                {message}
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
                            className={`flex-1 py-3 text-white font-bold rounded-xl transition-all shadow-lg hover:scale-[1.02] ${getButtonColor()}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
