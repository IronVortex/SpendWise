import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../common/BrandLogo';
import { Database, Shield, Github, Layers, FileCode } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <BrandLogo size="sm" theme="dark" showBadge={false} />
            <p className="text-slate-400 text-xs leading-relaxed">
              Personal Expense Pattern Analysis system for detecting Month-on-Month expenditure spikes exceeding 25% with distributed big-data streaming.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              <span>Full-Stack Analytics Ready</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Application
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link to="/dashboard" className="hover:text-emerald-400 transition-colors">
                  Overview Dashboard
                </Link>
              </li>
              <li>
                <Link to="/analysis" className="hover:text-emerald-400 transition-colors">
                  Month-on-Month Trends
                </Link>
              </li>
              <li>
                <Link to="/alerts" className="hover:text-emerald-400 transition-colors">
                  Budget Alerts (&gt;25% Spikes)
                </Link>
              </li>
              <li>
                <Link to="/transactions" className="hover:text-emerald-400 transition-colors">
                  Transaction Ledger
                </Link>
              </li>
              <li>
                <Link to="/datasets" className="hover:text-emerald-400 transition-colors">
                  Kaggle CSV Importer
                </Link>
              </li>
            </ul>
          </div>

          {/* Big Data Engineering Stack */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Big Data Architecture
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>Apache Kafka Ingestion (v7.5)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>Hadoop HDFS Storage (v3.3.6)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Hadoop Java MapReduce Engine</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Local Demo Node.js Analytics Fallback</span>
              </li>
            </ul>
          </div>

          {/* Academic Context */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Academic Project
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Developed as a collegiate Big Data Analytics (BDA) mini-project showcasing distributed data streaming, MapReduce batch algorithms, and interactive fintech SaaS visualization.
            </p>
            <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono">
              Threshold: &gt; 25.0% MoM Increase
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            SpendSense • Personal Expense Pattern Analysis Project.
          </div>
          <div className="flex items-center space-x-6">
            <span>React + Vite</span>
            <span>•</span>
            <span>Tailwind CSS</span>
            <span>•</span>
            <span>Express</span>
            <span>•</span>
            <span>Apache Hadoop</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
