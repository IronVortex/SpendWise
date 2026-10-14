/**
 * Financial and Date Formatting Utilities
 */

/**
 * Formats a number to Indian Rupee (INR) representation
 * Example: 125000 -> ₹1,25,000.00
 */
export function formatINR(amount, options = {}) {
  const { compact = false, showDecimals = true } = options;

  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0.00';
  }

  const num = Number(amount);

  if (compact && Math.abs(num) >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (compact && Math.abs(num) >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0
  }).format(num);
}

/**
 * Formats YYYY-MM to human friendly month name
 * Example: "2026-03" -> "March 2026"
 */
export function formatMonthName(monthKey) {
  if (!monthKey || typeof monthKey !== 'string') return '';
  const [year, month] = monthKey.split('-');
  if (!year || !month) return monthKey;

  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Formats percentage change with sign and color class
 */
export function formatPercentage(pct) {
  if (pct === null || pct === undefined || isNaN(pct)) return { text: '—', color: 'text-slate-400' };

  const num = Number(pct);
  const sign = num > 0 ? '+' : '';
  const text = `${sign}${num.toFixed(1)}%`;

  if (num > 25) {
    return { text, color: 'text-rose-600 font-semibold', bg: 'bg-rose-50 border-rose-200' };
  }
  if (num > 0) {
    return { text, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
  }
  if (num < 0) {
    return { text, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
  }
  return { text: '0.0%', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200' };
}

/**
 * Category color palette for charts and tags
 */
export const CATEGORY_COLORS = {
  'Rent & Housing': '#6366f1',
  'Groceries': '#10b981',
  'Dining Out': '#f43f5e',
  'Utilities & Bills': '#0ea5e9',
  'Transportation': '#f59e0b',
  'Shopping': '#ec4899',
  'Entertainment': '#8b5cf6',
  'Healthcare': '#14b8a6',
  'Travel': '#3b82f6',
  'Education': '#d946ef',
  'Investments': '#84cc16',
  'Miscellaneous': '#64748b'
};

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || '#64748b';
}
