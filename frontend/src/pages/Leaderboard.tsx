import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/home');
  };

  return (
    <div className="relative min-h-screen selection:bg-amber-400/30">
      <Header onSignOut={handleLogout} />
      <div className="pt-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to Leaderboard</h1>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
