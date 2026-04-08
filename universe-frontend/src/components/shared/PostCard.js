import React, { useState } from 'react';
import { Heart, MessageCircle, Flag, Send, Share2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import api from '../../api/axiosConfig';
import { motion } from 'framer-motion';

const BASE_URL = 'http://localhost:5000';

const PostCard = ({ post, currentUserId, onLikeUpdate }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localPost, setLocalPost] = useState(post);
  const [reporting, setReporting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Spam');
  const [reportDetails, setReportDetails] = useState('');
  
  // Share to DM Modal states
  const [showShareModal, setShowShareModal] = useState(false);
  const [conversations, setConversations] = useState([]);

  const hasLiked = localPost.likes.includes(currentUserId);
  const totalLikes = localPost.likes.length;

  const handleLike = async () => {
    try {
      const res = await api.put(`/posts/like/${localPost._id}`);
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
      
      setLocalPost({
        ...localPost,
        comments: [...localPost.comments, { user: { name: 'You' }, text: commentText, createdAt: new Date() }]
      });
      setCommentText('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleReport = () => {
    setShowReportModal(true);
  };
  
  const submitReport = async (e) => {
    e.preventDefault();
    setReporting(true);
    try {
      await api.put(`/posts/report/${localPost._id}`, { reason: reportReason, details: reportDetails });
      alert("Post reported to moderators.");
      setShowReportModal(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to report');
    }
    setReporting(false);
  };
  
  const fetchConversationsForShare = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data);
      setShowShareModal(true);
    } catch (err) {
      console.error("Failed to fetch conversations for sharing");
    }
  };

  const handleShareToDM = async (conversationId, receiverId) => {
    try {
      const shareText = `Check out this post by ${localPost.user?.name}:\n"${localPost.content.substring(0, 50)}..."`;
      await api.post('/messages', {
        conversationId,
        text: shareText,
        receiverId
      });
      alert('Post shared in direct messages!');
      setShowShareModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to share post");
    }
  };

  const renderContent = (p) => (
    <div className="mb-6">
      {p.content && <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap mb-4">{p.content}</p>}
      
      {p.image && (
        <div className="rounded-xl overflow-hidden border border-[var(--glass-border)] max-h-96 flex justify-center bg-black/50">
          <img src={`${BASE_URL}${p.image}`} alt="Post content" className="max-w-full max-h-96 object-contain" />
        </div>
      )}
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ y: -4 }}
      className="glass-card backdrop-blur-xl bg-black/40 border border-white/10 shadow-lg hover:shadow-[0_8px_32px_rgba(220,20,60,0.15)] hover:border-white/20 p-6 mb-6 relative group overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <Link to={`/user/${localPost.user?._id}`} className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-bold text-white shadow-[0_0_10px_rgba(255,0,255,0.4)] bg-[var(--neon-purple)] hover:ring-2 hover:ring-[var(--neon-cyan)] transition-all">
             {localPost.user?.avatar ? (
                <img src={`${BASE_URL}${localPost.user.avatar}`} alt="avatar" className="w-full h-full object-cover" />
             ) : (
                localPost.user?.name?.charAt(0) || 'U'
             )}
          </Link>
          <div>
            <Link to={`/user/${localPost.user?._id}`} className="flex items-center gap-2 hover:underline">
              <h4 className="font-bold text-gray-100">{localPost.user?.name || 'Unknown Student'}</h4>
            </Link>
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

      {renderContent(localPost)}

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
        
        <button 
          onClick={fetchConversationsForShare}
          className="flex items-center gap-2 text-gray-400 hover:text-[var(--neon-purple)] transition-colors group ml-auto"
          title="Share to Direct Messages"
        >
          <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>

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

          <div className="space-y-3 mt-4 max-h-48 overflow-y-auto pr-2">
            {localPost.comments?.map((comment, idx) => (
              <div key={idx} className="bg-white/5 rounded-xl p-3 flex gap-3">
                <Link to={`/user/${comment.user?._id}`} className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white hover:ring-2 hover:ring-[var(--neon-cyan)] transition-all">
                  {comment.user?.avatar ? (
                     <img src={`${BASE_URL}${comment.user.avatar}`} alt="av" className="w-full h-full object-cover" />
                  ) : (
                     comment.user?.name?.charAt(0) || 'U'
                  )}
                </Link>
                <div>
                  <div className="flex items-baseline gap-2">
                    <Link to={`/user/${comment.user?._id}`} className="font-bold text-sm text-gray-200 hover:underline">{comment.user?.name || 'Someone'}</Link>
                    <span className="text-xs text-gray-500">{moment(comment.createdAt).fromNow()}</span>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="glass-card w-full max-w-sm p-6 relative">
            <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5"/>
            </button>
            <h3 className="text-xl font-bold text-white mb-4">Share to Direct Messages</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {conversations.length === 0 ? (
                <p className="text-gray-500 text-sm">No active direct messages. Follow someone to start messaging.</p>
              ) : (
                conversations.map(c => {
                  const friend = c.members.find(m => m._id !== currentUserId);
                  if (!friend) return null;
                  return (
                    <button 
                      key={c._id}
                      onClick={() => handleShareToDM(c._id, friend._id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-[var(--neon-purple)] flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                        {friend.avatar ? <img src={`${BASE_URL}${friend.avatar}`} alt="av" className="w-full h-full object-cover" /> : friend.name?.charAt(0)}
                      </div>
                      <span className="font-bold text-white text-sm">{friend.name}</span>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="glass-card w-full max-w-sm p-6 relative">
            <button onClick={() => setShowReportModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5"/>
            </button>
            <h3 className="text-xl font-bold text-white mb-4">Report Violation</h3>
            <form onSubmit={submitReport} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Violation Type</label>
                <select 
                  className="input-glass w-full" 
                  value={reportReason} 
                  onChange={(e) => setReportReason(e.target.value)}
                >
                  <option value="Spam" className="bg-black">Spam / Promotion</option>
                  <option value="Harassment" className="bg-black">Harassment / Bullying</option>
                  <option value="Hate Speech" className="bg-black">Hate Speech</option>
                  <option value="Explicit Content" className="bg-black">Explicit Content</option>
                  <option value="Other" className="bg-black">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Details (Optional)</label>
                <textarea 
                  className="input-glass w-full"
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Provide more context..."
                />
              </div>
              <button 
                type="submit" 
                disabled={reporting}
                className="w-full py-2 bg-[var(--neon-pink)] text-white font-bold rounded-lg hover:shadow-[0_0_15px_rgba(255,0,255,0.5)] transition-all"
              >
                {reporting ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PostCard;
