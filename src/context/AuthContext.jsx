import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { recordReferralSignup } from '../utils/referralUtils';

const AuthContext = createContext();

export const hasExplicitRecoveryTokensInUrl = () => {
  try {
    if (typeof window === 'undefined') return false;
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    return Boolean(
      (hash.includes('type=recovery') && (hash.includes('access_token=') || hash.includes('token_hash='))) ||
      (search.includes('type=recovery') && (search.includes('code=') || search.includes('token_hash=')))
    );
  } catch {
    return false;
  }
};

const checkIsRecoveryUrl = () => {
  try {
    if (typeof window === 'undefined') return false;
    // URL explicitly contains recovery tokens from a reset password link
    if (hasExplicitRecoveryTokensInUrl()) return true;

    // Only consider stored recovery mode if currently on the reset-password route
    const hash = window.location.hash || '';
    const isResetPasswordRoute = hash.includes('/reset-password') || (typeof window !== 'undefined' && window.location.pathname.includes('/reset-password'));
    const hasStoredRecovery = sessionStorage.getItem('pulse_recovery_mode') === 'true';
    return Boolean(isResetPasswordRoute && hasStoredRecovery);
  } catch {
    return false;
  }
};

export const clearRecoveryUrlAndState = () => {
  try {
    sessionStorage.removeItem('pulse_recovery_mode');
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      if (hash.includes('type=recovery') || search.includes('type=recovery') || hash.includes('type=signup') || search.includes('type=signup')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  } catch {}
};

// Detect if the URL contains an email-verification confirmation token from Supabase
const checkIsEmailConfirmUrl = () => {
  try {
    if (typeof window === 'undefined') return false;
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    // Supabase sends ?token_hash=...&type=signup or #access_token=...&type=signup
    return Boolean(
      (hash.includes('type=signup') || search.includes('type=signup')) ||
      (hash.includes('type=email_change') || search.includes('type=email_change')) ||
      (hash.includes('type=invite') || search.includes('type=invite'))
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
  const [emailVerified, setEmailVerified] = useState(() => checkIsEmailConfirmUrl());

  // Helper to format Supabase user into friendly profile
  const formatUser = (supaUser) => {
    if (!supaUser) return null;
    const meta = supaUser.user_metadata || {};
    const name = meta.full_name || meta.name || supaUser.email?.split('@')[0] || 'Pulse User';
    const initial = name.trim().charAt(0).toUpperCase() || 'P';
    const localAvatar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="%236366f1"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="%23ffffff" font-family="system-ui,-apple-system,sans-serif" font-size="28" font-weight="600">${initial}</text></svg>`;
    const avatar = meta.avatar_url || localAvatar;
    const provider = supaUser.app_metadata?.provider || 'email';

    return {
      id: supaUser.id,
      email: supaUser.email,
      name,
      avatar,
      mobile: meta.mobile || meta.phone_number || '',
      age: meta.age || '',
      weight: meta.weight || '',
      height: meta.height || '',
      profession: meta.profession || '',
      provider,
      emailConfirmed: Boolean(supaUser.email_confirmed_at || supaUser.confirmed_at),
      raw: supaUser
    };
  };

  const createGuestUser = () => {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem('pulse_guest_profile') || 'null');
    } catch {}

    const name = saved?.name || 'Guest Explorer';
    const initial = name.trim().charAt(0).toUpperCase() || 'G';
    const defaultAvatar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="%236366f1"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="%23ffffff" font-family="system-ui,-apple-system,sans-serif" font-size="28" font-weight="600">${initial}</text></svg>`;

    return {
      id: 'guest-user',
      email: 'guest@pulselife.app',
      name,
      avatar: saved?.avatar || defaultAvatar,
      mobile: saved?.mobile || '',
      age: saved?.age || '',
      weight: saved?.weight || '',
      height: saved?.height || '',
      profession: saved?.profession || '',
      provider: 'guest',
      emailConfirmed: true,
      isGuest: true,
      raw: null
    };
  };

  const loginAsGuest = () => {
    try {
      sessionStorage.setItem('pulse_guest_mode', 'true');
    } catch {}
    setUser(createGuestUser());
    setLoading(false);
  };

  useEffect(() => {
    // Check if recovery in URL and persist to sessionStorage immediately
    if (checkIsRecoveryUrl()) {
      sessionStorage.setItem('pulse_recovery_mode', 'true');
      setIsPasswordRecovery(true);
    }

    // 1. Initial Session Check
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      // If landing from signup email verification link: do NOT auto-sign in!
      if (checkIsEmailConfirmUrl()) {
        setEmailVerified(true);
        setUser(null);
        setSession(null);
        try {
          await supabase.auth.signOut();
        } catch {}
        try {
          window.history.replaceState(null, '', window.location.pathname);
        } catch {}
        setLoading(false);
        return;
      }

      // If explicitly landing on password recovery URL with tokens, user must NOT be granted dashboard access!
      if (hasExplicitRecoveryTokensInUrl()) {
        sessionStorage.setItem('pulse_recovery_mode', 'true');
        setIsPasswordRecovery(true);
        setSession(currentSession);
        setUser(null); // Keep user null so ProtectedRoute blocks dashboard access
        setLoading(false);
        return;
      }

      // If active session exists, ensure any stale recovery mode in sessionStorage is purged immediately!
      if (currentSession?.user) {
        try {
          sessionStorage.removeItem('pulse_recovery_mode');
        } catch {}
        setIsPasswordRecovery(false);
        setSession(currentSession);
        setUser(formatUser(currentSession.user));
      } else if (checkIsRecoveryUrl()) {
        sessionStorage.setItem('pulse_recovery_mode', 'true');
        setIsPasswordRecovery(true);
        setSession(currentSession);
        setUser(null);
      } else if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('pulse_guest_mode') === 'true') {
        setSession(null);
        setUser(createGuestUser());
      } else {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    }).catch(() => {
      if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('pulse_guest_mode') === 'true') {
        setUser(createGuestUser());
      }
      setLoading(false);
    });

    // 2. Real-time Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      // When user clicks the signup email verification link, Supabase fires SIGNED_IN.
      // We explicitly clear the session so they are NEVER auto-signed into the dashboard.
      if (checkIsEmailConfirmUrl()) {
        setEmailVerified(true);
        setUser(null);
        setSession(null);
        try {
          await supabase.auth.signOut();
        } catch {}
        try {
          window.history.replaceState(null, '', window.location.pathname);
        } catch {}
        setLoading(false);
        return;
      }

      // If user successfully signed in with email/password or updated user/refreshed token:
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        try {
          sessionStorage.removeItem('pulse_recovery_mode');
          sessionStorage.removeItem('pulse_guest_mode');
          const hash = window.location.hash || '';
          const search = window.location.search || '';
          if (hash.includes('type=recovery') || search.includes('type=recovery')) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        } catch {}
        setIsPasswordRecovery(false);
        setSession(newSession);
        setUser(newSession ? formatUser(newSession.user) : null);
        setLoading(false);
        return;
      }

      if (event === 'PASSWORD_RECOVERY') {
        sessionStorage.setItem('pulse_recovery_mode', 'true');
        setIsPasswordRecovery(true);
        setSession(newSession);
        setUser(null); // Keep user null so ProtectedRoute redirects to reset-password
        setLoading(false);
        return;
      }

      if (hasExplicitRecoveryTokensInUrl()) {
        sessionStorage.setItem('pulse_recovery_mode', 'true');
        setIsPasswordRecovery(true);
        setSession(newSession);
        setUser(null);
        setLoading(false);
        return;
      }

      setSession(newSession);
      setUser(newSession ? formatUser(newSession.user) : null);
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
    try {
      sessionStorage.removeItem('pulse_recovery_mode');
      sessionStorage.removeItem('pulse_guest_mode');
      if (typeof window !== 'undefined') {
        const hash = window.location.hash || '';
        const search = window.location.search || '';
        if (hash.includes('type=recovery') || search.includes('type=recovery')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    } catch {}
    setIsPasswordRecovery(false);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });
    if (error) throw error;
    return data;
  };

  // Sign up with Email, Password, Name & Referral Code
  const signUpWithEmail = async (email, password, name, referralCode = '') => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name ? name.trim() : cleanEmail.split('@')[0];
    const cleanRef = (referralCode || '').trim();

    const signUpMetadata = {
      full_name: cleanName
    };
    if (cleanRef) {
      signUpMetadata.referred_by = cleanRef;
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: signUpMetadata,
        emailRedirectTo: getAppBaseUrl()
      }
    });
    if (error) throw error;

    // If referral code was provided, grant 14-day Pro exploration & record attribution
    if (cleanRef) {
      try {
        localStorage.setItem('pulse_referral_pro_boost', 'true');
        await recordReferralSignup(cleanRef, data?.user?.id, cleanEmail);
      } catch (err) {
        console.warn('Could not record referral attribution:', err);
      }
    }

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
  // Pass explicit redirectTo to ensure Supabase directs to active app origin,
  // preventing fallback to default localhost:3000 configured in Supabase Site URL.
  const resetPasswordForEmail = async (email) => {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: getAppBaseUrl()
    });
    if (error) throw error;
    return data;
  };

  // Update authenticated user password from recovery mode
  // Signs out user immediately after password reset so they are NOT auto-logged into the dashboard
  const updateUserPassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    try {
      sessionStorage.removeItem('pulse_recovery_mode');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch {}
    setIsPasswordRecovery(false);
    setUser(null);
    setSession(null);
    try {
      await supabase.auth.signOut();
    } catch {}
    return data;
  };

  // Change password with verification of current (old) password
  const changePasswordWithVerification = async (oldPassword, newPassword) => {
    if (!user || user.isGuest) {
      throw new Error('Only registered accounts can change their password.');
    }
    if (!user.email) {
      throw new Error('User email not found. Please log in again.');
    }

    // 1. Verify current password
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword
    });

    if (verifyError) {
      throw new Error('Current password is incorrect. Please check and try again.');
    }

    // 2. Set new password
    const { data, error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) throw updateError;

    // 3. Ensure recovery mode is purged and session stays live
    try {
      sessionStorage.removeItem('pulse_recovery_mode');
      sessionStorage.removeItem('pulse_guest_mode');
      if (typeof window !== 'undefined') {
        const hash = window.location.hash || '';
        if (hash.includes('type=recovery') || hash.includes('type=signup')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    } catch {}
    setIsPasswordRecovery(false);
    if (data?.user) {
      setUser(formatUser(data.user));
    }
    return data;
  };

  // Sign Out
  const logout = async () => {
    try {
      sessionStorage.removeItem('pulse_recovery_mode');
      sessionStorage.removeItem('pulse_guest_mode');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch {}
    setIsPasswordRecovery(false);
    setEmailVerified(false);
    setUser(null);
    setSession(null);
    try {
      await supabase.auth.signOut();
    } catch {}
  };

  // Delete Account & All Data (triggers PostgreSQL SECURITY DEFINER RPC)
  const deleteAccount = async () => {
    if (!user?.id) throw new Error('No authenticated user found.');

    const { error: rpcError } = await supabase.rpc('delete_user_account');

    if (rpcError) {
      console.error('Supabase delete_user_account RPC error:', rpcError);
      throw new Error(
        rpcError.message || 'Failed to delete account. Please ensure the delete_user_account SQL function is configured in Supabase SQL Editor.'
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
    try {
      await supabase.auth.signOut();
    } catch (signOutErr) {
      // User record already deleted in auth.users, ignore signOut session errors
    }
  };

  // Update user profile information (Name, Avatar, Mobile, Age, Weight, Height, Profession)
  const updateUserProfile = async (updates) => {
    if (!user) throw new Error('No active user found.');

    // Guest Mode: persist to localStorage
    if (user.isGuest) {
      const updated = {
        ...user,
        name: updates.name !== undefined ? updates.name : user.name,
        avatar: updates.avatar !== undefined ? updates.avatar : user.avatar,
        mobile: updates.mobile !== undefined ? updates.mobile : user.mobile,
        age: updates.age !== undefined ? updates.age : user.age,
        weight: updates.weight !== undefined ? updates.weight : user.weight,
        height: updates.height !== undefined ? updates.height : user.height,
        profession: updates.profession !== undefined ? updates.profession : user.profession
      };
      try {
        localStorage.setItem('pulse_guest_profile', JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not save guest profile:', err);
      }
      setUser(updated);
      return { success: true, user: updated };
    }

    // Registered User: update Supabase user_metadata
    const currentMeta = user.raw?.user_metadata || {};
    const newMeta = {
      ...currentMeta,
      full_name: updates.name !== undefined ? updates.name : (currentMeta.full_name || user.name),
      name: updates.name !== undefined ? updates.name : (currentMeta.name || user.name),
      avatar_url: updates.avatar !== undefined ? updates.avatar : (currentMeta.avatar_url || user.avatar),
      mobile: updates.mobile !== undefined ? updates.mobile : (currentMeta.mobile || user.mobile),
      age: updates.age !== undefined ? updates.age : (currentMeta.age || user.age),
      weight: updates.weight !== undefined ? updates.weight : (currentMeta.weight || user.weight),
      height: updates.height !== undefined ? updates.height : (currentMeta.height || user.height),
      profession: updates.profession !== undefined ? updates.profession : (currentMeta.profession || user.profession)
    };

    const { data, error } = await supabase.auth.updateUser({
      data: newMeta
    });

    if (error) throw error;

    if (data?.user) {
      const formatted = formatUser(data.user);
      setUser(formatted);
      return { success: true, user: formatted };
    }

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isGuest: Boolean(user?.isGuest),
        loginAsGuest,
        isPasswordRecovery,
        setIsPasswordRecovery,
        emailVerified,
        setEmailVerified,
        signInWithEmail,
        signUpWithEmail,
        resendConfirmationEmail,
        resetPasswordForEmail,
        updateUserPassword,
        changePasswordWithVerification,
        updateUserProfile,
        logout,
        deleteAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

