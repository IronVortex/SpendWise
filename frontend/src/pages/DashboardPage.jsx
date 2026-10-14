import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  CalendarDays,
  Receipt,
  AlertTriangle,
  ArrowRight,
  UploadCloud,
  FileSpreadsheet,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Download
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import ExpenseTrendChart from '../components/dashboard/ExpenseTrendChart';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';
import RecentAlertsWidget from '../components/dashboard/RecentAlertsWidget';
import { formatINR, formatMonthName } from '../utils/formatters';
import { useData } from '../context/DataContext';

export default function DashboardPage({ overview: propOverview, loading: propLoading }) {
  const dataContext = useData();
  const overview = propOverview || dataContext.overview;
  const loading = propLoading !== undefined ? propLoading : dataContext.loading;
  const { loadSampleData } = dataContext;

  if (loading && !overview) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-xl" />
          ))}
        </div>
        <div className="h-80 bg-slate-900 border border-slate-800 rounded-xl" />
      </div>
    );
  }

  const {
    totalSpent = 0,
    currentMonthSpent = 0,
    momChangePercent = 0,
    transactionCount = 0,
    alertCount = 0,
    latestMonth = '',
    topCategory = null,
    trendData = [],
    categoryDistribution = [],
    recentAlerts = [],
    datasetInfo = {}
  } = overview || {};

  const isSample = datasetInfo?.isSample !== false;
  const datasetName = datasetInfo?.datasetName || datasetInfo?.filename || 'personal_expenses_sample.csv';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Active Dataset Alert / Header Banner */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${isSample ? 'bg-slate-800 text-slate-300' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`}>
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Active Financial Dataset
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  isSample
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50'
                    : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                }`}
              >
                {isSample ? 'Curated Sample Data' : 'Custom Kaggle Dataset'}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mt-0.5 font-mono">
              {datasetName}
            </h3>
            <p className="text-xs text-slate-400">
              {transactionCount.toLocaleString('en-IN')} transactions loaded • Strict &gt;25% MoM alert threshold
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/upload"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Kaggle CSV</span>
          </Link>
          {!isSample && (
            <button
              onClick={() => loadSampleData()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Sample</span>
            </button>
          )}
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Lifetime Spent"
          value={formatINR(totalSpent)}
          subtitle={`Across ${trendData.length} recorded months`}
          icon={Wallet}
          color="emerald"
        />

        <StatCard
          title={`Spent in ${formatMonthName(latestMonth) || 'Latest Month'}`}
          value={formatINR(currentMonthSpent)}
          subtitle={
            momChangePercent !== null ? (
              <span className={`inline-flex items-center gap-1 font-semibold ${momChangePercent > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {momChangePercent > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {momChangePercent > 0 ? `+${momChangePercent}%` : `${momChangePercent}%`} vs prior month
              </span>
            ) : 'First recorded month'
          }
          icon={CalendarDays}
          color={momChangePercent > 25 ? 'rose' : 'blue'}
        />

        <StatCard
          title="Total Transactions"
          value={transactionCount.toLocaleString('en-IN')}
          subtitle={
            topCategory ? `Top category: ${topCategory.name} (${formatINR(topCategory.amount)})` : 'All transactions'
          }
          icon={Receipt}
          color="indigo"
        />

        <StatCard
          title="Budgeting Alerts (>25%)"
          value={alertCount}
          subtitle={alertCount > 0 ? 'Categories with spending surge' : 'All categories within budget'}
          icon={AlertTriangle}
          color={alertCount > 0 ? 'amber' : 'slate'}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">
                Monthly Spending Trajectory
              </h2>
              <p className="text-xs text-slate-400">
                Expenditure trends across consecutive calendar months
              </p>
            </div>
            <Link
              to="/analytics"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ExpenseTrendChart data={trendData} />
        </div>

        {/* Category Breakdown Donut (1 Col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">
                Category Distribution
              </h2>
              <p className="text-xs text-slate-400">
                Total spending share by expense category
              </p>
            </div>
          </div>
          <CategoryPieChart data={categoryDistribution} />
        </div>
      </div>

      {/* Bottom Grid: Recent Alerts + Big Data Quick Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white tracking-wide">
                Budgeting Alerts (Spending Increased &gt;25% MoM)
              </h2>
            </div>
            <Link
              to="/alerts"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1"
            >
              <span>View All Alerts</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <RecentAlertsWidget alerts={recentAlerts} />
        </div>

        {/* Big Data Pipeline Callout */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">
              Hadoop MapReduce Pipeline
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Every normalized transaction can be streamed into Kafka, saved to Hadoop HDFS, and processed via Java MapReduce to detect budgeting anomalies.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
            <Link
              to="/bigdata"
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition"
            >
              <span>Inspect Big Data Engine</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/reports"
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-lg transition border border-slate-700"
            >
              <span>View Monthly Reports</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
