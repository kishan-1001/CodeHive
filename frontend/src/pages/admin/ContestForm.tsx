import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2, ArrowLeft, Search, Plus, X, Globe, Trophy } from 'lucide-react';

interface Problem {
    id: number;
    title: string;
    difficulty: string;
    slug: string;
}

interface SelectedProblem extends Problem {
    points: number;
}

interface ContestData {
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    is_published: boolean;
    problems: { id: number; points: number }[]; // Ordered list
}

interface ContestFormProps {
    initialData?: any; // Using any for flexibility with initial load mapping
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
        is_published: false,
        problems: []
    });
    const [loading, setLoading] = useState(false);

    // Problem Selection State
    const [availableProblems, setAvailableProblems] = useState<Problem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProblems, setSelectedProblems] = useState<SelectedProblem[]>([]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                title: initialData.title || '',
                description: initialData.description || '',
                start_time: initialData.start_time || '',
                end_time: initialData.end_time || '',
                is_published: initialData.is_published || false,
                problems: initialData.problems || []
            });
        }
        fetchProblems();
    }, [initialData]);

    const fetchProblems = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Fetching problems...');
            const res = await fetch('/api/problems', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                console.error('Failed to fetch problems:', res.status, res.statusText);
                return;
            }

            const data = await res.json();
            console.log('Fetched problems result:', Array.isArray(data) ? `Array(${data.length})` : data);

            if (Array.isArray(data)) {
                setAvailableProblems(data);
            } else {
                console.warn('Fetched data is not an array:', data);
            }
        } catch (error) {
            console.error('Error fetching problems:', error);
        }
    };

    // Sync selected problems with form data and available problems
    useEffect(() => {
        if (initialData && availableProblems.length > 0 && selectedProblems.length === 0) {
            // If editing, initialData.problems might be array of IDs or objects depending on API
            // Based on previous code, it was IDs, but now we want points.
            // Let's assume initialData passes points if available, or we default to 100.

            // NOTE: ContestEdit maps response. Fetch details there needs to include points.
            // Assuming initialData.problems is { id, points } from ContestEdit

            const selected: SelectedProblem[] = [];

            if (initialData.problems && Array.isArray(initialData.problems)) {
                initialData.problems.forEach((p: any) => {
                    const problemId = typeof p === 'object' ? p.id : p;
                    const points = typeof p === 'object' ? (p.points || 100) : 100;
                    const problemDetails = availableProblems.find(ap => ap.id === problemId);

                    if (problemDetails) {
                        selected.push({ ...problemDetails, points });
                    }
                });
            }

            if (selected.length > 0) setSelectedProblems(selected);
        }
    }, [availableProblems, initialData]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addProblem = (problem: Problem) => {
        if (!selectedProblems.find(p => p.id === problem.id)) {
            const newProblem: SelectedProblem = { ...problem, points: 100 };
            const newSelected = [...selectedProblems, newProblem];
            updateSelectedProblems(newSelected);
        }
    };

    const removeProblem = (problemId: number) => {
        const newSelected = selectedProblems.filter(p => p.id !== problemId);
        updateSelectedProblems(newSelected);
    };

    const updatePoints = (problemId: number, points: number) => {
        const newSelected = selectedProblems.map(p =>
            p.id === problemId ? { ...p, points } : p
        );
        updateSelectedProblems(newSelected);
    };

    const toLocalISOString = (date: Date) => {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return date.getFullYear() +
            '-' + pad(date.getMonth() + 1) +
            '-' + pad(date.getDate()) +
            'T' + pad(date.getHours()) +
            ':' + pad(date.getMinutes()) +
            ':00.000';
    };

    const getDateParts = (isoString: string) => {
        const date = isoString ? new Date(isoString) : new Date();
        return {
            dateVal: date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0'),
            hour: date.getHours() % 12 || 12,
            minute: date.getMinutes(),
            ampm: date.getHours() >= 12 ? 'PM' : 'AM'
        };
    };

    const handleDateChange = (field: 'start_time' | 'end_time', type: 'date' | 'hour' | 'minute' | 'ampm', value: string) => {
        const currentIso = formData[field];
        const dateObj = currentIso ? new Date(currentIso) : new Date();

        if (type === 'date') {
            const [y, m, d] = value.split('-').map(Number);
            dateObj.setFullYear(y);
            dateObj.setMonth(m - 1);
            dateObj.setDate(d);
        } else if (type === 'hour') {
            let h = parseInt(value);
            const currentH = dateObj.getHours();
            const isPm = currentH >= 12; // Check previous state
            if (isPm && h < 12) h += 12;
            if (!isPm && h === 12) h = 0;
            // Correction if switching from AM/PM logic fails context, but here we assume user changes hour
            // Better logic: relies on AM/PM selector state? No, dateObj holds truth.
            // If dateObj is 14:00 (2 PM), and user selects '3', we want 15:00.
            // If dateObj is 02:00 (2 AM), and user selects '3', we want 03:00.
            // So we need to preserve existing AM/PM state.
            const wasPm = dateObj.getHours() >= 12;
            if (wasPm && h < 12) h += 12;
            if (!wasPm && h === 12) h = 0;
            dateObj.setHours(h);
        } else if (type === 'minute') {
            dateObj.setMinutes(parseInt(value));
        } else if (type === 'ampm') {
            let h = dateObj.getHours();
            if (value === 'PM' && h < 12) h += 12;
            if (value === 'AM' && h >= 12) h -= 12;
            dateObj.setHours(h);
        }

        setFormData(prev => ({ ...prev, [field]: toLocalISOString(dateObj) }));
    };

    const updateSelectedProblems = (newSelected: SelectedProblem[]) => {
        setSelectedProblems(newSelected);
        setFormData(prev => ({
            ...prev,
            problems: newSelected.map(p => ({ id: p.id, points: p.points }))
        }));
    };

    const handleSubmit = async (e: React.FormEvent, publish = false) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({ ...formData, is_published: publish ? true : formData.is_published });
        } finally {
            setLoading(false);
        }
    };

    const filteredAvailableProblems = availableProblems.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.toString().includes(searchTerm);
        const alreadySelected = !!selectedProblems.find(sp => sp.id === p.id);

        // Debug log (only on first few to avoid spam)
        if (availableProblems.length > 0 && availableProblems.indexOf(p) < 3) {
            // console.log(`Problem ${p.id}: matches=${matchesSearch}, selected=${alreadySelected}`);
        }

        return matchesSearch && !alreadySelected;
    }).slice(0, 5); // Limit results for dropdown

    // Debug render
    // console.log(`Search: "${searchTerm}", Available: ${availableProblems.length}, Filtered: ${filteredAvailableProblems.length}`);

    return (
        <form className="space-y-8 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/contests')}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            {isEditing ? 'Edit Contest' : 'Create Contest'}
                        </h1>
                        <span className={`text-sm font-medium px-2 py-0.5 rounded ${formData.is_published ? 'bg-green-500/10 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                            {formData.is_published ? 'Published' : 'Draft'}
                        </span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, false)}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                        Save Draft
                    </button>
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, true)}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg transition-colors"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Globe className="w-5 h-5" />}
                        Publish Contest
                    </button>
                </div>
            </div>

            {/* Main Content - Vertical Layout */}
            <div className="space-y-8">

                {/* 1. Contest Details Box */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Save className="w-4 h-4 text-amber-500" />
                            Contest Details
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-gray-400 font-medium text-sm">Contest Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Weekly Contest 101"
                                required
                                className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-gray-400 font-medium text-sm">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the contest rules and details..."
                                rows={4}
                                className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
                            />
                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Start Time Group */}
                            <div className="space-y-2">
                                <label className="text-gray-400 font-medium text-sm">Start Time</label>
                                <div className="flex flex-wrap gap-2">
                                    <input
                                        type="date"
                                        value={getDateParts(formData.start_time).dateVal}
                                        onChange={(e) => handleDateChange('start_time', 'date', e.target.value)}
                                        required
                                        className="bg-gray-950 border border-gray-800 text-white px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none"
                                    />
                                    <div className="flex items-center gap-1 bg-gray-950 border border-gray-800 rounded-lg px-2">
                                        <select
                                            value={getDateParts(formData.start_time).hour}
                                            onChange={(e) => handleDateChange('start_time', 'hour', e.target.value)}
                                            className="bg-transparent text-white py-2.5 outline-none text-center w-12 appearance-none cursor-pointer"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                                                <option key={h} value={h} className="bg-gray-900">{h}</option>
                                            ))}
                                        </select>
                                        <span className="text-gray-500 font-bold">:</span>
                                        <select
                                            value={getDateParts(formData.start_time).minute}
                                            onChange={(e) => handleDateChange('start_time', 'minute', e.target.value)}
                                            className="bg-transparent text-white py-2.5 outline-none text-center w-12 appearance-none cursor-pointer"
                                        >
                                            {Array.from({ length: 60 }, (_, i) => i).map(m => (
                                                <option key={m} value={m} className="bg-gray-900">{m.toString().padStart(2, '0')}</option>
                                            ))}
                                        </select>
                                        <div className="w-px h-6 bg-gray-800 mx-1"></div>
                                        <select
                                            value={getDateParts(formData.start_time).ampm}
                                            onChange={(e) => handleDateChange('start_time', 'ampm', e.target.value)}
                                            className="bg-transparent text-amber-500 font-medium py-2.5 outline-none cursor-pointer"
                                        >
                                            <option value="AM" className="bg-gray-900">AM</option>
                                            <option value="PM" className="bg-gray-900">PM</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* End Time Group */}
                            <div className="space-y-2">
                                <label className="text-gray-400 font-medium text-sm">End Time</label>
                                <div className="flex flex-wrap gap-2">
                                    <input
                                        type="date"
                                        value={getDateParts(formData.end_time).dateVal}
                                        onChange={(e) => handleDateChange('end_time', 'date', e.target.value)}
                                        required
                                        className="bg-gray-950 border border-gray-800 text-white px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none"
                                    />
                                    <div className="flex items-center gap-1 bg-gray-950 border border-gray-800 rounded-lg px-2">
                                        <select
                                            value={getDateParts(formData.end_time).hour}
                                            onChange={(e) => handleDateChange('end_time', 'hour', e.target.value)}
                                            className="bg-transparent text-white py-2.5 outline-none text-center w-12 appearance-none cursor-pointer"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                                                <option key={h} value={h} className="bg-gray-900">{h}</option>
                                            ))}
                                        </select>
                                        <span className="text-gray-500 font-bold">:</span>
                                        <select
                                            value={getDateParts(formData.end_time).minute}
                                            onChange={(e) => handleDateChange('end_time', 'minute', e.target.value)}
                                            className="bg-transparent text-white py-2.5 outline-none text-center w-12 appearance-none cursor-pointer"
                                        >
                                            {Array.from({ length: 60 }, (_, i) => i).map(m => (
                                                <option key={m} value={m} className="bg-gray-900">{m.toString().padStart(2, '0')}</option>
                                            ))}
                                        </select>
                                        <div className="w-px h-6 bg-gray-800 mx-1"></div>
                                        <select
                                            value={getDateParts(formData.end_time).ampm}
                                            onChange={(e) => handleDateChange('end_time', 'ampm', e.target.value)}
                                            className="bg-transparent text-amber-500 font-medium py-2.5 outline-none cursor-pointer"
                                        >
                                            <option value="AM" className="bg-gray-900">AM</option>
                                            <option value="PM" className="bg-gray-900">PM</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Problems Box */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl min-h-[400px] flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center rounded-t-2xl">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            Contest Problems
                        </h2>
                    </div>

                    <div className="p-6 flex flex-col gap-6 flex-1">
                        {/* Search Bar */}
                        <div className="relative z-30">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by Problem ID or Title to add..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-800 text-white pl-9 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none"
                            />
                            {/* Dropdown Results */}
                            {searchTerm && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto z-[100]">
                                    {filteredAvailableProblems.length > 0 ? (
                                        filteredAvailableProblems.map(problem => (
                                            <button
                                                key={problem.id}
                                                type="button"
                                                onClick={() => {
                                                    addProblem(problem);
                                                    setSearchTerm('');
                                                }}
                                                className="w-full text-left p-3 hover:bg-gray-800 flex justify-between items-center group transition-colors border-b border-gray-800/50 last:border-0"
                                            >
                                                <span className="text-sm text-gray-300">
                                                    <span className="font-mono text-gray-500 mr-2">#{problem.id}</span>
                                                    {problem.title}
                                                </span>
                                                <Plus className="w-4 h-4 text-gray-500 group-hover:text-amber-500" />
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-gray-500 text-sm">
                                            No problems found matching "{searchTerm}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Problems Table/List */}
                        <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <div className="col-span-1">Order</div>
                                <div className="col-span-6">Problem</div>
                                <div className="col-span-2">Difficulty</div>
                                <div className="col-span-2">Points</div>
                                <div className="col-span-1 text-right">Action</div>
                            </div>

                            {selectedProblems.length === 0 ? (
                                <div className="h-32 flex items-center justify-center text-gray-500 border border-dashed border-gray-800 rounded-lg">
                                    No problems added yet. Search above to add problems.
                                </div>
                            ) : (
                                selectedProblems.map((problem, idx) => (
                                    <div key={problem.id} className="grid grid-cols-12 gap-4 items-center bg-gray-950 p-3 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors group">
                                        <div className="col-span-1 flex items-center justify-center w-8 h-8 bg-gray-900 rounded-lg text-sm text-gray-400 font-mono">
                                            {idx + 1}
                                        </div>
                                        <div className="col-span-6">
                                            <div className="font-medium text-white truncate">{problem.title}</div>
                                            <div className="text-xs text-gray-500">ID: {problem.id}</div>
                                        </div>
                                        <div className="col-span-2">
                                            <span className={`text-xs px-2 py-1 rounded border ${problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                    'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                {problem.difficulty}
                                            </span>
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="number"
                                                value={problem.points}
                                                onChange={(e) => updatePoints(problem.id, parseInt(e.target.value) || 0)}
                                                className="w-full bg-gray-900 border border-gray-800 text-white px-2 py-1 rounded focus:ring-1 focus:ring-amber-500/50 outline-none text-sm text-center"
                                            />
                                        </div>
                                        <div className="col-span-1 text-right">
                                            <button
                                                type="button"
                                                onClick={() => removeProblem(problem.id)}
                                                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-50 group-hover:opacity-100"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default ContestForm;
