import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Smartphone,
  Apple,
  Share,
  PlusSquare,
  Download
} from 'lucide-react';

export const AppInstallModal = ({ isOpen, onClose, initialPlatform = 'android' }) => {
  const [platform, setPlatform] = useState(initialPlatform); // 'ios' | 'android'
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

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
          setIsInstalled(true);
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

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="pr-8 space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Install Pulse on Your Phone
          </h2>
        </div>

        {/* Platform Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setPlatform('android')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-xs transition cursor-pointer ${
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
            className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-xs transition cursor-pointer ${
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
            {/* Install Button */}
            <button
              type="button"
              onClick={handleNativeInstall}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/25 transition flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isInstalled ? 'App Already Installed' : 'Install Pulse App on Android'}</span>
            </button>

            {/* Android Manual Steps Guide */}
            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-[11px] uppercase tracking-wider">
                Installation in 3 Steps:
              </p>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                  <span>Open this link in <strong>Chrome</strong> or your Android browser.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                  <span>Tap the <strong>three dots (⋮)</strong> in the top-right corner.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                  <span>Select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in duration-150">
            {/* iOS Steps */}
            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-[11px] uppercase tracking-wider">
                How to Add on iPhone:
              </p>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-cyan-400 font-bold text-[11px] flex items-center justify-center shrink-0">1</div>
                  <span>Open <strong>Safari</strong> on your iPhone and navigate to this website.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-cyan-400 font-bold text-[11px] flex items-center justify-center shrink-0">2</div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span>Tap the Safari <strong>Share icon</strong></span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-semibold text-[10px]">
                      <Share className="w-3 h-3 mr-1" /> Share
                    </span>
                    <span>at the bottom of your screen.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
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
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
