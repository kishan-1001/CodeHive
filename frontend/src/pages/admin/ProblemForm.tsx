import React, { useEffect, useState } from 'react';
import { Save, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MultiSelect from '../../components/ui/MultiSelect';
import type { Option } from '../../components/ui/MultiSelect';

interface Topic {
    id: number;
    name: string;
    slug: string;
}

interface Company {
    id: number;
    name: string;
}

interface ProblemData {
    title: string;
    slug: string;
    description: string;
    difficulty: string;
    topics: number[]; // Array of topic IDs
    companies: string[]; // Stores Company Names for now based on Backend implementation
}

interface ProblemFormProps {
    initialData?: ProblemData;
    onSubmit: (data: ProblemData) => Promise<void>;
    isEditing?: boolean;
}

const ProblemForm: React.FC<ProblemFormProps> = ({ initialData, onSubmit, isEditing = false }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<ProblemData>({
        title: '',
        slug: '',
        description: '',
        difficulty: 'Medium',
        topics: [],
        companies: []
    });

    // Options for MultiSelect
    const [topicOptions, setTopicOptions] = useState<Option[]>([]);
    const [companyOptions, setCompanyOptions] = useState<Option[]>([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
        fetchMetadata();
    }, [initialData]);

    const fetchMetadata = async () => {
        try {
            const [topicsRes, companiesRes] = await Promise.all([
                fetch('/api/problems/topics'),
                fetch('/api/problems/companies')
            ]);

            const topicsData: Topic[] = await topicsRes.json();
            const companiesData: Company[] = await companiesRes.json();

            if (Array.isArray(topicsData)) {
                setTopicOptions(topicsData.map(t => ({ id: t.id, label: t.name })));
            }
            if (Array.isArray(companiesData)) {
                setCompanyOptions(companiesData.map(c => ({ id: c.name, label: c.name })));
            }
        } catch (error) {
            console.error('Error fetching metadata:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'title' && !isEditing) {
            setFormData(prev => ({
                ...prev,
                slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
            }));
        }
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

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/problems')}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-bold text-white">
                        {isEditing ? 'Edit Problem' : 'Create Problem'}
                    </h1>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg transition-colors"
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                    Save Problem
                </button>
            </div>

            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <label className="text-gray-400 font-medium">Slug (URL Friendly ID)</label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-gray-400 font-medium">Description (Markdown)</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={10}
                        className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none font-mono"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-gray-400 font-medium">Difficulty</label>
                        <select
                            name="difficulty"
                            value={formData.difficulty}
                            onChange={handleChange}
                            className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none"
                        >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        {/* Replaced Native Select with MultiSelect for Topics */}
                        <MultiSelect
                            label="Topics"
                            options={topicOptions}
                            selected={formData.topics}
                            onChange={(selected) => setFormData(prev => ({ ...prev, topics: selected as number[] }))}
                            placeholder="Select topics..."
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    {/* Replaced Input with MultiSelect for Companies */}
                    <MultiSelect
                        label="Companies"
                        options={companyOptions}
                        selected={formData.companies}
                        onChange={(selected) => setFormData(prev => ({ ...prev, companies: selected as string[] }))}
                        placeholder="Select or Create Companies..."
                        creatable={true}
                        onCreate={(newOption) => setCompanyOptions(prev => [...prev, newOption])}
                    />
                </div>
            </div>
        </form>
    );
};

export default ProblemForm;
