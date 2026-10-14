import React from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatINR, formatMonthName, CATEGORY_COLORS } from '../../utils/formatters';

export default function ExpenseTrendChart({ trendData = [] }) {
  if (!trendData || trendData.length === 0) {
    return (
      <div className="h-72 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        <p className="text-sm font-medium">No monthly data available to display trend.</p>
        <p className="text-xs text-slate-400 mt-1">Upload CSV or click "Load Sample Data".</p>
      </div>
    );
  }

  // Format data for chart display
  const chartData = trendData.map(item => ({
    ...item,
    formattedMonth: formatMonthName(item.month)
  }));

  // Dynamic category lines present in trend data
  const categoryKeys = Object.keys(trendData[0] || {}).filter(
    k => k !== 'month' && k !== 'total' && k !== 'formattedMonth'
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700 min-w-[180px]">
          <p className="font-bold text-slate-200 border-b border-slate-700 pb-1 mb-2">
            {label}
          </p>
          <div className="space-y-1.5">
            {payload.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}:
                </span>
                <span className="font-semibold text-white font-mono">
                  {formatINR(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="formattedMonth"
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }}
          />
          <Area
            type="monotone"
            dataKey="total"
            name="Total Spend"
            stroke="#10b981"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorTotal)"
          />
          {categoryKeys.map((catKey) => (
            <Line
              key={catKey}
              type="monotone"
              dataKey={catKey}
              name={catKey}
              stroke={CATEGORY_COLORS[catKey] || '#6366f1'}
              strokeWidth={1.8}
              strokeDasharray="4 4"
              dot={{ r: 3 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
