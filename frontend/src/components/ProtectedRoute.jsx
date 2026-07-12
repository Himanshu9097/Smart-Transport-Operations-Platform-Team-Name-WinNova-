import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F1FA] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          {/* Simple clay spinner */}
          <div className="w-12 h-12 bg-clay-primary rounded-full animate-bounce shadow-clayButton"></div>
          <span className="font-mono text-xs font-bold text-clay-muted uppercase tracking-widest animate-pulse">Loading Route...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
