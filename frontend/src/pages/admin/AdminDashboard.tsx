import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalProblems: 0,
        totalUsers: 0,
        activeSessions: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12 text-white"><Loader2 className="animate-spin w-8 h-8" /></div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                    <h3 className="text-gray-400 font-medium mb-2">Total Problems</h3>
                    <div className="text-4xl font-bold text-white">{stats.totalProblems}</div>
                </div>
                <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                    <h3 className="text-gray-400 font-medium mb-2">Total Users</h3>
                    <div className="text-4xl font-bold text-white">{stats.totalUsers}</div>
                </div>
                <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                    <h3 className="text-gray-400 font-medium mb-2">Active Sessions</h3>
                    <div className="text-4xl font-bold text-white">{stats.activeSessions}</div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
