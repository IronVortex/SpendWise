/**
 * SpendSense API Client
 * Manages HTTP communication with the Node.js / Express backend.
 * Automatically attaches JWT Bearer token from localStorage for protected endpoints.
 */

const API_BASE = '/api';

function getStoredToken() {
  return localStorage.getItem('spendsense_token');
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('spendsense_token', token);
  } else {
    localStorage.removeItem('spendsense_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is plain object and not FormData, stringify
  if (options.body && !(options.body instanceof FormData) && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || (data.errors ? data.errors.join(', ') : `HTTP ${res.status} Request Failed`));
  }
  return data;
}

export const api = {
  // Authentication
  login: (credentials) =>
    request('/auth/login', { method: 'POST', body: credentials }),

  register: (userData) =>
    request('/auth/register', { method: 'POST', body: userData }),

  getMe: () =>
    request('/auth/me', { method: 'GET' }),

  forgotPassword: (data) =>
    request('/auth/forgot-password', { method: 'POST', body: data }),

  resetPassword: (data) =>
    request('/auth/reset-password', { method: 'POST', body: data }),

  updateProfile: (profileData) =>
    request('/auth/profile', { method: 'PUT', body: profileData }),

  // Health
  getHealth: () => request('/health', { method: 'GET' }),

  // Analytics
  getOverview: () => request('/analytics/overview', { method: 'GET' }),
  getTrends: () => request('/analytics/trends', { method: 'GET' }),
  getMonthlyComparison: () => request('/analytics/monthly-comparison', { method: 'GET' }),
  getAlerts: () => request('/analytics/alerts', { method: 'GET' }),

  // Expenses CRUD & Dataset Management
  getExpenses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/expenses?${query}`, { method: 'GET' });
  },

  getDatasetInfo: () => request('/expenses/dataset-info', { method: 'GET' }),

  addExpense: (expense) =>
    request('/expenses', { method: 'POST', body: expense }),

  // CSV Inspection (pre-upload preview and column detection)
  inspectCsvFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/expenses/inspect', { method: 'POST', body: formData });
  },

  inspectCsvText: (csvText, fileName = 'pasted_dataset.csv') => {
    return request('/expenses/inspect', {
      method: 'POST',
      body: { csv: csvText, fileName }
    });
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
    return request(`/expenses/upload?replace=${replace}`, {
      method: 'POST',
      body: formData
    });
  },

  uploadCsvText: (csvText, options = {}) => {
    const { columnMapping = null, replace = true, datasetName = 'pasted_dataset.csv' } = options;
    return request(`/expenses/upload?replace=${replace}`, {
      method: 'POST',
      body: { csv: csvText, columnMapping, replace, datasetName }
    });
  },

  loadSampleData: () =>
    request('/expenses/sample', { method: 'POST' }),

  resetSampleData: () =>
    request('/expenses/reset-sample', { method: 'POST' }),

  clearExpenses: () =>
    request('/expenses', { method: 'DELETE' }),

  // Big Data Pipeline
  getBigDataStatus: () => request('/bigdata/status', { method: 'GET' }),

  streamToKafka: (transactions = null) =>
    request('/bigdata/stream', { method: 'POST', body: { transactions } }),

  getStreamLogs: () => request('/bigdata/stream/logs', { method: 'GET' }),

  getMapReduceResults: () => request('/bigdata/mapreduce-output', { method: 'GET' })
};
