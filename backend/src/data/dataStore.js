/**
 * Persistent DataStore for Expense Records
 * Supports dataset replacement, metadata tracking (filename, upload time, sample vs uploaded),
 * disk persistence across server restarts/page refreshes, and automatic sync to HDFS/Kafka input CSV.
 */

const fs = require('fs');
const path = require('path');
const { parseAndValidateCsv, validateExpense } = require('../services/validationService');

class DataStore {
  constructor() {
    this.expenses = [];
    this.datasetName = 'personal_expenses_sample.csv';
    this.isSample = true;
    this.uploadedAt = new Date().toISOString();
    this.stats = { totalRows: 0, acceptedRows: 0, skippedRows: 0, duplicateRows: 0, rejectedRows: 0 };
    this.columnMapping = null;

    this.sampleFilePath = path.resolve(__dirname, 'sample_expenses.csv');
    this.persistedJsonPath = path.resolve(__dirname, 'current_dataset.json');
    this.currentCsvPath = path.resolve(__dirname, 'current_expenses.csv');
    this.mapReduceInputPath = path.resolve(__dirname, '../../../bigdata/mapreduce/sample_input/expenses.csv');

    this.init();
  }

  /**
   * Initializes store: loads persisted dataset if available; otherwise loads default sample dataset
   */
  init() {
    if (fs.existsSync(this.persistedJsonPath)) {
      try {
        const raw = fs.readFileSync(this.persistedJsonPath, 'utf8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.expenses) && data.expenses.length > 0) {
          this.expenses = data.expenses;
          this.datasetName = data.datasetName || 'uploaded_dataset.csv';
          this.isSample = data.isSample !== undefined ? data.isSample : false;
          this.uploadedAt = data.uploadedAt || new Date().toISOString();
          this.stats = data.stats || { totalRows: this.expenses.length, acceptedRows: this.expenses.length, skippedRows: 0, duplicateRows: 0, rejectedRows: 0 };
          this.columnMapping = data.columnMapping || null;
          return;
        }
      } catch (err) {
        console.error('Failed to load persisted dataset:', err.message);
      }
    }

    this.loadSampleData();
  }

  /**
   * Persists current dataset state to disk (JSON + CSV)
   */
  persistState() {
    try {
      const payload = {
        datasetName: this.datasetName,
        isSample: this.isSample,
        uploadedAt: this.uploadedAt,
        stats: this.stats,
        columnMapping: this.columnMapping,
        totalRecords: this.expenses.length,
        expenses: this.expenses
      };
      fs.writeFileSync(this.persistedJsonPath, JSON.stringify(payload, null, 2), 'utf8');

      // Export normalized CSV so Kafka Producer and Hadoop MapReduce can read active data
      this.exportNormalizedCsv();
    } catch (err) {
      console.error('Failed to persist dataset state:', err.message);
    }
  }

