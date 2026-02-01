import React, { useState } from 'react';
import { Search, ChevronRight, Code, FileText } from 'lucide-react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { languages, topics } from '../data/resources';

const Resources: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'languages' | 'topics'>('languages');
    const [searchQuery, setSearchQuery] = useState('');

    const handleResourceClick = (type: 'language' | 'topic', id: string) => {
        // For now, we'll open a modal to show resources if available
        // In a real app, you might navigate to a dedicated page
        const item = type === 'language' ? languages.find(l => l.id === id) : topics.find(t => t.id === id);
        if (item && item.resources && item.resources.length > 0) {
            navigate(`/resources/${type}/${id}`);
        } else {
            // If no specific resources are listed, navigate to a generic page or show a message
            navigate(`/resources/${type}/${id}`);
        }
    };

    const filteredLanguages = languages.filter(lang =>
        lang.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredTopics = topics.filter(topic =>
        topic.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-950 pt-24 pb-12 px-6">
            <Header />
            <div className="max-w-7xl mx-auto">
                {/* Search and Tabs */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <div className="flex bg-gray-900/50 p-1 rounded-xl border border-gray-800">
                        <button
                            onClick={() => setActiveTab('languages')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'languages'
                                ? 'bg-amber-500 text-gray-900 shadow-lg shadow-amber-500/20'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            Languages
                        </button>
                        <button
                            onClick={() => setActiveTab('topics')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'topics'
                                ? 'bg-amber-500 text-gray-900 shadow-lg shadow-amber-500/20'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            Topics
                        </button>
                    </div>

                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-800 rounded-xl leading-5 bg-gray-900/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300 sm:text-sm"
                        />
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {activeTab === 'languages' ? (
                        filteredLanguages.map((lang) => (
                            <div
                                key={lang.id}
                                onClick={() => handleResourceClick('language', lang.id)}
                                className={`group relative bg-gray-900/40 backdrop-blur-sm border ${lang.border} rounded-2xl p-6 hover:bg-gray-800/60 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden`}
                            >
                                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                                    <Code className="w-24 h-24" />
                                </div>

                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl ${lang.bg} flex items-center justify-center text-2xl`}>
                                        {lang.icon}
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 bg-gray-800 px-2 py-1 rounded-md border border-gray-700">
                                        {lang.count} Resources
                                    </span>
                                </div>

                                <h3 className={`text-xl font-bold ${lang.color} mb-2`}>{lang.name}</h3>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                    Comprehensive guides, documentation, and best practices for {lang.name} programming.
                                </p>

                                <div className="flex items-center text-sm text-gray-400 group-hover:text-white transition-colors">
                                    <span>View Resources</span>
                                    <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))
                    ) : (
                        filteredTopics.map((topic) => (
                            <div
                                key={topic.id}
                                onClick={() => handleResourceClick('topic', topic.id)}
                                className={`group relative bg-gray-900/40 backdrop-blur-sm border ${topic.border} rounded-2xl p-6 hover:bg-gray-800/60 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden`}
                            >
                                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                                    <FileText className="w-24 h-24" />
                                </div>

                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl ${topic.bg} flex items-center justify-center text-2xl`}>
                                        {topic.icon}
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 bg-gray-800 px-2 py-1 rounded-md border border-gray-700">
                                        {topic.count} Resources
                                    </span>
                                </div>

                                <h3 className={`text-xl font-bold ${topic.color} mb-2`}>{topic.name}</h3>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                    Deep dive into {topic.name} with curated articles, tutorials, and cheat sheets.
                                </p>

                                <div className="flex items-center text-sm text-gray-400 group-hover:text-white transition-colors">
                                    <span>View Resources</span>
                                    <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Empty State */}
                {((activeTab === 'languages' && filteredLanguages.length === 0) ||
                    (activeTab === 'topics' && filteredTopics.length === 0)) && (
                        <div className="text-center py-20">
                            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gray-800/50 mb-4">
                                <Search className="w-8 h-8 text-gray-500" />
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">No resources found</h3>
                            <p className="text-gray-400">
                                We couldn't find any {activeTab} matching "{searchQuery}".
                            </p>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default Resources;
