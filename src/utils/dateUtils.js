/**
 * Universal Local Timezone & Dynamic Calendar Engine
 * Auto-detects device timezone with seamless backward-compatible aliases
 */

// Get user's device local timezone (e.g., "Asia/Kolkata", "America/New_York", "Europe/London")
export const getUserTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (e) {
    return 'UTC';
  }
};

// Detect default currency based on user's device timezone and locale
export const detectDeviceDefaultCurrency = () => {
  try {
    const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase();
    const lang = (navigator.language || (navigator.languages && navigator.languages[0]) || '').toLowerCase();

    // India (INR - ₹)
    if (tz.includes('calcutta') || tz.includes('kolkata') || tz.includes('india') || lang.includes('en-in') || lang.includes('hi')) {
      return '₹';
    }
    // United Kingdom (GBP - £)
    if (tz.includes('london') || tz.includes('belfast') || lang === 'en-gb') {
      return '£';
    }
    // Japan (JPY - ¥)
    if (tz.includes('tokyo') || lang.includes('ja')) {
      return '¥';
    }
    // Canada (CAD - C$)
    if (
      tz.includes('toronto') || tz.includes('vancouver') || tz.includes('montreal') ||
      tz.includes('edmonton') || tz.includes('winnipeg') || tz.includes('halifax') ||
      lang.includes('en-ca') || lang.includes('fr-ca')
    ) {
      return 'C$';
    }
    // Australia (AUD - A$)
    if (
      tz.includes('sydney') || tz.includes('melbourne') || tz.includes('brisbane') ||
      tz.includes('perth') || tz.includes('adelaide') || tz.includes('australia') ||
      lang.includes('en-au')
    ) {
      return 'A$';
    }
    // UAE / Middle East (AED)
    if (tz.includes('dubai') || tz.includes('muscat') || lang.includes('ar-ae')) {
      return 'AED';
    }
    // Europe (EUR - €)
    if (
      tz.includes('paris') || tz.includes('berlin') || tz.includes('madrid') || tz.includes('rome') ||
      tz.includes('amsterdam') || tz.includes('brussels') || tz.includes('vienna') || tz.includes('dublin') ||
      tz.includes('athens') || tz.includes('lisbon') || tz.includes('helsinki') || tz.includes('europe') ||
      lang.includes('fr-') || lang.includes('de-') || lang.includes('es-') || lang.includes('it-') || lang.includes('nl-')
    ) {
      return '€';
    }
  } catch (e) {
    // fallback
  }

  // Americas & international default
  return '$';
};

// Returns a Date object representing the current local date
export const getLocalDate = (date = new Date()) => {
  return typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
};

