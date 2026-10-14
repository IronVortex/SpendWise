import React, { useState } from 'react';
import {
  RotateCcw,
  Trash2,
  Server,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  FileSpreadsheet,
  UploadCloud,
  Database
} from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  bigDataStatus,
  datasetInfo,
  onLoadSample,
  onClearData,
  loading
}) {
  const [showInfoModal, setShowInfoModal] = useState(false);

  const pageTitles = {
    dashboard: {
      title: 'Financial Overview Dashboard',
      subtitle: 'Real-time metrics, monthly expense trends, and budgeting alert summaries'
    },
    analytics: {
      title: 'Trends & Category Breakdown',
      subtitle: 'Granular multi-month expenditure distribution and category analysis'
    },
    comparison: {
      title: 'Month-on-Month Comparison Table',
      subtitle: 'Chronological spending matrix with automatic >25% increase detection'
    },
    alerts: {
      title: 'Budgeting Spikes & Alerts (>25%)',
      subtitle: 'Categories where expenditure surged by strictly more than 25% with financial advice'
    },
    transactions: {
      title: 'Transaction Manager',
      subtitle: 'Search, filter, inspect, and manually insert expense records'
    },
    upload: {
      title: 'Kaggle Dataset Upload & Validation',
      subtitle: 'Upload CSV, auto-detect or map columns, scrub currency & analyze actual data'
    },
    bigdata: {
      title: 'Big Data Streaming & MapReduce Pipeline',
      subtitle: 'Apache Kafka streaming, Hadoop HDFS storage, and Java MapReduce execution verification'
    }
  };

  const currentInfo = pageTitles[activeTab] || {
    title: 'Personal Expense Pattern Analysis',
    subtitle: 'Big Data Analytics Project'
  };

  const isDemo = bigDataStatus?.mode !== 'BIG_DATA_CONNECTED';
  const isSample = datasetInfo?.isSample !== false;
  const datasetName = datasetInfo?.datasetName || 'personal_expenses_sample.csv';
  const recordCount = datasetInfo?.totalRecords || 0;

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 z-20 shadow-sm">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {currentInfo.title}
          </h2>

          {/* Active Dataset Badge */}
          <div
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              isSample
                ? 'bg-slate-100 text-slate-700 border-slate-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm'
            }`}
            title={`Active Dataset: ${datasetName} (${recordCount} records)`}
          >
            <FileSpreadsheet className={`w-3.5 h-3.5 ${isSample ? 'text-slate-500' : 'text-emerald-600'}`} />
            <span className="max-w-[170px] truncate">{datasetName}</span>
            <span className="text-[10px] font-normal px-1 rounded bg-black/5">
              {isSample ? 'Sample' : 'Uploaded'}
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{currentInfo.subtitle}</p>
      </div>

      {/* Status & Quick Actions */}
      <div className="flex items-center flex-wrap gap-2.5">
        {/* Upload Dataset Button */}
        <button
          onClick={() => setActiveTab('upload')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 active:scale-95 transition-all"
          title="Upload and analyze a Kaggle or custom CSV dataset"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload Dataset</span>
        </button>

        {/* Big Data Status Pill */}
        <button
          onClick={() => setShowInfoModal(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            isDemo
              ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
              : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
          }`}
          title="Click to view Big Data pipeline architecture and status"
        >
          {isDemo ? (
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span>
            {isDemo
              ? 'Mode: Local Demo (Big Data Offline)'
              : 'Mode: Big Data Connected'}
          </span>
          <HelpCircle className="w-3 h-3 text-slate-400 ml-0.5" />
        </button>

        {/* Reset to Sample Data Button */}
        <button
          onClick={onLoadSample}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-50"
          title="Reset to default curated 5-month sample dataset"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reset Sample</span>
        </button>

        {/* Clear Data Button */}
        <button
          onClick={onClearData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 active:scale-95 transition-all disabled:opacity-50"
          title="Clear all transactions from memory and disk"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Data</span>
        </button>
      </div>

      {/* Big Data Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800">Big Data Services Status</h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div
                className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                  isDemo
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                <p className="font-semibold mb-1">
                  {isDemo
                    ? 'Currently Operating in Local Demo Mode'
                    : 'Connected to Big Data Cluster'}
                </p>
                <p>
                  {isDemo
                    ? 'External Apache Kafka and Hadoop HDFS services are currently offline. High-performance Node.js analytical engine is serving real-time calculations. Uploaded datasets are automatically normalized and made available to Kafka and Hadoop MapReduce.'
                    : 'Successfully connected to live Kafka broker and Hadoop HDFS distributed cluster.'}
                </p>
              </div>

              {/* Service Cards */}
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-700 block">Apache Kafka</span>
                    <span className="text-slate-500 text-[11px]">Port 9092 • Topic: expense-transactions</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      bigDataStatus?.services?.kafka?.status === 'CONNECTED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {bigDataStatus?.services?.kafka?.status || 'DISCONNECTED'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-700 block">Hadoop HDFS</span>
                    <span className="text-slate-500 text-[11px]">Port 9870 (WebHDFS) • /user/hadoop/expenses/</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      bigDataStatus?.services?.hdfs?.status === 'CONNECTED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {bigDataStatus?.services?.hdfs?.status || 'DISCONNECTED'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-700 block">Hadoop MapReduce (Java)</span>
                    <span className="text-slate-500 text-[11px]">ExpenseAnalysisDriver • 25% Alert Logic</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-blue-100 text-blue-700">
                    CONFIGURED
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
