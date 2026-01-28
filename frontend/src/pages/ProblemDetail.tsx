import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { ArrowLeft, Play, Terminal, Check } from 'lucide-react';
import { problemsAPI, submitAPI, submissionsAPI } from '../services/api';
import SubmissionResultModal from '../components/SubmissionResultModal';
import SolutionModal from '../components/SolutionModal';
import SubmissionsModal from '../components/SubmissionsModal';

interface Problem {
    id: number;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    topics: { name: string; slug: string }[];
    sample_test_cases?: { input: string; expected_output: string }[];
    constraints?: string;
    solved?: boolean;
}

const ProblemDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    const [problem, setProblem] = useState<Problem | null>(null);
    const [loading, setLoading] = useState(true);

    // Editors State
    const [code, setCode] = useState<string>('// Loading...');
    const [language, setLanguage] = useState<string>('cpp');
    const [codeByLanguage, setCodeByLanguage] = useState<{ [key: string]: string }>({}); // Store code per language
    const [testResults, setTestResults] = useState<{ [key: number]: { actual: string; verdict: string; passed: boolean } }>({});
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submissionResult, setSubmissionResult] = useState<{ verdict: string; message: string } | null>(null);
    const [showSubmissionModal, setShowSubmissionModal] = useState<boolean>(false);

    // Submissions Modal State
    const [showSubmissionsModal, setShowSubmissionsModal] = useState<boolean>(false);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [submissionsLoading, setSubmissionsLoading] = useState<boolean>(false);

    // Layout State
    const [splitPosition, setSplitPosition] = useState<number>(50); // percentage
    const [testCaseHeight, setTestCaseHeight] = useState<number>(33); // percentage of right panel
    const [selectedTestCase, setSelectedTestCase] = useState<number>(0); // selected test case index

    // Boilerplate code...
    const boilerplateCode = {
        c: '#include <stdio.h>\n\nint main() {\n   \n // write your code here \n  \n  return 0;\n}',
        cpp: '#include <iostream>\nusing namespace std;\nint main() {\n    \n // write your code here \n \n    return 0;\n}',
        python: 'print("Hello, World!")',
        javascript: 'console.log("Hello, World!");',
        java: 'public class Main {\n    public static void main(String[] args) {\n \t// write your code here \n    }\n}'
    };

    const languages = [
        { value: 'c', label: 'C' },
        { value: 'cpp', label: 'C++' },
        { value: 'python', label: 'Python' },
        { value: 'java', label: 'Java' },
        { value: 'javascript', label: 'JavaScript' }
    ];

    const fetchStarterCode = async (lang: string) => {
        if (!problem) return;

        // If we already have code for this language in memory, use it
        if (codeByLanguage[lang]) {
            setCode(codeByLanguage[lang]);
            return;
        }

        try {
            const data = await problemsAPI.getProblemTemplate(problem.id.toString(), lang);
            setCode(data.starter_code);
            // Optionally save the fresh starter code to memory too, so we don't re-fetch even if they type nothing
            setCodeByLanguage(prev => ({ ...prev, [lang]: data.starter_code }));
        } catch (error) {
            console.error('Error fetching starter code:', error);
            // Fallback to boilerplate if API fails
            const fallback = boilerplateCode[lang as keyof typeof boilerplateCode] || '';
            setCode(fallback);
            setCodeByLanguage(prev => ({ ...prev, [lang]: fallback }));
        }
    };

    useEffect(() => {
        const fetchProblem = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await problemsAPI.getProblemById(id);
                setProblem(data);
                // Reset codeByLanguage when problem changes?
                // Yes, typically we want fresh start for a new problem unless we persist by problemId too.
                // For now, in-memory per session means reset.
                setCodeByLanguage({});

                // We'll let the effect below handle fetching the starter code for the default language.
            } catch (error) {
                console.error('Error fetching problem:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProblem();
    }, [id]);

    useEffect(() => {
        // Fetch starter code (or restore from memory) when language changes
        if (problem) {
            fetchStarterCode(language);
        }
    }, [language, problem]);


    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLanguage = e.target.value;

        // 1. Save current code to state before switching
        setCodeByLanguage(prev => ({
            ...prev,
            [language]: code
        }));

        // 2. Switch language (useEffect will trigger fetchStarterCode which checks memory)
        setLanguage(newLanguage);
    };

    // Solution Modal State
    const [showSolutionModal, setShowSolutionModal] = useState(false);
    const [solutionLanguage, setSolutionLanguage] = useState<string>('cpp'); // Default solution language
    const [solutions, setSolutions] = useState<any[]>([]);
    const [solutionLoading, setSolutionLoading] = useState(false);

    // Fetch solutions when modal opens or language changes
    useEffect(() => {
        const fetchSolutions = async () => {
            if (!problem || !showSolutionModal) return;

            try {
                setSolutionLoading(true);
                const data = await problemsAPI.getProblemSolutions(problem.id.toString(), solutionLanguage);
                setSolutions(data);
            } catch (error) {
                console.error('Error fetching solutions:', error);
                setSolutions([]);
            } finally {
                setSolutionLoading(false);
            }
        };

        fetchSolutions();
    }, [showSolutionModal, solutionLanguage, problem]);

    // Fetch Submissions
    useEffect(() => {
        const fetchSubmissions = async () => {
            if (!problem || !showSubmissionsModal) return;
            try {
                setSubmissionsLoading(true);
                const data = await submissionsAPI.getProblemSubmissions(problem.id.toString());
                setSubmissions(data);
            } catch (error) {
                console.error('Error fetching submissions:', error);
            } finally {
                setSubmissionsLoading(false);
            }
        };
        fetchSubmissions();
    }, [showSubmissionsModal, problem]);

    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const decorationsRef = useRef<string[]>([]);

    const handleEditorDidMount = (editor: any, monaco: any) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
    };

    const handleRun = async () => {
        if (!problem?.sample_test_cases || problem.sample_test_cases.length === 0) {
            return;
        }

        // Run against sample test cases
        setIsRunning(true);
        setTestResults({});

        // Clear editor markers and decorations
        if (monacoRef.current && editorRef.current) {
            const model = editorRef.current.getModel();
            monacoRef.current.editor.setModelMarkers(model, 'owner', []);
            decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
        }

        const newResults: { [key: number]: { actual: string; verdict: string; passed: boolean } } = {};

        for (let i = 0; i < problem.sample_test_cases.length; i++) {
            const testCase = problem.sample_test_cases[i];
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
                        problem_id: problem.id,
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
                    // Handle different error types
                    const error = data.error || {};
                    let verdict = error.type || 'RUNTIME_ERROR';
                    let errorMessage = error.message || data.error || 'Unknown error';

                    // Map legacy error messages or backend types
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

                        // Set Markers (Squiggly)
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

                        // Set Decorations (Background)
                        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, [
                            {
                                range: new monacoRef.current.Range(error.line, 1, error.line, 1),
                                options: {
                                    isWholeLine: true,
                                    className: 'error-line-highlight',
                                    glyphMarginClassName: 'error-glyph-margin'
                                }
                            }
                        ]);

                        // Reveal line
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
        if (!problem) return;

        setIsSubmitting(true);
        setSubmissionResult(null);

        try {
            const result: any = await submitAPI.submitCode(code, language, problem.id);
            setSubmissionResult(result);
            setShowSubmissionModal(true);

            if (result.verdict === 'accepted') {
                setProblem(prev => prev ? { ...prev, solved: true } : null);
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

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = splitPosition;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX;
            // Convert pixel delta to percentage
            const deltaPercent = (deltaX / window.innerWidth) * 100;
            const newWidth = Math.max(20, Math.min(80, startWidth + deltaPercent));
            setSplitPosition(newWidth);
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
            // Convert pixel delta to percentage of right panel height
            const rightPanelHeight = window.innerHeight - 56; // Subtract top bar height
            const deltaPercent = (deltaY / rightPanelHeight) * 100;
            const newHeight = Math.max(10, Math.min(90, startHeight - deltaPercent));
            setTestCaseHeight(newHeight);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white gap-4">
                <h1 className="text-2xl">Problem not found</h1>
                <button onClick={() => navigate('/explore')} className="text-amber-400 hover:underline">
                    Back to Explore
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
            {/* Top Bar */}
            <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center px-4 shrink-0 z-10">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            const state = location.state as { from?: string };
                            if (state?.from) {
                                navigate(state.from);
                                return;
                            }
                            const topic = searchParams.get('topic');
                            navigate(topic ? `/problems?topic=${topic}` : '/problems');
                        }}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <h1 className="font-semibold text-lg max-w-[300px] truncate">{problem.title}</h1>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${problem.difficulty === 'Easy' ? 'text-green-400 bg-green-400/10' :
                            problem.difficulty === 'Medium' ? 'text-amber-400 bg-amber-400/10' :
                                'text-red-400 bg-red-400/10'
                            }`}>
                            {problem.difficulty}
                        </span>
                    </div>
                </div>

                {/* Center Section */}
                <div className="flex-1 flex justify-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-green-700 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg font-medium transition-colors text-sm"
                        >
                            {isRunning ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Running...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 fill-current" />
                                    Run
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-700 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg font-medium transition-colors text-sm"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit'
                            )}
                        </button>

                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    <select
                        value={language}
                        onChange={handleLanguageChange}
                        className="bg-gray-800 hover:bg-gray-700 text-white text-sm py-1.5 px-3 rounded-lg border border-gray-700 outline-none focus:border-amber-400 transition-colors"
                    >
                        {languages.map((lang) => (
                            <option key={lang.value} value={lang.value}>{lang.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* Left Panel: Description */}
                <div
                    style={{ width: `${splitPosition}%` }}
                    className="h-full overflow-y-auto bg-gray-900 p-6 custom-scrollbar"
                >
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-bold">{problem.id}. {problem.title}</h2>
                                </div>
                                <div className='flex items-center gap-2'>
                                    {problem.solved && (
                                        <span className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full text-xs font-medium border border-green-400/20 transition-all animate-fade-in mr-2">
                                            <Check className="w-3 h-3" /> Solved
                                        </span>
                                    )}
                                    <button
                                        onClick={() => setShowSubmissionsModal(true)}
                                        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-1.5 rounded-lg font-medium transition-colors text-sm"
                                    >
                                        Submissions
                                    </button>
                                    <button
                                        onClick={() => setShowSolutionModal(true)}
                                        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-1.5 rounded-lg font-medium transition-colors text-sm"
                                    >
                                        Solution
                                    </button>
                                </div>
                            </div>
                            <div className="prose prose-invert max-w-none">
                                <p className="whitespace-pre-wrap leading-relaxed text-gray-300">
                                    {problem.description}
                                </p>
                            </div>

                            {/* Sample Test Cases */}
                            {problem.sample_test_cases && problem.sample_test_cases.length > 0 && (
                                <div className="mt-8 space-y-4">
                                    <h3 className="text-xl font-semibold text-white mb-4">Examples</h3>
                                    {problem.sample_test_cases!.map((testCase, index) => (
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
                            {problem.constraints && (
                                <div className="mt-8">
                                    <h3 className="text-xl font-semibold text-white mb-4">Constraints</h3>
                                    <div className="prose prose-invert max-w-none">
                                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                            <ul className="list-disc list-inside space-y-2 text-gray-300">
                                                {problem.constraints.split('\n').map((constraint, index) => (
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
                                </div>
                            )}
                        </div>

                        <div className="pt-6 border-t border-gray-800">
                            <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Topics</h3>
                            <div className="flex flex-wrap gap-2">
                                {problem.topics.map((topic, idx) => (
                                    <span
                                        key={idx}
                                        className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-gray-700"
                                    >
                                        {topic.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resizer */}
                <div
                    className="w-1.5 h-full bg-gray-800 hover:bg-amber-400/50 cursor-col-resize transition-colors shrink-0 z-20 flex items-center justify-center group"
                    onMouseDown={handleMouseDown}
                >
                    <div className="h-8 w-0.5 bg-gray-600 group-hover:bg-amber-400 rounded-full" />
                </div>

                {/* Right Panel: Editor & Test Cases */}
                <div
                    style={{ width: `${100 - splitPosition}%` }}
                    className="h-full flex flex-col bg-gray-900 border-l border-gray-800"
                >
                    {/* Editor */}
                    <div
                        style={{ height: `${100 - testCaseHeight}%` }}
                        className="min-h-0"
                    >
                        <Editor
                            height="100%"
                            language={language}
                            value={code}
                            onChange={(value) => setCode(value || '')}
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

                    {/* Horizontal Resizer */}
                    <div
                        className="h-1.5 w-full bg-gray-800 hover:bg-amber-400/50 cursor-row-resize transition-colors shrink-0 z-20 flex items-center justify-center group"
                        onMouseDown={handleMouseDownTestCase}
                    >
                        <div className="w-8 h-0.5 bg-gray-600 group-hover:bg-amber-400 rounded-full" />
                    </div>

                    {/* Test Cases */}
                    <div
                        style={{ height: `${testCaseHeight}%` }}
                        className="flex flex-col bg-gray-950"
                    >
                        <div className="flex items-center px-4 py-2 bg-gray-900 border-b border-gray-800 gap-2">
                            <Terminal className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-300">Test Cases</span>
                        </div>

                        {/* Test Case Tabs */}
                        {problem?.sample_test_cases && problem.sample_test_cases.length > 0 && (
                            <div className="flex border-b border-gray-800">
                                {problem.sample_test_cases.map((_, index) => (
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
                        )}

                        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                            {problem?.sample_test_cases && problem.sample_test_cases.length > 0 ? (
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Input:</div>
                                        <div className="bg-gray-900 rounded p-3 font-mono text-sm text-gray-200 border border-gray-600">
                                            {problem.sample_test_cases[selectedTestCase].input}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Expected Output:</div>
                                        <div className="bg-gray-900 rounded p-3 font-mono text-sm text-gray-200 border border-gray-600">
                                            {problem.sample_test_cases[selectedTestCase].expected_output}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Your Output:</div>
                                        <div className={`bg-gray-900 rounded p-3 font-mono text-sm border overflow-x-auto max-w-full ${testResults[selectedTestCase] ? (
                                            testResults[selectedTestCase].passed ? 'border-green-500 text-green-200' : 'border-red-500 text-red-200'
                                        ) : 'border-gray-600 text-gray-600 italic'
                                            }`}>
                                            <pre className="whitespace-pre-wrap break-words max-w-full">
                                                {testResults[selectedTestCase] ? testResults[selectedTestCase].actual : 'Run code to see output'}
                                            </pre>
                                        </div>
                                    </div>
                                    {testResults[selectedTestCase] && !testResults[selectedTestCase].passed && (
                                        <div className="text-sm font-medium text-red-400">
                                            {testResults[selectedTestCase].verdict.replace('_', ' ').toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-gray-600 italic">No test cases available</div>
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

            <SolutionModal
                isOpen={showSolutionModal}
                onClose={() => setShowSolutionModal(false)}
                solutions={solutions}
                loading={solutionLoading}
                selectedLanguage={solutionLanguage}
                onLanguageChange={setSolutionLanguage}
            />

            <SubmissionsModal
                isOpen={showSubmissionsModal}
                onClose={() => setShowSubmissionsModal(false)}
                submissions={submissions}
                loading={submissionsLoading}
            />
        </div>
    );
};

export default ProblemDetail;
