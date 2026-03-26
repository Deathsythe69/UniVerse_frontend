import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const ProfilePage = () => {
  const [formData, setFormData] = useState({ name: '', bio: '', avatar: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        if (res.data.user) {
          setFormData({
            name: res.data.user.name || '',
            bio: res.data.user.bio || '',
            avatar: res.data.user.avatar || ''
          });
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
      await api.put('/auth/profile', formData);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="min-h-screen flex text-[var(--neon-cyan)] items-center justify-center font-bold text-2xl animate-pulse">Loading Profile...</div>;

  return (
    <div className="min-h-screen flex text-white relative flex-col justify-center items-center">
      <div className="w-full max-w-lg glass-card p-10 space-y-8 z-10">
        <h2 className="text-3xl font-bold text-center neon-text-cyan">Edit Profile</h2>
        
        {formData.avatar && (
           <div className="flex justify-center">
             <img src={formData.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-2 border-[var(--neon-pink)] object-cover shadow-[0_0_15px_rgba(255,0,255,0.4)]" />
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
            <label className="block text-gray-400 text-sm mb-1">Avatar URL</label>
            <input
              type="text"
              name="avatar"
              placeholder="https://example.com/avatar.png"
              className="input-glass"
              value={formData.avatar}
              onChange={handleChange}
            />
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
