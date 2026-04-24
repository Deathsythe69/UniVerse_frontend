import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, X } from 'lucide-react';
import api from '../../api/axiosConfig';

const PostForm = ({ onPostSuccess }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setLoading(true);
    try {
      const formData = new FormData();
      if (content.trim()) formData.append('content', content);
      if (image) formData.append('image', image);

      await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setMessage('Post submitted successfully!');
      setContent('');
      setImage(null);
      if (onPostSuccess) onPostSuccess();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Mission failed: ' + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  return (
    <div className="glass-card p-6 mb-8 relative overflow-hidden group">
      {/* Abstract neon glow underlying the component */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--secondary)] rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
      
      <form onSubmit={handleSubmit} className="relative z-10">
        <textarea
          className="w-full bg-transparent border-none text-xl text-[var(--on-surface)] placeholder-[var(--on-surface-variant)] focus:ring-0 resize-none h-24 p-2 focus:outline-none"
          placeholder="Broadcast to the UniVerse..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        
        {image && (
          <div className="relative inline-block mt-2 mb-4 ml-2">
            <img src={URL.createObjectURL(image)} alt="Preview" className="h-32 rounded-xl object-cover border border-[var(--outline-variant)] shadow-lg" />
            <button type="button" onClick={() => setImage(null)} className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center bg-[var(--surface-highest)] rounded-full text-[var(--on-surface)] hover:text-[var(--error)] shadow-md border border-[var(--outline-variant)] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-4 mt-2 border-t border-[var(--outline-variant)]/50">
          <div className="flex gap-2">
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
            <button type="button" onClick={() => fileInputRef.current.click()} className="px-4 py-2 text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-full transition-colors flex items-center gap-2 font-medium">
              <ImageIcon className="w-5 h-5" />
              <span className="text-sm hidden sm:inline">Attach Media</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            {message && <span className={`text-sm font-medium ${message.includes('failed') ? 'text-[var(--error)]' : 'text-green-400'}`}>{message}</span>}
            
            <button
              type="submit"
              disabled={loading || (!content.trim() && !image)}
              className="btn-neon btn-neon-primary px-6 py-2.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Transmitting <Send className="w-4 h-4 ml-1" /></>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
