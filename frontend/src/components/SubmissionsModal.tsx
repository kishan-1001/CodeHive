import React, { useEffect, useState } from 'react';
import { X, Clock, AlertCircle, CheckCircle, Terminal } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface Submission {
    id: number;
    verdict: string;
    runtime_ms: number;
    memory_kb: number;
    language: string;
    code: string;
    created_at: string;
    time_complexity_static?: string;
    space_complexity_static?: string;
}

interface SubmissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    submissions: Submission[];
    loading: boolean;
}

const SubmissionsModal: React.FC<SubmissionsModalProps> = ({
    isOpen,
    onClose,
    submissions,
    loading
}) => {
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    // Default to first submission if available
    useEffect(() => {
        if (submissions.length > 0 && !selectedSubmission) {
            setSelectedSubmission(submissions[0]);
        }
    }, [submissions, isOpen]);

    if (!isOpen) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getVerdictColor = (verdict: string) => {
        switch (verdict) {
            case 'AC': return 'text-green-400';
            case 'WA': return 'text-red-400';
            case 'TLE': return 'text-amber-400';
            case 'CE': return 'text-orange-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl border border-gray-800">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800 shrink-0">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Submissions
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex">

                    {/* Left: List of Submissions */}
                    <div className="w-1/3 border-r border-gray-800 overflow-y-auto custom-scrollbar bg-gray-900/50">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : submissions.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                No submissions found.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-800">
                                {submissions.map((sub) => (
                                    <button
                                        key={sub.id}
                                        onClick={() => setSelectedSubmission(sub)}
                                        className={`w-full text-left p-4 hover:bg-gray-800 transition-colors flex flex-col gap-1 ${selectedSubmission?.id === sub.id ? 'bg-gray-800 border-l-4 border-amber-400' : 'border-l-4 border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`font-bold ${getVerdictColor(sub.verdict)}`}>
                                                {sub.verdict === 'AC' ? 'Accepted' : sub.verdict}
                                            </span>
                                            <span className="text-xs text-gray-500 font-mono">
                                                {sub.language}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {formatDate(sub.created_at)}
                                        </div>
                                        {sub.verdict === 'AC' && (
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-xs bg-gray-700/50 px-1.5 py-0.5 rounded text-gray-300">
                                                    {sub.runtime_ms}ms
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Details */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-gray-900">
                        {selectedSubmission ? (
                            <div className="flex-1 flex flex-col min-h-0">
                                {/* Stats Bar */}
                                <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-800 bg-gray-800/20 shrink-0">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Status</div>
                                        <div className={`font-medium ${getVerdictColor(selectedSubmission.verdict)}`}>
                                            {selectedSubmission.verdict}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Runtime</div>
                                        <div className="text-gray-200 font-mono">
                                            {selectedSubmission.runtime_ms} ms
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Memory</div>
                                        <div className="text-gray-200 font-mono">
                                            {Math.round(selectedSubmission.memory_kb / 1024 * 100) / 100} MB
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Language</div>
                                        <div className="text-gray-200">
                                            {selectedSubmission.language}
                                        </div>
                                    </div>
                                </div>

                                {/* Static Analysis Stats (If Available and AC) */}
                                {(selectedSubmission.time_complexity_static || selectedSubmission.space_complexity_static) && (
                                    <div className="px-4 py-2 border-b border-gray-800 bg-amber-400/5 flex gap-6 shrink-0">
                                        {selectedSubmission.time_complexity_static && (
                                            <div className="flex gap-2 items-center">
                                                <span className="text-xs text-amber-500 font-medium uppercase tracking-wider">Time Complexity:</span>
                                                <span className="text-sm font-mono text-gray-200">{selectedSubmission.time_complexity_static}</span>
                                            </div>
                                        )}
                                        {selectedSubmission.space_complexity_static && (
                                            <div className="flex gap-2 items-center">
                                                <span className="text-xs text-blue-500 font-medium uppercase tracking-wider">Space Complexity:</span>
                                                <span className="text-sm font-mono text-gray-200">{selectedSubmission.space_complexity_static}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Code Editor */}
                                <div className="flex-1 min-h-0 relative">
                                    <Editor
                                        height="100%"
                                        language={selectedSubmission.language}
                                        value={selectedSubmission.code}
                                        theme="vs-dark"
                                        options={{
                                            readOnly: true,
                                            minimap: { enabled: false },
                                            fontSize: 14,
                                            scrollBeyondLastLine: false,
                                            padding: { top: 16 }
                                        }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400">
                                Select a submission to view details
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmissionsModal;
