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
      email,
      password
    });
    if (error) throw error;
    return data;
  };

  // Sign up with Email, Password & Name
  const signUpWithEmail = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name || email.split('@')[0]
        }
      }
    });
    if (error) throw error;
    return data;
  };

  // Sign in with Google OAuth
  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
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
        loginWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
