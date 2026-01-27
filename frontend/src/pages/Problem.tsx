import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { problemsAPI } from '../services/api';
import { Search, Compass, Share2, Cpu, Database } from 'lucide-react';

interface Topic {
  id: number;
  name: string;
  slug: string;
  total_problems: number;
  solved_problems: number;
}

interface CategoryDisplay {
  title: string;
  icon: React.ElementType;
  topics: Topic[];
}

// Define specific topics that belong to certain categories
const CATEGORY_MAPPINGS: Record<string, string[]> = {
  Foundations: ["Array", "String", "Linked List", "Stack", "Queue", "Hash Table", "Heap", "Sliding Window", "Two Pointers"],
  "Trees & Graphs": ["Binary Tree", "Binary Search Tree", "BFS", "DFS", "Graph", "Trie", "Union Find"],
  "Advanced Algorithms": ["Dynamic Programming", "Backtracking", "Bit Manipulation", "Greedy", "Recursion", "Divide and Conquer", "Math", "Geometry"]
};

const Problem: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  // Data State
  const [categories, setCategories] = useState<CategoryDisplay[]>([]);

  // Search States
  const [searchId, setSearchId] = useState<string>('');
  const [searchTitle, setSearchTitle] = useState<string>('');
  const [searchTopic, setSearchTopic] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const topicsData: Topic[] = await problemsAPI.getTopics();

        // Categorize topics
        const newCategories: CategoryDisplay[] = [
          { title: "Foundations", icon: Compass, topics: [] },
          { title: "Trees & Graphs", icon: Share2, topics: [] },
          { title: "Advanced Algorithms", icon: Cpu, topics: [] },
          { title: "Other Topics", icon: Database, topics: [] }
        ];

        topicsData.forEach(topic => {
          let placed = false;
          // Check if topic belongs to a specific category
          for (const [catTitle, keywords] of Object.entries(CATEGORY_MAPPINGS)) {
            if (keywords.some(k => topic.name.toLowerCase() === k.toLowerCase())) {
              const catIndex = newCategories.findIndex(c => c.title === catTitle);
              if (catIndex !== -1) {
                newCategories[catIndex].topics.push(topic);
                placed = true;
                break;
              }
            }
          }
          // If not placed in specific category, put in Others
          if (!placed) {
            newCategories[3].topics.push(topic);
          }
        });

        // Remove empty categories if needed, or keep them to show structure
        // We will keep them for now, but sort topics inside alphabetically? or by count?
        newCategories.forEach(c => c.topics.sort((a, b) => a.name.localeCompare(b.name)));

        setCategories(newCategories);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load topics.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/home');
  };

  const handleTopicClick = (slug: string) => {
    navigate(`/problems?topic=${slug}`);
  };

  const handleIdSearch = () => {
    if (searchId.trim()) {
      navigate(`/problems/${searchId.trim()}`, { state: { from: '/problem' } });
    }
  };

  const handleTitleSearch = async () => {
    if (!searchTitle.trim()) return;
    try {
      const results = await problemsAPI.getProblems(undefined, undefined, searchTitle.trim());
      if (results && results.length > 0) {
        navigate(`/problems/${results[0].id}`, { state: { from: '/problem' } });
      } else {
        console.log('No problem found');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter categories based on topic search
  const filteredCategories = categories.map(cat => ({
    ...cat,
    topics: cat.topics.filter(t => t.name.toLowerCase().includes(searchTopic.toLowerCase()))
  })).filter(cat => cat.topics.length > 0);



  return (
    <div className="min-h-screen bg-[#0b0e14] text-white selection:bg-amber-400/30 font-sans">
      <Header onSignOut={handleLogout} />

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3 tracking-tight">DSA Topics</h1>
          <p className="text-gray-400 text-lg">Track your progress and master data structures & algorithms.</p>

          {/* Search Bar Container */}
          <div className="mt-8 flex flex-col md:flex-row gap-4">
            {/* ID Search */}
            <div className="relative group min-w-[120px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 font-mono text-xs">ID</span>
              </div>
              <input
                type="number"
                placeholder=""
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleIdSearch()}
                className="w-full bg-[#151b26] border border-gray-800 rounded-xl py-3 pl-8 pr-4 text-sm text-gray-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-gray-600"
              />
            </div>

            {/* Title Search */}
            <div className="relative group flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Question Title..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSearch()}
                className="w-full bg-[#151b26] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-gray-600"
              />
            </div>

            {/* Topic Search */}
            <div className="relative group flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search topics..."
                value={searchTopic}
                onChange={(e) => setSearchTopic(e.target.value)}
                className="w-full bg-[#151b26] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredCategories.map((category, idx) => {
              const totalSolvedInCategory = category.topics.reduce((acc, t) => acc + t.solved_problems, 0);
              const totalProblemsInCategory = category.topics.reduce((acc, t) => acc + t.total_problems, 0);

              return (
                <div key={idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg bg-${idx === 0 ? 'amber' : idx === 1 ? 'green' : idx === 2 ? 'blue' : 'purple'}-500/10`}>
                      <category.icon className={`w-5 h-5 text-${idx === 0 ? 'amber' : idx === 1 ? 'green' : idx === 2 ? 'blue' : 'purple'}-500`} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-100">{category.title}</h2>
                    <span className="ml-auto text-sm text-gray-500 font-medium">
                      {totalSolvedInCategory}/{totalProblemsInCategory} Solved
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {category.topics.map((topic, tIdx) => {
                      // Real solved count from backend
                      const solved = topic.solved_problems;
                      const percentage = topic.total_problems > 0 ? Math.round((solved / topic.total_problems) * 100) : 0;

                      return (
                        <div
                          key={tIdx}
                          onClick={() => handleTopicClick(topic.slug)}
                          className="group bg-[#11161f] border border-gray-800/60 rounded-xl p-5 hover:border-gray-700 hover:bg-[#161c26] transition-all cursor-pointer relative overflow-hidden"
                        >
                          <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${idx === 0 ? 'from-amber-500 to-orange-600' : idx === 1 ? 'from-green-500 to-emerald-600' : idx === 2 ? 'from-blue-500 to-indigo-600' : 'from-purple-500 to-pink-600'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-semibold text-gray-200 group-hover:text-white transition-colors">{topic.name}</h3>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between text-xs text-gray-500">
                              <span><span className="text-gray-300 font-medium">{solved}</span> / {topic.total_problems} Solved</span>
                              <span className={`${percentage > 50 ? 'text-green-400' : 'text-gray-400'}`}>{percentage}%</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-1.5 w-full bg-gray-800/80 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-green-500' : idx === 2 ? 'bg-blue-600' : 'bg-purple-500'}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
};

export default Problem;
