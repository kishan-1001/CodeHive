import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, Terminal, Check, Timer, Trophy, ArrowRight, ShieldAlert, BadgeCheck, AlertTriangle, Maximize } from 'lucide-react';
import { problemsAPI } from '../services/api';
import ContestAlreadyFinishedModal from '../components/ContestAlreadyFinishedModal';
import ContestLeaderboard from '../components/ContestLeaderboard';

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
    const [drafts, setDrafts] = useState<Record<number, Record<string, string>>>({});
    const [solvedProblems, setSolvedProblems] = useState<Set<number>>(new Set());

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
    const WARNING_LIMIT = 3; // Strict 2 warnings, 3rd is fatal.

    // Finish Contest Logic
    const [showFinishConfirmation, setShowFinishConfirmation] = useState(false);
    const [showProctorModal, setShowProctorModal] = useState(false);
    const [showFinishedModal, setShowFinishedModal] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    const [activeTab, setActiveTab] = useState<'questions' | 'leaderboard'>('questions');

    // Refs
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);

    const handleFinish = () => {
        setShowFinishConfirmation(true);
    };

    const confirmFinish = async () => {
        if (isFinishing) return;
        setIsFinishing(true); // Start loader
        setShowFinishConfirmation(false);

        try {
            await fetch(`/api/contests/${id}/finish`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
            });
        } catch (e) { console.error("Finish error", e); }
        finally {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.error("Exit FS error:", err));
            }
            navigate(`/weekly-contest/${id}/feedback`);
        }
    };

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
                const token = sessionStorage.getItem('token');
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

                // Fetch Solved Status
                try {
                    const results = await problemsAPI.getContestResults(id);
                    const solved = new Set<number>();
                    if (results && results.problems) {
                        results.problems.forEach((p: any) => {
                            if (p.is_solved) solved.add(p.problem_id);
                        });
                    }
                    setSolvedProblems(solved);
                } catch (e) {
                    console.error("Failed to fetch contest results", e);
                }

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
                    confirmFinish(); // Auto redirect
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
                if (drafts[basicProblem.problem_id]?.[language]) {
                    setCode(drafts[basicProblem.problem_id][language]);
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
            if (drafts[currentProblem.id]?.[language]) {
                setCode(drafts[currentProblem.id][language]);
                return;
            }

            try {
                const template = await problemsAPI.getProblemTemplate(currentProblem.id.toString(), language);
                setCode(template.starter_code);
            } catch {
                const langKey = language as keyof typeof boilerplateCode;
                setCode(boilerplateCode[langKey] || '// Write code here');
            }
        };
        fetchTemplate();
    }, [language, currentProblem?.id]);


    // --- Proctoring Logic ---
    const handleEnterContest = () => {
        setShowProctorModal(true);
    };

    const confirmEnterContest = async () => {
        try {
            const res = await fetch(`/api/contests/${id}/enter`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
            });
            if (res.status === 403) {
                // alert(data.error); 
                // navigate(`/weekly-contest/${id}/feedback`);
                setShowFinishedModal(true);
                return;
            }
        } catch (e) {
            console.error("Enter contest error", e);
            // Optionally block entry if network fails?
        }

        const elem = document.documentElement;
        // Attempt full screen
        if (elem.requestFullscreen) {
            try {
                await elem.requestFullscreen();
                console.log("Entered full screen successfully");
                setHasEntered(true);
                setShowProctorModal(false);
                violationCountRef.current = 0;
                setViolationCount(0);
            } catch (err: any) {
                console.error("Full screen error:", err);
                // Fallback: Enter anyway but warn or just allow (user might be in a weird environment)
                // For now, let's allow entry but maybe show a toast or just proceed?
                // The user said "nothing is happening", implying it might be stuck.
                // If it fails, we MUST set hasEntered(true) or else they are stuck.
                alert(`Could not enter full-screen mode automatically: ${err.message}. You can try pressing F11 manually.`);
                setHasEntered(true);
                setShowProctorModal(false);
            }
        } else {
            console.warn("Full screen API not supported");
            setHasEntered(true);
            setShowProctorModal(false);
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

        const checkViolations = () => {
            if (violationCountRef.current >= WARNING_LIMIT) {
                // Auto-submit
                if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => { });
                }

                // Call finish API
                fetch(`/api/contests/${id}/finish`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
                }).finally(() => {
                    navigate(`/weekly-contest/${id}/feedback`);
                });
                return;
            }
            setShowWarningOverlay(true);
        };

        const handleFullScreenChange = () => {
            if (!document.fullscreenElement && !isSubmitting) {
                violationCountRef.current += 1;
                setViolationCount(violationCountRef.current);
                checkViolations();
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden && !isSubmitting) {
                violationCountRef.current += 1;
                setViolationCount(violationCountRef.current);
                checkViolations();
            }
        };

        const handleCopyPaste = (e: ClipboardEvent) => {
            e.preventDefault();
            violationCountRef.current += 1;
            setViolationCount(violationCountRef.current);
            checkViolations();
        };

        const handlePopState = () => {
            // Prevent back navigation
            window.history.pushState(null, "", window.location.pathname);
            violationCountRef.current += 1;
            setViolationCount(violationCountRef.current);
            checkViolations();
            setShowWarningOverlay(true);
        };

        // Push state initially to trap back button
        window.history.pushState(null, "", window.location.pathname);

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('copy', handleCopyPaste);
        document.addEventListener('cut', handleCopyPaste);
        document.addEventListener('paste', handleCopyPaste);
        window.addEventListener('popstate', handlePopState);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('copy', handleCopyPaste);
            document.removeEventListener('cut', handleCopyPaste);
            document.removeEventListener('paste', handleCopyPaste);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [hasEntered, isSubmitting, status, id, navigate]);


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
                const token = sessionStorage.getItem('token');
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
            const token = sessionStorage.getItem('token');
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
            if (data.verdict === 'accepted') {
                setSolvedProblems(prev => {
                    const next = new Set(prev);
                    next.add(currentProblem.id);
                    return next;
                });
            }
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
            <>
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
                            <div className="w-full text-left">
                                {/* Tab Navigation */}
                                <div className="flex items-center gap-4 border-b border-gray-800 mb-6">
                                    <button
                                        onClick={() => setActiveTab('questions')}
                                        className={`pb-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'questions' ? 'text-white border-amber-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                                    >
                                        Questions
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('leaderboard')}
                                        className={`pb-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'leaderboard' ? 'text-white border-amber-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                                    >
                                        Leaderboard
                                    </button>
                                </div>

                                {activeTab === 'questions' ? (
                                    <>
                                        <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                                            <BadgeCheck className="w-6 h-6 text-amber-500" />
                                            Contest Questions
                                        </h3>
                                        <div className="grid gap-4 mb-8">
                                            {contestProblems.map((p, idx) => (
                                                <button
                                                    key={p.problem_id}
                                                    onClick={() => navigate(`/problems/${p.problem_id}`)}
                                                    className="w-full bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-amber-500/50 rounded-xl p-5 flex items-center justify-between transition-all group text-left"
                                                >
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center font-mono text-lg font-bold text-gray-500 group-hover:text-amber-400 group-hover:border-amber-500/30 transition-all">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors mb-1">{p.title}</h4>
                                                            <div className="flex items-center gap-3 text-sm">
                                                                <span className={`px-2 py-0.5 rounded-md bg-gray-900 border ${p.difficulty === 'Easy' ? 'text-green-400 border-green-500/20' : p.difficulty === 'Medium' ? 'text-yellow-400 border-yellow-500/20' : 'text-red-400 border-red-500/20'}`}>
                                                                    {p.difficulty}
                                                                </span>
                                                                <span className="text-gray-500">{p.points} points</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-600 group-hover:bg-amber-500/10 group-hover:text-amber-400 transition-all">
                                                        <ArrowRight className="w-5 h-5" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <ContestLeaderboard contestId={id!} />
                                )}

                                <div className="border-t border-gray-800 pt-6 text-center">
                                    <button onClick={() => navigate('/weekly-contest')} className="text-gray-500 hover:text-white font-semibold transition-colors">
                                        Back to Contests
                                    </button>
                                </div>
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
                {/* Proctoring Warning Modal - Added here for visibility on Landing Page */}
                {showProctorModal && (
                    <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
                        <div className="max-w-2xl w-full bg-gray-900 p-10 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-32 bg-amber-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-amber-500/20 transition-all duration-1000" />

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-amber-500/20">
                                    <Maximize className="w-10 h-10 text-amber-400" />
                                </div>

                                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">
                                    Proctored Exam
                                </h1>

                                <p className="text-gray-400 text-lg mb-8 max-w-lg leading-relaxed text-center">
                                    You are about to enter a timed, proctored environment.
                                </p>

                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 max-w-lg w-full text-left space-y-3">
                                    <div className="flex gap-3">
                                        <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
                                        <div className="text-sm text-red-200">
                                            <strong className="block text-red-400 mb-1">Strict Anti-Cheat Policy</strong>
                                            <ul className="list-disc list-inside space-y-1 text-red-200/80">
                                                <li>You must remain in full-screen mode.</li>
                                                <li><strong>No Tab Switching</strong> (Alt+Tab, minimizing).</li>
                                                <li><strong>No Copy/Paste allowed.</strong> Attempts will be recorded as violations.</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="pl-9 text-xs text-red-400/80 border-t border-red-500/10 pt-2">
                                        You have <span className="font-bold underline">2 warnings</span> total.
                                        On the 3rd violation, the exam will <span className="font-bold">automatically submit</span>.
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowProctorModal(false)}
                                        className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors border border-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmEnterContest}
                                        className="px-8 py-3 text-white font-semibold bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl hover:from-amber-600 hover:to-orange-700 hover:shadow-lg transition-all"
                                    >
                                        I Understand, Start Contest
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Finished Contest Modal (Professional) - Added for visibility on Landing Page */}
                {showFinishedModal && id && (
                    <ContestAlreadyFinishedModal
                        contestId={id}
                        onClose={() => setShowFinishedModal(false)}
                    />
                )}
            </>
        );
    }

    // 2. LIVE ARENA UI
    return (
        <div className="flex h-screen bg-gray-950 text-white overflow-hidden font-sans">
            {/* 0. Finishing Overlay (Highest Priority) */}
            {isFinishing && (
                <div className="absolute inset-0 z-[100] bg-gray-950 flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="relative">
                        <div className="w-24 h-24 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Trophy className="w-10 h-10 text-amber-400 animate-pulse" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-8 animate-pulse">Finishing Contest...</h2>
                    <p className="text-gray-400 mt-2">Calculating final rank</p>
                </div>
            )}

            {/* Finished Contest Modal (Professional) */}
            {showFinishedModal && id && (
                <ContestAlreadyFinishedModal
                    contestId={id}
                    onClose={() => setShowFinishedModal(false)}
                />
            )}

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

            {/* Finish Confirmation Modal */}
            {showFinishConfirmation && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 transition-all duration-300 animate-in fade-in">
                    <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden ring-1 ring-white/10">
                        <div className="absolute top-0 right-0 p-24 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />

                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold text-white mb-3">Finish Contest?</h2>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                Are you sure you want to finish the contest? <br />
                                You will be redirected to the feedback analysis page.
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowFinishConfirmation(false)}
                                    className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors border border-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmFinish}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-900/20"
                                >
                                    Finish & Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Proctoring Warning Modal - Removed from here since it's now handled in the landing component */}


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
                            {solvedProblems.has(p.problem_id) && <Check className="w-5 h-5 text-green-500" />}
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-800">
                    <button onClick={handleFinish} className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-white transition-colors">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Finish Contest
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
                                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-1.5 rounded font-medium transition-colors border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isRunning ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Running...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4" /> Run
                                        </>
                                    )}
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
                                {(Object.keys(testResults).length > 0 || isRunning) && (
                                    <div className="mt-8 pt-8 border-t border-gray-800">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Terminal className="w-5 h-5" /> Run Results</h3>

                                        {isRunning ? (
                                            <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/30 flex items-center justify-center py-8">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                                    <span className="text-gray-400 text-sm animate-pulse">Running test cases...</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {Object.entries(testResults).map(([key, result]: any) => {
                                                    const index = parseInt(key);
                                                    const testCase = currentProblem.sample_test_cases?.[index];

                                                    return (
                                                        <div key={key} className={`rounded-lg border overflow-hidden ${result.passed ? 'border-green-500/30' : 'border-red-500/30'}`}>
                                                            {/* Header */}
                                                            <div className={`px-4 py-2 flex items-center justify-between ${result.passed ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                                                <span className={`font-bold text-xs uppercase tracking-wider flex items-center gap-2 ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                                                                    Case {index + 1}: {result.verdict}
                                                                </span>
                                                                {result.passed ? <Check className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                                                            </div>

                                                            {/* Details */}
                                                            <div className="p-4 bg-gray-900/50 space-y-3 text-xs font-mono">
                                                                {testCase && (
                                                                    <>
                                                                        <div>
                                                                            <div className="text-gray-500 mb-1">Input:</div>
                                                                            <div className="text-gray-300 bg-gray-950 p-2 rounded border border-gray-800">{testCase.input}</div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-gray-500 mb-1">Expected Output:</div>
                                                                            <div className="text-gray-300 bg-gray-950 p-2 rounded border border-gray-800">{testCase.expected_output}</div>
                                                                        </div>
                                                                    </>
                                                                )}
                                                                <div>
                                                                    <div className="text-gray-500 mb-1">Your Output:</div>
                                                                    <div className={`p-2 rounded border border-gray-800 break-words ${result.passed ? 'text-green-300 bg-green-500/5' : 'text-red-300 bg-red-500/5'}`}>
                                                                        {result.actual}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
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
                                        setDrafts(prev => ({
                                            ...prev,
                                            [currentProblem.id]: {
                                                ...(prev[currentProblem.id] || {}),
                                                [language]: newCode
                                            }
                                        }));
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

