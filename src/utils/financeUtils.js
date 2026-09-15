/**
 * Finance Categorization & Deduction Utilities
 * 
 * Rules:
 * 1. Living Budget:
 *    - 'Saving Account' & 'Pre Commitments' DO NOT deduct from Target Expense Living Budget.
 *    - 'Sent' & standard expenses (Food, Bills, Shopping, Transport, Entertainment, Health, Education, Personal, Other) DEDUCT from Living Budget.
 * 
 * 2. Leftover / Surplus Cash:
 *    - 'Saving Account' expenses DO NOT deduct from Leftover / Surplus Cash.
 *    - 'Sent', 'Pre Commitments', standard expenses & investments DEDUCT from Leftover / Surplus Cash.
 */

export const EXPENSE_CATEGORIES = [
  { value: 'Food', label: '🍔 Food & Dining' },
  { value: 'Bills', label: '🧾 Bills & Utilities' },
  { value: 'Shopping', label: '🛍️ Shopping & Tech' },
  { value: 'Transport', label: '🚗 Transport & Fuel' },
  { value: 'Entertainment', label: '🎬 Entertainment' },
  { value: 'Health', label: '💊 Health & Wellness' },
  { value: 'Education', label: '📚 Education & Books' },
  { value: 'Personal', label: '✂️ Personal Care' },
  { value: 'Saving Account', label: '🏦 Saving Account (Self Savings Transfer)' },
  { value: 'Sent', label: '💸 Sent (Transfer to Family / Friends)' },
  { value: 'Pre Commitments', label: '🔒 Pre Commitments (Fixed EMI / Rent)' },
  { value: 'Other', label: '💼 Other Expense' }
];

export const INCOME_CATEGORIES = [
  { value: 'Salary', label: '💰 Salary' },
  { value: 'Freelance', label: '💻 Freelance / Consulting' },
  { value: 'Business', label: '🏢 Business Revenue' },
  { value: 'Dividends', label: '📈 Dividends / Interest' },
  { value: 'Other Income', label: '💵 Other Inflow' }
];

export const INVESTMENT_CATEGORIES = [
  { value: 'Mutual Funds', label: '📈 Mutual Funds (Equity / Index)' },
  { value: 'Stocks', label: '📊 Direct Stocks (Zerodha / Groww)' },
  { value: 'SIP', label: '🔁 Monthly SIP' },
  { value: 'Gold', label: '🪙 Digital Gold / SGB' },
  { value: 'Crypto', label: '🌐 Crypto / Web3 Assets' },
  { value: 'FD / PPF', label: '🏦 Fixed Deposit / PPF / EPF' },
  { value: 'Real Estate', label: '🏡 Real Estate / REITs' },
  { value: 'Other Asset', label: '💼 Other Investment' }
];

export const isSavingAccountCategory = (category) => {
  if (!category) return false;
  const c = String(category).trim().toLowerCase();
  return c === 'saving account' || c === 'savings account' || c === 'saving' || c === 'savings' || c === 'self savings';
};

export const isPreCommitmentsCategory = (category) => {
  if (!category) return false;
  const c = String(category).trim().toLowerCase();
  return c === 'pre commitments' || c === 'pre commitment' || c === 'pre-commitments' || c === 'pre-commitment' || c === 'precommitments';
};

export const isSentCategory = (category) => {
  if (!category) return false;
  const c = String(category).trim().toLowerCase();
  return c === 'sent' || c === 'sent transfer' || c === 'transfer sent';
};

/**
 * Does this transaction deduct from the Living Budget?
 * Returns true for standard expenses + 'Sent'.
 * Returns false for 'Saving Account' and 'Pre Commitments'.
 */
export const isLivingBudgetExpense = (tx) => {
  if (!tx || tx.type !== 'expense') return false;
  return !isSavingAccountCategory(tx.category) && !isPreCommitmentsCategory(tx.category);
};

/**
 * Does this transaction deduct from Leftover / Surplus Cash?
 * Returns true for all expenses EXCEPT 'Saving Account' (includes 'Sent', 'Pre Commitments', standard expenses) + all Investments.
 * Returns false for 'Saving Account'.
 */
export const isSurplusDeductible = (tx) => {
  if (!tx) return false;
  if (tx.type === 'investment') return true;
  if (tx.type === 'expense') {
    return !isSavingAccountCategory(tx.category);
  }
  return false;
};

/**
 * Calculates comprehensive finance aggregates for any transaction list
 */
export const calculateFinanceSummary = (txList = [], expenseBudget = 0, investmentGoal = 0) => {
  const list = Array.isArray(txList) ? txList : [];

  // 1. Total Income (Inflow)
  const totalIncome = list
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // 2. Living Expenses (Excludes Saving Account & Pre Commitments, Includes Sent & standard expenses)
  const livingExpenses = list
    .filter(isLivingBudgetExpense)
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // 3. Pre Commitments (Fixed obligations - excluded from Living Budget, deducted from Surplus)
  const preCommitments = list
    .filter(t => t.type === 'expense' && isPreCommitmentsCategory(t.category))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // 4. Saving Account Transfers (Self savings - excluded from Living Budget, NOT deducted from Surplus)
  const savingTransfers = list
    .filter(t => t.type === 'expense' && isSavingAccountCategory(t.category))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // 5. Sent Expenses (Transfers to friends/family - deducted from BOTH Living Budget & Surplus)
  const sentExpenses = list
    .filter(t => t.type === 'expense' && isSentCategory(t.category))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // 6. Total Investments Made
  const totalInvested = list
    .filter(t => t.type === 'investment')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // 7. Total All Expenses (Gross record sum)
  const grossExpenses = list
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // 8. Surplus Outflow (Living Expenses + Pre Commitments + Investments) - excludes Saving Account
  const surplusOutflow = list
    .filter(isSurplusDeductible)
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // 9. Net Leftover / Surplus Cash
  const leftoverCash = totalIncome - surplusOutflow;

  // 10. Living Budget Tracking
  const remainingLivingBudget = expenseBudget - livingExpenses;
  const budgetConsumptionPct = expenseBudget > 0
    ? Math.round((livingExpenses / expenseBudget) * 100)
    : 0;

  return {
    totalIncome,
    livingExpenses,
    preCommitments,
    savingTransfers,
    sentExpenses,
    totalInvested,
    grossExpenses,
    surplusOutflow,
    leftoverCash,
    remainingLivingBudget,
    budgetConsumptionPct
  };
};
