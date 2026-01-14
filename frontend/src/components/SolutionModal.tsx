import React, { useEffect, useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface Solution {
    id: number;
    problem_id: number;
    language: string;
    solution_type: 'brute_force' | 'optimal' | 'most_optimal';
    explanation: string;
    code: string;
    time_complexity: string;
    space_complexity: string;
}

interface SolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    solutions: Solution[];
    loading: boolean;
    selectedLanguage: string;
    onLanguageChange: (lang: string) => void;
}

const SolutionModal: React.FC<SolutionModalProps> = ({
    isOpen,
    onClose,
    solutions,
    loading,
    selectedLanguage,
    onLanguageChange
}) => {
    const [activeTab, setActiveTab] = useState<'brute_force' | 'optimal' | 'most_optimal'>('brute_force');
    const [copied, setCopied] = useState(false);

    // Reset tab when modal opens or solutions change
    useEffect(() => {
        // If current tab has no solution, switch to one that does
        const currentSolution = solutions.find(s => s.solution_type === activeTab);
        if (!currentSolution && solutions.length > 0) {
            // Prioritize most_optimal -> optimal -> brute_force if current selection is invalid?
            // Or just default to the first available one
            setActiveTab(solutions[0].solution_type);
        }
    }, [solutions, isOpen]);

    if (!isOpen) return null;

    const currentSolution = solutions.find(s => s.solution_type === activeTab);

    // Available solution types for this language
    const availableTypes = solutions.map(s => s.solution_type);

    const handleCopy = () => {
        if (currentSolution?.code) {
            navigator.clipboard.writeText(currentSolution.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const languages = [
        { value: 'c', label: 'C' },
        { value: 'cpp', label: 'C++' },
        { value: 'python', label: 'Python' },
        { value: 'java', label: 'Java' },
        { value: 'javascript', label: 'JavaScript' }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl border border-gray-800">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white">Solution</h2>
                    <div className="flex items-center gap-4">
                        <select
                            value={selectedLanguage}
                            onChange={(e) => onLanguageChange(e.target.value)}
                            className="bg-gray-800 hover:bg-gray-700 text-white text-sm py-1.5 px-3 rounded-lg border border-gray-700 outline-none focus:border-amber-400 transition-colors"
                        >
                            {languages.map((lang) => (
                                <option key={lang.value} value={lang.value}>{lang.label}</option>
                            ))}
                        </select>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : solutions.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
                            <p>No solutions available for {languages.find(l => l.value === selectedLanguage)?.label}.</p>
                        </div>
                    ) : (
                        <>
                            {/* Tabs */}
                            <div className="flex border-b border-gray-800 px-4">
                                {['brute_force', 'optimal', 'most_optimal'].map((type) => {
                                    const hasSolution = availableTypes.includes(type as any);
                                    if (!hasSolution) return null;

                                    const label = type === 'brute_force' ? 'Brute Force' :
                                        type === 'optimal' ? 'Optimal' : 'Most Optimal';

                                    return (
                                        <button
                                            key={type}
                                            onClick={() => setActiveTab(type as any)}
                                            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === type
                                                    ? 'text-amber-400 border-amber-400'
                                                    : 'text-gray-400 border-transparent hover:text-white'
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Solution Details */}
                            {currentSolution && (
                                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                    {/* Complexity Analysis */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                                            <h4 className="text-sm font-medium text-gray-400 mb-1">Time Complexity</h4>
                                            <p className="text-lg font-mono text-green-400">{currentSolution.time_complexity}</p>
                                        </div>
                                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                                            <h4 className="text-sm font-medium text-gray-400 mb-1">Space Complexity</h4>
                                            <p className="text-lg font-mono text-blue-400">{currentSolution.space_complexity}</p>
                                        </div>
                                    </div>

                                    {/* Explanation */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-white mb-2">Approach</h3>
                                        <div className="prose prose-invert max-w-none text-gray-300">
                                            <p className="whitespace-pre-wrap">{currentSolution.explanation}</p>
                                        </div>
                                    </div>

                                    {/* Code */}
                                    <div className="relative rounded-lg overflow-hidden border border-gray-700">
                                        <div className="absolute right-2 top-2 z-10">
                                            <button
                                                onClick={handleCopy}
                                                className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 transition-colors"
                                                title="Copy code"
                                            >
                                                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <Editor
                                            height="400px"
                                            language={currentSolution.language}
                                            value={currentSolution.code}
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
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SolutionModal;
