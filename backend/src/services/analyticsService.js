/**
 * Analytics Engine for Personal Expense Pattern Analysis
 * Computes monthly totals, category breakdowns, MoM comparisons,
 * and detects strictly > 25% expenditure increases to trigger budgeting alerts.
 */

const config = require('../config/config');

/**
 * Returns contextual, actionable financial advice based on category and spike rate
 */
function generateRecommendation(category, percentIncrease, currentAmount, diff) {
  const pctStr = `${percentIncrease.toFixed(1)}%`;
  const diffStr = `₹${diff.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  switch (category.toLowerCase()) {
    case 'dining out':
      return `Spending surged by ${pctStr} (+${diffStr}). Try meal-prepping for 3 weekdays, limit food delivery apps, and set a weekly restaurant cap.`;
    case 'shopping':
      return `Discretionary shopping jumped by ${pctStr} (+${diffStr}). Implement a 48-hour cooling rule before checkout and avoid impulse festive sales.`;
    case 'groceries':
      return `Grocery bills rose by ${pctStr} (+${diffStr}). Audit supermarket slips, buy non-perishable pantry staples in bulk, and stick to a shopping checklist.`;
    case 'entertainment':
      return `Entertainment spend spiked by ${pctStr}. Audit active OTT / gaming subscriptions, cancel unused services, and look for free leisure activities.`;
    case 'utilities & bills':
      return `Utility expenses grew by ${pctStr} (+${diffStr}). Check electricity/AC usage during peak hours, fix water leaks, and verify meter reading accuracy.`;
    case 'transportation':
      return `Transit costs escalated by ${pctStr}. Combine errands into single trips, compare ride-hailing fares with metro/buses, or explore carpooling options.`;
    case 'travel':
      return `Travel expenditure rose by ${pctStr}. Plan holiday bookings at least 4-6 weeks early and set a daily trip budget cap.`;
    case 'healthcare':
      return `Medical costs increased by ${pctStr}. Keep pharmacy bills organized for insurance reimbursement and compare generic medicine equivalents.`;
    case 'rent & housing':
      return `Housing expenses increased by ${pctStr}. Check for one-time repair charges or lease revisions; budget for periodic maintenance.`;
    default:
      return `${category} increased by ${pctStr} (+${diffStr}). Review recent receipts to identify non-recurring items and rebalance next month's allocation.`;
  }
}

/**
 * Groups expenses by Month (YYYY-MM) and Category
 */
function aggregateExpensesByMonthAndCategory(expenses) {
  if (!Array.isArray(expenses) || expenses.length === 0) {
    return {
      monthlyCategoryMap: {},
      months: [],
      categories: [],
      monthlyTotals: {}
    };
  }

  const monthlyCategoryMap = {}; // { "2026-01": { "Groceries": 4500, ... } }
  const monthlyTotals = {}; // { "2026-01": 25000 }
  const monthSet = new Set();
  const categorySet = new Set();

  for (const exp of expenses) {
    if (!exp || !exp.monthKey || typeof exp.amount !== 'number') continue;

    const m = exp.monthKey;
    const cat = exp.category;
    const amt = exp.amount;

    monthSet.add(m);
    categorySet.add(cat);

    if (!monthlyCategoryMap[m]) {
      monthlyCategoryMap[m] = {};
      monthlyTotals[m] = 0;
    }
    monthlyCategoryMap[m][cat] = (monthlyCategoryMap[m][cat] || 0) + amt;
    monthlyTotals[m] = (monthlyTotals[m] || 0) + amt;
  }

  const months = Array.from(monthSet).sort(); // Chronological order
  const categories = Array.from(categorySet).sort();

  return {
    monthlyCategoryMap,
    months,
    categories,
    monthlyTotals
  };
}

/**
 * Computes Month-on-Month comparison across all categories and months
 */
function computeMonthlyComparison(expenses) {
  const { monthlyCategoryMap, months, categories, monthlyTotals } =
    aggregateExpensesByMonthAndCategory(expenses);

  if (months.length === 0) {
    return {
      months: [],
      categories: [],
      monthlyTotals: {},
      matrix: [],
      categorySummaries: []
    };
  }

  // Build matrix rows for each category
  const matrix = categories.map(category => {
    const monthValues = {};
    let totalAllTime = 0;

    months.forEach((m, idx) => {
      const current = monthlyCategoryMap[m]?.[category] || 0;
      totalAllTime += current;

      let prev = 0;
      let percentChange = null;
      let diff = 0;
      let isIncrease = false;
      let isAlert = false;

      if (idx > 0) {
        const prevMonth = months[idx - 1];
        prev = monthlyCategoryMap[prevMonth]?.[category] || 0;
        diff = current - prev;

        if (prev > 0) {
          percentChange = ((current - prev) / prev) * 100;
          isIncrease = percentChange > 0;
          isAlert = percentChange > config.budgetAlertThresholdPercent;
        } else if (prev === 0 && current > 0) {
          // Zero previous-month spending edge case: newly introduced expense
          percentChange = 100.0;
          isIncrease = true;
          isAlert = true; // Spending went from 0 to positive amount
        } else {
          percentChange = 0;
        }
      }

      monthValues[m] = {
        amount: Math.round(current * 100) / 100,
        previousAmount: Math.round(prev * 100) / 100,
        difference: Math.round(diff * 100) / 100,
        percentChange: percentChange !== null ? Math.round(percentChange * 10) / 10 : null,
        isAlert,
        isZeroPrev: prev === 0 && current > 0
      };
    });

    return {
      category,
      total: Math.round(totalAllTime * 100) / 100,
      monthly: monthValues
    };
  });

  return {
    months,
    categories,
    monthlyTotals,
    matrix
  };
}

