/**
 * CSV Export Utilities for Pulse Life Tracker
 * Safe, client-side data portability with zero external dependencies
 */

const downloadCSV = (filename, csvContent) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const escapeCSV = (val) => {
  if (val === null || val === undefined) return '""';
  const stringVal = String(val);
  return `"${stringVal.replace(/"/g, '""')}"`;
};

/**
 * Export Financial Transactions to CSV based on active selection (Day, Week, Month)
 */
export const exportTransactionsToCSV = (transactions = [], currency = '₹', periodLabel = '') => {
  if (!transactions || transactions.length === 0) {
    alert(`No transactions found for the selected ${periodLabel || 'period'} to export.`);
    return;
  }

  const headers = ['Date', 'Type', 'Category', `Amount (${currency})`, 'Notes'];
  const rows = transactions.map(t => [
    escapeCSV(t.date || ''),
    escapeCSV(t.type || ''),
    escapeCSV(t.category || ''),
    escapeCSV(Number(t.amount || 0).toFixed(2)),
    escapeCSV(t.notes || '')
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  const safePeriod = periodLabel ? periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_') : dateStr;
  downloadCSV(`pulse_transactions_${safePeriod}.csv`, csvContent);
};

/**
 * Export Habits to CSV based on active view (Day, Week, Month, or custom date range)
 */
export const exportHabitsToCSV = (habits = [], isHabitDoneOn = () => false, customDates = null, periodLabel = '') => {
  if (!habits || habits.length === 0) {
    alert('No habits available to export.');
    return;
  }

  // Use custom dates if provided (e.g. 1 day for Day view, 7 days for Week view, full month for Month view)
  let dates = [];
  if (Array.isArray(customDates) && customDates.length > 0) {
    dates = customDates;
  } else {
    // Default: last 30 days columns
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
  }

  const headers = ['Habit Name', 'Category', 'Frequency', ...dates];
  const rows = habits.map(h => {
    const checkins = dates.map(d => (isHabitDoneOn(h.id, d) ? 'Completed' : 'Pending'));
    return [
      escapeCSV(h.name || ''),
      escapeCSV(h.category || 'General'),
      escapeCSV(h.frequency || 'Daily'),
      ...checkins.map(escapeCSV)
    ];
  });

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  const safePeriod = periodLabel ? periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_') : dateStr;
  downloadCSV(`pulse_habits_${safePeriod}.csv`, csvContent);
};

/**
 * Export Tasks to CSV based on active filter (Status, Board Context)
 */
export const exportTasksToCSV = (tasks = [], filterLabel = '') => {
  if (!tasks || tasks.length === 0) {
    alert(`No tasks found for the selected ${filterLabel || 'filter'} to export.`);
    return;
  }

  const headers = ['Task Title', 'Category', 'Priority', 'Status', 'Due Date', 'Notes', 'Created At'];
  const rows = tasks.map(t => [
    escapeCSV(t.title || ''),
    escapeCSV(t.category || 'Work'),
    escapeCSV(t.priority || 'medium'),
    escapeCSV(t.completed ? 'Completed' : 'Pending'),
    escapeCSV(t.due_date || t.dueDate || ''),
    escapeCSV(t.notes || ''),
    escapeCSV(t.created_at || '')
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  const safeLabel = filterLabel ? filterLabel.replace(/[^a-zA-Z0-9_-]/g, '_') : dateStr;
  downloadCSV(`pulse_tasks_${safeLabel}.csv`, csvContent);
};

/**
 * Export Activities to CSV based on active selection (Day, Week, Month)
 */
export const exportActivitiesToCSV = (activities = [], periodLabel = '') => {
  if (!activities || activities.length === 0) {
    alert(`No activities logged for the selected ${periodLabel || 'period'} to export.`);
    return;
  }

  const headers = ['Date', 'Category/Type', 'Title', 'Duration (mins)', 'Details', 'Notes'];
  const rows = activities.map(a => {
    let details = '';
    const actType = a.type || 'gym';
    if (actType === 'gym') {
      const focus = a.sessionFocus ? `Focus: ${a.sessionFocus}` : '';
      const exList = (a.exercises || []).map(e => {
        const setsInfo = (e.setList || []).length > 0
          ? e.setList.map(s => `${s.weightKg}kg x ${s.reps}`).join('; ')
          : `${e.sets || 3} sets x ${e.reps || 10} (${e.weightKg || 0}kg)`;
        return `${e.name} [${setsInfo}]`;
      }).join(' | ');
      details = [focus, exList].filter(Boolean).join(' - ');
    } else if (actType === 'running') {
      details = `Distance: ${a.distanceKm || 0} km, Pace: ${a.pace || ''} min/km, Heart Rate: ${a.heartRateZone || ''}`;
    } else if (actType === 'swimming') {
      details = `Stroke: ${a.stroke || 'Freestyle'}, Laps: ${a.laps || 0}, Pool: ${a.poolLengthMeters || 0}m`;
    } else if (actType === 'sports') {
      details = `Sport: ${a.sportType || ''}, Intensity: ${a.intensity || ''}`;
    } else if (actType === 'reading') {
      const sub = a.readingSubType === 'skill' ? 'Skill' : 'Book';
      const item = a.readingSubType === 'skill' ? (a.skillName || a.moduleName || '') : (a.bookTitle || '');
      const pgs = a.pagesRead ? `, Pages: ${a.pagesRead}` : '';
      details = `${sub}: ${item}${pgs}`;
    }

    return [
      escapeCSV(a.date || ''),
      escapeCSV(actType.toUpperCase()),
      escapeCSV(a.title || ''),
      escapeCSV(a.durationMins || 0),
      escapeCSV(details),
      escapeCSV(a.notes || '')
    ];
  });

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  const safePeriod = periodLabel ? periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_') : dateStr;
  downloadCSV(`pulse_activities_${safePeriod}.csv`, csvContent);
};

/**
 * Export Goals to CSV based on active horizon filter (Short, Long, All)
 */
export const exportGoalsToCSV = (goals = [], horizonLabel = 'all') => {
  if (!goals || goals.length === 0) {
    alert(`No goals available in ${horizonLabel} to export.`);
    return;
  }

  const headers = [
    'Goal Title',
    'Category',
    'Horizon',
    'Current Amount',
    'Target Amount',
    'Unit',
    'Progress (%)',
    'Deadline',
    'Total Milestones',
    'Completed Milestones'
  ];

  const rows = goals.map(g => {
    const current = Number(g.currentAmount) || 0;
    const target = Number(g.targetAmount) || 1;
    const percent = Math.min(100, Math.round((current / target) * 100));
    const subGoals = g.subGoals || [];
    const completedSubs = subGoals.filter(s => s.completed).length;

    return [
      escapeCSV(g.title || ''),
      escapeCSV(g.category || ''),
      escapeCSV(g.horizon === 'short' ? 'Short-Term' : 'Long-Term'),
      escapeCSV(current),
      escapeCSV(target),
      escapeCSV(g.unit || ''),
      escapeCSV(`${percent}%`),
      escapeCSV(g.deadline || ''),
      escapeCSV(subGoals.length),
      escapeCSV(completedSubs)
    ];
  });

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  const safeLabel = horizonLabel ? horizonLabel.replace(/[^a-zA-Z0-9_-]/g, '_') : 'all';
  downloadCSV(`pulse_goals_${safeLabel}_${dateStr}.csv`, csvContent);
};
