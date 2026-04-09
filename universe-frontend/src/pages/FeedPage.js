import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';
import MainLayout from '../components/layout/MainLayout';
import PostForm from '../components/shared/PostForm';
import PostCard from '../components/shared/PostCard';
import StoryBar from '../components/stories/StoryBar';
import { RefreshCw } from 'lucide-react';

const FeedPage = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/posts');
      // Backend already sorts by newest first
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch feed", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6 animate-[fade-in_0.5s_ease-out]">
        
        {/* Story Section */}
        <section>
          <StoryBar />
        </section>

        {/* Input Section */}
        <section>
          <PostForm onPostSuccess={fetchPosts} />
        </section>

        {/* Feed Section */}
        <section>
          <div className="flex justify-between items-center mb-6 px-2 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
              Campus Orbit
            </h2>
            <button 
              onClick={fetchPosts} 
              className="flex items-center gap-2 text-[var(--neon-cyan)] hover:text-white transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Sync Data</span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-[var(--neon-purple)] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map(post => (
                 <PostCard 
                   key={post._id} 
                   post={post} 
                   currentUserId={user?.id}
                   onDelete={(postId) => setPosts(posts.filter(p => p._id !== postId))}
                 />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass-card">
              <p className="text-gray-400 text-lg">The feed is dormant. Be the first to broadcast.</p>
            </div>
          )}
        </section>
        
      </div>
    </MainLayout>
  );
};

export default FeedPage;
