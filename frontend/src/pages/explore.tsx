import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import KnowledgeDropModal from '../components/KnowledgeDropModal';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [isKnowledgeDropOpen, setIsKnowledgeDropOpen] = useState(false);

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/home');
  };

  const handleKnowledgeDropClick = () => {
    setIsKnowledgeDropOpen(true);
  };

  return (
    <>
      <Header
        onSignOut={handleLogout}
        onKnowledgeDropClick={handleKnowledgeDropClick}
      />

      <KnowledgeDropModal
        isOpen={isKnowledgeDropOpen}
        onClose={() => setIsKnowledgeDropOpen(false)}
      />

      <div className="min-h-screen bg-gray-900 pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
            <h1 className="text-3xl font-bold text-white mb-4">Welcome back to CodeHive</h1>
            <p className="text-gray-400">
              Your Knowledge Drop dashboard. Select an option from the navigation bar to get started.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;
