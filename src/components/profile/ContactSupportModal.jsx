import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  Copy,
  Check,
  MessageSquare,
  HelpCircle,
  Bug,
  Lightbulb,
  CreditCard,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../context/DashboardContext';
import { triggerHaptic } from '../../utils/hapticUtils';

const SUPPORT_EMAIL = 'naveensingh575@gmail.com';

const INQUIRY_CATEGORIES = [
  { id: 'feedback', label: 'General Feedback', icon: MessageSquare },
  { id: 'bug', label: 'Report a Bug', icon: Bug },
  { id: 'feature', label: 'Feature Request', icon: Lightbulb },
  { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
  { id: 'data', label: 'Data & Privacy', icon: ShieldAlert },
  { id: 'other', label: 'Other Inquiry', icon: HelpCircle }
];

export const ContactSupportModal = ({ isOpen, onClose, initialCategory = 'feedback' }) => {
  const { user } = useAuth();
  const { theme, currency, subscriptionTier } = useDashboard();

  const [category, setCategory] = useState(initialCategory);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCategory(initialCategory);
      setUserEmail(user?.email || '');
      if (!subject) {
        const cat = INQUIRY_CATEGORIES.find(c => c.id === initialCategory);
        setSubject(cat ? `[Pulse - ${cat.label}] ` : '[Pulse Feedback] ');
      }
    }
  }, [isOpen, initialCategory, user?.email]);

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

  const currentCategoryObj = INQUIRY_CATEGORIES.find(c => c.id === category) || INQUIRY_CATEGORIES[0];

  const handleCategorySelect = (catId) => {
    setCategory(catId);
    const cat = INQUIRY_CATEGORIES.find(c => c.id === catId);
    setSubject(cat ? `[Pulse - ${cat.label}] ` : '[Pulse Inquiry] ');
    triggerHaptic('light');
  };

  const diagnosticDetails = {
    appVersion: 'Pulse Life Tracker v1.0.0',
    timestamp: new Date().toISOString(),
    userStatus: user ? (user.isGuest ? 'Guest Sandbox' : `User (${user.id})`) : 'Guest',
    userEmail: userEmail || user?.email || 'N/A',
    subscriptionTier: subscriptionTier || 'free',
    themePreference: theme,
    currencyPreference: currency,
    platform: typeof navigator !== 'undefined' ? `${navigator.userAgent}` : 'Unknown'
  };

  const getFullFormattedBody = () => {
    return `${message.trim()}

--------------------------------------
SYSTEM & ENVIRONMENT DIAGNOSTICS:
App: ${diagnosticDetails.appVersion}
User Email: ${diagnosticDetails.userEmail}
Status: ${diagnosticDetails.userStatus}
Tier: ${diagnosticDetails.subscriptionTier}
Theme: ${diagnosticDetails.themePreference} | Currency: ${diagnosticDetails.currencyPreference}
Device: ${diagnosticDetails.platform}
Timestamp: ${diagnosticDetails.timestamp}
--------------------------------------`;
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopiedEmail(true);
      triggerHaptic('light');
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyAll = async () => {
    try {
      const fullText = `To: ${SUPPORT_EMAIL}
Subject: ${subject || `[Pulse - ${currentCategoryObj.label}]`}

${getFullFormattedBody()}`;
      await navigator.clipboard.writeText(fullText);
      setCopiedAll(true);
      triggerHaptic('light');
      setTimeout(() => setCopiedAll(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendViaMailClient = () => {
    const finalSubject = encodeURIComponent(subject || `[Pulse - ${currentCategoryObj.label}] Support Request`);
    const finalBody = encodeURIComponent(getFullFormattedBody());
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${finalSubject}&body=${finalBody}`;
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                Contact Support & Feedback
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct channel to the Pulse engineering team
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Support Email Banner with 1-Click Copy */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="truncate">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Official Support Desk
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-xs sm:text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline truncate block"
              >
                {SUPPORT_EMAIL}
              </a>
            </div>
          </div>
          <button
            onClick={handleCopyEmail}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
          >
            {copiedEmail ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Category Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Inquiry Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {INQUIRY_CATEGORIES.map((cat) => {
              const IconC = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-400 dark:ring-indigo-500'
                      : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <IconC className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* User Email (if guest or editing) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Your Email
          </label>
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="your-email@example.com"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary of your inquiry..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Message
          </label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe what happened, request a feature, or share your thoughts with us..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        {/* Diagnostic Metadata Collapsible */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3 space-y-2">
          <button
            type="button"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
          >
            <span>App Diagnostics (Auto-Attached)</span>
            {showDiagnostics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          
          {showDiagnostics && (
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 space-y-1 pt-1 border-t border-slate-200/60 dark:border-slate-800">
              <p>• App: {diagnosticDetails.appVersion}</p>
              <p>• User: {diagnosticDetails.userEmail}</p>
              <p>• Tier: {diagnosticDetails.subscriptionTier}</p>
              <p>• Preferences: Theme: {diagnosticDetails.themePreference} | Currency: {diagnosticDetails.currencyPreference}</p>
              <p className="truncate">• Device: {diagnosticDetails.platform.slice(0, 60)}...</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleSendViaMailClient}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
          >
            <Send className="w-4 h-4" />
            <span>Send via Email Client</span>
          </button>

          <button
            type="button"
            onClick={handleCopyAll}
            className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
          >
            {copiedAll ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Message Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy All</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
          Typical response time: within 24 hours • naveensingh575@gmail.com
        </p>

      </div>
    </div>
  );
};
