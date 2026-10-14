const test = require('node:test');
const assert = require('node:assert/strict');
const {
  parseAndValidateDate,
  parseAndValidateAmount,
  validateExpense,
  parseAndValidateCsv,
  detectColumns,
  inspectCsv,
  normalizeCategory
} = require('../src/services/validationService');

test('Validation Service: Multi-Format Date Validation (Kaggle & Standard)', async (t) => {
  await t.test('accepts valid YYYY-MM-DD date', () => {
    const res = parseAndValidateDate('2026-03-15');
    assert.equal(res.valid, true);
    assert.equal(res.date, '2026-03-15');
    assert.equal(res.monthKey, '2026-03');
  });

  await t.test('accepts International DD/MM/YYYY format', () => {
    const res = parseAndValidateDate('25/01/2026');
    assert.equal(res.valid, true);
    assert.equal(res.date, '2026-01-25');
    assert.equal(res.monthKey, '2026-01');
  });

  await t.test('accepts Textual month format DD-MMM-YYYY (e.g. 15-Jan-2026)', () => {
    const res = parseAndValidateDate('15-Jan-2026');
    assert.equal(res.valid, true);
    assert.equal(res.date, '2026-01-15');
    assert.equal(res.monthKey, '2026-01');
  });

  await t.test('accepts Timestamp format with trailing time', () => {
    const res = parseAndValidateDate('2026-04-18 14:32:00');
    assert.equal(res.valid, true);
    assert.equal(res.date, '2026-04-18');
    assert.equal(res.monthKey, '2026-04');
  });

  await t.test('rejects non-existent calendar date like Feb 30', () => {
    const res = parseAndValidateDate('2026-02-30');
    assert.equal(res.valid, false);
    assert.match(res.error, /does not exist/i);
  });

  await t.test('rejects empty or null date', () => {
    assert.equal(parseAndValidateDate('').valid, false);
    assert.equal(parseAndValidateDate(null).valid, false);
  });
});

test('Validation Service: Flexible Amount Validation (Currencies & Debits)', async (t) => {
  await t.test('accepts standard numeric amount', () => {
    const res = parseAndValidateAmount(1500.5);
    assert.equal(res.valid, true);
    assert.equal(res.amount, 1500.5);
  });

  await t.test('parses amount with rupee symbol and commas', () => {
    const res = parseAndValidateAmount('₹ 12,500.00');
    assert.equal(res.valid, true);
    assert.equal(res.amount, 12500);
  });

  await t.test('parses amount with dollar symbol and text currency (USD / Rs)', () => {
    const res1 = parseAndValidateAmount('$ 450.75');
    const res2 = parseAndValidateAmount('Rs. 1,200');
    assert.equal(res1.valid, true);
    assert.equal(res1.amount, 450.75);
    assert.equal(res2.valid, true);
    assert.equal(res2.amount, 1200);
  });

  await t.test('converts negative expense debit amounts to positive outlay', () => {
    // In many Kaggle credit card datasets, expenses are logged as negative numbers
    const res = parseAndValidateAmount('-45.50');
    assert.equal(res.valid, true);
    assert.equal(res.amount, 45.5);
  });

  await t.test('parses accounting parentheses (150.00) as positive amount', () => {
    const res = parseAndValidateAmount('(150.00)');
    assert.equal(res.valid, true);
    assert.equal(res.amount, 150);
  });

  await t.test('rejects zero amount', () => {
    assert.equal(parseAndValidateAmount(0).valid, false);
  });

  await t.test('rejects non-numeric string', () => {
    const res = parseAndValidateAmount('abc');
    assert.equal(res.valid, false);
    assert.match(res.error, /Must be numeric/i);
  });
});

test('Validation Service: Category Normalization', () => {
  assert.equal(normalizeCategory('dining out'), 'Dining Out');
  assert.equal(normalizeCategory('GROCERIES'), 'Groceries');
  assert.equal(normalizeCategory('custom travel'), 'Custom Travel');
  assert.equal(normalizeCategory(''), 'Miscellaneous');
});

