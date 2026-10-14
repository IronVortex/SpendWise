import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatINR, formatMonthName, CATEGORY_COLORS } from '../utils/formatters';
import {
  AlertTriangle,
  Flame,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  Filter,
  CheckCircle2
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
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-20 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-44 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const { thresholdPercent = 25.0, totalAlerts = 0, alerts = [] } = alertsData || {};

  // Extract unique categories in alerts
  const categoriesInAlerts = Array.from(new Set(alerts.map(a => a.category))).sort();

  // Filter alerts
  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'CRITICAL' && a.severity !== 'critical') return false;
    if (filterSeverity === 'HIGH' && a.severity !== 'high') return false;
    if (filterSeverity === 'WARNING' && a.severity !== 'warning') return false;
    if (filterSeverity === 'CURRENT' && !a.isCurrentMonth) return false;
    if (filterCategory !== 'ALL' && a.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Banner / Logic Card */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-rose-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Strict Rule Engine</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              Budget Surge Detection (&gt; {thresholdPercent}%)
            </h2>
            <p className="text-xs text-rose-200/90 max-w-xl mt-1 leading-relaxed">
              Every category spending is tracked consecutively across months. Whenever spending surges strictly beyond 25.0% MoM, an automated budgeting alert is generated with actionable saving strategies.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/15">
            <div className="text-center">
              <span className="text-2xl font-black font-mono text-white block">
                {totalAlerts}
              </span>
              <span className="text-[11px] text-rose-200 uppercase tracking-wider font-semibold">
                Total Triggered
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Category Pills */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Severity Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
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
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterSeverity === tab.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
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
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-800">
            No Alerts Found For Selected Filters
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Try switching filters or upload a new CSV dataset to analyze more months.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAlerts.map((alert) => {
            const severityStyle = {
              critical: {
                badge: 'bg-rose-600 text-white',
                border: 'border-rose-300 shadow-rose-100',
                label: 'Critical Surge'
              },
              high: {
                badge: 'bg-amber-600 text-white',
                border: 'border-amber-300 shadow-amber-50',
                label: 'High Surge'
              },
              warning: {
                badge: 'bg-orange-500 text-white',
                border: 'border-orange-200 shadow-orange-50',
                label: 'Moderate Surge'
              }
            }[alert.severity] || {
              badge: 'bg-rose-600 text-white',
              border: 'border-rose-300',
              label: 'Alert'
            };

            const maxAmt = Math.max(alert.previousAmount, alert.currentAmount, 1);
            const prevPct = Math.min(100, (alert.previousAmount / maxAmt) * 100);
            const currPct = Math.min(100, (alert.currentAmount / maxAmt) * 100);

            return (
              <div
                key={alert.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${severityStyle.border}`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[alert.category] || '#64748b' }}
                    />
                    <h3 className="font-extrabold text-slate-800 text-base">
                      {alert.category}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${severityStyle.badge}`}>
                      {severityStyle.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                      +{alert.percentageIncrease.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Timeline Tag */}
                <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {formatMonthName(alert.previousMonth)}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-rose-700">
                    {formatMonthName(alert.currentMonth)}
                  </span>
                  {alert.isCurrentMonth && (
                    <span className="ml-auto px-2 py-0.5 text-[10px] bg-slate-100 text-slate-700 rounded font-medium">
                      Current Cycle
                    </span>
                  )}
                </div>

                {/* Visual Bar Comparison */}
                <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2.5">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-500">Previous Outlay:</span>
                      <span className="font-mono font-bold text-slate-700">
                        {formatINR(alert.previousAmount)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-400 rounded-full"
                        style={{ width: `${prevPct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-rose-700 font-semibold">Surged Outlay:</span>
                      <span className="font-mono font-extrabold text-rose-700">
                        {formatINR(alert.currentAmount)}
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-rose-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-600 rounded-full"
                        style={{ width: `${currPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-500">Net Increase:</span>
                    <span className="font-mono font-bold text-rose-600">
                      +{formatINR(alert.difference)}
                    </span>
                  </div>
                </div>

                {/* Actionable Recommendation Box */}
                <div className="mt-4 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-slate-700 leading-relaxed">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
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
