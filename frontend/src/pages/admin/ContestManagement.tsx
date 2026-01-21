import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Calendar, Loader2 } from 'lucide-react';

interface Contest {
    id: number;
    title: string;
    start_time: string;
    end_time: string;
    is_published: boolean;
}

const ContestManagement: React.FC = () => {
    const navigate = useNavigate();
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContests();
    }, []);

    const fetchContests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/contests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setContests(data);
            }
        } catch (error) {
            console.error('Error fetching contests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this contest?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/contests/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setContests(contests.filter(c => c.id !== id));
            } else {
                alert('Failed to delete contest');
            }
        } catch (error) {
            console.error('Error deleting contest:', error);
        }
    };

    if (loading) return <div className="flex justify-center p-12 text-white"><Loader2 className="animate-spin w-8 h-8" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-white">Contest Management</h1>
                <button
                    onClick={() => navigate('/admin/contests/create')}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Create Contest
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contests.map((contest) => (
                    <div key={contest.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-white">{contest.title}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${contest.is_published ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                                        {contest.is_published ? 'PUBLISHED' : 'DRAFT'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {!contest.is_published && (
                                    <button
                                        onClick={() => navigate(`/admin/contests/${contest.id}/edit`)}
                                        className="p-2 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                                        title="Edit Draft"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(contest.id)}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span>Start: {new Date(contest.start_time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span>End: {new Date(contest.end_time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {contests.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        No contests found. Create one to get started!
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContestManagement;