test('Validation Service: Kaggle Column Auto-Detection & Inspection', async (t) => {
  await t.test('auto-detects Kaggle alternative column headers', () => {
    const kaggleHeaders = ['Transaction Date', 'Expense Category', 'Transaction Amount', 'Merchant', 'Card Type'];
    const detected = detectColumns(kaggleHeaders);
    assert.equal(detected.isAutoMapped, true);
    assert.equal(detected.date, 'Transaction Date');
    assert.equal(detected.category, 'Expense Category');
    assert.equal(detected.amount, 'Transaction Amount');
    assert.equal(detected.description, 'Merchant');
    assert.equal(detected.paymentMethod, 'Card Type');
  });

  await t.test('inspectCsv extracts headers, sample rows, and suggested mappings', () => {
    const csv = `Transaction Date,Expense Category,Transaction Amount,Merchant
12/01/2026,Dining Out,1850.50,Barbeque Nation
14/01/2026,Groceries,4200.00,Supermarket`;
    const inspection = inspectCsv(csv);
    assert.equal(inspection.success, true);
    assert.equal(inspection.totalRows, 2);
    assert.equal(inspection.sampleRows.length, 2);
    assert.equal(inspection.suggestedMapping.date, 'Transaction Date');
    assert.equal(inspection.suggestedMapping.category, 'Expense Category');
  });
});

test('Validation Service: CSV Parsing with Column Mapping & De-duplication', async (t) => {
  await t.test('parses Kaggle CSV automatically without manual mapping', () => {
    const csv = `Transaction Date,Expense Category,Transaction Amount,Merchant
12/01/2026,Dining Out,1850.50,Barbeque Nation
14/01/2026,Groceries,4200.00,Supermarket`;
    const res = parseAndValidateCsv(csv);
    assert.equal(res.success, true);
    assert.equal(res.acceptedRows, 2);
    assert.equal(res.records[0].category, 'Dining Out');
    assert.equal(res.records[0].amount, 1850.5);
  });

  await t.test('applies explicit custom column mapping when headers differ', () => {
    const csv = `PurchasedOn,ItemKind,CostVal,VendorNote
2026-02-10,Entertainment,1500,Cinema Movie
2026-02-14,Dining Out,2400,Dinner Bistro`;
    const mapping = {
      date: 'PurchasedOn',
      category: 'ItemKind',
      amount: 'CostVal',
      description: 'VendorNote'
    };
    const res = parseAndValidateCsv(csv, { columnMapping: mapping });
    assert.equal(res.success, true);
    assert.equal(res.acceptedRows, 2);
    assert.equal(res.records[0].category, 'Entertainment');
    assert.equal(res.records[1].amount, 2400);
  });

  await t.test('handles duplicate rows safely by deduplicating', () => {
    const csv = `date,category,amount,description
2026-01-10,Dining Out,1500,Dinner
2026-01-10,Dining Out,1500,Dinner
2026-01-12,Groceries,2000,Market`;
    const res = parseAndValidateCsv(csv, { deduplicate: true });
    assert.equal(res.success, true);
    assert.equal(res.acceptedRows, 2);
    assert.equal(res.duplicateRows, 1);
  });

  await t.test('does not discard valid rows when some rows are invalid (graceful reporting)', () => {
    const csv = `date,category,amount,description
2026-01-10,Dining Out,1500,Valid Row 1
2026-02-31,Groceries,2000,Bad date Feb 30
2026-01-15,Shopping,3500,Valid Row 2`;
    const res = parseAndValidateCsv(csv);
    assert.equal(res.success, true);
    assert.equal(res.acceptedRows, 2);
    assert.equal(res.rejectedRows, 1);
    assert.match(res.errors[0], /Row 3/);
  });
});