  /**
   * Exports normalized expenses to CSV for Hadoop MapReduce & Kafka Producer
   */
  exportNormalizedCsv() {
    try {
      let csv = 'date,category,amount,description,payment_method\n';
      for (const e of this.expenses) {
        const desc = (e.description || '').replace(/"/g, '""');
        csv += `${e.date},${e.category},${e.amount.toFixed(2)},"${desc}",${e.paymentMethod || 'UPI'}\n`;
      }
      fs.writeFileSync(this.currentCsvPath, csv, 'utf8');

      // Also sync to MapReduce input path if directory exists
      const mrDir = path.dirname(this.mapReduceInputPath);
      if (fs.existsSync(mrDir)) {
        fs.writeFileSync(this.mapReduceInputPath, csv, 'utf8');
      }
    } catch (err) {
      console.error('Failed to export normalized CSV:', err.message);
    }
  }

  /**
   * Restores default curated sample dataset
   */
  loadSampleData() {
    try {
      if (fs.existsSync(this.sampleFilePath)) {
        const content = fs.readFileSync(this.sampleFilePath, 'utf8');
        const parseResult = parseAndValidateCsv(content);
        if (parseResult.success) {
          this.expenses = parseResult.records;
          this.datasetName = 'personal_expenses_sample.csv';
          this.isSample = true;
          this.uploadedAt = new Date().toISOString();
          this.stats = {
            totalRows: parseResult.totalRows,
            acceptedRows: parseResult.acceptedRows,
            skippedRows: parseResult.skippedRows,
            duplicateRows: parseResult.duplicateRows,
            rejectedRows: parseResult.rejectedRows
          };
          this.columnMapping = parseResult.columnMappingUsed || null;
          this.persistState();

          return {
            success: true,
            datasetName: this.datasetName,
            isSample: true,
            count: this.expenses.length,
            message: `Successfully loaded ${this.expenses.length} sample transactions.`
          };
        }
      }
    } catch (err) {
      console.error('Failed to load sample data from file:', err.message);
    }

    this.expenses = [];
    return { success: false, count: 0, message: 'Could not load sample file' };
  }

  /**
   * Sets new uploaded dataset (replaces or appends) and persists to disk
   */
  setDataset({ name, records, isSample = false, stats = {}, columnMapping = null, replace = true }) {
    if (replace) {
      this.expenses = [...records];
      this.datasetName = name || 'uploaded_dataset.csv';
      this.isSample = isSample;
      this.uploadedAt = new Date().toISOString();
      this.stats = stats;
      this.columnMapping = columnMapping;
    } else {
      this.expenses.push(...records);
      this.datasetName = `${this.datasetName} + ${name}`;
      this.isSample = false;
      this.stats.totalRows = (this.stats.totalRows || 0) + (stats.totalRows || records.length);
      this.stats.acceptedRows = (this.stats.acceptedRows || 0) + records.length;
    }

    this.persistState();

    return {
      success: true,
      datasetName: this.datasetName,
      isSample: this.isSample,
      uploadedAt: this.uploadedAt,
      totalRecords: this.expenses.length,
      stats: this.stats
    };
  }

  /**
   * Returns metadata about the currently loaded dataset
   */
  getDatasetInfo() {
    return {
      datasetName: this.datasetName,
      isSample: this.isSample,
      uploadedAt: this.uploadedAt,
      totalRecords: this.expenses.length,
      stats: this.stats,
      columnMapping: this.columnMapping
    };
  }

  /**
   * Returns all stored expenses
   */
  getAll() {
    return [...this.expenses];
  }

  /**
   * Returns count
   */
  count() {
    return this.expenses.length;
  }

  /**
   * Clears transactions
   */
  clear() {
    const prevCount = this.expenses.length;
    this.expenses = [];
    this.datasetName = 'empty_dataset.csv';
    this.isSample = false;
    this.stats = { totalRows: 0, acceptedRows: 0, skippedRows: 0, duplicateRows: 0, rejectedRows: 0 };
    this.persistState();
    return { success: true, clearedCount: prevCount };
  }

  /**
   * Adds single expense
   */
  add(record) {
    const validated = validateExpense(record);
    if (!validated.valid) {
      return { success: false, errors: validated.errors };
    }
    this.expenses.push(validated.data);
    this.persistState();
    return { success: true, expense: validated.data };
  }

  /**
   * Adds batch of validated expenses
   */
  addBatch(records) {
    if (!Array.isArray(records)) {
      return { success: false, inserted: 0, errors: ['Expected an array of records'] };
    }
    const inserted = [];
    const errors = [];

    records.forEach((rec, idx) => {
      const res = validateExpense(rec, idx);
      if (res.valid) {
        inserted.push(res.data);
      } else {
        errors.push(...res.errors);
      }
    });

    if (inserted.length > 0) {
      this.expenses.push(...inserted);
      this.persistState();
    }

    return {
      success: inserted.length > 0,
      insertedCount: inserted.length,
      errorCount: errors.length,
      errors
    };
  }

  /**
   * Filtered, searched, sorted, and paginated query
   */
  getFiltered(query = {}) {
    const {
      search = '',
      category = '',
      month = '',
      startDate = '',
      endDate = '',
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = query;

    let result = [...this.expenses];

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(exp =>
        exp.description.toLowerCase().includes(q) ||
        exp.category.toLowerCase().includes(q) ||
        exp.paymentMethod.toLowerCase().includes(q) ||
        exp.amount.toString().includes(q)
      );
    }

    if (category && category !== 'All') {
      result = result.filter(exp => exp.category.toLowerCase() === category.toLowerCase());
    }

    if (month && month !== 'All') {
      result = result.filter(exp => exp.monthKey === month);
    }

    if (startDate) {
      result = result.filter(exp => exp.date >= startDate);
    }
    if (endDate) {
      result = result.filter(exp => exp.date <= endDate);
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else {
        comparison = a.date.localeCompare(b.date);
      }
      return sortOrder.toLowerCase() === 'desc' ? -comparison : comparison;
    });

    const total = result.length;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const totalPages = Math.ceil(total / limitNum) || 1;
    const offset = (pageNum - 1) * limitNum;
    const paginatedItems = result.slice(offset, offset + limitNum);

    const allCategories = Array.from(new Set(this.expenses.map(e => e.category))).sort();
    const allMonths = Array.from(new Set(this.expenses.map(e => e.monthKey))).sort();

    return {
      expenses: paginatedItems,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      },
      availableCategories: allCategories,
      availableMonths: allMonths,
      datasetInfo: this.getDatasetInfo()
    };
  }
}

// Singleton instance
const dataStore = new DataStore();

module.exports = dataStore;
