import { useState, useEffect } from 'react';
import { Edit, GitCommit, Trophy, Eye, Github, Linkedin, Twitter, Globe, X, Save, Image as ImageIcon, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import { authAPI, userProfileAPI, leaderboardAPI } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3001'; // Default localhost

interface UserProfileData {
    name: string;
    username: string;
    email: string;
    avatar_url: string | null;
    created_at: string;
    is_public?: boolean;
    rank?: number;
    universal_score?: number;
    bio?: string;
    social_links?: {
        github?: string;
        linkedin?: string;
        twitter?: string;
        website?: string;
    };
}

interface RecentSubmission {
    id: number;
    problem: string;
    action: string;
    time: string;
    type: string;
}

interface UserStats {
    solved: {
        total: number;
        easy: number;
        medium: number;
        hard: number;
    };
    totalQuestions: {
        total: number;
        easy: number;
        medium: number;
        hard: number;
    };
    recentSubmissions: RecentSubmission[];
    submissionCalendar: { date: string; count: number }[];
    badges: { name: string; image: string; description: string }[];
}

const UserProfile = () => {
    const navigate = useNavigate();
    const { username } = useParams<{ username: string }>();
    const [user, setUser] = useState<UserProfileData | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [realRank, setRealRank] = useState<number | null>(null);
    const isOwnProfile = !username;

    // Edit Profile State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        bio: '',
        avatar_url: '',
        github: '',
        linkedin: '',
        twitter: '',
        website: '',
        is_public: true
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Badge Details Modal State
    const [selectedBadge, setSelectedBadge] = useState<{ name: string; image: string; description: string } | null>(null);
    const [isAllBadgesModalOpen, setIsAllBadgesModalOpen] = useState(false);

    // Activity Pagination State
    const [activity, setActivity] = useState<RecentSubmission[]>([]);
    const [activityPage, setActivityPage] = useState(1);
    const [activityPagination, setActivityPagination] = useState({ hasNext: false, hasPrev: false, totalPages: 1 });
    const [loadingActivity, setLoadingActivity] = useState(true);

    // Mock Data for other sections (Badges) - these are not yet in backend


    useEffect(() => {
        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (!username) {
            fetchActivity();
        } else if (stats) {
            // For public profile, populate activity from stats
            setActivity(stats.recentSubmissions || []);
            setLoadingActivity(false);
        }
    }, [activityPage, username, stats]);

    const fetchUserProfile = async () => {
        try {
            if (username) {
                // Fetch public profile
                const data = await userProfileAPI.getPublicProfile(username);
                setUser(data.user);
                setStats(data.stats);
                setRealRank(null); // Rank not currently returned for public profiles
            } else {
                // Fetch own profile
                const [userData, statsData, rankData] = await Promise.all([
                    authAPI.getMe(),
                    userProfileAPI.getProfileStats(),
                    leaderboardAPI.getMyRank().catch(() => ({ rank: null }))
                ]);
                setUser(userData);
                setStats(statsData);
                setRealRank(rankData?.rank || null);
            }
        } catch (error: any) {
            console.error('Failed to fetch profile', error);
            if (error.message?.includes('private') || error.response?.status === 403) {
                // Redirect to leaderboard if private
                // Could also show a "Private Profile" UI state instead of redirect
                navigate('/leaderboard');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchActivity = async () => {
        setLoadingActivity(true);
        try {
            // For public profile, we might need a different activity endpoint or just use what we have (if public API supports activity separately)
            // But wait, our public endpoint RETURNS recent activity in `stats.recentSubmissions`.
            // The `activity` state is used for the PAGINATED list at the bottom.
            // Be careful: `getUserActivity` in API defaults to /profile/activity which is ME.
            // We need a public activity endpoint for pagination? 
            // Current public endpoint returns `recentSubmissions` (top 15).
            // `activity` state is used for the list.
            // If viewing public profile, maybe duplicate `recentSubmissions` to `activity` initially?
            // Or disable pagination for public profile for now (MVP).

            if (username) {
                // Only load initial if not already loaded? 
                // Actually we don't have a public paginated activity endpoint yet.
                // So we can just skip this or use the data from fetchUserProfile if we want to show *some* activity.
                // Let's just set empty or disable for now to avoid error calls.
                // Better: Use `stats.recentSubmissions` if available.
                return;
            }

            const data = await userProfileAPI.getUserActivity(activityPage, 10);
            setActivity(data.submissions);
            setActivityPagination(data.pagination);
        } catch (error) {
            console.error('Failed to fetch activity', error);
        } finally {
            setLoadingActivity(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/home');
    };

    const openEditModal = () => {
        if (user) {
            setEditForm({
                name: user.name || '',
                bio: user.bio || '',
                avatar_url: user.avatar_url || '',
                github: user.social_links?.github || '',
                linkedin: user.social_links?.linkedin || '',
                twitter: user.social_links?.twitter || '',
                website: user.social_links?.website || '',
                is_public: user.is_public !== false
            });
            setSelectedFile(null);
            setPreviewUrl(null);
            setIsEditModalOpen(true);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            // Create preview URL
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            let finalAvatarUrl = editForm.avatar_url;

            // If a file is selected, upload it first
            if (selectedFile) {
                const uploadResponse = await userProfileAPI.uploadAvatar(selectedFile);
                finalAvatarUrl = uploadResponse.avatar_url;
            }

            await userProfileAPI.updateProfile({
                name: editForm.name,
                bio: editForm.bio,
                avatar_url: finalAvatarUrl,
                social_links: {
                    github: ensureAbsoluteUrl(editForm.github),
                    linkedin: ensureAbsoluteUrl(editForm.linkedin),
                    twitter: ensureAbsoluteUrl(editForm.twitter),
                    website: ensureAbsoluteUrl(editForm.website)
                },
                is_public: editForm.is_public
            });

            // Update local user state optimization
            setUser(prev => prev ? ({
                ...prev,
                name: editForm.name,
                bio: editForm.bio,
                avatar_url: finalAvatarUrl || null,
                social_links: {
                    github: ensureAbsoluteUrl(editForm.github),
                    linkedin: ensureAbsoluteUrl(editForm.linkedin),
                    twitter: ensureAbsoluteUrl(editForm.twitter),
                    website: ensureAbsoluteUrl(editForm.website)
                },
                is_public: editForm.is_public
            }) : null);

            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Failed to update profile', error);
            // Optionally show error toast
        } finally {
            setSaving(false);
        }
    };

    const getAvatarSrc = (path: string | null) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        // If it's a relative path from uploads, prepend base URL
        return `${API_BASE_URL}${path}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const ensureAbsoluteUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>;
    }

    if (!user) {
        return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">User not found</div>;
    }

    const displayStats = stats || {
        solved: { total: 0, easy: 0, medium: 0, hard: 0 },
        totalQuestions: { total: 0, easy: 0, medium: 0, hard: 0 },
        recentSubmissions: [],
        submissionCalendar: [],
        badges: []
    };

    // Helper to generate the last 365 days for the heatmap
    const getHeatmapData = () => {
        // We want to show roughly last 365 days, organized by weeks (vertical columns)
        // ending with today.

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 364);

        // Adjust start date to Sunday to align weeks properly if desired, 
        // or just strict 365 days. 
        // LeetCode usually shows a fixed number of months or year.
        // Let's ensure startDate is a Sunday for clean columns if we fill top-down?
        // Actually, let's just generate a flat list of days and chunk them into weeks.

        const keyDates = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            keyDates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const weeks = [];
        let currentWeek: { date: string; count: number }[] = [];

        // Ensure we start filling from the correct "day of week" for the first column 
        // if we want perfect calendar alignment.
        // For simplicity, let's just fill 7 days per column starting from 364 days ago.

        keyDates.forEach((date) => {
            // Fix: Use local date string to ensure early morning hours (e.g., 3 AM) are treated as "today"
            // properly in the user's local timezone, rather than shifting back to UTC (yesterday).
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            const dayStat = displayStats.submissionCalendar.find(d => d.date === dateStr);
            const count = dayStat ? dayStat.count : 0;

            currentWeek.push({ date: dateStr, count });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        });

        // Push remaining days
        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }

        return weeks;
    };

    const heatmapData = getHeatmapData();

    // Helper to determine color intensity
    const getIntensityClass = (count: number) => {
        if (count === 0) return 'bg-gray-800'; // Level 0 (Empty)
        if (count === 1) return 'bg-green-900'; // Level 1 (Low)
        if (count <= 3) return 'bg-green-700'; // Level 2 (Medium)
        if (count <= 5) return 'bg-green-500'; // Level 3 (High)
        return 'bg-green-400'; // Level 4 (Max/Brightest)
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-amber-500/30">
            <Header onSignOut={handleLogout} />

            <div className="max-w-7xl mx-auto px-4 py-8 pt-24 grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Left Column: User Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl">
                        <div className="relative mb-4">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl mx-auto bg-gradient-to-br from-amber-500 to-yellow-600 p-1">
                                {user.avatar_url ? (
                                    <img src={getAvatarSrc(user.avatar_url)} alt="Profile" className="w-full h-full object-cover rounded-xl bg-gray-950" />
                                ) : (
                                    <div className="w-full h-full bg-gray-950 rounded-xl flex items-center justify-center text-4xl font-bold text-amber-500">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-0 right-1/2 translate-x-12 translate-y-2 bg-gray-800 p-1.5 rounded-full border border-gray-700">
                                <span className="block w-4 h-4 bg-green-500 rounded-full animate-pulse"></span>
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
                            <p className="text-gray-400 text-sm mb-3">@{user.username || user.email.split('@')[0]}</p>

                            {/* Improved Rank Section with more gap */}
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-2 mb-6">
                                <div className="flex items-center justify-center gap-2 px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
                                    <Trophy className="w-3 h-3 text-yellow-500" />
                                    <span className="text-gray-300 font-medium">Rank #{realRank !== null ? realRank : 'N/A'}</span>
                                </div>
                            </div>

                            {/* Bio Section */}
                            {user.bio && (
                                <p className="text-gray-400 text-sm text-center mb-4 italic px-4">
                                    "{user.bio}"
                                </p>
                            )}

                            {/* Social Links */}
                            <div className="flex items-center justify-center gap-3 mb-6 mt-4">
                                {user.social_links?.github && (
                                    <a href={ensureAbsoluteUrl(user.social_links.github)} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                        <Github className="w-5 h-5" />
                                    </a>
                                )}
                                {user.social_links?.linkedin && (
                                    <a href={ensureAbsoluteUrl(user.social_links.linkedin)} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                                        <Linkedin className="w-5 h-5" />
                                    </a>
                                )}
                                {user.social_links?.twitter && (
                                    <a href={ensureAbsoluteUrl(user.social_links.twitter)} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-400 transition-colors">
                                        <Twitter className="w-5 h-5" />
                                    </a>
                                )}
                                {user.social_links?.website && (
                                    <a href={ensureAbsoluteUrl(user.social_links.website)} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-400 transition-colors">
                                        <Globe className="w-5 h-5" />
                                    </a>
                                )}
                            </div>

                            {isOwnProfile && (
                                <button
                                    onClick={openEditModal}
                                    className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-green-400 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 mb-4"
                                >
                                    <Edit className="w-4 h-4" /> Edit Profile
                                </button>
                            )}




                            {/* Community Stats */}
                            <div className="mt-6 pt-6 border-t border-gray-800">

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400 flex items-center gap-2"><Eye className="w-4 h-4" /> Views</span>
                                        <span className="text-white font-medium">1.2K</span>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>

                {/* Right Column: Stats & Activity */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Solved Problems Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                            <h3 className="font-bold text-white mb-4">Solved Problems</h3>
                            <div className="flex items-center gap-8">
                                {/* Circular Progress */}
                                <div className="relative w-32 h-32 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-800" />
                                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={351} strokeDashoffset={351 - (351 * (displayStats.solved.total / (displayStats.totalQuestions.total || 1)))} className="text-amber-500" />
                                    </svg>
                                    <div className="absolute text-center">
                                        <span className="text-3xl font-bold text-white">{displayStats.solved.total}</span>
                                        <div className="text-xs text-gray-500">Solved</div>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm group relative">
                                            <span className="text-green-400">Easy</span>
                                            <span className="text-gray-400">{displayStats.solved.easy} / {displayStats.totalQuestions.easy}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${(displayStats.solved.easy / (displayStats.totalQuestions.easy || 1)) * 100}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm group relative">
                                            <span className="text-yellow-400">Medium</span>
                                            <span className="text-gray-400">{displayStats.solved.medium} / {displayStats.totalQuestions.medium}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${(displayStats.solved.medium / (displayStats.totalQuestions.medium || 1)) * 100}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm group relative">
                                            <span className="text-red-400">Hard</span>
                                            <span className="text-gray-400">{displayStats.solved.hard} / {displayStats.totalQuestions.hard}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${(displayStats.solved.hard / (displayStats.totalQuestions.hard || 1)) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                            <h3 className="font-bold text-white mb-4">Badges & Achievements</h3>
                            {displayStats.badges && displayStats.badges.length > 0 ? (
                                <div className="grid grid-cols-3 gap-4">
                                    {(displayStats.badges.length > 3 ? displayStats.badges.slice(0, 3) : displayStats.badges).map((badge, i) => (
                                        <div
                                            key={i}
                                            onClick={() => setSelectedBadge(badge)}
                                            className="group relative flex flex-col items-center justify-center p-2 rounded-xl bg-gray-800/20 border border-gray-800 hover:border-amber-500/50 hover:bg-gray-800/60 transition-all cursor-pointer aspect-square"
                                        >
                                            <div className="w-12 h-12 mb-2 relative flex-shrink-0">
                                                <img src={badge.image} alt={badge.name} className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                                            </div>
                                            <span className="text-[10px] text-gray-400 text-center font-medium leading-tight group-hover:text-amber-400 transition-colors line-clamp-2">{badge.name}</span>
                                        </div>
                                    ))}

                                    {displayStats.badges.length > 3 && (
                                        <div
                                            onClick={() => setIsAllBadgesModalOpen(true)}
                                            className="group flex flex-col items-center justify-center p-2 rounded-xl bg-gray-800/20 border border-dashed border-gray-700 hover:border-amber-500 hover:bg-gray-800/60 transition-all cursor-pointer aspect-square"
                                        >
                                            <span className="text-xl font-bold text-gray-500 group-hover:text-amber-500 transition-colors">+{displayStats.badges.length - 3}</span>
                                            <span className="text-[10px] text-gray-500 font-medium group-hover:text-amber-400 transition-colors mt-1">View All</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                                    <Trophy className="w-12 h-12 mb-3 opacity-20" />
                                    <p className="text-sm">No badges earned yet.</p>
                                    <p className="text-xs mt-1">Solve problems to unlock!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submission Activity (Heatmap) */}
                    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white">Submission Activity</h3>
                            <div className="flex gap-2 text-xs">
                                <span className="px-2 py-1 bg-gray-800 rounded text-gray-300">Total: {displayStats.solved.total}</span>
                            </div>
                        </div>

                        <div className="w-full overflow-x-auto pb-4 custom-scrollbar overflow-y-visible">
                            {/* Custom Grid Heatmap */}
                            <div className="flex gap-1 min-w-max pb-2">
                                {heatmapData.map((week, wIdx) => {
                                    const firstDayOfWeek = new Date(week[0].date);
                                    const prevWeek = heatmapData[wIdx - 1];
                                    const prevFirstDay = prevWeek ? new Date(prevWeek[0].date) : new Date(0); // Epoch if no prev

                                    const showMonthLabel = wIdx === 0 || firstDayOfWeek.getMonth() !== prevFirstDay.getMonth();
                                    const monthLabel = firstDayOfWeek.toLocaleString('default', { month: 'short' });

                                    return (
                                        <div key={wIdx} className="flex flex-col gap-2">
                                            {/* Month Label Row */}
                                            <div className="h-4 text-xs text-gray-500 relative">
                                                {showMonthLabel && (
                                                    <span className="absolute top-0 left-0 whitespace-nowrap">{monthLabel}</span>
                                                )}
                                            </div>

                                            {/* Grid Column */}
                                            <div className="grid grid-rows-7 gap-1">
                                                {week.map((day, dIdx) => (
                                                    <div
                                                        key={`${wIdx}-${dIdx}`}
                                                        className={`w-3 h-3 rounded-sm ${getIntensityClass(day.count)} relative group cursor-pointer transition-colors duration-200 hover:border hover:border-white/50`}
                                                    >
                                                        {/* ToolTip: Dynamic positioning based on row index to avoid clipping */}
                                                        <div className={`hidden group-hover:block absolute left-1/2 -translate-x-1/2 z-50 whitespace-nowrap bg-gray-900 border border-gray-700 text-xs text-white px-2 py-1 rounded shadow-lg pointer-events-none ${dIdx < 3 ? 'top-full mt-2' : 'bottom-full mb-2'}`}>
                                                            <strong>{day.count} submissions</strong>
                                                            <div className="text-gray-400">{new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Recent Submissions List (Vertical) with Pagination */}
                    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white">Recent Activity</h3>
                            <div className="text-xs text-gray-500">
                                Page {activityPage} of {activityPagination.totalPages || 1}
                            </div>
                        </div>

                        <div className="space-y-4 min-h-[400px]">
                            {loadingActivity ? (
                                <div className="flex items-center justify-center h-full py-10">
                                    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : activity.length > 0 ? (
                                activity.map((sub) => (
                                    <div key={sub.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${sub.type === 'hard' ? 'bg-red-500/10 text-red-500' : sub.type === 'medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}>
                                                <GitCommit className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-white group-hover:text-amber-500 transition-colors">{sub.problem}</h4>
                                                <p className="text-xs text-gray-400">{formatDate(sub.time)}</p>
                                            </div>
                                        </div>
                                        <div className={`text-sm font-bold ${sub.type === 'hard' ? 'text-red-500' : sub.type === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                                            {sub.type.toUpperCase()}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-500 text-center py-10 flex flex-col items-center">
                                    <GitCommit className="w-12 h-12 mb-2 opacity-20" />
                                    <p>No activity found.</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
                            <button
                                onClick={() => setActivityPage(p => Math.max(1, p - 1))}
                                disabled={!activityPagination.hasPrev || loadingActivity}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                            >
                                <ChevronLeft className="w-4 h-4" /> Previous
                            </button>

                            <div className="flex gap-1">
                                {/* Page dots can be added here later if needed */}
                            </div>

                            <button
                                onClick={() => setActivityPage(p => p + 1)}
                                disabled={!activityPagination.hasNext || loadingActivity}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                </div>
            </div >

            {/* Edit Profile Modal */}
            {
                isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
                                <h3 className="text-lg font-bold text-white">Edit Profile</h3>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                                        placeholder="Your Name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Profile Picture</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 bg-gray-800 rounded-xl overflow-hidden border border-gray-700 flex-shrink-0">
                                            {previewUrl || editForm.avatar_url ? (
                                                <img
                                                    src={previewUrl || getAvatarSrc(editForm.avatar_url)}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                    <ImageIcon className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <label className="cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 transition-colors">
                                                    <Upload className="w-4 h-4" />
                                                    Upload New Image
                                                </div>
                                            </label>
                                            <p className="text-xs text-gray-500 mt-2">Recommended: Square image, max 5MB</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Bio</label>
                                    <textarea
                                        value={editForm.bio}
                                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500 min-h-[80px]"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>

                                <div className="pt-2">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Social Links</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Github className="w-5 h-5 text-gray-500" />
                                            <input
                                                type="text"
                                                value={editForm.github}
                                                onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                                                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                                                placeholder="GitHub Profile URL"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Linkedin className="w-5 h-5 text-gray-500" />
                                            <input
                                                type="text"
                                                value={editForm.linkedin}
                                                onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                                                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                                                placeholder="LinkedIn Profile URL"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Twitter className="w-5 h-5 text-gray-500" />
                                            <input
                                                type="text"
                                                value={editForm.twitter}
                                                onChange={(e) => setEditForm({ ...editForm, twitter: e.target.value })}
                                                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                                                placeholder="Twitter Profile URL"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Globe className="w-5 h-5 text-gray-500" />
                                            <input
                                                type="text"
                                                value={editForm.website}
                                                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                                                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                                                placeholder="Portfolio / Website URL"
                                            />
                                        </div>
                                    </div>
                                </div>


                                <div className="flex items-center justify-between bg-gray-800 p-4 rounded-xl border border-gray-700 mt-4 mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-white font-medium">Public Profile</span>
                                        <span className="text-xs text-gray-400">Allow others to view your stats and activity.</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={editForm.is_public}
                                            onChange={(e) => setEditForm({ ...editForm, is_public: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                    </label>
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? 'Saving...' : (
                                            <>
                                                <Save className="w-4 h-4" /> Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
            {/* All Badges Modal */}
            {
                isAllBadgesModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={() => setIsAllBadgesModalOpen(false)}>
                        <div
                            className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl relative p-6 flex flex-col max-h-[80vh]"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-amber-500" />
                                        All Badges & Achievements
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1">You have earned {displayStats.badges.length} badges</p>
                                </div>
                                <button onClick={() => setIsAllBadgesModalOpen(false)} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="overflow-y-auto custom-scrollbar p-2">
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                    {displayStats.badges.map((badge, i) => (
                                        <div
                                            key={i}
                                            onClick={() => setSelectedBadge(badge)}
                                            className="group relative flex flex-col items-center justify-center p-4 rounded-xl bg-gray-800/40 border border-gray-700 hover:border-amber-500/50 hover:bg-gray-800 transition-all cursor-pointer aspect-square"
                                        >
                                            <div className="w-16 h-16 mb-3 relative">
                                                <img src={badge.image} alt={badge.name} className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                                            </div>
                                            <span className="text-xs text-gray-300 text-center font-medium leading-tight group-hover:text-amber-400 transition-colors">{badge.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Badge Details Modal */}
            {
                selectedBadge && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={() => setSelectedBadge(null)}>
                        <div
                            className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl relative p-8 flex flex-col items-center text-center transform scale-100 transition-transform duration-200"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedBadge(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="w-32 h-32 mb-6 relative">
                                <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full"></div>
                                <img src={selectedBadge.image} alt={selectedBadge.name} className="w-full h-full object-contain relative z-10 drop-shadow-2xl" />
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-2">{selectedBadge.name}</h3>
                            <div className="h-1 w-16 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full mb-4"></div>
                            <p className="text-gray-300 leading-relaxed font-light">
                                {selectedBadge.description}
                            </p>

                            <div className="mt-8 flex gap-3 w-full">
                                <button
                                    onClick={() => setSelectedBadge(null)}
                                    className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors border border-gray-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default UserProfile;
