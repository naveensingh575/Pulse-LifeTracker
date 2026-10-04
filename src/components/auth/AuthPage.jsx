import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PulseLogo } from '../common/PulseLogo';
import {
  ArrowRight,
  Lock,
  Mail,
  CheckCircle2,
  User,
  AlertCircle,
  Loader2,
  Send,
  Sparkles,
  ShieldCheck,
  Check,
  KeyRound,
  ArrowLeft,
  Key,
  Shield,
  Smartphone,
  Apple,
  Download,
  Gift
} from 'lucide-react';
import { AppInstallModal } from '../common/AppInstallModal';

// Feature & usability highlights for hero column (non-technical, user-friendly benefits)
const BASE_FEATURES = [
  'Daily, weekly & monthly habit streak tracking',
  'Action task boards to prioritize your day',
  'Income & expense budgeting with peace of mind',
  'Workouts, running & reading activity logs',
  'Personal goal planning with clear milestones'
];

// Extra highlights on laptop/desktop to balance vertical height with sign-in form
const LAPTOP_SIGNIN_FEATURES = [
  'Evening reflection & private daily journal',
  'Works offline and syncs across all your devices'
];

// Additional highlights on laptop/desktop to balance vertical height with taller create account form
const LAPTOP_SIGNUP_FEATURES = [
  'Evening reflection & private daily journal',
  'Works offline and syncs across all your devices',
  'Instant 14-day free Pro preview on signup',
  'Visual calendar heatmaps to track consistency',
  'Weekly Sunday review to start every week focused'
];

