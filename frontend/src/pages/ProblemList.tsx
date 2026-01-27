import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Check,
  Terminal,
  Code2,
  Cpu,
  Database,
  Globe,
  Layout,
  Server,
  Smartphone,
  Trophy
} from 'lucide-react';
import Header from '../components/Header';
import { problemsAPI } from '../services/api';

interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: { name: string; slug: string }[];
  solved?: boolean;
}

const ProblemList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [searchId, setSearchId] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Solved' | 'Unsolved'>('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Initial topic from URL
  const topicSlug = searchParams.get('topic');

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      try {
        // Fetch all problems first, we'll filter client-side for better UX on this page
        // or fetch with minimal filters if the API supports it. 
        // Based on previous code, the API supports topic, difficulty, and title search.
        // For the rich client-side search/filter experience with pagination, 
        // it's often better to fetch the dataset (if not huge) or use debounced API calls.
        // Given the current API structure, let's fetch based on topic and then refine client-side
        // to handle the complex combinations (ID, multi-filter) without over-fetching.

        const data = await problemsAPI.getProblems(
          topicSlug || undefined,
          undefined, // Fetch all difficulties to allow client-side toggling
          undefined  // Fetch all titles
        );
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [topicSlug]);

  // Filter Logic
  const filteredProblems = problems.filter(problem => {
    const matchesSearch =
      problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.id.toString().includes(searchQuery) ||
      (searchId && problem.id.toString() === searchId);

    const matchesDifficulty = selectedDifficulty === 'All' || problem.difficulty === selectedDifficulty;

    // Note: 'solved' property needs to be present in the API response. 
    // If not, this filter might need adjustment or "All" default.
    const matchesStatus = selectedStatus === 'All' ||
      (selectedStatus === 'Solved' && problem.solved) ||
      (selectedStatus === 'Unsolved' && !problem.solved);

    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);
  const paginatedProblems = filteredProblems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProblemClick = (problemId: number) => {
    const url = topicSlug
      ? `/problems/${problemId}?topic=${topicSlug}`
      : `/problems/${problemId}`;
    navigate(url);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Hard': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getTopicIcon = (topicName: string) => {
    // Simple mapping for visual flair
    const lower = topicName.toLowerCase();
    if (lower.includes('array') || lower.includes('string')) return <Code2 className="w-3 h-3" />;
    if (lower.includes('tree') || lower.includes('graph')) return <Trophy className="w-3 h-3" />;
    if (lower.includes('dynamic')) return <Cpu className="w-3 h-3" />;
    if (lower.includes('db') || lower.includes('sql')) return <Database className="w-3 h-3" />;
    return <Terminal className="w-3 h-3" />;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-amber-500/30">
      <Header />

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] opacity-30"></div>
      </div>

      <main className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2 text-gray-400 text-sm">
                <span
                  onClick={() => navigate('/')}
                  className="hover:text-amber-400 cursor-pointer transition-colors"
                >
                  Home
                </span>
                <span>/</span>
                <span className="text-amber-400">Problems</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
                {topicSlug ? topicSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Problem Set'}
              </h1>
              <p className="text-gray-400 max-w-xl">
                Master your algorithmic skills with our curated collection of coding challenges.
              </p>
            </div>

            {/* Quick Stats or Action */}
            <div className="flex items-center gap-3 bg-gray-900/50 p-1 rounded-lg border border-gray-800 backdrop-blur-sm">
              <div className="px-4 py-2 text-center border-r border-gray-800">
                <div className="text-xl font-bold text-white">{problems.length}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Total</div>
              </div>
              <div className="px-4 py-2 text-center">
                <div className="text-xl font-bold text-emerald-400">
                  {problems.filter(p => p.solved).length}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Solved</div>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-800 backdrop-blur-sm shadow-xl">
            <div className="md:col-span-5 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-400 transition-colors" />
              <input
                type="text"
                placeholder="Search problems by title or ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-black/50 border border-gray-800 text-sm rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-gray-600"
              />
            </div>

            <div className="md:col-span-7 flex flex-wrap md:flex-nowrap gap-3">
              {/* Difficulty Filter */}
              <div className="relative flex-1 min-w-[140px]">
                <select
                  value={selectedDifficulty}
                  onChange={(e) => {
                    setSelectedDifficulty(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none bg-black/50 border border-gray-800 text-gray-300 text-sm rounded-lg px-4 py-2.5 outline-none focus:border-amber-500/50 transition-all cursor-pointer hover:border-gray-700"
                >
                  <option value="All">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative flex-1 min-w-[140px]">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none bg-black/50 border border-gray-800 text-gray-300 text-sm rounded-lg px-4 py-2.5 outline-none focus:border-amber-500/50 transition-all cursor-pointer hover:border-gray-700"
                >
                  <option value="All">All Status</option>
                  <option value="Solved">Solved</option>
                  <option value="Unsolved">Unsolved</option>
                </select>
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 text-sm animate-pulse">Loading problems...</p>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No problems found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDifficulty('All');
                setSelectedStatus('All');
              }}
              className="mt-6 px-4 py-2 bg-amber-500/10 text-amber-500 text-sm font-medium rounded-lg hover:bg-amber-500/20 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {/* Problem Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {paginatedProblems.map((problem) => (
                <div
                  key={problem.id}
                  onClick={() => handleProblemClick(problem.id)}
                  className="group relative bg-gray-900/40 hover:bg-gray-800/60 border border-gray-800 hover:border-gray-700 rounded-xl p-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1 overflow-hidden"
                >
                  {/* Hover Gradient Line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/0 to-transparent group-hover:via-amber-500/50 transition-all duration-500"></div>

                  <div className="flex justify-between items-start mb-4">
                    <div className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </div>
                    {problem.solved && (
                      <div className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-[10px] font-medium border border-emerald-400/20">
                        <Check className="w-3 h-3" />
                        <span>Solved</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-100 group-hover:text-amber-400 transition-colors mb-2 line-clamp-1" title={problem.title}>
                    {problem.id}. {problem.title}
                  </h3>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {problem.topics.slice(0, 3).map((topic, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-500 bg-black/30 px-2 py-1 rounded border border-gray-800/50 group-hover:border-gray-700 transition-colors">
                        {getTopicIcon(topic.name)}
                        {topic.name}
                      </div>
                    ))}
                    {problem.topics.length > 3 && (
                      <span className="text-xs text-gray-600 px-1 py-1">+{problem.topics.length - 3}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-800 bg-gray-900/50 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first, last, current, and adjacent pages
                      return page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, index, array) => {
                      // Add ellipsis if gap exists
                      const showEllipsis = index > 0 && page - array[index - 1] > 1;
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && <span className="text-gray-600 px-1">...</span>}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${currentPage === page
                                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                : 'bg-gray-900/50 text-gray-400 border border-gray-800 hover:border-gray-600 hover:text-white'
                              }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })
                  }
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-800 bg-gray-900/50 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ProblemList;
