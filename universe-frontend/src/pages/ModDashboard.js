import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import api from '../api/axiosConfig';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import moment from 'moment';

const BASE_URL = 'http://localhost:5000';

const ModDashboard = () => {
  const [reportedPosts, setReportedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActionablePosts = async () => {
    try {
      const repRes = await api.get('/posts/reported');
      setReportedPosts(repRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActionablePosts();
  }, []);

  const handleDismiss = async (id) => {
    if (!window.confirm("Are you sure you want to dismiss all reports and keep the post alive?")) return;
    try {
      await api.put(`/posts/dismiss-reports/${id}`);
      setReportedPosts(reportedPosts.filter(p => p._id !== id));
    } catch (err) {
      alert("Failed to dismiss reports");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this reported post?")) return;
    try {
      await api.delete(`/posts/${id}`);
      setReportedPosts(reportedPosts.filter(p => p._id !== id));
    } catch (err) {
      alert("Failed to delete post");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[var(--neon-cyan)] animate-pulse font-bold text-2xl">Loading Dashboard...</div>;

  return (
    <MainLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-pink)] flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-[var(--neon-pink)]" /> Moderation Center
        </h2>
        
        <div>
          <h3 className="text-2xl font-bold text-white mb-4 border-b border-[var(--glass-border)] pb-2 flex items-center gap-2">
            <span className="bg-[var(--neon-pink)] text-black px-2 py-1 rounded text-sm">{reportedPosts.length}</span> Reported Content
          </h3>
          
          {reportedPosts.length === 0 ? (
            <div className="text-center p-10 glass-card">
               <CheckCircle className="w-16 h-16 text-[var(--neon-cyan)] mx-auto mb-4" />
               <p className="text-gray-400 font-bold">No reported content to review. Campus is clean.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {reportedPosts.map(post => (
                <div key={post._id} className="glass-card p-6 border border-[var(--neon-pink)]/30 border-l-4 border-l-[var(--neon-pink)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <AlertTriangle className="w-32 h-32 text-[var(--neon-pink)] -mr-10 -mt-10" />
                  </div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                         {post.user?.avatar ? <img src={`${BASE_URL}${post.user?.avatar}`} alt="av" className="w-full h-full object-cover"/> : post.user?.name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-100">{post.user?.name}</h4>
                        <p className="text-xs text-[var(--neon-pink)] flex items-center gap-1 font-bold">
                          <AlertTriangle className="w-3 h-3" /> Reported by {post.reports?.length || 0} users
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-black/40 rounded-xl border border-white/5 relative z-10 mb-4">
                    <p className="text-gray-200 mb-4 whitespace-pre-wrap">{post.content}</p>
                    
                    {post.image && (
                      <div className="rounded-xl overflow-hidden max-h-64 mb-4 flex justify-center bg-black/50">
                        <img src={`${BASE_URL}${post.image}`} alt="Post" className="w-auto h-full max-h-64 object-contain" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 relative z-10">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Flagged Violations</h5>
                    <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                       {post.reports?.map((r, idx) => (
                         <div key={idx} className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-sm">
                            <span className="font-bold text-[var(--neon-pink)]">{r.reason || 'Inappropriate'}</span>
                            {r.details && <span className="text-gray-300 ml-2 italic">"{r.details}"</span>}
                            {r.user && <span className="text-xs text-gray-500 block mt-1">Submitted by: {r.user.name}</span>}
                         </div>
                       ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-4 mt-6 relative z-10 pt-4 border-t border-[var(--glass-border)]">
                    <button 
                      onClick={() => handleDismiss(post._id)}
                      className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 rounded-xl hover:bg-yellow-500 hover:text-black hover:shadow-[0_0_15px_rgba(234,179,8,0.5)] transition font-bold"
                    >
                      Dismiss Reports (Keep)
                    </button>
                    <button 
                      onClick={() => handleReject(post._id)}
                      className="px-5 py-2 bg-[var(--neon-pink)]/20 text-[var(--neon-pink)] border border-[var(--neon-pink)] rounded-xl hover:bg-[var(--neon-pink)] hover:text-white hover:shadow-[0_0_15px_rgba(255,0,255,0.5)] transition flex items-center gap-2 font-black"
                    >
                      <XCircle className="w-5 h-5"/> Terminate Post
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ModDashboard;
