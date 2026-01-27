import React, { useState } from 'react';
import { X, PenTool, Type } from 'lucide-react';
import { postsAPI } from '../services/api';

interface KnowledgeDropModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const KnowledgeDropModal: React.FC<KnowledgeDropModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await postsAPI.createPost({ title, content });
            setIsLoading(false);
            onClose();
            setTitle('');
            setContent('');

            onSuccess?.();
        } catch (error) {
            console.error('Error creating post:', error);
            setIsLoading(false);
            // You might want to show an error message to the user here
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative glass-card rounded-2xl p-8 w-full max-w-2xl mx-4 shadow-2xl border border-white/10 animation-fadeIn">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="mb-8 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center border border-amber-400/20">
                        <PenTool className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Knowledge Drop</h2>
                        <p className="text-gray-400 text-sm">Share your coding insights with the community</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title Field */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                            Title
                        </label>
                        <div className="relative">
                            <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                                placeholder="What did you learn today?"
                                required
                            />
                        </div>
                    </div>

                    {/* Content Field */}
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                            Content
                        </label>
                        <div className="relative">
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={6}
                                className="w-full p-4 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all resize-none"
                                placeholder="Write your article here..."
                                required
                            ></textarea>
                        </div>
                    </div>



                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-amber-400 text-black font-bold py-3 px-4 rounded-lg hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                                Publishing...
                            </div>
                        ) : (
                            'Add Post'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default KnowledgeDropModal;
