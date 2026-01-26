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
                sessionStorage.setItem('token', token);
                try {
                    const user = await authAPI.getMe();
                    // Store user info if needed, e.g. for header
                    sessionStorage.setItem('user', JSON.stringify(user));
                    navigate('/explore');
                } catch (err: any) {
                    console.error('Auth verification failed', err);
                    setError(err.message || 'Authentication failed. Please try again.');
                    // Optional: navigate('/login') after delay
                }
            } else {
                navigate('/login');
            }
        };

        processAuth();
    }, [searchParams, navigate]);

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-white">
                <div className="text-red-500">{error}</div>
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
