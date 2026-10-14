import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatINR, formatMonthName, CATEGORY_COLORS } from '../utils/formatters';
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Printer,
  FileSpreadsheet,
  Layers
} from 'lucide-react';

export default function ReportsPage() {
  const { overview, datasetInfo } = useData();
  const [selectedMonth, setSelectedMonth] = useState('');

  const trendData = overview?.trendData || [];
  const monthlyBreakdown = overview?.monthlyBreakdown || {};
  const alerts = overview?.recentAlerts || [];

  // If no month selected, pick the latest month available
  const availableMonths = Object.keys(monthlyBreakdown).sort();
  const activeMonth = selectedMonth || (availableMonths.length > 0 ? availableMonths[availableMonths.length - 1] : '');

  const currentMonthData = monthlyBreakdown[activeMonth] || {};
  const currentMonthCategories = Object.entries(currentMonthData).map(([cat, amt]) => ({
    name: cat,
    amount: amt
  })).sort((a, b) => b.amount - a.amount);

  const monthTotal = currentMonthCategories.reduce((sum, c) => sum + c.amount, 0);

  // Filter alerts for the selected month
  const monthAlerts = alerts.filter(a => a.month === activeMonth);

  function handlePrint() {
    window.print();
  }

  function handleExportReportCSV() {
    if (!activeMonth || currentMonthCategories.length === 0) return;
    const headers = ['Month', 'Category', 'Amount (INR)'];
    const rows = currentMonthCategories.map(c => [activeMonth, `"${c.name}"`, c.amount]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SpendSense_Statement_${activeMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Financial Statements & Executive Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official monthly audit and pattern summary for academic and evaluation reporting
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month Selector */}
          <select
            value={activeMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            {availableMonths.map(m => (
              <option key={m} value={m}>
                {formatMonthName(m)} ({m})
              </option>
            ))}
          </select>

          <button
            onClick={handleExportReportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-lg transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden print:bg-white print:text-black print:border-none">
        {/* Document Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-sm">
                ₹
              </span>
              <span className="text-lg font-bold text-white tracking-wide">SpendSense</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Personal Expense Pattern Analysis Statement • Academic Big Data Project
            </p>
          </div>

          <div className="text-right text-xs text-slate-400">
            <div><span className="text-slate-500">Report Month:</span> <strong className="text-white">{formatMonthName(activeMonth)}</strong></div>
            <div><span className="text-slate-500">Dataset:</span> <span className="font-mono text-emerald-400">{datasetInfo?.filename || 'sample_dataset.csv'}</span></div>
          </div>
        </div>

        {/* Summary Metric Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 border-b border-slate-800">
          <div className="p-5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Spending ({formatMonthName(activeMonth)})
            </span>
            <div className="text-2xl font-bold text-white mt-1 font-mono">
              {formatINR(monthTotal)}
            </div>
          </div>

          <div className="p-5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Active Expense Categories
            </span>
            <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
              {currentMonthCategories.length}
            </div>
          </div>

          <div className="p-5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Budgeting Anomalies (&gt;25% Surge)
            </span>
            <div className={`text-2xl font-bold mt-1 font-mono ${monthAlerts.length > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {monthAlerts.length}
            </div>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="p-6">
          <h2 className="text-sm font-semibold text-white mb-4 tracking-wide">
            Category Spending Distribution
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Percentage of Month</th>
                  <th className="py-2.5 px-4 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {currentMonthCategories.map((c) => {
                  const pct = monthTotal > 0 ? ((c.amount / monthTotal) * 100).toFixed(1) : 0;
                  return (
                    <tr key={c.name} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-medium text-slate-200 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[c.name] || '#10b981' }}
                        />
                        <span>{c.name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        <div className="flex items-center gap-2 max-w-xs">
                          <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-200">
                        {formatINR(c.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts in this Month */}
        {monthAlerts.length > 0 && (
          <div className="p-6 border-t border-slate-800 bg-rose-950/20">
            <div className="flex items-center gap-2 mb-3 text-rose-300 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>MoM Budgeting Alerts Recorded in this Month</span>
            </div>
            <div className="space-y-2">
              {monthAlerts.map((alt, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-900 border border-rose-900/60 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="font-bold text-white">{alt.category}</span>
                    <span className="text-slate-400 ml-2">
                      Surged from {formatINR(alt.previousAmount)} to {formatINR(alt.currentAmount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      +{alt.increasePercentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Audit Signoff */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500">
          <div>Report generated securely by SpendSense pattern engine</div>
          <div>Strict &gt;25% MoM budgeting policy active</div>
        </div>
      </div>
    </div>
  );
}
