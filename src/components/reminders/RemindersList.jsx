import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { getISTDateString, getISTDateDiffDays } from '../../utils/dateUtils';
import { Clock, Plus, AlertTriangle, Trash2, Tag } from 'lucide-react';

export const RemindersList = () => {
  const { deadlines, addDeadline, deleteDeadline } = useDashboard();

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: getISTDateString(),
    category: 'Work',
    tag: '',
    priority: 'medium'
  });

  // Calculate days remaining helper in IST
  const getDaysDiff = (dateStr) => {
    return getISTDateDiffDays(getISTDateString(), dateStr);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    addDeadline(formData);
    setFormData({
      title: '',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'Work',
      tag: '',
      priority: 'medium'
    });
    setShowAddForm(false);
  };

  return (
    <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Reminders & Deadlines</h3>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-300 dark:border-slate-700 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Close' : 'Quick Add'}</span>
        </button>
      </div>

      {/* Quick Add Form Dropdown */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-3 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
          <div>
            <input
              type="text"
              required
              placeholder="Deadline Title (e.g. Quarterly Tax Filing)"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <input
              type="date"
              required
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              placeholder="Tag (e.g. ₹15,000 Tax)"
              value={formData.tag}
              onChange={e => setFormData({ ...formData, tag: e.target.value })}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="Finance">Finance</option>
              <option value="Work">Work</option>
              <option value="Health">Health</option>
              <option value="Personal">Personal</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition shadow-sm"
            >
              Save Deadline
            </button>
          </div>
        </form>
      )}

      {/* Deadline Items List */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {deadlines.map((item) => {
          const daysLeft = getDaysDiff(item.date);
          const isUrgent = daysLeft >= 0 && daysLeft <= 3;
          const isOverdue = daysLeft < 0;

          return (
            <div
              key={item.id}
              className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                isUrgent
                  ? 'bg-amber-500/10 border-amber-500/30 shadow-sm'
                  : isOverdue
                  ? 'bg-rose-500/10 border-rose-500/30'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    {new Date(item.date).toLocaleDateString('en-IN', { month: 'short' })}
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                    {new Date(item.date).getDate()}
                  </span>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{item.title}</h4>
                    {isUrgent && (
                      <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 text-[10px] font-bold animate-pulse">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>URGENT ({daysLeft === 0 ? 'Today' : `${daysLeft}d left`})</span>
                      </span>
                    )}
                    {isOverdue && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                        OVERDUE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                      <Tag className="w-2.5 h-2.5 text-slate-400" />
                      {item.category}
                    </span>
                    {item.tag && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {item.tag}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => deleteDeadline(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                  title="Delete Deadline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
