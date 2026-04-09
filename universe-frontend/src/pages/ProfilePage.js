import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

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
      setMessage('Profile updated successfully!');
      if (res.data.user.avatar) {
        setCurrentAvatarUrl(res.data.user.avatar.startsWith('http') ? res.data.user.avatar : `${BASE_URL}${res.data.user.avatar}`);
      }
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="min-h-screen flex text-[var(--neon-cyan)] items-center justify-center font-bold text-2xl animate-pulse">Loading Profile...</div>;

  return (
    <div className="min-h-screen flex text-white relative flex-col justify-center items-center">
      <div className="absolute top-6 left-6 z-20">
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-[var(--glass-border)] rounded-xl transition-colors font-bold">
          ← Back to Feed
        </button>
      </div>
      <div className="w-full max-w-lg glass-card p-10 space-y-8 z-10">
        <h2 className="text-3xl font-bold text-center neon-text-cyan">Edit Profile</h2>
        
        {currentAvatarUrl ? (
           <div className="flex justify-center flex-col items-center gap-3">
             <img src={currentAvatarUrl} alt="Avatar" className="w-24 h-24 rounded-full border-2 border-[var(--neon-pink)] object-cover shadow-[0_0_15px_rgba(255,0,255,0.4)]" />
           </div>
        ) : (
          <div className="flex justify-center flex-col items-center gap-3">
             <div className="w-24 h-24 rounded-full border-2 border-[var(--glass-border)] bg-gray-800 flex items-center justify-center text-4xl font-bold uppercase text-[var(--neon-purple)] shadow-inner object-cover">
               {formData.name.charAt(0) || "?"}
             </div>
           </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Display Name</label>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              className="input-glass"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Profile Picture (Optional)</label>
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
              className="btn-neon text-white w-full py-3 opacity-80 hover:opacity-100 flex justify-center items-center border border-dashed border-gray-500 rounded-xl"
            >
              {avatarFile ? `Selected: ${avatarFile.name}` : 'Upload New Avatar Image'}
            </button>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Bio</label>
            <textarea
              name="bio"
              placeholder="Tell the universe about yourself..."
              className="input-glass h-24 resize-none"
              value={formData.bio}
              onChange={handleChange}
            ></textarea>
          </div>
          
          {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          {message && <div className="text-green-400 text-sm text-center">{message}</div>}
          
          <button type="submit" disabled={submitting} className="w-full py-4 text-lg btn-neon btn-neon-primary">
            {submitting ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
