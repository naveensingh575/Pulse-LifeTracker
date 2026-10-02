import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDashboard, SUPPORTED_CURRENCIES } from '../../context/DashboardContext';
import { useAuth } from '../../context/AuthContext';
import { ContactSupportModal } from './ContactSupportModal';
import { NotificationSettingsModal } from '../reminders/NotificationSettingsModal';
import { DataBackupModal } from '../backup/DataBackupModal';
import { ReferralModal } from '../referral/ReferralModal';
import { DeleteAccountModal } from '../auth/DeleteAccountModal';
import { AvatarUploadModal } from './AvatarUploadModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { EditProfileModal } from './EditProfileModal';
import { triggerHaptic } from '../../utils/hapticUtils';
import {
  X,
  Sun,
  Moon,
  Globe,
  Star,
  Mail,
  Bell,
  HardDrive,
  Gift,
  Crown,
  Sparkles,
  LogOut,
  Trash2,
  FileText,
  ChevronRight,
  ChevronDown,
  User,
  Shield,
  Check,
  ArrowRight,
  LogIn,
  Sliders,
  Heart,
  Camera,
  KeyRound,
  Phone,
  Calendar,
  Briefcase,
  Activity,
  Ruler,
  Edit3,
  UserCheck
} from 'lucide-react';

