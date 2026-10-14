/**
 * Validation & Ingestion Service for Expense Records, Kaggle Datasets & CSV Uploads
 * Supports custom column mapping, multiple date formats, currency scrubbing,
 * negative amount handling, and de-duplication.
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

// Month name map for text-based date parsing (e.g., '15-Jan-2023', 'May 12, 2024')
const MONTH_NAMES = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12
};

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
    .split(/[\s_-]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Robust date parser supporting ISO, US (MM/DD/YYYY), International (DD/MM/YYYY),
 * Textual (DD-MMM-YYYY), and Timestamps commonly found in Kaggle datasets.
 */
function parseAndValidateDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return { valid: false, error: 'Date is required and must be a string' };
  }

  let clean = dateStr.trim();
  // Strip time component if present (e.g., '2023-05-12 14:30:00' or '2023-05-12T14:30:00.000Z')
  clean = clean.split(/[ T]/)[0].trim();

  let year, month, day;

  // 1. Check YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
  const isoMatch = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(clean);
  if (isoMatch) {
    year = parseInt(isoMatch[1], 10);
    month = parseInt(isoMatch[2], 10);
    day = parseInt(isoMatch[3], 10);
  }

  // 2. Check Textual month: DD-MMM-YYYY or DD MMM YYYY or MMM DD, YYYY (e.g. 15-Jan-2023, Jan 15, 2023)
  if (!year) {
    const textMatch1 = /^(\d{1,2})[-/ ]([A-Za-z]{3,9})[-/ ,]+(\d{2,4})$/.exec(clean);
    const textMatch2 = /^([A-Za-z]{3,9})[-/ ]+(\d{1,2})[-/ ,]+(\d{2,4})$/.exec(clean);

    if (textMatch1) {
      day = parseInt(textMatch1[1], 10);
      const mStr = textMatch1[2].toLowerCase();
      month = MONTH_NAMES[mStr];
      year = parseInt(textMatch1[3], 10);
    } else if (textMatch2) {
      const mStr = textMatch2[1].toLowerCase();
      month = MONTH_NAMES[mStr];
      day = parseInt(textMatch2[2], 10);
      year = parseInt(textMatch2[3], 10);
    }

    if (year && year < 100) {
      year += year >= 70 ? 1900 : 2000;
    }
  }

  // 3. Check DD/MM/YYYY vs MM/DD/YYYY (e.g., 15/01/2023 or 01/15/2023)
  if (!year) {
    const slashMatch = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/.exec(clean);
    if (slashMatch) {
      const p1 = parseInt(slashMatch[1], 10);
      const p2 = parseInt(slashMatch[2], 10);
      let p3 = parseInt(slashMatch[3], 10);
      if (p3 < 100) p3 += p3 >= 70 ? 1900 : 2000;

      year = p3;
      if (p1 > 12 && p2 <= 12) {
        // Definitely DD/MM/YYYY
        day = p1;
        month = p2;
      } else if (p2 > 12 && p1 <= 12) {
        // Definitely MM/DD/YYYY
        month = p1;
        day = p2;
      } else {
        // Default to DD/MM/YYYY (common international format)
        day = p1;
        month = p2;
      }
    }
  }

  // 4. Fallback to native Date parser
  if (!year || !month || !day) {
    const timestamp = Date.parse(dateStr);
    if (!isNaN(timestamp)) {
      const d = new Date(timestamp);
      year = d.getFullYear();
      month = d.getMonth() + 1;
      day = d.getDate();
    }
  }

  if (!year || !month || !day) {
    return { valid: false, error: `Invalid date format '${dateStr}'. Supported: YYYY-MM-DD, DD/MM/YYYY, DD-MMM-YYYY.` };
  }

  if (year < 1990 || year > 2100) {
    return { valid: false, error: `Year ${year} is outside valid range (1990-2100)` };
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
    return { valid: false, error: `Calendar date '${dateStr}' does not exist (e.g. Feb 30)` };
  }

  const yyyy = year.toString();
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return { valid: true, date: `${yyyy}-${mm}-${dd}`, monthKey: `${yyyy}-${mm}` };
}

/**
 * Flexible amount parser that scrubs currency symbols, commas, handles
 * accounting parentheses like `(50.00)`, and converts negative debits to positive expense amounts.
 */
