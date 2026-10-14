import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatINR } from '../utils/formatters';
import {
  Layers,
  Radio,
  Database,
  Cpu,
  FileCode,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Server,
  Terminal,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

export default function BigDataPipelinePage({ bigDataStatus, onRefreshStatus }) {
  const [mapReduceData, setMapReduceData] = useState(null);
  const [streamLogs, setStreamLogs] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [streamResult, setStreamResult] = useState(null);
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline', 'mapreduce', 'kafka', 'commands'
  const [copiedCmd, setCopiedCmd] = useState(null);

  useEffect(() => {
    loadMapReduceOutput();
    loadStreamLogs();
  }, []);

  async function loadMapReduceOutput() {
    try {
      const res = await api.getMapReduceResults();
      if (res.success) {
        setMapReduceData(res.data);
      }
    } catch (err) {
      console.error('Failed to load MapReduce output:', err);
    }
  }

  async function loadStreamLogs() {
    try {
      const res = await api.getStreamLogs();
      if (res.success) {
        setStreamLogs(res.logs || []);
      }
    } catch (err) {
      console.error('Failed to load stream logs:', err);
    }
  }

  async function handleTriggerStream() {
    try {
      setStreaming(true);
      setStreamResult(null);
      const res = await api.streamToKafka();
      setStreamResult(res);
      await loadStreamLogs();
    } catch (err) {
      setStreamResult({ success: false, message: err.message });
    } finally {
      setStreaming(false);
    }
  }

  function copyToClipboard(text, id) {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  }

  const isDemo = bigDataStatus?.mode !== 'BIG_DATA_CONNECTED';

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Infrastructure Mode Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
          isDemo
            ? 'bg-amber-50/90 border-amber-300 text-amber-950'
            : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-xl mt-0.5 ${
              isDemo ? 'bg-amber-200/70 text-amber-800' : 'bg-emerald-200/70 text-emerald-800'
            }`}
          >
            {isDemo ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm uppercase tracking-wide">
                {isDemo
                  ? 'System Status: Local Demo Engine Active'
                  : 'System Status: Live Big Data Cluster Connected'}
              </h3>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isDemo ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                }`}
              >
                {bigDataStatus?.mode || 'LOCAL_DEMO'}
              </span>
            </div>
            <p className="text-xs mt-1 text-slate-700 leading-relaxed max-w-3xl">
              {bigDataStatus?.message ||
                'Apache Kafka broker and Hadoop HDFS cluster are offline. Analytical calculations and >25% budgeting alerts are served directly by the Node.js engine, while real Hadoop MapReduce artifacts (part-r-00000) are verified below.'}
            </p>
          </div>
        </div>

        <button
          onClick={onRefreshStatus}
          className="px-3.5 py-1.5 bg-white text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold border border-slate-300 flex items-center gap-1.5 shrink-0 shadow-sm active:scale-95 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Ping Cluster</span>
        </button>
      </div>

      {/* Services Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Kafka Service */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                <Radio className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs text-slate-800">Apache Kafka</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                bigDataStatus?.services?.kafka?.status === 'CONNECTED'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {bigDataStatus?.services?.kafka?.status || 'DISCONNECTED'}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 space-y-1">
            <p>Role: Real-time Ingestion</p>
            <p>Topic: <code className="font-mono text-[11px] text-slate-700">expense-transactions</code></p>
            <p>Port: 9092 (PLAINTEXT)</p>
          </div>
        </div>

        {/* HDFS Service */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Database className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs text-slate-800">Hadoop HDFS</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                bigDataStatus?.services?.hdfs?.status === 'CONNECTED'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {bigDataStatus?.services?.hdfs?.status || 'DISCONNECTED'}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 space-y-1">
            <p>Role: Distributed Storage</p>
            <p>HDFS Path: <code className="font-mono text-[11px] text-slate-700">/user/hadoop/expenses/</code></p>
            <p>WebHDFS Port: 9870</p>
          </div>
        </div>

        {/* MapReduce Service */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs text-slate-800">Hadoop MapReduce</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
              JAVA COMPILED
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 space-y-1">
            <p>Role: Batch Pattern Analysis</p>
            <p>Rule: <code className="font-mono text-[11px] text-slate-700">MoM Increase &gt; 25.0%</code></p>
            <p>Driver: ExpenseAnalysisDriver.java</p>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        {[
          { id: 'pipeline', label: 'Pipeline Architecture & Workflow' },
          { id: 'mapreduce', label: 'MapReduce Output Inspector (part-r-00000)' },
          { id: 'kafka', label: 'Kafka Live Stream Simulator' },
          { id: 'commands', label: 'College Execution Commands' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Pipeline Architecture */}
      {activeTab === 'pipeline' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              End-to-End Big Data Architecture Flow
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              How transactions flow from user input to distributed storage and batch computation
            </p>
          </div>

          {/* Diagram Flow Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            {/* Step 1 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold mb-2">
                1
              </span>
              <p className="font-bold text-slate-800">Expense Ingestion</p>
              <p className="text-slate-500 text-[11px] mt-1">
                CSV upload or manual entry via React dashboard. Validated line-by-line.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 relative">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold mb-2">
                2
              </span>
              <p className="font-bold text-purple-900">Kafka Streaming</p>
              <p className="text-purple-700 text-[11px] mt-1">
                Published to Kafka topic <code className="font-mono">expense-transactions</code> with key partitioning.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 relative">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold mb-2">
                3
              </span>
              <p className="font-bold text-blue-900">Hadoop HDFS</p>
              <p className="text-blue-700 text-[11px] mt-1">
                Kafka Consumer subscribes and buffers batches into distributed HDFS files.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 relative">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold mb-2">
                4
              </span>
              <p className="font-bold text-emerald-900">Hadoop MapReduce</p>
              <p className="text-emerald-700 text-[11px] mt-1">
                Java MapReduce parses months, sums category totals, and computes MoM delta.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 relative">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold mb-2">
                5
              </span>
              <p className="font-bold text-rose-900">&gt; 25% Alert Engine</p>
              <p className="text-rose-700 text-[11px] mt-1">
                Reducer emits flagged spikes into <code className="font-mono">part-r-00000</code> and syncs with dashboard.
              </p>
            </div>
          </div>

          {/* MapReduce Logic Explanation Box */}
          <div className="p-4 bg-slate-900 text-white rounded-xl text-xs space-y-2">
            <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
              <FileCode className="w-4 h-4" />
              <span>MapReduce Mathematical Algorithm Specification</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300 pt-1">
              <div className="space-y-1">
                <p className="font-semibold text-white">ExpenseMapper.java:</p>
                <p className="font-mono text-[11px] bg-slate-950 p-2 rounded border border-slate-800">
                  Input: date, category, amount, ...<br />
                  Extract: month = date.substring(0, 7)<br />
                  Emit: &lt;Category, month:amount&gt;
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-white">ExpenseReducer.java:</p>
                <p className="font-mono text-[11px] bg-slate-950 p-2 rounded border border-slate-800">
                  Collects all monthly amounts in TreeMap<br />
                  For each consecutive month pair:<br />
                  diff = curr - prev<br />
                  pct = (diff / prev) * 100<br />
                  if pct &gt; 25.0: flag = ALERT_SURGE_GT_25
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: MapReduce Output Inspector */}
      {activeTab === 'mapreduce' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Hadoop MapReduce Output File Inspector
              </h3>
              <p className="text-xs text-slate-500">
                Direct view of the actual Hadoop MapReduce output artifact (<code className="font-mono">part-r-00000</code>)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                Source: {mapReduceData?.source || 'part-r-00000'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                {mapReduceData?.alertCount || 0} Alerts Detected
              </span>
            </div>
          </div>

          {/* Side by side raw vs parsed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Raw MapReduce Text Output */}
            <div>
              <div className="flex items-center justify-between bg-slate-800 text-slate-300 px-3 py-1.5 rounded-t-lg text-[11px] font-mono">
                <span>HDFS Output: /user/hadoop/expenses/output/part-r-00000</span>
                <span>Tab-Separated</span>
              </div>
              <pre className="bg-slate-950 text-emerald-400 p-3 rounded-b-lg font-mono text-[11px] overflow-x-auto max-h-96 border border-slate-800 leading-relaxed">
                {mapReduceData?.rawOutput || 'No MapReduce output file found.'}
              </pre>
            </div>

            {/* Parsed Reducer Records Table */}
            <div>
              <div className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-t-lg text-[11px] font-semibold border-t border-x border-slate-200">
                Parsed by Backend Analytical Engine
              </div>
              <div className="border border-slate-200 rounded-b-lg overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Month</th>
                      <th className="py-2 px-3 text-right">Spend (₹)</th>
                      <th className="py-2 px-3 text-right">MoM Δ</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {(mapReduceData?.records || []).map((r, i) => (
                      <tr
                        key={i}
                        className={r.isAlert ? 'bg-rose-50 font-semibold' : 'hover:bg-slate-50'}
                      >
                        <td className="py-1.5 px-3">{r.category}</td>
                        <td className="py-1.5 px-3 font-mono">{r.month}</td>
                        <td className="py-1.5 px-3 text-right font-mono">{formatINR(r.totalAmount)}</td>
                        <td className="py-1.5 px-3 text-right font-mono">{r.momPercentChange}</td>
                        <td className="py-1.5 px-3">
                          {r.isAlert ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-600 text-white">
                              ALERT &gt; 25%
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Normal</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Kafka Stream Simulator */}
      {activeTab === 'kafka' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Apache Kafka Streaming Simulator
              </h3>
              <p className="text-xs text-slate-500">
                Publish transactions into the Kafka pipeline and observe event ingestion receipts
              </p>
            </div>

            <button
              onClick={handleTriggerStream}
              disabled={streaming}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${streaming ? 'animate-spin' : ''}`} />
              <span>{streaming ? 'Publishing Stream...' : 'Stream Transactions to Kafka'}</span>
            </button>
          </div>

          {streamResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs ${
                streamResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <p className="font-bold">
                {streamResult.success ? 'Streaming Event Dispatched' : 'Streaming Failed'}
              </p>
              <p className="mt-0.5">{streamResult.message}</p>
            </div>
          )}

          {/* Live Event Terminal */}
          <div className="mt-4">
            <div className="bg-slate-900 text-slate-300 px-4 py-2 rounded-t-xl text-xs font-mono flex items-center justify-between border-b border-slate-800">
              <span className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kafka Consumer Event Ingestion Feed</span>
              </span>
              <span className="text-[11px] text-slate-500">
                {streamLogs.length} events logged
              </span>
            </div>
            <div className="bg-slate-950 text-slate-200 p-4 rounded-b-xl font-mono text-xs max-h-72 overflow-y-auto space-y-2 border border-slate-800">
              {streamLogs.length === 0 ? (
                <p className="text-slate-500 italic">
                  No streaming events logged yet. Click "Stream Transactions to Kafka" above to initiate a publish cycle.
                </p>
              ) : (
                streamLogs.map((log) => (
                  <div key={log.id} className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="text-emerald-400 font-bold">[{log.mode}]</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300 mt-1">
                      Published <span className="text-white font-bold">{log.count}</span> records to topic{' '}
                      <span className="text-purple-400 font-bold">{log.topic}</span>
                    </p>
                    {log.note && <p className="text-amber-400 text-[10px] mt-0.5">{log.note}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: College Execution Commands */}
      {activeTab === 'commands' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Step-by-Step Terminal Commands (Windows 11 & College Demo)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Exact instructions to execute the project in Local Demo Mode or with full Kafka + Hadoop clusters.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Command 1: Backend */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">1. Run Backend Server (Express & Analytical Engine)</span>
                <button
                  onClick={() => copyToClipboard('cd backend\nnpm install\nnode src/server.js', 'cmd1')}
                  className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200"
                  title="Copy command"
                >
                  {copiedCmd === 'cmd1' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg font-mono text-[11px]">
                cd backend{"\n"}npm.cmd install{"\n"}node src/server.js
              </pre>
            </div>

            {/* Command 2: Frontend */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">2. Run Frontend Dashboard (React + Vite)</span>
                <button
                  onClick={() => copyToClipboard('cd frontend\nnpm install\nnpm run dev', 'cmd2')}
                  className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200"
                  title="Copy command"
                >
                  {copiedCmd === 'cmd2' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg font-mono text-[11px]">
                cd frontend{"\n"}npm.cmd install{"\n"}npm.cmd run dev
              </pre>
            </div>

            {/* Command 3: Tests */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">3. Run Automated Project Unit & Integration Tests</span>
                <button
                  onClick={() => copyToClipboard('cd backend\nnpm test', 'cmd3')}
                  className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200"
                  title="Copy command"
                >
                  {copiedCmd === 'cmd3' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg font-mono text-[11px]">
                cd backend{"\n"}npm.cmd test
              </pre>
            </div>

            {/* Command 4: Docker Kafka & Zookeeper */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">4. (Optional) Launch Apache Kafka via Docker</span>
                <button
                  onClick={() => copyToClipboard('cd bigdata/docker\ndocker-compose up -d', 'cmd4')}
                  className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200"
                  title="Copy command"
                >
                  {copiedCmd === 'cmd4' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <pre className="bg-slate-900 text-purple-400 p-2.5 rounded-lg font-mono text-[11px]">
                cd bigdata/docker{"\n"}docker-compose up -d
              </pre>
            </div>

            {/* Command 5: MapReduce Build & Run */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">5. (Optional) Build & Run MapReduce on Hadoop Cluster</span>
                <button
                  onClick={() => copyToClipboard('cd bigdata/mapreduce\nmvn clean package\nhadoop jar target/expense-mapreduce-1.0-SNAPSHOT.jar com.bda.expense.ExpenseAnalysisDriver /expenses/input /expenses/output', 'cmd5')}
                  className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200"
                  title="Copy command"
                >
                  {copiedCmd === 'cmd5' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <pre className="bg-slate-900 text-blue-400 p-2.5 rounded-lg font-mono text-[11px]">
                cd bigdata/mapreduce{"\n"}mvn clean package{"\n"}hadoop jar target/expense-mapreduce-1.0-SNAPSHOT.jar com.bda.expense.ExpenseAnalysisDriver /expenses/input /expenses/output
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
