const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

test('API Endpoints: Health Check', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ONLINE');
});

test('API Endpoints: Expenses API', async (t) => {
  await t.test('GET /api/expenses returns paginated expenses', async () => {
    const res = await fetch(`${baseUrl}/api/expenses?limit=10`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.expenses));
    assert.ok(data.pagination.total > 0);
  });

  await t.test('POST /api/expenses creates a new transaction with validation', async () => {
    const newTx = {
      date: '2026-05-10',
      category: 'Dining Out',
      amount: 1550,
      description: 'Test Dinner'
    };
    const res = await fetch(`${baseUrl}/api/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTx)
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.expense.amount, 1550);
  });

  await t.test('POST /api/expenses rejects invalid record', async () => {
    const badTx = {
      date: '2026-02-31', // non-existent date
      category: '',
      amount: -50
    };
    const res = await fetch(`${baseUrl}/api/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(badTx)
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.errors.length > 0);
  });
});

test('API Endpoints: Kaggle Dataset Inspection & Column Mapping', async (t) => {
  await t.test('POST /api/expenses/inspect previews headers and suggests column mapping', async () => {
    const csvContent = `Transaction Date,Expense Category,Transaction Amount,Merchant
12/01/2026,Dining Out,1850.50,Barbeque Nation
14/01/2026,Groceries,4200.00,Supermarket`;

    const res = await fetch(`${baseUrl}/api/expenses/inspect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv: csvContent, fileName: 'kaggle_card.csv' })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.totalRows, 2);
    assert.equal(data.suggestedMapping.date, 'Transaction Date');
    assert.equal(data.suggestedMapping.amount, 'Transaction Amount');
  });

  await t.test('POST /api/expenses/upload ingests Kaggle dataset with custom mapping', async () => {
    const csvContent = `Txn_Date,Spend_Type,Cost_INR,Vendor_Note
2026-01-10,Dining Out,1500,Dinner
2026-02-10,Dining Out,3000,Dinner`;

    const mapping = {
      date: 'Txn_Date',
      category: 'Spend_Type',
      amount: 'Cost_INR',
      description: 'Vendor_Note'
    };

    const res = await fetch(`${baseUrl}/api/expenses/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        csv: csvContent,
        columnMapping: mapping,
        datasetName: 'custom_kaggle_upload.csv',
        replace: true
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.datasetInfo.datasetName, 'custom_kaggle_upload.csv');
    assert.equal(data.datasetInfo.isSample, false);
    assert.equal(data.stats.acceptedRows, 2);
  });

  await t.test('GET /api/expenses/dataset-info returns active dataset metadata', async () => {
    const res = await fetch(`${baseUrl}/api/expenses/dataset-info`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.datasetName, 'custom_kaggle_upload.csv');
    assert.equal(data.data.isSample, false);
  });

  await t.test('POST /api/expenses/sample restores original sample data', async () => {
    const res = await fetch(`${baseUrl}/api/expenses/sample`, { method: 'POST' });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.datasetInfo.isSample, true);
  });
});

test('API Endpoints: Analytics & Alerts API', async (t) => {
  await t.test('GET /api/analytics/overview returns financial KPIs & datasetInfo', async () => {
    const res = await fetch(`${baseUrl}/api/analytics/overview`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(typeof data.data.totalSpent === 'number');
    assert.ok(data.data.transactionCount > 0);
    assert.ok(Array.isArray(data.data.trendData));
    assert.ok(data.data.datasetInfo);
  });

  await t.test('GET /api/analytics/alerts returns strictly >25% alerts', async () => {
    const res = await fetch(`${baseUrl}/api/analytics/alerts`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.thresholdPercent, 25.0);
    assert.ok(Array.isArray(data.data.alerts));
    for (const alert of data.data.alerts) {
      assert.ok(alert.percentageIncrease > 25.0);
      assert.ok(alert.recommendation.length > 0);
    }
  });

  await t.test('GET /api/analytics/monthly-comparison returns MoM matrix', async () => {
    const res = await fetch(`${baseUrl}/api/analytics/monthly-comparison`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.data.matrix));
  });
});

test('API Endpoints: Big Data Status and MapReduce output', async (t) => {
  await t.test('GET /api/bigdata/status accurately reports cluster and demo state', async () => {
    const res = await fetch(`${baseUrl}/api/bigdata/status`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.mode === 'LOCAL_DEMO' || data.mode === 'BIG_DATA_CONNECTED');
    assert.ok(data.services.kafka);
    assert.ok(data.services.hdfs);
    assert.ok(data.services.mapreduce);
  });

  await t.test('GET /api/bigdata/mapreduce-output returns parsed MapReduce output', async () => {
    const res = await fetch(`${baseUrl}/api/bigdata/mapreduce-output`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data.records.length > 0);
  });
});
