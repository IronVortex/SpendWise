/**
 * API Client for Personal Expense Pattern Analysis Backend
 */

const API_BASE = '/api';

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || (data.errors ? data.errors.join(', ') : 'API Request Failed'));
  }
  return data;
}

export const api = {
  // Health
  getHealth: () => fetch(`${API_BASE}/health`).then(handleResponse),

  // Analytics
  getOverview: () => fetch(`${API_BASE}/analytics/overview`).then(handleResponse),
  getTrends: () => fetch(`${API_BASE}/analytics/trends`).then(handleResponse),
  getMonthlyComparison: () => fetch(`${API_BASE}/analytics/monthly-comparison`).then(handleResponse),
  getAlerts: () => fetch(`${API_BASE}/analytics/alerts`).then(handleResponse),

  // Expenses CRUD & Dataset Management
  getExpenses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/expenses?${query}`).then(handleResponse);
  },
  getDatasetInfo: () => fetch(`${API_BASE}/expenses/dataset-info`).then(handleResponse),

  addExpense: (expense) =>
    fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
    }).then(handleResponse),

  // CSV Inspection (pre-upload preview and column detection)
  inspectCsvFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE}/expenses/inspect`, {
      method: 'POST',
      body: formData
    }).then(handleResponse);
  },

  inspectCsvText: (csvText, fileName = 'pasted_dataset.csv') => {
    return fetch(`${API_BASE}/expenses/inspect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv: csvText, fileName })
    }).then(handleResponse);
  },

  // Dataset Upload with Column Mapping
  uploadCsvFile: (file, options = {}) => {
    const { columnMapping = null, replace = true, datasetName = '' } = options;
    const formData = new FormData();
    formData.append('file', file);
    if (columnMapping) {
      formData.append('columnMapping', JSON.stringify(columnMapping));
    }
    if (datasetName) {
      formData.append('datasetName', datasetName);
    }
    return fetch(`${API_BASE}/expenses/upload?replace=${replace}`, {
      method: 'POST',
      body: formData
    }).then(handleResponse);
  },

  uploadCsvText: (csvText, options = {}) => {
    const { columnMapping = null, replace = true, datasetName = 'pasted_dataset.csv' } = options;
    return fetch(`${API_BASE}/expenses/upload?replace=${replace}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv: csvText, columnMapping, replace, datasetName })
    }).then(handleResponse);
  },

  loadSampleData: () =>
    fetch(`${API_BASE}/expenses/sample`, { method: 'POST' }).then(handleResponse),

  resetSampleData: () =>
    fetch(`${API_BASE}/expenses/reset-sample`, { method: 'POST' }).then(handleResponse),

  clearExpenses: () =>
    fetch(`${API_BASE}/expenses`, { method: 'DELETE' }).then(handleResponse),

  // Big Data Pipeline
  getBigDataStatus: () => fetch(`${API_BASE}/bigdata/status`).then(handleResponse),
  streamToKafka: (transactions = null) =>
    fetch(`${API_BASE}/bigdata/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions })
    }).then(handleResponse),
  getStreamLogs: () => fetch(`${API_BASE}/bigdata/stream/logs`).then(handleResponse),
  getMapReduceResults: () => fetch(`${API_BASE}/bigdata/mapreduce-output`).then(handleResponse)
};