function parseAndValidateAmount(val) {
  if (val === undefined || val === null || val === '') {
    return { valid: false, error: 'Amount is required' };
  }

  let cleanVal = String(val).trim();

  // Handle accounting parentheses e.g. (150.00) -> 150.00
  if (cleanVal.startsWith('(') && cleanVal.endsWith(')')) {
    cleanVal = cleanVal.slice(1, -1);
  }

  // Remove currency symbols and abbreviations
  cleanVal = cleanVal.replace(/[₹$€£,]/g, '');
  cleanVal = cleanVal.replace(/rs\.?/gi, '');
  cleanVal = cleanVal.replace(/\b(inr|usd|eur|gbp)\b/gi, '').trim();

  const num = Number(cleanVal);
  if (isNaN(num)) {
    return { valid: false, error: `Invalid amount '${val}'. Must be numeric.` };
  }

  // Kaggle datasets sometimes represent expense transactions as negative numbers (e.g. -45.50 for debits)
  const absNum = Math.abs(num);
  if (absNum === 0) {
    return { valid: false, isZero: true, error: 'Amount cannot be zero' };
  }
  if (!isFinite(absNum)) {
    return { valid: false, error: 'Amount must be a finite number' };
  }

  return { valid: true, amount: Math.round(absNum * 100) / 100 };
}

/**
 * Auto-detects candidate column headers matching Date, Category, Amount, Description, and Payment Method.
 */
function detectColumns(headers) {
  if (!Array.isArray(headers) || headers.length === 0) {
    return { date: null, category: null, amount: null, description: null, paymentMethod: null, confidence: 'none' };
  }

  const cleanHeaders = headers.map((h, idx) => ({
    original: h,
    clean: h.toLowerCase().replace(/[^a-z0-9]/g, ''),
    index: idx
  }));

  // Date column patterns
  const datePatterns = [
    /^date$/, /^transactiondate$/, /^txndate$/, /^transdate$/,
    /^postingdate$/, /^invoicedate$/, /^bookingdate$/, /^datetime$/,
    /^timestamp$/, /^period$/, /^purchasedate$/, /date/
  ];

  // Category column patterns
  const categoryPatterns = [
    /^category$/, /^expensecategory$/, /^expensetype$/, /^exptype$/,
    /^subcategory$/, /^merchantcategory$/, /^categoryname$/,
    /^classification$/, /^itemcategory$/, /^group$/, /^purpose$/, /category/, /type/
  ];

  // Amount column patterns
  const amountPatterns = [
    /^amount$/, /^transactionamount$/, /^cost$/, /^expenseamount$/,
    /^debit$/, /^debitamount$/, /^total$/, /^value$/, /^spend$/,
    /^spending$/, /^price$/, /^withdrawal$/, /^amountinr$/, /^amountusd$/, /amount/, /cost/, /total/
  ];

  // Description column patterns
  const descPatterns = [
    /^description$/, /^desc$/, /^note$/, /^notes$/, /^remarks$/,
    /^merchant$/, /^merchantname$/, /^narration$/, /^details$/,
    /^payee$/, /^vendor$/, /^item$/, /^title$/, /description/, /merchant/, /note/
  ];

  // Payment method patterns
  const pmPatterns = [
    /^paymentmethod$/, /^paymentmode$/, /^paymenttype$/, /^cardtype$/,
    /^mode$/, /^accounttype$/, /^channel$/, /^method$/, /payment/, /card/
  ];

  function findMatch(patterns, usedIndices = new Set()) {
    for (const pat of patterns) {
      const match = cleanHeaders.find(h => !usedIndices.has(h.index) && pat.test(h.clean));
      if (match) {
        usedIndices.add(match.index);
        return match.original;
      }
    }
    return null;
  }

  const used = new Set();
  const dateCol = findMatch(datePatterns, used);
  const catCol = findMatch(categoryPatterns, used);
  const amtCol = findMatch(amountPatterns, used);
  const descCol = findMatch(descPatterns, used);
  const pmCol = findMatch(pmPatterns, used);

  const hasCore = !!(dateCol && catCol && amtCol);

  return {
    date: dateCol,
    category: catCol,
    amount: amtCol,
    description: descCol,
    paymentMethod: pmCol,
    confidence: hasCore ? 'high' : (dateCol || amtCol || catCol ? 'partial' : 'none'),
    isAutoMapped: hasCore
  };
}

/**
 * Validates a single expense record object
 */
function validateExpense(record, index = null) {
  const prefix = index !== null ? `Row ${index + 1}: ` : '';
  const errors = [];

  const dateResult = parseAndValidateDate(record.date);
  if (!dateResult.valid) {
    errors.push(prefix + dateResult.error);
  }

  if (!record.category || typeof record.category !== 'string' || !record.category.trim()) {
    errors.push(`${prefix}Category is required and cannot be empty`);
  }

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
 * Inspects a CSV file: extracts headers, sample rows, and suggested mappings for Kaggle/custom datasets.
 */
function inspectCsv(csvContent) {
  if (!csvContent || typeof csvContent !== 'string') {
    return { success: false, error: 'Empty or invalid CSV file' };
  }

  const cleanContent = csvContent.replace(/^\uFEFF/, '');
  const lines = cleanContent.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length === 0) {
    return { success: false, error: 'CSV file contains no data rows' };
  }

  const headers = parseCsvLine(lines[0]);
  const sampleRows = [];
  const previewLimit = Math.min(6, lines.length);

  for (let i = 1; i < previewLimit; i++) {
    const cols = parseCsvLine(lines[i]);
    const rowObj = {};
    headers.forEach((h, idx) => {
      rowObj[h] = cols[idx] !== undefined ? cols[idx] : '';
    });
    sampleRows.push(rowObj);
  }

  const suggestedMapping = detectColumns(headers);

  return {
    success: true,
    headers,
    totalRows: lines.length - 1,
    sampleRows,
    suggestedMapping,
    isAutoMapped: suggestedMapping.isAutoMapped
  };
}

