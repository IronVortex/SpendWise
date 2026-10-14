const test = require('node:test');
const assert = require('node:assert/strict');
const {
  aggregateExpensesByMonthAndCategory,
  computeMonthlyComparison,
  generateBudgetAlerts,
  getOverviewMetrics
} = require('../src/services/analyticsService');

test('Analytics Service: Monthly Aggregation', () => {
  const expenses = [
    { date: '2026-01-05', monthKey: '2026-01', category: 'Groceries', amount: 1000 },
    { date: '2026-01-15', monthKey: '2026-01', category: 'Groceries', amount: 1500 },
    { date: '2026-01-20', monthKey: '2026-01', category: 'Dining Out', amount: 800 },
    { date: '2026-02-10', monthKey: '2026-02', category: 'Groceries', amount: 2000 }
  ];

  const res = aggregateExpensesByMonthAndCategory(expenses);
  assert.deepEqual(res.months, ['2026-01', '2026-02']);
  assert.equal(res.monthlyCategoryMap['2026-01']['Groceries'], 2500);
  assert.equal(res.monthlyCategoryMap['2026-01']['Dining Out'], 800);
  assert.equal(res.monthlyCategoryMap['2026-02']['Groceries'], 2000);
  assert.equal(res.monthlyTotals['2026-01'], 3300);
  assert.equal(res.monthlyTotals['2026-02'], 2000);
});

test('Analytics Service: 25% Threshold MoM Alert Detection', async (t) => {
  await t.test('strictly > 25% increase triggers an alert', () => {
    // 1000 to 1300 is +30.0% (> 25%) -> MUST ALERT
    const expenses = [
      { date: '2026-01-10', monthKey: '2026-01', category: 'Dining Out', amount: 1000 },
      { date: '2026-02-10', monthKey: '2026-02', category: 'Dining Out', amount: 1300 }
    ];

    const alertsResult = generateBudgetAlerts(expenses);
    assert.equal(alertsResult.totalAlerts, 1);
    assert.equal(alertsResult.alerts[0].category, 'Dining Out');
    assert.equal(alertsResult.alerts[0].percentageIncrease, 30.0);
    assert.ok(alertsResult.alerts[0].recommendation.length > 0);
  });

  await t.test('exactly 25% increase DOES NOT trigger an alert (strictly > 25%)', () => {
    // 1000 to 1250 is exactly +25.0% (not strictly > 25%) -> NO ALERT
    const expenses = [
      { date: '2026-01-10', monthKey: '2026-01', category: 'Shopping', amount: 1000 },
      { date: '2026-02-10', monthKey: '2026-02', category: 'Shopping', amount: 1250 }
    ];

    const alertsResult = generateBudgetAlerts(expenses);
    assert.equal(alertsResult.totalAlerts, 0);
  });

  await t.test('increase below 25% (e.g. 15%) does not trigger alert', () => {
    const expenses = [
      { date: '2026-01-10', monthKey: '2026-01', category: 'Groceries', amount: 2000 },
      { date: '2026-02-10', monthKey: '2026-02', category: 'Groceries', amount: 2300 } // +15%
    ];

    const alertsResult = generateBudgetAlerts(expenses);
    assert.equal(alertsResult.totalAlerts, 0);
  });

  await t.test('spending decrease does not trigger alert', () => {
    const expenses = [
      { date: '2026-01-10', monthKey: '2026-01', category: 'Entertainment', amount: 3000 },
      { date: '2026-02-10', monthKey: '2026-02', category: 'Entertainment', amount: 1500 } // -50%
    ];

    const alertsResult = generateBudgetAlerts(expenses);
    assert.equal(alertsResult.totalAlerts, 0);
  });

  await t.test('handles zero previous-month spending (new category)', () => {
    // Groceries was 0 in Jan, and 2000 in Feb
    const expenses = [
      { date: '2026-01-10', monthKey: '2026-01', category: 'Rent', amount: 10000 },
      { date: '2026-02-10', monthKey: '2026-02', category: 'Rent', amount: 10000 },
      { date: '2026-02-12', monthKey: '2026-02', category: 'Travel', amount: 5000 }
    ];

    const alertsResult = generateBudgetAlerts(expenses);
    // Travel had 0 in Jan and 5000 in Feb -> Alert for new category
    assert.equal(alertsResult.totalAlerts, 1);
    assert.equal(alertsResult.alerts[0].category, 'Travel');
    assert.equal(alertsResult.alerts[0].isZeroPreviousSpending, true);
  });
});

test('Analytics Service: Empty and Single Month Dataset Handling', () => {
  const emptyRes = getOverviewMetrics([]);
  assert.equal(emptyRes.totalSpent, 0);
  assert.equal(emptyRes.transactionCount, 0);
  assert.equal(emptyRes.alertCount, 0);

  const singleMonth = [
    { date: '2026-01-05', monthKey: '2026-01', category: 'Groceries', amount: 1000 }
  ];
  const singleRes = getOverviewMetrics(singleMonth);
  assert.equal(singleRes.totalSpent, 1000);
  assert.equal(singleRes.alertCount, 0); // No previous month to compare against
});
