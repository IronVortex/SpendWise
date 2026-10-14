/**
 * Expense Controller
 * Handles CRUD, CSV inspection & column mapping, dataset uploading, and dataset lifecycle management.
 */

const dataStore = require('../data/dataStore');
const { parseAndValidateCsv, validateExpense, inspectCsv } = require('../services/validationService');

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

// Inspect CSV file or text before full ingestion (extracts headers, sample preview, auto-mapping)
exports.inspectCsv = (req, res) => {
  try {
    let csvContent = '';
    let fileName = 'dataset.csv';

    if (req.file) {
      csvContent = req.file.buffer.toString('utf8');
      fileName = req.file.originalname;
    } else if (req.body && typeof req.body.csv === 'string') {
      csvContent = req.body.csv;
      fileName = req.body.fileName || 'pasted_dataset.csv';
    } else if (typeof req.body === 'string') {
      csvContent = req.body;
    } else {
      return res.status(400).json({
        success: false,
        message: 'No CSV file or CSV text content provided for inspection'
      });
    }

    const inspection = inspectCsv(csvContent);
    if (!inspection.success) {
      return res.status(400).json({
        success: false,
        message: inspection.error || 'Failed to inspect CSV content'
      });
    }

    res.json({
      success: true,
      fileName,
      ...inspection
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

// Upload & ingest CSV file or raw CSV text with optional custom column mapping
exports.uploadCsv = (req, res) => {
  try {
    let csvContent = '';
    let datasetName = 'uploaded_dataset.csv';

    if (req.file) {
      csvContent = req.file.buffer.toString('utf8');
      datasetName = req.file.originalname;
    } else if (req.body && typeof req.body.csv === 'string') {
      csvContent = req.body.csv;
      datasetName = req.body.datasetName || 'pasted_dataset.csv';
    } else if (typeof req.body === 'string') {
      csvContent = req.body;
    } else {
      return res.status(400).json({
        success: false,
        message: 'No CSV file or CSV text content provided'
      });
    }

    // Parse columnMapping if provided as string or object
    let columnMapping = null;
    const rawMapping = req.body ? (req.body.columnMapping || req.query.columnMapping) : null;
    if (rawMapping) {
      if (typeof rawMapping === 'string') {
        try {
          columnMapping = JSON.parse(rawMapping);
        } catch {
          columnMapping = null;
        }
      } else if (typeof rawMapping === 'object') {
        columnMapping = rawMapping;
      }
    }

    const parseResult = parseAndValidateCsv(csvContent, { columnMapping });

    if (!parseResult.success) {
      return res.status(422).json({
        success: false,
        requiresColumnMapping: parseResult.requiresColumnMapping || false,
        message: parseResult.errors[0] || 'CSV validation failed. No valid records could be extracted.',
        headers: parseResult.headers || [],
        suggestedMapping: parseResult.suggestedMapping || null,
        errors: parseResult.errors,
        totalRows: parseResult.totalRows,
        acceptedRows: parseResult.acceptedRows,
        rejectedRows: parseResult.rejectedRows
      });
    }

    // Default to replace mode unless append=true specified
    const replace = req.query.replace !== 'false' && req.body?.replace !== false;

    const stats = {
      totalRows: parseResult.totalRows,
      acceptedRows: parseResult.acceptedRows,
      skippedRows: parseResult.skippedRows,
      duplicateRows: parseResult.duplicateRows,
      rejectedRows: parseResult.rejectedRows
    };

    const datasetInfo = dataStore.setDataset({
      name: req.body?.datasetName || datasetName,
      records: parseResult.records,
      isSample: false,
      stats,
      columnMapping: parseResult.columnMappingUsed,
      replace
    });

    res.status(200).json({
      success: true,
      message: `Successfully processed ${parseResult.acceptedRows} expense records into active dataset.`,
      datasetInfo,
      stats,
      errors: parseResult.errors.slice(0, 50), // Send first 50 row errors if any
      totalCountNow: dataStore.count()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get current dataset metadata
exports.getDatasetInfo = (req, res) => {
  try {
    const info = dataStore.getDatasetInfo();
    res.json({
      success: true,
      data: info
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reload / Reset sample data
exports.loadSampleData = (req, res) => {
  try {
    const result = dataStore.loadSampleData();
    res.json({
      success: true,
      message: result.message,
      datasetInfo: dataStore.getDatasetInfo(),
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
      message: `Cleared ${result.clearedCount} transactions. Dataset is now empty.`,
      datasetInfo: dataStore.getDatasetInfo()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
