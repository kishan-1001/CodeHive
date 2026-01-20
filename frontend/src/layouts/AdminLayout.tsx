import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileCode, Users, Trophy, LogOut } from 'lucide-react';

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/home');
    };

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/problems', icon: FileCode, label: 'Problems' },
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/contests', icon: Trophy, label: 'Contests' },
    ];

    return (
        <div className="flex h-screen bg-gray-950 text-white">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
                        CodeHive Admin
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === item.path
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-gray-950 p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
