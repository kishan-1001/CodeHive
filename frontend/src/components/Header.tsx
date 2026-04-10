import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import { authAPI } from '../services/api';

interface HeaderProps {
  onSignOut?: () => void;
  onKnowledgeDropClick?: () => void;
}

interface UserData {
  name: string;
  email: string;
  avatar_url: string | null;
}

const Header: React.FC<HeaderProps> = ({ onSignOut, onKnowledgeDropClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authAPI.getMe();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user in header', error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSignOut = () => {
    sessionStorage.removeItem('token');
    localStorage.removeItem('token'); // Clear both to be safe/consistent
    navigate('/home');
  }

  const navItems = [
    { name: 'Problem', path: '/problem' },
    { name: 'HiveBattles', path: '/hive-battles' }, // New HiveBattles Room Feature
    { name: 'Instant Arena', path: '/contest' },
    { name: 'Weekly Contest', path: '/weekly-contest' },
    { name: 'Resources', path: '/resources' },
    { name: 'Knowledge Drop', path: '/explore', isAction: true },
  ];

  const [isLeaderboardHovered, setIsLeaderboardHovered] = useState(false);

  const handleNavClick = (item: { name: string; path: string; isAction?: boolean }) => {
    if (item.isAction && item.name === 'Knowledge Drop' && onKnowledgeDropClick) {
      onKnowledgeDropClick();
    } else {
      navigate(item.path);
    }
    setIsMobileMenuOpen(false);
  };

  const getAvatarSrc = (path: string | null) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/api')) return path;
    return `/api${path.startsWith('/') ? path : `/${path}`}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div
          className="text-2xl font-bold text-white cursor-pointer"
          onClick={() => navigate('/home')}
        >
          Code<span className="text-amber-400">Hive</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 mr-8">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavClick(item)}
              className="text-gray-300 hover:text-amber-400 font-medium text-sm transition-colors"
            >
              {item.name}
            </button>
          ))}

          <div
            className="relative h-full flex items-center"
            onMouseEnter={() => setIsLeaderboardHovered(true)}
            onMouseLeave={() => setIsLeaderboardHovered(false)}
          >
            <button
              className={`flex items-center text-gray-300 hover:text-amber-400 font-medium text-sm transition-colors focus:outline-none ${isLeaderboardHovered ? 'text-amber-400' : ''}`}
            >
              Leaderboard
              <ChevronDown className={`ml-1 w-4 h-4 transition-transform duration-200 ${isLeaderboardHovered ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isLeaderboardHovered && (
              <div
                className="absolute top-full left-0 pt-2 w-40 z-50"
              >
                <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 overflow-hidden">
                  <button
                    onClick={() => {
                      navigate('/leaderboard');
                      setIsLeaderboardHovered(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    CodeHive
                  </button>
                  <button
                    onClick={() => {
                      navigate('/global-leaderboard');
                      setIsLeaderboardHovered(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    Global
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors overflow-hidden border border-gray-700"
              aria-label="User Menu"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              {user?.avatar_url ? (
                <img
                  src={getAvatarSrc(user.avatar_url)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden z-50">
                {/* User Info Header in Dropdown - Optional but nice */}
                {user && (
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                )}
                <button
                  onClick={() => {
                    navigate('/profile');
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border-b border-gray-700"
                >
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    navigate('/coding-profile');
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border-b border-gray-700"
                >
                  <User className="w-4 h-4 mr-2" />
                  Coding Profile
                </button>
                <button
                  onClick={() => {
                    if (onSignOut) {
                      onSignOut();
                    } else {
                      handleSignOut();
                    }
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-6 py-4 space-y-4">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavClick(item)}
              className="block w-full text-left text-gray-300 hover:text-amber-400 font-medium text-base transition-colors py-2"
            >
              {item.name}
            </button>
          ))}
          <div className="border-t border-gray-800 my-2 pt-2">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Leaderboard</p>
            <button
              onClick={() => {
                navigate('/leaderboard');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left text-gray-300 hover:text-amber-400 font-medium text-base transition-colors py-2 pl-4"
            >
              CodeHive Leaderboard
            </button>
            <button
              onClick={() => {
                navigate('/global-leaderboard');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left text-gray-300 hover:text-amber-400 font-medium text-base transition-colors py-2 pl-4"
            >
              Global Leaderboard
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
