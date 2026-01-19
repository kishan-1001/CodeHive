import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { ArrowLeft, Play, Terminal, Check, List, Clock, Maximize, AlertTriangle, ShieldAlert } from 'lucide-react';
import { arenaAPI, problemsAPI } from '../services/api';
import SubmissionResultModal from '../components/SubmissionResultModal';

// Types matching ProblemDetail
interface Problem {
    id: number;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    topics: { name: string; slug: string }[];
    sample_test_cases?: { input: string; expected_output: string }[];
    constraints?: string;
    solved?: boolean;
    slug?: string;
}

const ArenaSession: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();

    // Session Data
    const [session, setSession] = useState<any>(null);
    const [sessionProblems, setSessionProblems] = useState<any[]>([]); // List from session API
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    // Full Problem Data (for description, test cases etc)
    const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
    const [problemLoading, setProblemLoading] = useState(false);

    // Drafts State
    const [drafts, setDrafts] = useState<Record<number, string>>({});

    // Timer State
    const [timeLeft, setTimeLeft] = useState<string>('00:00:00');
    const [isExpired, setIsExpired] = useState(false);

    // Proctoring State
    const [hasStarted, setHasStarted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Warning System State
    const [violationCount, setViolationCount] = useState(0);
    const violationCountRef = useRef(0);
    const [showWarningOverlay, setShowWarningOverlay] = useState(false);
    const [showFinishConfirmation, setShowFinishConfirmation] = useState(false);
    const WARNING_LIMIT = 3;

    // Editor State
    const [code, setCode] = useState<string>('// Loading...');
    const [language, setLanguage] = useState<string>('cpp');
    const [testResults, setTestResults] = useState<{ [key: number]: { actual: string; verdict: string; passed: boolean } }>({});
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [submissionResult, setSubmissionResult] = useState<{ verdict: string; message: string } | null>(null);
    const [showSubmissionModal, setShowSubmissionModal] = useState<boolean>(false);

    // Layout State
    const [splitPosition, setSplitPosition] = useState<number>(50);
    const [testCaseHeight, setTestCaseHeight] = useState<number>(33);
    const [selectedTestCase, setSelectedTestCase] = useState<number>(0);

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

    // Monaco Refs
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const decorationsRef = useRef<string[]>([]);

    const handleEditorDidMount = (editor: any, monaco: any) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
    };

    // Fetch Session initially
    useEffect(() => {
        if (!sessionId) return;
        const loadSession = async () => {
            try {
                setLoading(true);
                const data = await arenaAPI.getSession(sessionId);
                setSession(data.session);
                setSessionProblems(data.problems);
            } catch (error) {
                console.error('Failed to load session:', error);
                alert('Failed to load session');
                navigate('/instant-arena');
            } finally {
                setLoading(false);
            }
        };
        loadSession();
    }, [sessionId]);

    // Initialize Timer
    useEffect(() => {
        if (!session?.expires_at) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const expires = new Date(session.expires_at).getTime();
            const diff = expires - now;

            if (diff <= 0) {
                clearInterval(interval);
                setTimeLeft('00:00:00');
                if (!isExpired) {
                    setIsExpired(true);
                    handleAutoSubmitAll('Time Expired');
                }
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
    }, [session?.expires_at, isExpired]);


    // Auto Submit All Wrapper
    const handleAutoSubmitAll = async (reason: string = "Time's Up!") => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.log(err));
        }

        console.log(`Auto-submitting due to: ${reason}`);

        for (const p of sessionProblems) {
            const codeToSubmit = drafts[p.id];
            if (!codeToSubmit) continue;

            try {
                await arenaAPI.submitSolution({
                    code: codeToSubmit,
                    language: language,
                    problem_id: p.id,
                    session_id: session.id
                });
            } catch (e) {
                console.error(`Failed to auto-submit problem ${p.id}`, e);
            }
        }

        setIsSubmitting(false);
        navigate(`/arena/${sessionId}/feedback`);
    };

    // Proctoring: Start Exam (Enter Fullscreen)
    const handleStartExam = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().then(() => {
                setHasStarted(true);
                // Reset warnings on start just in case
                violationCountRef.current = 0;
                setViolationCount(0);
            }).catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            setHasStarted(true);
        }
    };

    // Proctoring: Resume Exam (Re-enter Fullscreen)
    const handleResumeExam = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().then(() => {
                setShowWarningOverlay(false);
            }).catch(err => {
                console.error("Failed to re-enter full screen", err);
            });
        }
    };

    // Proctoring: Monitor Fullscreen Exit
    useEffect(() => {
        // Only monitor if exam has started
        if (!hasStarted) return;

        const handleFullScreenChange = () => {
            // If we lost full screen AND we are not currently submitting
            if (!document.fullscreenElement && !isSubmitting) {
                // Increment violation count
                violationCountRef.current += 1;
                setViolationCount(violationCountRef.current);

                // Check limits
                // Rules: 3 warnings allowed. 4th violation = termination.
                // So if count > 3, terminate.
                if (violationCountRef.current > WARNING_LIMIT) {
                    handleAutoSubmitAll("Too many security violations");
                } else {
                    // Show warning overlay
                    setShowWarningOverlay(true);
                }
            }
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        };
    }, [hasStarted, isSubmitting]);


    // Proctoring: Disable Copy/Paste & Count as Violation
    useEffect(() => {
        if (!hasStarted) return;

        const handleVisibilityChange = () => {
            if (document.hidden && !isSubmitting) {
                // Treat as violation
                violationCountRef.current += 1;
                setViolationCount(violationCountRef.current);

                if (violationCountRef.current > WARNING_LIMIT) {
                    handleAutoSubmitAll("Too many security violations (Tab Switch)");
                } else {
                    setShowWarningOverlay(true);
                }
            }
        };

        const handleCopyPaste = (e: ClipboardEvent) => {
            e.preventDefault();

            // Treat as violation
            violationCountRef.current += 1;
            setViolationCount(violationCountRef.current);

            // Logic: if current count > limit, we terminate.
            // But we also want to show the overlay to "Warn" them if they are still within limit.
            if (violationCountRef.current > WARNING_LIMIT) {
                handleAutoSubmitAll("Too many security violations (Copy/Paste)");
            } else {
                setShowWarningOverlay(true);
            }
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('copy', handleCopyPaste);
        document.addEventListener('cut', handleCopyPaste);
        document.addEventListener('paste', handleCopyPaste);
        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('copy', handleCopyPaste);
            document.removeEventListener('cut', handleCopyPaste);
            document.removeEventListener('paste', handleCopyPaste);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [hasStarted]);

    // Finish Session Manually
    const handleFinish = async () => {
        setShowFinishConfirmation(true);
    };

    const confirmFinish = () => {
        setShowFinishConfirmation(false);
        handleAutoSubmitAll("User Finished");
    };

    // Code Loading & Template Logic
    useEffect(() => {
        const fetchProblemDetails = async () => {
            if (sessionProblems.length === 0) return;

            const basicProblem = sessionProblems[currentIndex];
            try {
                setProblemLoading(true);
                const fullProblem = await problemsAPI.getProblemById(basicProblem.id.toString());

                setCurrentProblem({
                    ...fullProblem,
                    solved: basicProblem.is_solved
                });

                setTestResults({});
                setSubmissionResult(null);

                if (drafts[basicProblem.id]) {
                    setCode(drafts[basicProblem.id]);
                } else {
                    try {
                        const template = await problemsAPI.getProblemTemplate(basicProblem.id.toString(), language);
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
    }, [currentIndex, sessionProblems]);

    // Re-fetch template when language changes
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

    const handleCodeChange = (value: string | undefined) => {
        const newCode = value || '';
        setCode(newCode);
        if (currentProblem) {
            setDrafts(prev => ({ ...prev, [currentProblem.id]: newCode }));
        }
    };

    // Run Logic
    const handleRun = async () => {
        if (!currentProblem?.sample_test_cases || currentProblem.sample_test_cases.length === 0) return;

        setIsRunning(true);
        setTestResults({});

        // Clear markers
        if (monacoRef.current && editorRef.current) {
            const model = editorRef.current.getModel();
            monacoRef.current.editor.setModelMarkers(model, 'owner', []);
            decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
        }

        const newResults: { [key: number]: { actual: string; verdict: string; passed: boolean } } = {};

        for (let i = 0; i < currentProblem.sample_test_cases.length; i++) {
            const testCase = currentProblem.sample_test_cases[i];
            try {
                const response = await fetch('/api/execute', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
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
                    const actualOutput = data.output.trim();
                    const expectedOutput = testCase.expected_output.trim();
                    const passed = actualOutput === expectedOutput;
                    const verdict = passed ? 'ACCEPTED' : 'WRONG_ANSWER';
                    newResults[i] = { actual: actualOutput, verdict, passed };
                } else {
                    const error = data.error || {};
                    let verdict = error.type || 'RUNTIME_ERROR';
                    let errorMessage = error.message || data.error || 'Unknown error';

                    if (typeof errorMessage === 'string') {
                        if (errorMessage.toLowerCase().includes('compilation') || errorMessage.toLowerCase().includes('syntax')) {
                            verdict = 'COMPILATION_ERROR';
                        } else if (errorMessage.toLowerCase().includes('timeout') || errorMessage.toLowerCase().includes('time limit')) {
                            verdict = 'TIME_LIMIT_EXCEEDED';
                        }
                    }

                    newResults[i] = { actual: `${verdict}: ${errorMessage}`, verdict, passed: false };


                    if (error.line && monacoRef.current && editorRef.current) {
                        const model = editorRef.current.getModel();
                        monacoRef.current.editor.setModelMarkers(model, 'owner', [
                            {
                                startLineNumber: error.line,
                                startColumn: 1,
                                endLineNumber: error.line,
                                endColumn: 1000,
                                message: errorMessage,
                                severity: monacoRef.current.MarkerSeverity.Error,
                            },
                        ]);
                        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, [
                            {
                                range: new monacoRef.current.Range(error.line, 1, error.line, 1),
                                options: { isWholeLine: true, className: 'error-line-highlight', glyphMarginClassName: 'error-glyph-margin' }
                            }
                        ]);
                        editorRef.current.revealLineInCenter(error.line);
                    }
                }
            } catch (error) {
                newResults[i] = { actual: 'NETWORK_ERROR: Network error', verdict: 'NETWORK_ERROR', passed: false };
            }
        }

        setTestResults(newResults);
        setIsRunning(false);
    };

    const handleSubmit = async () => {
        if (!currentProblem || !session) return;
        setIsSubmitting(true);
        setSubmissionResult(null);

        try {
            const result: any = await arenaAPI.submitSolution({
                code,
                language,
                problem_id: currentProblem.id,
                session_id: session.id
            });

            setSubmissionResult(result);
            setShowSubmissionModal(true);

            if (result.verdict === 'accepted') {
                const newProblems = [...sessionProblems];
                newProblems[currentIndex].is_solved = true;
                setSessionProblems(newProblems);
                setCurrentProblem(prev => prev ? { ...prev, solved: true } : null);
            }
        } catch (error: any) {
            setSubmissionResult({
                verdict: 'error',
                message: error.message || 'Submission failed'
            });
            setShowSubmissionModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Resizers logic
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = splitPosition;
        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX;
            const deltaPercent = (deltaX / window.innerWidth) * 100;
            setSplitPosition(Math.max(20, Math.min(80, startWidth + deltaPercent)));
        };
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseDownTestCase = (e: React.MouseEvent) => {
        e.preventDefault();
        const startY = e.clientY;
        const startHeight = testCaseHeight;
        const handleMouseMove = (e: MouseEvent) => {
            const deltaY = e.clientY - startY;
            const deltaPercent = (deltaY / window.innerHeight) * 100;
            setTestCaseHeight(Math.max(10, Math.min(90, startHeight - deltaPercent)));
        };
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };


    if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div></div>;

    // 1. Proctoring Overlay (Initial)
    if (!hasStarted) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center p-6">
                <div className="max-w-2xl w-full bg-gray-900 p-10 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-amber-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-amber-500/20 transition-all duration-1000" />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-amber-500/20">
                            <Maximize className="w-10 h-10 text-amber-400" />
                        </div>

                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">
                            Proctored Exam
                        </h1>

                        <p className="text-gray-400 text-lg mb-8 max-w-lg leading-relaxed">
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
                                You have <span className="font-bold underline">3 warnings</span> total.
                                On the 4th violation, the exam will <span className="font-bold">automatically submit</span>.
                            </div>
                        </div>

                        <button
                            onClick={handleStartExam}
                            className="px-8 py-4 text-white font-semibold bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl hover:from-amber-600 hover:to-orange-700 hover:shadow-lg transition-all"
                        >
                            Enter Arena & Start
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden relative">

            {/* 2. Warning Overlay (Blocking) */}
            {showWarningOverlay && (
                <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 transition-all duration-300 animate-in fade-in">
                    <div className="max-w-md w-full bg-gray-900 border border-red-500/50 rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-red-500/40">
                                <ShieldAlert className="w-8 h-8 text-red-500" />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">Security Violation</h2>
                            <p className="text-red-400 font-medium mb-6">
                                You exited full-screen mode. This is recorded as a violation.
                            </p>

                            <div className="flex items-center justify-center gap-2 text-3xl font-black text-white mb-8">
                                <span className="text-red-500">{violationCount}</span>
                                <span className="text-gray-600">/</span>
                                <span className="text-gray-400">{WARNING_LIMIT}</span>
                                <span className="text-sm font-normal text-gray-500 ml-2 self-end mb-1">Warnings Used</span>
                            </div>

                            <p className="text-sm text-gray-400 mb-8">
                                Please return to the exam environment immediately.
                                <br />Further violations will result in auto-submission.
                            </p>

                            <button
                                onClick={handleResumeExam}
                                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-900/20"
                            >
                                Resume Exam
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Finish Confirmation Modal */}
            {
                showFinishConfirmation && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 transition-all duration-300 animate-in fade-in">
                        <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden ring-1 ring-white/10">
                            <div className="absolute top-0 right-0 p-24 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />

                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold text-white mb-3">Finish Exam?</h2>
                                <p className="text-gray-400 mb-8 leading-relaxed">
                                    Are you sure you want to submit your exam now? <br />
                                    This cannot be undone and your session will end.
                                </p>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowFinishConfirmation(false)}
                                        className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors border border-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmFinish} // Using the new function
                                        className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-900/20"
                                    >
                                        Finish & Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Left Sidebar - Problem List (Arena Specific) */}
            <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
                <div className="p-4 border-b border-gray-800">
                    <h2 className="font-bold text-lg text-white flex items-center gap-2">
                        <List className="w-5 h-5 text-amber-400" />
                        Arena Problems
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {sessionProblems.map((p, idx) => (
                        <button
                            key={p.id}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-full text-left px-4 py-3 border-b border-gray-800 transition-colors flex items-center justify-between group ${idx === currentIndex ? 'bg-amber-400/10 border-l-4 border-l-amber-400' : 'hover:bg-gray-800 border-l-4 border-l-transparent'
                                }`}
                        >
                            <div className="min-w-0">
                                <div className={`text-sm font-medium truncate ${idx === currentIndex ? 'text-amber-400' : 'text-gray-300'}`}>
                                    {idx + 1}. {p.title}
                                </div>
                                <div className={`text-xs mt-1 ${p.difficulty === 'Easy' ? 'text-green-400' :
                                    p.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                    {p.difficulty} • {p.difficulty === 'Easy' ? 4 : p.difficulty === 'Medium' ? 5 : 6} pts
                                </div>
                            </div>
                            {p.is_solved && <Check className="w-4 h-4 text-green-400 shrink-0 ml-2" />}
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-800">
                    <div className="p-4 border-t border-gray-800">
                        <button onClick={handleFinish} className="w-full py-2 bg-red-600 hover:bg-red-500 rounded font-medium text-white transition-colors flex items-center justify-center gap-2">
                            Finish Exam
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content (Similar to ProblemDetail) */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4 min-w-0">
                        <h1 className="font-semibold text-lg truncate">{currentProblem?.title}</h1>
                        {currentProblem && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${currentProblem.difficulty === 'Easy' ? 'text-green-400 bg-green-400/10' :
                                currentProblem.difficulty === 'Medium' ? 'text-amber-400 bg-amber-400/10' :
                                    'text-red-400 bg-red-400/10'
                                }`}>
                                {currentProblem.difficulty} • {currentProblem.difficulty === 'Easy' ? 4 : currentProblem.difficulty === 'Medium' ? 5 : 6} pts
                            </span>
                        )}
                        <div className="flex items-center gap-2 text-gray-400 bg-gray-800 px-3 py-1 rounded-full text-sm ml-4">
                            <Clock className="w-4 h-4" />
                            <span>{timeLeft}</span>
                        </div>
                        {/* Warnings Display inside Header */}
                        {violationCount > 0 && (
                            <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 ml-2">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <span className="text-xs font-bold text-red-400">Warnings: {violationCount}/{WARNING_LIMIT}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleRun}
                            disabled={isRunning || !currentProblem}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-green-700 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg font-medium transition-colors text-sm"
                        >
                            {isRunning ? 'Running...' : <><Play className="w-4 h-4 fill-current" /> Run</>}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !currentProblem}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-700 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg font-medium transition-colors text-sm"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>

                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-gray-800 hover:bg-gray-700 text-white text-sm py-1.5 px-3 rounded-lg border border-gray-700 outline-none focus:border-amber-400 transition-colors"
                        >
                            {languages.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                        </select>
                    </div>
                </div>

                {/* Workspace Split */}
                <div className="flex-1 flex overflow-hidden relative">
                    {/* Left: Description */}
                    <div
                        style={{ width: `${splitPosition}%` }}
                        className="h-full overflow-y-auto bg-gray-900 p-6 custom-scrollbar"
                    >
                        {problemLoading || !currentProblem ? (
                            <div className="flex items-center justify-center h-full text-gray-500">Loading problem details...</div>
                        ) : (
                            <div className="max-w-3xl mx-auto space-y-6">
                                <div className="prose prose-invert max-w-none">
                                    <p className="whitespace-pre-wrap leading-relaxed text-gray-300">
                                        {currentProblem.description}
                                    </p>
                                </div>

                                {/* Sample Test Cases */}
                                {currentProblem.sample_test_cases && currentProblem.sample_test_cases.length > 0 && (
                                    <div className="mt-8 space-y-4">
                                        <h3 className="text-xl font-semibold text-white mb-4">Examples</h3>
                                        {currentProblem.sample_test_cases.map((testCase, index) => (
                                            <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                                <h4 className="text-lg font-medium text-amber-400 mb-3">Example {index + 1}:</h4>
                                                <div className="space-y-3">
                                                    <div>
                                                        <div className="text-sm text-gray-400 mb-1">Input:</div>
                                                        <div className="bg-gray-900 rounded p-3 font-mono text-sm text-gray-200 border border-gray-600">
                                                            {testCase.input}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-400 mb-1">Output:</div>
                                                        <div className="bg-gray-900 rounded p-3 font-mono text-sm text-gray-200 border border-gray-600">
                                                            {testCase.expected_output}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Constraints */}
                                {currentProblem.constraints && (
                                    <div className="mt-8">
                                        <h3 className="text-xl font-semibold text-white mb-4">Constraints</h3>
                                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                            <ul className="list-disc list-inside space-y-2 text-gray-300">
                                                {currentProblem.constraints.split('\n').map((constraint, index) => (
                                                    constraint.trim() && (
                                                        <li key={index} className="pl-2">
                                                            <span className="font-mono text-sm bg-gray-900 px-1.5 py-0.5 rounded border border-gray-700">
                                                                {constraint.replace(/^-/, '').trim()}
                                                            </span>
                                                        </li>
                                                    )
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Resizer */}
                    <div
                        className="w-1.5 h-full bg-gray-800 hover:bg-amber-400/50 cursor-col-resize transition-colors shrink-0 z-20 flex items-center justify-center group"
                        onMouseDown={handleMouseDown}
                    >
                        <div className="h-8 w-0.5 bg-gray-600 group-hover:bg-amber-400 rounded-full" />
                    </div>

                    {/* Right: Editor & Test Cases */}
                    <div
                        style={{ width: `${100 - splitPosition}%` }}
                        className="h-full flex flex-col bg-gray-900 border-l border-gray-800"
                    >
                        <div
                            style={{ height: `${100 - testCaseHeight}%` }}
                            className="min-h-0"
                        >
                            <Editor
                                height="100%"
                                language={language}
                                value={code}
                                onChange={handleCodeChange}
                                onMount={handleEditorDidMount}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    padding: { top: 16 },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                }}
                            />
                        </div>

                        <div
                            className="h-1.5 w-full bg-gray-800 hover:bg-amber-400/50 cursor-row-resize transition-colors shrink-0 z-20 flex items-center justify-center group"
                            onMouseDown={handleMouseDownTestCase}
                        >
                            <div className="w-8 h-0.5 bg-gray-600 group-hover:bg-amber-400 rounded-full" />
                        </div>

                        <div
                            style={{ height: `${testCaseHeight}%` }}
                            className="flex flex-col bg-gray-950"
                        >
                            <div className="flex items-center px-4 py-2 bg-gray-900 border-b border-gray-800 gap-2">
                                <Terminal className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-300">Test Cases</span>
                            </div>

                            {currentProblem?.sample_test_cases && currentProblem.sample_test_cases.length > 0 ? (
                                <>
                                    <div className="flex border-b border-gray-800">
                                        {currentProblem.sample_test_cases.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedTestCase(index)}
                                                className={`px-4 py-2 text-sm font-medium transition-colors ${selectedTestCase === index
                                                    ? 'text-amber-400 border-b-2 border-amber-400 bg-gray-800/50'
                                                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30'
                                                    }`}
                                            >
                                                Case {index + 1}
                                                {testResults[index] && (
                                                    <span className={`ml-2 ${testResults[index].passed ? 'text-green-400' : 'text-red-400'
                                                        }`}>
                                                        {testResults[index].passed ? '✓' : '✗'}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                                        <div className="space-y-3">
                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Input:</div>
                                                <div className="bg-gray-900 rounded p-3 font-mono text-sm text-gray-200 border border-gray-600">
                                                    {currentProblem.sample_test_cases[selectedTestCase].input}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Expected Output:</div>
                                                <div className="bg-gray-900 rounded p-3 font-mono text-sm text-gray-200 border border-gray-600">
                                                    {currentProblem.sample_test_cases[selectedTestCase].expected_output}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Your Output:</div>
                                                <div className={`bg-gray-900 rounded p-3 font-mono text-sm border overflow-x-auto ${testResults[selectedTestCase] ? (
                                                    testResults[selectedTestCase].passed ? 'border-green-500 text-green-200' : 'border-red-500 text-red-200'
                                                ) : 'border-gray-600 text-gray-600 italic'
                                                    }`}>
                                                    <pre className="whitespace-pre-wrap break-words">
                                                        {testResults[selectedTestCase] ? testResults[selectedTestCase].actual : 'Run code to see output'}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="p-4 text-gray-500 items-center justify-center flex h-full">No test cases available</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Submission Result Modal */}
            {
                submissionResult && (
                    <SubmissionResultModal
                        isOpen={showSubmissionModal}
                        onClose={() => setShowSubmissionModal(false)}
                        verdict={submissionResult.verdict}
                        message={submissionResult.message}
                    />
                )
            }
        </div >
    );
};

export default ArenaSession;
