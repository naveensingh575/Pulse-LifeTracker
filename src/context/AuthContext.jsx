import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

const checkIsRecoveryUrl = () => {
  try {
    if (typeof window === 'undefined') return false;
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    // Genuine recovery link from Supabase includes access_token or code along with type=recovery
    const hasRecoveryToken = 
      (hash.includes('type=recovery') && hash.includes('access_token=')) ||
      (search.includes('type=recovery') && search.includes('code='));
    const hasStoredRecovery = sessionStorage.getItem('pulse_recovery_mode') === 'true';
    return hasRecoveryToken || hasStoredRecovery;
  } catch {
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(checkIsRecoveryUrl);

  // Helper to format Supabase user into friendly profile
  const formatUser = (supaUser) => {
    if (!supaUser) return null;
    const meta = supaUser.user_metadata || {};
    const name = meta.full_name || meta.name || supaUser.email?.split('@')[0] || 'Pulse User';
    const initial = name.trim().charAt(0).toUpperCase();
    const localAvatar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="%236366f1"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="%23ffffff" font-family="system-ui,-apple-system,sans-serif" font-size="28" font-weight="600">${initial}</text></svg>`;
    const avatar = meta.avatar_url || localAvatar;
    const provider = supaUser.app_metadata?.provider || 'email';

    return {
      id: supaUser.id,
      email: supaUser.email,
      name,
      avatar,
      provider,
      emailConfirmed: Boolean(supaUser.email_confirmed_at || supaUser.confirmed_at),
      raw: supaUser
    };
  };

  useEffect(() => {
    // Check if recovery in URL and persist to sessionStorage immediately
    if (checkIsRecoveryUrl()) {
      sessionStorage.setItem('pulse_recovery_mode', 'true');
      setIsPasswordRecovery(true);
    }

    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession ? formatUser(currentSession.user) : null);
      if (checkIsRecoveryUrl()) {
        setIsPasswordRecovery(true);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // 2. Real-time Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession ? formatUser(newSession.user) : null);
      if (event === 'PASSWORD_RECOVERY' || checkIsRecoveryUrl()) {
        sessionStorage.setItem('pulse_recovery_mode', 'true');
        setIsPasswordRecovery(true);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign in with Email & Password
  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });
    if (error) throw error;
    return data;
  };

  // Sign up with Email, Password & Name
  const signUpWithEmail = async (email, password, name) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name ? name.trim() : cleanEmail.split('@')[0];

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName
        },
        emailRedirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  };

  // Resend Email Verification link
  const resendConfirmationEmail = async (email) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  };

  // Request Password Reset Email with secure redirect link
  const resetPasswordForEmail = async (email) => {
    const cleanEmail = email.trim().toLowerCase();
    const redirectUrl = `${window.location.origin}${window.location.pathname}#/reset-password`;
    const { data, error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: redirectUrl
    });
    if (error) throw error;
    return data;
  };

  // Update authenticated user password
  const updateUserPassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    sessionStorage.removeItem('pulse_recovery_mode');
    setIsPasswordRecovery(false);
    return data;
  };

  // Sign Out
  const logout = async () => {
    sessionStorage.removeItem('pulse_recovery_mode');
    setIsPasswordRecovery(false);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isPasswordRecovery,
        setIsPasswordRecovery,
        signInWithEmail,
        signUpWithEmail,
        resendConfirmationEmail,
        resetPasswordForEmail,
        updateUserPassword,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
