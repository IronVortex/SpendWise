import React from 'react';
import {
  Wallet,
  CalendarDays,
  Receipt,
  AlertTriangle,
  ArrowRight,
  UploadCloud,
  FileSpreadsheet,
  Cpu
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import ExpenseTrendChart from '../components/dashboard/ExpenseTrendChart';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';
import RecentAlertsWidget from '../components/dashboard/RecentAlertsWidget';
import { formatINR, formatMonthName } from '../utils/formatters';

export default function DashboardPage({ overview, loading, setActiveTab }) {
  if (loading && !overview) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="h-80 bg-slate-200 rounded-xl" />
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
    recentAlerts = []
  } = overview || {};

  return (
    <div className="p-6 space-y-6">
      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Expenditure"
          value={formatINR(totalSpent)}
          subtitle="All recorded months"
          icon={Wallet}
          color="emerald"
        />

        <StatCard
          title={latestMonth ? `${formatMonthName(latestMonth)} Spend` : 'Current Month'}
          value={formatINR(currentMonthSpent)}
          subtitle="Latest billing cycle"
          icon={CalendarDays}
          trend={momChangePercent}
          trendPositiveIsGood={false}
          color="blue"
        />

        <StatCard
          title="Transactions Recorded"
          value={transactionCount}
          subtitle={topCategory ? `Top: ${topCategory.name}` : 'Expense records'}
          icon={Receipt}
          badgeText={topCategory ? `${topCategory.percentage}% of total` : null}
          color="purple"
        />

        <StatCard
          title="Spending Alerts (>25%)"
          value={alertCount}
          subtitle="Categories exceeding 25% MoM"
          icon={AlertTriangle}
          badgeText={alertCount > 0 ? 'Requires Action' : 'Within Budget'}
          color="rose"
        />
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Monthly Spending Trend
              </h3>
              <p className="text-xs text-slate-500">
                Total expenditure & top category trends over time (₹)
              </p>
            </div>
          </div>
          <ExpenseTrendChart trendData={trendData} />
        </div>

        {/* Category Donut Chart (1 Column) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Category Distribution
            </h3>
            <p className="text-xs text-slate-500">
              All-time spending breakdown by department
            </p>
          </div>
          <CategoryPieChart categoryData={categoryDistribution} />
        </div>
      </div>

      {/* Alerts and Action Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts (2 Columns) */}
        <div className="lg:col-span-2">
          <RecentAlertsWidget
            alerts={recentAlerts}
            onNavigateToAlerts={() => setActiveTab('alerts')}
          />
        </div>

        {/* Quick Action Cards & Academic Project Highlight (1 Column) */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-sm border border-slate-700">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>Big Data Architecture</span>
            </div>
            <h4 className="font-bold text-sm text-white mt-2">
              Hadoop MapReduce & Kafka Ingestion
            </h4>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Transactions are ingested via Kafka topics, buffered to HDFS, and processed by a custom Java MapReduce job evaluating consecutive month spending deltas.
            </p>
            <button
              onClick={() => setActiveTab('bigdata')}
              className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all"
            >
              <span>Explore Big Data Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Quick Shortcuts
            </span>

            <button
              onClick={() => setActiveTab('upload')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 text-xs font-medium transition-all"
            >
              <div className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-emerald-600" />
                <span>Upload Custom Expense CSV</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('comparison')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 text-xs font-medium transition-all"
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Inspect MoM Comparison Table</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
