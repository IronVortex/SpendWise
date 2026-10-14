import React from 'react';
import { AlertTriangle, ArrowUpRight, ChevronRight, CheckCircle2 } from 'lucide-react';
import { formatINR, formatMonthName } from '../../utils/formatters';

export default function RecentAlertsWidget({ alerts = [], onNavigateToAlerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">No Spending Spikes Detected</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          All categories are within the normal budget threshold (spending increases did not strictly exceed 25% MoM).
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Active Budgeting Alerts</h3>
            <p className="text-xs text-slate-500">
              Triggered when month-on-month category spending surged by &gt; 25%
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToAlerts}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline"
        >
          <span>View All Alerts</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3">
        {alerts.slice(0, 4).map((alert) => (
          <div
            key={alert.id}
            className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50/70 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">
                    {alert.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" />
                    +{alert.percentageIncrease.toFixed(1)}%
                  </span>
                  {alert.isCurrentMonth && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                      Latest Month
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatMonthName(alert.previousMonth)} ({formatINR(alert.previousAmount)}) →{' '}
                  {formatMonthName(alert.currentMonth)} ({formatINR(alert.currentAmount)})
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-rose-600">
                  +{formatINR(alert.difference)}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-2 bg-white/70 p-2 rounded-lg border border-rose-100/80 leading-relaxed">
              💡 <span className="font-medium text-slate-700">Recommendation:</span>{' '}
              {alert.recommendation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
