import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2, ArrowLeft, Search, Plus, X } from 'lucide-react';

interface Problem {
    id: number;
    title: string;
    difficulty: string;
    slug: string;
}

interface ContestData {
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    problems: number[]; // Ordered list of problem IDs
}

interface ContestFormProps {
    initialData?: ContestData;
    onSubmit: (data: ContestData) => Promise<void>;
    isEditing?: boolean;
}

const ContestForm: React.FC<ContestFormProps> = ({ initialData, onSubmit, isEditing = false }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<ContestData>({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        problems: []
    });
    const [loading, setLoading] = useState(false);

    // Problem Selection State
    const [availableProblems, setAvailableProblems] = useState<Problem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProblems, setSelectedProblems] = useState<Problem[]>([]);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            // We need to fetch the actual problem details for the IDs in initialData to show them
            // This logic assumes availableProblems contains them or we fetch them separately.
            // For simplicity, we'll wait for availableProblems to load then map.
        }
        fetchProblems();
    }, [initialData]);

    const fetchProblems = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/problems', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setAvailableProblems(data);

                // If editing, map initial IDs to actual problem objects
                if (initialData && initialData.problems.length > 0) {
                    const selected = initialData.problems.map(id => data.find(p => p.id === id)).filter(Boolean) as Problem[];
                    setSelectedProblems(selected);
                }
            }
        } catch (error) {
            console.error('Error fetching problems:', error);
        }
    };

    // Update selected problems when initialData changes (handle async fetch race condition)
    useEffect(() => {
        if (initialData && availableProblems.length > 0 && selectedProblems.length === 0) {
            const selected = initialData.problems.map(id => availableProblems.find(p => p.id === id)).filter(Boolean) as Problem[];
            if (selected.length > 0) setSelectedProblems(selected);
        }
    }, [availableProblems, initialData]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addProblem = (problem: Problem) => {
        if (!selectedProblems.find(p => p.id === problem.id)) {
            const newSelected = [...selectedProblems, problem];
            setSelectedProblems(newSelected);
            setFormData(prev => ({ ...prev, problems: newSelected.map(p => p.id) }));
        }
    };

    const removeProblem = (problemId: number) => {
        const newSelected = selectedProblems.filter(p => p.id !== problemId);
        setSelectedProblems(newSelected);
        setFormData(prev => ({ ...prev, problems: newSelected.map(p => p.id) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
        } finally {
            setLoading(false);
        }
    };

    const filteredAvailableProblems = availableProblems.filter(p =>
        (p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.toString().includes(searchTerm)) &&
        !selectedProblems.find(sp => sp.id === p.id)
    ).slice(0, 10); // Limit results

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/contests')}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-bold text-white">
                        {isEditing ? 'Edit Contest' : 'Create Contest'}
                    </h1>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg transition-colors"
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                    Save Contest
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Details */}
                <div className="space-y-6">
                    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-6">
                        <h2 className="text-xl font-semibold text-white">Contest Details</h2>

                        <div className="space-y-2">
                            <label className="text-gray-400 font-medium">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-gray-400 font-medium">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-gray-400 font-medium">Start Time</label>
                                <input
                                    type="datetime-local"
                                    name="start_time"
                                    value={formData.start_time ? new Date(formData.start_time).toISOString().slice(0, 16) : ''}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-gray-400 font-medium">End Time</label>
                                <input
                                    type="datetime-local"
                                    name="end_time"
                                    value={formData.end_time ? new Date(formData.end_time).toISOString().slice(0, 16) : ''}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Problem Selection */}
                <div className="space-y-6">
                    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-6 flex flex-col h-full">
                        <h2 className="text-xl font-semibold text-white">Select Problems</h2>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by ID or Title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-800 text-white pl-9 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none text-sm"
                            />
                        </div>

                        {/* Search Results */}
                        <div className="max-h-48 overflow-y-auto custom-scrollbar border border-gray-800 rounded-lg">
                            {filteredAvailableProblems.map(problem => (
                                <button
                                    key={problem.id}
                                    type="button"
                                    onClick={() => addProblem(problem)}
                                    className="w-full text-left p-3 hover:bg-gray-800 flex justify-between items-center group transition-colors"
                                >
                                    <span className="text-sm text-gray-300 truncate">{problem.id}. {problem.title}</span>
                                    <Plus className="w-4 h-4 text-gray-500 group-hover:text-amber-500" />
                                </button>
                            ))}
                            {filteredAvailableProblems.length === 0 && (
                                <div className="p-4 text-center text-xs text-gray-500">
                                    No matching problems found
                                </div>
                            )}
                        </div>

                        {/* Selected Problems List */}
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-400 mb-2">Selected Problems (In Order)</h3>
                            <div className="space-y-2">
                                {selectedProblems.map((problem, idx) => (
                                    <div key={problem.id} className="bg-gray-950 p-3 rounded-lg border border-gray-800 flex justify-between items-center group">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-mono text-gray-500 w-6 h-6 flex items-center justify-center bg-gray-900 rounded-full border border-gray-800">
                                                {idx + 1}
                                            </span>
                                            <span className="text-sm text-white font-medium">{problem.title}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                {problem.difficulty}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeProblem(problem.id)}
                                            className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {selectedProblems.length === 0 && (
                                    <div className="text-center text-gray-500 text-sm py-4 border border-dashed border-gray-800 rounded-lg">
                                        No problems selected yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default ContestForm;
