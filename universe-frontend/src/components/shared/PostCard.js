import React, { useState } from 'react';
import { Heart, MessageCircle, Flag, Send } from 'lucide-react';
import moment from 'moment';
import api from '../../api/axiosConfig';

const PostCard = ({ post, currentUserId, onLikeUpdate }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localPost, setLocalPost] = useState(post);
  const [reporting, setReporting] = useState(false);

  // Note: Backend object ids are returned as strings in JSON
  const hasLiked = localPost.likes.includes(currentUserId);
  const totalLikes = localPost.likes.length;

  const handleLike = async () => {
    try {
      const res = await api.put(`/posts/like/${localPost._id}`);
      // Optimistic or API-driven update
      const newlyLiked = res.data.message === 'Post liked';
      
      let updatedLikes = [...localPost.likes];
      if (newlyLiked) {
        updatedLikes.push(currentUserId);
      } else {
        updatedLikes = updatedLikes.filter(id => id !== currentUserId);
      }
      
      setLocalPost({ ...localPost, likes: updatedLikes });
      if (onLikeUpdate) onLikeUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await api.post(`/posts/comment/${localPost._id}`, { text: commentText });
      
      // Optimistic UI update
      setLocalPost({
        ...localPost,
        comments: [...localPost.comments, { user: { name: 'You' }, text: commentText, createdAt: new Date() }]
      });
      setCommentText('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleReport = async () => {
    if (!window.confirm("Are you sure you want to report this post?")) return;
    setReporting(true);
    try {
      await api.put(`/posts/report/${localPost._id}`);
      alert("Post reported to moderators.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to report');
    }
    setReporting(false);
  };

  return (
    <div className="glass-card p-6 mb-6 transition-transform hover:-translate-y-1 duration-300">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--neon-purple)] to-[var(--neon-pink)] flex items-center justify-center font-bold text-white shadow-[0_0_10px_rgba(255,0,255,0.4)]">
            {localPost.user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h4 className="font-bold text-gray-100">{localPost.user?.name || 'Unknown Student'}</h4>
            <p className="text-xs text-gray-400">{moment(localPost.createdAt).fromNow()}</p>
          </div>
        </div>
        <button 
          onClick={handleReport}
          disabled={reporting}
          className="text-gray-500 hover:text-red-400 transition-colors" 
          title="Report Post"
        >
          <Flag className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="mb-6">
        <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">{localPost.content}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 pt-4 border-t border-[var(--glass-border)]">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-2 group transition-colors ${hasLiked ? 'text-[var(--neon-pink)]' : 'text-gray-400 hover:text-[var(--neon-pink)]'}`}
        >
          <Heart className={`w-6 h-6 transition-all ${hasLiked ? 'fill-current scale-110 drop-shadow-[0_0_8px_rgba(255,0,255,0.6)]' : 'group-hover:scale-110'}`} />
          <span className="font-bold">{totalLikes}</span>
        </button>

        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-gray-400 hover:text-[var(--neon-cyan)] transition-colors group"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="font-bold">{localPost.comments?.length || 0}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-6 space-y-4">
          <form onSubmit={handleComment} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Write a comment..."
              className="input-glass !py-2 !rounded-full flex-1"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
            />
            <button 
              type="submit" 
              className="w-10 h-10 rounded-full bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] flex items-center justify-center hover:bg-[var(--neon-cyan)] hover:text-black transition-all hover:shadow-[0_0_10px_rgba(0,240,255,0.5)]"
            >
              <Send className="w-5 h-5 -ml-1 mt-1" />
            </button>
          </form>

          <div className="space-y-3 mt-4 max-h-48 overflow-y-auto">
            {localPost.comments?.map((comment, idx) => (
              <div key={idx} className="bg-white/5 rounded-xl p-3 flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-300">
                  {comment.user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-sm text-gray-200">{comment.user?.name || 'Someone'}</span>
                    <span className="text-xs text-gray-500">{moment(comment.createdAt).fromNow()}</span>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
