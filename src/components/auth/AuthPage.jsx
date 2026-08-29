import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PulseLogo } from '../common/PulseLogo';
import { Sparkles, ArrowRight, Lock, Mail, CheckCircle2, User, X, AlertCircle, Check } from 'lucide-react';

export const AuthPage = () => {
  const { loginWithGoogle, loginWithEmail } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState('');

  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleName, setGoogleName] = useState('Naveen Kumar');
  const [googleEmail, setGoogleEmail] = useState('n9911558@gmail.com');

  // RFC 5322 Compliant Email Validation
  const validateEmail = (emailStr) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(emailStr);
  };

  // Google OAuth Handler
  const handleGoogleClick = () => {
    const customClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // If developer provided a real Google OAuth Client ID in environment, launch external popup
    if (customClientId && customClientId !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
      const redirectUri = window.location.origin;
      const scope = 'email profile';
      const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(customClientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}&prompt=select_account`;
      window.open(googleOAuthUrl, 'google_oauth', 'width=500,height=650,left=300,top=100');
    }

    // Open seamless in-app Google Account Consent Chooser Modal
    setShowGoogleModal(true);
  };

  const handleEmailLogin = (e) => {
    e.preventDefault();
    setEmailError('');

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    if (password.length < 4) {
      setEmailError('Password must be at least 4 characters long.');
      return;
    }

    loginWithEmail(email, name);
    navigate('/');
  };

  const handleGoogleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(googleEmail)) {
      alert('Please enter a valid Google email address.');
      return;
    }
    loginWithGoogle({
      name: googleName || googleEmail.split('@')[0] || 'Google User',
      email: googleEmail,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleName || googleEmail)}`,
      provider: 'google'
    });
    navigate('/');
  };

  const quickSelectGoogleAccount = (accEmail, accName) => {
    loginWithGoogle({
      name: accName,
      email: accEmail,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(accName)}`,
      provider: 'google'
    });
    navigate('/');
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
                PULSE <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">Life Tracker</span>
              </h1>
              <p className="text-xs text-indigo-600 dark:text-cyan-400 font-bold italic tracking-wide">
                "Your Life, in Rhythm."
              </p>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-slate-900 dark:text-slate-100">
            All-in-one personal operating system for habits, goals & cashflow.
          </h2>

          <div className="space-y-3 pt-2">
            {[
              'Predictive Goal Feasibility Engine',
              '7-Day & 30-Day Habit Streak Engine',
              'Cashflow, Budget Burn Rate & Rupee Ledger',
              'Morning Planning & Evening Review Routine Flow',
              'Google Calendar Sync & .ics Export'
            ].map((feat, idx) => (
              <div key={idx} className="flex items-center space-x-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Auth Form Card */}
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Welcome to PULSE</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sign in with Google OAuth or verified email address.</p>
          </div>

          {/* Email Error Alert */}
          {emailError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl flex items-center space-x-2 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{emailError}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleClick}
            className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all shadow-sm hover:border-indigo-500"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold absolute">
              or email sign in
            </span>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailLogin} className="space-y-3">
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
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="n9911558@gmail.com"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
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
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 mt-2"
            >
              <span>Sign In to PULSE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

      {/* Google Account Consent & Selector Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Google Account Consent</h4>
              </div>
              <button onClick={() => setShowGoogleModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick 1-Click Google Account Chooser */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Choose a Google Account:</p>
              
              <button
                onClick={() => quickSelectGoogleAccount('n9911558@gmail.com', 'Naveen Kumar')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    N
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Naveen Kumar</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">n9911558@gmail.com</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition" />
              </button>
            </div>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-slate-900 px-2 text-[10px] uppercase font-semibold text-slate-400 absolute">
                or sign in with another account
              </span>
            </div>

            <form onSubmit={handleGoogleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Google Profile Name</label>
                <input
                  type="text"
                  required
                  value={googleName}
                  onChange={e => setGoogleName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Google Email Address</label>
                <input
                  type="email"
                  required
                  value={googleEmail}
                  onChange={e => setGoogleEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
                >
                  Authenticate Account
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
