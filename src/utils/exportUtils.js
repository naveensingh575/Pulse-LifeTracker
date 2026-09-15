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
