import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { getISTDateString } from '../../utils/dateUtils';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, INVESTMENT_CATEGORIES, isSavingAccountCategory, isPreCommitmentsCategory, isSentCategory } from '../../utils/financeUtils';
import { X, Plus, Check, TrendingUp, ArrowDownLeft, ArrowUpRight, ShieldCheck } from 'lucide-react';

export const TransactionModal = ({ isOpen, onClose, onSave, initialData }) => {
  const dashboard = useDashboard() || {};
  const currency = dashboard.currency || '₹';
  const [formData, setFormData] = useState({
    description: '',
    assetName: '',
    amount: '',
    type: 'expense', // 'expense' | 'income' | 'investment'
    category: 'Food',
    date: getISTDateString(),
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          id: initialData.id,
          description: initialData.description || '',
          assetName: initialData.assetName || '',
          amount: initialData.amount ? initialData.amount.toString() : '',
          type: initialData.type || 'expense',
          category: initialData.category || (initialData.type === 'income' ? 'Salary' : initialData.type === 'investment' ? 'Mutual Funds' : 'Food'),
          date: initialData.date || getISTDateString(),
          notes: initialData.notes || ''
        });
      } else {
        setFormData({
          description: '',
          assetName: '',
          amount: '',
          type: 'expense',
          category: 'Food',
          date: getISTDateString(),
          notes: ''
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const rawAmt = parseFloat(formData.amount);
    if (isNaN(rawAmt) || rawAmt <= 0) return;
    const parsedAmt = Math.min(1000000000, Math.max(0.01, rawAmt));

    const payload = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      ...formData,
      amount: parsedAmt,
      date: formData.date || getISTDateString(),
      notes: formData.notes ? formData.notes.trim() : ''
    };

    if (formData.type === 'investment') {
      const desc = formData.assetName.trim() || formData.category;
      onSave({
        ...payload,
        description: desc,
        assetName: formData.assetName.trim()
      });
    } else {
      if (!formData.description.trim()) return;
      onSave({
        ...payload,
        description: formData.description.trim()
      });
    }

    onClose();
  };

  const handleTypeChange = (newType) => {
    let defaultCat = 'Food';
    if (newType === 'income') defaultCat = 'Salary';
    if (newType === 'investment') defaultCat = 'Mutual Funds';

    setFormData({
      ...formData,
      type: newType,
      category: defaultCat
    });
  };

  return (
    <>
      {/* Backdrop: Clicking closes modal */}
      <div
        className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Modal Card: FIXED at top-20 on mobile, centered on sm */}
      <div className="fixed top-20 sm:top-1/2 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 max-w-md mx-auto w-[calc(100%-2rem)] sm:w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-150 max-h-[calc(100vh-6rem)] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-lg">{currency}</span>
            <span>{initialData ? 'Edit Transaction' : 'Log Transaction'}</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">

          
          {/* 3-Way Transaction Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2 px-1 text-xs font-bold rounded-xl border transition flex items-center justify-center space-x-1 cursor-pointer ${
                  formData.type === 'expense'
                    ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Expense (-)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-2 px-1 text-xs font-bold rounded-xl border transition flex items-center justify-center space-x-1 cursor-pointer ${
                  formData.type === 'income'
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Income (+)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('investment')}
                className={`py-2 px-1 text-xs font-bold rounded-xl border transition flex items-center justify-center space-x-1 cursor-pointer ${
                  formData.type === 'investment'
                    ? 'bg-indigo-500/20 text-indigo-700 dark:text-cyan-300 border-indigo-500/40 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Invest (Asset)</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC FIELDS: INVESTMENT vs. EXPENSE/INCOME */}
          {formData.type === 'investment' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Asset / Platform Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nifty 50 Index Fund, Zerodha Stocks, PPF Deposit"
                  value={formData.assetName}
                  onChange={e => setFormData({ ...formData, assetName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Asset Class / Category
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Mutual Funds">📈 Mutual Funds (Equity / Index)</option>
                  <option value="Stocks">📊 Direct Stocks (Zerodha / Groww)</option>
                  <option value="SIP">🔁 Monthly SIP</option>
                  <option value="Gold">🪙 Digital Gold / SGB</option>
                  <option value="Crypto">🌐 Crypto / Web3 Assets</option>
                  <option value="FD / PPF">🏦 Fixed Deposit / PPF / EPF</option>
                  <option value="Real Estate">🏡 Real Estate / REITs</option>
                  <option value="Other Asset">💼 Other Investment</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  placeholder={formData.type === 'income' ? 'e.g. Monthly Salary, Freelance Invoice' : 'e.g. Grocery Mart, Cloud Server Bill, Rent EMI'}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {formData.type === 'income' ? (
                    INCOME_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))
                  ) : (
                    EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))
                  )}
                </select>
                {formData.type === 'expense' && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    {isSavingAccountCategory(formData.category) && 'ℹ️ Saving Account transfers do not deduct from your Living Budget or Net Surplus.'}
                    {isPreCommitmentsCategory(formData.category) && 'ℹ️ Pre Commitments (fixed obligations) deduct from Net Surplus Cash, but DO NOT deduct from your Target Expense Living Budget.'}
                    {isSentCategory(formData.category) && 'ℹ️ Sent transfers deduct from BOTH your Target Expense Living Budget and Net Surplus Cash.'}
                    {!isSavingAccountCategory(formData.category) && !isPreCommitmentsCategory(formData.category) && !isSentCategory(formData.category) && 'ℹ️ Standard living expense: deducts from both your Living Budget and Surplus Cash.'}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="1500.00"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              maxLength={500}
              placeholder="e.g. Transaction reference, units, or remarks"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              {initialData ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{initialData ? 'Save Changes' : 'Log Transaction'}</span>
            </button>
          </div>
        </form>

      </div>
    </>
  );
};

