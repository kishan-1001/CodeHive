import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';

interface Problem {
    id: number;
    title: string;
    difficulty: string;
    slug: string;
}

const ProblemManagement: React.FC = () => {
    const navigate = useNavigate();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/problems', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setProblems(data);
            }
        } catch (error) {
            console.error('Error fetching problems:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this problem?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/problems/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                setProblems(problems.filter(p => p.id !== id));
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete problem');
            }
        } catch (error) {
            console.error('Error deleting problem:', error);
        }
    };

    const filteredProblems = problems.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toString().includes(searchTerm)
    );

    if (loading) return <div className="flex justify-center p-12 text-white"><Loader2 className="animate-spin w-8 h-8" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-white">Problem Management</h1>
                <button
                    onClick={() => navigate('/admin/problems/create')}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Create Problem
                </button>
            </div>

            {/* Filters */}
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search problems..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 text-white pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-800/50 text-gray-400 border-b border-gray-800">
                            <th className="p-4 font-medium">ID</th>
                            <th className="p-4 font-medium">Title</th>
                            <th className="p-4 font-medium">Difficulty</th>
                            <th className="p-4 font-medium flex justify-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {filteredProblems.map((problem) => (
                            <tr key={problem.id} className="hover:bg-gray-800/30 transition-colors">
                                <td className="p-4 text-gray-400">#{problem.id}</td>
                                <td className="p-4 font-medium text-white">{problem.title}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                        problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                            'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}>
                                        {problem.difficulty}
                                    </span>
                                </td>
                                <td className="p-4 flex justify-end gap-2">
                                    <button
                                        onClick={() => navigate(`/admin/problems/${problem.id}/edit`)}
                                        className="p-2 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(problem.id)}
                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredProblems.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                    No problems found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProblemManagement;
