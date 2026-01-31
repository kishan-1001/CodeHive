import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { roomAPI, problemsAPI } from '../../services/api';
import { Box, Code2, Clock, List, LayoutGrid, Search, Loader2 } from 'lucide-react';

const CreateRoom: React.FC = () => {
    const navigate = useNavigate();
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [problemCount, setProblemCount] = useState<number>(3);
    const [timeLimit, setTimeLimit] = useState<number>(30);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dynamic Topics State
    const [availableTopics, setAvailableTopics] = useState<any[]>([]);
    const [loadingTopics, setLoadingTopics] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const res = await problemsAPI.getTopics();
                // Expecting res to be array of { name, slug, total_problems, ... }
                // Sort by name for better UX
                if (Array.isArray(res)) {
                    setAvailableTopics(res.sort((a: any, b: any) => a.name.localeCompare(b.name)));
                }
            } catch (error) {
                console.error("Failed to fetch topics:", error);
                // Fallback to basic topics if API fails
                setAvailableTopics([
                    { name: 'Array' }, { name: 'String' }, { name: 'Hash Table' },
                    { name: 'Dynamic Programming' }, { name: 'Math' }, { name: 'Sorting' },
                    { name: 'Greedy' }, { name: 'Depth-First Search' }, { name: 'Binary Search' },
                    { name: 'Tree' }, { name: 'Graph' }
                ]);
            } finally {
                setLoadingTopics(false);
            }
        };
        fetchTopics();
    }, []);

    const toggleTopic = (topicName: string) => {
        if (selectedTopics.includes(topicName)) {
            setSelectedTopics(selectedTopics.filter(t => t !== topicName));
        } else {
            setSelectedTopics([...selectedTopics, topicName]);
        }
    };

    const handleCreate = async () => {
        if (selectedTopics.length === 0) {
            alert('Please select at least one topic');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await roomAPI.createRoom(selectedTopics, problemCount, timeLimit);
            navigate(`/hive-battles/${response.roomId}`);
        } catch (error: any) {
            console.error('Failed to create room:', error);
            alert(error.message || 'Failed to create room');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredTopics = availableTopics.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-amber-500/30">
            <Header />

            <div className="pt-24 px-6 pb-20 max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                        Create HiveBattle
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Host a private coding room, challenge friends, and see who codes faster.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left Column: Config */}
                    <div className="space-y-6">
                        {/* Problem Count */}
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50">
                            <label className="flex items-center gap-3 text-lg font-medium text-white mb-4">
                                <List className="w-5 h-5 text-amber-400" />
                                Problem Count
                            </label>
                            <div className="flex gap-4">
                                {[1, 2, 3, 4, 5].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => setProblemCount(num)}
                                        className={`w-12 h-12 rounded-xl font-bold transition-all ${problemCount === num
                                            ? 'bg-amber-400 text-gray-900 scale-110 shadow-lg shadow-amber-400/20'
                                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Time Limit */}
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50">
                            <label className="flex items-center gap-3 text-lg font-medium text-white mb-4">
                                <Clock className="w-5 h-5 text-amber-400" />
                                Time Limit (Minutes)
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {[15, 30, 45, 60, 90].map(time => (
                                    <button
                                        key={time}
                                        onClick={() => setTimeLimit(time)}
                                        className={`px-6 py-3 rounded-xl font-medium transition-all ${timeLimit === time
                                            ? 'bg-amber-400 text-gray-900 shadow-lg shadow-amber-400/20'
                                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                            }`}
                                    >
                                        {time} min
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Topics */}
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 flex flex-col h-[500px]">
                        <div className="flex items-center justify-between mb-4">
                            <label className="flex items-center gap-3 text-lg font-medium text-white">
                                <Box className="w-5 h-5 text-amber-400" />
                                Select Topics
                            </label>
                            <span className="text-gray-500 text-sm">
                                {selectedTopics.length} selected
                            </span>
                        </div>

                        {/* Search Bar */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search topics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all"
                            />
                        </div>

                        <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
                            {loadingTopics ? (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-amber-500/50" />
                                    <span>Loading topics...</span>
                                </div>
                            ) : filteredTopics.length > 0 ? (
                                <div className="flex flex-wrap gap-2 content-start">
                                    {filteredTopics.map(topic => (
                                        <button
                                            key={topic.name}
                                            onClick={() => toggleTopic(topic.name)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all text-left ${selectedTopics.includes(topic.name)
                                                ? 'bg-amber-400/20 border-amber-400 text-amber-400'
                                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-700'
                                                }`}
                                        >
                                            {topic.name}
                                            {topic.total_problems && <span className="ml-1.5 text-xs opacity-50">({topic.total_problems})</span>}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-600 mt-10 italic">
                                    No topics found matching "{searchQuery}"
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="mt-12 flex justify-end items-center gap-6">
                    <button
                        onClick={() => navigate('/hive-battles')} // Go back to landing
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={isSubmitting || selectedTopics.length === 0}
                        className={`px-10 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 ${isSubmitting || selectedTopics.length === 0
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 shadow-xl shadow-amber-500/20'
                            }`}
                    >
                        <LayoutGrid className="w-5 h-5" />
                        {isSubmitting ? 'Creating...' : 'Create Room'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateRoom;
