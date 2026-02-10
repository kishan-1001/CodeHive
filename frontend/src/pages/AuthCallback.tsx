import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { authAPI } from '../services/api';

const AuthCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Authenticating...');

    useEffect(() => {
        // Prevent double-execution in Strict Mode
        const processAuth = async () => {
            const token = searchParams.get('token');

            if (token) {
                // Determine if we need to retry
                let attempts = 0;
                const maxAttempts = 5;
                const baseDelay = 1000;

                while (attempts < maxAttempts) {
                    try {
                        if (attempts > 0) {
                            setStatus(`Establishing secure connection...`);
                        }

                        sessionStorage.setItem('token', token);
                        await new Promise(resolve => setTimeout(resolve, baseDelay));

                        const user = await authAPI.getMe();

                        // Success
                        sessionStorage.setItem('user', JSON.stringify(user));
                        navigate('/explore', { replace: true });
                        return;

                    } catch (err: any) {
                        console.warn(`Auth attempt ${attempts + 1} failed:`, err);
                        attempts++;

                        // Check for Auth errors (invalid token) - don't retry these
                        if (err.message && (err.message.includes('401') || err.message.includes('403') || err.message.toLowerCase().includes('invalid'))) {
                            navigate('/login');
                            return;
                        }

                        // If we've exhausted all attempts, AUTO RELOAD
                        // This fixes the "Failed to fetch" race condition by forcing a fresh browser context
                        if (attempts >= maxAttempts) {
                            console.log("Max attempts reached, reloading page...");
                            setStatus("Refreshing connection...");
                            window.location.reload();
                            return;
                        }
                    }
                }
            } else {
                navigate('/login');
            }
        };

        processAuth();
    }, [searchParams, navigate]);

    // Always show spinner - never an error screen
    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
            <div className="flex flex-col items-center animate-in fade-in duration-700">
                <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-6"></div>
                <p className="text-gray-400 text-lg font-medium tracking-wide">{status}</p>
                <p className="text-gray-600 text-sm mt-2">Setting up your workspace...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
