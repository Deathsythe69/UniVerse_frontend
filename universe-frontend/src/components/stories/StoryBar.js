import React, { useState, useEffect, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import api from '../../api/axiosConfig';

const StoryBar = () => {
  const [groupedStories, setGroupedStories] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newStoryContent, setNewStoryContent] = useState('');
  const [newStoryImage, setNewStoryImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  const BASE_URL = 'http://localhost:5000';

  const fetchStories = async () => {
    try {
      const res = await api.get('/stories');
      const groups = {};
      
      // Group stories by User ID
      res.data.forEach(story => {
         const uid = story.user._id;
         if(!groups[uid]) {
            groups[uid] = { user: story.user, stories: [] };
         }
         groups[uid].stories.push(story);
      });
      
      setGroupedStories(Object.values(groups));
    } catch (err) {
      console.error('Failed to fetch stories', err);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newStoryImage) return alert("An image is required for a story!");
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', newStoryContent);
      formData.append('image', newStoryImage);
      
      await api.post('/stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNewStoryContent('');
      setNewStoryImage(null);
      setIsCreating(false);
      fetchStories(); 
    } catch (err) {
      console.error(err);
      alert('Failed to post story');
    }
    setLoading(false);
  };

  const nextStory = () => {
    if (selectedGroup && currentIndex < selectedGroup.stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setSelectedGroup(null);
      setCurrentIndex(0);
    }
  };

  const prevStory = () => {
    if (selectedGroup && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setSelectedGroup(null);
      setCurrentIndex(0);
    }
  };

  useEffect(() => {
    let timer;
    if (selectedGroup) {
      timer = setTimeout(() => {
        nextStory();
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [selectedGroup, currentIndex]);

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 scrollbar-hide">
        {/* Create Story Button */}
        <div onClick={() => setIsCreating(true)} className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-[var(--neon-cyan)] flex items-center justify-center bg-[var(--neon-cyan)]/10 group-hover:bg-[var(--neon-cyan)]/20 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)] group-hover:shadow-[0_0_25px_rgba(0,240,255,0.6)]">
            <Plus className="w-8 h-8 text-[var(--neon-cyan)]" />
          </div>
          <span className="text-xs text-center font-medium text-[var(--neon-cyan)] group-hover:text-white transition-colors">Launch<br/>Story</span>
        </div>

        {/* Story Items by User */}
        {groupedStories.map(group => {
          const latestStory = group.stories[group.stories.length - 1]; // Use last uploaded story as thumbnail
          return (
            <div key={group.user._id} onClick={() => { setSelectedGroup(group); setCurrentIndex(0); }} className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0">
              <div className={`w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[var(--neon-purple)] via-[var(--neon-pink)] to-yellow-500 shadow-[0_0_15px_rgba(255,0,255,0.4)] group-hover:shadow-[0_0_25px_rgba(255,0,255,0.7)] transition-all relative`}>
                <div className="w-full h-full rounded-full bg-[var(--space-dark)] overflow-hidden flex items-center justify-center border-2 border-[var(--space-dark)]">
                    <img src={`${BASE_URL}${latestStory.image}`} alt="story" className="w-full h-full object-cover" />
                </div>
                {group.stories.length > 1 && (
                  <div className="absolute -bottom-1 -right-1 bg-[var(--neon-pink)] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[var(--space-dark)]">
                    {group.stories.length}
                  </div>
                )}
              </div>
              <span className="text-xs text-center font-medium text-gray-300 w-16 truncate group-hover:text-white transition-colors">{group.user?.name?.split(' ')[0] || 'User'}</span>
            </div>
          );
        })}
      </div>

      {/* Viewing Modal Slideshow */}
      {selectedGroup && selectedGroup.stories[currentIndex] && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4" onClick={() => setSelectedGroup(null)}>
           <div className="w-full max-w-md h-[85vh] rounded-3xl bg-black border border-white/20 shadow-[0_0_50px_rgba(255,0,255,0.3)] relative flex flex-col items-center justify-center overflow-hidden animate-[slide-up_0.3s_ease-out]" onClick={e => e.stopPropagation()}>
             <img src={`${BASE_URL}${selectedGroup.stories[currentIndex].image}`} alt="story" className="absolute inset-0 w-full h-full object-contain z-0" />
             
             {/* Invisible navigation areas */}
             <div className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer" onClick={(e) => { e.stopPropagation(); prevStory(); }}></div>
             <div className="absolute inset-y-0 right-0 w-2/3 z-10 cursor-pointer" onClick={(e) => { e.stopPropagation(); nextStory(); }}></div>

             <button onClick={() => setSelectedGroup(null)} className="absolute top-4 right-4 z-20 text-white drop-shadow-md bg-black/50 p-1 rounded-full hover:bg-black/80">
                <X className="w-6 h-6" />
             </button>
             
             <div className="absolute top-6 left-5 z-20 flex items-center gap-3 bg-black/40 pr-4 rounded-full backdrop-blur-sm border border-white/10 p-1">
               <div className="w-8 h-8 rounded-full bg-[var(--neon-purple)] flex items-center justify-center font-bold text-sm text-white overflow-hidden">
                 {selectedGroup.user?.avatar ? <img src={`${BASE_URL}${selectedGroup.user.avatar}`} alt="av" className="w-full h-full object-cover" /> : selectedGroup.user?.name?.charAt(0)}
               </div>
               <span className="font-bold text-white text-sm">{selectedGroup.user?.name}</span>
             </div>
             
             {selectedGroup.stories[currentIndex].content && (
                <div className="absolute bottom-10 left-4 right-4 z-20 bg-black/60 p-4 rounded-xl backdrop-blur-md border border-white/10 pointer-events-none">
                  <p className="font-bold text-white text-md whitespace-pre-wrap">{selectedGroup.stories[currentIndex].content}</p>
                </div>
             )}
             
             {/* Slideshow Progress Bars */}
             <div className="absolute top-2 left-2 right-2 z-20 flex gap-1 px-1">
               {selectedGroup.stories.map((s, idx) => (
                 <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden relative">
                   {idx < currentIndex && <div className="absolute inset-0 bg-white"></div>}
                   {idx === currentIndex && <div key={currentIndex} className="absolute inset-0 bg-white animate-[progress-bar_5s_linear_forwards]" onAnimationEnd={nextStory}></div>}
                 </div>
               ))}
             </div>
           </div>
         </div>
      )}

      {/* Creating Modal (unchanged) */}
      {isCreating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setIsCreating(false)}>
           <div className="glass-card w-full max-w-md p-6 relative" onClick={e => e.stopPropagation()}>
             <button onClick={() => setIsCreating(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X /></button>
             <h3 className="text-xl font-bold text-white mb-4">Create Story Broadcast</h3>
             <form onSubmit={handleCreateSubmit} className="space-y-4">
               <div>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={e => setNewStoryImage(e.target.files[0])} className="hidden" />
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="w-full h-56 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center cursor-pointer hover:border-[var(--neon-cyan)] transition-colors overflow-hidden group"
                  >
                    {newStoryImage ? (
                      <img src={URL.createObjectURL(newStoryImage)} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-gray-400 flex flex-col items-center group-hover:text-[var(--neon-cyan)] transition-colors">
                        <Plus className="w-10 h-10 mb-2" />
                        <span>Select Image Media</span>
                      </div>
                    )}
                  </div>
               </div>
               <textarea 
                 className="w-full h-24 input-glass resize-none"
                 placeholder="Add a caption... (optional)"
                 value={newStoryContent}
                 onChange={e => setNewStoryContent(e.target.value)}
               />
               <button type="submit" disabled={!newStoryImage || loading} className="w-full btn-neon btn-neon-primary py-3 flex justify-center items-center">
                 {loading ? 'Transmitting...' : 'Broadcast to Space'}
               </button>
             </form>
           </div>
         </div>
      )}
    </>
  );
};

export default StoryBar;
