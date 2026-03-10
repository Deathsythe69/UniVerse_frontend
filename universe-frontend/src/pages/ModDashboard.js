import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';
import MainLayout from '../components/layout/MainLayout';
import moment from 'moment';
import { ShieldCheck, ShieldAlert, Trash2, CheckCircle, XCircle } from 'lucide-react';

const ModDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'reported'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = async (type) => {
    setLoading(true);
    try {
      const res = await api.get(`/posts/${type}`);
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocs(activeTab);
  }, [activeTab]);

  const handleAction = async (action, id) => {
    try {
      let endpoint = '';
      let method = 'put';
      
      switch (action) {
        case 'approve': endpoint = `/posts/approve/${id}`; break;
        case 'reject': endpoint = `/posts/${id}`; method = 'delete'; break;
        case 'dismiss': endpoint = `/posts/dismiss-reports/${id}`; break;
        case 'delete': endpoint = `/posts/${id}`; method = 'delete'; break;
        default: return;
      }

      await api[method](endpoint);
      // Remove from list
      setPosts(posts.filter(p => p._id !== id));
      
    } catch (err) {
      alert("Action failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        
        <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-l-4 border-l-yellow-500">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-yellow-500" />
              Overwatch Console
            </h1>
            <p className="text-gray-400 mt-1">Reviewing coordinates as: <span className="text-yellow-500 font-bold">{user?.role.toUpperCase()}</span></p>
          </div>
          
          <div className="flex bg-black/50 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'pending' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Pending Approval
            </button>
            <button 
              onClick={() => setActiveTab('reported')}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'reported' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Reported Signals
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
             <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-50" />
            <p className="text-xl text-gray-400">Sector is clear. No active alerts.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post._id} className="glass-card p-6 border-l-4 border-l-gray-500 relative overflow-hidden group">
                
                {/* Background warning pattern for reported */}
                {activeTab === 'reported' && (
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldAlert className="w-32 h-32 text-red-500 -mr-10 -mt-10" />
                  </div>
                )}

                <div className="relative z-10 flex flex-col md:flex-row gap-6">
                  {/* Content Data */}
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold">
                          {post.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white leading-tight">{post.user?.name}</p>
                          <p className="text-xs text-gray-400">{moment(post.createdAt).format('MMMM Do YYYY, h:mm a')}</p>
                        </div>
                      </div>
                      
                      {activeTab === 'reported' && (
                        <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 text-sm font-bold flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4" />
                          {post.reports?.length || 0} Reports
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                      <p className="text-gray-200 text-lg whitespace-pre-wrap">{post.content}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row md:flex-col justify-end gap-3 flex-shrink-0">
                    {activeTab === 'pending' ? (
                      <>
                        <button 
                          onClick={() => handleAction('approve', post._id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500 hover:text-black hover:shadow-[0_0_15px_rgba(34,197,94,0.5)] rounded-xl transition-all font-bold"
                        >
                          <CheckCircle className="w-5 h-5" /> Approve
                        </button>
                        <button 
                          onClick={() => handleAction('reject', post._id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-black hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] rounded-xl transition-all font-bold"
                        >
                          <XCircle className="w-5 h-5" /> Reject
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleAction('dismiss', post._id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500 hover:text-black hover:shadow-[0_0_15px_rgba(234,179,8,0.5)] rounded-xl transition-all font-bold"
                        >
                          <CheckCircle className="w-5 h-5" /> Clear Flags
                        </button>
                        <button 
                          onClick={() => handleAction('delete', post._id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-black hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] rounded-xl transition-all font-bold"
                        >
                          <Trash2 className="w-5 h-5" /> Delete Post
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default ModDashboard;
