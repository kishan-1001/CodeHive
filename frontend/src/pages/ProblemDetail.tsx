import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { ArrowLeft, Play, Terminal } from 'lucide-react';
import { problemsAPI } from '../services/api';

interface Problem {
    id: number;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    topics: { name: string; slug: string }[];
    sample_test_cases?: { input: string; expected_output: string }[];
}

const ProblemDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [problem, setProblem] = useState<Problem | null>(null);
    const [loading, setLoading] = useState(true);

    // Editor State
    const [code, setCode] = useState<string>('// Loading...');
    const [language, setLanguage] = useState<string>('cpp');
    const [output, setOutput] = useState<string>('');
    const [input, setInput] = useState<string>('');
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isReady, setIsReady] = useState<boolean>(false);
    const wsRef = useRef<WebSocket | null>(null);

    // Layout State
    const [splitPosition, setSplitPosition] = useState<number>(50); // percentage

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

    useEffect(() => {
        const fetchProblem = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await problemsAPI.getProblemById(id);
                setProblem(data);
            } catch (error) {
                console.error('Error fetching problem:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProblem();
    }, [id]);

    useEffect(() => {
        // Set boilerplate when language changes or initially
        setCode(boilerplateCode[language as keyof typeof boilerplateCode]);
    }, [language]);

    const handleRun = () => {
        if (wsRef.current) {
            wsRef.current.close();
        }

        wsRef.current = new WebSocket('ws://localhost:3000'); // Ensure this matches user's backend port setup

        wsRef.current.onopen = () => {
            setIsRunning(true);
            setIsReady(false);
            setOutput('');
            wsRef.current?.send(JSON.stringify({ type: 'run', code, language }));
        };

        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'output') {
                setOutput(prev => prev + data.data);
            } else if (data.type === 'error') {
                setOutput(prev => prev + 'Error: ' + data.data + '\n');
            } else if (data.type === 'ready') {
                setIsReady(true);
            } else if (data.type === 'end') {
                setIsRunning(false);
                setIsReady(false);
            }
        };

        wsRef.current.onclose = () => {
            setIsRunning(false);
        };

        wsRef.current.onerror = () => {
            setOutput('WebSocket connection failed. Make sure the backend server is running.\n');
            setIsRunning(false);
        };
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
                        onClick={() => navigate('/problems')}
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
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-lg font-medium transition-colors text-sm"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            Run
                        </button>
                        <button
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg font-medium transition-colors text-sm"
                        >
                            Submit
                        </button>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
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
                            <h2 className="text-2xl font-bold mb-4">{problem.title}</h2>
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

                {/* Right Panel: Editor & Output */}
                <div
                    style={{ width: `${100 - splitPosition}%` }}
                    className="h-full flex flex-col bg-gray-900 border-l border-gray-800"
                >
                    {/* Editor */}
                    <div className="flex-1 min-h-0">
                        <Editor
                            height="100%"
                            language={language}
                            value={code}
                            onChange={(value) => setCode(value || '')}
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

                    {/* Output / Terminal */}
                    <div className="h-1/3 border-t border-gray-800 flex flex-col bg-gray-950">
                        <div className="flex items-center px-4 py-2 bg-gray-900 border-b border-gray-800 gap-2">
                            <Terminal className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-300">Console</span>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto font-mono text-sm custom-scrollbar">
                            {/* Input Area */}
                            <div className="mb-4">
                                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Input</div>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && isRunning) {
                                            e.preventDefault();
                                            wsRef.current?.send(JSON.stringify({ type: 'input', data: input }));
                                            setInput('');
                                        }
                                    }}
                                    placeholder={isRunning ? "Program running... Type input & press Enter" : "Standard Input (stdin)..."}
                                    className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-gray-300 focus:outline-none focus:border-amber-500/50 transition-colors resize-none h-16"
                                />
                            </div>

                            {/* Output Area */}
                            <div>
                                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Output</div>
                                <div className={`whitespace-pre-wrap ${output ? 'text-gray-200' : 'text-gray-600 italic'}`}>
                                    {output || 'Run your code to see output...'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProblemDetail;
