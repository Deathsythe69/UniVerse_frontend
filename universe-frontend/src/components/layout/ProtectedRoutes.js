import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Data Core...</div>;

  return user ? children : <Navigate to="/auth" />;
};

export const ModeratorRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Data Core...</div>;

  if (!user || (user.role !== 'moderator' && user.role !== 'supervisor')) {
    return <Navigate to="/" />;
  }

  return children;
};
