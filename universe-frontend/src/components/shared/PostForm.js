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

      // Mutler will handle the multipart form
      await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setMessage('Post submitted successfully! Approaching moderation orbit...');
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
    <div className="glass-card p-6 mb-8 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--neon-purple)] rounded-full blur-[80px] opacity-30"></div>
      
      <form onSubmit={handleSubmit} className="relative z-10">
        <textarea
          className="w-full bg-transparent border-none text-xl text-white placeholder-gray-500 focus:ring-0 resize-none h-20 p-2 focus:outline-none"
          placeholder="Broadcast to the UniVerse..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        
        {image && (
          <div className="relative inline-block mt-2 mb-4">
            <img src={URL.createObjectURL(image)} alt="Preview" className="h-32 rounded-lg object-cover border border-[var(--neon-cyan)] shadow-[0_0_10px_rgba(0,240,255,0.3)]" />
            <button type="button" onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-[var(--space-dark)] rounded-full text-white hover:text-red-400 p-1 border border-[var(--glass-border)]">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-4 border-t border-[var(--glass-border)]">
          <div className="flex gap-2">
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
            <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 rounded-full transition-colors flex items-center gap-2">
              <ImageIcon className="w-6 h-6" />
              <span className="text-sm font-medium hidden sm:inline">Add Media</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            {message && <span className={`text-sm ${message.includes('failed') ? 'text-red-400' : 'text-green-400'}`}>{message}</span>}
            
            <button
              type="submit"
              disabled={loading || (!content.trim() && !image)}
              className="btn-neon btn-neon-primary px-6 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Transmitting...' : 'Post'}
              {!loading && <Send className="w-4 h-4 ml-1" />}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
