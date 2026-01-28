import React, { useEffect, useState } from 'react';
import { Save, Loader2, Lightbulb } from 'lucide-react';

interface Solution {
    id?: number;
    language: string;
    solution_type: 'brute_force' | 'optimal' | 'most_optimal';
    explanation: string;
    code: string;
    time_complexity: string;
    space_complexity: string;
}

interface SolutionManagerProps {
    problemId: string;
}

const LANGUAGES = ['c', 'cpp', 'java', 'python', 'javascript'];
const SOLUTION_TYPES = [
    { value: 'brute_force', label: 'Brute Force' },
    { value: 'optimal', label: 'Optimal' },
    { value: 'most_optimal', label: 'Most Optimal' }
];

const SolutionManager: React.FC<SolutionManagerProps> = ({ problemId }) => {
    const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');
    const [selectedType, setSelectedType] = useState<Solution['solution_type']>('optimal');

    const [solution, setSolution] = useState<Solution>({
        language: 'javascript',
        solution_type: 'optimal',
        explanation: '',
        code: '',
        time_complexity: '',
        space_complexity: ''
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSolution(selectedLanguage, selectedType);
    }, [problemId, selectedLanguage, selectedType]);

    const fetchSolution = async (lang: string, type: string) => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`/api/problems/${problemId}/solutions/${lang}/${type}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setSolution({
                    ...data,
                    language: lang,
                    solution_type: type
                });
            } else {
                // Reset if not found
                setSolution({
                    language: lang,
                    solution_type: type as any,
                    explanation: '',
                    code: '',
                    time_complexity: '',
                    space_complexity: ''
                });
            }
        } catch (error) {
            console.error('Error fetching solution:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`/api/admin/problems/${problemId}/solutions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(solution)
            });

            if (res.ok) {
                alert('Solution saved successfully!');
            } else {
                const err = await res.json();
                alert(`Failed to save solution: ${err.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error saving solution:', error);
            alert('Error saving solution');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-6 mt-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Manage Solutions
            </h2>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 border-b border-gray-800 pb-4">
                {/* Language Selector */}
                <div className="flex gap-2 overflow-x-auto">
                    {LANGUAGES.map(lang => (
                        <button
                            key={lang}
                            onClick={() => setSelectedLanguage(lang)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedLanguage === lang
                                ? 'bg-amber-500 text-black'
                                : 'bg-gray-800 text-gray-400 hover:text-white'
                                }`}
                        >
                            {lang.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Type Selector */}
                <div className="flex gap-2 overflow-x-auto">
                    {SOLUTION_TYPES.map(type => (
                        <button
                            key={type.value}
                            onClick={() => setSelectedType(type.value as any)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedType === type.value
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-800 text-gray-400 hover:text-white'
                                }`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-500" /></div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Time Complexity</label>
                            <input
                                type="text"
                                value={solution.time_complexity}
                                onChange={(e) => setSolution({ ...solution, time_complexity: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none"
                                placeholder="e.g. O(n log n)"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Space Complexity</label>
                            <input
                                type="text"
                                value={solution.space_complexity}
                                onChange={(e) => setSolution({ ...solution, space_complexity: e.target.value })}
                                className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none"
                                placeholder="e.g. O(n)"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium">Explanation (Markdown)</label>
                        <textarea
                            value={solution.explanation}
                            onChange={(e) => setSolution({ ...solution, explanation: e.target.value })}
                            className="w-full h-32 bg-gray-950 border border-gray-800 text-gray-300 font-mono text-sm p-4 rounded-xl focus:ring-2 focus:ring-amber-500/50 outline-none resize-none"
                            placeholder="Explain the approach..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium">Solution Code</label>
                        <textarea
                            value={solution.code}
                            onChange={(e) => setSolution({ ...solution, code: e.target.value })}
                            className="w-full h-96 bg-gray-950 border border-gray-800 text-gray-300 font-mono text-sm p-4 rounded-xl focus:ring-2 focus:ring-amber-500/50 outline-none resize-none"
                            placeholder="// Write solution code here..."
                        />
                    </div>
                </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-800">
                <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg transition-colors"
                >
                    {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                    Save Solution
                </button>
            </div>
        </div>
    );
};

export default SolutionManager;
