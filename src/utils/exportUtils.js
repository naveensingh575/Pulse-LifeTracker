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
 * Export Financial Transactions to CSV
 */
export const exportTransactionsToCSV = (transactions = [], currency = '₹') => {
  if (!transactions || transactions.length === 0) {
    alert('No transactions available to export.');
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
  downloadCSV(`pulse_transactions_${dateStr}.csv`, csvContent);
};

/**
 * Export Habits to CSV
 */
export const exportHabitsToCSV = (habits = [], isHabitDoneOn = () => false) => {
  if (!habits || habits.length === 0) {
    alert('No habits available to export.');
    return;
  }

  // Generate last 30 days columns
  const dates = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const headers = ['Habit Name', 'Category', 'Target Frequency', ...dates];
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
  downloadCSV(`pulse_habits_history_${dateStr}.csv`, csvContent);
};

/**
 * Export Tasks to CSV
 */
export const exportTasksToCSV = (tasks = []) => {
  if (!tasks || tasks.length === 0) {
    alert('No tasks available to export.');
    return;
  }

  const headers = ['Task Title', 'Priority', 'Status', 'Due Date', 'Created At'];
  const rows = tasks.map(t => [
    escapeCSV(t.title || ''),
    escapeCSV(t.priority || 'medium'),
    escapeCSV(t.completed ? 'Completed' : 'Pending'),
    escapeCSV(t.due_date || t.dueDate || ''),
    escapeCSV(t.created_at || '')
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(`pulse_tasks_${dateStr}.csv`, csvContent);
};

/**
 * Export Activities to CSV
 */
export const exportActivitiesToCSV = (activities = []) => {
  if (!activities || activities.length === 0) {
    alert('No activities available to export.');
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
  downloadCSV(`pulse_activities_${dateStr}.csv`, csvContent);
};

/**
 * Export Goals to CSV
 */
export const exportGoalsToCSV = (goals = []) => {
  if (!goals || goals.length === 0) {
    alert('No goals available to export.');
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
  downloadCSV(`pulse_goals_${dateStr}.csv`, csvContent);
};
