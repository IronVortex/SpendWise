import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Authenticated Pages
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MonthlyComparisonPage from './pages/MonthlyComparisonPage';
import AlertsPage from './pages/AlertsPage';
import TransactionsPage from './pages/TransactionsPage';
import UploadPage from './pages/UploadPage';
import BigDataPipelinePage from './pages/BigDataPipelinePage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

// Adapter wrappers to bind DataContext into subpages that receive props
function DashboardWrapper() {
  const { overview, loading } = useData();
  return <DashboardPage overview={overview} loading={loading} />;
}

function TransactionsWrapper() {
  const { refreshData } = useData();
  return <TransactionsPage onDataModified={refreshData} />;
}

function UploadWrapper() {
  const { overview, loadSampleData, refreshData, showToast } = useData();
  return (
    <UploadPage
      datasetInfo={overview?.datasetInfo}
      onLoadSample={loadSampleData}
      onUploadSuccess={() => {
        showToast('Kaggle dataset imported, mapped & analyzed successfully!');
        refreshData();
      }}
    />
  );
}

function BigDataWrapper() {
  const { bigDataStatus, refreshData } = useData();
  return (
    <BigDataPipelinePage
      bigDataStatus={bigDataStatus}
      onRefreshStatus={refreshData}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Public Marketing & Authentication Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Authenticated Dashboard Shell */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardWrapper />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/comparison" element={<MonthlyComparisonPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/transactions" element={<TransactionsWrapper />} />
              <Route path="/upload" element={<UploadWrapper />} />
              <Route path="/datasets" element={<UploadWrapper />} />
              <Route path="/bigdata" element={<BigDataWrapper />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
