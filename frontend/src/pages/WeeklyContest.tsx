import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import Header from '../components/Header';

interface Contest {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  is_published: boolean;
}

const WeeklyContest: React.FC = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        // Public endpoint for published contests
        const res = await fetch('/api/contests');
        const data = await res.json();
        if (Array.isArray(data)) {
          setContests(data);
        }
      } catch (error) {
        console.error('Error fetching contests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);



  const getContestStatus = (start: string, end: string) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'ended';
    return 'live';
  };

  const formatDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
  };

  return (
    <div className="relative min-h-screen bg-gray-950 selection:bg-amber-400/30">
      {/* Background Effects */}
      <div className="absolute top-20 left-20 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[150px] -z-10" />

      <Header />

      <div className="pt-32 px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">
              Weekly <span className="text-amber-400">Contests</span>
            </h1>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">
              Compete with others in time-bounded coding challenges.
              Climb the leaderboard and prove your skills.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            </div>
          ) : contests.length === 0 ? (
            <div className="text-center py-20 bg-gray-900/50 rounded-3xl border border-gray-800">
              <Trophy className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400">No Contests Available</h3>
              <p className="text-gray-500 mt-2">Check back later for upcoming contests.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {contests.map((contest) => {
                const status = getContestStatus(contest.start_time, contest.end_time);
                return (
                  <div key={contest.id} className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                                ${status === 'live' ? 'bg-green-500/10 text-green-400 border border-green-500/20 animate-pulse' :
                          status === 'upcoming' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-gray-800 text-gray-400 border border-gray-700'
                        }`}>
                        {status === 'live' ? '● Live Now' : status}
                      </div>
                      <Trophy className={`w-6 h-6 ${status === 'live' ? 'text-amber-400' : 'text-gray-600'}`} />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                      {contest.title}
                    </h3>
                    <p className="text-gray-400 mb-6 line-clamp-2 flex-grow">
                      {contest.description}
                    </p>

                    <div className="space-y-3 mb-8 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(contest.start_time).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(contest.start_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', timeStyle: 'short' })} - {new Date(contest.end_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', timeStyle: 'short' })} IST</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Duration: {formatDuration(contest.start_time, contest.end_time)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/weekly-contest/${contest.id}`)}
                      disabled={status === 'upcoming'}
                      className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                                                ${status === 'live'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-lg hover:shadow-amber-500/20'
                          : status === 'upcoming'
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-800 text-white hover:bg-gray-700'
                        }`}
                    >
                      {status === 'live' ? 'Enter Contest' : status === 'upcoming' ? 'Starts Soon' : 'View Questions'}
                      {status !== 'upcoming' && <ArrowRight className="w-5 h-5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyContest;
