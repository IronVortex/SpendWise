/**
 * Expense Controller
 * Handles CRUD, CSV upload with line-by-line validation, and sample data loading.
 */

const dataStore = require('../data/dataStore');
const { parseAndValidateCsv, validateExpense } = require('../services/validationService');

// Get filtered, searched, paginated expenses
exports.getExpenses = (req, res) => {
  try {
    const result = dataStore.getFiltered(req.query);
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add single transaction
exports.addExpense = (req, res) => {
  try {
    const validation = validateExpense(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const result = dataStore.add(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to add expense',
        errors: result.errors
      });
    }

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      expense: result.expense
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Upload CSV file or raw CSV text
exports.uploadCsv = (req, res) => {
  try {
    let csvContent = '';

    if (req.file) {
      // Multer file upload
      csvContent = req.file.buffer.toString('utf8');
    } else if (req.body && typeof req.body.csv === 'string') {
      csvContent = req.body.csv;
    } else if (typeof req.body === 'string') {
      csvContent = req.body;
    } else {
      return res.status(400).json({
        success: false,
        message: 'No CSV file or CSV text content provided'
      });
    }

    const parseResult = parseAndValidateCsv(csvContent);

    if (!parseResult.success) {
      return res.status(422).json({
        success: false,
        message: 'CSV validation failed. No valid records found.',
        errors: parseResult.errors,
        totalRows: parseResult.totalRows,
        validRows: parseResult.validRows,
        invalidRows: parseResult.invalidRows
      });
    }

    // Append mode by default (or replace if replace=true)
    const replace = req.query.replace === 'true' || req.body.replace === true;
    if (replace) {
      dataStore.clear();
    }

    const insertResult = dataStore.addBatch(parseResult.records);

    res.status(200).json({
      success: true,
      message: `Successfully processed ${parseResult.validRows} expense records.`,
      totalRows: parseResult.totalRows,
      validRows: parseResult.validRows,
      invalidRows: parseResult.invalidRows,
      errors: parseResult.errors,
      insertedCount: insertResult.insertedCount,
      totalCountNow: dataStore.count()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reload sample data
exports.loadSampleData = (req, res) => {
  try {
    const result = dataStore.loadSampleData();
    res.json({
      success: true,
      message: result.message,
      count: result.count
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Clear all data
exports.clearExpenses = (req, res) => {
  try {
    const result = dataStore.clear();
    res.json({
      success: true,
      message: `Cleared ${result.clearedCount} transactions. Dataset is now empty.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
