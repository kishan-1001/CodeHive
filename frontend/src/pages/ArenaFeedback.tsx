
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '@monaco-editor/react';
import {
    Check, X, ArrowLeft, Brain, Cpu, Code, Award, Loader2, Zap,
    Shield, Activity, Layers, Target, BookOpen, AlertTriangle
} from 'lucide-react';
import { arenaAPI } from '../services/api';
import Header from '../components/Header';

// Interface matching the new backend response from aiService.ts
interface FeedbackData {
    correctness: {
        passedCases: string[];
        failedCases: string[];
        userOutput: string;
        expectedOutput: string;
    };
    complexity: {
        time: string;
        space: string;
        optimalTime: string;
        optimalSpace: string;
    };
    approach: {
        type: string;
        suggested: string;
    };
    quality: {
        naming: string;
        comments: string;
        structure: string;
    };
    bestPractices: string[];
    edgeCases: string[];
    optimization: string[];
    security: string[];
    scores: {
        correctness: number;
        efficiency: number;
        codeQuality: number;
        edgeCases: number;
        overall: number;
    };
}

interface ProblemResult {
    id: number;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    is_solved: boolean;
    user_code?: string;
    language?: string;
    score?: number;
}

const ArenaFeedback: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const [session, setSession] = useState<any>(null);
    const [problems, setProblems] = useState<ProblemResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [analyzingMap, setAnalyzingMap] = useState<Record<number, boolean>>({});
    const [feedbackMap, setFeedbackMap] = useState<Record<number, FeedbackData>>({});
    const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/home');
    };

    useEffect(() => {
        const fetchSessionData = async () => {
            if (!sessionId) return;
            try {
                const data = await arenaAPI.getSession(sessionId);
                setSession(data.session);

                const problemsWithCode = await Promise.all(data.problems.map(async (p: any) => {
                    let code = '';
                    let language = 'javascript';
                    if (p.is_solved) {
                        try {
                            const subs = await arenaAPI.getSubmissions(p.id);
                            if (subs && subs.length > 0) {
                                const best = subs.find((s: any) => s.verdict === 'AC') || subs[0];
                                code = best.code;
                                language = best.language;
                            }
                        } catch (e) {
                            console.error("Failed to fetch sub for", p.id);
                        }
                    }
                    return { ...p, user_code: code, language };
                }));

                setProblems(problemsWithCode);
                if (problemsWithCode.length > 0) {
                    setSelectedProblemId(problemsWithCode[0].id);
                }
            } catch (error) {
                console.error('Failed to load session:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSessionData();
    }, [sessionId]);

    // Handle Back Button -> Redirect to Instant Arena
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            event.preventDefault();
            navigate('/contest', { replace: true });
        };

        // Push state to trap the back button
        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [navigate]);

    const handleGenerateFeedback = async (problem: ProblemResult) => {
        if (!problem.user_code || analyzingMap[problem.id]) return;

        setAnalyzingMap(prev => ({ ...prev, [problem.id]: true }));
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/ai/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    problemId: problem.id,
                    code: problem.user_code,
                    language: problem.language || 'javascript'
                })
            });
            const data = await res.json();

            // Validation: Ensure the data has the expected structure
            if (data && data.scores) {
                setFeedbackMap(prev => ({ ...prev, [problem.id]: data }));
            } else {
                console.error("Invalid AI response structure", data);
                // Optional: Show an error toast
            }
        } catch (error) {
            console.error("AI Error", error);
        } finally {
            setAnalyzingMap(prev => ({ ...prev, [problem.id]: false }));
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white"><Loader2 className="animate-spin w-8 h-8 text-indigo-500" /></div>;

    const totalScore = session?.score || 0;
    const solvedCount = problems.filter(p => p.is_solved).length;

    return (
        <div className="min-h-screen bg-gray-950 text-white selection:bg-amber-400/30">
            <Header onSignOut={handleLogout} />

            <main className="max-w-[1600px] mx-auto px-6 py-24">
                {/* Hero Summary */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 mb-8 border border-gray-800 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                                <Award className="w-8 h-8 text-amber-400" />
                                Session Complete
                            </h1>
                            <p className="text-gray-400">Review your performance and get AI-powered insights.</p>
                        </div>
                        <div className="flex gap-8 text-center bg-gray-900/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                            <div>
                                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">{totalScore}</div>
                                <div className="text-xs text-gray-400 uppercase tracking-wider font-medium mt-1">Total Score</div>
                            </div>
                            <div className="w-px bg-gray-700" />
                            <div>
                                <div className="text-3xl font-bold text-white">{solvedCount} <span className="text-lg text-gray-500">/ {problems.length}</span></div>
                                <div className="text-xs text-gray-400 uppercase tracking-wider font-medium mt-1">Problems Solved</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Problem List - Horizontal Scroll */}
                    <div className="w-full">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Code className="w-5 h-5 text-gray-400" />
                                    Problem Breakdown
                                </h2>
                                <button onClick={() => navigate('/contest')} className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                                    <ArrowLeft className="w-4 h-4" /> Back to Arena
                                </button>
                            </div>

                            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                {problems.map((problem) => (
                                    <div
                                        key={problem.id}
                                        onClick={() => setSelectedProblemId(problem.id)}
                                        className={`min-w-[280px] p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 ${selectedProblemId === problem.id
                                            ? 'bg-gray-800 border-amber-400/50 shadow-lg shadow-amber-900/10'
                                            : 'bg-gray-900 border-gray-800 hover:border-gray-700 hover:bg-gray-800/50'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <h3 className={`font-medium truncate ${selectedProblemId === problem.id ? 'text-white' : 'text-gray-300'}`}>
                                                {problem.title}
                                            </h3>
                                            {problem.is_solved ? <Check className="w-5 h-5 text-green-400 shrink-0" /> : <X className="w-5 h-5 text-red-400 shrink-0" />}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className={`px-2 py-0.5 rounded-full ${problem.difficulty === 'Easy' ? 'bg-green-400/10 text-green-400' : problem.difficulty === 'Medium' ? 'bg-amber-400/10 text-amber-400' : 'bg-red-400/10 text-red-400'}`}>
                                                {problem.difficulty}
                                            </span>
                                            {problem.is_solved && (
                                                <span className="text-gray-500">• +{problem.difficulty === 'Easy' ? 4 : problem.difficulty === 'Medium' ? 5 : 6} pts</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area - Vertical Layout */}
                    <div className="w-full">
                        {selectedProblemId ? (
                            (() => {
                                const problem = problems.find(p => p.id === selectedProblemId);
                                if (!problem) return null;
                                const feedback = feedbackMap[problem.id];
                                const isAnalyzing = analyzingMap[problem.id];

                                return (
                                    <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden flex flex-col shadow-2xl">

                                        {/* Top Section: Code Viewer */}
                                        <div className="border-b border-gray-800 flex flex-col h-[500px]">
                                            <div className="p-4 border-b border-gray-800 bg-gray-950/50 flex items-center justify-between">
                                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                    <Code className="w-4 h-4 text-purple-400" /> Your Solution
                                                </h3>
                                                <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-800">
                                                    {problem.language}
                                                </span>
                                            </div>
                                            <div className="flex-1 bg-gray-950 relative group">
                                                <div className="absolute inset-0 pt-4">
                                                    <Editor
                                                        height="100%"
                                                        defaultLanguage={problem.language}
                                                        value={problem.user_code || "// No code submitted."}
                                                        theme="vs-dark"
                                                        options={{
                                                            readOnly: true,
                                                            minimap: { enabled: false },
                                                            fontSize: 14,
                                                            scrollBeyondLastLine: false,
                                                            padding: { top: 16, bottom: 16 },
                                                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                                            renderLineHighlight: "none",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom Section: AI Feedback Dashboard */}
                                        <div className="bg-gray-900/50 min-h-[600px] p-8">
                                            <div className="flex items-center gap-3 mb-8">
                                                <Brain className="w-8 h-8 text-purple-400" />
                                                <h2 className="text-2xl font-bold text-white">AI Performance Analysis</h2>
                                            </div>

                                            {!problem.is_solved ? (
                                                <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 opacity-50 border border-dashed border-gray-700 rounded-2xl">
                                                    <X className="w-12 h-12 text-gray-600" />
                                                    <p className="text-gray-400 text-lg">Analysis unavailable for unsolved problems.</p>
                                                </div>
                                            ) : isAnalyzing ? (
                                                <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-6">
                                                    <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
                                                    <p className="text-gray-300 text-lg animate-pulse">Generating comprehensive 8-pillar analysis...</p>
                                                </div>
                                            ) : !feedback ? (
                                                <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 bg-gray-950/30 rounded-2xl border border-gray-800">
                                                    <div className="bg-purple-500/10 p-5 rounded-full ring-1 ring-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                                                        <Zap className="w-12 h-12 text-purple-400" />
                                                    </div>
                                                    <div className="max-w-md">
                                                        <h3 className="text-xl font-semibold text-white mb-2">Generate Smart Analysis</h3>
                                                        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                                                            Get a comprehensive 8-pillar breakdown: Correctness, Complexity, Code Quality, Security, and more.
                                                        </p>
                                                        <button
                                                            onClick={() => handleGenerateFeedback(problem)}
                                                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-900/20 flex items-center gap-3 mx-auto active:scale-95"
                                                        >
                                                            <Brain className="w-5 h-5" /> Run Full Analysis
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                                                    {/* 1. Scoreboard */}
                                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                        <div className="md:col-span-1 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 p-5 rounded-2xl border border-purple-500/30 flex flex-col items-center justify-center text-center">
                                                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-indigo-400 mb-1">
                                                                {feedback.scores.overall}<span className="text-base text-gray-500">/10</span>
                                                            </div>
                                                            <div className="text-xs font-bold text-purple-300 uppercase tracking-widest">Overall Score</div>
                                                        </div>
                                                        {[
                                                            { label: 'Correctness', score: feedback.scores.correctness, icon: Target, color: 'text-green-400', bg: 'bg-green-400/10' },
                                                            { label: 'Efficiency', score: feedback.scores.efficiency, icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                                                            { label: 'Code Quality', score: feedback.scores.codeQuality, icon: Code, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                                                            { label: 'Edge Cases', score: feedback.scores.edgeCases, icon: Shield, color: 'text-rose-400', bg: 'bg-rose-400/10' },
                                                        ].map((item) => (
                                                            <div key={item.label} className="bg-gray-950/50 p-4 rounded-2xl border border-gray-800 flex flex-col justify-between">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <item.icon className={`w-5 h-5 ${item.color}`} />
                                                                    <div className={`font-mono font-bold ${item.color}`}>{item.score}/10</div>
                                                                </div>
                                                                <div className="text-xs text-gray-400 font-medium">{item.label}</div>
                                                                <div className="w-full bg-gray-800 h-1.5 rounded-full mt-3 overflow-hidden">
                                                                    <div className={`h-full ${item.bg.replace('/10', '')}`} style={{ width: `${(item.score / 10) * 100}%` }} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* 2. Primary Pillars Grid */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                                        {/* Correctness */}
                                                        <div className="bg-gray-950/40 p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition duration-300">
                                                            <h3 className="font-bold text-gray-200 mb-4 flex items-center gap-2">
                                                                <Target className="w-5 h-5 text-green-400" /> Correctness & Edge Cases
                                                            </h3>
                                                            <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <div className="flex gap-2">
                                                                        <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20">Passed</span>
                                                                        <span className="text-sm text-gray-400">{feedback.correctness.passedCases.join(", ")}</span>
                                                                    </div>
                                                                    {feedback.correctness.failedCases[0] !== 'None' && (
                                                                        <div className="flex gap-2">
                                                                            <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20">Failed</span>
                                                                            <span className="text-sm text-gray-400">{feedback.correctness.failedCases.join(", ")}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="pt-3 border-t border-gray-800">
                                                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Edge Cases Covered</div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {feedback.edgeCases.map((ec, i) => (
                                                                            <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">{ec}</span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Complexity */}
                                                        <div className="bg-gray-950/40 p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition duration-300">
                                                            <h3 className="font-bold text-gray-200 mb-4 flex items-center gap-2">
                                                                <Activity className="w-5 h-5 text-blue-400" /> Time & Space Complexity
                                                            </h3>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                                                                    <div className="text-xs text-gray-500 mb-1">Time</div>
                                                                    <div className="font-mono text-sm text-white">{feedback.complexity.time}</div>
                                                                </div>
                                                                <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                                                                    <div className="text-xs text-gray-500 mb-1">Space</div>
                                                                    <div className="font-mono text-sm text-white">{feedback.complexity.space}</div>
                                                                </div>
                                                                <div className="col-span-2 text-xs text-gray-400 mt-1">
                                                                    <span className="text-blue-400 font-semibold">Optimal:</span> Time {feedback.complexity.optimalTime}, Space {feedback.complexity.optimalSpace}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Approach */}
                                                        <div className="bg-gray-950/40 p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition duration-300">
                                                            <h3 className="font-bold text-gray-200 mb-4 flex items-center gap-2">
                                                                <Layers className="w-5 h-5 text-purple-400" /> Approach Strategy
                                                            </h3>
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Your Approach</span>
                                                                    <span className="text-sm text-white bg-purple-500/10 px-2 py-1 rounded inline-block border border-purple-500/20">{feedback.approach.type}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Suggested</span>
                                                                    <span className="text-sm text-gray-300">{feedback.approach.suggested}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Code Quality & Best Practices */}
                                                        <div className="md:col-span-2 bg-gray-950/40 p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition duration-300">
                                                            <h3 className="font-bold text-gray-200 mb-4 flex items-center gap-2">
                                                                <BookOpen className="w-5 h-5 text-amber-400" /> Quality & Best Practices
                                                            </h3>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div className="space-y-2 text-sm text-gray-400">
                                                                    <p><strong className="text-gray-300">Naming:</strong> {feedback.quality.naming}</p>
                                                                    <p><strong className="text-gray-300">Structure:</strong> {feedback.quality.structure}</p>
                                                                </div>
                                                                <div>
                                                                    <ul className="space-y-2">
                                                                        {feedback.bestPractices.map((bp, i) => (
                                                                            <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                                                                                <Check className="w-4 h-4 text-amber-500/50 mt-0.5 shrink-0" />
                                                                                {bp}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Security & Optimization */}
                                                        <div className="bg-gray-950/40 p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition duration-300">
                                                            <h3 className="font-bold text-gray-200 mb-4 flex items-center gap-2">
                                                                <Shield className="w-5 h-5 text-rose-400" /> Security & Optimization
                                                            </h3>
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <h4 className="text-xs text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Security Checks</h4>
                                                                    <ul className="text-xs text-gray-400 space-y-1 pl-1">
                                                                        {feedback.security.length > 0 ? feedback.security.map((s, i) => <li key={i}>• {s}</li>) : <li>• No major issues detected</li>}
                                                                    </ul>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xs text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Zap className="w-3 h-3" /> Optimization</h4>
                                                                    <ul className="text-xs text-gray-400 space-y-1 pl-1">
                                                                        {feedback.optimization.map((o, i) => <li key={i}>• {o}</li>)}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-gray-500 bg-gray-900 rounded-3xl border border-gray-800 border-dashed">
                                <Code className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-lg">Select a problem from the list to view details and AI feedback.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ArenaFeedback;
