import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PulseLogo } from '../common/PulseLogo';
import { Sparkles, ArrowRight, Lock, Mail, CheckCircle2, User, AlertCircle, Loader2 } from 'lucide-react';

export const AuthPage = () => {
  const { signInWithEmail, signUpWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // RFC 5322 Compliant Email Validation
  const validateEmail = (emailStr) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(emailStr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!validateEmail(email)) {
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
        const result = await signUpWithEmail(email, password, name);
        if (result?.user && !result.session) {
          setAuthSuccess('Account created! Please check your email for a confirmation link, or sign in.');
          setMode('signin');
        } else {
          setAuthSuccess('Account created successfully! Logging in...');
          setTimeout(() => navigate('/'), 600);
        }
      } else {
        await signInWithEmail(email, password);
        navigate('/');
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setAuthError(err.message || 'Google authentication failed.');
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
                PULSE <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">Cloud Connected</span>
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
              'Cloud Sync across Phone, Laptop & Tablet',
              'Strict Row-Level Database Privacy & Security',
              '7-Day & 30-Day Habit Streak Engine',
              'Income-First Cashflow & Monthly Budget Isolation',
              'Multi-Exercise Gym Workout Builder & Cardio Tracker'
            ].map((feat, idx) => (
              <div key={idx} className="flex items-center space-x-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Auth Form Card */}
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
          
          {/* Header & Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {mode === 'signin' ? 'Sign In to PULSE' : 'Create Your Account'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {mode === 'signin'
                    ? 'Enter your credentials to access your synced dashboard.'
                    : 'Sign up to start tracking your life routines and finances.'}
                </p>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setAuthError('');
                  setAuthSuccess('');
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
            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl flex items-center space-x-2 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{authSuccess}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all shadow-sm hover:border-indigo-500 cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[10px] uppercase tracking-wider text-slate-400 font-semibold absolute">
              or with email & password
            </span>
          </div>

          {/* Email & Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Naveen Kumar"
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 mt-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{mode === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In to PULSE' : 'Create My Free Account'}</span>
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
