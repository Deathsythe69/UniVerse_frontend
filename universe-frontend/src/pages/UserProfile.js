import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import api from '../api/axiosConfig';
import PostCard from '../components/shared/PostCard';
import { Github, Linkedin, Twitter, Building2, GraduationCap, Phone, ExternalLink } from 'lucide-react';

const BASE_URL = 'http://localhost:5000';

const getRoleBadge = (role) => {
  const map = {
    admin: 'role-badge-admin',
    moderator: 'role-badge-moderator',
    student: 'role-badge-student',
  };
  return map[role] || 'role-badge-student';
};

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await api.get(`/users/${id}`);
      setProfileUser(res.data.user);
      setPosts(res.data.posts);
    } catch (err) {
      console.error("Failed to load user profile");
    }
    setLoading(false);
  };

  const handleFollow = async () => {
    if (!currentUser) return;
    try {
      await api.put(`/users/follow/${profileUser._id}`);
      fetchUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMessage = async () => {
    if (!currentUser) return;
    try {
      await api.post('/messages/conversation', { receiverId: profileUser._id });
      navigate('/messages');
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot start conversation');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-full">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  if (!profileUser) {
    return (
      <MainLayout>
        <div className="text-center text-[var(--on-surface-variant)] mt-10">User not found.</div>
      </MainLayout>
    );
  }

  const socials = profileUser.socialLinks || {};
  const hasSocials = socials.github || socials.linkedin || socials.twitter;
  const hasMeta = profileUser.department || profileUser.year || profileUser.phone;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Profile Card */}
        <div className="glass-card p-8 flex flex-col items-center text-center relative overflow-hidden">
          {/* Banner gradient */}
          <div className="absolute top-0 left-0 w-full h-36 bg-gradient-to-br from-[var(--secondary)]/20 via-[var(--primary)]/10 to-transparent pointer-events-none"></div>
          
          {/* Avatar */}
          <div className="relative z-10 w-32 h-32 rounded-full border-[3px] border-[var(--surface-bright)] overflow-hidden bg-[var(--surface-container)] flex items-center justify-center -mt-2">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] blur-md opacity-40 -z-10 scale-110"></div>
            {profileUser.avatar ? (
              <img src={`${BASE_URL}${profileUser.avatar}`} alt={profileUser.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl font-black text-[var(--primary)]">{profileUser.name.charAt(0)}</span>
            )}
          </div>
          
          {/* Name + Role Badge */}
          <h2 className="text-3xl font-bold mt-4 text-[var(--on-surface)]">{profileUser.name}</h2>
          <div className="mt-2">
            <span className={`role-badge ${getRoleBadge(profileUser.role)}`}>{profileUser.role}</span>
          </div>
          <p className="text-[var(--on-surface-variant)] mt-4 max-w-md text-sm leading-relaxed">{profileUser.bio || "No bio available."}</p>
          
          {/* Metadata Row */}
          {hasMeta && (
            <div className="flex flex-wrap items-center justify-center gap-4 mt-5">
              {profileUser.department && (
                <span className="flex items-center gap-1.5 text-xs text-[var(--on-surface-variant)] surface-highest px-3 py-1.5 rounded-full ghost-border">
                  <Building2 className="w-3.5 h-3.5 text-[var(--primary)]" /> {profileUser.department}
                </span>
              )}
              {profileUser.year && (
                <span className="flex items-center gap-1.5 text-xs text-[var(--on-surface-variant)] surface-highest px-3 py-1.5 rounded-full ghost-border">
                  <GraduationCap className="w-3.5 h-3.5 text-[var(--tertiary)]" /> {profileUser.year}
                </span>
              )}
              {profileUser.phone && (
                <span className="flex items-center gap-1.5 text-xs text-[var(--on-surface-variant)] surface-highest px-3 py-1.5 rounded-full ghost-border">
                  <Phone className="w-3.5 h-3.5 text-[var(--primary)]" /> {profileUser.phone}
                </span>
              )}
            </div>
          )}

          {/* Social Links */}
          {hasSocials && (
            <div className="flex items-center gap-3 mt-5">
              {socials.github && (
                <a href={`https://github.com/${socials.github}`} target="_blank" rel="noopener noreferrer"
                   className="w-9 h-9 rounded-full surface-highest ghost-border flex items-center justify-center hover:border-[var(--on-surface)] hover:text-[var(--on-surface)] text-[var(--on-surface-variant)] transition-all">
                  <Github className="w-4 h-4" />
                </a>
              )}
              {socials.linkedin && (
                <a href={socials.linkedin.startsWith('http') ? socials.linkedin : `https://linkedin.com/in/${socials.linkedin}`} target="_blank" rel="noopener noreferrer"
                   className="w-9 h-9 rounded-full surface-highest ghost-border flex items-center justify-center hover:border-[#0077b5] hover:text-[#0077b5] text-[var(--on-surface-variant)] transition-all">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {socials.twitter && (
                <a href={`https://twitter.com/${socials.twitter}`} target="_blank" rel="noopener noreferrer"
                   className="w-9 h-9 rounded-full surface-highest ghost-border flex items-center justify-center hover:border-[var(--primary)] hover:text-[var(--primary)] text-[var(--on-surface-variant)] transition-all">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>
          )}

          {/* Follow/Unfollow Stats */}
          <div className="flex items-center gap-6 mt-5 text-sm">
            <div className="text-center">
              <p className="font-bold text-[var(--on-surface)]">{profileUser.followers?.length || 0}</p>
              <p className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-wider">Followers</p>
            </div>
            <div className="w-px h-6 bg-[var(--outline-variant)]"></div>
            <div className="text-center">
              <p className="font-bold text-[var(--on-surface)]">{profileUser.following?.length || 0}</p>
              <p className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-wider">Following</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          {currentUser?.id === profileUser._id ? (
            <Link to="/profile" className="mt-6 px-6 py-2.5 rounded-xl surface-highest ghost-border hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all font-bold text-sm text-[var(--on-surface-variant)]">
              Edit Profile
            </Link>
          ) : (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button 
                onClick={handleFollow} 
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${profileUser?.followers?.includes(currentUser?.id) ? 'surface-highest ghost-border text-[var(--error)] hover:bg-[var(--error)] hover:text-white' : 'btn-neon btn-neon-primary'}`}
              >
                {profileUser?.followers?.includes(currentUser?.id) ? 'Unfollow' : 'Follow'}
              </button>
              {profileUser?.followers?.includes(currentUser?.id) && profileUser?.following?.includes(currentUser?.id) && (
                <button 
                  onClick={handleMessage} 
                  className="px-6 py-2.5 rounded-full font-bold text-sm btn-neon btn-neon-outline"
                >
                  Message
                </button>
              )}
            </div>
          )}
        </div>

        {/* User's Posts */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-[var(--on-surface)] border-b border-[var(--outline-variant)] pb-2">Transmissions by {profileUser.name}</h3>
          {posts.length === 0 ? (
            <div className="text-center text-[var(--on-surface-variant)] py-10">No transmissions yet.</div>
          ) : (
            posts.map(post => <PostCard key={post._id} post={post} currentUserId={currentUser?.id} onDelete={(postId) => setPosts(posts.filter(p => p._id !== postId))} />)
          )}
        </div>
        
      </div>
    </MainLayout>
  );
};

export default UserProfile;
