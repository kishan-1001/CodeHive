import React, { useEffect, useState } from 'react';
import { Loader2, Shield, User, Search } from 'lucide-react';

interface UserData {
    id: number;
    name: string;
    email: string;
    provider: string;
    role: string;
    created_at: string;
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId: number, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            } else {
                alert('Failed to update role');
            }
        } catch (error) {
            console.error('Error updating role:', error);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex justify-center p-12 text-white"><Loader2 className="animate-spin w-8 h-8" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">User Management</h1>

            {/* Filters */}
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 text-white pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left table-auto">
                    <thead>
                        <tr className="bg-gray-800/50 text-gray-400 border-b border-gray-800">
                            <th className="p-4 font-medium">User</th>
                            <th className="p-4 font-medium">Provider</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium">Joined</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700 capitalize">
                                        {user.provider}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium border ${user.role === 'admin'
                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                        {user.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-500">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleRoleUpdate(user.id, user.role)}
                                        className="text-xs font-medium text-amber-500 hover:text-amber-400 hover:underline flex items-center justify-end gap-1 ml-auto"
                                    >
                                        <Shield className="w-3 h-3" />
                                        {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
