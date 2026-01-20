import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute: React.FC = () => {
    // Helper to decode JWT payload safely (basic decode, no validation)
    const getUserRole = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.role;
        } catch (e) {
            return null;
        }
    };

    const role = getUserRole();

    if (role !== 'admin') {
        // Redirect to home if not admin (or 403 page)
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
