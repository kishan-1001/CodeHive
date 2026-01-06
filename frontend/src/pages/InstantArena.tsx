import React from 'react';
import Header from '../components/Header';

const InstantArena: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    // navigate('/home'); // Assuming useNavigate is not needed here
  };

  return (
    <div className="relative min-h-screen selection:bg-amber-400/30">
      <Header onSignOut={handleLogout} />
      <div className="pt-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to Instant Arena</h1>
        </div>
      </div>
    </div>
  );
};

export default InstantArena;
