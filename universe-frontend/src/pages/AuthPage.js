import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Rocket, ArrowRight, Sparkles } from 'lucide-react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import UniverseParticles from '../components/UniverseParticles';
import HeroGlobeSvg from '../assets/HeroGlobe.svg';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register, googleLogin, verifyOtp, verifyLoginOtp } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setError('');
    setShowOtp(false);
    setOtp('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
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
    
    // Check confirm password match
    if (!isLogin && !showOtp) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }
    
    setLoading(true);

    if (showOtp) {
      if (isLogin) {
        const res = await verifyLoginOtp(formData.email, otp);
        if (res.success) {
          navigate('/');
        } else {
          setError(res.message);
        }
      } else {
        const res = await verifyOtp(formData.email, otp);
        if (res.success) {
          setShowOtp(false);
          setIsLogin(true);
          setError('Verification successful! You can now login.');
        } else {
          setError(res.message);
        }
      }
    } else if (isLogin) {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        if (res.otpRequired) {
          setShowOtp(true);
          setError('Login OTP sent to your email.');
        } else {
          navigate('/');
        }
      } else {
        setError(res.message);
        if (res.isVerified === false) {
          // If the user's email is unverified, jump to OTP screen so they can finish registration
          // Wait, the backend logic for login doesn't re-send the registration OTP automatically on failed login
          // (They'd have to use a resend endpoint, but for now we instruct them)
          setError(res.message + ". Please verify account.");
        }
      }
    } else {
      const res = await register(formData.name, formData.email, formData.password);
      if (res.success) {
        setShowOtp(true);
        setError('Registration successful! Please check your email for the OTP.');
      } else {
        setError(res.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex relative flex-col md:flex-row bg-white overflow-hidden text-gray-900 font-sans transition-all duration-500">
      
      {/* 3D Particle Background interacting with Cursor */}
      <UniverseParticles />

      {/* Left — Cinematic Hero (Light Theme) */}
      <div className="hidden md:flex flex-1 flex-col justify-center items-center p-12 relative z-10 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, type: "spring", bounce: 0.4 }}
          className="text-center space-y-6 max-w-lg relative"
        >
          {/* Stunning SVG Graphic */}
          <div className="relative w-80 h-80 mx-auto drop-shadow-2xl">
            <img src={HeroGlobeSvg} alt="Universe Globe" className="w-full h-full object-contain" />
          </div>

          <h1 className="text-7xl font-black tracking-tight" 
              style={{ 
                background: 'linear-gradient(135deg, #FF6E84 0%, #C180FF 50%, #3DC2FD 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.1
              }}>
            UniVerse.
          </h1>
          <p className="text-xl leading-relaxed text-gray-600 font-medium max-w-md mx-auto">
            A secure campus social network built on a cosmic scale. 
            <span className="block mt-2 font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
              Connect. Explore. Evolve.
            </span>
          </p>
        </motion.div>
      </div>

      {/* Right — Auth Form with Frosty Light Glassmorphism */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="w-full max-w-md p-10 space-y-8 rounded-[2rem]"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 25px 50px -12px rgba(193, 128, 255, 0.15), 0 0 0 1px rgba(255,255,255,0.7) inset'
          }}
        >
          {/* Mode Toggle Tabs */}
          <div className="flex rounded-full p-1.5 shadow-inner bg-gray-100/50 backdrop-blur-md">
            <button 
              onClick={() => !isLogin && handleToggle()}
              className="flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 relative overflow-hidden"
              style={{ 
                background: isLogin ? '#ffffff' : 'transparent',
                color: isLogin ? '#C180FF' : '#6b7280',
                boxShadow: isLogin ? '0 4px 15px rgba(193, 128, 255, 0.2)' : 'none'
              }}
            >
              <span className="relative z-10">Login</span>
            </button>
            <button 
              onClick={() => isLogin && handleToggle()}
              className="flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 relative overflow-hidden"
              style={{ 
                background: !isLogin ? '#ffffff' : 'transparent',
                color: !isLogin ? '#FF6E84' : '#6b7280',
                boxShadow: !isLogin ? '0 4px 15px rgba(255, 110, 132, 0.2)' : 'none'
              }}
            >
              <span className="relative z-10">Register</span>
            </button>
          </div>
          
          {/* Header */}
          <div className="text-center space-y-2">
            <motion.h2 
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-3xl font-extrabold flex items-center justify-center gap-3 text-gray-800 tracking-tight"
            >
              {isLogin ? (
                <>Welcome Back</>
              ) : (
                <><Sparkles className="w-6 h-6 text-pink-500" /> <span>Join the Galaxy</span></>
              )}
            </motion.h2>
            <p className="text-sm font-medium text-gray-500">
              {isLogin ? 'Access your campus orbit.' : 'Register with your university email.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {showOtp ? (
                <motion.div key="otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <p className="text-sm mb-4 text-center font-medium text-gray-600">
                    Enter the OTP sent to <span className="text-blue-500 font-bold">{formData.email}</span>
                  </p>
                  <input
                    type="text"
                    name="otp"
                    placeholder="000000"
                    className="w-full px-5 py-4 rounded-2xl bg-white/70 border border-gray-200 text-gray-800 text-center tracking-[0.5em] font-bold text-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  {!isLogin && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
                      <label className="block mb-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="e.g. Ryland Grace"
                        className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium shadow-sm"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </motion.div>
                  )}
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@university.edu"
                      className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium shadow-sm"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Min 6 characters"
                      className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium shadow-sm"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {!isLogin && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
                      <label className="block mb-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Re-enter password"
                        className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium shadow-sm"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error/Success Messages */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, height: 0 }} 
                  animate={{ opacity: 1, y: 0, height: 'auto' }} 
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="overflow-hidden"
                >
                  <div 
                    className="p-4 rounded-2xl text-sm font-semibold text-center border mt-2"
                    style={{ 
                      background: error.toLowerCase().includes('success') || error.toLowerCase().includes('sent') ? '#ecfdf5' : '#fef2f2',
                      borderColor: error.toLowerCase().includes('success') || error.toLowerCase().includes('sent') ? '#a7f3d0' : '#fecaca',
                      color: error.toLowerCase().includes('success') || error.toLowerCase().includes('sent') ? '#059669' : '#dc2626'
                    }}
                  >
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 rounded-[1.25rem] text-lg font-bold text-white flex justify-center items-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
                boxShadow: '0 20px 40px -10px rgba(139, 92, 246, 0.4)'
              }}
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {showOtp ? 'Verify OTP' : (isLogin ? 'Launch Orbit' : 'Create Account')}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Forgot Password */}
          {isLogin && !showOtp && (
            <div className="flex justify-center -mt-2">
              <Link to="/forgot-password" className="text-sm font-semibold text-gray-500 hover:text-blue-500 transition-colors">
                Forgot Password?
              </Link>
            </div>
          )}

          {/* Divider */}
          <div className="space-y-5 pt-2">
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Or continue with</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            
            {/* Google Button */}
            <button 
              type="button"
              onClick={handleGoogleLogin} 
              disabled={loading}
              className="w-full py-3.5 flex items-center justify-center gap-3 rounded-[1.25rem] font-bold text-gray-700 bg-white border-2 border-gray-100 transition-all hover:border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </div>

          {/* Toggle Auth Mode */}
          <div className="text-center pt-2">
            <button onClick={handleToggle} className="text-sm font-semibold text-gray-500 hover:text-purple-600 transition-colors">
              {isLogin ? "Don't have an account? Create one." : "Already have a clearance? Login here."}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
