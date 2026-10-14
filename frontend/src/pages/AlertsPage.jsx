import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatINR, formatMonthName, CATEGORY_COLORS } from '../utils/formatters';
import {
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Filter,
  CheckCircle2,
  TrendingUp,
  Percent
} from 'lucide-react';

export default function AlertsPage() {
  const [alertsData, setAlertsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');

  useEffect(() => {
    async function loadAlerts() {
      try {
        setLoading(true);
        const res = await api.getAlerts();
        if (res.success) {
          setAlertsData(res.data);
        }
      } catch (err) {
        console.error('Failed to load alerts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-20 bg-slate-900 border border-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-44 bg-slate-900 border border-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const { thresholdPercent = 25.0, totalAlerts = 0, alerts = [] } = alertsData || {};

  const categoriesInAlerts = Array.from(new Set(alerts.map(a => a.category))).sort();

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'CRITICAL' && a.severity !== 'critical') return false;
    if (filterSeverity === 'HIGH' && a.severity !== 'high') return false;
    if (filterSeverity === 'WARNING' && a.severity !== 'warning') return false;
    if (filterSeverity === 'CURRENT' && !a.isCurrentMonth) return false;
    if (filterCategory !== 'ALL' && a.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Banner / Logic Card */}
      <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 text-white rounded-xl p-6 shadow-md border border-rose-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold uppercase tracking-wider mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Budgeting Rule Engine</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white font-display">
              Expense Surge Detection (&gt; {thresholdPercent}% MoM)
            </h2>
            <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
              Every category spending is tracked consecutively across months. Whenever spending surges strictly beyond 25.0% MoM, an automated alert is triggered with tailored mitigation advice.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 px-5 py-3 rounded-xl border border-slate-800">
            <div className="text-center">
              <span className="text-2xl font-black font-mono text-white block">
                {totalAlerts}
              </span>
              <span className="text-[10px] text-rose-300 uppercase tracking-widest font-semibold">
                Anomalies Triggered
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Category Pills */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Severity Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Severity:
          </span>
          {[
            { id: 'ALL', label: `All (${alerts.length})` },
            { id: 'CURRENT', label: 'Latest Month' },
            { id: 'CRITICAL', label: 'Critical (>75%)' },
            { id: 'HIGH', label: 'High (50-75%)' },
            { id: 'WARNING', label: 'Warning (25-50%)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterSeverity(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterSeverity === tab.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-950 text-white font-medium"
          >
            <option value="ALL">All Categories</option>
            {categoriesInAlerts.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Alerts Grid */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-white">
            No Alerts Found For Selected Filters
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Spending remained within budget, or filter criteria excluded recorded alerts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAlerts.map((alert) => {
            const severityStyle = {
              critical: {
                badge: 'bg-rose-950 text-rose-300 border border-rose-800',
                border: 'border-rose-900/50 hover:border-rose-700',
                label: 'Critical Surge'
              },
              high: {
                badge: 'bg-amber-950 text-amber-300 border border-amber-800',
                border: 'border-amber-900/50 hover:border-amber-700',
                label: 'High Surge'
              },
              warning: {
                badge: 'bg-orange-950 text-orange-300 border border-orange-800',
                border: 'border-orange-900/50 hover:border-orange-700',
                label: 'Moderate Surge'
              }
            }[alert.severity] || {
              badge: 'bg-rose-950 text-rose-300 border border-rose-800',
              border: 'border-rose-900/50',
              label: 'Alert'
            };

            const maxAmt = Math.max(alert.previousAmount, alert.currentAmount, 1);
            const prevPct = Math.min(100, (alert.previousAmount / maxAmt) * 100);
            const currPct = Math.min(100, (alert.currentAmount / maxAmt) * 100);

            return (
              <div
                key={alert.id}
                className={`bg-slate-900 rounded-xl border p-5 shadow-sm transition-all ${severityStyle.border}`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[alert.category] || '#64748b' }}
                    />
                    <h3 className="font-bold text-white text-base">
                      {alert.category}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${severityStyle.badge}`}>
                      {severityStyle.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                      +{alert.percentageIncrease.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Timeline Tag */}
                <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-medium text-slate-300">
                    {formatMonthName(alert.previousMonth)}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                  <span className="font-bold text-rose-400">
                    {formatMonthName(alert.currentMonth)}
                  </span>
                  {alert.isCurrentMonth && (
                    <span className="ml-auto px-2 py-0.5 text-[10px] bg-slate-950 text-slate-400 border border-slate-800 rounded font-medium">
                      Latest Month
                    </span>
                  )}
                </div>

                {/* Visual Bar Comparison */}
                <div className="mt-4 p-3.5 bg-slate-950 rounded-lg border border-slate-800/80 space-y-2.5">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Previous Outlay:</span>
                      <span className="font-mono font-bold text-slate-300">
                        {formatINR(alert.previousAmount)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-500 rounded-full"
                        style={{ width: `${prevPct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-rose-400 font-semibold">Surged Outlay:</span>
                      <span className="font-mono font-extrabold text-rose-400">
                        {formatINR(alert.currentAmount)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${currPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-[11px]">
                    <span className="text-slate-400">Net Increase:</span>
                    <span className="font-mono font-bold text-rose-400">
                      +{formatINR(alert.difference)}
                    </span>
                  </div>
                </div>

                {/* Actionable Recommendation Box */}
                <div className="mt-4 p-3 bg-emerald-950/20 rounded-lg border border-emerald-900/40 text-xs text-slate-300 leading-relaxed">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Actionable Budgeting Advice</span>
                  </div>
                  <p>{alert.recommendation}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
