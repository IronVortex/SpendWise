import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ExpenseTrendChart from '../components/dashboard/ExpenseTrendChart';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';
import {
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Layers,
  Database,
  Cpu,
  BarChart3,
  Calendar,
  Sparkles,
  CheckCircle2,
  Table,
  ArrowUpRight,
  Clock,
  Radio
} from 'lucide-react';

export default function LandingPage() {
  // Sample data specifically curated for the hero & preview dashboard display
  const previewTrendData = [
    { month: '2026-01', total: 49899, 'Rent & Housing': 22000, Groceries: 8500, 'Dining Out': 4500, Shopping: 6200 },
    { month: '2026-02', total: 50700, 'Rent & Housing': 22000, Groceries: 8400, 'Dining Out': 7800, Shopping: 3800 },
    { month: '2026-03', total: 56600, 'Rent & Housing': 22000, Groceries: 8500, 'Dining Out': 4900, Shopping: 12500 },
    { month: '2026-04', total: 49000, 'Rent & Housing': 22000, Groceries: 8500, 'Dining Out': 4300, Shopping: 4100 },
    { month: '2026-05', total: 50700, 'Rent & Housing': 22000, Groceries: 11200, 'Dining Out': 4700, Shopping: 3500 }
  ];

  const previewCategoryData = [
    { name: 'Rent & Housing', value: 110000, percentage: 42.8 },
    { name: 'Groceries', value: 45100, percentage: 17.6 },
    { name: 'Shopping', value: 30100, percentage: 11.7 },
    { name: 'Dining Out', value: 26200, percentage: 10.2 },
    { name: 'Utilities & Bills', value: 15750, percentage: 6.1 }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Sticky Navigation Bar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Subtle background ambient gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-600/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-teal-600/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Header */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Personal Expense Pattern Analysis</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">MoM &gt; 25% Alert Engine</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
              Understand your spending. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Change your habits.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
              SpendSense analyzes personal expenses across consecutive billing cycles to uncover structural budget shifts. Whenever spending in any category surges by strictly more than 25%, automated budgeting alerts and financial guidance are generated.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>Start Analyzing</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>Explore Live Dashboard</span>
              </Link>
            </div>
          </div>

          {/* Interactive Live Product Dashboard Preview (Actual React Components) */}
          <div className="mt-16 rounded-2xl p-1.5 bg-gradient-to-b from-slate-700/50 via-slate-800/20 to-transparent shadow-2xl border border-slate-800">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 sm:p-7 text-left space-y-6">
              {/* Preview Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Live Analytics Preview
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                      Active: 5 Months Tracked
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Monthly Spending Pattern Analysis
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Threshold: &gt; 25.0% MoM
                  </span>
                </div>
              </div>

              {/* Stat Cards Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Total Expenditure
                  </span>
                  <span className="text-xl font-extrabold text-white font-mono mt-1 block">
                    ₹2,56,899.00
                  </span>
                  <span className="text-[11px] text-emerald-400 mt-1 block font-medium">
                    All recorded cycles
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Latest Month Outlay
                  </span>
                  <span className="text-xl font-extrabold text-white font-mono mt-1 block">
                    ₹50,700.00
                  </span>
                  <span className="text-[11px] text-amber-400 mt-1 block font-medium">
                    +3.5% vs previous
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Transactions Ingested
                  </span>
                  <span className="text-xl font-extrabold text-white font-mono mt-1 block">
                    61
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Across 8 categories
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-500/30 bg-rose-950/10">
                  <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">
                    Budget Alerts Triggered
                  </span>
                  <span className="text-xl font-extrabold text-rose-400 font-mono mt-1 block">
                    6 Spikes
                  </span>
                  <span className="text-[11px] text-rose-300 mt-1 block font-medium">
                    &gt; 25.0% MoM increase
                  </span>
                </div>
              </div>

              {/* Chart & Alert Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                {/* Trend Chart (2 Cols) */}
                <div className="lg:col-span-2 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-bold text-slate-200">Expenditure Trajectory (₹)</span>
                    <span className="text-slate-500 font-mono">Area Curve & Top Categories</span>
                  </div>
                  <ExpenseTrendChart trendData={previewTrendData} />
                </div>

                {/* Example Spending Alert (1 Col) */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-rose-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Example Active Alert</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                        Critical Surge
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 mt-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">Shopping</span>
                        <span className="font-mono font-bold text-rose-400">+228.9%</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Feb: ₹3,800 → Mar: ₹12,500 (+₹8,700)
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-xs text-slate-300 mt-3 leading-relaxed">
                      💡 <span className="font-semibold text-emerald-400">Recommendation:</span> Discretionary shopping surged sharply. Implement a 48-hour cooling-off rule on cart checkouts.
                    </div>
                  </div>

                  <Link
                    to="/dashboard"
                    className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold text-center transition-colors block"
                  >
                    View All 6 Alerts in Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Product Introduction (Problem vs Pattern Analysis) */}
      <section className="py-20 bg-slate-900/60 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Why Traditional Trackers Fail
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Standard expense apps list transactions in a vacuum. They show numbers without historical context, making it nearly impossible to identify creeping budget inflation until savings are depleted.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional Trackers */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5 text-slate-400 text-sm font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <span>Traditional Expense Trackers</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Static lists of transactions without chronological context.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Arbitrary fixed monthly budgets that ignore lifestyle shifts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>No automated detection of month-on-month behavioral spikes.</span>
                </li>
              </ul>
            </div>

            {/* SpendSense Pattern Analysis */}
            <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-400 text-sm font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>SpendSense Consecutive Pattern Engine</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Tracks chronological spending shifts between consecutive billing months.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Mathematically detects surges strictly &gt; 25% with non-judgmental recommendations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Processes real Kaggle datasets and bank exports with custom column mapping.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Built for Deep Personal Financial Clarity
            </h2>
            <p className="text-xs text-slate-400">
              Engineered with full-stack React analytics and distributed big-data architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Monthly Spending Analysis</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculates category-wise expenditures over time. Visualizes long-term trends and cyclical spending variations through Recharts area and stacked charts.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Category-Wise Insights</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Standardizes transaction records into canonical financial categories (Groceries, Housing, Dining, Utilities) and identifies spending concentration.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Smart Budget Alerts (&gt;25%)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Flags any category where expenditure surged by strictly more than 25% MoM. Distinguishes moderate, high, and critical spikes with tailored financial guidance.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Kaggle Dataset Import</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload real CSV datasets downloaded from Kaggle. Inspect headers, preview rows, map custom columns, and scrub currency symbols ($/₹/Rs) automatically.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Table className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Transaction Ledger & Search</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Search, filter by month and category, sort by amounts, and paginate across large datasets. Add manual transactions or export ledgers to CSV.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Data-Driven Reports</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate clean, structured monthly financial summaries, MoM matrix tables, and exportable audit reports ready for college presentations or personal review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-slate-900/60 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Three Steps to Expense Pattern Discovery
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3 relative">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm">
                1
              </span>
              <h3 className="font-bold text-white text-base">Import Expense Data</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Use our pre-loaded curated 5-month dataset or upload real CSV files from Kaggle or bank portals with automatic column mapping.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3 relative">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm">
                2
              </span>
              <h3 className="font-bold text-white text-base">Analyze Monthly Patterns</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The engine normalizes records into calendar months (YYYY-MM), sums category spending, and calculates consecutive Month-on-Month deltas.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3 relative">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm">
                3
              </span>
              <h3 className="font-bold text-white text-base">Understand Shifts & Alerts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review interactive charts, inspect the MoM comparison matrix, and act upon budgeting alerts whenever a category surge exceeds 25%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section id="preview" className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Fintech Product Interface
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Category Distribution & Analytics
            </h2>
            <p className="text-xs text-slate-400">
              Interactive breakdowns showcasing spending concentration and category benchmarks.
            </p>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  All-Time Spending Distribution
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  Interactive donut visualization rendered with Recharts and Indian Rupee (₹) numbering.
                </p>
                <CategoryPieChart categoryData={previewCategoryData} />
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-300 font-bold">
                    <span>Rent & Housing (Fixed Outlay)</span>
                    <span className="font-mono text-white">₹1,10,000 (42.8%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '42.8%' }} />
                  </div>
                  <p className="text-[11px] text-slate-500">Steady ₹22,000 monthly outlay — 0% MoM increase (No alerts).</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-300 font-bold">
                    <span>Groceries (Pantry & Provisions)</span>
                    <span className="font-mono text-white">₹45,100 (17.6%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '17.6%' }} />
                  </div>
                  <p className="text-[11px] text-slate-500">Festival surge in May 2026 (+31.8% &gt; 25% Alert triggered).</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/20 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-300 font-bold">
                    <span>Shopping (Discretionary)</span>
                    <span className="font-mono text-rose-400">₹30,100 (11.7%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500 rounded-full" style={{ width: '11.7%' }} />
                  </div>
                  <p className="text-[11px] text-slate-500">Major festive surge in March 2026 (+228.9% Critical Alert).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section (Big Data Stack) */}
      <section id="technology" className="py-20 bg-slate-900/60 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Technical Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Distributed Big Data Engineering Pipeline
            </h2>
            <p className="text-xs text-slate-400">
              Engineered to process expense streams at scale, with seamless local fallback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-400 uppercase tracking-wider text-[11px]">Streaming Ingestion</span>
                <Radio className="w-4 h-4 text-purple-400" />
              </div>
              <h4 className="font-bold text-white text-sm">Apache Kafka</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Ingests transactions into topic <code className="font-mono text-slate-300">expense-transactions</code> with category keys.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-400 uppercase tracking-wider text-[11px]">Distributed Storage</span>
                <Database className="w-4 h-4 text-blue-400" />
              </div>
              <h4 className="font-bold text-white text-sm">Hadoop HDFS</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Buffers and stores raw transaction records in distributed HDFS directory <code className="font-mono text-slate-300">/expenses/input/</code>.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">Batch Computation</span>
                <Cpu className="w-4 h-4 text-emerald-400" />
              </div>
              <h4 className="font-bold text-white text-sm">Java MapReduce</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Mapper tokenizes months & categories; Reducer computes MoM deltas and flags &gt; 25% surges into <code className="font-mono text-slate-300">part-r-00000</code>.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">High Availability</span>
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </div>
              <h4 className="font-bold text-white text-sm">Local Engine Fallback</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                When Kafka/Hadoop cluster is offline, Node.js serves real-time analysis transparently without fabricating cluster connections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900 text-center relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Analyze Your Personal Expense Patterns?
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Get started immediately using our pre-loaded curated 5-month dataset, or upload your own Kaggle CSV to discover your spending trends.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/signup"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              Create Free Account
            </Link>
            <Link
              to="/dashboard"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold active:scale-95 transition-all"
            >
              Enter Dashboard Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
