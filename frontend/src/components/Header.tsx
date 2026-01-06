import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';

interface HeaderProps {
  onSignOut: () => void;
  onKnowledgeDropClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSignOut, onKnowledgeDropClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const navItems = [
    { name: 'Problem', path: '/problem' },
    { name: 'Instant Arena', path: '/contest' },
    { name: 'Weekly Contest', path: '/weekly-contest' },
    { name: 'Knowledge Drop', path: '/explore', isAction: true },
    { name: 'Leaderboard', path: '/leaderboard' },
  ];

  const handleNavClick = (item: { name: string; path: string; isAction?: boolean }) => {
    if (item.isAction && item.name === 'Knowledge Drop' && onKnowledgeDropClick) {
      onKnowledgeDropClick();
    } else {
      navigate(item.path);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center">
        <div
          className="text-2xl font-bold text-white cursor-pointer mr-auto"
          onClick={() => navigate('/home')}
        >
          Code<span className="text-amber-400">Hive</span>
        </div>

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
        </nav>

        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <User className="w-5 h-5 text-white" />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
              <button
                onClick={() => {
                  onSignOut();
                  setIsDropdownOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gray-700 rounded-lg"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
