import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

const HomeCodeEditor: React.FC = () => {
  const [code, setCode] = useState<string>('#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}');
  const [language, setLanguage] = useState<string>('cpp');
  const [output, setOutput] = useState<string>('');
  const [editorWidth, setEditorWidth] = useState<number>(70);

  const languages = [
    { value: 'cpp', label: 'C++' },
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
  ];

  const handleRun = async () => {
    setOutput('Executing...');
    try {
      const response = await fetch('http://localhost:3000/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      });
      const result = await response.json();
      setOutput(result.output || result.error || 'No output');
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    }
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
      <div className="flex items-center justify-between p-4 bg-gray-800">
        <h1 className="text-xl font-bold">CodeHive Editor</h1>
        <div className="flex items-center space-x-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-700 text-white p-2 rounded"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleRun}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            ▶️ Run
          </button>
        </div>
      </div>
      <div className="flex flex-1">
        <div style={{ width: `${editorWidth}%` }} className="h-full">
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
          className="w-1 bg-gray-600 cursor-col-resize hover:bg-gray-500 transition-colors"
          onMouseDown={handleMouseDown}
        ></div>
        <div style={{ width: `${100 - editorWidth}%` }} className="bg-gray-800 p-4 overflow-auto h-full">
          <h2 className="text-lg font-semibold mb-2">Output</h2>
          <pre className="bg-gray-900 p-2 rounded text-sm whitespace-pre-wrap">{output}</pre>
        </div>
      </div>
    </div>
  );
};

export default HomeCodeEditor;
