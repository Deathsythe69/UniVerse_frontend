import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const res = await forgotPassword(email);
    if (res.success) {
      setMessage('Password reset link sent to your email.');
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex text-white relative flex-col justify-center items-center">
      <div className="w-full max-w-md glass-card p-10 space-y-8 z-10">
        <h2 className="text-3xl font-bold text-center neon-text-cyan">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Enter your university email"
            className="input-glass"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          {message && <div className="text-green-400 text-sm text-center">{message}</div>}
          <button type="submit" disabled={loading} className="w-full py-4 text-lg btn-neon btn-neon-primary">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <button onClick={() => navigate('/auth')} className="text-gray-400 hover:text-white underline text-sm block text-center w-full">
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
