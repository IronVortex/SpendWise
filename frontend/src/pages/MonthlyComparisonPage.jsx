import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatINR, formatMonthName, CATEGORY_COLORS } from '../utils/formatters';
import { TableProperties, AlertTriangle, ArrowUpRight, ArrowDownRight, Search, Info } from 'lucide-react';

export default function MonthlyComparisonPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadComparison() {
      try {
        setLoading(true);
        const res = await api.getMonthlyComparison();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load comparison:', err);
      } finally {
        setLoading(false);
      }
    }
    loadComparison();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-12 bg-slate-900 border border-slate-800 rounded-xl" />
        <div className="h-96 bg-slate-900 border border-slate-800 rounded-xl" />
      </div>
    );
  }

  const { months = [], matrix = [], monthlyTotals = {} } = data || {};

  const filteredMatrix = matrix.filter(row =>
    row.category.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Information Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs flex items-start gap-3 shadow-sm">
        <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-semibold text-white">Month-on-Month (MoM) Consecutive Comparison Matrix</p>
          <p className="text-slate-400 mt-0.5">
            Evaluates chronological spending shifts between consecutive months. Cells highlighted with{' '}
            <span className="font-bold text-rose-300 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-800">
              alert badges
            </span>{' '}
            indicate an expenditure surge strictly exceeding the project's <span className="font-bold text-white">25.0% threshold</span>.
          </p>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Filter category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> &gt; 25% Alert
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> &le; 25% Increase
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Spending Drop
          </span>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-300 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 sticky left-0 bg-slate-950 z-10 min-w-[180px]">
                  Category
                </th>
                {months.map((m, idx) => (
                  <th key={m} className="py-3.5 px-4 text-right min-w-[150px]">
                    <div className="text-white">{formatMonthName(m)}</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      {idx === 0 ? 'Baseline' : `vs ${formatMonthName(months[idx - 1])}`}
                    </div>
                  </th>
                ))}
                <th className="py-3.5 px-4 text-right min-w-[120px] text-emerald-400">Total Outlay</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80">
              {filteredMatrix.map((row) => (
                <tr key={row.category} className="hover:bg-slate-800/40 transition-colors">
                  {/* Category Name Sticky Column */}
                  <td className="py-3 px-4 font-semibold text-slate-200 sticky left-0 bg-slate-900 shadow-sm flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[row.category] || '#64748b' }}
                    />
                    <span className="truncate">{row.category}</span>
                  </td>

                  {/* Monthly Values */}
                  {months.map((m, idx) => {
                    const cell = row.monthly[m];
                    if (!cell) return <td key={m} className="py-3 px-4 text-right text-slate-600">—</td>;

                    const isFirstMonth = idx === 0;
                    const pct = cell.percentChange;
                    const isAlert = cell.isAlert;

                    return (
                      <td
                        key={m}
                        className={`py-3 px-4 text-right ${
                          isAlert ? 'bg-rose-950/30 border-x border-rose-900/40' : ''
                        }`}
                      >
                        <div className="font-mono font-bold text-slate-200 text-[13px]">
                          {formatINR(cell.amount)}
                        </div>

                        {!isFirstMonth && pct !== null && (
                          <div className="mt-1 flex items-center justify-end gap-1">
                            {isAlert ? (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                +{pct}% (ALERT)
                              </span>
                            ) : pct > 0 ? (
                              <span className="inline-flex items-center text-[10px] text-amber-400 font-medium">
                                <ArrowUpRight className="w-2.5 h-2.5" />
                                +{pct}%
                              </span>
                            ) : pct < 0 ? (
                              <span className="inline-flex items-center text-[10px] text-emerald-400 font-medium">
                                <ArrowDownRight className="w-2.5 h-2.5" />
                                {pct}%
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500">0.0%</span>
                            )}
                          </div>
                        )}

                        {isFirstMonth && (
                          <div className="text-[10px] text-slate-500 mt-1 italic">
                            Baseline
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* All-time Total Column */}
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-white bg-slate-950/40">
                    {formatINR(row.total)}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Total Footer Row */}
            <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700 text-slate-200">
              <tr>
                <td className="py-3.5 px-4 sticky left-0 bg-slate-950 uppercase tracking-wider text-[11px]">
                  Total Monthly Expenditure
                </td>
                {months.map((m) => (
                  <td key={m} className="py-3.5 px-4 text-right font-mono font-extrabold text-emerald-400">
                    {formatINR(monthlyTotals[m] || 0)}
                  </td>
                ))}
                <td className="py-3.5 px-4 text-right font-mono font-extrabold text-emerald-300 bg-slate-950">
                  {formatINR(Object.values(monthlyTotals).reduce((a, b) => a + b, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
