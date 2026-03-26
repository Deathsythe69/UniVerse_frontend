import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const res = await resetPassword(token, password);
    if (res.success) {
      setMessage('Password reset successful. You can now login.');
      setTimeout(() => navigate('/auth'), 3000);
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex text-white relative flex-col justify-center items-center">
      <div className="w-full max-w-md glass-card p-10 space-y-8 z-10">
        <h2 className="text-3xl font-bold text-center neon-text-pink">New Password</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="password"
            placeholder="Enter new password"
            className="input-glass"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          {message && <div className="text-green-400 text-sm text-center">{message}</div>}
          <button type="submit" disabled={loading} className="w-full py-4 text-lg btn-neon btn-neon-primary">
            {loading ? 'Reseting...' : 'Reset Password'}
          </button>
        </form>
        <button onClick={() => navigate('/auth')} className="text-gray-400 hover:text-white underline text-sm block text-center w-full">
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
