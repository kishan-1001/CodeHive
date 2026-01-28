import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Play, Building2, BookOpen } from 'lucide-react';
import { arenaAPI } from '../services/api';
import Header from '../components/Header';

const COMPANIES = [
  'Meta',
  'Google',
  'Uber',
  'Bloomberg',
  'Amazon',
  'Microsoft',
  'Apple',
  'Infosys',
  'Citadel',
  'LinkedIn',
  'TikTok',
  'Adobe',
  'Oracle',
  'Nvidia',
  'Salesforce',
  'Goldman Sachs',
  'Snap',
  'DoorDash',
  'IBM',
  'Databricks',
  'Capital One',
  'Atlassian',
  'Snowflake',
  'J.P. Morgan',
  'Walmart Labs',
  'TCS',
  'Visa',
  'eBay',
  'Netflix',
  'ByteDance',
  'Airbnb',
  'Roblox',
  'Pinterest',
  'PayPal',
  'Accenture',
  'Yandex',
  'Intuit',
  'Tesla',
  'Zoho',
  'OpenAI',
  'ServiceNow',
  'DE Shaw',
  'X',
  'Qualcomm',
  'Palantir Technologies',
  'Yahoo',
  'Expedia',
  'Coupang',
  'Cisco',
  'Two Sigma',
  'Agoda',
  'Lyft',
  'Jane Street',
  'Stripe',
  'Cognizant',
  'Waymo',
  'Palo Alto Networks',
  'Nutanix',
  'Morgan Stanley',
  'Rubrik',
  'SAP',
  'Rippling',
  'Robinhood',
  'Swiggy',
  'Flipkart',
  'Samsung',
  'Hudson River Trading',
  'Coinbase',
  'Dropbox',
  'Booking.com',
  'MathWorks',
  'DocuSign',
  'Anduril',
  'Datadog',
  'PhonePe',
  'Squarepoint Capital',
  'Affirm',
  'Intel',
  'Capgemini',
  'Optiver',
  'VMware',
  'Arista Networks',
  'Spotify',
  'Akuna Capital',
  'Huawei',
  'MongoDB',
  'EPAM Systems',
  'Paytm',
  'Zillow',
  'Arcesium',
  'Block',
  'American Express',
  'Deloitte',
  'Wayfair',
  'BlackRock',
  'Myntra',
  'Media.net',
  'Deutsche Bank',
  'ZScaler',
  'GoDaddy'
];


const TOPICS = [
  'Array',
  'String',
  'Hash Table',
  'Math',
  'Dynamic Programming',
  'Sorting',
  'Greedy',

  'Depth-First Search',
  'Binary Search',
  'Database',
  'Matrix',
  'Bit Manipulation',
  'Tree',
  'Breadth-First Search',

  'Two Pointers',
  'Prefix Sum',
  'Heap (Priority Queue)',
  'Simulation',
  'Counting',
  'Graph',
  'Binary Tree',

  'Stack',
  'Sliding Window',
  'Enumeration',
  'Design',
  'Backtracking',
  'Union Find',
  'Number Theory',

  'Linked List',
  'Ordered Set',
  'Segment Tree',
  'Monotonic Stack',
  'Trie',
  'Divide and Conquer',
  'Combinatorics',

  'Bitmask',
  'Recursion',
  'Queue',
  'Geometry',
  'Binary Indexed Tree',
  'Memoization',
  'Hash Function',

  'Binary Search Tree',
  'Shortest Path',
  'String Matching',
  'Topological Sort',
  'Rolling Hash',
  'Game Theory',

  'Interactive',
  'Data Stream',
  'Monotonic Queue',
  'Brainteaser',
  'Doubly-Linked List',
  'Merge Sort',
  'Randomized',

  'Counting Sort',
  'Iterator',
  'Concurrency',
  'Quickselect',
  'Suffix Array',
  'Line Sweep',
  'Probability and Statistics',

  'Minimum Spanning Tree',
  'Bucket Sort',
  'Shell Sort',
  'Reservoir Sampling',
  'Strongly Connected Components',
  'Eulerian Circuit',

  'Radix Sort',
  'Rejection Sampling',
  'Biconnected Component'
];


