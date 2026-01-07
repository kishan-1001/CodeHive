import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { problemsAPI } from '../services/api';

interface Topic {
  id: number;
  name: string;
  slug: string;
}

const Problem: React.FC = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/home');
  };

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await problemsAPI.getTopics();
        setTopics(data);
      } catch (error) {
        console.error('Error fetching topics:', error);
        setError('Failed to load topics. Please check if the backend is running and topics are inserted in the database.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const handleTopicClick = (topicSlug: string) => {
    navigate(`/problems?topic=${topicSlug}`);
  };

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen selection:bg-amber-400/30">
      {/* Background Orbs */}
      <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] -z-10"></div>

      <Header onSignOut={handleLogout} />

      <div className="pt-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">DSA Topics</h1>
            <p className="text-gray-400 mb-6">Explore problems by topic</p>
            <div className="max-w-md">
              <input
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredTopics.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-400">No topics found matching your search.</p>
                </div>
              ) : (
                filteredTopics.map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => handleTopicClick(topic.slug)}
                    className="bg-gray-800/50 rounded-full p-4 border border-gray-700 hover:border-amber-400/50 cursor-pointer transition-colors h-24 flex flex-col items-center justify-center text-center"
                  >
                    <h3 className="text-lg font-semibold text-white hover:text-amber-400 transition-colors">
                      {topic.name}
                    </h3>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Problem;
