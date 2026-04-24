import React, { useState, useContext } from 'react';
import { Search, MessageCircle, UserPlus, X, Hash } from 'lucide-react';
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
      <div className="glass-card p-6">
        <h3 className="font-bold text-[var(--on-surface)] mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-[var(--primary)]"/> Deep Space Scan
        </h3>
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            placeholder="Search tags, students..." 
            className="input-glass w-full pr-12 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => { setSearchQuery(''); setSearchResults({ users: [], posts: [] }); }} 
              className="absolute right-10 top-3 text-[var(--on-surface-variant)] hover:text-[var(--error)]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button type="submit" className="absolute right-3 top-3 text-[var(--on-surface-variant)] hover:text-[var(--primary)]">
            <Search className="w-4 h-4" />
          </button>
        </form>
        
        {searching ? (
          <div className="mt-6 text-center text-sm neon-text-pink animate-pulse font-medium">Scanning sector...</div>
        ) : (searchResults.users.length > 0 || searchResults.posts.length > 0) ? (
          <div className="mt-6 space-y-6">
            
            {searchResults.users.length > 0 && (
              <div>
                <h4 className="label-tech mb-3">Astronauts</h4>
                <div className="space-y-2">
                  {searchResults.users.map(u => (
                    <div key={u._id} className="flex items-center gap-3 p-3 surface-highest rounded-xl ghost-border hover:border-[var(--primary)] transition-all group">
                      <div className="w-10 h-10 rounded-full border border-[var(--secondary)] flex items-center justify-center text-[var(--on-surface)] text-xs font-bold overflow-hidden flex-shrink-0 bg-[var(--surface-container-low)]">
                        {u.avatar ? <img src={`${BASE_URL}${u.avatar}`} alt="av" className="w-full h-full object-cover" /> : u.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <p className="text-sm font-bold text-[var(--on-surface)] truncate">{u.name}</p>
                        <p className="text-xs text-[var(--primary)] capitalize">{u.role}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={async () => {
                           await api.post('/messages/conversation', { receiverId: u._id });
                           navigate('/messages');
                        }} className="w-8 h-8 rounded-full flex items-center justify-center surface-base hover:bg-[var(--primary)] hover:text-[var(--on-primary)] transition-colors text-[var(--primary)]" title="Start Comms">
                          <MessageCircle className="w-4 h-4"/>
                        </button>
                        <button onClick={async () => { 
                           const res = await api.put('/users/follow/'+u._id); 
                           alert(res.data.isFollowing ? 'Followed user' : 'Unfollowed user');
                        }} className="w-8 h-8 rounded-full flex items-center justify-center surface-base hover:bg-[var(--secondary)] hover:text-[var(--on-secondary)] transition-colors text-[var(--secondary)]" title="Follow/Unfollow">
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
                <h4 className="label-tech mb-3">Transmissions</h4>
                <div className="space-y-3">
                  {searchResults.posts.map(p => (
                    <div key={p._id} onClick={() => handleViewPost(p._id)} className="p-4 surface-highest rounded-xl ghost-border cursor-pointer hover:border-[var(--secondary)] transition-all group relative overflow-hidden">
                      <div className="flex items-center gap-2 mb-2 relative z-10">
                        <div className="w-6 h-6 rounded-full border border-[var(--outline-variant)] flex items-center justify-center text-[10px] text-[var(--on-surface)] font-bold overflow-hidden flex-shrink-0">
                          {p.user?.avatar ? <img src={`${BASE_URL}${p.user.avatar}`} alt="av" className="w-full h-full object-cover" /> : p.user?.name.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-[var(--on-surface-variant)] truncate">{p.user?.name}</span>
                      </div>
                      <p className="text-sm text-[var(--on-surface)] line-clamp-2 relative z-10">{p.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        ) : searchQuery && !searching ? (
          <div className="mt-6 text-center text-sm text-[var(--on-surface-variant)]">No signals detected.</div>
        ) : (
          <div className="mt-6">
            <h4 className="label-tech mb-4">Trending Constellations</h4>
            <div className="flex flex-wrap gap-2">
              {['Exams', 'BPUT', 'TechFest', 'CampusLife', 'Hackathon'].map((tag) => (
                <button 
                  key={tag}
                  onClick={() => handleTagSearch(`#${tag}`)}
                  className="px-4 py-2 surface-highest ghost-border rounded-full text-sm font-medium transition-all hover:border-[var(--primary)] hover:text-[var(--primary)] flex items-center gap-1 group"
                >
                  <Hash className="w-3 h-3 text-[var(--on-surface-variant)] group-hover:text-[var(--primary)]" />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--space-void)]/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card p-0">
            <div className="sticky top-0 bg-[rgba(37,37,45,0.8)] backdrop-blur-md p-4 border-b border-[var(--glass-border)] flex justify-between items-center z-10 rounded-t-3xl">
               <h2 className="text-xl font-bold gradient-text-spectral">Intercepted Transmission</h2>
               <button 
                 onClick={() => { setIsPostModalOpen(false); setSelectedPost(null); }}
                 className="p-2 rounded-full hover:bg-white/10 text-[var(--on-surface-variant)] hover:text-white transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            <div className="p-6">
               {loadingPost ? (
                 <div className="flex justify-center py-12">
                   <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                 </div>
               ) : selectedPost ? (
                 <PostCard post={selectedPost} currentUserId={user?.id} />
               ) : (
                 <div className="text-center text-[var(--on-surface-variant)] py-12">Transmission lost.</div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSidebar;
