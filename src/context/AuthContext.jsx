import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

const checkIsRecoveryUrl = () => {
  try {
    if (typeof window === 'undefined') return false;
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const hasRecoveryToken =
      (hash.includes('type=recovery') && hash.includes('access_token=')) ||
      (search.includes('type=recovery') && search.includes('code='));
    const hasStoredRecovery = sessionStorage.getItem('pulse_recovery_mode') === 'true';
    return hasRecoveryToken || hasStoredRecovery;
  } catch {
    return false;
  }
};

// Detect if the URL contains an email-verification confirmation token from Supabase
const checkIsEmailConfirmUrl = () => {
  try {
    if (typeof window === 'undefined') return false;
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    // Supabase sends ?token_hash=...&type=signup or #access_token=...&type=signup
    return (
      (hash.includes('type=signup') || search.includes('type=signup')) ||
      (hash.includes('type=email_change') || search.includes('type=email_change'))
    );
  } catch {
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(checkIsRecoveryUrl);
  // True when the user just landed back from clicking the email verification link
  const [emailVerified, setEmailVerified] = useState(false);

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

      // When user clicks the email verification link, Supabase fires SIGNED_IN
      // and the URL contains type=signup. Show the verified success screen.
      if (event === 'SIGNED_IN' && checkIsEmailConfirmUrl()) {
        setEmailVerified(true);
        // Clean the token from the URL so it doesn't linger
        try {
          window.history.replaceState(null, '', window.location.pathname);
        } catch { /* ignore */ }
      }

      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);


  // Build the correct app base URL — works for both localhost dev and production Vercel.
  // Using window.location.origin (no pathname suffix) avoids broken redirects
  // when Supabase overrides the redirect_to based on its allowlist.
  const getAppBaseUrl = () => {
    if (typeof window === 'undefined') return 'https://pulse-life-tracker.vercel.app';
    return window.location.origin;
  };

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
        emailRedirectTo: getAppBaseUrl()
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
        emailRedirectTo: getAppBaseUrl()
      }
    });
    if (error) throw error;
    return data;
  };

  // Request Password Reset Email
  // NOTE: No custom redirectTo is passed here — Supabase uses the Site URL configured
  // in Dashboard → Authentication → URL Configuration. This bypasses the redirect allowlist
  // restriction and ensures the email always arrives and the link always works.
  // Site URL must be set to: https://pulse-life-tracker.vercel.app
  const resetPasswordForEmail = async (email) => {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
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

  // Delete Account & All Data (calls RPC first with multi-table cascading fallback)
  const deleteAccount = async () => {
    let rpcSucceeded = false;
    try {
      const { error } = await supabase.rpc('delete_user_account');
      if (!error) {
        rpcSucceeded = true;
      }
    } catch (err) {
      console.warn('RPC delete_user_account failed or not configured, executing client-side cascading cleanup:', err);
    }

    // Fallback: If RPC was missing or errored, delete all user data across all tables directly
    if (!rpcSucceeded && user?.id) {
      const tables = [
        'habit_completions',
        'habits',
        'monthly_allocations',
        'transactions',
        'sub_goals',
        'goals',
        'deadlines',
        'tasks',
        'activities',
        'journal_entries',
        'coupon_redemptions'
      ];

      await Promise.allSettled(
        tables.map(table => supabase.from(table).delete().eq('user_id', user.id))
      );
    }

    // Clean up local storage and session storage
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Storage cleanup error:', e);
    }

    // Reset local auth states and sign out
    setIsPasswordRecovery(false);
    setUser(null);
    setSession(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isPasswordRecovery,
        setIsPasswordRecovery,
        emailVerified,
        setEmailVerified,
        signInWithEmail,
        signUpWithEmail,
        resendConfirmationEmail,
        resetPasswordForEmail,
        updateUserPassword,
        logout,
        deleteAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

