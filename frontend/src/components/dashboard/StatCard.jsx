import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositiveIsGood = false,
  badgeText,
  color = 'emerald'
}) {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'hover:border-emerald-200'
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'hover:border-blue-200'
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'hover:border-rose-200'
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      border: 'hover:border-purple-200'
    }
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm transition-all duration-200 hover:shadow-md ${scheme.border}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1 tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${scheme.bg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
        <span className="text-slate-500">{subtitle}</span>

        {trend !== undefined && trend !== null && (
          <span
            className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
              trend > 0
                ? trendPositiveIsGood
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
                : trend < 0
                ? trendPositiveIsGood
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {trend > 0 ? `+${trend}%` : `${trend}%`} MoM
          </span>
        )}

        {badgeText && (
          <span className="font-semibold px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700">
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
