import React, { useState } from 'react';
import { getISTDateString, getISTDate, getISTYearMonth, getISTDateDiffDays } from '../../utils/dateUtils';
import { isLivingBudgetExpense, EXPENSE_CATEGORIES } from '../../utils/financeUtils';
import { Wallet, ArrowUpRight, Plus, X, Clock, AlertTriangle, Trash2, Tag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../../context/DashboardContext';

export const FinanceDeadlinePulse = () => {
  const dashboard = useDashboard() || {};
  const {
    transactions = [],
    addTransaction = () => {},
    getMonthlyAllocation = () => ({ expenseBudget: 0, investmentGoal: 0 }),
    currency = '₹',
    formatCurrency = (val) => `${currency}${Number(val || 0).toLocaleString()}`,
    deadlines = [],
    addDeadline = () => {},
    deleteDeadline = () => {}
  } = dashboard;

  const todayStr = getISTDateString();
  const currentISTYM = getISTYearMonth();
  const currentMonthKey = `${currentISTYM.year}-${String(currentISTYM.month).padStart(2, '0')}`;
  const activeAllocation = (getMonthlyAllocation && getMonthlyAllocation(currentMonthKey)) || { expenseBudget: 0, investmentGoal: 0 };
  const monthlyBudgetCap = Number(activeAllocation?.expenseBudget) || 0;
  
  const monthExpenses = transactions
    .filter(t => t.date && t.date.startsWith(currentMonthKey) && isLivingBudgetExpense(t))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    
  const todayExpenses = transactions
    .filter(t => t.date === todayStr && isLivingBudgetExpense(t))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    
  const safeDailyPace = monthlyBudgetCap > 0 ? (monthlyBudgetCap / 31) : 0;
  const remainingBudget = monthlyBudgetCap - monthExpenses;
  const consumptionPct = monthlyBudgetCap > 0 ? Math.round((monthExpenses / monthlyBudgetCap) * 100) : 0;

  const getHealthColor = (pct) => {
    if (pct > 90) return { bar: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' };
    if (pct >= 70) return { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' };
    return { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' };
  };
  const colorStyle = getHealthColor(consumptionPct);

  // Quick Expense Modal State
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const [quickDesc, setQuickDesc] = useState('');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickCategory, setQuickCategory] = useState('Food');

  const handleQuickExpenseSubmit = (e) => {
    e.preventDefault();
    const parsed = parseFloat(quickAmount);
    if (isNaN(parsed) || parsed <= 0 || !quickDesc.trim()) return;
    addTransaction({
      description: quickDesc.trim(),
      amount: parsed,
      type: 'expense',
      category: quickCategory,
      date: todayStr,
      notes: 'Quick expense from My Pulse'
    });
    setQuickDesc('');
    setQuickAmount('');
    setIsQuickExpenseOpen(false);
  };

  // Deadlines State
  const getDaysDiff = (dateStr) => getISTDateDiffDays(getISTDateString(), dateStr);

  const sortedDeadlines = [...deadlines]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', date: getISTDateString(), category: 'Work', tag: '', priority: 'medium'
  });

  const handleDeadlineSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    addDeadline(formData);
    setFormData({
      title: '', 
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'Work', tag: '', priority: 'medium'
    });
    setShowAddForm(false);
  };

  return (
    <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm relative">
      {/* Finance Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Wallet size={16} />
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Cash Flow</h2>
          </div>
          <button
            onClick={() => setIsQuickExpenseOpen(true)}
            className="hidden sm:flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <Plus size={14} /> Quick Expense
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1">Monthly Budget</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-xl font-bold ${colorStyle.text}`}>{formatCurrency(monthExpenses)}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/ {formatCurrency(monthlyBudgetCap)}</span>
              </div>
            </div>
            <div className={`px-2 py-1 rounded-lg text-xs font-bold ${colorStyle.badge}`}>
              {consumptionPct}% Used
            </div>
          </div>

          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${colorStyle.bar}`} 
              style={{ width: `${Math.min(consumptionPct, 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Remaining</p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(remainingBudget)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Daily Pace ({formatCurrency(safeDailyPace)}/d)</p>
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(todayExpenses)}</span>
                {todayExpenses > safeDailyPace && (
                  <ArrowUpRight size={12} className="text-rose-500" />
                )}
              </div>
            </div>
          </div>
        </div>

        <button
            onClick={() => setIsQuickExpenseOpen(true)}
            className="sm:hidden w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium text-xs border border-indigo-500/20 active:bg-indigo-500/20 transition-colors"
          >
            <Plus size={14} /> Add Expense
        </button>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800" />

      {/* Deadlines Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Clock size={16} />
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Upcoming Deadlines</h2>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <Plus size={14} /> Quick Add
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleDeadlineSubmit} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <input
              type="text"
              placeholder="Task title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              style={{ fontSize: '16px' }}
              required
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                style={{ fontSize: '16px' }}
                required
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                style={{ fontSize: '16px' }}
              >
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Finance">Finance</option>
                <option value="Health">Health</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tag (optional)"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                style={{ fontSize: '16px' }}
              />
              <button
                type="submit"
                disabled={!formData.title.trim()}
                className="px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {sortedDeadlines.length > 0 ? (
            sortedDeadlines.map((deadline) => {
              const diffDays = getDaysDiff(deadline.date);
              const isUrgent = diffDays >= 0 && diffDays <= 3;
              const isOverdue = diffDays < 0;
              const deadlineDate = getISTDate(deadline.date);
              const monthAbbrev = deadlineDate.toLocaleString('default', { month: 'short' });
              const dayNum = deadlineDate.getDate();

              return (
                <div key={deadline.id} className="group flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-colors">
                  <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg shrink-0 border ${
                    isOverdue ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800/50 text-rose-600 dark:text-rose-400' :
                    isUrgent ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50 text-amber-600 dark:text-amber-400' :
                    'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    <span className="text-[10px] uppercase font-bold tracking-wider">{monthAbbrev}</span>
                    <span className="text-sm font-bold leading-none">{dayNum}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{deadline.title}</h3>
                      {isOverdue && <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">OVERDUE</span>}
                      {isUrgent && !isOverdue && <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">SOON</span>}
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                        {deadline.category}
                      </span>
                      {deadline.tag && (
                        <span className="flex items-center gap-0.5 text-slate-500 dark:text-slate-400">
                          <Tag size={10} /> {deadline.tag}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteDeadline(deadline.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    title="Delete deadline"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          ) : (
             <div className="text-center py-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">No upcoming deadlines.</p>
            </div>
          )}
          
          {deadlines.length > 3 && (
            <div className="flex justify-center mt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                + {deadlines.length - 3} more
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Expense Modal */}
      {isQuickExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Quick Expense</h3>
              <button 
                onClick={() => setIsQuickExpenseOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleQuickExpenseSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Description</label>
                <input
                  type="text"
                  value={quickDesc}
                  onChange={(e) => setQuickDesc(e.target.value)}
                  placeholder="What did you buy?"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  style={{ fontSize: '16px' }}
                  autoFocus
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Amount ({currency})</label>
                  <input
                    type="number"
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    style={{ fontSize: '16px' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Category</label>
                  <select
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 appearance-none"
                    style={{ fontSize: '16px' }}
                  >
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={!quickDesc.trim() || !quickAmount || isNaN(parseFloat(quickAmount))}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-indigo-600 flex items-center justify-center gap-2 mt-2"
              >
                <Plus size={16} />
                Save Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