/**
 * Parses and validates raw CSV content with optional column mapping & duplicate tracking
 */
function parseAndValidateCsv(csvContent, options = {}) {
  const { columnMapping = null, deduplicate = true } = options;

  if (!csvContent || typeof csvContent !== 'string') {
    return {
      success: false,
      records: [],
      errors: ['CSV content is empty or invalid'],
      totalRows: 0,
      acceptedRows: 0,
      skippedRows: 0,
      duplicateRows: 0,
      rejectedRows: 0
    };
  }

  const cleanContent = csvContent.replace(/^\uFEFF/, '');
  const lines = cleanContent.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length === 0) {
    return {
      success: false,
      records: [],
      errors: ['CSV file contains no data rows'],
      totalRows: 0,
      acceptedRows: 0,
      skippedRows: 0,
      duplicateRows: 0,
      rejectedRows: 0
    };
  }

  const rawHeaders = parseCsvLine(lines[0]);
  const autoMapping = detectColumns(rawHeaders);

  // Determine active mapping
  const activeMapping = {
    date: (columnMapping && columnMapping.date) || autoMapping.date,
    category: (columnMapping && columnMapping.category) || autoMapping.category,
    amount: (columnMapping && columnMapping.amount) || autoMapping.amount,
    description: (columnMapping && columnMapping.description) || autoMapping.description,
    paymentMethod: (columnMapping && columnMapping.paymentMethod) || autoMapping.paymentMethod
  };

  const dateIdx = rawHeaders.indexOf(activeMapping.date);
  const catIdx = rawHeaders.indexOf(activeMapping.category);
  const amtIdx = rawHeaders.indexOf(activeMapping.amount);
  const descIdx = activeMapping.description ? rawHeaders.indexOf(activeMapping.description) : -1;
  const pmIdx = activeMapping.paymentMethod ? rawHeaders.indexOf(activeMapping.paymentMethod) : -1;

  if (dateIdx === -1 || catIdx === -1 || amtIdx === -1) {
    return {
      success: false,
      requiresColumnMapping: true,
      headers: rawHeaders,
      suggestedMapping: autoMapping,
      records: [],
      errors: [
        `Could not automatically identify required columns (Date, Category, Amount) in CSV header: [${rawHeaders.join(', ')}]. Please use the Column Mapping tool to select the correct fields.`
      ],
      totalRows: lines.length - 1,
      acceptedRows: 0,
      skippedRows: 0,
      duplicateRows: 0,
      rejectedRows: lines.length - 1
    };
  }

  const validRecords = [];
  const allErrors = [];
  const seenSignatures = new Set();
  let duplicateCount = 0;
  let skippedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const cols = parseCsvLine(rawLine);

    // Skip empty row
    if (cols.every(c => c === '')) {
      skippedCount++;
      continue;
    }

    const rawRecord = {
      date: cols[dateIdx],
      category: cols[catIdx],
      amount: cols[amtIdx],
      description: descIdx !== -1 ? cols[descIdx] : '',
      paymentMethod: pmIdx !== -1 ? cols[pmIdx] : 'UPI'
    };

    const validation = validateExpense(rawRecord, i);
    if (validation.valid) {
      const rec = validation.data;
      // Deduplicate check based on date + category + amount + description
      const signature = `${rec.date}|${rec.category}|${rec.amount}|${rec.description}`;
      if (deduplicate && seenSignatures.has(signature)) {
        duplicateCount++;
        continue;
      }
      seenSignatures.add(signature);
      validRecords.push(rec);
    } else {
      allErrors.push(...validation.errors);
    }
  }

  return {
    success: validRecords.length > 0,
    records: validRecords,
    errors: allErrors,
    totalRows: lines.length - 1,
    acceptedRows: validRecords.length,
    validRows: validRecords.length, // backwards compatibility
    skippedRows: skippedCount,
    duplicateRows: duplicateCount,
    rejectedRows: allErrors.length,
    invalidRows: allErrors.length,
    columnMappingUsed: activeMapping
  };
}

module.exports = {
  STANDARD_CATEGORIES,
  MONTH_NAMES,
  normalizeCategory,
  parseAndValidateDate,
  parseAndValidateAmount,
  detectColumns,
  inspectCsv,
  validateExpense,
  parseAndValidateCsv
};
