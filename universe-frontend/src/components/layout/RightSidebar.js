import React, { useState, useEffect } from 'react';
import { Search, Trophy, MessageCircle, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

const BASE_URL = 'http://localhost:5000';

const RightSidebar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/posts/leaderboard');
        setLeaderboard(res.data);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      }
    };
    fetchLeaderboard();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return setSearchResults([]);
    
    setSearching(true);
    try {
      const res = await api.get(`/users/search?q=${searchQuery}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    }
    setSearching(false);
  };

  return (
    <div className="space-y-8 sticky top-6">
      <div className="glass-card p-4">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Search className="w-4 h-4 text-[var(--neon-cyan)]"/> Search UniVerse</h3>
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            placeholder="Search students, roles..." 
            className="input-glass !py-2 w-full text-sm placeholder-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="absolute right-2 top-2 text-gray-400 hover:text-[var(--neon-cyan)]">
            <Search className="w-4 h-4" />
          </button>
        </form>
        
        {searching ? (
          <div className="mt-4 text-center text-sm text-[var(--neon-pink)] animate-pulse">Scanning...</div>
        ) : searchResults.length > 0 ? (
          <div className="mt-4 space-y-3">
            {searchResults.map(u => (
              <div key={u._id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-[var(--glass-border)] group">
                <div className="w-8 h-8 rounded-full bg-[var(--neon-purple)] flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                  {u.avatar ? <img src={`${BASE_URL}${u.avatar}`} alt="av" className="w-full h-full object-cover" /> : u.name.charAt(0)}
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-sm font-bold text-white truncate">{u.name}</p>
                  <p className="text-xs text-[var(--neon-cyan)] capitalize">{u.role}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={async () => {
                     await api.post('/messages/conversation', { receiverId: u._id });
                     navigate('/messages');
                  }} className="text-gray-400 hover:text-[var(--neon-cyan)] p-1 transition-colors" title="Start Comms">
                    <MessageCircle className="w-4 h-4"/>
                  </button>
                  <button onClick={async () => { 
                     const res = await api.put('/users/follow/'+u._id); 
                     alert(res.data.isFollowing ? 'Followed user' : 'Unfollowed user');
                  }} className="text-gray-400 hover:text-[var(--neon-pink)] p-1 transition-colors" title="Follow/Unfollow">
                    <UserPlus className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery && !searching ? (
          <div className="mt-4 text-center text-sm text-gray-500">No signals found.</div>
        ) : null}
      </div>

      <div className="glass-card p-4">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-[var(--neon-pink)]"/> Weekly Top Stars</h3>
        {leaderboard.length > 0 ? (
          <div className="space-y-4">
            {leaderboard.map((item, idx) => (
              <div key={item.user._id} className="flex items-center gap-3">
                <div className={`text-lg font-black ${idx === 0 ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.6)]' : idx === 1 ? 'text-gray-300 drop-shadow-[0_0_5px_rgba(209,213,219,0.4)]' : idx === 2 ? 'text-amber-600 drop-shadow-[0_0_5px_rgba(217,119,6,0.4)]' : 'text-gray-500'} w-4 text-center`}>
                  {idx + 1}
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                  {item.user.avatar ? <img src={`${BASE_URL}${item.user.avatar}`} alt="av" className="w-full h-full object-cover" /> : item.user.name.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">{item.user.name}</p>
                </div>
                <div className="text-xs font-bold text-[var(--neon-pink)] bg-[var(--neon-pink)]/10 px-2 py-1 rounded-full shadow-[0_0_5px_rgba(255,0,255,0.2)]">
                  {item.totalLikes} ♥
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500 py-4">No top stars this week.</div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
