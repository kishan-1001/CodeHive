import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-8">Welcome</h1>
        <p className="text-xl text-gray-400 mb-8">You have successfully signed in!</p>
        <button
          onClick={handleLogout}
          className="bg-amber-400 text-black font-bold py-3 px-6 rounded-lg hover:bg-amber-300 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Landing;
