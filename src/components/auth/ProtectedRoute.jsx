import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PulseLogo } from '../common/PulseLogo';

export const ProtectedRoute = ({ children }) => {
  const { user, loading, isPasswordRecovery } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <PulseLogo size="lg" />
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Synchronizing Pulse Life Tracker...</p>
      </div>
    );
  }

  // If user is currently in password recovery mode, force reset password screen
  const inRecovery = isPasswordRecovery || 
    (typeof window !== 'undefined' && (
      sessionStorage.getItem('pulse_recovery_mode') === 'true' || 
      window.location.href.includes('type=recovery') ||
      window.location.hash.includes('type=recovery')
    ));

  if (inRecovery) {
    return <Navigate to="/reset-password" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
