import { createContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import api from '../api/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('universe_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser(decoded);
        }
      } catch (err) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('universe_token', res.data.token);
      const decoded = jwtDecode(res.data.token);
      setUser(decoded);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      await api.post('/auth/register', { name, email, password });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };

  const googleLogin = async (name, email, googleId) => {
    try {
      const res = await api.post('/auth/google', { name, email, googleId });
      localStorage.setItem('universe_token', res.data.token);
      const decoded = jwtDecode(res.data.token);
      setUser(decoded);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Google Login failed' };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      await api.post('/auth/verify-otp', { email, otp });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'OTP Verification failed' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Request failed' };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Reset failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('universe_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, googleLogin, verifyOtp, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
