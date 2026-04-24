import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import MainLayout from '../components/layout/MainLayout';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', bio: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = React.useRef(null);
  
  const BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        if (res.data.user) {
          setFormData({
            name: res.data.user.name || '',
            bio: res.data.user.bio || ''
          });
          if (res.data.user.avatar) {
            setCurrentAvatarUrl(res.data.user.avatar.startsWith('http') ? res.data.user.avatar : `${BASE_URL}${res.data.user.avatar}`);
          }
        }
      } catch (err) {
        setError('Failed to load profile');
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('bio', formData.bio);
      if (avatarFile) {
        data.append('avatar', avatarFile);
      }

      const res = await api.put('/auth/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Profile credentials updated!');
      if (res.data.user.avatar) {
        setCurrentAvatarUrl(res.data.user.avatar.startsWith('http') ? res.data.user.avatar : `${BASE_URL}${res.data.user.avatar}`);
      }
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center surface-base">
      <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex text-[var(--on-surface)] relative flex-col justify-center items-center py-12">
        <div className="absolute top-0 left-0 z-20">
          <button onClick={() => navigate('/')} className="px-5 py-2.5 surface-highest hover:bg-[var(--primary)] text-sm font-bold ghost-border hover:border-[var(--primary)] hover:text-[var(--on-primary)] rounded-full transition-all flex items-center gap-2 group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Orbit
          </button>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="w-full max-w-lg glass-card p-10 space-y-8 z-10 mt-8 relative overflow-hidden"
        >
          {/* Ambient glow behind profile card */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-[var(--primary)] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

          <div className="text-center space-y-2 relative z-10">
            <h2 className="text-3xl font-bold neon-text-cyan">Astronaut Dossier</h2>
            <p className="text-[var(--on-surface-variant)] text-sm">Update your public coordinates.</p>
          </div>
        
          {currentAvatarUrl ? (
            <div className="flex justify-center flex-col items-center gap-3 relative z-10">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <img src={currentAvatarUrl} alt="Avatar" className="relative w-32 h-32 rounded-full border-[3px] border-[var(--surface-bright)] object-cover bg-[var(--surface)]" />
              </div>
            </div>
          ) : (
            <div className="flex justify-center flex-col items-center gap-3 relative z-10">
              <div className="w-32 h-32 rounded-full border border-[var(--outline-variant)] bg-[var(--surface-container-highest)] flex items-center justify-center text-4xl font-bold uppercase text-[var(--primary)] shadow-inner object-cover">
                {formData.name.charAt(0) || "?"}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="label-tech block mb-1">Display Name</label>
              <input
                type="text"
                name="name"
                placeholder="Commander..."
                className="input-glass"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="label-tech block mb-1">Visual Identity (Optional)</label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => setAvatarFile(e.target.files[0])}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="w-full py-3.5 text-sm font-bold surface-highest ghost-border hover:border-[var(--primary)] hover:text-[var(--primary)] rounded-xl transition-all shadow-sm"
              >
                {avatarFile ? `Target acquired: ${avatarFile.name}` : 'Upload New Image'}
              </button>
            </div>
            <div>
              <label className="label-tech block mb-1">Bio</label>
              <textarea
                 name="bio"
                 placeholder="Tell the universe about your mission..."
                 className="input-glass h-28 resize-none"
                 value={formData.bio}
                 onChange={handleChange}
              ></textarea>
            </div>
            
            {error && <div className="text-[var(--error)] text-sm font-medium text-center p-3 surface-highest border border-[var(--error)]/30 rounded-xl">{error}</div>}
            {message && <div className="text-[#00FF41] text-sm font-medium text-center p-3 surface-highest border border-[#00FF41]/30 rounded-xl">{message}</div>}
            
            <button type="submit" disabled={submitting} className="w-full py-4 text-lg btn-neon btn-neon-primary gap-2 flex items-center justify-center">
              {submitting ? (
                <>Transmitting <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /></>
              ) : 'Save Coordinates'}
            </button>
          </form>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
