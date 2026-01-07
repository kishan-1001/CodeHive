import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import { problemsAPI } from '../services/api';

interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: { name: string; slug: string }[];
}

const ProblemList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const topicSlug = searchParams.get('topic');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/home');
  };

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const data = await problemsAPI.getProblems(topicSlug || undefined);
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [topicSlug]);

  const handleProblemClick = (problemSlug: string) => {
    const url = topicSlug ? `/problems/${problemSlug}?topic=${topicSlug}` : `/problems/${problemSlug}`;
    navigate(url);
  };

  return (
    <div className="relative min-h-screen selection:bg-amber-400/30">
      {/* Background Orbs */}
      <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] -z-10"></div>

      <Header onSignOut={handleLogout} />

      <div className="pt-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            {topicSlug && (
              <button
                onClick={() => navigate('/problem')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white mb-4"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-3xl font-bold text-white mb-4">
              {topicSlug ? `Problems - ${topicSlug.replace('-', ' ')}` : 'All Problems'}
            </h1>
            <p className="text-gray-400">Solve coding problems to improve your skills</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : problems.length === 0 ? (
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 text-center">
              <p className="text-gray-400">No problems found for this topic.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {problems.map((problem) => (
                <div
                  key={problem.id}
                  onClick={() => handleProblemClick(problem.id.toString())}
                  className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 hover:border-amber-400/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white hover:text-amber-400 transition-colors mb-2">
                        {problem.id}. {problem.title}
                      </h3>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ml-4 ${
                      problem.difficulty === 'Easy' ? 'text-green-400 bg-green-400/10' :
                      problem.difficulty === 'Medium' ? 'text-amber-400 bg-amber-400/10' :
                      'text-red-400 bg-red-400/10'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {problem.topics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="text-xs text-gray-400 bg-gray-700 px-3 py-1 rounded-full"
                      >
                        {topic.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemList;
