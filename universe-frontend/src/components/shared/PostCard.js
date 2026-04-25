import React, { useState } from 'react';
import { Heart, MessageCircle, Flag, Send, Share2, X, Trash2, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import api from '../../api/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';

const BASE_URL = 'http://localhost:5000';

const PostCard = ({ post, currentUserId, onLikeUpdate, onDelete }) => {
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

  // Post Menu state
  const [showMenu, setShowMenu] = useState(false);

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
      alert("Post reported to command.");
      setShowReportModal(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to report');
    }
    setReporting(false);
  };
  
  const handleDelete = async () => {
    if (!window.confirm("Purge this transmission from the logs?")) return;
    try {
      await api.delete(`/posts/${localPost._id}`);
      if (onDelete) onDelete(localPost._id);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete post');
    }
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
      alert('Transmission relayed to Direct Messages!');
      setShowShareModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to share post");
    }
  };

  const renderContent = (p) => (
    <div className="mb-6 relative z-10">
      {p.content && <p className="text-[var(--on-surface)] text-[15px] leading-relaxed whitespace-pre-wrap mb-4">{p.content}</p>}
      
      {p.image && (
        <div className="rounded-2xl overflow-hidden ghost-border max-h-[400px] flex justify-center bg-[var(--surface-container-highest)]">
          <img src={`${BASE_URL}${p.image}`} alt="Media" className="w-full object-cover max-h-[400px] hover:scale-105 transition-transform duration-500" />
        </div>
      )}
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ y: -2 }}
      className="glass-card p-6 mb-6 relative group overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-4">
          <Link to={`/user/${localPost.user?._id}`} className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center font-bold text-[var(--on-surface)] border border-[var(--outline-variant)] bg-[var(--surface-container-high)] hover:border-[var(--primary)] transition-all shadow-md group/avatar">
             {localPost.user?.avatar ? (
                <img src={`${BASE_URL}${localPost.user.avatar}`} alt="avatar" className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform" />
             ) : (
                localPost.user?.name?.charAt(0) || 'U'
             )}
          </Link>
          <div>
            <Link to={`/user/${localPost.user?._id}`} className="flex items-center gap-2 hover:underline decoration-[var(--primary)] underline-offset-2">
              <h4 className="font-bold text-[var(--on-surface)]">{localPost.user?.name || 'Unknown User'}</h4>
            </Link>
            <p className="text-[11px] text-[var(--on-surface-variant)] uppercase tracking-wider font-semibold">{moment(localPost.createdAt).fromNow()}</p>
          </div>
        </div>
        <div className="relative opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-48 glass-card border border-[var(--outline-variant)] shadow-xl z-50 py-2 rounded-xl"
                >
                  {localPost.user?._id === currentUserId && (
                    <button 
                      onClick={() => { setShowMenu(false); handleDelete(); }}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--error-container)]/20 transition-colors flex items-center gap-3"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Post
                    </button>
                  )}
                  <button 
                    onClick={() => { setShowMenu(false); handleReport(); }}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--on-surface)] hover:bg-[var(--surface-container-highest)] transition-colors flex items-center gap-3"
                  >
                    <Flag className="w-4 h-4 text-[var(--tertiary)]" />
                    Report Post
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {renderContent(localPost)}

      <div className="flex items-center gap-6 pt-4 border-t border-[var(--outline-variant)]/50 relative z-10 text-[13px] font-bold">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-2 transition-all ${hasLiked ? 'text-[var(--tertiary)]' : 'text-[var(--on-surface-variant)] hover:text-[var(--tertiary)]'}`}
        >
          <div className="relative">
             <Heart className={`w-5 h-5 transition-all ${hasLiked ? 'fill-current scale-110 shadow-[var(--tertiary)] drop-shadow-md' : 'hover:scale-110'}`} />
          </div>
          <span>{totalLikes}</span>
        </button>

        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-all"
        >
          <MessageCircle className="w-5 h-5 hover:scale-110 transition-transform" />
          <span>{localPost.comments?.length || 0}</span>
        </button>
        
        <button 
          onClick={fetchConversationsForShare}
          className="flex items-center gap-2 text-[var(--on-surface-variant)] hover:text-[var(--secondary)] transition-all ml-auto"
          title="Relay via Secure Comms"
        >
          <Share2 className="w-5 h-5 hover:scale-110 transition-transform" />
        </button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-4 relative z-10"
          >
            <form onSubmit={handleComment} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Transmit comment..."
                className="input-glass !py-2.5 !rounded-full flex-1"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={!commentText.trim()}
                className="w-11 h-11 flex-shrink-0 rounded-full btn-neon btn-neon-outline flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group/btn"
              >
                <Send className="w-5 h-5 group-hover/btn:scale-110 transition-transform -ml-1 mt-0.5" />
              </button>
            </form>

            <div className="space-y-3 mt-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {localPost.comments?.map((comment, idx) => (
                <div key={idx} className="surface-highest rounded-xl p-3 flex gap-3 ghost-border">
                  <Link to={`/user/${comment.user?._id}`} className="w-8 h-8 rounded-full overflow-hidden bg-[var(--surface-container-low)] flex-shrink-0 border border-[var(--outline-variant)] flex items-center justify-center text-xs font-bold text-[var(--on-surface)] hover:border-[var(--primary)] transition-all">
                    {comment.user?.avatar ? (
                       <img src={`${BASE_URL}${comment.user.avatar}`} alt="av" className="w-full h-full object-cover" />
                    ) : (
                       comment.user?.name?.charAt(0) || 'U'
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-0.5">
                      <Link to={`/user/${comment.user?._id}`} className="font-bold text-[13px] text-[var(--on-surface)] truncate hover:underline decoration-[var(--primary)]">{comment.user?.name || 'Someone'}</Link>
                      <span className="text-[10px] text-[var(--on-surface-variant)] uppercase font-semibold flex-shrink-0 ml-2">{moment(comment.createdAt).fromNow()}</span>
                    </div>
                    <p className="text-[var(--on-surface-variant)] text-[13px] leading-snug break-words">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--space-void)]/80 backdrop-blur-md">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="glass-card w-full max-w-sm p-6 relative"
             >
              <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 text-[var(--on-surface-variant)] hover:text-white transition-colors">
                <X className="w-5 h-5"/>
              </button>
              <h3 className="text-xl font-bold gradient-text-spectral mb-4">Relay Transmission</h3>
              <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
                {conversations.length === 0 ? (
                  <p className="text-[var(--on-surface-variant)] text-sm">No active comms links found.</p>
                ) : (
                  conversations.map(c => {
                    const friend = c.members.find(m => m._id !== currentUserId);
                    if (!friend) return null;
                    return (
                      <button 
                        key={c._id}
                        onClick={() => handleShareToDM(c._id, friend._id)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--surface-container-low)] ghost-border hover:border-[var(--secondary)] transition-all text-left"
                      >
                        <div className="w-8 h-8 rounded-full border border-[var(--outline-variant)] bg-[var(--surface-highest)] flex items-center justify-center text-xs font-bold text-[var(--on-surface)] overflow-hidden">
                          {friend.avatar ? <img src={`${BASE_URL}${friend.avatar}`} alt="av" className="w-full h-full object-cover" /> : friend.name?.charAt(0)}
                        </div>
                        <span className="font-bold text-[var(--on-surface)] text-sm truncate">{friend.name}</span>
                      </button>
                    )
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--space-void)]/80 backdrop-blur-md">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="glass-card w-full max-w-sm p-6 relative"
             >
              <button onClick={() => setShowReportModal(false)} className="absolute top-4 right-4 text-[var(--on-surface-variant)] hover:text-white transition-colors">
                <X className="w-5 h-5"/>
              </button>
              <h3 className="text-xl font-bold text-[var(--error)] mb-4">Flag Violation</h3>
              <form onSubmit={submitReport} className="space-y-4">
                <div>
                  <label className="label-tech block mb-1">Violation Type</label>
                  <select 
                    className="input-glass w-full" 
                    value={reportReason} 
                    onChange={(e) => setReportReason(e.target.value)}
                  >
                    <option value="Spam" className="bg-[var(--surface-container-highest)]">Spam / Promotion</option>
                    <option value="Harassment" className="bg-[var(--surface-container-highest)]">Harassment / Bullying</option>
                    <option value="Hate Speech" className="bg-[var(--surface-container-highest)]">Hate Speech</option>
                    <option value="Explicit Content" className="bg-[var(--surface-container-highest)]">Explicit Content</option>
                    <option value="Other" className="bg-[var(--surface-container-highest)]">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label-tech block mb-1">Details (Optional)</label>
                  <textarea 
                    className="input-glass w-full"
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide incident log..."
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={reporting}
                  className="w-full py-2.5 font-bold rounded-lg border border-[var(--error)] text-[var(--error)] hover:bg-[var(--error)] hover:text-white transition-all disabled:opacity-50"
                >
                  {reporting ? 'Uploading Logs...' : 'Submit Report'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;
