import React, { useState, useContext } from 'react';
import { Search, MessageCircle, UserPlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { AuthContext } from '../../context/AuthContext';
import PostCard from '../shared/PostCard';

const BASE_URL = 'http://localhost:5000';

const RightSidebar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });

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



  const handleTagSearch = async (query) => {
    if (!query.trim()) return setSearchResults({ users: [], posts: [] });
    setSearching(true);
    setSearchQuery(query);
    try {
      const [usersRes, postsRes] = await Promise.all([
        api.get(`/users/search?q=${query}`),
        api.get(`/posts/search?q=${query}`)
      ]);
      setSearchResults({ users: usersRes.data, posts: postsRes.data });
    } catch (err) {
      console.error(err);
    }
    setSearching(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleTagSearch(searchQuery);
  };

  return (
    <div className="space-y-8 sticky top-6">
      <div className="glass-card p-4">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Search className="w-4 h-4 text-[var(--neon-cyan)]"/> Search UniVerse</h3>
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            placeholder="Search tags, students..." 
            className="input-glass !py-2 w-full pr-16 text-sm placeholder-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => { setSearchQuery(''); setSearchResults({ users: [], posts: [] }); }} 
              className="absolute right-8 top-2.5 text-gray-400 hover:text-red-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button type="submit" className="absolute right-2 top-2.5 text-gray-400 hover:text-[var(--neon-cyan)]">
            <Search className="w-4 h-4" />
          </button>
        </form>
        
        {searching ? (
          <div className="mt-4 text-center text-sm text-[var(--neon-pink)] animate-pulse">Scanning...</div>
        ) : (searchResults.users.length > 0 || searchResults.posts.length > 0) ? (
          <div className="mt-4 space-y-4">
            
            {searchResults.users.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Users</h4>
                <div className="space-y-2">
                  {searchResults.users.map(u => (
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
              </div>
            )}

            {searchResults.posts.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Posts</h4>
                <div className="space-y-2">
                  {searchResults.posts.map(p => (
                    <div key={p._id} onClick={() => handleViewPost(p._id)} className="p-2 bg-white/5 rounded-lg border border-[var(--glass-border)] cursor-pointer hover:border-[var(--neon-cyan)] transition-colors group relative overflow-hidden">
                      <div className="flex items-center gap-2 mb-1 relative z-10">
                        <div className="w-5 h-5 rounded-full bg-[var(--neon-purple)] flex items-center justify-center text-[10px] text-white font-bold overflow-hidden flex-shrink-0">
                          {p.user?.avatar ? <img src={`${BASE_URL}${p.user.avatar}`} alt="av" className="w-full h-full object-cover" /> : p.user?.name.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-gray-300 truncate">{p.user?.name}</span>
                      </div>
                      <p className="text-sm text-white line-clamp-2 relative z-10">{p.content}</p>
                      {/* background hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[var(--neon-cyan)]/0 to-[var(--neon-cyan)]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        ) : searchQuery && !searching ? (
          <div className="mt-4 text-center text-sm text-gray-500">No signals found.</div>
        ) : (
          <div className="mt-4">
            <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">Trending Tags</h4>
            <div className="flex flex-wrap gap-2">
              {['#Exams', '#BPUT', '#TechFest', '#CampusLife', '#Hackathon'].map((tag) => (
                <button 
                  key={tag}
                  onClick={() => handleTagSearch(tag)}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/20 hover:border-[var(--neon-cyan)] hover:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all font-bold cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
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
