/**
 * IST (Indian Standard Time - Asia/Kolkata / UTC+05:30) Timezone & Calendar Engine
 */

// Format any date into IST Date representation
export const getISTDate = (date = new Date()) => {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  // Convert to IST (UTC + 5.5 hours)
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const istOffset = 5.5 * 60 * 60000;
  return new Date(utc + istOffset);
};

// Returns YYYY-MM-DD formatted string in IST
export const getISTDateString = (date = new Date()) => {
  const ist = getISTDate(date);
  const year = ist.getFullYear();
  const month = String(ist.getMonth() + 1).padStart(2, '0');
  const day = String(ist.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Returns yesterday's date string in IST
export const getYesterdayDateString = () => {
  const ist = getISTDate();
  ist.setDate(ist.getDate() - 1);
  return getISTDateString(ist);
};

// Calculate difference in calendar days (dateStrA - dateStrB)
export const getISTDateDiffDays = (dateStrA, dateStrB) => {
  const [y1, m1, d1] = dateStrA.split('-').map(Number);
  const [y2, m2, d2] = dateStrB.split('-').map(Number);
  const dateA = new Date(y1, m1 - 1, d1);
  const dateB = new Date(y2, m2 - 1, d2);
  const diffTime = dateA.getTime() - dateB.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

// Helper to get start of Monday for a given week in IST
export const getMondayOfWeek = (refDate = new Date()) => {
  const ist = getISTDate(refDate);
  const dayOfWeek = ist.getDay(); // 0 is Sun, 1 is Mon, 6 is Sat
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(ist);
  monday.setDate(ist.getDate() + distanceToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

// Check if a date is editable: all days of Last Week + this week up to Today
export const isDateEditable = (dateStr) => {
  const todayStr = getISTDateString();
  
  // Future dates (tomorrow onward) are strictly disabled
  if (dateStr > todayStr) return false;

  // Calculate Monday of last week in IST
  const currentMonday = getMondayOfWeek();
  const lastWeekMonday = new Date(currentMonday);
  lastWeekMonday.setDate(currentMonday.getDate() - 7);
  const lastWeekMondayStr = getISTDateString(lastWeekMonday);

  // Editable if between Last Week's Monday and Today
  return dateStr >= lastWeekMondayStr && dateStr <= todayStr;
};

// Returns current year and month (1-12) in IST
export const getISTYearMonth = (date = new Date()) => {
  const ist = getISTDate(date);
  return {
    year: ist.getFullYear(),
    month: ist.getMonth() + 1, // 1-indexed (1 = Jan, 12 = Dec)
    day: ist.getDate()
  };
};

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_NAMES_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_NAMES_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export { MONTH_NAMES_SHORT, MONTH_NAMES_FULL, DAY_NAMES_SHORT, DAY_NAMES_FULL };

// Calculate ISO Week Number in IST
export const getISOWeekNumber = (refDate = new Date()) => {
  const ist = getISTDate(refDate);
  const d = new Date(Date.UTC(ist.getFullYear(), ist.getMonth(), ist.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// Get 7 days of the active week in IST (Monday to Sunday)
export const getISTWeekDays = (refDate = new Date()) => {
  const monday = getMondayOfWeek(refDate);
  const todayStr = getISTDateString();

  return Array.from({ length: 7 }).map((_, idx) => {
    const current = new Date(monday);
    current.setDate(monday.getDate() + idx);
    const dateStr = getISTDateString(current);
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

// Get formatted week badge, e.g. "Week 35 • Aug 24 – Aug 30, 2026"
export const getISTWeekBadge = (refDate = new Date()) => {
  const weekDays = getISTWeekDays(refDate);
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

// Get days count for a given month/year
export const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

// Generate full dynamic calendar grid for a given year & month (1-indexed month)
export const getMonthCalendarGrid = (year, month) => {
  const todayStr = getISTDateString();
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

// Format a date string into readable IST display format, e.g. "Friday, Aug 28, 2026"
export const formatISTDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts.map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dayName = DAY_NAMES_FULL[(dateObj.getDay() + 6) % 7];
  const monthName = MONTH_NAMES_SHORT[m - 1];
  return `${dayName}, ${monthName} ${d}, ${y}`;
};
