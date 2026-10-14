import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { api } from '../services/api';
import { formatINR, formatMonthName, CATEGORY_COLORS } from '../utils/formatters';
import { TrendingUp, PieChart as PieIcon, Layers } from 'lucide-react';

export default function AnalyticsPage() {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrends() {
      try {
        setLoading(true);
        const res = await api.getTrends();
        if (res.success) {
          setTrends(res.data);
        }
      } catch (err) {
        console.error('Failed to load trends:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTrends();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-72 bg-slate-200 rounded-xl" />
        <div className="h-64 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  const { months = [], categories = [], monthlyTotals = {}, monthlyCategoryMap = {} } =
    trends || {};

  // Transform data for stacked monthly bar chart
  const stackedData = months.map(m => {
    const item = {
      monthKey: m,
      monthName: formatMonthName(m),
      total: monthlyTotals[m] || 0
    };
    categories.forEach(c => {
      item[c] = monthlyCategoryMap[m]?.[c] || 0;
    });
    return item;
  });

  // Calculate category averages and peaks
  const categoryStats = categories.map(cat => {
    let sum = 0;
    let peakMonth = '';
    let peakAmount = 0;

    months.forEach(m => {
      const amt = monthlyCategoryMap[m]?.[cat] || 0;
      sum += amt;
      if (amt > peakAmount) {
        peakAmount = amt;
        peakMonth = m;
      }
    });

    const avg = months.length > 0 ? sum / months.length : 0;
    return {
      category: cat,
      total: sum,
      average: avg,
      peakMonth,
      peakAmount
    };
  }).sort((a, b) => b.total - a.total);

  return (
    <div className="p-6 space-y-6">
      {/* Stacked Monthly Expenditure Bar Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Monthly Category Breakdown (Stacked)
              </h3>
              <p className="text-xs text-slate-500">
                Visualizing expense composition across all billing cycles
              </p>
            </div>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stackedData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="monthName" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(val, name) => [formatINR(val), name]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {categories.map((cat, idx) => (
                <Bar
                  key={cat}
                  dataKey={cat}
                  stackId="a"
                  fill={CATEGORY_COLORS[cat] || '#64748b'}
                  radius={idx === categories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Deep Dive Stats Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-800">
            Category Expenditure Benchmarks & Averages
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Total Outlay</th>
                <th className="py-3 px-4 text-right">Monthly Average</th>
                <th className="py-3 px-4">Highest Spend Month</th>
                <th className="py-3 px-4 text-right">Peak Monthly Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categoryStats.map((row) => (
                <tr key={row.category} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: CATEGORY_COLORS[row.category] || '#64748b' }}
                    />
                    <span>{row.category}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                    {formatINR(row.total)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    {formatINR(row.average)}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {row.peakMonth ? formatMonthName(row.peakMonth) : '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-rose-600">
                    {formatINR(row.peakAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
