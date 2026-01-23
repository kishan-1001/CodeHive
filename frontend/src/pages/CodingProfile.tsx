import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, User, Link as LinkIcon, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import { api } from '../services/api';

const CodingProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [profiles, setProfiles] = useState({
        leetcode: '',
        codeforces: '',
        codechef: '',
        geeksforgeeks: '',
        hackerrank: ''
    });

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            const response = await api.get('/profile/coding-profiles');
            // Response is array of { name, slug, username, ... }
            const profileMap: any = { ...profiles };

            if (Array.isArray(response)) {
                response.forEach((p: any) => {
                    if (p.slug && p.username) {
                        profileMap[p.slug] = p.username;
                    }
                });
            }
            setProfiles(profileMap);
        } catch (error) {
            console.error('Failed to fetch profiles', error);
            setMessage({ type: 'error', text: 'Failed to load existing profiles.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfiles({
            ...profiles,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            await api.post('/profile/coding-profiles', { profiles });
            setMessage({ type: 'success', text: 'Profiles updated successfully!' });

            // Optional: trigger a sync if needed, or user can do it from global leaderboard
        } catch (error) {
            console.error('Failed to save profiles', error);
            setMessage({ type: 'error', text: 'Failed to save changes. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/home');
    };

    return (
        <div className="relative min-h-screen bg-gray-950 text-white font-sans selection:bg-amber-500/30">
            <Header onSignOut={handleLogout} />

            <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
                <div className="w-full max-w-2xl">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold flex items-center justify-center gap-3 mb-2">
                            <User className="w-10 h-10 text-amber-500" />
                            Coding Profile
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Connect your coding platforms to join the Global Leaderboard.
                        </p>
                    </div>

                    <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden p-8">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {message && (
                                    <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                        }`}>
                                        {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                        {message.text}
                                    </div>
                                )}

                                <div className="space-y-6">
                                    {[
                                        { name: 'leetcode', label: 'LeetCode', placeholder: 'Enter your LeetCode username', color: 'text-yellow-500' },
                                        { name: 'codeforces', label: 'CodeForces', placeholder: 'Enter your CodeForces handle', color: 'text-blue-500' },
                                        { name: 'codechef', label: 'CodeChef', placeholder: 'Enter your CodeChef handle', color: 'text-orange-500' },
                                        { name: 'geeksforgeeks', label: 'GeeksForGeeks', placeholder: 'Enter your GFG username', color: 'text-green-500' },
                                        { name: 'hackerrank', label: 'HackerRank', placeholder: 'Enter your HackerRank username', color: 'text-emerald-500' }
                                    ].map((platform) => (
                                        <div key={platform.name} className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                                <span className={`font-bold ${platform.color}`}>{platform.label}</span> Handle
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <LinkIcon className="h-5 w-5 text-gray-500" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name={platform.name}
                                                    value={(profiles as any)[platform.name]}
                                                    onChange={handleChange}
                                                    className="block w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white placeholder-gray-500 transition-colors"
                                                    placeholder={platform.placeholder}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-black transition-all ${saving
                                                ? 'bg-gray-700 cursor-not-allowed text-gray-500'
                                                : 'bg-amber-500 hover:bg-amber-600 shadow-lg hover:shadow-amber-500/20'
                                            }`}
                                    >
                                        <Save className="w-5 h-5" />
                                        {saving ? 'Saving Changes...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodingProfile;