export const ProfileCardModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    theme,
    toggleTheme,
    currency,
    setCurrency,
    subscriptionTier,
    openPricingModal,
    trialInfo
  } = useDashboard();
  const { user, logout } = useAuth();

  // Child modal controllers
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactInitialCategory, setContactInitialCategory] = useState('feedback');
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Rating State
  const [rating, setRating] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const saved = localStorage.getItem('pulse_user_rating');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [showRatingFeedback, setShowRatingFeedback] = useState(false);

  // Reminders enabled status from localStorage
  const isRemindersActive = typeof window !== 'undefined' && localStorage.getItem('pulse_reminders_enabled') === 'true';

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRate = (stars) => {
    setRating(stars);
    setShowRatingFeedback(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pulse_user_rating', String(stars));
    }
    triggerHaptic('success');
  };

  const getRatingFeedbackText = (val) => {
    switch (val) {
      case 5:
        return 'Exceptional! 🚀 Truly life-changing';
      case 4:
        return 'Great! 🌟 Loving the momentum';
      case 3:
        return 'Good 👍 But room for improvement';
      case 2:
        return 'Fair ⚡ Having some friction';
      case 1:
        return 'Needs Work 💔 Missing key essentials';
      default:
        return 'Tap a star to rate Pulse';
    }
  };

  const currentDisplayRating = hoverRating || rating;

  const handleSetTheme = (targetTheme) => {
    if (theme !== targetTheme) {
      toggleTheme();
      triggerHaptic('light');
    }
  };

  const handleSetCurrency = (targetSymbol) => {
    setCurrency(targetSymbol);
    triggerHaptic('light');
  };

  const handleOpenContactWithCategory = (catId) => {
    setContactInitialCategory(catId);
    setShowContactModal(true);
  };

  const isGuest = !user || user.isGuest;

  return (
    <>
      {/* Backdrop: Clicking closes modal */}
      <div
        className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card: FIXED below top bezel (top-16) on mobile, centered on sm, with whitespace below */}
      <div className="fixed top-16 sm:top-1/2 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 max-w-lg mx-auto w-auto sm:w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-7 space-y-6 max-h-[calc(100dvh-8rem)] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden overscroll-x-none animate-in zoom-in-95 duration-200">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Profile & Preferences
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1. Identity & Membership Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-950/80 dark:to-indigo-950/20 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(true)}
                  className="relative group cursor-pointer focus:outline-none shrink-0"
                  title="Click to edit or upload avatar"
                  aria-label="Change profile avatar"
                >
                  {user && user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'User'}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/30 group-hover:ring-indigo-500 transition-all shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md group-hover:brightness-110 transition">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                  {/* Camera Edit Overlay Badge */}
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-md ring-2 ring-white dark:ring-slate-900 group-hover:scale-110 transition-transform">
                    <Camera className="w-2.5 h-2.5" />
                  </div>
                </button>
                
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                      {isGuest ? 'Guest Workspace' : (user?.name || 'Pulse Operator')}
                    </h3>
                  </div>
                  {user?.profession && (
                    <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 truncate flex items-center gap-1">
                      <Briefcase className="w-3 h-3 shrink-0" />
                      <span>{user.profession}</span>
                    </p>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {isGuest ? 'Local demo exploration session' : (user?.email || '')}
                  </p>
                </div>
              </div>

              {/* Membership Tier Badge */}
              <div className="shrink-0">
                <span className={'inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full border ' + (
                  subscriptionTier === 'founder' || subscriptionTier === 'lifetime'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : subscriptionTier === 'yearly' || subscriptionTier === 'monthly'
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                )}>
                  {subscriptionTier === 'founder' ? '👑 Founder' :
                   subscriptionTier === 'lifetime' ? '👑 Lifetime' :
                   subscriptionTier === 'yearly' ? '✨ Pro Yearly' :
                   subscriptionTier === 'monthly' ? '✨ Pro Monthly' :
                   '🌱 Free Starter'}
                </span>
              </div>
            </div>

            {/* Guest Action: Sign In or Upgrade Button */}
            <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-2">
              {isGuest ? (
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Create an account to sync across all devices
                  </span>
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In / Register</span>
                  </Link>
                </div>
              ) : (
                <div className="w-full flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {trialInfo?.isTrialActive && subscriptionTier === 'free' ? (
                      <span className="text-amber-600 dark:text-amber-400 font-bold">
                        ⚡ Pro Trial Active ({trialInfo.trialDaysRemaining}d remaining)
                      </span>
                    ) : (
                      <span>Current Plan: <strong className="capitalize">{subscriptionTier}</strong></span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      openPricingModal();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    <span>{subscriptionTier === 'free' ? 'Upgrade to Pro' : 'Manage Subscription'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 2. Personal Profile Card (Optional Attributes) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Personal Profile</span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase">
                      Optional
                    </span>
                  </h4>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEditProfileModal(true)}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Details</span>
              </button>
            </div>

            {/* Profile Attributes Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
                  <Phone className="w-3 h-3 text-indigo-500" /> Mobile
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                  {user?.mobile || '—'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
                  <Briefcase className="w-3 h-3 text-indigo-500" /> Profession
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                  {user?.profession || '—'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
                  <Calendar className="w-3 h-3 text-amber-500" /> Age
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {user?.age ? `${user.age} yrs` : '—'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
                  <Activity className="w-3 h-3 text-emerald-500" /> Weight
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {user?.weight ? `${user.weight} kg` : '—'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
                  <Ruler className="w-3 h-3 text-cyan-500" /> Height
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {user?.height ? `${user.height} cm` : '—'}
                </p>
              </div>

              <div
                onClick={() => setShowAvatarModal(true)}
                className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/40 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30 transition cursor-pointer flex flex-col justify-center"
              >
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-bold">
                  <Camera className="w-3 h-3" /> Avatar
                </span>
                <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 mt-0.5">
                  Edit Photo →
                </p>
              </div>
            </div>
          </div>

          {/* 3. Core Preferences: Theme & Currency */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Preferences
            </h4>

            {/* Theme Switcher */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Theme</p>
                </div>
              </div>

              {/* Segmented Theme Switch */}
              <div className="inline-flex p-1 bg-slate-200/80 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleSetTheme('light')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    theme === 'light'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSetTheme('dark')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-slate-800 text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            {/* Global Currency Dropdown */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Global Currency</p>
                </div>
              </div>

              <div className="relative shrink-0">
                <select
                  value={currency}
                  onChange={(e) => handleSetCurrency(e.target.value)}
                  className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs py-2 pl-3 pr-7 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm min-h-[38px] touch-manipulation"
                  aria-label="Select Currency"
                >
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.symbol} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium">
                      {c.symbol} {c.code}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 3. Feedback, Support & Growth */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Experience & Support
            </h4>

            {/* ⭐ Rate Pulse Widget */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/5 to-indigo-500/5 border border-amber-500/20 dark:border-amber-500/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Rate Your Pulse Experience</span>
                </div>
                {rating > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
                    {rating} / 5 Stars
                  </span>
                )}
              </div>

              {/* 5-Star Rating Buttons */}
              <div className="flex items-center justify-center gap-3 py-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= currentDisplayRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleRate(star)}
                      className="p-1.5 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          isFilled
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]'
                            : 'text-slate-300 dark:text-slate-700 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <p className="text-center text-xs font-medium text-slate-600 dark:text-slate-300 min-h-[16px]">
                {getRatingFeedbackText(currentDisplayRating)}
              </p>

              {/* Dynamic Follow-up Action based on rating */}
              {rating > 0 && (
                <div className="pt-2 border-t border-amber-500/15 flex flex-col sm:flex-row items-center justify-between gap-2 animate-in fade-in duration-200">
                  {rating >= 4 ? (
                    <>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
                        Glad you're enjoying Pulse! Share with friends to give them 14d Pro.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowReferralModal(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>Invite Friends</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
                        We want to improve! Tell us what features or fixes you need.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleOpenContactWithCategory('feedback')}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Send Feedback</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Quick Action Tools List */}
            <div className="space-y-1.5">
              {/* Contact Support */}
              <button
                type="button"
                onClick={() => handleOpenContactWithCategory('feedback')}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between transition cursor-pointer text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Contact Support & Feedback</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Direct founder assistance & bug reporting</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Daily Reminders */}
              <button
                type="button"
                onClick={() => setShowNotifSettings(true)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between transition cursor-pointer text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Daily Reminders</p>
                      {isRemindersActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Morning kickoff & evening wind-down pings</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {isRemindersActive ? 'Active' : 'Configure'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>

              {/* Invite Friends & Referral */}
              <button
                type="button"
                onClick={() => setShowReferralModal(true)}
                className="w-full p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-900/30 border border-amber-200/80 dark:border-amber-800/40 flex items-center justify-between transition cursor-pointer text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Invite Friends & Earn Pro</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 uppercase font-mono">
                        14d Pro
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Give 14 days of free Pro to companions</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-500" />
              </button>
            </div>
          </div>

          {/* 4. Data, Security & Legal */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Data & Security
            </h4>

            <div className="space-y-1.5">
              {/* Change Password (for registered accounts) */}
              {!isGuest && (
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between transition cursor-pointer text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Change Password</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Update your account security credential</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}

              {/* Backup & Restore */}
              <button
                type="button"
                onClick={() => setShowBackupModal(true)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between transition cursor-pointer text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Backup & Restore</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Export or import encrypted JSON backups</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Policies & Legal */}
              <Link
                to="/policy"
                onClick={onClose}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between transition cursor-pointer text-left block"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Policies & Terms</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Privacy, Terms of Service & Refunds</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>

            {/* Session & Account Actions */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              {!isGuest && (
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 flex items-center justify-between text-xs font-bold transition cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <LogOut className="w-4 h-4 text-slate-400" />
                    <span>Sign Out</span>
                  </div>
                </button>
              )}

              {!isGuest && (
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full p-2.5 rounded-xl hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-between text-xs font-bold transition cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center pt-2">
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Pulse Life Tracker v1.0.0 • Private & Encrypted
            </p>
          </div>

        </div>

      {/* Child Modals */}
      <AvatarUploadModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
      />

      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
      />

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      <ContactSupportModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        initialCategory={contactInitialCategory}
      />

      <NotificationSettingsModal
        isOpen={showNotifSettings}
        onClose={() => setShowNotifSettings(false)}
      />

      <DataBackupModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
      />

      <ReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
      />

      {showDeleteModal && (
        <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
      )}
    </>
  );
};
