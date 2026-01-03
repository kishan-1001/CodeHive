import React, { useState, useEffect, useRef } from 'react';
import { 
  Code2, 
  Terminal, 
  Cpu, 
  Zap, 
  Globe, 
  ShieldCheck, 
  ArrowRight, 
  Github, 
  Twitter, 
  Layers, 
  Hexagon,
  Sparkles,
  MousePointer2,
  ChevronRight,
  Database,
  Cloud
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// --- Components ---

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-4 glass-card' : 'py-6 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight text-white">Code<span className="text-amber-400">Hive</span></span>

        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-gray-300 hover:text-white px-4 py-2 transition-colors">Sign In</button>
          <button className="text-sm font-bold bg-amber-400 text-black px-5 py-2.5 rounded-full hover:bg-amber-300 transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
            Join the Hive
          </button>
        </div>
      </div>
    </nav>
  );
};

const ActivityGraph: React.FC = () => {
  const data = [
    { time: '00:00', commits: 400, builds: 240 },
    { time: '04:00', commits: 300, builds: 139 },
    { time: '08:00', commits: 200, builds: 980 },
    { time: '12:00', commits: 278, builds: 390 },
    { time: '16:00', commits: 189, builds: 480 },
    { time: '20:00', commits: 239, builds: 380 },
    { time: '23:59', commits: 349, builds: 430 },
  ];

  return (
    <div className="w-full h-64 mt-8 glass-card rounded-2xl p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" /> Platform Pulse
        </h3>
        <span className="text-xs text-green-400 animate-pulse flex items-center gap-1">
          ● 12,402 Active Sessions
        </span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip 
            contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
            itemStyle={{ color: '#fbbf24' }}
          />
          <Area type="monotone" dataKey="commits" stroke="#fbbf24" fillOpacity={1} fill="url(#colorCommits)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-8">
            AI Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">Coding Hive</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-xl leading-relaxed">
            Connect, code, and compete on CodeHive — a unified platform to practice DSA, run real-time coding contests, test solutions instantly, and grow as a developer in a production-grade environment.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex items-center justify-center gap-2 bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all transform hover:-translate-y-1 shadow-lg group">
              Get Started for Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="flex items-center justify-center gap-2 glass-card text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all border border-white/10">
              <Terminal className="w-4 h-4" /> Try Sandbox
            </button>
          </div>


        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative glass-card rounded-2xl p-2 shadow-2xl overflow-hidden">
            <div className="bg-[#0b1120] rounded-xl overflow-hidden border border-white/5">
              {/* Fake Terminal Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#1e293b]/50 border-b border-white/5">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="text-[10px] text-gray-500 font-mono tracking-widest">CODEHIVE_ENGINE v4.2</div>
              </div>
              {/* Fake Code Content */}
              <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
                <div className="flex gap-4">
                  <span className="text-gray-600 select-none">1</span>
                  <span className="text-pink-400">import</span> <span className="text-white">{"{ HiveMind }"}</span> <span className="text-pink-400">from</span> <span className="text-green-400">'@codehive/core'</span>;
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-600 select-none">2</span>
                  <span className="text-gray-500">{"// Initialize collaborative swarm"}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-600 select-none">3</span>
                  <span className="text-pink-400">const</span> <span className="text-blue-400">swarm</span> <span className="text-pink-400">=</span> <span className="text-blue-300">new</span> <span className="text-yellow-300">HiveMind</span>({"{ "}
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-600 select-none">4</span>
                  <span className="text-blue-300 ml-4">realtime</span><span className="text-white">:</span> <span className="text-amber-400">true</span>,
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-600 select-none">5</span>
                  <span className="text-blue-300 ml-4">ai_pair_programmer</span><span className="text-white">:</span> <span className="text-amber-400">'Gemini-3'</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-600 select-none">6</span>
                  <span className="text-white">{"}"});</span>
                </div>
                <div className="flex gap-4 mt-4">
                  <span className="text-gray-600 select-none">7</span>
                  <span className="text-blue-400">swarm</span><span className="text-white">.</span><span className="text-yellow-300">deploy</span>(<span className="text-green-400">'production'</span>);
                </div>
                <div className="mt-6 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-wider">
                    <Zap className="w-3 h-3" /> Deployment Successful
                  </div>
                  <div className="text-[11px] text-green-400/70 mt-1">Edge functions propagated in 14ms</div>
                </div>
              </div>
            </div>
          </div>
          {/* Floating Feature Tags */}
          <div className="absolute -top-6 -right-6 animate-float">
            <div className="glass-card px-4 py-2 rounded-lg border-amber-400/30 flex items-center gap-2 shadow-xl">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">AI Engine Active</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 animate-float" style={{ animationDelay: '2s' }}>
            <div className="glass-card px-4 py-2 rounded-lg border-blue-400/30 flex items-center gap-2 shadow-xl">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-white">Edge Sync: Global</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string, color: string }> = ({ icon, title, desc, color }) => (
  <div className="group relative p-8 glass-card rounded-2xl hover:scale-[1.02] transition-all duration-500 overflow-hidden">
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`}></div>
    <div className={`w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mb-6 group-hover:bg-gradient-to-br transition-colors duration-500`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-amber-400 transition-colors">{title}</h3>
    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{desc}</p>
  </div>
);

const FeaturesSection: React.FC = () => {
  return (
    <section id="explore" className="py-32 relative hive-grid">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6">Master DSA with CodeHive</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Practice data structures and algorithms, create instant contests, and climb the leaderboards in our competitive coding platform designed for students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Code2 className="w-6 h-6 text-amber-400" />}
            title="DSA Practice Hub"
            desc="Comprehensive collection of data structures and algorithms problems with instant feedback and detailed explanations to accelerate your learning."
            color="amber"
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6 text-blue-400" />}
            title="Instant Contest Creation"
            desc="Generate custom coding contests in seconds with our AI-powered problem selector. Set time limits, difficulty levels, and track participation."
            color="blue"
          />
          <FeatureCard
            icon={<Database className="w-6 h-6 text-emerald-400" />}
            title="Real-time Leaderboards"
            desc="Compete globally with live rankings, detailed statistics, and performance analytics to track your progress and identify areas for improvement."
            color="emerald"
          />
          <FeatureCard
            icon={<Terminal className="w-6 h-6 text-purple-400" />}
            title="AI Contest Feedback"
            desc="Receive AI-powered feedback after contests end to learn how to improve your code and enhance your problem-solving skills."
            color="purple"
          />
          <FeatureCard
            icon={<Globe className="w-6 h-6 text-orange-400" />}
            title="Company-wise DSA Filters"
            desc="Filter DSA questions by company to practice interview-specific problems and prepare for your dream job with targeted question sets."
            color="orange"
          />
          <FeatureCard
            icon={<Sparkles className="w-6 h-6 text-pink-400" />}
            title="Progress Analytics"
            desc="Track your coding journey with detailed analytics, skill assessments, and personalized learning recommendations powered by AI."
            color="pink"
          />
        </div>
      </div>
    </section>
  );
};

const CTASection: React.FC = () => {
  return (
    <section className="py-32 px-6">
      <div className="max-w-5xl mx-auto relative overflow-hidden rounded-[3rem] p-12 lg:p-20 border border-white/10 glass-card text-center">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500/20 via-transparent to-blue-500/20 opacity-30 -z-10"></div>
        <Hexagon className="w-24 h-24 text-amber-400/20 absolute -top-8 -left-8 animate-spin" style={{ animationDuration: '20s' }} />
        <Hexagon className="w-16 h-16 text-blue-400/20 absolute -bottom-4 -right-4 animate-spin" style={{ animationDuration: '15s' }} />
        
        <h2 className="text-4xl lg:text-6xl font-black text-white mb-8">Ready to evolve?</h2>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Join the swarm of world-class developers building the future of the web. Free forever for individuals.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button className="w-full sm:w-auto px-10 py-5 bg-amber-400 text-black text-lg font-bold rounded-2xl hover:bg-amber-300 transition-all transform hover:scale-105 active:scale-95 shadow-2xl">
            Start Coding Now
          </button>
          <button className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 text-white text-lg font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
            View Enterprise Solutions <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="pt-20 pb-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Hexagon className="w-8 h-8 text-amber-400" />
            <span className="text-2xl font-bold text-white tracking-tight">Code<span className="text-amber-400">Hive</span></span>
          </div>
          <p className="text-gray-500 max-w-sm leading-relaxed">
            The first fully-decentralized AI-powered coding workspace. Empowering developers to build better, together.
          </p>
          <div className="flex items-center gap-4 mt-8">
            <a href="#" className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <Globe className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6">Platform</h4>
          <ul className="space-y-4 text-gray-500 text-sm">
            <li><a href="#" className="hover:text-amber-400 transition-colors">Code Editor</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Collaboration</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">API Docs</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Changelog</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6">Resources</h4>
          <ul className="space-y-4 text-gray-500 text-sm">
            <li><a href="#" className="hover:text-amber-400 transition-colors">Tutorials</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Community</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Plugins</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Templates</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6">Company</h4>
          <ul className="space-y-4 text-gray-500 text-sm">
            <li><a href="#" className="hover:text-amber-400 transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Contact</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Legal</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5 pt-10 text-xs text-gray-600">
        <p>© 2024 CodeHive Inc. Built with passion for the developer community.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-gray-400 transition-colors">Cookie Settings</a>
        </div>
      </div>
    </footer>
  );
};

// --- Page Main ---

const Home: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen selection:bg-amber-400/30">
      {/* Custom Cursor/Glow Effect */}
      <div 
        className="fixed pointer-events-none w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-amber-500/5 rounded-full blur-[100px] z-0 transition-transform duration-300 ease-out"
        style={{ left: mousePos.x, top: mousePos.y }}
      ></div>

      <Navbar />
      
      <main>
        <HeroSection />
        


        <FeaturesSection />

        <section className="py-20 bg-amber-400/5 border-y border-amber-400/10">
          <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-12 lg:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            <span className="text-2xl font-black text-white tracking-widest">MICROSOFT</span>
            <span className="text-2xl font-black text-white tracking-widest">NETFLIX</span>
            <span className="text-2xl font-black text-white tracking-widest">META</span>
            <span className="text-2xl font-black text-white tracking-widest">AIRBNB</span>
            <span className="text-2xl font-black text-white tracking-widest">STRIPE</span>
          </div>
        </section>

        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