export const AuthPage = ({ initialMode }) => {
  const {
    signInWithEmail,
    signUpWithEmail,
    resendConfirmationEmail,
    resetPasswordForEmail,
    updateUserPassword,
    isPasswordRecovery,
    emailVerified,
    setEmailVerified,
    logout,
    loginAsGuest
  } = useAuth();

  
  const navigate = useNavigate();

  // Modes: 'signin' | 'signup' | 'forgot' | 'update-password' | 'signup-verified' | 'password-reset-success'
  const [mode, setMode] = useState(() => {
    if (initialMode) return initialMode;
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const href = typeof window !== 'undefined' ? window.location.href : '';
    if (
      hash.includes('type=recovery') ||
      search.includes('type=recovery') ||
      href.includes('type=recovery') ||
      hash.includes('mode=update-password') ||
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('pulse_recovery_mode') === 'true')
    ) {
      return 'update-password';
    }
    if (
      hash.includes('type=signup') ||
      search.includes('type=signup') ||
      href.includes('type=signup') ||
      hash.includes('verified=true') ||
      search.includes('verified=true') ||
      href.includes('verified=true') ||
      hash.includes('type=email_change') ||
      search.includes('type=email_change') ||
      emailVerified ||
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('pulse_email_verified') === 'true')
    ) {
      return 'signup-verified';
    }
    // Auto-direct to signup when arriving via referral or explicit mode=signup
    if (
      hash.includes('mode=signup') ||
      href.includes('mode=signup') ||
      hash.includes('ref=') ||
      href.includes('ref=') ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('pulse_incoming_referral'))
    ) {
      return 'signup';
    }
    return 'signin';
  });

  const [passwordResetCompleted, setPasswordResetCompleted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  
  // Referral code state: extracted from URL or local storage
  const [referralCode, setReferralCode] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      const fullHref = window.location.href;
      const url = new URL(fullHref);
      let ref = url.searchParams.get('ref');
      if (!ref && window.location.hash.includes('?')) {
        const hashQuery = window.location.hash.split('?')[1];
        const params = new URLSearchParams(hashQuery);
        ref = params.get('ref');
      }
      if (ref) return ref.trim();
      const stored = localStorage.getItem('pulse_incoming_referral');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.code) return parsed.code.trim();
      }
    } catch {}
    return '';
  });
  
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Mobile App Install Modal State
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installPlatform, setInstallPlatform] = useState('android');

  const openInstallGuide = (plat) => {
    setInstallPlatform(plat);
    setShowInstallModal(true);
  };

  // Check URL hash / auth recovery / email verification event on mount
  useEffect(() => {
    if (mode === 'password-reset-success' || passwordResetCompleted) return;

    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const href = typeof window !== 'undefined' ? window.location.href : '';
    const hasValidToken = (hash.includes('type=recovery') && (hash.includes('access_token=') || hash.includes('token_hash='))) ||
                          (search.includes('type=recovery') && (search.includes('code=') || search.includes('token_hash='))) ||
                          hash.includes('type=recovery') || search.includes('type=recovery');

    const hasSignupToken = hash.includes('type=signup') || search.includes('type=signup') || href.includes('type=signup') ||
                           hash.includes('verified=true') || search.includes('verified=true') || href.includes('verified=true') ||
                           hash.includes('type=email_change') || search.includes('type=email_change') ||
                           (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('pulse_email_verified') === 'true');

    if (
      (!passwordResetCompleted && initialMode === 'update-password') ||
      hasValidToken ||
      isPasswordRecovery ||
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('pulse_recovery_mode') === 'true')
    ) {
      setMode('update-password');
      setAuthSuccess('');
      setAuthError('');
    } else if (hasSignupToken || emailVerified) {
      setMode('signup-verified');
      setAuthSuccess('');
      setAuthError('');
    }
  }, [initialMode, isPasswordRecovery, emailVerified, mode, passwordResetCompleted]);

  // RFC 5322 Compliant Email Validation
  const validateEmail = (emailStr) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(emailStr.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setNeedsConfirmation(false);

    const cleanEmail = email.trim();

    // Mode: FORGOT PASSWORD REQUEST
    if (mode === 'forgot') {
      if (!validateEmail(cleanEmail)) {
        setAuthError('Please enter a valid email address (e.g. name@domain.com).');
        return;
      }

      setIsSubmitting(true);
      try {
        await resetPasswordForEmail(cleanEmail);
        setResetEmailSent(true);
        setAuthSuccess(`Password reset instructions sent to ${cleanEmail}! Please check your email.`);
      } catch (err) {
        setAuthError(err.message || 'Failed to send password reset email. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Mode: UPDATE NEW PASSWORD
    if (mode === 'update-password') {
      if (password.length < 8) {
        setAuthError('New password must be at least 8 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setAuthError('Passwords do not match. Please re-enter.');
        return;
      }

      setIsSubmitting(true);
      try {
        await updateUserPassword(password);
        setPasswordResetCompleted(true);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setAuthError('');
        setAuthSuccess('');
        setMode('password-reset-success');
        if (typeof window !== 'undefined') {
          try {
            window.history.replaceState(null, '', `${window.location.pathname}#/login?reset=success`);
          } catch {}
        }
      } catch (err) {
        setAuthError(err.message || 'Failed to update password. Your recovery link may have expired.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Mode: SIGN IN & SIGN UP
    if (!validateEmail(cleanEmail)) {
      setAuthError('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    if (mode === 'signup' && password.length < 8) {
      setAuthError('Password must be at least 8 characters long.');
      return;
    }

    if (mode === 'signin' && !password) {
      setAuthError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        const result = await signUpWithEmail(cleanEmail, password, name, referralCode);
        
        // Supabase user enumeration protection: if email already exists, identities is empty and no email is sent
        if (result?.user && Array.isArray(result.user.identities) && result.user.identities.length === 0) {
          setAuthError('An account with this email address already exists. Please sign in or use "Forgot Password".');
          setMode('signin');
          setEmail(cleanEmail);
          return;
        }

        // If Supabase has email confirmations enabled and session is not yet active
        if (result?.user && !result.session) {
          setNeedsConfirmation(true);
          setAuthSuccess(`Verification email sent to ${cleanEmail}! Please check your inbox (and spam folder) to activate your account.`);
          // Clear form fields
          setEmail('');
          setPassword('');
          setName('');
          setConfirmPassword('');
        } else {
          setAuthSuccess('Account created successfully! Please sign in with your email and password.');
          setEmail('');
          setPassword('');
          setName('');
          setConfirmPassword('');
          setMode('signin');
        }
      } else {
        await signInWithEmail(cleanEmail, password);
        navigate('/');
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('email not confirmed')) {
        setNeedsConfirmation(true);
        setAuthError('Your email address has not been confirmed yet. Please check your inbox for the activation link.');
      } else if (msg.toLowerCase().includes('invalid login credentials')) {
        setAuthError('Incorrect email or password. Please verify your credentials or create a new account.');
      } else if (msg.toLowerCase().includes('user already registered')) {
        setAuthError('Unable to register. If an account already exists with this email, please switch to Sign In.');
      } else {
        setAuthError(msg || 'Authentication failed. Please check your details.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendLink = async () => {
    if (!validateEmail(email)) {
      setAuthError('Please enter your email above to resend the confirmation link.');
      return;
    }

    setIsResending(true);
    try {
      await resendConfirmationEmail(email);
      setAuthSuccess(`A fresh confirmation link has been sent to ${email}.`);
      setAuthError('');
    } catch (err) {
      setAuthError(err.message || 'Failed to resend confirmation email. Please try again in a few minutes.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCancelRecovery = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
    try {
      sessionStorage.removeItem('pulse_recovery_mode');
      sessionStorage.removeItem('pulse_recovery_email');
    } catch {}
    setIsPasswordRecovery(false);
    setPasswordResetCompleted(true);
    setPassword('');
    setConfirmPassword('');
    setEmail('');
    setAuthError('');
    setAuthSuccess('');
    setResetEmailSent(false);
    setMode('signin');
    if (typeof window !== 'undefined') {
      try {
        window.history.replaceState(null, '', `${window.location.pathname}#/login`);
      } catch {}
      window.location.replace(`${window.location.origin}${window.location.pathname}#/login`);
    } else {
      navigate('/login', { replace: true });
    }
  };

  const handleBackToSignInFromResetSuccess = () => {
    try {
      sessionStorage.removeItem('pulse_recovery_mode');
      sessionStorage.removeItem('pulse_recovery_email');
      sessionStorage.removeItem('pulse_email_verified');
    } catch {}
    setIsPasswordRecovery(false);
    setPasswordResetCompleted(true);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setAuthError('');
    setAuthSuccess('');
    setMode('signin');

    if (typeof window !== 'undefined') {
      try {
        window.history.replaceState(null, '', `${window.location.pathname}#/login`);
      } catch {}
    }
    navigate('/login', { replace: true });
  };

  const handleProceedToSignInFromVerified = () => {
    try {
      sessionStorage.removeItem('pulse_email_verified');
      sessionStorage.removeItem('pulse_recovery_mode');
      sessionStorage.removeItem('pulse_recovery_email');
    } catch {}
    setEmailVerified(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setAuthError('');
    setAuthSuccess('');
    setMode('signin');

    if (typeof window !== 'undefined') {
      try {
        window.history.replaceState(null, '', `${window.location.pathname}#/login`);
      } catch {}
      window.location.replace(`${window.location.origin}${window.location.pathname}#/login`);
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-start md:justify-center md:items-center px-4 relative overflow-y-auto transition-colors"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 2rem)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2.5rem)',
        minHeight: '100dvh'
      }}
    >
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch z-10 my-0 md:my-auto">
        
        {/* Left Side: Brand Overview */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <PulseLogo size="lg" />
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  PULSE <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">Life Tracker</span>
                </h1>
                <p className="text-xs text-indigo-600 dark:text-cyan-400 font-bold italic tracking-wide">
                  "Your Life, in Rhythm."
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              {BASE_FEATURES.map((feat, idx) => (
                <div key={`base-${idx}`} className="flex items-center space-x-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
              {(mode === 'signup' ? LAPTOP_SIGNUP_FEATURES : LAPTOP_SIGNIN_FEATURES).map((feat, idx) => (
                <div key={`laptop-${idx}`} className="hidden md:flex items-center space-x-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile App Download Card */}
          <div className="p-4 bg-slate-100/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm mt-6 md:mt-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-cyan-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Get Pulse Mobile App</h4>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => openInstallGuide('android')}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-xs font-bold transition cursor-pointer active:scale-95 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Android App</span>
              </button>

              <button
                type="button"
                onClick={() => openInstallGuide('ios')}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-indigo-200 dark:border-slate-700 text-xs font-bold transition cursor-pointer active:scale-95 shadow-sm"
              >
                <Apple className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                <span>iPhone / iOS</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center italic">
              Google Play & Apple App Store editions coming soon
            </p>
          </div>
        </div>

        {/* Right Side: Auth Form Card */}
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-7 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
          
          {/* Header & Tabs */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {mode === 'signin' && 'Sign In to Your Account'}
                {mode === 'signup' && 'Create a New Account'}
                {mode === 'forgot' && 'Reset Your Password'}
                {mode === 'update-password' && 'Verification Successful'}
                {mode === 'signup-verified' && 'Welcome to Pulse!'}
                {mode === 'password-reset-success' && 'Password Changed Successfully!'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {mode === 'signin' && 'Enter your verified email and password to access your dashboard.'}
                {mode === 'signup' && 'Sign up with your email to start tracking your daily operating pulse.'}
                {mode === 'forgot' && 'Enter your registered email to receive a secure password reset link.'}
                {mode === 'update-password' && 'Your recovery link has been verified. Please create and confirm your new password below.'}
                {mode === 'signup-verified' && 'Your account has been created. Please sign in with your credentials to access your dashboard.'}
                {mode === 'password-reset-success' && 'Your new password has been set. You can now sign in with your updated credentials.'}
              </p>
            </div>

            {/* Mode Switcher Tabs for Sign In / Sign Up */}
            {(mode === 'signin' || mode === 'signup') && (
              <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setEmail('');
                    setPassword('');
                    setName('');
                    setConfirmPassword('');
                    setAuthError('');
                    setAuthSuccess('');
                    setNeedsConfirmation(false);
                  }}
                  className={`py-2 rounded-lg transition cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setEmail('');
                    setPassword('');
                    setName('');
                    setConfirmPassword('');
                    setAuthError('');
                    setAuthSuccess('');
                    setNeedsConfirmation(false);
                  }}
                  className={`py-2 rounded-lg transition cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}
          </div>

          {/* Feedback Alerts */}
          {authError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl space-y-2 text-rose-700 dark:text-rose-300 text-xs font-medium animate-in fade-in duration-150">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>

              {needsConfirmation && (
                <div className="pt-2 border-t border-rose-200 dark:border-rose-500/30 flex items-center justify-between">
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">Didn't receive the activation email?</span>
                  <button
                    type="button"
                    onClick={handleResendLink}
                    disabled={isResending}
                    className="text-indigo-600 dark:text-cyan-400 hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {isResending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    <span>Resend Link</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {authSuccess && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl space-y-1.5 text-emerald-700 dark:text-emerald-300 text-xs font-medium animate-in fade-in duration-150">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{authSuccess}</span>
              </div>
              
              {needsConfirmation && (
                <p className="text-[11px] text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
                  Tip: Check your spam/junk folder if you don't see the email within 1 minute.
                </p>
              )}
            </div>
          )}

          {/* 1. SIGN IN / SIGN UP FORM */}
          {(mode === 'signin' || mode === 'signup') && (
            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-base sm:text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    name="pulse_user_email"
                    id="pulse_user_email"
                    required
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck="false"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      if (authError) setAuthError('');
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-base sm:text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                  {mode === 'signin' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setEmail('');
                        setPassword('');
                        setAuthError('');
                        setAuthSuccess('');
                        setResetEmailSent(false);
                      }}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400">Min. 8 characters</span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    name="pulse_user_auth_key"
                    id="pulse_user_auth_key"
                    required
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck="false"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (authError) setAuthError('');
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-base sm:text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Referral / Invite Code (Optional)
                    </label>
                    {referralCode.trim() && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                        14-Day Pro Free
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Gift className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Enter referral or invite code"
                      value={referralCode}
                      onChange={e => {
                        const val = e.target.value;
                        setReferralCode(val);
                        if (val.trim()) {
                          try {
                            localStorage.setItem('pulse_referral_pro_boost', 'true');
                            localStorage.setItem('pulse_incoming_referral', JSON.stringify({
                              code: val.trim(),
                              capturedAt: new Date().toISOString()
                            }));
                          } catch {}
                        }
                      }}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-base sm:text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  {referralCode.trim() && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Referral code active! You will unlock 14 days of free Pro preview upon signup.</span>
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 mt-3 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{mode === 'signin' ? 'Authenticating...' : 'Creating account...'}</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In to Dashboard' : 'Create Free Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Live Interactive Demo Button */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Want to preview without signing up first?
                </div>
                <button
                  type="button"
                  onClick={() => {
                    loginAsGuest();
                    navigate('/');
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-500/10 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer group active:scale-95 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 group-hover:scale-110 transition-transform" />
                  <span>Explore Live Interactive Demo</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. FORGOT PASSWORD REQUEST FORM */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              {!resetEmailSent ? (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Registered Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="name@domain.com"
                        value={email}
                        onChange={e => {
                          setEmail(e.target.value);
                          if (authError) setAuthError('');
                        }}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-base sm:text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending reset email...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Password Reset Link</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200/60 dark:border-indigo-500/20 space-y-3 text-xs animate-in fade-in duration-200">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-indigo-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">Check your inbox</h4>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                        We've sent a password reset link to <span className="font-semibold text-indigo-600 dark:text-cyan-400">{email}</span>. Click the link in the email to set your new password.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-indigo-200/40 dark:border-indigo-500/20 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Didn't get the email?</span>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      <span>Resend Link</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setAuthError('');
                    setAuthSuccess('');
                    setResetEmailSent(false);
                  }}
                  className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. SIGNUP EMAIL VERIFIED SUCCESS CARD */}
          {mode === 'signup-verified' && (
            <div className="space-y-5 text-center py-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/20 flex items-center justify-center ring-4 ring-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-8 h-8" />
                </div>
              </div>

              <div className="space-y-2 max-w-sm mx-auto">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                  <Check className="w-3 h-3" />
                  <span>Account is created</span>
                </div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white">
                  Welcome to Pulse!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Your email address has been verified and your account is created. Please sign in below with your email and password to access your dashboard.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleProceedToSignInFromVerified}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
                >
                  <span>Sign In to Your Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 4. SET NEW PASSWORD FORM (Password Recovery) */}
          {mode === 'update-password' && (
            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3.5">
              <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/60 dark:border-indigo-500/20 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-cyan-400">
                  <KeyRound className="w-4 h-4" />
                  <span>Verification Confirmed</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed pl-5">
                  Please create and confirm your new password below.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="Enter new password (min. 8 characters)"
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (authError) setAuthError('');
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-base sm:text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={e => {
                      setConfirmPassword(e.target.value);
                      if (authError) setAuthError('');
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-base sm:text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 mt-3 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving new password...</span>
                  </>
                ) : (
                  <>
                    <span>Save New Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleCancelRecovery}
                  className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cancel & Back to Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* 5. PASSWORD RESET SUCCESS CONFIRMATION */}
          {mode === 'password-reset-success' && (
            <div className="space-y-5 text-center py-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/20 flex items-center justify-center ring-4 ring-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              </div>

              <div className="space-y-2 max-w-sm mx-auto">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                  <Check className="w-3 h-3" />
                  <span>Password Updated</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Password Changed Successfully!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Your new password has been saved. Please sign in below with your updated credentials to access your dashboard.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleBackToSignInFromResetSuccess}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
                >
                  <span>Sign In with New Password</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Mobile App Install Modal */}
      <AppInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        initialPlatform={installPlatform}
      />

    </div>
  );
};