// Returns YYYY-MM-DD formatted string in user's local timezone
export const getLocalDateString = (date = new Date()) => {
  const d = getLocalDate(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Backward-compatible aliases
export const getISTDate = getLocalDate;
export const getISTDateString = getLocalDateString;

// Returns yesterday's date string
export const getYesterdayDateString = () => {
  const d = getLocalDate();
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
};

// Calculate difference in calendar days (dateStrA - dateStrB)
export const getLocalDateDiffDays = (dateStrA, dateStrB) => {
  if (!dateStrA || !dateStrB || typeof dateStrA !== 'string' || typeof dateStrB !== 'string') {
    return 0;
  }
  try {
    const partsA = dateStrA.split('-');
    const partsB = dateStrB.split('-');
    if (partsA.length < 3 || partsB.length < 3) return 0;
    const [y1, m1, d1] = partsA.map(Number);
    const [y2, m2, d2] = partsB.map(Number);
    if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return 0;
    const dateA = new Date(y1, m1 - 1, d1);
    const dateB = new Date(y2, m2 - 1, d2);
    const diffTime = dateA.getTime() - dateB.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 0;
  }
};

export const getISTDateDiffDays = getLocalDateDiffDays;

// Helper to get start of Monday for a given week
export const getMondayOfWeek = (refDate = new Date()) => {
  const d = getLocalDate(refDate);
  const dayOfWeek = d.getDay(); // 0 is Sun, 1 is Mon, 6 is Sat
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(d);
  monday.setDate(d.getDate() + distanceToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

// Check if a date is editable: all days of Last Week + this week up to Today
export const isDateEditable = (dateStr) => {
  const todayStr = getLocalDateString();
  
  // Future dates (tomorrow onward) are strictly disabled
  if (dateStr > todayStr) return false;

  // Calculate Monday of last week
  const currentMonday = getMondayOfWeek();
  const lastWeekMonday = new Date(currentMonday);
  lastWeekMonday.setDate(currentMonday.getDate() - 7);
  const lastWeekMondayStr = getLocalDateString(lastWeekMonday);

  // Editable if between Last Week's Monday and Today
  return dateStr >= lastWeekMondayStr && dateStr <= todayStr;
};

// Returns current year and month (1-12)
export const getLocalYearMonth = (date = new Date()) => {
  const d = getLocalDate(date);
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1, // 1-indexed (1 = Jan, 12 = Dec)
    day: d.getDate()
  };
};

export const getISTYearMonth = getLocalYearMonth;

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_NAMES_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_NAMES_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export { MONTH_NAMES_SHORT, MONTH_NAMES_FULL, DAY_NAMES_SHORT, DAY_NAMES_FULL };

// Calculate ISO Week Number
export const getISOWeekNumber = (refDate = new Date()) => {
  const d = getLocalDate(refDate);
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
};

// Get 7 days of the active week (Monday to Sunday)
export const getLocalWeekDays = (refDate = new Date()) => {
  const monday = getMondayOfWeek(refDate);
  const todayStr = getLocalDateString();

  return Array.from({ length: 7 }).map((_, idx) => {
    const current = new Date(monday);
    current.setDate(monday.getDate() + idx);
    const dateStr = getLocalDateString(current);
    const isToday = dateStr === todayStr;
    const isPast = dateStr < todayStr;
    const isFuture = dateStr > todayStr;
    const isEditable = isDateEditable(dateStr);

    return {
      dateStr,
      dayNumber: current.getDate(),
      dayNameShort: DAY_NAMES_SHORT[idx],
      dayNameFull: DAY_NAMES_FULL[idx],
      monthShort: MONTH_NAMES_SHORT[current.getMonth()],
      monthFull: MONTH_NAMES_FULL[current.getMonth()],
      year: current.getFullYear(),
      isToday,
      isPast,
      isFuture,
      isEditable,
      dayIndex: idx
    };
  });
};

export const getISTWeekDays = getLocalWeekDays;

// Get formatted week badge, e.g. "Week 35 • Aug 24 – Aug 30, 2026"
export const getLocalWeekBadge = (refDate = new Date()) => {
  const weekDays = getLocalWeekDays(refDate);
  const weekNum = getISOWeekNumber(refDate);
  const firstDay = weekDays[0];
  const lastDay = weekDays[6];

  const firstMonth = firstDay.monthShort;
  const lastMonth = lastDay.monthShort;
  const year = lastDay.year;

  const dateRange = firstMonth === lastMonth
    ? `${firstMonth} ${firstDay.dayNumber} – ${lastDay.dayNumber}, ${year}`
    : `${firstMonth} ${firstDay.dayNumber} – ${lastMonth} ${lastDay.dayNumber}, ${year}`;

  return `Week ${weekNum} • ${dateRange}`;
};

export const getISTWeekBadge = getLocalWeekBadge;

// Get weekday index (0=Mon, 1=Tue, ..., 6=Sun) for a YYYY-MM-DD date string
// Matches DAY_NAMES_SHORT ordering: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const getWeekdayIndex = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return 0;
  const parts = dateStr.split('-');
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const jsDay = d.getDay(); // JS: 0=Sun, 1=Mon, ..., 6=Sat
  return jsDay === 0 ? 6 : jsDay - 1; // Convert to 0=Mon, 6=Sun
};

// Get days count for a given month/year
export const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

// Generate full dynamic calendar grid for a given year & month (1-indexed month)
export const getMonthCalendarGrid = (year, month) => {
  const todayStr = getLocalDateString();
  const totalDays = getDaysInMonth(year, month);
  
  // First day of this month
  const firstDate = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstDate.getDay(); // 0 is Sun, 1 is Mon...
  const startPadding = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const days = [];

  // Previous month padding days
  if (startPadding > 0) {
    const prevMonthDays = getDaysInMonth(month === 1 ? year - 1 : year, month === 1 ? 12 : month - 1);
    for (let i = startPadding - 1; i >= 0; i--) {
      const pDay = prevMonthDays - i;
      const pMonth = month === 1 ? 12 : month - 1;
      const pYear = month === 1 ? year - 1 : year;
      const dateStr = `${pYear}-${String(pMonth).padStart(2, '0')}-${String(pDay).padStart(2, '0')}`;
      days.push({
        dayNumber: pDay,
        dateStr,
        isCurrentMonth: false,
        isPadding: true,
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
        isFuture: dateStr > todayStr,
        isEditable: false
      });
    }
  }

  // Current month active days
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dateObj = new Date(year, month - 1, d);
    const dayOfWeek = (dateObj.getDay() + 6) % 7; // Monday = 0

    days.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: true,
      isPadding: false,
      isToday: dateStr === todayStr,
      isPast: dateStr < todayStr,
      isFuture: dateStr > todayStr,
      isEditable: isDateEditable(dateStr),
      dayOfWeek,
      dayNameShort: DAY_NAMES_SHORT[dayOfWeek]
    });
  }

  // Trailing padding days to fill 7-col grid if needed
  const totalCells = days.length;
  const remainingPadding = (7 - (totalCells % 7)) % 7;
  for (let t = 1; t <= remainingPadding; t++) {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(t).padStart(2, '0')}`;
    days.push({
      dayNumber: t,
      dateStr,
      isCurrentMonth: false,
      isPadding: true,
      isToday: dateStr === todayStr,
      isPast: dateStr < todayStr,
      isFuture: dateStr > todayStr,
      isEditable: false
    });
  }

  return days;
};

// Format a date string into readable display format, e.g. "Friday, Aug 28, 2026"
export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts.map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dayName = DAY_NAMES_FULL[(dateObj.getDay() + 6) % 7];
  const monthName = MONTH_NAMES_SHORT[m - 1];
  return `${dayName}, ${monthName} ${d}, ${y}`;
};

export const formatISTDisplayDate = formatDisplayDate;

/**
 * Calculate habit streak with Smart Streak Shield (1-day grace recovery)
 * @param {Record<string, boolean>|Array<{completed_at: string}>} completionsMap 
 * @param {string} [createdAt]
 */
export const calculateHabitStreakWithShield = (completionsMap = {}, createdAt) => {
  // Normalize completions into an object map { "YYYY-MM-DD": true } if passed as array
  let completions = {};
  if (Array.isArray(completionsMap)) {
    completionsMap.forEach(item => {
      const d = typeof item === 'string' ? item : item.completed_at;
      if (d) completions[d] = true;
    });
  } else if (completionsMap && typeof completionsMap === 'object') {
    completions = completionsMap;
  }

  const today = getISTDate();
  let streak = 0;
  let shieldActive = false;
  let checkDate = new Date(today);

  const todayStr = getISTDateString(checkDate);
  const isDoneToday = Boolean(completions[todayStr]);

  if (isDoneToday) {
    streak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // Today not logged yet — inspect yesterday
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = getISTDateString(checkDate);
    if (!completions[yesterdayStr]) {
      return { streak: 0, shieldActive: false };
    }
  }

  // Iterate backwards through past days
  const cleanCreatedAt = createdAt ? String(createdAt).slice(0, 10) : null;
  let usedGraceDay = false;
  while (true) {
    const dateStr = getISTDateString(checkDate);
    if (cleanCreatedAt && dateStr < cleanCreatedAt) break;

    if (completions[dateStr]) {
      streak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (!usedGraceDay) {
      // 🛡️ Smart Streak Shield: allow 1 missed gap day if the day before it was completed!
      const priorDate = new Date(checkDate);
      priorDate.setDate(priorDate.getDate() - 1);
      const priorDateStr = getISTDateString(priorDate);

      if (completions[priorDateStr]) {
        usedGraceDay = true;
        shieldActive = true;
        checkDate.setDate(checkDate.getDate() - 1); // skip the missed day
      } else {
        break; // 2 consecutive missed days breaks the streak
      }
    } else {
      break;
    }
  }

  return { streak, shieldActive };
};

export const calculateHabitStreak = (completionsMap = {}, createdAt) => {
  return calculateHabitStreakWithShield(completionsMap, createdAt).streak;
};

// --- Weekly Habit Schedule & Frequency Utilities ---
export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

export const parseActiveDays = (frequency) => {
  if (!frequency || frequency === 'daily' || frequency === 'Daily') {
    return ALL_DAYS;
  }
  const parts = frequency.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n >= 0 && n <= 6);
  return parts.length > 0 ? parts : ALL_DAYS;
};

export const encodeActiveDays = (activeDays) => {
  if (!activeDays || activeDays.length === 0 || activeDays.length === 7) return 'daily';
  return [...activeDays].sort((a, b) => a - b).join(',');
};

export const isHabitActiveOnDate = (habit, dateStr) => {
  if (!habit || !dateStr) return false;
  // If habit has a recorded completion on this date, it is ALWAYS active on this date!
  if (habit.completions && Boolean(habit.completions[dateStr])) return true;

  // Check if date is prior to creation date (only if explicitly set)
  if (habit.createdAt) {
    const cleanCreatedAt = String(habit.createdAt).slice(0, 10);
    if (dateStr < cleanCreatedAt) return false;
  }

  const activeDays = habit.activeDays || ALL_DAYS;
  const weekdayIdx = getWeekdayIndex(dateStr);
  return activeDays.includes(weekdayIdx);
};