/**
 * Generates budgeting alerts strictly where spending increased by > 25% MoM
 */
function generateBudgetAlerts(expenses) {
  const comparison = computeMonthlyComparison(expenses);
  const { months, matrix } = comparison;

  if (months.length < 2) {
    return {
      thresholdPercent: config.budgetAlertThresholdPercent,
      totalAlerts: 0,
      currentMonthAlerts: 0,
      alerts: []
    };
  }

  const alerts = [];
  const latestMonth = months[months.length - 1];

  // Evaluate month transitions chronologically
  for (let i = 1; i < months.length; i++) {
    const prevMonth = months[i - 1];
    const currMonth = months[i];

    for (const row of matrix) {
      const data = row.monthly[currMonth];
      if (!data || !data.isAlert) continue;

      const prevAmount = data.previousAmount;
      const currAmount = data.amount;
      const pct = data.percentChange;
      const diff = data.difference;

      // Severity rating based on jump
      let severity = 'warning'; // 25% - 50%
      if (pct > 75) {
        severity = 'critical'; // > 75%
      } else if (pct > 50) {
        severity = 'high'; // 50% - 75%
      }

      alerts.push({
        id: `alert_${currMonth}_${row.category.replace(/\s+/g, '_')}`,
        category: row.category,
        previousMonth: prevMonth,
        currentMonth: currMonth,
        isCurrentMonth: currMonth === latestMonth,
        previousAmount: prevAmount,
        currentAmount: currAmount,
        difference: diff,
        percentageIncrease: pct,
        isZeroPreviousSpending: data.isZeroPrev,
        severity,
        recommendation: generateRecommendation(row.category, pct, currAmount, diff),
        timestamp: new Date().toISOString()
      });
    }
  }

  // Sort descending by percentage increase
  alerts.sort((a, b) => b.percentageIncrease - a.percentageIncrease);

  const currentMonthAlerts = alerts.filter(a => a.isCurrentMonth).length;

  return {
    thresholdPercent: config.budgetAlertThresholdPercent,
    totalAlerts: alerts.length,
    currentMonthAlerts,
    alerts
  };
}

/**
 * Generates overall KPI metrics and chart-ready trend series
 */
function getOverviewMetrics(expenses) {
  if (!Array.isArray(expenses) || expenses.length === 0) {
    return {
      totalSpent: 0,
      currentMonthSpent: 0,
      previousMonthSpent: 0,
      momChangePercent: 0,
      transactionCount: 0,
      alertCount: 0,
      currentMonthAlertCount: 0,
      latestMonth: null,
      topCategory: null,
      trendData: [],
      categoryDistribution: [],
      recentAlerts: []
    };
  }

  const { monthlyCategoryMap, months, categories, monthlyTotals } =
    aggregateExpensesByMonthAndCategory(expenses);

  const totalSpent = Object.values(monthlyTotals).reduce((sum, val) => sum + val, 0);
  const latestMonth = months.length > 0 ? months[months.length - 1] : null;
  const previousMonth = months.length > 1 ? months[months.length - 2] : null;

  const currentMonthSpent = latestMonth ? (monthlyTotals[latestMonth] || 0) : 0;
  const previousMonthSpent = previousMonth ? (monthlyTotals[previousMonth] || 0) : 0;

  let momChangePercent = 0;
  if (previousMonthSpent > 0) {
    momChangePercent = ((currentMonthSpent - previousMonthSpent) / previousMonthSpent) * 100;
  }

  // Category distribution for latest month (or all-time if single month)
  const categorySpendingAllTime = {};
  for (const exp of expenses) {
    categorySpendingAllTime[exp.category] = (categorySpendingAllTime[exp.category] || 0) + exp.amount;
  }

  const categoryDistribution = Object.entries(categorySpendingAllTime)
    .map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
      percentage: totalSpent > 0 ? Math.round((value / totalSpent) * 1000) / 10 : 0
    }))
    .sort((a, b) => b.value - a.value);

  const topCategory = categoryDistribution.length > 0 ? categoryDistribution[0] : null;

  // Monthly trend series for Recharts
  const trendData = months.map(m => {
    const item = {
      month: m,
      total: Math.round((monthlyTotals[m] || 0) * 100) / 100
    };
    // Include top 5 categories in trend object
    categoryDistribution.slice(0, 5).forEach(c => {
      item[c.name] = Math.round((monthlyCategoryMap[m]?.[c.name] || 0) * 100) / 100;
    });
    return item;
  });

  const alertSummary = generateBudgetAlerts(expenses);

  return {
    totalSpent: Math.round(totalSpent * 100) / 100,
    currentMonthSpent: Math.round(currentMonthSpent * 100) / 100,
    previousMonthSpent: Math.round(previousMonthSpent * 100) / 100,
    momChangePercent: Math.round(momChangePercent * 10) / 10,
    transactionCount: expenses.length,
    alertCount: alertSummary.totalAlerts,
    currentMonthAlertCount: alertSummary.currentMonthAlerts,
    latestMonth,
    topCategory,
    trendData,
    categoryDistribution,
    recentAlerts: alertSummary.alerts.slice(0, 5)
  };
}

module.exports = {
  aggregateExpensesByMonthAndCategory,
  computeMonthlyComparison,
  generateBudgetAlerts,
  getOverviewMetrics,
  generateRecommendation
};
