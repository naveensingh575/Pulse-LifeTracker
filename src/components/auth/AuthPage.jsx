import React, { useState } from 'react';
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
  Check
} from 'lucide-react';

export const AuthPage = () => {
  const { signInWithEmail, signUpWithEmail, resendConfirmationEmail } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

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
    setResendSuccess(false);

    const cleanEmail = email.trim();

    if (!validateEmail(cleanEmail)) {
      setAuthError('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        const result = await signUpWithEmail(cleanEmail, password, name);
        
        // If Supabase has email confirmations enabled and session is not yet active
        if (result?.user && !result.session) {
          setNeedsConfirmation(true);
          setAuthSuccess(`Verification email sent to ${cleanEmail}! Please check your inbox to activate your account.`);
          setMode('signin');
        } else {
          setAuthSuccess('Account created successfully! Entering PULSE...');
          setTimeout(() => navigate('/'), 600);
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
        setAuthError('An account with this email already exists. Please switch to Sign In.');
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
    setResendSuccess(false);
    try {
      await resendConfirmationEmail(email);
      setResendSuccess(true);
      setAuthSuccess(`A fresh confirmation link has been sent to ${email}.`);
      setAuthError('');
    } catch (err) {
      setAuthError(err.message || 'Failed to resend confirmation email. Please try again in a few minutes.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center z-10">
        
        {/* Left Side: Brand Overview */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <PulseLogo size="lg" />
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                PULSE <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">Cloud Connected</span>
              </h1>
              <p className="text-xs text-indigo-600 dark:text-cyan-400 font-bold italic tracking-wide">
                "Your Life, in Rhythm."
              </p>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-slate-900 dark:text-slate-100">
            Personal life operating system for habits, workouts, goals & cashflow.
          </h2>

          <div className="space-y-3 pt-2">
            {[
              'Secure Cloud Sync across Phone, Laptop & Tablet',
              'Strict Row-Level Database Privacy & Security (RLS)',
              '7-Day & 30-Day Habit Rhythm Engine',
              'Income-First Cashflow & Monthly Budget Allocation',
              'Multi-Exercise Gym Workout Builder & Cardio Tracker'
            ].map((feat, idx) => (
              <div key={idx} className="flex items-center space-x-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200/60 dark:border-indigo-500/20 text-xs flex items-center space-x-3 text-indigo-900 dark:text-indigo-200">
            <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0" />
            <span>Encrypted cloud storage powered by PostgreSQL. Your data remains strictly private to your verified email account.</span>
          </div>
        </div>

        {/* Right Side: Auth Form Card */}
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-7 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
          
          {/* Header & Tabs */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {mode === 'signin' ? 'Sign In to Your Account' : 'Create a New Account'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === 'signin'
                  ? 'Enter your verified email and password to access your dashboard.'
                  : 'Sign up with your email to start tracking your daily operating pulse.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
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

          {/* Email & Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
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
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                {mode === 'signup' && (
                  <span className="text-[10px] text-slate-400">Min. 6 characters</span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
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
                  <span>{mode === 'signin' ? 'Authenticating...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In to Dashboard' : 'Create Free Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
