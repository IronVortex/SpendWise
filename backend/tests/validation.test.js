const test = require('node:test');
const assert = require('node:assert/strict');
const {
  parseAndValidateDate,
  parseAndValidateAmount,
  validateExpense,
  parseAndValidateCsv,
  normalizeCategory
} = require('../src/services/validationService');

test('Validation Service: Date Validation', async (t) => {
  await t.test('accepts valid YYYY-MM-DD date', () => {
    const res = parseAndValidateDate('2026-03-15');
    assert.equal(res.valid, true);
    assert.equal(res.date, '2026-03-15');
    assert.equal(res.monthKey, '2026-03');
  });

  await t.test('rejects non-existent calendar date like Feb 30', () => {
    const res = parseAndValidateDate('2026-02-30');
    assert.equal(res.valid, false);
    assert.match(res.error, /does not exist/i);
  });

  await t.test('rejects invalid format', () => {
    const res = parseAndValidateDate('15-03-2026');
    assert.equal(res.valid, false);
    assert.match(res.error, /Expected YYYY-MM-DD/i);
  });

  await t.test('rejects empty or null date', () => {
    assert.equal(parseAndValidateDate('').valid, false);
    assert.equal(parseAndValidateDate(null).valid, false);
  });
});

test('Validation Service: Amount Validation', async (t) => {
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

  await t.test('rejects zero or negative amount', () => {
    assert.equal(parseAndValidateAmount(0).valid, false);
    assert.equal(parseAndValidateAmount(-500).valid, false);
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

test('Validation Service: Single Expense Validation', () => {
  const validExp = {
    date: '2026-04-10',
    category: 'Groceries',
    amount: 2500,
    description: 'Weekly milk and vegetables'
  };
  const validRes = validateExpense(validExp);
  assert.equal(validRes.valid, true);
  assert.equal(validRes.data.monthKey, '2026-04');
  assert.equal(validRes.data.amount, 2500);

  const invalidExp = {
    date: 'invalid-date',
    category: '',
    amount: -100
  };
  const invalidRes = validateExpense(invalidExp);
  assert.equal(invalidRes.valid, false);
  assert.equal(invalidRes.errors.length >= 3, true);
});

test('Validation Service: CSV Parsing and Validation', async (t) => {
  await t.test('parses valid CSV with headers', () => {
    const csv = `date,category,amount,description
2026-01-10,Dining Out,1500.00,Family Dinner
2026-01-15,Groceries,3200.50,Supermarket`;
    const res = parseAndValidateCsv(csv);
    assert.equal(res.success, true);
    assert.equal(res.validRows, 2);
    assert.equal(res.records[0].category, 'Dining Out');
    assert.equal(res.records[1].amount, 3200.5);
  });

  await t.test('rejects CSV with missing required columns', () => {
    const csv = `date,wrong_column,description\n2026-01-10,foo,bar`;
    const res = parseAndValidateCsv(csv);
    assert.equal(res.success, false);
    assert.match(res.errors[0], /Missing required columns/i);
  });

  await t.test('reports line numbers for invalid rows in CSV', () => {
    const csv = `date,category,amount,description
2026-01-10,Dining Out,1500,Good row
2026-02-31,Groceries,2000,Bad date
2026-01-12,Utilities,-500,Negative amount`;
    const res = parseAndValidateCsv(csv);
    assert.equal(res.success, true);
    assert.equal(res.validRows, 1);
    assert.equal(res.invalidRows, 2);
    assert.match(res.errors[0], /Row 3/);
    assert.match(res.errors[1], /Row 4/);
  });
});