const InstantArena: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [companySearch, setCompanySearch] = useState('');
  const [topicSearch, setTopicSearch] = useState('');
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isTopicDropdownOpen, setIsTopicDropdownOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/home');
  };

  const filteredCompanies = COMPANIES.filter(c =>
    c.toLowerCase().includes(companySearch.toLowerCase()) &&
    !selectedCompanies.includes(c)
  );

  const filteredTopics = TOPICS.filter(t =>
    t.toLowerCase().includes(topicSearch.toLowerCase()) &&
    !selectedTopics.includes(t)
  );

  const toggleCompany = (company: string) => {
    if (selectedCompanies.includes(company)) {
      setSelectedCompanies(selectedCompanies.filter(c => c !== company));
    } else {
      setSelectedCompanies([...selectedCompanies, company]);
    }
  };

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleStart = async () => {
    if (selectedCompanies.length === 0 || selectedTopics.length === 0) {
      alert('Please select at least one company and one topic.');
      return;
    }

    try {
      const response = await arenaAPI.createSession(selectedCompanies, selectedTopics);
      navigate(`/arena/${response.sessionId}`);
    } catch (error: any) {
      console.error('Failed to create arena session:', error);
      alert(error.message || 'Failed to start arena session');
    }
  };

  return (
    <div className="relative min-h-screen selection:bg-amber-400/30">
      {/* Background Orbs */}
      <div className="absolute top-20 left-20 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] -z-10"></div>
      <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[150px] -z-10"></div>

      <Header />

      <div className="pt-32 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">
              Instant <span className="text-amber-400">Arena</span>
            </h1>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">
              Select your target companies and topics to generate a custom coding assessment instantly.
            </p>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-700 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Company Selector */}
              <div className="space-y-4">
                <label className="text-white font-medium flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  Target Companies
                </label>
                <div className="relative">
                  <div
                    className="relative"
                  >
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search companies..."
                      value={companySearch}
                      onChange={(e) => {
                        setCompanySearch(e.target.value);
                        setIsCompanyDropdownOpen(true);
                      }}
                      onFocus={() => setIsCompanyDropdownOpen(true)}
                      className="w-full bg-gray-900/50 text-white pl-12 pr-4 py-4 rounded-xl border border-gray-600 focus:border-amber-400 outline-none transition-all"
                    />
                  </div>

                  {(isCompanyDropdownOpen && filteredCompanies.length > 0) && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 rounded-xl border border-gray-700 shadow-xl max-h-60 overflow-y-auto z-20">
                      {filteredCompanies.map(company => (
                        <div
                          key={company}
                          onClick={() => {
                            toggleCompany(company);
                            setCompanySearch('');
                            setIsCompanyDropdownOpen(false);
                          }}
                          className="px-4 py-3 hover:bg-gray-800 text-gray-300 hover:text-white cursor-pointer transition-colors"
                        >
                          {company}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Topic Selector */}
              <div className="space-y-4">
                <label className="text-white font-medium flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  Select Topics
                </label>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search topics..."
                      value={topicSearch}
                      onChange={(e) => {
                        setTopicSearch(e.target.value);
                        setIsTopicDropdownOpen(true);
                      }}
                      onFocus={() => setIsTopicDropdownOpen(true)}
                      className="w-full bg-gray-900/50 text-white pl-12 pr-4 py-4 rounded-xl border border-gray-600 focus:border-amber-400 outline-none transition-all"
                    />
                  </div>

                  {(isTopicDropdownOpen && filteredTopics.length > 0) && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 rounded-xl border border-gray-700 shadow-xl max-h-60 overflow-y-auto z-20">
                      {filteredTopics.map(topic => (
                        <div
                          key={topic}
                          onClick={() => {
                            toggleTopic(topic);
                            setTopicSearch('');
                            setIsTopicDropdownOpen(false);
                          }}
                          className="px-4 py-3 hover:bg-gray-800 text-gray-300 hover:text-white cursor-pointer transition-colors"
                        >
                          {topic}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selected Items Chips */}
            {(selectedCompanies.length > 0 || selectedTopics.length > 0) && (
              <div className="mb-8 space-y-4">
                {selectedCompanies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-gray-400 text-sm py-1.5 mr-2">Companies:</span>
                    {selectedCompanies.map(company => (
                      <div key={company} className="flex items-center gap-2 bg-blue-400/10 text-blue-400 px-3 py-1.5 rounded-full border border-blue-400/20">
                        <span className="text-sm font-medium">{company}</span>
                        <button
                          onClick={() => toggleCompany(company)}
                          className="hover:text-blue-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {selectedTopics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-gray-400 text-sm py-1.5 mr-2">Topics:</span>
                    {selectedTopics.map(topic => (
                      <div key={topic} className="flex items-center gap-2 bg-amber-400/10 text-amber-400 px-3 py-1.5 rounded-full border border-amber-400/20">
                        <span className="text-sm font-medium">{topic}</span>
                        <button
                          onClick={() => toggleTopic(topic)}
                          className="hover:text-amber-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleStart}
              disabled={selectedCompanies.length === 0 || selectedTopics.length === 0}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${selectedCompanies.length === 0 || selectedTopics.length === 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 hover:shadow-lg hover:shadow-amber-500/20'
                }`}
            >
              <Play className="w-5 h-5 fill-current" />
              Enter Arena
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstantArena;
