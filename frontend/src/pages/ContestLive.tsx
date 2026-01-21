import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, Terminal, Check, Timer, Trophy, ArrowRight, ShieldAlert, BadgeCheck, AlertTriangle } from 'lucide-react';
import { problemsAPI } from '../services/api';

// Types
interface Problem {
    id: number;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    slug?: string;
    points?: number;
    problem_order?: number;
    sample_test_cases?: { input: string; expected_output: string }[];
}

interface Contest {
    id: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    is_published: boolean;
}

const ContestLive: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Session Data
    const [contest, setContest] = useState<Contest | null>(null);
    const [contestProblems, setContestProblems] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    // Full Problem Data
    const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
    const [problemLoading, setProblemLoading] = useState(false);

    // State
    const [status, setStatus] = useState<'loading' | 'upcoming' | 'live' | 'ended'>('loading');
    const [timeLeft, setTimeLeft] = useState<string>('00:00:00');
    const [drafts, setDrafts] = useState<Record<number, string>>({});

    // Proctoring & Editor State
    const [hasEntered, setHasEntered] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [code, setCode] = useState<string>('// Loading...');
    const [language, setLanguage] = useState<string>('cpp');
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [testResults, setTestResults] = useState<{ [key: number]: { actual: string; verdict: string; passed: boolean } }>({});
    const [submissionResult, setSubmissionResult] = useState<{ verdict: string; message: string } | null>(null);
    const [showSubmissionModal, setShowSubmissionModal] = useState<boolean>(false);

    // Warning System
    const [violationCount, setViolationCount] = useState(0);
    const violationCountRef = useRef(0);
    const [showWarningOverlay, setShowWarningOverlay] = useState(false);
    const WARNING_LIMIT = 5; // Slightly more lenient for contests maybe? Keeping strict for now.

    // Refs
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);

    const languages = [
        { value: 'cpp', label: 'C++' },
        { value: 'java', label: 'Java' },
        { value: 'python', label: 'Python' },
        { value: 'javascript', label: 'JavaScript' },
        { value: 'c', label: 'C' }
    ];

    const boilerplateCode = {
        c: '#include <stdio.h>\n\nint main() {\n   \n // write your code here \n  \n  return 0;\n}',
        cpp: '#include <iostream>\nusing namespace std;\nint main() {\n    \n // write your code here \n \n    return 0;\n}',
        python: 'print("Hello, World!")',
        javascript: 'console.log("Hello, World!");',
        java: 'public class Main {\n    public static void main(String[] args) {\n \t// write your code here \n    }\n}'
    };

    // 1. Fetch Contest Info
    useEffect(() => {
        if (!id) return;
        const fetchContest = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/contests/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.status === 404) {
                    alert("Contest not found");
                    navigate('/weekly-contest');
                    return;
                }
                const data = await res.json();
                setContest(data);
                setContestProblems(data.problems || []);

                // Determine Status
                const now = new Date();
                const start = new Date(data.start_time);
                const end = new Date(data.end_time);

                if (now < start) setStatus('upcoming');
                else if (now > end) setStatus('ended');
                else setStatus('live');

            } catch (error) {
                console.error("Failed to fetch contest", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContest();
    }, [id]);

    // 2. Timer Logic
    useEffect(() => {
        if (!contest) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const start = new Date(contest.start_time).getTime();
            const end = new Date(contest.end_time).getTime();

            let target = end;
            let nextStatus: 'upcoming' | 'live' | 'ended' = 'live';

            if (now < start) {
                target = start;
                nextStatus = 'upcoming';
            } else if (now > end) {
                target = end; // Expired
                nextStatus = 'ended';
            }

            if (status !== nextStatus) setStatus(nextStatus);

            const diff = target - now;
            if (diff <= 0) {
                if (nextStatus === 'upcoming') {
                    setStatus('live'); // Auto start
                } else if (nextStatus === 'live') {
                    setStatus('ended'); // Auto end
                    // Optional: force submit?
                }
                setTimeLeft('00:00:00');
            } else {
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [contest, status]);


    // 3. Problem Loading
    useEffect(() => {
        const fetchProblemDetails = async () => {
            if (contestProblems.length === 0 || !hasEntered) return; // Only load details after entering

            const basicProblem = contestProblems[currentIndex];
            try {
                setProblemLoading(true);
                // Re-use standard problem API for details
                const fullProblem = await problemsAPI.getProblemById(basicProblem.problem_id.toString());

                setCurrentProblem({
                    ...fullProblem,
                    points: basicProblem.points,
                    problem_order: basicProblem.problem_order
                });

                setTestResults({});
                setSubmissionResult(null);

                // Load draft or template
                if (drafts[basicProblem.problem_id]) {
                    setCode(drafts[basicProblem.problem_id]);
                } else {
                    try {
                        const template = await problemsAPI.getProblemTemplate(basicProblem.problem_id.toString(), language);
                        setCode(template.starter_code);
                    } catch {
                        const langKey = language as keyof typeof boilerplateCode;
                        setCode(boilerplateCode[langKey] || '// Write code here');
                    }
                }

            } catch (error) {
                console.error("Failed to load problem details", error);
            } finally {
                setProblemLoading(false);
            }
        };

        fetchProblemDetails();
    }, [currentIndex, contestProblems, hasEntered]);

    // Template Re-fetch
    useEffect(() => {
        if (!currentProblem) return;
        const fetchTemplate = async () => {
            if (!drafts[currentProblem.id]) {
                try {
                    const template = await problemsAPI.getProblemTemplate(currentProblem.id.toString(), language);
                    setCode(template.starter_code);
                } catch {
                    const langKey = language as keyof typeof boilerplateCode;
                    setCode(boilerplateCode[langKey] || '// Write code here');
                }
            }
        };
        fetchTemplate();
    }, [language, currentProblem?.id]);


    // --- Proctoring Logic ---
    const handleEnterContest = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().then(() => {
                setHasEntered(true);
                violationCountRef.current = 0;
                setViolationCount(0);
            }).catch(err => {
                alert(`Error entering full-screen: ${err.message}`);
                // Allow entry anyway if FS fails? strict mode would say no.
                setHasEntered(true);
            });
        } else {
            setHasEntered(true);
        }
    };

    const handleResumeExam = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().then(() => {
                setShowWarningOverlay(false);
            }).catch(console.error);
        }
    };

    useEffect(() => {
        if (!hasEntered || status !== 'live') return;

        const handleFullScreenChange = () => {
            if (!document.fullscreenElement && !isSubmitting) {
                violationCountRef.current += 1;
                setViolationCount(violationCountRef.current);
                setShowWarningOverlay(true);
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden && !isSubmitting) {
                violationCountRef.current += 1;
                setViolationCount(violationCountRef.current);
                setShowWarningOverlay(true);
            }
        };

        const handleCopyPaste = (e: ClipboardEvent) => {
            // Optional: allow copy paste in contests? Usually strict.
            // Following prompt: "same as instant arena" -> strict.
            e.preventDefault();
            violationCountRef.current += 1;
            setViolationCount(violationCountRef.current);
            setShowWarningOverlay(true);
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('copy', handleCopyPaste);
        document.addEventListener('cut', handleCopyPaste);
        document.addEventListener('paste', handleCopyPaste);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('copy', handleCopyPaste);
            document.removeEventListener('cut', handleCopyPaste);
            document.removeEventListener('paste', handleCopyPaste);
        };
    }, [hasEntered, isSubmitting, status]);


    // --- Actions ---

    const handleRun = async () => {
        if (!currentProblem?.sample_test_cases) return;
        setIsRunning(true);
        setTestResults({});

        // Use generic execute endpoint for "Run" (no scoring, just test)
        const newResults: any = {};

        for (let i = 0; i < currentProblem.sample_test_cases.length; i++) {
            const testCase = currentProblem.sample_test_cases[i];
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/execute', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        code,
                        language,
                        input: testCase.input,
                        problem_id: currentProblem.id,
                    }),
                });

                const data = await response.json();
                if (response.ok && !data.error) {
                    const passed = data.output.trim() === testCase.expected_output.trim();
                    newResults[i] = {
                        actual: data.output.trim(),
                        verdict: passed ? 'ACCEPTED' : 'WRONG_ANSWER',
                        passed
                    };
                } else {
                    const error = data.error || {};
                    newResults[i] = {
                        actual: error.message || 'Error',
                        verdict: error.type || 'RUNTIME_ERROR',
                        passed: false
                    };
                }
            } catch (e) {
                newResults[i] = { actual: 'Network Error', verdict: 'ERROR', passed: false };
            }
        }
        setTestResults(newResults);
        setIsRunning(false);
    };

    const handleSubmit = async () => {
        if (!currentProblem || !id) return;
        setIsSubmitting(true);
        setSubmissionResult(null);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/contests/${id}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code,
                    language,
                    problem_id: currentProblem.id
                })
            });
            const data = await res.json();
            setSubmissionResult(data);
            setShowSubmissionModal(true);

        } catch (error) {
            console.error(error);
            setSubmissionResult({ verdict: 'error', message: 'Submission failed' });
            setShowSubmissionModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };


    // Loading State
    if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-amber-500"><div className="animate-spin w-8 h-8 border-4 border-current border-t-transparent rounded-full" /></div>;

    // Screens
    if (!contest) return <div>Contest not found</div>;

    // 1. Upcoming or Ended Screen
    if (!hasEntered || status === 'upcoming' || status === 'ended') {
        const isUpcoming = status === 'upcoming';
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                <div className="absolute top-20 left-20 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px] -z-10" />
                <div className="max-w-2xl w-full bg-gray-900 border border-gray-800 rounded-3xl p-12 shadow-2xl relative z-10">
                    <Trophy className={`w-20 h-20 mx-auto mb-6 ${isUpcoming ? 'text-blue-400' : 'text-gray-600'}`} />

                    <h1 className="text-4xl font-bold text-white mb-4">{contest.title}</h1>
                    <p className="text-gray-400 text-lg mb-8">{contest.description}</p>

                    <div className="flex justify-center gap-8 mb-12">
                        <div className="text-center">
                            <div className="text-sm text-gray-500 uppercase tracking-widest mb-1">Start Time</div>
                            <div className="text-xl font-mono text-white">{new Date(contest.start_time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-500 uppercase tracking-widest mb-1">End Time</div>
                            <div className="text-xl font-mono text-white">{new Date(contest.end_time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} IST</div>
                        </div>
                    </div>

                    {isUpcoming ? (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                            <h3 className="text-blue-400 font-bold text-lg mb-2">Contest Begins In</h3>
                            <div className="text-5xl font-mono font-black text-white tracking-widest">{timeLeft}</div>
                        </div>
                    ) : status === 'ended' ? (
                        <div className="bg-gray-800 rounded-xl p-6">
                            <h3 className="text-gray-400 font-bold text-lg mb-2">Contest Ended</h3>
                            <button onClick={() => navigate('/weekly-contest')} className="text-amber-400 hover:text-amber-300 font-semibold">
                                Back to Contests
                            </button>
                        </div>
                    ) : (
                        // Live!
                        <div>
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mb-8">
                                <h3 className="text-green-400 font-bold text-lg mb-2">Contest is Live!</h3>
                                <div className="text-green-500 text-sm">Validating environment...</div>
                            </div>
                            <button
                                onClick={handleEnterContest}
                                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all transform hover:scale-[1.02]"
                            >
                                Enter Contest Arena
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // 2. LIVE ARENA UI
    return (
        <div className="flex h-screen bg-gray-950 text-white overflow-hidden font-sans">
            {/* Warning Overlay */}
            {showWarningOverlay && (
                <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-gray-900 border border-red-500/50 rounded-2xl p-8 text-center">
                        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-2">Security Violation</h2>
                        <p className="text-red-400 mb-6">You exited full-screen or switched tabs.</p>
                        <div className="text-4xl font-black text-white mb-8">
                            <span className="text-red-500">{violationCount}</span><span className="text-gray-600">/</span><span className="text-gray-400">{WARNING_LIMIT}</span>
                        </div>
                        <button onClick={handleResumeExam} className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold">Resume Contest</button>
                    </div>
                </div>
            )}

            {/* Submission Modal */}
            {showSubmissionModal && submissionResult && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowSubmissionModal(false)}>
                    <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
                        {submissionResult.verdict === 'accepted' ? (
                            <BadgeCheck className="w-20 h-20 text-green-500 mx-auto mb-4" />
                        ) : (
                            <AlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                        )}
                        <h2 className={`text-2xl font-bold mb-2 ${submissionResult.verdict === 'accepted' ? 'text-green-400' : 'text-red-400'}`}>
                            {submissionResult.verdict === 'accepted' ? 'Accepted!' : 'Wrong Answer'}
                        </h2>
                        <p className="text-gray-400 mb-6 uppercase tracking-wider text-sm">{submissionResult.message}</p>
                        <button onClick={() => setShowSubmissionModal(false)} className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white">Close</button>
                    </div>
                </div>
            )}


            {/* Left Sidebar: Problem List */}
            <div className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
                <div className="p-5 border-b border-gray-800">
                    <h2 className="font-bold text-white flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-400" />
                        {contest.title}
                    </h2>
                    <div className="mt-2 flex items-center gap-2 text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded inline-flex">
                        <Timer className="w-3 h-3" />
                        Time Left: {timeLeft}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {contestProblems.map((p, idx) => (
                        <button
                            key={p.problem_id}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-full text-left px-5 py-4 border-b border-gray-800 transition-colors flex items-center justify-between group 
                                ${idx === currentIndex ? 'bg-amber-500/10 border-l-4 border-l-amber-500' : 'hover:bg-gray-800/50 border-l-4 border-l-transparent'}`}
                        >
                            <div className="min-w-0">
                                <div className={`text-sm font-medium truncate ${idx === currentIndex ? 'text-amber-400' : 'text-gray-300'}`}>
                                    {idx + 1}. {p.title}
                                </div>
                                <div className={`text-xs mt-1 ${p.difficulty === 'Easy' ? 'text-green-400' : p.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {p.difficulty} • {p.points} pts
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-800">
                    <button onClick={() => navigate('/weekly-contest')} className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-white transition-colors">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Leave Contest
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Check if problem loaded */}
                {problemLoading || !currentProblem ? (
                    <div className="flex-1 flex items-center justify-center text-gray-500">Loading Problem...</div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
                            <h1 className="font-semibold text-lg">{currentProblem.title}</h1>
                            <div className="flex items-center gap-4">
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="bg-gray-800 text-white text-sm py-1.5 px-3 rounded border border-gray-700 outline-none focus:border-amber-400"
                                >
                                    {languages.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                </select>
                                <button
                                    onClick={handleRun}
                                    disabled={isRunning}
                                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-1.5 rounded font-medium transition-colors border border-gray-700"
                                >
                                    <Play className="w-4 h-4" /> Run
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-1.5 rounded font-bold hover:shadow-lg hover:shadow-amber-500/20 transition-all"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </div>

                        {/* Split View */}
                        <div className="flex-1 flex overflow-hidden">
                            {/* Description */}
                            <div className="w-1/2 h-full overflow-y-auto bg-gray-900 p-8 border-r border-gray-800 custom-scrollbar">
                                <div className="prose prose-invert max-w-none">
                                    <p className="whitespace-pre-wrap text-gray-300 leading-relaxed text-base">{currentProblem.description}</p>
                                </div>

                                {/* Examples */}
                                {currentProblem.sample_test_cases?.map((example, i) => (
                                    <div key={i} className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                                        <h4 className="font-bold text-amber-500 mb-2 text-sm">Example {i + 1}</h4>
                                        <div className="grid grid-cols-1 gap-2 text-sm font-mono text-gray-300">
                                            <div className="bg-gray-950 p-2 rounded border border-gray-800"><span className="text-gray-500 select-none mr-2">In:</span> {example.input}</div>
                                            <div className="bg-gray-950 p-2 rounded border border-gray-800"><span className="text-gray-500 select-none mr-2">Out:</span> {example.expected_output}</div>
                                        </div>
                                    </div>
                                ))}

                                {/* Test Results */}
                                {Object.keys(testResults).length > 0 && (
                                    <div className="mt-8 pt-8 border-t border-gray-800">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Terminal className="w-5 h-5" /> Run Results</h3>
                                        <div className="space-y-3">
                                            {Object.entries(testResults).map(([key, result]: any) => (
                                                <div key={key} className={`p-4 rounded-lg border ${result.passed ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className={`font-bold text-xs uppercase tracking-wider ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                                                            {result.verdict}
                                                        </span>
                                                        {result.passed && <Check className="w-4 h-4 text-green-500" />}
                                                    </div>
                                                    <div className="font-mono text-sm text-gray-300 break-words bg-gray-950/50 p-2 rounded">
                                                        {result.actual}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Editor */}
                            <div className="w-1/2 h-full bg-[#1e1e1e]">
                                <Editor
                                    height="100%"
                                    theme="vs-dark"
                                    language={language}
                                    value={code}
                                    onChange={(value) => {
                                        const newCode = value || '';
                                        setCode(newCode);
                                        setDrafts(prev => ({ ...prev, [currentProblem.id]: newCode }));
                                    }}
                                    onMount={(editor, monaco) => {
                                        editorRef.current = editor;
                                        monacoRef.current = monaco;
                                    }}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        padding: { top: 20 },
                                        scrollBeyondLastLine: false,
                                    }}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ContestLive;
