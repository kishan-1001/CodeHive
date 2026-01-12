import { Briefcase, Heart, Zap, Globe, Coffee, ArrowRight, MapPin } from 'lucide-react';

const Career = () => {
    const perks = [
        {
            icon: <Globe className="w-6 h-6 text-blue-400" />,
            title: "Remote First",
            description: "Work from anywhere in the world. We believe in talent, not geography."
        },
        {
            icon: <Zap className="w-6 h-6 text-yellow-400" />,
            title: "High Performance",
            description: "Work with the latest tech stack and solve complex, interesting problems."
        },
        {
            icon: <Heart className="w-6 h-6 text-red-400" />,
            title: "Health & Wellness",
            description: "Comprehensive health coverage and wellness programs for you and your family."
        },
        {
            icon: <Coffee className="w-6 h-6 text-amber-400" />,
            title: "Work-Life Balance",
            description: "Flexible hours and unlimited PTO. We trust you to manage your time."
        }
    ];

    const jobs = [
        {
            id: 1,
            title: "Senior Full Stack Engineer",
            department: "Engineering",
            location: "Remote / New York",
            type: "Full-time",
            description: "We are looking for an experienced Full Stack Engineer to help build our core platform..."
        },
        {
            id: 2,
            title: "UI/UX Designer",
            department: "Design",
            location: "Remote",
            type: "Full-time",
            description: "Shape the future of our product design. You'll work closely with engineering and product..."
        },
        {
            id: 3,
            title: "DevOps Engineer",
            department: "Infrastructure",
            location: "London, UK",
            type: "Contract",
            description: "Help us scale our infrastructure and improve our developer experience with modern CI/CD..."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-white pt-20 pb-10">
            {/* Hero Section */}
            <div className="relative overflow-hidden mb-20">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto px-6 py-24 text-center relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-6 border border-blue-500/20">
                        We're Hiring
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-gray-400">
                        Join the Hive
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                        Build the future of coding with us. We're a team of passionate developers, designers, and creators working on the next generation of developer tools.
                    </p>
                    <div className="flex justify-center gap-4">
                        <a href="#openings" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20">
                            View Openings
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Perks Section */}
            <div className="max-w-7xl mx-auto px-6 mb-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Why CodeHive?</h2>
                    <p className="text-gray-400">More than just a job, it's a place to grow.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {perks.map((perk, index) => (
                        <div key={index} className="glass-card p-6 rounded-2xl border border-gray-800 hover:border-blue-500/30 transition-all hover:bg-gray-900/50 group">
                            <div className="mb-4 p-3 bg-gray-900/50 rounded-xl w-fit group-hover:scale-110 transition-transform">
                                {perk.icon}
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{perk.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{perk.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Openings Section */}
            <div id="openings" className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Open Positions</h2>
                        <p className="text-gray-400">Find the role that fits you best.</p>
                    </div>
                    <div className="flex gap-2">
                        {/* Filter buttons could go here */}
                    </div>
                </div>

                <div className="grid gap-4">
                    {jobs.map((job) => (
                        <div key={job.id} className="glass-card p-6 rounded-2xl border border-gray-800 hover:border-blue-500/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group hover:translate-x-1">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-semibold group-hover:text-blue-400 transition-colors">{job.title}</h3>
                                    <span className="text-xs font-mono bg-gray-800 text-gray-300 px-2 py-1 rounded">
                                        {job.department}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {job.location}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Briefcase className="w-3 h-3" />
                                        {job.type}
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm max-w-2xl">{job.description}</p>
                            </div>
                            <button className="whitespace-nowrap bg-gray-800 hover:bg-blue-600 hover:text-white px-6 py-2.5 rounded-lg font-medium transition-all text-sm border border-gray-700 hover:border-blue-500 dark:text-gray-200">
                                Apply Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Career;
