import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Apple,
  Share,
  PlusSquare,
  Download,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';

export const AppInstallModal = ({ isOpen, onClose, initialPlatform = 'android' }) => {
  const [platform, setPlatform] = useState(initialPlatform); // 'ios' | 'android'
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    if (initialPlatform) {
      setPlatform(initialPlatform);
    }
  }, [initialPlatform]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallSuccess(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setInstallSuccess(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('PWA install prompt error:', err);
      }
    } else {
      // Fallback instruction
      alert('To install on Android: Open Chrome menu (⋮) -> Tap "Add to Home Screen" or "Install App".');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-500/30 text-indigo-600 dark:text-cyan-400 text-xs font-bold">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile App Edition</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Install Pulse on Your Phone
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Enjoy full standalone performance, instant offline caching, fast load times, and distraction-free tracking directly from your phone's home screen.
          </p>
        </div>

        {/* Platform Selector Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setPlatform('android')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
              platform === 'android'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android</span>
          </button>
          <button
            type="button"
            onClick={() => setPlatform('ios')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
              platform === 'ios'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>iPhone / iOS</span>
          </button>
        </div>

        {/* Dynamic Platform Content */}
        {platform === 'android' ? (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Direct Install CTA */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Android Standalone WebAPK</h4>
                    <p className="text-[11px] text-slate-500">1-Tap Fast Native Installation</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Ready
                </span>
              </div>

              <button
                type="button"
                onClick={handleNativeInstall}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/25 transition flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>{isInstalled ? 'App Already Installed' : 'Install Pulse App on Android'}</span>
              </button>
            </div>

            {/* Android Manual Steps Guide */}
            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-[11px] uppercase tracking-wider">
                Manual Installation in 3 Steps:
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                  <span>Open this link in <strong>Chrome</strong> or your default Android browser.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                  <span>Tap the <strong>three dots (⋮)</strong> in the top-right corner.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                  <span>Select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* iOS Guide */}
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-cyan-400">
                  <Apple className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Apple iPhone & iPad Safari</h4>
                  <p className="text-[11px] text-slate-500">Zero-download direct home screen launch</p>
                </div>
              </div>
            </div>

            {/* iOS Steps */}
            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-[11px] uppercase tracking-wider">
                How to Add on iPhone:
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-cyan-400 font-bold text-[11px] flex items-center justify-center shrink-0">1</div>
                  <span>Open <strong>Safari</strong> on your iPhone and navigate to this website.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-cyan-400 font-bold text-[11px] flex items-center justify-center shrink-0">2</div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span>Tap the Safari <strong>Share icon</strong></span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-semibold text-[10px]">
                      <Share className="w-3 h-3 mr-1" /> Share
                    </span>
                    <span>at the bottom of your screen.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-cyan-400 font-bold text-[11px] flex items-center justify-center shrink-0">3</div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-semibold text-[10px]">
                      <PlusSquare className="w-3 h-3 mr-1" /> Add
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Highlights Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Instant Sync
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Biometric Safe
          </span>
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-500" /> Play & App Store Edition In Review
          </span>
        </div>
      </div>
    </div>
  );
};
