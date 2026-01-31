import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// @ts-ignore
import { SplitPane } from 'react-split-pane';
import Editor from '@monaco-editor/react';
import { roomAPI, problemsAPI } from '../../services/api';
import { Clock, Play, Trophy, AlertTriangle, XCircle, CheckCircle, ChevronUp, ChevronDown, ShieldAlert, List, ChartBar, AlertOctagon } from 'lucide-react';

const RoomArena: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();

    // -- State --
    const [room, setRoom] = useState<any>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [problemList, setProblemList] = useState<any[]>([]);
    const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
    const [fullProblem, setFullProblem] = useState<any>(null);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    // Editor & Execution
    const [code, setCode] = useState('// Select a language and start coding...');
    const [language, setLanguage] = useState('cpp');
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [testResults, setTestResults] = useState<any[]>([]);
    const [submitResult, setSubmitResult] = useState<any>(null);
    const [consoleTab, setConsoleTab] = useState<'testcases' | 'result'>('testcases');
    const [activeTestCaseId, setActiveTestCaseId] = useState(0);

    // Console UI State
    const [isConsoleOpen, setIsConsoleOpen] = useState(false);
    const [consoleHeight, setConsoleHeight] = useState('40%');
    const [isDragging, setIsDragging] = useState(false);

    // Timer & Status
    const [timeLeft, setTimeLeft] = useState('00:00');
    const [loading, setLoading] = useState(true);
    const [solvedProblems, setSolvedProblems] = useState<Set<number>>(new Set());

    // Proctoring State
    const [warnings, setWarnings] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showStartOverlay, setShowStartOverlay] = useState(true);
    const [showWarningOverlay, setShowWarningOverlay] = useState(false);
    const [showFinishConfirmation, setShowFinishConfirmation] = useState(false);
    const [disqualified, setDisqualified] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const MAX_WARNINGS = 3;

    const languages = [
        { value: 'cpp', label: 'C++' },
        { value: 'javascript', label: 'JavaScript' },
        { value: 'python', label: 'Python' },
        { value: 'java', label: 'Java' },
        { value: 'c', label: 'C' }
    ];

    // -- Proctoring Logic --
    useEffect(() => {
        if (showStartOverlay || disqualified || isFinished) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                incrementWarning("Tab switching is not allowed!");
            }
        };

        const handleBlur = () => {
            // incrementWarning("Don't switch windows!");
        };

        const handleFullScreenChange = () => {
            if (isFinished) return; // Skip check if finished

            if (!document.fullscreenElement) {
                setIsFullScreen(false);
                // Only show warning overlay if not already disqualified
                if (!disqualified) {
                    incrementWarning("Exiting full screen is a violation!");
                    setShowWarningOverlay(true);
                }
            } else {
                setIsFullScreen(true);
                setShowWarningOverlay(false);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);
        document.addEventListener("fullscreenchange", handleFullScreenChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
            document.removeEventListener("fullscreenchange", handleFullScreenChange);
        };
    }, [showStartOverlay, disqualified, warnings, isFinished]);

    const incrementWarning = (reason: string) => {
        if (warnings >= MAX_WARNINGS || isFinished) return;

        const newWarnings = warnings + 1;
        setWarnings(newWarnings);

        if (newWarnings >= MAX_WARNINGS) {
            handleDisqualification();
        }
    };

    const handleDisqualification = () => {
        setDisqualified(true);
        setShowWarningOverlay(false); // Hide warning overlay if disqualified
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => { });
        }
    };

    const enterFullScreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen()
                .then(() => {
                    setIsFullScreen(true);
                    setShowStartOverlay(false);
                })
                .catch(err => {
                    alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
        }
    };

    const handleResumeExam = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen()
                .then(() => {
                    setIsFullScreen(true);
                    setShowWarningOverlay(false);
                })
                .catch(err => {
                    console.error("Error attempting to enable full-screen mode:", err);
                    alert("Could not re-enable full screen. Please try again.");
                });
        }
    };

    // -- Data Fetching --
    const fetchRoomData = async () => {
        try {
            const data = await roomAPI.getRoom(roomId!);
            setRoom(data.room);
            setParticipants(data.participants);

            if (data.problems.length !== problemList.length) {
                setProblemList(data.problems);
            }

            if (data.room.status === 'active' && data.room.start_time && data.room.expires_at) {
                const expires = new Date(data.room.expires_at).getTime();
                const now = Date.now();
                const diff = expires - now;
                if (diff <= 0) {
                    setTimeLeft("00:00");
                } else {
                    const m = Math.floor(diff / 60000);
                    const s = Math.floor((diff % 60000) / 1000);
                    setTimeLeft(`${m}:${s < 10 ? '0' : ''}${s}`);
                }
            } else if (data.room.status === 'completed') {
                setTimeLeft("00:00");
            }
        } catch (error) {
            console.error('Error fetching room:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!roomId) return;
        fetchRoomData();
        const interval = setInterval(fetchRoomData, 5000);
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                const [m, s] = prev.split(':').map(Number);
                if (m === 0 && s === 0) return "00:00";
                let newS = s - 1;
                let newM = m;
                if (newS < 0) { newS = 59; newM -= 1; }
                if (newM < 0) return "00:00";
                return `${newM}:${newS < 10 ? '0' : ''}${newS}`;
            });
        }, 1000);
        return () => { clearInterval(interval); clearInterval(timer); };
    }, [roomId]);

    // Fetch Full Problem
    useEffect(() => {
        const loadProblemDetails = async () => {
            if (problemList.length === 0) return;
            const simpleProb = problemList[currentProblemIndex];

            try {
                const details = await problemsAPI.getProblemById(simpleProb.id.toString());
                const completeProblem = { ...simpleProb, ...details };
                setFullProblem(completeProblem);

                if (completeProblem.sample_test_cases && completeProblem.sample_test_cases.length > 0) {
                    setTestResults(completeProblem.sample_test_cases.map((tc: any) => ({
                        input: tc.input,
                        expected_output: tc.expected_output,
                        output: null,
                        passed: null,
                        status: 'idle'
                    })));
                    setActiveTestCaseId(0);
                } else {
                    setTestResults([
                        { input: '// See description', expected_output: '// See description', status: 'idle' },
                        { input: '// See description', expected_output: '// See description', status: 'idle' }
                    ]);
                    setActiveTestCaseId(0);
                }

                fetchTemplate(simpleProb.id, language);
                setSubmitResult(null);
                setConsoleTab('testcases');

            } catch (err) {
                console.error("Failed to load problem details", err);
            }
        };
        loadProblemDetails();
    }, [currentProblemIndex, problemList.length]);

    useEffect(() => {
        if (!fullProblem) return;
        fetchTemplate(fullProblem.id, language);
    }, [language]);

    const fetchTemplate = async (pid: number, lang: string) => {
        try {
            const template = await problemsAPI.getProblemTemplate(pid.toString(), lang);
            setCode(template.starter_code);
        } catch {
            const defaultCode: any = {
                javascript: '// Write your JavaScript code here',
                python: '# Write your Python code here',
                java: '// Write your Java code here',
                cpp: '// Write your C++ code here',
                c: '// Write your C code here'
            };
            setCode(defaultCode[lang] || '// Write your code here');
        }
    };

    const handleFinishRequest = () => {
        setShowFinishConfirmation(true);
    };

    const completeExam = async () => {
        setShowFinishConfirmation(false);
        setIsFinished(true); // Disable proctoring checks immediately

        // Exit Full Screen
        if (document.fullscreenElement) {
            try {
                await document.exitFullscreen();
            } catch (err) {
                console.error("Error exiting full screen:", err);
            }
        }
        setIsFullScreen(false);
        setShowWarningOverlay(false); // Ensure warning overlay is hidden
        setShowLeaderboard(true);
    };

    // Auto-finish when time is up
    useEffect(() => {
        if (timeLeft === "00:00" && !loading && room && !showLeaderboard && !isFinished) {
            completeExam();
        }
    }, [timeLeft, loading, room]);

    const handleRun = async () => {
        if (!fullProblem) return;
        setIsRunning(true);
        setConsoleTab('testcases');
        setIsConsoleOpen(true);
        setTestResults(prev => prev.map(t => ({ ...t, status: 'running' })));

        try {
            const res = await roomAPI.runCode({
                code,
                language,
                problemId: fullProblem.id
            });

            if (res.results && Array.isArray(res.results)) {
                setTestResults(prev => {
                    return res.results.map((r: any, i: number) => {
                        const existing = prev[i] || {};
                        // Safely calculate passed status
                        const passed = r.passed !== undefined ? r.passed : (String(r.output || r.stdout || '').trim() === String(existing.expected_output).trim());
                        return {
                            ...existing,
                            ...r,
                            // Preserve critical fields if backend omits them
                            input: existing.input || r.input,
                            expected_output: existing.expected_output || r.expected_output,
                            passed,
                            status: 'done'
                        };
                    });
                });
                if (res.results.length > 0 && activeTestCaseId >= res.results.length) {
                    setActiveTestCaseId(0);
                }
            }
        } catch (error: any) {
            alert('Run failed: ' + error.message);
            setTestResults(prev => prev.map(t => ({ ...t, status: 'error', error: error.message })));
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        if (!fullProblem) return;
        setIsSubmitting(true);
        setConsoleTab('result');
        setIsConsoleOpen(true);
        try {
            const res = await roomAPI.submitSolution({
                roomId: Number(roomId),
                problemId: fullProblem.id,
                code,
                language
            });
            setSubmitResult(res);
            if (res.verdict === 'AC') {
                setSolvedProblems(prev => new Set(prev).add(fullProblem.id));
                fetchRoomData();
            }
        } catch (error: any) {
            setSubmitResult({ verdict: 'Error', message: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div></div>;
    if (!room) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-red-500">Room not found</div>;

    if (disqualified) {
        return (
            <div className="min-h-screen bg-red-950 flex items-center justify-center flex-col p-6 text-center">
                <AlertOctagon className="w-24 h-24 text-red-500 mb-6" />
                <h1 className="text-4xl font-bold text-white mb-4">Disqualified</h1>
                <p className="text-red-200 text-lg max-w-md mb-8">
                    You have exceeded the maximum number of warnings ({MAX_WARNINGS}) for proctoring violations. You have been removed from the arena.
                </p>
                <button
                    onClick={() => navigate('/hive-battles')}
                    className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-red-900/40"
                >
                    Return to Lobby
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen flex bg-gray-900 text-white overflow-hidden font-sans relative">
            {/* Start Overlay */}
            {showStartOverlay && (
                <div className="absolute inset-0 z-[100] bg-gray-900/95 flex items-center justify-center flex-col p-8 backdrop-blur-sm">
                    <div className="max-w-2xl text-center space-y-6">
                        <Trophy className="w-20 h-20 text-amber-400 mx-auto" />
                        <h1 className="text-4xl font-bold text-white">Ready to Battle?</h1>
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-left space-y-4 shadow-xl">
                            <h3 className="font-bold text-amber-500 text-lg flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" /> Proctoring Rules
                            </h3>
                            <ul className="space-y-2 text-gray-300">
                                <li className="flex items-start gap-2">1. The exam will run in <b>Full Screen</b> mode.</li>
                                <li className="flex items-start gap-2">2. Switching tabs or exiting full screen will issue a <b>Warning</b>.</li>
                                <li className="flex items-start gap-2">3. You have <b>3 Warnings</b>. Exceeding this limit will cause <b>Issue Disqualification</b>.</li>
                                <li className="flex items-start gap-2 text-red-300">4. Do not close the browser window.</li>
                            </ul>
                        </div>
                        <button
                            onClick={enterFullScreen}
                            className="px-10 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-xl rounded-full shadow-lg shadow-amber-500/20 transition-transform hover:scale-105 active:scale-95"
                        >
                            I Understand, Start Exam
                        </button>
                    </div>
                </div>
            )}

            {/* Finish Confirmation Overlay */}
            {showFinishConfirmation && (
                <div className="absolute inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 transition-all animate-in fade-in">
                    <div className="max-w-md w-full bg-gray-900 border border-amber-500/30 rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-amber-500/5" />
                        <div className="relative z-10 space-y-6">
                            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-amber-500/40">
                                <CheckCircle className="w-8 h-8 text-amber-500" />
                            </div>

                            <h2 className="text-2xl font-bold text-white">Finish Exam?</h2>
                            <p className="text-gray-300">
                                Are you sure you want to finish the exam?
                                <br />
                                This action cannot be undone.
                            </p>

                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={() => setShowFinishConfirmation(false)}
                                    className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors border border-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={completeExam}
                                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold transition-colors shadow-lg shadow-amber-500/20"
                                >
                                    Yes, Finish
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Warning Blocking Overlay */}
            {showWarningOverlay && (
                <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 transition-all duration-300 animate-in fade-in">
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
                                <span className="text-red-500">{warnings}</span>
                                <span className="text-gray-600">/</span>
                                <span className="text-gray-400">{MAX_WARNINGS}</span>
                                <span className="text-sm font-normal text-gray-500 ml-2 self-end mb-1">Warnings Used</span>
                            </div>

                            <p className="text-sm text-gray-400 mb-8">
                                Please return to the exam environment immediately.
                                <br />Further violations will result in disqualification.
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

            {/* Sidebar */}
            <div className="w-72 bg-gray-950 border-r border-gray-800 flex flex-col shrink-0 transition-width">
                <div className="p-4 border-b border-gray-800 space-y-4">
                    <h2 className="font-bold text-lg text-white flex items-center gap-2">
                        <List className="w-5 h-5 text-amber-400" />
                        Arena Problems
                    </h2>
                    <div>
                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-1">
                            <span>Solved</span>
                            <span>{solvedProblems.size} / {problemList.length}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 transition-all duration-500"
                                style={{ width: `${problemList.length > 0 ? (solvedProblems.size / problemList.length) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {problemList.map((p, idx) => {
                        const isSolved = solvedProblems.has(p.id);
                        return (
                            <button
                                key={p.id}
                                onClick={() => setCurrentProblemIndex(idx)}
                                className={`w-full text-left px-4 py-4 border-b border-gray-800 transition-all flex items-start justify-between group ${idx === currentProblemIndex
                                    ? 'bg-amber-500/10 border-l-4 border-l-amber-500'
                                    : 'hover:bg-gray-900 border-l-4 border-l-transparent'
                                    }`}
                            >
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${isSolved ? 'bg-green-500 text-black' :
                                        idx === currentProblemIndex ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-400'
                                        }`}>
                                        {isSolved ? <CheckCircle className="w-3.5 h-3.5" /> : idx + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <div className={`text-sm font-semibold truncate transition-colors ${idx === currentProblemIndex ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
                                            }`}>
                                            {p.title}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${p.difficulty === 'Easy' ? 'text-green-400 bg-green-400/10' :
                                                p.difficulty === 'Medium' ? 'text-yellow-400 bg-yellow-400/10' : 'text-red-400 bg-red-400/10'
                                                }`}>
                                                {p.difficulty}
                                            </span>
                                            <span className="text-gray-500 text-xs">• {p.points || 0} pts</span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
                <div className="p-4 border-t border-gray-800 bg-gray-900/50 space-y-2">
                    <button
                        onClick={() => setShowLeaderboard(true)}
                        className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-amber-400 border border-amber-500/30 rounded flex items-center justify-center gap-2 transition-all font-medium text-sm"
                    >
                        <ChartBar className="w-4 h-4" /> Live Leaderboard
                    </button>

                    <button
                        onClick={handleFinishRequest}
                        className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-sm transition-colors shadow-lg shadow-red-900/20"
                    >
                        Finish Exam
                    </button>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-6 min-w-0">
                        <div className="flex flex-col">
                            <h1 className="font-semibold text-lg truncate max-w-sm">{fullProblem?.title || 'Loading...'}</h1>
                        </div>
                        {fullProblem && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${fullProblem.difficulty === 'Easy' ? 'text-green-400 bg-green-400/10' :
                                fullProblem.difficulty === 'Medium' ? 'text-amber-400 bg-amber-400/10' :
                                    'text-red-400 bg-red-400/10'
                                }`}>
                                {fullProblem.difficulty} • {fullProblem.points || 0} pts
                            </span>
                        )}
                        <div className="flex items-center gap-2 text-gray-300 bg-gray-800 px-3 py-1 rounded-full text-sm font-mono border border-gray-700">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{timeLeft}</span>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border ${warnings > 0 ? 'text-red-400 bg-red-900/20 border-red-500/30 animate-pulse' : 'text-green-400 bg-green-900/10 border-green-500/20'
                            }`}>
                            <AlertTriangle className="w-4 h-4" />
                            <span>Warnings: {warnings}/{MAX_WARNINGS}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleRun}
                            disabled={isRunning || !fullProblem}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:opacity-50 text-white px-6 py-1.5 rounded-lg font-bold transition-colors text-sm shadow-lg shadow-green-900/20"
                        >
                            {isRunning ? 'Running...' : <><Play className="w-4 h-4 fill-current" /> Run</>}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !fullProblem}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white px-6 py-1.5 rounded-lg font-bold transition-colors text-sm shadow-lg shadow-blue-900/20"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-gray-800 hover:bg-gray-700 text-white text-sm py-1.5 px-3 rounded-lg border border-gray-700 outline-none focus:border-amber-400 transition-colors min-w-[100px]"
                        >
                            {languages.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden relative">
                    {/* @ts-ignore */}
                    <SplitPane split="vertical" minSize={300} defaultSize="40%" primary="first" pane1Style={{ overflow: 'hidden' }} pane2Style={{ overflow: 'hidden' }}>
                        <div className="h-full overflow-y-auto p-6 custom-scrollbar bg-gray-900">
                            {fullProblem ? (
                                <div className="max-w-3xl mx-auto space-y-6">
                                    <div className="prose prose-invert max-w-none">
                                        <div dangerouslySetInnerHTML={{ __html: fullProblem.description }} />
                                    </div>

                                    {/* Sample Test Cases (Examples) */}
                                    {fullProblem.sample_test_cases && fullProblem.sample_test_cases.length > 0 && (
                                        <div className="mt-8 space-y-4">
                                            <h3 className="text-xl font-semibold text-white mb-4">Examples</h3>
                                            {fullProblem.sample_test_cases.map((testCase: any, index: number) => (
                                                <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                                    <h4 className="text-lg font-medium text-amber-400 mb-3">Example {index + 1}:</h4>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <div className="text-sm text-gray-400 mb-1">Input:</div>
                                                            <div className="bg-gray-900 rounded p-3 font-mono text-sm text-gray-200 border border-gray-600 whitespace-pre-wrap">
                                                                {testCase.input}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm text-gray-400 mb-1">Output:</div>
                                                            <div className="bg-gray-900 rounded p-3 font-mono text-sm text-gray-200 border border-gray-600 whitespace-pre-wrap">
                                                                {testCase.expected_output}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Constraints */}
                                    {fullProblem.constraints && (
                                        <div className="mt-8">
                                            <h3 className="text-xl font-semibold text-white mb-4">Constraints</h3>
                                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                                <ul className="list-disc list-inside space-y-2 text-gray-300">
                                                    {fullProblem.constraints.split('\n').map((constraint: string, index: number) => (
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
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">Select a problem...</div>
                            )}
                        </div>

                        {/* Explicit style and size management for Inner SplitPane */}
                        <div className="flex flex-col h-full w-full relative overflow-hidden">
                            <div className="flex-1 overflow-hidden relative w-full bg-[#1e1e1e]">
                                <Editor
                                    height="100%"
                                    language={language}
                                    value={code}
                                    onChange={(val) => setCode(val || '')}
                                    theme="vs-dark"
                                    options={{
                                        fontSize: 14,
                                        fontFamily: "'Fira Code', 'Consolas', monospace",
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        padding: { top: 16 }
                                    }}
                                />
                            </div>

                            <div
                                className="bg-gray-950 border-t border-gray-800 flex flex-col shrink-0 transition-all duration-300 ease-in-out"
                                style={{ height: isConsoleOpen ? consoleHeight : '44px' }}
                            >
                                <button
                                    className="flex border-b border-gray-800 bg-gray-950 px-2 min-h-[44px] shrink-0 items-center justify-between w-full hover:bg-gray-900 transition-colors"
                                    onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                                >
                                    <div className="flex items-center">
                                        <div className="flex items-center text-gray-400 text-xs font-bold uppercase tracking-wide px-3 gap-2">
                                            Test Cases
                                        </div>
                                        <div className="w-px h-4 bg-gray-800 mx-2"></div>
                                        <div
                                            onClick={(e) => { e.stopPropagation(); setConsoleTab('testcases'); setIsConsoleOpen(true); }}
                                            className={`px-3 py-2 text-xs font-bold transition-colors cursor-pointer rounded hover:bg-gray-800 ${consoleTab === 'testcases' ? 'text-amber-500' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            Console
                                        </div>
                                        <div
                                            onClick={(e) => { e.stopPropagation(); setConsoleTab('result'); setIsConsoleOpen(true); }}
                                            className={`px-3 py-2 text-xs font-bold transition-colors cursor-pointer rounded hover:bg-gray-800 ${consoleTab === 'result' ? 'text-amber-500' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            Result
                                        </div>
                                    </div>
                                    <div className="pr-4 text-gray-500">
                                        {isConsoleOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                                    </div>
                                </button>

                                {isConsoleOpen && (
                                    <div className="flex-grow overflow-hidden flex flex-col relative bg-gray-950">
                                        {consoleTab === 'testcases' ? (
                                            <div key="testcases-panel" className="flex flex-col h-full animate-in slide-in-from-bottom duration-300 fade-in bg-gray-950">
                                                <div className="flex gap-2 p-3 bg-gray-900/50 border-b border-gray-800 overflow-x-auto shrink-0">
                                                    {testResults.map((tc, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => setActiveTestCaseId(idx)}
                                                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${idx === activeTestCaseId
                                                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30 shadow-sm'
                                                                : 'bg-gray-800 text-gray-400 border border-transparent hover:bg-gray-700'
                                                                }`}
                                                        >
                                                            Case {idx + 1}
                                                            {tc.status === 'running' && (
                                                                <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                                            )}
                                                            {tc.status === 'done' && (
                                                                tc.passed
                                                                    ? <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                                                    : <XCircle className="w-3.5 h-3.5 text-red-500" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="flex-grow p-4 overflow-y-auto custom-scrollbar bg-gray-950">
                                                    {testResults.length > 0 && testResults[activeTestCaseId] ? (
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                                                                <span className="text-gray-400 font-medium text-sm">Status:</span>
                                                                <span className={`font-bold text-sm flex items-center gap-2 ${testResults[activeTestCaseId].status === 'running' ? 'text-amber-500' :
                                                                    testResults[activeTestCaseId].status === 'done' ? (testResults[activeTestCaseId].passed ? 'text-green-500' : 'text-red-500') : 'text-gray-500'
                                                                    }`}>
                                                                    {testResults[activeTestCaseId].status === 'running' && <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>}
                                                                    {testResults[activeTestCaseId].status === 'running' ? 'Running...' :
                                                                        testResults[activeTestCaseId].status === 'done' ? (testResults[activeTestCaseId].passed ? 'Passed' : 'Failed') : 'Ready'}
                                                                </span>
                                                            </div>

                                                            <div>
                                                                <div className="text-gray-500 text-xs font-bold mb-2 uppercase tracking-wide">Input</div>
                                                                <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg text-gray-300 font-mono text-sm whitespace-pre-wrap">
                                                                    {testResults[activeTestCaseId].input}
                                                                </div>
                                                            </div>

                                                            {(testResults[activeTestCaseId].status === 'done' || testResults[activeTestCaseId].status === 'running') && (
                                                                <>
                                                                    <div>
                                                                        <div className="text-gray-500 text-xs font-bold mb-2 uppercase tracking-wide">Expected Output</div>
                                                                        <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg text-green-400/80 font-mono text-sm whitespace-pre-wrap">
                                                                            {testResults[activeTestCaseId].expected_output}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-gray-500 text-xs font-bold mb-2 uppercase tracking-wide flex justify-between">
                                                                            <span>Your Output</span>
                                                                        </div>
                                                                        <div className={`bg-gray-900 border p-3 rounded-lg font-mono text-sm whitespace-pre-wrap ${testResults[activeTestCaseId].status === 'running' ? 'border-gray-800 text-gray-500 italic' :
                                                                            testResults[activeTestCaseId].passed ? 'border-green-900/50 text-gray-300' : 'border-red-900/50 text-red-300'
                                                                            }`}>
                                                                            {testResults[activeTestCaseId].status === 'running' ? 'Running...' :
                                                                                (testResults[activeTestCaseId].output || testResults[activeTestCaseId].stdout || testResults[activeTestCaseId].error || <span className="italic text-gray-600">No output</span>)}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center text-gray-600 mt-10 italic">
                                                            {testResults.length === 0 ? "No sample test cases available for this problem." : "Select a test case."}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div key="result-panel" className="flex items-center justify-center h-full p-4 animate-in slide-in-from-bottom duration-300 fade-in bg-gray-950">
                                                {submitResult ? (
                                                    <div className="text-center">
                                                        <div className={`text-4xl font-bold mb-3 ${submitResult.verdict === 'AC' ? 'text-green-500' :
                                                            submitResult.verdict === 'WA' ? 'text-red-500' : 'text-amber-500'
                                                            }`}>
                                                            {submitResult.verdict === 'AC' ? 'Accepted' :
                                                                submitResult.verdict === 'WA' ? 'Wrong Answer' : submitResult.verdict}
                                                        </div>
                                                        <div className="text-gray-400 mb-6 bg-gray-900 px-6 py-3 rounded-lg border border-gray-800">
                                                            {submitResult.message}
                                                        </div>
                                                        <button onClick={() => setConsoleTab('testcases')} className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded text-amber-500 font-bold transition-colors">
                                                            Back to Test Cases
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-600 italic flex flex-col items-center">
                                                        <Trophy className="w-12 h-12 mb-2 opacity-20" />
                                                        Submit your solution to see the verdict.
                                                    </div>
                                                )}
                                            </div>
                                        )
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                    </SplitPane>
                </div>
            </div>

            {/* Leaderboard Modal */}
            {showLeaderboard && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 transition-all animate-in fade-in">
                    <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-amber-500" /> Live Leaderboard
                            </h2>
                            <button
                                onClick={() => {
                                    setShowLeaderboard(false);
                                    if (isFinished) navigate('/hive-battles');
                                }}
                                className="text-gray-400 hover:text-white"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {participants.map((p, idx) => (
                                <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-800">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg relative overflow-hidden
                                        ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                                            idx === 1 ? 'bg-gray-400/20 text-gray-400 border border-gray-400/30' :
                                                idx === 2 ? 'bg-orange-700/20 text-orange-600 border border-orange-700/30' : 'bg-gray-700 text-gray-400'}
                                   `}>
                                        {p.avatar_url ? (
                                            <img
                                                src={p.avatar_url.startsWith('http') ? p.avatar_url : `http://localhost:3001${p.avatar_url}`}
                                                alt={p.username}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.parentElement!.innerText = String(idx + 1);
                                                    e.currentTarget.parentElement!.classList.add('flex', 'items-center', 'justify-center');
                                                }}
                                            />
                                        ) : (
                                            idx + 1
                                        )}
                                        {idx === 0 && <Trophy className="absolute -top-4 -right-2 w-5 h-5 text-yellow-500 fill-current drop-shadow-md z-10" />}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="font-bold text-white text-lg">{p.username}</div>
                                        <div className="text-sm text-gray-500">
                                            Time: {Math.floor(p.time_taken / 60)}m {p.time_taken % 60}s
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black font-mono text-amber-500">{p.score}</div>
                                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Points</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default RoomArena;
