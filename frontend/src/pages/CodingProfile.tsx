import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, User, Link as LinkIcon, CheckCircle, AlertCircle, ShieldCheck, Copy, X, Trash2 } from 'lucide-react';
import Header from '../components/Header';
import { api } from '../services/api';
import DeleteProfileModal from '../components/DeleteProfileModal';
import SaveRequiredModal from '../components/SaveRequiredModal';
import VerificationFailureModal from '../components/VerificationFailureModal';
import InvalidUsernameModal from '../components/InvalidUsernameModal';

const CodingProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // verification state
    const [verificationModalOpen, setVerificationModalOpen] = useState(false);
    const [verifyingPlatform, setVerifyingPlatform] = useState<{ name: string, label: string } | null>(null);
    const [verificationKey, setVerificationKey] = useState<string | null>(null);

    const [isVerifying, setIsVerifying] = useState(false);

    // deletion state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [platformToDelete, setPlatformToDelete] = useState<string | null>(null);

    // save required state
    const [saveRequiredModalOpen, setSaveRequiredModalOpen] = useState(false);
    const [missingPlatformLabel, setMissingPlatformLabel] = useState<string | null>(null);

    // verification failure state
    const [failureModalOpen, setFailureModalOpen] = useState(false);
    const [verificationError, setVerificationError] = useState<string | null>(null);

    // invalid username state
    const [invalidUsernameModalOpen, setInvalidUsernameModalOpen] = useState(false);

    const [profiles, setProfiles] = useState({
        leetcode: { username: '', verified: false },
        codeforces: { username: '', verified: false },
        codechef: { username: '', verified: false },
        geeksforgeeks: { username: '', verified: false },
        hackerrank: { username: '', verified: false }
    });

    // Store original fetching state to detect unsaved changes
    const [originalProfiles, setOriginalProfiles] = useState<any>(null);

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            const response = await api.get('/profile/coding-profiles');
            // Response is array of { name, slug, username, verified, ... }
            const profileMap: any = { ...profiles };

            if (Array.isArray(response)) {
                response.forEach((p: any) => {
                    if (p.slug) {
                        profileMap[p.slug] = {
                            username: p.username || '',
                            verified: p.verified || false
                        };
                    }
                });
            }
            setProfiles(profileMap);
            setOriginalProfiles(JSON.parse(JSON.stringify(profileMap))); // Deep copy
        } catch (error) {
            console.error('Failed to fetch profiles', error);
            setMessage({ type: 'error', text: 'Failed to load existing profiles.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Check for URL-like patterns
        if (/https?:\/\/|www\.|\//.test(value)) {
            setInvalidUsernameModalOpen(true);
            return; // Reject the input
        }

        setProfiles(prev => ({
            ...prev,
            [name]: {
                ...(prev as any)[name],
                username: value,
                // If username changes, it's no longer verified unless they save and re-verify? 
                // For simplicity, let's keep verified status logic on backend, 
                // but visually if they change it, we might want to warn. 
                // For now, simple input.
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            // Transform state back to simplified object for legacy save API if needed
            // OR update save API to handle object structure?
            // The existing save API expects { profiles: { leetcode: "handle" } }
            // Let's verify backend code from step 82.
            // It expects `const { profiles } = req.body`.
            // And iterates Object.entries(profiles).
            // So verification status relies on separate verification flow, standard save just updates username.

            const simpleProfiles: any = {};
            Object.entries(profiles).forEach(([key, val]: any) => {
                simpleProfiles[key] = val.username;
            });

            await api.post('/profile/coding-profiles', { profiles: simpleProfiles });
            setMessage({ type: 'success', text: 'Profiles updated successfully!' });

            // Re-fetch to confirm state (e.g. if backend cleared verification on username change)
            fetchProfiles();
            // Also update originalProfiles to match new saved state
            // fetchProfiles calls setOriginalProfiles, so we are good.
        } catch (error) {
            console.error('Failed to save profiles', error);
            setMessage({ type: 'error', text: 'Failed to save changes. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const handleVerifyClick = async (platformName: string, platformLabel: string) => {
        // First ensure profile is saved? Or we can just generate key using the platform name.
        // User must have username saved first ideally.
        const profile = (profiles as any)[platformName];

        // Check if empty OR if modified but not saved
        const original = originalProfiles ? originalProfiles[platformName] : null;
        const isUnsaved = original && original.username !== profile.username;

        if (!profile.username || isUnsaved) {
            setMissingPlatformLabel(platformLabel);
            setSaveRequiredModalOpen(true);
            return;
        }

        setVerifyingPlatform({ name: platformName, label: platformLabel });
        setVerificationKey(null);
        setVerificationModalOpen(true);

        try {
            const res = await api.post('/profile/coding-profiles/generate-key', { platform: platformName });
            setVerificationKey(res.verification_token);
        } catch (error) {
            console.error('Failed to generate key', error);
            setMessage({ type: 'error', text: 'Failed to generate verification key.' });
            setVerificationModalOpen(false);
        }
    };

    const handleDeleteProfile = (platformName: string) => {
        setPlatformToDelete(platformName);
        setDeleteModalOpen(true);
    };

    const confirmDeleteProfile = async () => {
        if (!platformToDelete) return;

        try {
            await api.delete(`/profile/coding-profiles/${platformToDelete}`);
            setMessage({ type: 'success', text: 'Profile removed successfully.' });

            // Clear local state
            setProfiles(prev => ({
                ...prev,
                [platformToDelete]: { username: '', verified: false }
            }));

            fetchProfiles(); // Ensure sync
            setDeleteModalOpen(false);
            setPlatformToDelete(null);
        } catch (error) {
            console.error('Failed to delete profile', error);
            setMessage({ type: 'error', text: 'Failed to remove profile.' });
            setDeleteModalOpen(false); // Close even on error? Or keep open? Let's close.
        }
    };

    const getUserFriendlyError = (error: string): string => {
        if (error.includes('Token not found')) {
            return "We couldn't find the verification token in your profile. Please ensure you've updated your bio or name exactly as shown and saved it on the platform.";
        }
        if (error.includes('Profile not found') || error.includes('404')) {
            return "We couldn't find a profile with this username on the platform. Please check for typos and ensure the account is public.";
        }
        if (error.includes('rate limit')) {
            return "We are making too many requests to the platform. Please wait a moment and try again.";
        }
        return error;
    };

    const handleCheckVerification = async () => {
        if (!verifyingPlatform) return;
        setIsVerifying(true);
        try {
            const res = await api.post('/profile/coding-profiles/verify', { platform: verifyingPlatform.name });
            if (res.success) {
                setMessage({ type: 'success', text: `${verifyingPlatform.label} verified successfully!` });
                setVerificationModalOpen(false);
                fetchProfiles(); // Refresh state
            }
        } catch (error: any) {
            // Error handling
            const errMsg = error.message || 'Verification failed. Please check your bio and try again.';
            // alert(errMsg); // Simple alert for modal error or use local state
            setVerificationError(getUserFriendlyError(errMsg));
            setFailureModalOpen(true);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/home');
    };

    const copyToClipboard = () => {
        if (verificationKey) {
            navigator.clipboard.writeText(verificationKey);
            // Optional toast
        }
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
                            Connect and verify your coding platforms to join the Global Leaderboard.
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
                                    ].map((platform) => {
                                        const platformData = (profiles as any)[platform.name] || { username: '', verified: false };

                                        return (
                                            <div key={platform.name} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                                        <span className={`font-bold ${platform.color}`}>{platform.label}</span> Handle
                                                    </label>
                                                    {platformData.username && (
                                                        platformData.verified ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                                                                    <ShieldCheck className="w-3 h-3" /> VERIFIED
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteProfile(platform.name)}
                                                                    className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                                                                    title="Remove / Unverify"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleVerifyClick(platform.name, platform.label)}
                                                                className="text-xs font-bold text-amber-500 hover:text-amber-400 underline transition-colors"
                                                            >
                                                                Verify Now
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <LinkIcon className="h-5 w-5 text-gray-500" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        name={platform.name}
                                                        value={platformData.username}
                                                        onChange={handleChange}
                                                        className={`block w-full pl-10 pr-3 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-amber-500 text-white placeholder-gray-500 transition-colors ${platformData.verified ? 'border-green-500/30 focus:border-green-500' : 'border-gray-700 focus:border-amber-500'}`}
                                                        placeholder={platform.placeholder}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
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

            {/* Verification Modal */}
            {verificationModalOpen && verifyingPlatform && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setVerificationModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-amber-500" />
                                Verify {verifyingPlatform.label}
                            </h3>
                            <p className="text-gray-400 text-sm mb-6">
                                To verify ownership, please copy the code below and paste it into your
                                <span className="font-bold text-white"> {verifyingPlatform.label} {
                                    verifyingPlatform.name === 'leetcode' ? 'Summary' :
                                        verifyingPlatform.name === 'codeforces' ? 'First Name or Organization' :
                                            verifyingPlatform.name === 'codechef' ? 'Name (First/Last Name)' :
                                                verifyingPlatform.name === 'hackerrank' ? 'Name / Bio' :
                                                    'Bio / About Me'
                                }</span> section.
                            </p>

                            <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700 flex items-center justify-between group">
                                {verificationKey ? (
                                    <>
                                        <code className="text-green-400 font-mono text-lg">{verificationKey}</code>
                                        <button
                                            onClick={copyToClipboard}
                                            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                                            title="Copy to clipboard"
                                        >
                                            <Copy className="w-5 h-5" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex justify-center w-full py-2">
                                        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleCheckVerification}
                                    disabled={!verificationKey || isVerifying}
                                    className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isVerifying ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Checking...
                                        </>
                                    ) : (
                                        'I have updated my Bio'
                                    )}
                                </button>
                                <button
                                    onClick={() => setVerificationModalOpen(false)}
                                    className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {deleteModalOpen && platformToDelete && (
                <DeleteProfileModal
                    platformName={platformToDelete}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDeleteProfile}
                />
            )}
            {/* Save Required Modal */}
            {saveRequiredModalOpen && missingPlatformLabel && (
                <SaveRequiredModal
                    platformLabel={missingPlatformLabel}
                    onClose={() => setSaveRequiredModalOpen(false)}
                />
            )}
            {/* Verification Failure Modal */}
            {failureModalOpen && verificationError && (
                <VerificationFailureModal
                    error={verificationError}
                    onClose={() => setFailureModalOpen(false)}
                />
            )}
            {/* Invalid Username Modal */}
            {invalidUsernameModalOpen && (
                <InvalidUsernameModal
                    onClose={() => setInvalidUsernameModalOpen(false)}
                />
            )}
        </div>
    );
};

export default CodingProfile;
