import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, ModeratorRoute } from './components/layout/ProtectedRoutes';

import AuthPage from './pages/AuthPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProfilePage from './pages/ProfilePage';
import FeedPage from './pages/FeedPage';
import ModDashboard from './pages/ModDashboard';
import MessagesPage from './pages/MessagesPage';
import EventsPage from './pages/EventsPage';

function App() {
  return (
    <AuthProvider>
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
            path="/events" 
            element={
              <ProtectedRoute>
                <div className="flex items-center justify-center min-h-screen text-2xl text-[var(--neon-cyan)] animate-pulse font-bold">
                  Events Module Cooldown...
                </div>
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
