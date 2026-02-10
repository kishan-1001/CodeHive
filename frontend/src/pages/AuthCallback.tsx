import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { authAPI } from '../services/api';

const AuthCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        const processAuth = async () => {
            const token = searchParams.get('token');

            if (token) {
                // Determine if we need to retry
                let attempts = 0;
                const maxAttempts = 3;

                while (attempts < maxAttempts) {
                    try {
                        // Store token first
                        sessionStorage.setItem('token', token);

                        // Small delay on first attempt to allow storage to settle/browser to be ready
                        if (attempts === 0) await new Promise(resolve => setTimeout(resolve, 100));

                        const user = await authAPI.getMe();
                        // Store user info
                        sessionStorage.setItem('user', JSON.stringify(user));
                        navigate('/explore', { replace: true });
                        return; // Success, exit
                    } catch (err: any) {
                        console.error(`Auth verification attempt ${attempts + 1} failed`, err);
                        attempts++;

                        if (attempts >= maxAttempts) {
                            setError(err.message || 'Authentication failed. Please try again.');
                        } else {
                            // Wait before retrying (exponential backoff: 300ms, 600ms...)
                            await new Promise(resolve => setTimeout(resolve, 300 * attempts));
                        }
                    }
                }
            } else {
                navigate('/login');
            }
        };

        processAuth();
    }, [searchParams, navigate]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white gap-4">
                <div className="text-red-500">{error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-amber-500 rounded text-black font-bold hover:bg-amber-600 transition"
                >
                    Retry Login
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400">Authenticating...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
