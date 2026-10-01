import { getISTDateString } from './dateUtils.js';

export const RECURRENCE_OPTIONS = [
  { key: 'none', label: 'Does not repeat (One-time)', short: 'None', emoji: '🚫' },
  { key: 'daily', label: 'Daily (Every day)', short: 'Daily', emoji: '🔁' },
  { key: 'weekdays', label: 'Weekdays (Mon – Fri)', short: 'Weekdays', emoji: '💼' },
  { key: 'weekly', label: 'Weekly (Every week)', short: 'Weekly', emoji: '📅' },
  { key: 'monthly', label: 'Monthly (Every month)', short: 'Monthly', emoji: '🗓️' },
];

/**
 * Calculates the next due date (YYYY-MM-DD) based on the current due date and recurrence rule.
 * Always works in calendar dates without timezone drift.
 * 
 * @param {string} currentDueDateStr - 'YYYY-MM-DD'
 * @param {string} repeatRule - 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly'
 * @returns {string} nextDueDateStr in 'YYYY-MM-DD'
 */
export function calculateNextDueDate(currentDueDateStr, repeatRule) {
  if (!repeatRule || repeatRule === 'none') {
    return currentDueDateStr || getISTDateString();
  }

  // Parse current due date safely as local date
  let baseDate;
  if (currentDueDateStr && /^\d{4}-\d{2}-\d{2}$/.test(currentDueDateStr)) {
    const [y, m, d] = currentDueDateStr.split('-').map(Number);
    baseDate = new Date(y, m - 1, d);
  } else {
    const todayStr = getISTDateString();
    const [y, m, d] = todayStr.split('-').map(Number);
    baseDate = new Date(y, m - 1, d);
  }

  const next = new Date(baseDate.getTime());

  switch (repeatRule) {
    case 'daily': {
      next.setDate(next.getDate() + 1);
      break;
    }
    case 'weekdays': {
      // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
      const dayOfWeek = next.getDay();
      if (dayOfWeek === 5) {
        // Friday -> Next Monday (+3 days)
        next.setDate(next.getDate() + 3);
      } else if (dayOfWeek === 6) {
        // Saturday -> Next Monday (+2 days)
        next.setDate(next.getDate() + 2);
      } else {
        // Sunday (0) through Thursday (4) -> +1 day
        next.setDate(next.getDate() + 1);
      }
      break;
    }
    case 'weekly': {
      next.setDate(next.getDate() + 7);
      break;
    }
    case 'monthly': {
      const currentDay = next.getDate();
      next.setMonth(next.getMonth() + 1);
      // Handle month rollover if next month has fewer days (e.g. Jan 31 -> Feb 28)
      if (next.getDate() !== currentDay) {
        next.setDate(0); // Last day of previous month
      }
      break;
    }
    default:
      return currentDueDateStr || getISTDateString();
  }

  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, '0');
  const d = String(next.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Extracts the repeat rule from task, checking either the native repeat field or notes metadata tag.
 * @param {object} task
 * @returns {string} 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly'
 */
export function extractRepeat(task) {
  if (!task) return 'none';
  if (task.repeat && task.repeat !== 'none') return task.repeat;
  if (task.notes) {
    const match = task.notes.match(/\[repeat:([a-z]+)\]/i);
    if (match && match[1]) {
      const rule = match[1].toLowerCase();
      if (['daily', 'weekdays', 'weekly', 'monthly'].includes(rule)) {
        return rule;
      }
    }
  }
  return 'none';
}

/**
 * Strips out the internal [repeat:xxx] tag from notes for clean user presentation.
 * @param {string} notes
 * @returns {string}
 */
export function cleanNotes(notes) {
  if (!notes) return '';
  return notes.replace(/\s*\[repeat:[a-z]+\]\s*/gi, ' ').trim();
}

/**
 * Formats notes with an embedded [repeat:xxx] tag for database persistence resilience.
 * @param {string} notes
 * @param {string} repeat
 * @returns {string}
 */
export function formatNotesWithRepeat(notes, repeat) {
  const cleaned = cleanNotes(notes);
  if (!repeat || repeat === 'none') {
    return cleaned;
  }
  return cleaned ? `${cleaned} [repeat:${repeat}]` : `[repeat:${repeat}]`;
}
