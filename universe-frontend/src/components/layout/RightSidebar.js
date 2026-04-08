import React, { useState, useEffect, useContext } from 'react';
import { Search, Trophy, MessageCircle, UserPlus, Eye, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { AuthContext } from '../../context/AuthContext';
import PostCard from '../shared/PostCard';

const BASE_URL = 'http://localhost:5000';

const RightSidebar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleViewPost = async (postId) => {
    if (!postId) return;
    setIsPostModalOpen(true);
    setLoadingPost(true);
    try {
      const res = await api.get(`/posts/${postId}`);
      setSelectedPost(res.data);
    } catch (err) {
      console.error('Failed to fetch post:', err);
    }
    setLoadingPost(false);
  };

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
                <div className="flex items-center gap-2">
                  {item.bestPostId && (
                    <button 
                      onClick={() => handleViewPost(item.bestPostId)}
                      className="text-gray-400 hover:text-[var(--neon-cyan)] transition-colors p-1"
                      title="View Post"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <div className="text-xs font-bold text-[var(--neon-pink)] bg-[var(--neon-pink)]/10 px-2 py-1 rounded-full shadow-[0_0_5px_rgba(255,0,255,0.2)]">
                    {item.highestLikes} ♥
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500 py-4">No top stars this week.</div>
        )}
      </div>

      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card p-6">
            <button 
              onClick={() => { setIsPostModalOpen(false); setSelectedPost(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Top Post</h2>
            {loadingPost ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : selectedPost ? (
              <PostCard post={selectedPost} currentUserId={user?.id} />
            ) : (
              <div className="text-center text-gray-400 py-10">Post not found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSidebar;
