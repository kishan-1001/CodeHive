import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Menu, X, Download, FileText, Home } from 'lucide-react';
import Header from '../components/Header';
import { languages, topics } from '../data/resources';
import type { ResourceCategory, ResourceItem } from '../data/resources';
const ResourceViewer: React.FC = () => {
    const { type, id } = useParams<{ type: string; id: string }>();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeCategory, setActiveCategory] = useState<ResourceCategory | undefined>(undefined);
    const [activeResource, setActiveResource] = useState<ResourceItem | undefined>(undefined);

    // Determine if we are looking at languages or topics
    useEffect(() => {
        let category: ResourceCategory | undefined;
        if (type === 'language') {
            category = languages.find(l => l.id === id);
        } else if (type === 'topic') {
            category = topics.find(t => t.id === id);
        }

        setActiveCategory(category);

        // Default to first resource if available
        if (category?.resources && category.resources.length > 0) {
            setActiveResource(category.resources[0]);
        }
    }, [type, id]);

    if (!activeCategory) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Resource Not Found</h2>
                    <button
                        onClick={() => navigate('/resources')}
                        className="text-amber-500 hover:text-amber-400 font-medium"
                    >
                        Back to Resources
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-950 pt-16 overflow-hidden">
            <Header />
            {/* Mobile Sidebar Toggle */}
            <button
                className="md:hidden fixed top-20 left-4 z-50 p-2 bg-gray-800 rounded-lg text-white shadow-lg"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-40 w-72 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 pt-16 md:pt-0
            `}>
                <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900">
                        <h2 className={`text-lg font-bold ${activeCategory.color} flex items-center gap-2`}>
                            <span className="text-2xl">{activeCategory.icon}</span>
                            {activeCategory.name}
                        </h2>
                        <button
                            onClick={() => navigate('/resources')}
                            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="Back to Resources Home"
                        >
                            <Home size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
                        {activeCategory.resources?.map((res, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setActiveResource(res);
                                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3
                                    ${activeResource === res
                                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                    }
                                `}
                            >
                                <FileText size={16} className={activeResource === res ? 'text-amber-500' : 'text-gray-600'} />
                                {res.name}
                            </button>
                        ))}

                        {(!activeCategory.resources || activeCategory.resources.length === 0) && (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                No chapters available yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full bg-gray-950 relative overflow-hidden">
                {activeResource ? (
                    <>
                        {/* Toolbar */}
                        <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 p-4 flex items-center justify-between">
                            <h1 className="text-xl font-bold text-white truncate max-w-xl">
                                {activeResource.name}
                            </h1>
                            <div className="flex items-center gap-2">
                                <a
                                    href={activeResource.path}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 rounded-lg text-sm font-bold transition-colors"
                                >
                                    <Download size={16} />
                                    <span className="hidden sm:inline">Download PDF</span>
                                </a>
                            </div>
                        </div>

                        {/* PDF Viewer */}
                        <div className="flex-1 overflow-hidden relative bg-gray-900 flex items-center justify-center">
                            <iframe
                                src={`${activeResource.path}#toolbar=0&navpanes=0`}
                                className="w-full h-full border-none"
                                title={activeResource.name}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                        <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6">
                            <FileText size={40} className="text-gray-600" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">Select a chapter to start reading</h3>
                        <p className="max-w-md text-gray-500">
                            Choose a topic from the sidebar to view the learning material.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResourceViewer;
