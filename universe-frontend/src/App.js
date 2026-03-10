import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, ModeratorRoute } from './components/layout/ProtectedRoutes';

import AuthPage from './pages/AuthPage';
import FeedPage from './pages/FeedPage';
import ModDashboard from './pages/ModDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/auth" element={<AuthPage />} />

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
                <div className="flex items-center justify-center min-h-screen text-2xl text-[var(--neon-pink)] animate-pulse font-bold">
                  Subspace Comms Repairing...
                </div>
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

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
