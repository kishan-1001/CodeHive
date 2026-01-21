import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Code2,
  Terminal,
  Cpu,
  Zap,
  Globe,
  ArrowRight,
  Github,
  Twitter,
  Hexagon,
  Sparkles,
  Database
} from 'lucide-react';

import LoginModal from './login';
import RegisterModal from './registered';
import ContactModal from './ContactModal';

// --- Components ---

const Navbar: React.FC<{ onSignInClick: () => void; onSignUpClick: () => void }> = ({ onSignInClick, onSignUpClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-4 glass-card' : 'py-6 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <span className="text-3xl font-bold tracking-tight text-white -ml-4 -mt-2 cursor-pointer">Code<span className="text-amber-400">Hive</span></span>

        <div className="flex items-center gap-4">
          <button
            onClick={onSignInClick}
            className="w-24 h-12 rounded-2xl glass-card border border-white/20 backdrop-blur-sm flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:bg-white/20 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300"
          >
            Sign In
          </button>
          <button
            onClick={onSignUpClick}
            className="w-24 h-12 rounded-2xl glass-card border border-white/20 backdrop-blur-sm flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:bg-white/20 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300"
          >
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
};



const HeroSection: React.FC<{ onCodeEditorClick: () => void; onGetStartedClick: () => void }> = ({ onCodeEditorClick, onGetStartedClick }) => {
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
            <button onClick={onGetStartedClick} className="flex items-center justify-center gap-2 bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all transform hover:-translate-y-1 shadow-lg group">
              Get Started for Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={onCodeEditorClick} className="flex items-center justify-center gap-2 glass-card text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all border border-white/10">
              <Terminal className="w-4 h-4" /> Code Editor
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
                  <span className="text-pink-400">#include</span> <span className="text-green-400">{'<codehive/developer.hpp>'}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-600 select-none">2</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-600 select-none">3</span>
                  <span className="text-pink-400">int</span> <span className="text-yellow-300">main</span>() {"{"}
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-600 select-none">4</span>
                  <span className="text-blue-300 ml-4">Developer</span> <span className="text-blue-400">dev</span>(<span className="text-green-400">"Kishan"</span>);
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-600 select-none">5</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-600 select-none">6</span>
                  <span className="text-pink-400 ml-4">while</span> (<span className="text-blue-400">dev</span>.<span className="text-yellow-300">isLearning</span>()) {"{"}
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-600 select-none">7</span>
                  <span className="text-blue-400 ml-8">dev</span>.<span className="text-yellow-300">solve</span>(<span className="text-blue-300">Problem</span>::<span className="text-blue-300">DSA</span>);
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-600 select-none">8</span>
                  <span className="text-blue-400 ml-8">dev</span>.<span className="text-yellow-300">runTestCases</span>();
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-600 select-none">9</span>
                  <span className="text-blue-400 ml-8">dev</span>.<span className="text-yellow-300">improve</span>();
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-600 select-none">10</span>
                  <span className="text-white ml-4">{"}"}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-600 select-none">11</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-600 select-none">12</span>
                  <span className="text-blue-400">dev</span>.<span className="text-yellow-300">unlockBadge</span>(<span className="text-green-400">"Consistency Master 🏆"</span>);
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-600 select-none">13</span>
                  <span className="text-white">{"}"}</span>
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

const CTASection: React.FC<{ onGetStartedClick: () => void }> = ({ onGetStartedClick }) => {
  return (
    <section className="py-32 px-6">
      <div className="max-w-5xl mx-auto relative overflow-hidden rounded-[3rem] p-12 lg:p-20 border border-white/10 glass-card text-center">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500/20 via-transparent to-blue-500/20 opacity-30 -z-10"></div>
        <Hexagon className="w-24 h-24 text-amber-400/20 absolute -top-8 -left-8 animate-spin" style={{ animationDuration: '20s' }} />
        <Hexagon className="w-16 h-16 text-blue-400/20 absolute -bottom-4 -right-4 animate-spin" style={{ animationDuration: '15s' }} />

        <h2 className="text-3xl lg:text-5xl font-black text-white mb-8">Ready to outcode the swarm?</h2>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Join thousands of engineers practicing the hardest DSA challenges in a distraction-free hive.
        </p>

        <div className="flex items-center justify-center">
          <button
            onClick={onGetStartedClick}
            className="px-10 py-5 bg-amber-400 text-black text-lg font-bold rounded-2xl hover:bg-amber-300 transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
          >
            GET STARTED FREE
          </button>
        </div>
      </div>
    </section>
  );
};

const Footer: React.FC<{ onContactClick: () => void }> = ({ onContactClick }) => {
  return (
    <footer className="pt-20 pb-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Hexagon className="w-8 h-8 text-amber-400" />
            <span className="text-2xl font-bold text-white tracking-tight">Code<span className="text-amber-400">Hive</span></span>
          </div>
          <p className="text-gray-500 max-w-sm leading-relaxed">
            CodeHive is a modern coding platform designed to help developers practice, test, and compete through real-time code execution, curated problems, and competitive programming contests.
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
            <li><Link to="/editor" className="hover:text-amber-400 transition-colors">Code Editor</Link></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Coding Contests</a></li>
            <li><Link to="/editor" className="hover:text-amber-400 transition-colors">Try Sandbox</Link></li>
            <li><Link to="/leaderboard" className="hover:text-amber-400 transition-colors">Leaderboards</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Resources</h4>
          <ul className="space-y-4 text-gray-500 text-sm">
            <li><a href="#" className="hover:text-amber-400 transition-colors">Getting Started</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Problem Library</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Interview Prep</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Community</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Company</h4>
          <ul className="space-y-4 text-gray-500 text-sm">
            <li><Link to="/about" className="hover:text-amber-400 transition-colors">About Us</Link></li>
            <li><Link to="/career" className="hover:text-amber-400 transition-colors">Careers</Link></li>
            <li><button onClick={onContactClick} className="text-gray-500 hover:text-amber-400 transition-colors bg-transparent border-none cursor-pointer text-sm p-0">Contact</button></li>
            <li><Link to="/legal" className="hover:text-amber-400 transition-colors">Legal</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5 pt-10 text-xs text-gray-600">
        <p>© 2024 CodeHive Inc. Built with passion for the developer community.</p>
        <div className="flex gap-8">
          <a href="/legal#privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
          <a href="/legal#terms" className="hover:text-gray-400 transition-colors">Terms of Service</a>
          <a href="/legal#cookies" className="hover:text-gray-400 transition-colors">Cookie Settings</a>
        </div>
      </div>
    </footer>
  );
};

// --- Page Main ---

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);


  const handleSignInClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleSignUpClick = () => {
    setIsRegisterModalOpen(true);
  };

  const handleCloseRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  const handleCodeEditorClick = () => {
    navigate('/editor');
  };

  const handleGetStartedClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setIsRegisterModalOpen(true);
    }, 500);
  };

  return (
    <div className="relative min-h-screen selection:bg-amber-400/30">

      <Navbar onSignInClick={handleSignInClick} onSignUpClick={handleSignUpClick} />

      <main>
        <HeroSection onCodeEditorClick={handleCodeEditorClick} onGetStartedClick={handleGetStartedClick} />



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

        <CTASection onGetStartedClick={handleGetStartedClick} />
      </main>

      <Footer onContactClick={() => setIsContactModalOpen(true)} />

      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} onSignUpClick={handleSignUpClick} />
      <RegisterModal isOpen={isRegisterModalOpen} onClose={handleCloseRegisterModal} onSignInClick={handleSignInClick} />
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </div>
  );
};

export default Home;
