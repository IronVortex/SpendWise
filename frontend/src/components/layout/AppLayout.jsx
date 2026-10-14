import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { BrandLogo } from '../common/BrandLogo';
import {
  LayoutDashboard,
  TrendingUp,
  TableProperties,
  AlertTriangle,
  ReceiptText,
  UploadCloud,
  Layers,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Server,
  RefreshCw,
  RotateCcw,
  User,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { bigDataStatus, datasetInfo, loadSampleData, refreshData, loading, toast } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/analytics', label: 'Trends & Analytics', icon: TrendingUp },
    { to: '/comparison', label: 'MoM Comparison', icon: TableProperties },
    { to: '/alerts', label: 'Spending Alerts', icon: AlertTriangle, hasAlertBadge: true },
    { to: '/transactions', label: 'Transactions', icon: ReceiptText },
    { to: '/upload', label: 'Dataset Manager', icon: UploadCloud },
    { to: '/bigdata', label: 'Big Data Pipeline', icon: Layers, highlight: true },
    { to: '/reports', label: 'Executive Reports', icon: FileText },
    { to: '/settings', label: 'Settings & Status', icon: Settings }
  ];

  async function handleLoadSample() {
    setSampleLoading(true);
    await loadSampleData();
    setSampleLoading(false);
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 border border-emerald-500/50 shadow-2xl rounded-xl text-emerald-300 text-sm animate-in slide-in-from-top-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900/90 border-r border-slate-800/80 backdrop-blur-md select-none shrink-0">
        {/* Brand header */}
        <div className="p-5 border-b border-slate-800/80">
          <BrandLogo size="md" />
        </div>

        {/* Dataset Pill Status */}
        <div className="px-4 py-3 border-b border-slate-800/50 bg-slate-950/40">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Active Dataset</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
              datasetInfo?.isSample
                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
            }`}>
              {datasetInfo?.isSample ? 'Sample Data' : 'Custom Upload'}
            </span>
          </div>
          <div className="text-xs font-mono text-slate-200 truncate" title={datasetInfo?.filename}>
            {datasetInfo?.filename || 'No dataset loaded'}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Main Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? item.highlight
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-emerald-400 border border-slate-700 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.highlight && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                    Hadoop
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Big Data Quick Indicator */}
        <div className="p-3 mx-3 mb-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pipeline Status</span>
            </div>
            <span className={`w-2 h-2 rounded-full ${
              bigDataStatus?.services?.kafka?.healthy && bigDataStatus?.services?.hadoopHDFS?.healthy
                ? 'bg-emerald-400'
                : 'bg-amber-400'
            }`} />
          </div>
          <p className="text-[11px] text-slate-400">
            {bigDataStatus?.services?.kafka?.healthy ? 'Cluster Connected' : 'Local Demo Processing'}
          </p>
        </div>

        {/* User profile & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-600/50 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'User'}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-slate-900/80 border-b border-slate-800/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>SpendSense</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-emerald-400 font-semibold capitalize">
                {location.pathname.replace('/', '') || 'dashboard'}
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLoadSample}
              disabled={sampleLoading}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-amber-400 ${sampleLoading ? 'animate-spin' : ''}`} />
              <span>Reset Sample</span>
            </button>

            <button
              onClick={() => refreshData()}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg border border-emerald-500/30 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
          </div>
        </header>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4 z-10">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <BrandLogo size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 py-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                          isActive
                            ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                            : 'text-slate-400 hover:bg-slate-800/40'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-300 truncate">{user?.name}</div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-rose-400 hover:bg-slate-800 rounded-md"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subpage Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
