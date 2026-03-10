import React, { useState } from 'react';
import { Send, Image as ImageIcon } from 'lucide-react';
import api from '../../api/axiosConfig';

const PostForm = ({ onPostSuccess }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await api.post('/posts', { content });
      setMessage('Post submitted successfully! Approaching moderation orbit...');
      setContent('');
      if (onPostSuccess) onPostSuccess();
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Mission failed: ' + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  };

  return (
    <div className="glass-card p-6 mb-8 relative overflow-hidden">
      {/* Subtle glow effect behind form */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--neon-purple)] rounded-full blur-[80px] opacity-30"></div>
      
      <form onSubmit={handleSubmit} className="relative z-10">
        <textarea
          className="w-full bg-transparent border-none text-xl text-white placeholder-gray-500 focus:ring-0 resize-none h-24 p-2 focus:outline-none"
          placeholder="Broadcast to the UniVerse..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--glass-border)]">
          <div className="flex gap-2">
            <button type="button" className="p-2 text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 rounded-full transition-colors flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Media (Soon)</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            {message && <span className={`text-sm ${message.includes('failed') ? 'text-red-400' : 'text-green-400'}`}>{message}</span>}
            
            <button
              type="submit"
              disabled={loading || !content.trim()}
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
