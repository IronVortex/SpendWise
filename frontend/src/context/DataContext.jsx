import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [overview, setOverview] = useState(null);
  const [bigDataStatus, setBigDataStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  function showToast(message, type = 'info') {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  }

  async function refreshData() {
    try {
      setLoading(true);
      const [overviewRes, statusRes] = await Promise.all([
        api.getOverview().catch(err => ({ success: false, message: err.message })),
        api.getBigDataStatus().catch(err => ({ success: false, message: err.message }))
      ]);

      if (overviewRes && overviewRes.success) {
        setOverview(overviewRes.data);
      }
      if (statusRes && statusRes.success) {
        setBigDataStatus(statusRes);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  async function loadSampleData() {
    try {
      const res = await api.loadSampleData();
      if (res.success) {
        showToast(`Reset to sample dataset: ${res.count} transactions loaded!`, 'success');
        await refreshData();
      }
    } catch (err) {
      showToast('Error loading sample data: ' + err.message, 'error');
    }
  }

  async function clearData() {
    try {
      const res = await api.clearExpenses();
      if (res.success) {
        showToast(res.message, 'info');
        await refreshData();
      }
    } catch (err) {
      showToast('Error clearing data: ' + err.message, 'error');
    }
  }

  return (
    <DataContext.Provider
      value={{
        overview,
        datasetInfo: overview?.datasetInfo,
        bigDataStatus,
        loading,
        toast,
        showToast,
        refreshData,
        loadSampleData,
        clearData
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
