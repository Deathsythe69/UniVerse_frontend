import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, ModeratorRoute, AdminRoute } from './components/layout/ProtectedRoutes';
import UniverseBackground from './components/shared/UniverseBackground';
import CosmicCursor from './components/shared/CosmicCursor';

import AuthPage from './pages/AuthPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProfilePage from './pages/ProfilePage';
import FeedPage from './pages/FeedPage';
import ModDashboard from './pages/ModDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MessagesPage from './pages/MessagesPage';
import EventsPage from './pages/EventsPage';
import UserProfile from './pages/UserProfile';

function App() {
  return (
    <AuthProvider>
      {/* WebGL cosmic background — renders on ALL pages */}
      <UniverseBackground />
      {/* Custom glowing cursor — desktop only */}
      <CosmicCursor />
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Student Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <FeedPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/user/:id" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/messages" 
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } 
          />

          {/* Moderator Routes */}
          <Route 
            path="/mod-dashboard" 
            element={
              <ModeratorRoute>
                <ModDashboard />
              </ModeratorRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />

          <Route 
            path="/events" 
            element={
              <ProtectedRoute>
                <EventsPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
