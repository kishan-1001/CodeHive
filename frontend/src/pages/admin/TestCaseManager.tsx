import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';

interface TestCase {
    id: number;
    input: string;
    expected_output: string;
    is_sample: boolean;
    is_hidden: boolean;
}

interface TestCaseManagerProps {
    problemId: string;
}

const TestCaseManager: React.FC<TestCaseManagerProps> = ({ problemId }) => {
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    // New Test Case Form State
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isSample, setIsSample] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        fetchTestCases();
    }, [problemId]);

    const fetchTestCases = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/${problemId}/test-cases`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTestCases(data);
            }
        } catch (error) {
            console.error('Error fetching test cases:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/${problemId}/test-cases`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    input,
                    expected_output: output,
                    is_sample: isSample,
                    is_hidden: isHidden
                })
            });

            if (res.ok) {
                const newTestCase = await res.json();
                setTestCases([...testCases, newTestCase]);
                setInput('');
                setOutput('');
                setIsSample(false);
                setIsHidden(false);
            } else {
                alert('Failed to add test case');
            }
        } catch (error) {
            console.error('Error adding test case:', error);
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this test case?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/test-cases/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setTestCases(testCases.filter(tc => tc.id !== id));
            }
        } catch (error) {
            console.error('Error deleting test case:', error);
        }
    };

    if (loading) return <div className="p-4"><Loader2 className="animate-spin text-gray-400" /></div>;

    return (
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-6 mt-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Test Cases
                <span className="text-sm font-normal text-gray-500">({testCases.length})</span>
            </h2>

            {/* List */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {testCases.map((tc, index) => (
                    <div key={tc.id} className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row gap-4 justify-between items-start">
                        <div className="flex-1 space-y-2 w-full">
                            <div className="flex gap-2">
                                <span className="text-xs font-mono text-gray-500">#{index + 1}</span>
                                {tc.is_sample && <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">Sample</span>}
                                {tc.is_hidden && <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">Hidden</span>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-gray-500 block mb-1">Input</span>
                                    <pre className="bg-gray-900 p-2 rounded text-xs text-gray-300 font-mono overflow-x-auto">{tc.input}</pre>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 block mb-1">Output</span>
                                    <pre className="bg-gray-900 p-2 rounded text-xs text-gray-300 font-mono overflow-x-auto">{tc.expected_output}</pre>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(tc.id)}
                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors self-start md:self-center"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                {testCases.length === 0 && <p className="text-gray-500 text-center py-4">No test cases yet.</p>}
            </div>

            {/* Add Form */}
            <form onSubmit={handleAdd} className="border-t border-gray-800 pt-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">Add New Test Case</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Input</label>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full bg-gray-950 border border-gray-800 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none font-mono text-sm"
                            rows={3}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Expected Output</label>
                        <textarea
                            value={output}
                            onChange={(e) => setOutput(e.target.value)}
                            className="w-full bg-gray-950 border border-gray-800 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none font-mono text-sm"
                            rows={3}
                            placeholder="Expected output..."
                            required
                        />
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isSample}
                            onChange={(e) => setIsSample(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-amber-500 focus:ring-amber-500/20"
                        />
                        <span className="text-sm text-gray-300">Is Sample? (Visible to user)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isHidden}
                            onChange={(e) => setIsHidden(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-amber-500 focus:ring-amber-500/20"
                        />
                        <span className="text-sm text-gray-300">Is Hidden? (Private test case)</span>
                    </label>
                </div>
                <button
                    type="submit"
                    disabled={adding}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                    <Plus className="w-4 h-4" />
                    Add Test Case
                </button>
            </form>
        </div>
    );
};

export default TestCaseManager;
