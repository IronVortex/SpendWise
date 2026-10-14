/**
 * In-memory DataStore for Expense Records
 * Pre-populates with validated sample data on startup.
 */

const fs = require('fs');
const path = require('path');
const { parseAndValidateCsv, validateExpense } = require('../services/validationService');

class DataStore {
  constructor() {
    this.expenses = [];
    this.sampleFilePath = path.resolve(__dirname, 'sample_expenses.csv');
    this.init();
  }

  /**
   * Initializes store with sample dataset
   */
  init() {
    this.loadSampleData();
  }

  /**
   * Reads and parses sample CSV into memory
   */
  loadSampleData() {
    try {
      if (fs.existsSync(this.sampleFilePath)) {
        const content = fs.readFileSync(this.sampleFilePath, 'utf8');
        const parseResult = parseAndValidateCsv(content);
        if (parseResult.success) {
          this.expenses = parseResult.records;
          return {
            success: true,
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
   * Returns all stored expenses
   */
  getAll() {
    return [...this.expenses];
  }

  /**
   * Returns expense count
   */
  count() {
    return this.expenses.length;
  }

  /**
   * Clears all transactions
   */
  clear() {
    const prevCount = this.expenses.length;
    this.expenses = [];
    return { success: true, clearedCount: prevCount };
  }

  /**
   * Adds a single validated expense
   */
  add(record) {
    const validated = validateExpense(record);
    if (!validated.valid) {
      return { success: false, errors: validated.errors };
    }
    this.expenses.push(validated.data);
    return { success: true, expense: validated.data };
  }

  /**
   * Adds an array of validated expenses
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

    // Search query
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(exp =>
        exp.description.toLowerCase().includes(q) ||
        exp.category.toLowerCase().includes(q) ||
        exp.paymentMethod.toLowerCase().includes(q) ||
        exp.amount.toString().includes(q)
      );
    }

    // Category filter
    if (category && category !== 'All') {
      result = result.filter(exp => exp.category.toLowerCase() === category.toLowerCase());
    }

    // Month filter (YYYY-MM)
    if (month && month !== 'All') {
      result = result.filter(exp => exp.monthKey === month);
    }

    // Date range filter
    if (startDate) {
      result = result.filter(exp => exp.date >= startDate);
    }
    if (endDate) {
      result = result.filter(exp => exp.date <= endDate);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else {
        // default date
        comparison = a.date.localeCompare(b.date);
      }
      return sortOrder.toLowerCase() === 'desc' ? -comparison : comparison;
    });

    // Pagination
    const total = result.length;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const totalPages = Math.ceil(total / limitNum) || 1;
    const offset = (pageNum - 1) * limitNum;
    const paginatedItems = result.slice(offset, offset + limitNum);

    // Get unique categories and months available in all records
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
      availableMonths: allMonths
    };
  }
}

// Singleton instance
const dataStore = new DataStore();

module.exports = dataStore;
