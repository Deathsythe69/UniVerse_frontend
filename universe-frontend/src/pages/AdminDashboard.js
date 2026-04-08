import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import api from '../api/axiosConfig';
import { ShieldAlert, Users, FileText, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const res = await api.get('/admin/metrics');
      setMetrics(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load admin metrics');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to make this user a ${newRole}?`)) return;
    try {
      await api.put(`/admin/moderator/${userId}`, { role: newRole });
      fetchMetrics();
    } catch (err) {
      alert("Failed to update role");
    }
  };

  const handleBlacklistToggle = async (userId, isBlacklisted) => {
    const action = isBlacklisted ? "whitelist" : "blacklist";
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      await api.put(`/admin/blacklist/${userId}`);
      fetchMetrics();
    } catch (err) {
      alert(`Failed to ${action} user`);
    }
  };

  if (loading || !metrics) {
    return (
      <MainLayout>
        <div className="flex h-full items-center justify-center text-[var(--neon-cyan)] animate-pulse font-bold text-2xl">
          Superuser Access Auth...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3 border-b border-[var(--glass-border)] pb-4">
          <ShieldAlert className="text-[var(--neon-pink)] w-8 h-8" /> Admin Dashboard
        </h2>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 flex flex-col items-center justify-center bg-white/5 border border-[var(--neon-cyan)]/30">
            <Users className="w-10 h-10 text-[var(--neon-cyan)] mb-2" />
            <h3 className="text-4xl font-black text-white">{metrics.totalUsers}</h3>
            <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mt-1">Total Citizens</p>
          </div>
          
          <div className="glass-card p-6 flex flex-col items-center justify-center bg-white/5 border border-[var(--neon-purple)]/30">
            <FileText className="w-10 h-10 text-[var(--neon-purple)] mb-2" />
            <h3 className="text-4xl font-black text-white">{metrics.totalPosts}</h3>
            <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mt-1">Transmissions</p>
          </div>

          <div className="glass-card p-6 flex flex-col items-center justify-center bg-white/5 border border-[var(--neon-pink)]/30">
            <Activity className="w-10 h-10 text-[var(--neon-pink)] mb-2" />
            <h3 className="text-4xl font-black text-white">{metrics.totalReports}</h3>
            <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mt-1">Active Reports</p>
          </div>
        </div>

        {/* Content Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Recent Users List */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--neon-cyan)]" /> Recent Personnel
            </h3>
            <div className="space-y-3">
              {metrics.activeUsers.map(u => (
                <div key={u._id} className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-[var(--glass-border)]">
                  <div>
                    <p className="font-bold text-white text-sm">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                    {u.role === 'moderator' && <span className="text-[10px] text-[var(--neon-purple)] font-bold uppercase border border-[var(--neon-purple)] rounded px-1 mt-1 inline-block">Moderator</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleRoleChange(u._id, u.role === 'moderator' ? 'student' : 'moderator')}
                      disabled={u.role === 'admin'}
                      className={`text-xs px-2 py-1 rounded transition-colors ${u.role === 'moderator' ? 'bg-gray-700 text-white' : 'bg-[var(--neon-purple)]/20 text-[var(--neon-purple)] hover:bg-[var(--neon-purple)] hover:text-white'}`}
                    >
                      {u.role === 'moderator' ? 'Demote' : 'Make Mod'}
                    </button>
                    <button 
                      onClick={() => handleBlacklistToggle(u._id, u.isBlacklisted)}
                      disabled={u.role === 'admin'}
                      className={`text-xs px-2 py-1 rounded transition-colors ${u.isBlacklisted ? 'bg-gray-700 text-white' : 'bg-[var(--neon-pink)]/20 text-[var(--neon-pink)] hover:bg-[var(--neon-pink)] hover:text-white'}`}
                    >
                      {u.isBlacklisted ? 'Whitelist' : 'Blacklist'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Moderators List */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[var(--neon-purple)]" /> Active Moderators
            </h3>
            <div className="space-y-3">
              {metrics.moderators.length === 0 ? <p className="text-gray-500 text-sm">No moderators currently active.</p> : metrics.moderators.map(m => (
                <div key={m._id} className="flex justify-between items-center p-3 bg-[var(--neon-purple)]/10 rounded-lg border border-[var(--neon-purple)]/30">
                  <div>
                    <p className="font-bold text-white text-sm">{m.name}</p>
                    <p className="text-xs text-[var(--neon-purple)]">{m.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
