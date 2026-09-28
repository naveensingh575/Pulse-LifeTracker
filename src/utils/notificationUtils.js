/**
 * Daily Retention Notification Engine for Pulse Life Tracker
 * Delivers morning focus directives, mid-day momentum pings, and evening reviews.
 * Works seamlessly in Browser Web Notifications, PWA mode, and Capacitor native shells.
 */

// Soft Web Audio API synthesized chime (zero external assets, 100% offline)
export function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    // Pleasant two-tone chime (D5 -> A5)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Ignore audio context errors if un-interacted
  }
}

export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission; // 'granted' | 'denied' | 'default'
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      localStorage.setItem('pulse_reminders_enabled', 'true');
    }
    return permission;
  } catch (e) {
    console.warn('Could not request notification permission:', e);
    return 'denied';
  }
}

export function getReminderPreferences() {
  if (typeof window === 'undefined') {
    return { enabled: false, morningTime: '08:00', eveningTime: '21:30' };
  }
  return {
    enabled: localStorage.getItem('pulse_reminders_enabled') === 'true',
    morningTime: localStorage.getItem('pulse_morning_time') || '08:00',
    eveningTime: localStorage.getItem('pulse_evening_time') || '21:30'
  };
}

export function saveReminderPreferences({ enabled, morningTime, eveningTime }) {
  if (typeof window === 'undefined') return;
  if (enabled !== undefined) {
    localStorage.setItem('pulse_reminders_enabled', enabled ? 'true' : 'false');
  }
  if (morningTime) {
    localStorage.setItem('pulse_morning_time', morningTime);
  }
  if (eveningTime) {
    localStorage.setItem('pulse_evening_time', eveningTime);
  }
}

export function sendLocalNotification(title, options = {}) {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    playNotificationChime();
    const notif = new Notification(title, {
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      silent: false,
      ...options
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };
    return true;
  } catch (err) {
    console.warn('Failed to dispatch notification:', err);
    return false;
  }
}

/**
 * Checks schedule every minute and triggers Morning Focus or Evening Review
 */
export function checkAndTriggerScheduledReminders({ pendingHabitsCount = 0, topTaskTitle = '' } = {}) {
  const prefs = getReminderPreferences();
  if (!prefs.enabled) return;
  if (getNotificationPermission() !== 'granted') return;

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${hours}:${minutes}`;
  const todayDateStr = now.toISOString().split('T')[0];

  // 1. Morning Focus Check (e.g. 08:00)
  const lastMorning = localStorage.getItem('pulse_last_morning_notif_date');
  if (currentTime === prefs.morningTime && lastMorning !== todayDateStr) {
    localStorage.setItem('pulse_last_morning_notif_date', todayDateStr);
    sendLocalNotification('☀️ Pulse Morning Focus', {
      body: topTaskTitle
        ? `Good morning! Priority target today: "${topTaskTitle}". Review your habits to win the day.`
        : `Good morning! Set today's top 3 priorities and check off your morning routine.`,
      tag: 'pulse-morning-focus'
    });
  }

  // 2. Evening Review Check (e.g. 21:30)
  const lastEvening = localStorage.getItem('pulse_last_evening_notif_date');
  if (currentTime === prefs.eveningTime && lastEvening !== todayDateStr) {
    localStorage.setItem('pulse_last_evening_notif_date', todayDateStr);
    sendLocalNotification('🌙 Pulse Evening Review', {
      body: pendingHabitsCount > 0
        ? `You have ${pendingHabitsCount} habit${pendingHabitsCount > 1 ? 's' : ''} left today! Take 60s to log and protect your streak.`
        : `Outstanding work! All habits complete today. Log your evening journal reflection.`,
      tag: 'pulse-evening-review'
    });
  }
}
