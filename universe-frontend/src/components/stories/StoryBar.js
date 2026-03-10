import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import api from '../../api/axiosConfig';

const StoryBar = () => {
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newStoryContent, setNewStoryContent] = useState('');

  const fetchStories = async () => {
    try {
      const res = await api.get('/stories');
      setStories(res.data);
    } catch (err) {
      console.error('Failed to fetch stories', err);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newStoryContent.trim()) return;
    try {
      await api.post('/stories', { content: newStoryContent });
      setNewStoryContent('');
      setIsCreating(false);
      fetchStories(); // refresh
    } catch (err) {
      console.error(err);
      alert('Failed to post story');
    }
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 scrollbar-hide">
        {/* Create Story Button */}
        <div 
          onClick={() => setIsCreating(true)}
          className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0"
        >
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-[var(--neon-cyan)] flex items-center justify-center bg-[var(--neon-cyan)]/10 group-hover:bg-[var(--neon-cyan)]/20 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)] group-hover:shadow-[0_0_25px_rgba(0,240,255,0.6)]">
            <Plus className="w-8 h-8 text-[var(--neon-cyan)]" />
          </div>
          <span className="text-xs text-center font-medium text-[var(--neon-cyan)] group-hover:text-white transition-colors">Launch<br/>Story</span>
        </div>

        {/* Story Items */}
        {stories.map(story => (
          <div 
            key={story._id} 
            onClick={() => setSelectedStory(story)}
            className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0"
          >
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[var(--neon-purple)] via-[var(--neon-pink)] to-yellow-500 shadow-[0_0_15px_rgba(255,0,255,0.4)] group-hover:shadow-[0_0_25px_rgba(255,0,255,0.7)] transition-all">
              <div className="w-full h-full rounded-full bg-[var(--space-dark)] flex items-center justify-center border-2 border-transparent">
                  <span className="text-xl font-bold text-white uppercase">{story.user?.name?.charAt(0) || 'U'}</span>
              </div>
            </div>
            <span className="text-xs text-center font-medium text-gray-300 w-16 truncate group-hover:text-white transition-colors">{story.user?.name?.split(' ')[0] || 'User'}</span>
          </div>
        ))}
      </div>

      {/* Viewing Modal */}
      {selectedStory && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedStory(null)}>
           <div className="w-full max-w-sm h-[80vh] rounded-3xl bg-gradient-to-b from-[var(--space-violet)] to-[var(--space-dark)] border border-white/10 shadow-[0_0_50px_rgba(255,0,255,0.2)] p-6 relative flex flex-col justify-center text-center animate-[slide-up_0.3s_ease-out]" onClick={e => e.stopPropagation()}>
             <button onClick={() => setSelectedStory(null)} className="absolute top-4 right-4 text-white/50 hover:text-white">✕</button>
             <div className="absolute top-6 left-6 flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-[var(--neon-purple)] flex items-center justify-center font-bold">{selectedStory.user?.name?.charAt(0)}</div>
               <span className="font-bold text-white">{selectedStory.user?.name}</span>
             </div>
             <p className="text-2xl font-bold text-white mt-8 whitespace-pre-wrap px-4 font-sans">{selectedStory.content}</p>
             <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
               <div className="h-full bg-[var(--neon-pink)] animate-[progress-bar_5s_linear_forwards]"></div>
             </div>
           </div>
         </div>
      )}

      {/* Creating Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setIsCreating(false)}>
           <div className="glass-card w-full max-w-md p-6 relative" onClick={e => e.stopPropagation()}>
             <button onClick={() => setIsCreating(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">✕</button>
             <h3 className="text-xl font-bold text-white mb-4">Create Story Broadcast</h3>
             <form onSubmit={handleCreateSubmit}>
               <textarea 
                 className="w-full h-32 input-glass mb-4 resize-none"
                 placeholder="What's happening in your universe?"
                 value={newStoryContent}
                 onChange={e => setNewStoryContent(e.target.value)}
                 autoFocus
               />
               <button 
                 type="submit" 
                 disabled={!newStoryContent.trim()}
                 className="w-full btn-neon btn-neon-primary py-3"
               >
                 Broadcast to Space
               </button>
             </form>
           </div>
         </div>
      )}
    </>
  );
};

export default StoryBar;
