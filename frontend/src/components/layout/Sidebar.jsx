import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  TableProperties,
  AlertTriangle,
  ReceiptText,
  UploadCloud,
  Layers,
  Database,
  Radio
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, alertCount = 0 }) {
  const navItems = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Trends & Analytics', icon: TrendingUp },
    { id: 'comparison', label: 'Month-on-Month Table', icon: TableProperties },
    {
      id: 'alerts',
      label: 'Spending Alerts (>25%)',
      icon: AlertTriangle,
      badge: alertCount > 0 ? alertCount : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'upload', label: 'CSV Upload & Validate', icon: UploadCloud },
    { id: 'bigdata', label: 'Big Data Pipeline', icon: Layers, highlight: true }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <span className="text-xl font-bold">₹</span>
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide leading-tight">
            Personal Expense
          </h1>
          <p className="text-xs text-emerald-400 font-medium tracking-wider uppercase">
            Pattern Analysis
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Financial Analytics
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge !== null && (
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    isActive ? 'bg-white text-emerald-700' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Academic Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-300">Big Data Tech Stack</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Apache Kafka • Hadoop HDFS • MapReduce (Java) • React + Node.js
        </p>
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
          <span>College Mini-Project</span>
          <span className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono">v1.0</span>
        </div>
      </div>
    </aside>
  );
}
