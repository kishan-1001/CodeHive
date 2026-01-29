import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Trophy, ArrowRight, Loader2, Search, History } from 'lucide-react';
import Header from '../components/Header';
import { api } from '../services/api';

interface Contest {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  is_published: boolean;
  participation_status?: string;
  status?: 'upcoming' | 'live' | 'ended'; // Computed on frontend
}

const WeeklyContest: React.FC = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState<Contest[]>([]);
  const [myHistory, setMyHistory] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'my-history'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [, setTick] = useState(0); // Used to force re-render for countdown

  const isLoggedIn = !!sessionStorage.getItem('token');

  const fetchContests = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      // Public contests
      const publicData = await api.get('/contests');
      if (Array.isArray(publicData)) {
        setContests(publicData);
      }

      // My History (if logged in)
      if (isLoggedIn) {
        try {
          const historyData = await api.get('/contests/my-history');
          if (Array.isArray(historyData)) {
            setMyHistory(historyData);
          }
        } catch (err) {
          console.error('Failed to fetch contest history', err);
        }
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const refreshStatuses = () => {
    // Fetch new data from backend
    fetchContests(true);
  };

  useEffect(() => {
    fetchContests();

    // Refresh data every minute
    const dataInterval = setInterval(refreshStatuses, 60000);

    // Update countdown every second (local re-render)
    const tickInterval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(tickInterval);
    };
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

  const getTimeRemaining = (targetDate: string) => {
    const diff = new Date(targetDate).getTime() - new Date().getTime();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  // Derived State: Determine Featured Contest (Live > Upcoming)
  const featuredContest = (() => {
    // We want the featured contest to be the LIVE one if exists, otherwise the nearest UPCOMING
    const live = contests.find(c => getContestStatus(c.start_time, c.end_time) === 'live');
    if (live) return live;

    const upcoming = contests
      .filter(c => getContestStatus(c.start_time, c.end_time) === 'upcoming')
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0];
    return upcoming;
  })();

  // Filter Logic
  const filteredContests = (() => {
    let source = contests;
    if (activeTab === 'my-history') {
      source = myHistory;
    }

    return source.filter(c => {
      const status = getContestStatus(c.start_time, c.end_time);
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Exclude featured contest from the list if we are in upcoming tab
      if (activeTab === 'upcoming' && featuredContest && c.id === featuredContest.id) {
        return false;
      }

      if (activeTab === 'upcoming') return status === 'upcoming' || status === 'live';
      if (activeTab === 'past') return status === 'ended';
      // my-history shows all returned by backend (which are the ones user participated in)
      return true;
    }).sort((a, b) => {
      // Sort live first, then upcoming by date ascending, ended by date descending
      const statusA = getContestStatus(a.start_time, a.end_time);
      const statusB = getContestStatus(b.start_time, b.end_time);

      if (statusA === 'live' && statusB !== 'live') return -1;
      if (statusB === 'live' && statusA !== 'live') return 1;

      if (activeTab === 'past' || activeTab === 'my-history') {
        return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
      }
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    });
  })();

  const FeaturedCard = () => {
    if (!featuredContest) return null;

    const status = getContestStatus(featuredContest.start_time, featuredContest.end_time);
    const remaining = getTimeRemaining(status === 'live' ? featuredContest.end_time : featuredContest.start_time);

    return (
      <div className="mb-12 relative group h-[400px] overflow-hidden rounded-3xl p-[3px]">
        {/* Revolving Light Beam Border */}
        <div className="absolute inset-[-100%] animate-border-spin bg-[conic-gradient(from_0deg,transparent_0deg,transparent_80deg,white_180deg,transparent_180deg)]"></div>

        {/* Static Border Fallback */}
        <div className="absolute inset-0 border border-gray-700 rounded-3xl group-hover:border-transparent transition-colors duration-500"></div>

        <div className="relative h-full w-full bg-gray-900 rounded-[23px] overflow-hidden flex items-center shadow-2xl">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/code-editor-bg.png"
              alt="Weekly Contest"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950/95 via-gray-900/80 to-transparent"></div>
          </div>





          <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12 relative z-10 w-full h-full items-center">
            <div className="space-y-6 flex flex-col justify-center h-full">
              <div className="mb-8">
                <span className={`px-4 py-1.5 rounded-full font-bold text-sm tracking-wide ${status === 'live' ? 'bg-green-500 text-black animate-pulse' : 'text-white/50 bg-gray-900/50 border border-white/10 backdrop-blur-md'}`}>
                  {status === 'live' ? 'LIVE NOW' : 'COMING SOON'}
                </span>
              </div>

              <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
                {featuredContest.title}
              </h2>
              <p className="text-gray-300 text-lg max-w-xl font-medium drop-shadow-md">
                {featuredContest.description}
              </p>

              <div className="flex flex-wrap gap-6 pt-4">
                <div className="space-y-1">
                  <span className="text-gray-400 text-xs uppercase tracking-wider font-bold">Date</span>
                  <div className="flex items-center gap-2 text-white font-bold text-lg">
                    <Calendar className={`w-5 h-5 ${status === 'live' ? 'text-green-500' : 'text-amber-500'}`} />
                    {new Date(featuredContest.start_time).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 text-xs uppercase tracking-wider font-bold">Duration</span>
                  <div className="flex items-center gap-2 text-white font-bold text-lg">
                    <Clock className={`w-5 h-5 ${status === 'live' ? 'text-green-500' : 'text-amber-500'}`} />
                    {formatDuration(featuredContest.start_time, featuredContest.end_time)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center items-end space-y-8 h-full">
              <div className="flex gap-4">
                <div className="text-center p-4 bg-gray-900/40 rounded-2xl border border-gray-700/50 backdrop-blur-md min-w-[80px] shadow-xl">
                  <div className={`text-3xl font-black ${status === 'live' ? 'text-green-500' : 'text-red-500'}`}>{remaining.days}</div>
                  <div className="text-[10px] text-gray-300 uppercase mt-1 font-bold tracking-wider">Days</div>
                </div>
                <div className="text-center p-4 bg-gray-900/40 rounded-2xl border border-gray-700/50 backdrop-blur-md min-w-[80px] shadow-xl">
                  <div className={`text-3xl font-black ${status === 'live' ? 'text-green-500' : 'text-red-500'}`}>{remaining.hours}</div>
                  <div className="text-[10px] text-gray-300 uppercase mt-1 font-bold tracking-wider">Hrs</div>
                </div>
                <div className="text-center p-4 bg-gray-900/40 rounded-2xl border border-gray-700/50 backdrop-blur-md min-w-[80px] shadow-xl">
                  <div className={`text-3xl font-black ${status === 'live' ? 'text-green-500' : 'text-red-500'}`}>{remaining.minutes}</div>
                  <div className="text-[10px] text-gray-300 uppercase mt-1 font-bold tracking-wider">Mins</div>
                </div>
                <div className="text-center p-4 bg-gray-900/40 rounded-2xl border border-gray-700/50 backdrop-blur-md min-w-[80px] shadow-xl">
                  <div className={`text-3xl font-black ${status === 'live' ? 'text-green-500' : 'text-red-500'}`}>{remaining.seconds}</div>
                  <div className="text-[10px] text-gray-300 uppercase mt-1 font-bold tracking-wider">Secs</div>
                </div>
              </div>

              <button
                onClick={() => navigate(`/weekly-contest/${featuredContest.id}`)}
                disabled={status !== 'live'}
                className={`px-10 py-4 font-black text-lg rounded-2xl transition-all shadow-xl flex items-center gap-3 transform hover:scale-105
                ${status === 'live'
                    ? 'bg-white hover:bg-gray-100 text-black border-2 border-white shadow-lg shadow-white/20 cursor-pointer'
                    : 'bg-gray-800 text-gray-400 border-2 border-gray-600 cursor-not-allowed'
                  }`}
              >
                Enter Contest
                {status === 'live' && <ArrowRight className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };



  const ContestCard = ({ contest }: { contest: Contest }) => {
    const status = getContestStatus(contest.start_time, contest.end_time);

    return (
      <div className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6 hover:border-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
        {/* Pictorial Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/boxback.png"
            alt="Contest Background"
            className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300 group-hover:scale-105 transform"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-start mb-6">
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5
                    ${status === 'live' ? 'bg-green-500/10 text-green-400 border border-green-500/20 animate-pulse' :
                status === 'upcoming' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-gray-800 text-gray-400 border border-gray-700'
              }`}>
              {status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
              {status === 'live' ? 'LIVE NOW' : status}
            </div>
            {activeTab === 'my-history' && (
              <div className="px-3 py-1 bg-gray-800 rounded-full border border-gray-700 text-xs text-gray-400 flex items-center gap-1">
                <History className="w-3 h-3" />
                Participated
              </div>
            )}
          </div>

          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors line-clamp-1">
            {contest.title}
          </h3>
          <p className="text-gray-400 mb-6 line-clamp-2 flex-grow text-sm">
            {contest.description}
          </p>

          <div className="space-y-3 mb-8 text-sm text-gray-500 border-t border-gray-800 pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500/50" />
              <span>{new Date(contest.start_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500/50" />
              <span>{new Date(contest.start_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} - {new Date(contest.end_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST</span>
            </div>
          </div>

          <button
            onClick={() => navigate(`/weekly-contest/${contest.id}`)}
            disabled={status === 'upcoming' && activeTab !== 'upcoming' /* Allows pre-register/view in upcoming tab mostly */}
            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                    ${status === 'live'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-lg hover:shadow-amber-500/20'
                : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
              }`}
          >
            {status === 'live' ? 'Enter Contest' : 'View Details'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-gray-950 selection:bg-amber-400/30">
      <Header />

      {/* Background Gradients */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="pt-32 px-6 pb-20 relative max-w-7xl mx-auto">


        {/* Featured Card - Only on 'Upcoming' tab */}
        {activeTab === 'upcoming' && !loading && <FeaturedCard />}

        {/* Navigation & Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center p-1.5 bg-gray-900 rounded-2xl border border-gray-800">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'upcoming' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'past' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Past Contests
            </button>
            {isLoggedIn && (
              <button
                onClick={() => setActiveTab('my-history')}
                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'my-history' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                My History
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0 md:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-amber-500 transition-colors" />
              <input
                type="text"
                placeholder="Search contests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 text-gray-300 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          </div>
        ) : filteredContests.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/30 rounded-3xl border border-gray-800/50 border-dashed">
            <Trophy className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400">No Contests Found</h3>
            <p className="text-gray-500 mt-2">
              {activeTab === 'upcoming' ? 'Check back later for new challenges.' :
                activeTab === 'my-history' ? 'You haven\'t participated in any contests yet.' :
                  'No past contests found matching your criteria.'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContests.map(contest => (
              <ContestCard key={contest.id} contest={contest} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyContest;
