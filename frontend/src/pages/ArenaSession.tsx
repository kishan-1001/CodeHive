import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { ArrowLeft, Play, Terminal, Check, List, Clock } from 'lucide-react';
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
                    handleAutoSubmitAll();
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
    }, [session?.expires_at, isExpired, sessionProblems, drafts]); // dep on drafts/problems for auto-submit closure if needed

    // Editor State
    const [code, setCode] = useState<string>('// Loading...');
    const [language, setLanguage] = useState<string>('cpp');
    const [testResults, setTestResults] = useState<{ [key: number]: { actual: string; verdict: string; passed: boolean } }>({});
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
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
                // Ensure proper typing or mapping if needed
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

    // Auto Submit All
    const handleAutoSubmitAll = async () => {
        // Prevent multiple calls
        if (isSubmitting) return;
        setIsSubmitting(true);
        alert("Time's Up! Submitting all solutions...");

        for (const p of sessionProblems) {
            const codeToSubmit = drafts[p.id];
            if (!codeToSubmit) continue; // Skip if no code written

            // Determine language... simplistic assumption: single language for session? 
            // OR we store language in drafts too? 
            // For now, assume current 'language' state is used? 
            // FAILURE POINT: User might use different languages for different problems.
            // Drafts should ideally store {code, language}.
            // Simplification: We use the current selected language for everything or just what's in 'language'.
            // Given constraints, we'll try to submit with current 'language'. 
            // Ideally we'd map drafts to language.

            try {
                await arenaAPI.submitSolution({
                    code: codeToSubmit,
                    language: language, // Potential issue if they switched langs
                    problem_id: p.id,
                    session_id: session.id
                });
            } catch (e) {
                console.error(`Failed to auto-submit problem ${p.id}`, e);
            }
        }

        setIsSubmitting(false);
        navigate(`/arena/${sessionId}/summary`); // Or similar
    };

    // Modified Effect for Switching Problems (Handling Drafts)
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

                // Reset specific UI states
                setTestResults({});
                setSubmissionResult(null);

                // Code Loading Logic: Draft -> Template -> Fallback
                if (drafts[basicProblem.id]) {
                    setCode(drafts[basicProblem.id]);
                } else {
                    try {
                        const template = await problemsAPI.getProblemTemplate(basicProblem.id.toString(), language);
                        setCode(template.starter_code);
                        // Save initial template to draft strictly? No, only on edit.
                        // But to be safe for auto-submit "empty" or "template" code? 
                        // Let's NOT save template to draft to avoid auto-submitting untouched problems.
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
    }, [currentIndex, sessionProblems]); // Removed drafts and language dependencies to avoid flicker

    // Re-fetch template when language changes
    useEffect(() => {
        if (!currentProblem) return;
        const fetchTemplate = async () => {
            // Only fetch template if there's no draft for the current problem
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

    // Editor Change Handler wrapper
    const handleCodeChange = (value: string | undefined) => {
        const newCode = value || '';
        setCode(newCode);
        if (currentProblem) {
            setDrafts(prev => ({ ...prev, [currentProblem.id]: newCode }));
        }
    };


    // Handlers
    const handleRun = async () => {
        if (!currentProblem?.sample_test_cases || currentProblem.sample_test_cases.length === 0) {
            return;
        }

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

                    // Highlight line if available
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
            // Use Arena Submit API which likely updates session score too
            const result: any = await arenaAPI.submitSolution({
                code,
                language,
                problem_id: currentProblem.id,
                session_id: session.id
            });

            setSubmissionResult(result);
            setShowSubmissionModal(true);

            if (result.verdict === 'accepted') {
                // Update local session list to show checkmark
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

    // Resizers
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
            // approx height, simpler than Window calc
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

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
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
                    <button onClick={() => navigate('/contest')} className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm text-gray-400 transition-colors flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Exit Arena
                    </button>
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
            {submissionResult && (
                <SubmissionResultModal
                    isOpen={showSubmissionModal}
                    onClose={() => setShowSubmissionModal(false)}
                    verdict={submissionResult.verdict}
                    message={submissionResult.message}
                />
            )}
        </div>
    );
};

export default ArenaSession;
