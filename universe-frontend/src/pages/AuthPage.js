import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Rocket, ShieldPlus, ArrowRight } from 'lucide-react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      setLoading(true);
      const res = await googleLogin(user.displayName, user.email, user.uid);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Google Sign-In failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message);
      }
    } else {
      const res = await register(formData.name, formData.email, formData.password);
      if (res.success) {
        setIsLogin(true); // Switch to login view on success
        setError('Registration successful! Please login.');
      } else {
        setError(res.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex text-white relative flex-col md:flex-row">
      <div className="hidden md:flex flex-1 flex-col justify-center items-center p-12 relative z-10 border-r border-[var(--glass-border)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--space-dark)] to-transparent opacity-80 z-0"></div>
        <div className="z-10 text-center space-y-6 max-w-lg">
          <div className="w-32 h-32 rounded-full border-4 border-dashed border-[var(--neon-pink)] mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(255,0,255,0.4)] animate-[spin_10s_linear_infinite]">
            <Rocket className="w-16 h-16 text-[var(--neon-cyan)] animate-[spin_10s_linear_infinite_reverse]" />
          </div>
          <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)]">
            UniVerse.
          </h1>
          <p className="text-xl text-gray-300">
            A secure campus social network designed for the digital scale. Connect. Explore. Evolve.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10">
        <div className="w-full max-w-md glass-card p-10 space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-bold flex items-center justify-center gap-3">
              {isLogin ? (
                <><span className="neon-text-cyan">Login</span></>
              ) : (
                <><ShieldPlus className="w-8 h-8 text-[var(--neon-pink)]"/> <span className="neon-text-pink">Join Us</span></>
              )}
            </h2>
            <p className="text-gray-400">
              {isLogin ? 'Access your campus feed.' : 'Register with your @gmail.com university email.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className="input-glass"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            <div>
              <input
                type="email"
                name="email"
                placeholder="University Email (@gmail.com)"
                className="input-glass"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password (min 6 chars)"
                className="input-glass"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && (
               <div className={`p-3 rounded-lg border text-sm text-center ${error.toLowerCase().includes('success') ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-red-500/50 bg-red-500/10 text-red-400'}`}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-lg btn-neon btn-neon-primary flex justify-center items-center gap-2"
            >
              {loading ? 'Processing...' : (isLogin ? 'Launch' : 'Register')}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          {isLogin && (
            <div className="flex justify-center -mt-2">
              <Link to="/forgot-password" className="text-sm text-gray-400 hover:text-white transition-colors underline decoration-dashed.">
                Forgot Password?
              </Link>
            </div>
          )}

          <div className="space-y-4 pt-2">
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-[var(--glass-border)]"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Or</span>
              <div className="flex-grow border-t border-[var(--glass-border)]"></div>
            </div>
            <button 
              type="button"
              onClick={handleGoogleLogin} 
              disabled={loading}
              className="w-full py-3 flex items-center justify-center gap-3 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-[0_4px_14px_0_rgba(255,255,255,0.2)]"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5"/>
              Sign in with Google
            </button>
          </div>

          <div className="text-center pt-2">
            <button onClick={handleToggle} className="text-sm text-gray-400 hover:text-white transition-colors underline decoration-dashed underline-offset-4">
              {isLogin ? "Don't have an account? Create one." : "Already have a clearance? Login here."}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
