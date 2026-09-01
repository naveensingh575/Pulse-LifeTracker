import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to format Supabase user into friendly profile
  const formatUser = (supaUser) => {
    if (!supaUser) return null;
    const meta = supaUser.user_metadata || {};
    const name = meta.full_name || meta.name || supaUser.email?.split('@')[0] || 'Pulse User';
    const avatar = meta.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
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
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession ? formatUser(currentSession.user) : null);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // 2. Real-time Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession ? formatUser(newSession.user) : null);
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

  // Sign Out
  const logout = async () => {
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
        signInWithEmail,
        signUpWithEmail,
        resendConfirmationEmail,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
