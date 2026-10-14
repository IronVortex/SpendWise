/**
 * Validation Service for Expense Records and CSV uploads
 */

// Supported categories for standardized tracking
const STANDARD_CATEGORIES = [
  'Groceries',
  'Rent & Housing',
  'Dining Out',
  'Utilities & Bills',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Travel',
  'Investments',
  'Miscellaneous'
];

/**
 * Normalizes category string to Title Case or matches nearest standard category
 */
function normalizeCategory(category) {
  if (!category || typeof category !== 'string') return 'Miscellaneous';
  const trimmed = category.trim();
  if (!trimmed) return 'Miscellaneous';

  const match = STANDARD_CATEGORIES.find(
    c => c.toLowerCase() === trimmed.toLowerCase()
  );
  if (match) return match;

  // Title case fallback
  return trimmed
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Parses and validates an ISO or YYYY-MM-DD date string
 */
function parseAndValidateDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return { valid: false, error: 'Date is required and must be a string' };
  }

  const trimmed = dateStr.trim();
  // Regex check for YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(trimmed);
  if (!isoMatch) {
    return { valid: false, error: `Invalid date format '${trimmed}'. Expected YYYY-MM-DD.` };
  }

  const year = parseInt(isoMatch[1], 10);
  const month = parseInt(isoMatch[2], 10);
  const day = parseInt(isoMatch[3], 10);

  if (year < 2000 || year > 2100) {
    return { valid: false, error: `Year ${year} is out of realistic range (2000-2100)` };
  }
  if (month < 1 || month > 12) {
    return { valid: false, error: `Month ${month} is invalid (must be 1-12)` };
  }

  const dateObj = new Date(year, month - 1, day);
  if (
    dateObj.getFullYear() !== year ||
    dateObj.getMonth() !== month - 1 ||
    dateObj.getDate() !== day
  ) {
    return { valid: false, error: `Calendar date '${trimmed}' does not exist (e.g. Feb 30)` };
  }

  // Format to standard YYYY-MM-DD
  const yyyy = year.toString();
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return { valid: true, date: `${yyyy}-${mm}-${dd}`, monthKey: `${yyyy}-${mm}` };
}

/**
 * Parses and cleans an amount value (handles string numbers, commas, currency symbols)
 */
function parseAndValidateAmount(val) {
  if (val === undefined || val === null || val === '') {
    return { valid: false, error: 'Amount is required' };
  }

  let cleanVal = val;
  if (typeof val === 'string') {
    // Remove ₹, $, INR, commas, whitespace
    cleanVal = val.replace(/[₹$€£\s,INR]/gi, '');
  }

  const num = Number(cleanVal);
  if (isNaN(num)) {
    return { valid: false, error: `Invalid amount '${val}'. Must be numeric.` };
  }
  if (num <= 0) {
    return { valid: false, error: `Amount ${num} must be strictly greater than 0` };
  }
  if (!isFinite(num)) {
    return { valid: false, error: 'Amount must be a finite number' };
  }

  // Round to 2 decimal places
  return { valid: true, amount: Math.round(num * 100) / 100 };
}

/**
 * Validates a single expense record object
 */
function validateExpense(record, index = null) {
  const prefix = index !== null ? `Row ${index + 1}: ` : '';
  const errors = [];

  // Date validation
  const dateResult = parseAndValidateDate(record.date);
  if (!dateResult.valid) {
    errors.push(prefix + dateResult.error);
  }

  // Category validation
  if (!record.category || typeof record.category !== 'string' || !record.category.trim()) {
    errors.push(`${prefix}Category is required and cannot be empty`);
  }

  // Amount validation
  const amountResult = parseAndValidateAmount(record.amount);
  if (!amountResult.valid) {
    errors.push(prefix + amountResult.error);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      id: record.id || `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: dateResult.date,
      monthKey: dateResult.monthKey,
      category: normalizeCategory(record.category),
      amount: amountResult.amount,
      description: (record.description || '').trim() || normalizeCategory(record.category),
      paymentMethod: (record.paymentMethod || record.payment_method || 'UPI').trim()
    }
  };
}

/**
 * RFC 4180 Compliant CSV Line Splitter
 */
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses and validates raw CSV content
 */
function parseAndValidateCsv(csvContent) {
  if (!csvContent || typeof csvContent !== 'string') {
    return {
      success: false,
      records: [],
      errors: ['CSV content is empty or invalid'],
      totalRows: 0,
      validRows: 0,
      invalidRows: 0
    };
  }

  // Strip UTF-8 BOM if present
  const cleanContent = csvContent.replace(/^\uFEFF/, '');
  const lines = cleanContent.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length === 0) {
    return {
      success: false,
      records: [],
      errors: ['CSV file contains no data rows'],
      totalRows: 0,
      validRows: 0,
      invalidRows: 0
    };
  }

  // Parse header
  const headerLine = lines[0];
  const headers = parseCsvLine(headerLine).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, ''));

  const dateIdx = headers.findIndex(h => h === 'date' || h === 'txndate' || h === 'transactiondate');
  const catIdx = headers.findIndex(h => h === 'category' || h === 'expensetype');
  const amtIdx = headers.findIndex(h => h === 'amount' || h === 'cost' || h === 'expenseamount');
  const descIdx = headers.findIndex(h => h === 'description' || h === 'desc' || h === 'note' || h === 'notes');
  const pmIdx = headers.findIndex(h => h === 'paymentmethod' || h === 'payment_method' || h === 'mode');

  if (dateIdx === -1 || catIdx === -1 || amtIdx === -1) {
    return {
      success: false,
      records: [],
      errors: [
        `Missing required columns in CSV header. Found: [${headers.join(', ')}]. Required: 'date', 'category', 'amount'.`
      ],
      totalRows: lines.length - 1,
      validRows: 0,
      invalidRows: lines.length - 1
    };
  }

  const validRecords = [];
  const allErrors = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const cols = parseCsvLine(rawLine);

    // If completely empty columns, skip
    if (cols.every(c => c === '')) continue;

    const rawRecord = {
      date: cols[dateIdx],
      category: cols[catIdx],
      amount: cols[amtIdx],
      description: descIdx !== -1 ? cols[descIdx] : '',
      paymentMethod: pmIdx !== -1 ? cols[pmIdx] : 'UPI'
    };

    const validation = validateExpense(rawRecord, i);
    if (validation.valid) {
      validRecords.push(validation.data);
    } else {
      allErrors.push(...validation.errors);
    }
  }

  return {
    success: validRecords.length > 0,
    records: validRecords,
    errors: allErrors,
    totalRows: lines.length - 1,
    validRows: validRecords.length,
    invalidRows: allErrors.length
  };
}

module.exports = {
  STANDARD_CATEGORIES,
  normalizeCategory,
  parseAndValidateDate,
  parseAndValidateAmount,
  validateExpense,
  parseAndValidateCsv
};
