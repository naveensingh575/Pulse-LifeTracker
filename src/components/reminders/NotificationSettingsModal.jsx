import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  Sun,
  Moon,
  Volume2,
  AlertTriangle
} from 'lucide-react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  getReminderPreferences,
  saveReminderPreferences,
  sendLocalNotification
} from '../../utils/notificationUtils';

export const NotificationSettingsModal = ({ isOpen, onClose }) => {
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState('default');
  const [enabled, setEnabled] = useState(false);
  const [morningTime, setMorningTime] = useState('08:00');
  const [eveningTime, setEveningTime] = useState('21:30');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSupported(isNotificationSupported());
    setPermission(getNotificationPermission());
    const prefs = getReminderPreferences();
    setEnabled(prefs.enabled);
    setMorningTime(prefs.morningTime);
    setEveningTime(prefs.eveningTime);
    setTestSent(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleEnable = async () => {
    if (!enabled) {
      // Trying to enable — check permission
      if (getNotificationPermission() !== 'granted') {
        const perm = await requestNotificationPermission();
        setPermission(perm);
        if (perm === 'granted') {
          setEnabled(true);
          saveReminderPreferences({ enabled: true, morningTime, eveningTime });
        }
      } else {
        setEnabled(true);
        saveReminderPreferences({ enabled: true, morningTime, eveningTime });
      }
    } else {
      // Disabling
      setEnabled(false);
      saveReminderPreferences({ enabled: false, morningTime, eveningTime });
    }
  };

  const handleMorningTimeChange = (time) => {
    setMorningTime(time);
    saveReminderPreferences({ morningTime: time });
  };

  const handleEveningTimeChange = (time) => {
    setEveningTime(time);
    saveReminderPreferences({ eveningTime: time });
  };

  const handleSendTest = () => {
    if (getNotificationPermission() !== 'granted') {
      requestNotificationPermission().then(perm => {
        setPermission(perm);
        if (perm === 'granted') {
          sendLocalNotification('⚡ Pulse Reminder Test', {
            body: 'Reminders are active! You will receive daily morning focus and evening review pings.',
            tag: 'pulse-test'
          });
          setTestSent(true);
        }
      });
    } else {
      sendLocalNotification('⚡ Pulse Reminder Test', {
        body: 'Reminders are active! You will receive daily morning focus and evening review pings.',
        tag: 'pulse-test'
      });
      setTestSent(true);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-sm">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Daily Retention Reminders</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">External habit cues to maintain consistency</p>
          </div>
        </div>

        {/* Main Enable / Disable Toggle Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Enable Push Reminders</span>
              {enabled && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Receive morning planning & evening check-in pings
            </p>
          </div>

          <button
            onClick={handleToggleEnable}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Permission Denied Warning */}
        {permission === 'denied' && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div>
              <p className="font-bold">Notifications Blocked by Browser</p>
              <p className="text-[11px] mt-0.5 text-rose-600/90 dark:text-rose-400/90">
                To receive alerts, click the lock/settings icon in your browser address bar and switch Notifications to “Allow”.
              </p>
            </div>
          </div>
        )}

        {/* Schedule Timing Pickers */}
        <div className="space-y-3 pt-1">
          {/* Morning Focus Timing */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Morning Focus</p>
                <p className="text-[10px] text-slate-400">Priorities & morning habits</p>
              </div>
            </div>
            <input
              type="time"
              value={morningTime}
              onChange={(e) => handleMorningTimeChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            />
          </div>

          {/* Evening Review Timing */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Evening Review</p>
                <p className="text-[10px] text-slate-400">Habit check-in & journal</p>
              </div>
            </div>
            <input
              type="time"
              value={eveningTime}
              onChange={(e) => handleEveningTimeChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Test Notification Button */}
        <div className="pt-1 flex items-center justify-between gap-3">
          <button
            onClick={handleSendTest}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>{testSent ? 'Chime Sent ✓' : 'Test Sound & Ping'}</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition shadow-md shadow-indigo-600/20 cursor-pointer text-center"
          >
            Save & Done
          </button>
        </div>

        {/* Psychological Insight Tip */}
        <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/30 text-[11px] text-indigo-900/80 dark:text-indigo-300/80 leading-relaxed flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>Consistent morning & evening triggers increase 30-day tracking adherence by over 74%.</span>
        </div>

      </div>
    </div>
  );
};
