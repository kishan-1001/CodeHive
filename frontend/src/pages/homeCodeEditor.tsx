import React, {useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
const HomeCodeEditor: React.FC = () => {
  const [code, setCode] = useState<string>('#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}');
  const [language, setLanguage] = useState<string>('cpp');
  const [output, setOutput] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [editorWidth, setEditorWidth] = useState<number>(50);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

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
    setCode(boilerplateCode[language as keyof typeof boilerplateCode]);
  }, [language]);

  const handleRun = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    wsRef.current = new WebSocket('ws://localhost:3000');

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

    wsRef.current.onerror = (error) => {
      setOutput('WebSocket connection failed. Make sure the backend server is running.\n');
      setIsRunning(false);
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = editorWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(30, Math.min(90, startWidth + (deltaX / window.innerWidth) * 100));
      setEditorWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div className="flex items-center p-4 bg-gray-800">
        <div className="flex-1 flex items-center">
          <img src="/logoeditor.gif" alt="Logo" className="mr-2 w-16 h-16" />
          <h1 className="text-xl font-bold animate-pulse">CodeHive Editor</h1>
        </div>
        <div className="flex-1 flex justify-center">
          <button
            onClick={handleRun}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full border border-gray-600 transition-colors"
          >
            ▶️ Run
          </button>
        </div>
        <div className="flex-1 flex justify-end">
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-800 hover:bg-gray-700 text-white p-2 pr-8 rounded-full border border-gray-600 transition-colors appearance-none"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-1 p-2">
        <div style={{ width: `${editorWidth}%` }} className="h-full border border-gray-600 rounded-2xl">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </div>
        <div
          className="w-2 bg-gray-600 border border-gray-600 rounded cursor-col-resize hover:bg-gray-500 transition-colors"
          onMouseDown={handleMouseDown}
        ></div>
        <div style={{ width: `${100 - editorWidth}%` }} className="bg-gray-800 p-4 overflow-auto h-full border border-gray-600 rounded-2xl">
          <h2 className="text-lg font-semibold mb-2">Input</h2>
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
            placeholder={isRunning ? (isReady ? "Enter input and press Enter" : "Waiting for program to start...") : "Enter input here (one per line)"}
            className="w-full h-24 bg-gray-900 text-white p-2 rounded mb-4 text-sm resize-none"
            disabled={!isRunning && input !== ''}
          />
          <h2 className="text-lg font-semibold mb-2">Output</h2>
          <pre className="bg-gray-900 p-2 rounded text-sm whitespace-pre-wrap">{output}</pre>
        </div>
      </div>
    </div>
  );
};

export default HomeCodeEditor;
