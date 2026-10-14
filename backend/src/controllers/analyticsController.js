/**
 * Analytics Controller
 * Serves calculated metrics, monthly trends, MoM comparison table, and >25% budgeting alerts.
 */

const dataStore = require('../data/dataStore');
const analyticsService = require('../services/analyticsService');

// Overview metrics (KPIs, top category, mini-trends)
exports.getOverview = (req, res) => {
  try {
    const expenses = dataStore.getAll();
    const overview = analyticsService.getOverviewMetrics(expenses);
    const datasetInfo = dataStore.getDatasetInfo();
    res.json({
      success: true,
      data: {
        ...overview,
        datasetInfo
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Monthly trends breakdown
exports.getTrends = (req, res) => {
  try {
    const expenses = dataStore.getAll();
    const { monthlyCategoryMap, months, categories, monthlyTotals } =
      analyticsService.aggregateExpensesByMonthAndCategory(expenses);

    res.json({
      success: true,
      data: {
        months,
        categories,
        monthlyTotals,
        monthlyCategoryMap
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Month-on-Month comparison matrix
exports.getMonthlyComparison = (req, res) => {
  try {
    const expenses = dataStore.getAll();
    const comparison = analyticsService.computeMonthlyComparison(expenses);
    res.json({
      success: true,
      data: comparison
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Budgeting alerts (> 25% increase)
exports.getAlerts = (req, res) => {
  try {
    const expenses = dataStore.getAll();
    const alertsData = analyticsService.generateBudgetAlerts(expenses);
    res.json({
      success: true,
      data: alertsData
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
