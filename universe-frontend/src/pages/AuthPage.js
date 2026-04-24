import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Rocket, ArrowRight, Sparkles } from 'lucide-react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register, googleLogin, verifyOtp } = useContext(AuthContext);
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
      const res = await verifyOtp(formData.email, otp);
      if (res.success) {
        setShowOtp(false);
        setIsLogin(true);
        setError('Verification successful! You can now login.');
      } else {
        setError(res.message);
      }
    } else if (isLogin) {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message);
        if (res.isVerified === false) {
          setShowOtp(true);
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
    <div className="min-h-screen flex text-white relative flex-col md:flex-row" style={{ background: 'var(--surface)' }}>
      {/* Left — Cinematic Hero */}
      <div className="hidden md:flex flex-1 flex-col justify-center items-center p-12 relative z-10">
        {/* Ambient background gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
               style={{ background: 'radial-gradient(circle, rgba(193,128,255,0.3) 0%, transparent 70%)' }} />
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full opacity-15"
               style={{ background: 'radial-gradient(circle, rgba(61,194,253,0.3) 0%, transparent 70%)' }} />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="z-10 text-center space-y-8 max-w-lg"
        >
          {/* Animated Logo */}
          <div className="relative w-36 h-36 mx-auto">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-dashed"
              style={{ borderColor: 'var(--secondary)' }}
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Rocket className="w-16 h-16" style={{ color: 'var(--primary)' }} />
            </motion.div>
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full" 
                 style={{ boxShadow: '0 0 40px rgba(193,128,255,0.3), 0 0 80px rgba(193,128,255,0.1)' }} />
          </div>

          <h1 className="text-7xl font-black gradient-text-spectral leading-tight" 
              style={{ textShadow: '0 0 30px rgba(61,194,253,0.15)' }}>
            UniVerse.
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
            A secure campus social network designed for the digital scale. 
            <span className="block mt-2 font-medium" style={{ color: 'var(--primary)' }}>
              Connect. Explore. Evolve.
            </span>
          </p>
        </motion.div>
      </div>

      {/* Right — Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md glass-card p-10 space-y-8"
        >
          {/* Mode Toggle Tabs */}
          <div className="flex rounded-full p-1" style={{ background: 'var(--surface-container-lowest)' }}>
            <button 
              onClick={() => !isLogin && handleToggle()}
              className="flex-1 py-2.5 rounded-full text-sm font-bold transition-all duration-300"
              style={{ 
                background: isLogin ? 'var(--gradient-spectral)' : 'transparent',
                backgroundImage: isLogin ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'none',
                color: isLogin ? 'white' : 'var(--on-surface-variant)'
              }}
            >
              Login
            </button>
            <button 
              onClick={() => isLogin && handleToggle()}
              className="flex-1 py-2.5 rounded-full text-sm font-bold transition-all duration-300"
              style={{ 
                backgroundImage: !isLogin ? 'linear-gradient(135deg, var(--tertiary), var(--secondary))' : 'none',
                color: !isLogin ? 'white' : 'var(--on-surface-variant)'
              }}
            >
              Register
            </button>
          </div>
          
          {/* Header */}
          <div className="text-center space-y-2">
            <motion.h2 
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold flex items-center justify-center gap-3"
            >
              {isLogin ? (
                <span className="neon-text-cyan">Welcome Back</span>
              ) : (
                <><Sparkles className="w-7 h-7" style={{ color: 'var(--tertiary)' }} /> <span className="neon-text-purple">Join the Galaxy</span></>
              )}
            </motion.h2>
            <p style={{ color: 'var(--on-surface-variant)' }} className="text-sm">
              {isLogin ? 'Access your campus orbit.' : 'Register with your university email.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {showOtp ? (
                <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="text-sm mb-4 text-center" style={{ color: 'var(--on-surface-variant)' }}>
                    Enter the OTP sent to <span style={{ color: 'var(--primary)' }}>{formData.email}</span>
                  </p>
                  <input
                    type="text"
                    name="otp"
                    placeholder="000000"
                    className="input-glass text-center tracking-[0.5em] font-bold text-xl"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {!isLogin && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                      <label className="label-tech block mb-1.5">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="e.g. Ryland Grace"
                        className="input-glass"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </motion.div>
                  )}
                  <div>
                    <label className="label-tech block mb-1.5">Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@university.edu"
                      className="input-glass"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="label-tech block mb-1.5">Password</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Min 6 characters"
                      className="input-glass"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {!isLogin && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                      <label className="label-tech block mb-1.5">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Re-enter password"
                        className="input-glass"
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
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl text-sm text-center"
                style={{ 
                  background: error.toLowerCase().includes('success') 
                    ? 'rgba(0,255,65,0.08)' 
                    : 'rgba(255,110,132,0.08)',
                  border: `1px solid ${error.toLowerCase().includes('success') 
                    ? 'rgba(0,255,65,0.3)' 
                    : 'rgba(255,110,132,0.3)'}`,
                  color: error.toLowerCase().includes('success') ? '#00FF41' : 'var(--error)'
                }}
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-lg btn-neon btn-neon-primary flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {showOtp ? 'Verify OTP' : (isLogin ? 'Launch' : 'Create Account')}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Forgot Password */}
          {isLogin && (
            <div className="flex justify-center -mt-2">
              <Link to="/forgot-password" className="text-sm transition-colors underline decoration-dashed underline-offset-4"
                    style={{ color: 'var(--on-surface-variant)' }}
                    onMouseOver={(e) => e.target.style.color = 'var(--primary)'}
                    onMouseOut={(e) => e.target.style.color = 'var(--on-surface-variant)'}>
                Forgot Password?
              </Link>
            </div>
          )}

          {/* Divider */}
          <div className="space-y-4 pt-2">
            <div className="relative flex items-center">
              <div className="flex-grow border-t" style={{ borderColor: 'var(--outline-variant)' }}></div>
              <span className="flex-shrink-0 mx-4 text-sm label-tech">Or continue with</span>
              <div className="flex-grow border-t" style={{ borderColor: 'var(--outline-variant)' }}></div>
            </div>
            
            {/* Google Button */}
            <button 
              type="button"
              onClick={handleGoogleLogin} 
              disabled={loading}
              className="w-full py-3 flex items-center justify-center gap-3 rounded-full font-bold transition-all duration-300 hover:scale-[1.02]"
              style={{ 
                background: 'var(--surface-container-highest)',
                border: '1px solid var(--outline-variant)',
                color: 'var(--on-surface)'
              }}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5"/>
              Sign in with Google
            </button>
          </div>

          {/* Toggle Auth Mode */}
          <div className="text-center pt-2">
            <button onClick={handleToggle} className="text-sm transition-colors underline decoration-dashed underline-offset-4"
                    style={{ color: 'var(--on-surface-variant)' }}
                    onMouseOver={(e) => e.target.style.color = 'var(--on-surface)'}
                    onMouseOut={(e) => e.target.style.color = 'var(--on-surface-variant)'}>
              {isLogin ? "Don't have an account? Create one." : "Already have a clearance? Login here."}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
