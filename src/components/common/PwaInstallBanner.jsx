import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Sparkles } from 'lucide-react';
import { PulseLogo } from './PulseLogo';

export const PwaInstallBanner = ({ onOpenInstallGuide }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [platform, setPlatform] = useState('android');

  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

    // 1. Check if on mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    // 2. Check if already installed / running in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) return;

    // 3. Check if user dismissed prompt in last 5 days
    const dismissedAt = localStorage.getItem('pulse_pwa_prompter_dismissed');
    if (dismissedAt) {
      const diffMs = Date.now() - Number(dismissedAt);
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays < 5) return;
    }

    const detectedPlat = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'ios' : 'android';
    setPlatform(detectedPlat);
    setIsVisible(true);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pulse_pwa_prompter_dismissed', String(Date.now()));
  };

  const handleInstallClick = () => {
    handleDismiss();
    if (onOpenInstallGuide) {
      onOpenInstallGuide(platform);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-indigo-500/30 dark:border-indigo-500/40 rounded-2xl shadow-2xl shadow-indigo-600/20 flex items-center justify-between gap-3 ring-1 ring-black/5 dark:ring-white/5">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shrink-0 shadow-md shadow-indigo-500/20">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 truncate">
              <span>Install Pulse App</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-bold">
                PWA
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              Add to Home Screen for offline rhythm & haptics
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition cursor-pointer shadow-sm shadow-indigo-600/30 flex items-center gap-1 active:scale-95"
          >
            <Download className="w-3 h-3" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
