import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MonthlyComparisonPage from './pages/MonthlyComparisonPage';
import AlertsPage from './pages/AlertsPage';
import TransactionsPage from './pages/TransactionsPage';
import UploadPage from './pages/UploadPage';
import BigDataPipelinePage from './pages/BigDataPipelinePage';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [overview, setOverview] = useState(null);
  const [bigDataStatus, setBigDataStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  async function refreshData() {
    try {
      setLoading(true);
      const [overviewRes, statusRes] = await Promise.all([
        api.getOverview(),
        api.getBigDataStatus()
      ]);

      if (overviewRes.success) setOverview(overviewRes.data);
      if (statusRes.success) setBigDataStatus(statusRes);
    } catch (err) {
      console.error('Failed to fetch app data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  async function handleLoadSample() {
    try {
      const res = await api.loadSampleData();
      if (res.success) {
        showToast(`Loaded ${res.count} curated transactions across 5 months!`);
        await refreshData();
      }
    } catch (err) {
      showToast('Error loading sample data: ' + err.message);
    }
  }

  async function handleClearData() {
    if (window.confirm('Are you sure you want to clear all transactions?')) {
      try {
        const res = await api.clearExpenses();
        if (res.success) {
          showToast(res.message);
          await refreshData();
        }
      } catch (err) {
        showToast('Error clearing data: ' + err.message);
      }
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-in slide-in-from-bottom duration-200">
          {toastMessage}
        </div>
      )}

      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertCount={overview?.alertCount || 0}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          activeTab={activeTab}
          bigDataStatus={bigDataStatus}
          onLoadSample={handleLoadSample}
          onClearData={handleClearData}
          loading={loading}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50/60">
          {activeTab === 'dashboard' && (
            <DashboardPage
              overview={overview}
              loading={loading}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsPage />}

          {activeTab === 'comparison' && <MonthlyComparisonPage />}

          {activeTab === 'alerts' && <AlertsPage />}

          {activeTab === 'transactions' && (
            <TransactionsPage onDataModified={refreshData} />
          )}

          {activeTab === 'upload' && (
            <UploadPage onUploadSuccess={() => {
              showToast('CSV uploaded and validated successfully!');
              refreshData();
            }} />
          )}

          {activeTab === 'bigdata' && (
            <BigDataPipelinePage
              bigDataStatus={bigDataStatus}
              onRefreshStatus={refreshData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
