import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import api from '../api/axiosConfig';
import PostCard from '../components/shared/PostCard';

const BASE_URL = 'http://localhost:5000';

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${id}`); // Assuming backend route users/:id
        setProfileUser(res.data.user);
        setPosts(res.data.posts);
      } catch (err) {
        console.error("Failed to load user profile");
      }
      setLoading(false);
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-full text-[var(--neon-cyan)] animate-pulse">Loading User...</div>
      </MainLayout>
    );
  }

  if (!profileUser) {
    return (
      <MainLayout>
        <div className="text-center text-gray-500 mt-10">User not found.</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Profile Card */}
        <div className="glass-card p-8 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 w-full h-32 bg-gradient-to-r from-[var(--neon-purple)]/20 to-[var(--neon-cyan)]/20"></div>
          
          <div className="relative z-10 w-32 h-32 rounded-full border-4 border-[var(--neon-pink)] overflow-hidden shadow-[0_0_20px_rgba(255,0,255,0.3)] bg-[var(--space-dark)] flex items-center justify-center -mt-4">
            {profileUser.avatar ? (
              <img src={`${BASE_URL}${profileUser.avatar}`} alt={profileUser.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl font-black text-white">{profileUser.name.charAt(0)}</span>
            )}
          </div>
          
          <h2 className="text-3xl font-bold mt-4 text-white">{profileUser.name}</h2>
          <p className="text-[var(--neon-cyan)] text-sm mt-1 uppercase tracking-wider">{profileUser.role}</p>
          <p className="text-gray-300 mt-4 max-w-md">{profileUser.bio || "No bio available."}</p>
          
          {currentUser?.id === profileUser._id && (
            <Link to="/profile" className="mt-6 px-6 py-2 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors font-bold text-sm">
              Edit Profile
            </Link>
          )}
        </div>

        {/* User's Posts */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold border-b border-[var(--glass-border)] pb-2">Posts by {profileUser.name}</h3>
          {posts.length === 0 ? (
            <div className="text-center text-gray-500 py-10">No transmissions yet.</div>
          ) : (
            posts.map(post => <PostCard key={post._id} post={post} />)
          )}
        </div>
        
      </div>
    </MainLayout>
  );
};

export default UserProfile;
