import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Database,
  Users,
  Target,
  Award
} from 'lucide-react';

const AboutUs: React.FC = () => {
  const navigate = useNavigate();
  

  const handleGetStartedClick = () => {
    navigate('/home');
  };

  return (
    <div className="relative min-h-screen selection:bg-amber-400/30">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] -z-10"></div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-6 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <span className="text-3xl font-bold tracking-tight text-white cursor-pointer" onClick={() => navigate('/home')}>Code<span className="text-amber-400">Hive</span></span>
          <button
            onClick={handleGetStartedClick}
            className="px-6 py-3 bg-amber-400 text-black font-bold rounded-xl hover:bg-amber-300 transition-all transform hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </nav>

      <main className="pt-32">
      

        {/* Who We Are Section */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-8">
                Who We <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">Are</span>
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div>
                <p className="text-xl text-gray-300 leading-relaxed mb-8">
                  CodeHive is a next-generation coding platform built for developers who want more than just problem-solving — they want clarity, improvement, and real-world readiness.
                </p>
                <p className="text-lg text-gray-400 leading-relaxed mb-8">
                  We are a team of passionate developers and problem-solvers who believe that competitive programming and interview preparation should be accessible, personalized, and insightful. While traditional platforms focus on whether your solution passes or fails, CodeHive focuses on how you can write better code every time.
                </p>
                <p className="text-lg text-gray-400 leading-relaxed mb-8">
                  At the heart of CodeHive is our AI-driven evaluation system, designed to help users truly understand their code. Every submission is analyzed to provide:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="text-center p-6 glass-card rounded-xl border border-amber-400/20">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-400/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Accurate Analysis</h3>
                  <p className="text-gray-400 text-sm">Time and space complexity calculations</p>
                </div>

                <div className="text-center p-6 glass-card rounded-xl border border-blue-400/20">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-400/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">AI-Powered Feedback</h3>
                  <p className="text-gray-400 text-sm">Code quality, optimization opportunities, and best practices</p>
                </div>

                <div className="text-center p-6 glass-card rounded-xl border border-emerald-400/20">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-400/20 flex items-center justify-center">
                    <Target className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Solution Comparison</h3>
                  <p className="text-gray-400 text-sm">Brute-force vs optimal vs most-optimal solutions</p>
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="relative mt-16">
              <h3 className="text-2xl font-bold text-white mb-8 text-center">Solution Evolution Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
                    <span className="text-red-400 font-bold text-lg">1</span>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Brute Force</h4>
                  <p className="text-gray-400 text-sm">Basic working solution - gets the job done but inefficient</p>
                </div>

                <div className="hidden md:flex justify-center">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-red-500 to-yellow-500"></div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center">
                    <span className="text-yellow-400 font-bold text-lg">2</span>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Optimal</h4>
                  <p className="text-gray-400 text-sm">Efficient solution with good time/space complexity</p>
                </div>

                <div className="hidden md:flex justify-center">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-yellow-500 to-green-500"></div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                    <span className="text-green-400 font-bold text-lg">3</span>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Most Optimal</h4>
                  <p className="text-gray-400 text-sm">Cutting-edge solution with minimal resource usage</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-extrabold text-white mb-6">Our Mission</h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                  Our mission is simple: To transform coding practice from trial-and-error into guided improvement.
                </p>
                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                  We aim to build a platform where:
                </p>
                <ul className="text-gray-400 text-lg leading-relaxed mb-8 space-y-2">
                  <li>• Every mistake becomes a learning opportunity</li>
                  <li>• Every submission teaches you something new</li>
                  <li>• Every contest helps you grow, not just rank</li>
                </ul>
                <p className="text-gray-400 text-lg leading-relaxed">
                  CodeHive is not just about solving problems — it's about becoming a better problem solver.
                </p>
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative glass-card rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <Target className="w-12 h-12 text-amber-400" />
                    <h3 className="text-2xl font-bold text-white">Empower Developers</h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed">
                    We're committed to providing the best tools and resources to help developers of all levels improve their skills and achieve their goals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 relative hive-grid">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6">What Sets Us Apart</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                CodeHive combines advanced technology with a user-centric approach to create an unparalleled coding experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="group relative p-8 glass-card rounded-2xl hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mb-6 group-hover:bg-gradient-to-br transition-colors duration-500">
                  <Cpu className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-amber-400 transition-colors">AI-Powered Learning</h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  For every contest submission, our AI provides detailed, solution-specific feedback to help you identify improvements, optimize performance, and strengthen your problem-solving approach.
                </p>
              </div>

              <div className="group relative p-8 glass-card rounded-2xl hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mb-6 group-hover:bg-gradient-to-br transition-colors duration-500">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">Instant Contest</h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  CodeHive enables users to create contests instantly. At any time, you can host a contest, choose specific topics and company tags, and compete or practice in a focused, real-world interview environment.
                </p>
              </div>

              <div className="group relative p-8 glass-card rounded-2xl hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mb-6 group-hover:bg-gradient-to-br transition-colors duration-500">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors">Instant Complexity Insights</h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  After a successful submission, the time and space complexity of every solution are automatically analyzed and displayed, helping you clearly understand the efficiency of your code.
                </p>
              </div>

              <div className="group relative p-8 glass-card rounded-2xl hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mb-6 group-hover:bg-gradient-to-br transition-colors duration-500">
                  <Database className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">Extensive Problem Library</h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  Access a growing collection of 3,000+ curated coding problems, covering a wide range of difficulties, topics, and company-specific patterns to support consistent and structured practice.
                </p>
              </div>

              <div className="group relative p-8 glass-card rounded-2xl hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mb-6 group-hover:bg-gradient-to-br transition-colors duration-500">
                  <Award className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-red-400 transition-colors">Know Where You Stand</h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  Compete with others and view leaderboards that reflect your performance across contests and problem-solving activities.
                </p>
              </div>

              <div className="group relative p-8 glass-card rounded-2xl hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mb-6 group-hover:bg-gradient-to-br transition-colors duration-500">
                  <Users className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-pink-400 transition-colors">Peer Learning Insights</h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  Learn from real experiences shared by other developers — including interview takeaways, problem-solving tips, and lessons learned from real-world coding challenges.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6">Our Team</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Meet the passionate individuals behind CodeHive, dedicated to revolutionizing coding education.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-blue-500 flex items-center justify-center">
                  <Code2 className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Development Team</h3>
                <p className="text-gray-400">Expert developers crafting the platform's core features.</p>
              </div>

              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <Database className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">AI Engineers</h3>
                <p className="text-gray-400">Innovators building intelligent systems for personalized learning.</p>
              </div>

              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                  <Award className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Educators</h3>
                <p className="text-gray-400">Experienced mentors curating content and guiding the community.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto relative overflow-hidden rounded-[3rem] p-12 lg:p-20 border border-white/10 glass-card text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500/20 via-transparent to-blue-500/20 opacity-30 -z-10"></div>
            <Hexagon className="w-24 h-24 text-amber-400/20 absolute -top-8 -left-8 animate-spin" style={{ animationDuration: '20s' }} />
            <Hexagon className="w-16 h-16 text-blue-400/20 absolute -bottom-4 -right-4 animate-spin" style={{ animationDuration: '15s' }} />

            <h2 className="text-3xl lg:text-5xl font-black text-white mb-8">Join the CodeHive Revolution</h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Start your journey today and become part of a community that's shaping the future of coding education.
            </p>

            <div className="flex items-center justify-center">
              <button
                onClick={handleGetStartedClick}
                className="px-10 py-5 bg-amber-400 text-black text-lg font-bold rounded-2xl hover:bg-amber-300 transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
              >
                GET STARTED FREE
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="pt-20 pb-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Hexagon className="w-8 h-8 text-amber-400" />
            <span className="text-2xl font-bold text-white tracking-tight">Code<span className="text-amber-400">Hive</span></span>
          </div>
          <p className="text-gray-500 max-w-sm mx-auto leading-relaxed mb-8">
            Empowering developers worldwide with AI-powered coding education and competitive programming tools.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
          <p className="text-xs text-gray-600 mt-8">© 2024 CodeHive Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
