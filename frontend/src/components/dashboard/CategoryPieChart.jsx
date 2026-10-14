import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { formatINR, CATEGORY_COLORS } from '../../utils/formatters';

export default function CategoryPieChart({ categoryData = [] }) {
  if (!categoryData || categoryData.length === 0) {
    return (
      <div className="h-72 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        <p className="text-sm font-medium">No category breakdown available.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs border border-slate-700">
          <p className="font-bold text-slate-200">{data.name}</p>
          <p className="text-emerald-400 font-mono font-semibold mt-1">
            {formatINR(data.value)} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 h-80">
      <div className="w-full md:w-1/2 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CATEGORY_COLORS[entry.name] || '#94a3b8'}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category List & Percentages */}
      <div className="w-full md:w-1/2 space-y-2 max-h-64 overflow-y-auto pr-2">
        {categoryData.slice(0, 6).map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[item.name] || '#94a3b8' }}
              />
              <span className="font-medium text-slate-700 truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-400">{item.percentage}%</span>
              <span className="font-semibold text-slate-800 font-mono">
                {formatINR(item.value, { compact: true })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
