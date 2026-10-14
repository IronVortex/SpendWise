import React, { useState } from 'react';
import { api } from '../services/api';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  Table,
  ArrowRight,
  RotateCcw,
  Sliders,
  Check,
  FileText
} from 'lucide-react';

export default function UploadPage({ onUploadSuccess, onLoadSample, datasetInfo, setActiveTab }) {
  const [file, setFile] = useState(null);
  const [fileSizeText, setFileSizeText] = useState('');
  const [csvText, setCsvText] = useState('');
  const [inputMode, setInputMode] = useState('file'); // 'file' or 'text'
  const [replaceData, setReplaceData] = useState(true);

  // Inspection & Mapping State
  const [inspecting, setInspecting] = useState(false);
  const [inspectionData, setInspectionData] = useState(null);
  const [columnMapping, setColumnMapping] = useState({
    date: '',
    category: '',
    amount: '',
    description: '',
    paymentMethod: ''
  });

  // Upload & Results State
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  // Handle file selection and immediately inspect headers & preview
  async function handleFileSelected(selectedFile) {
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv') && selectedFile.type !== 'text/csv') {
      alert('Please upload a valid .csv file.');
      return;
    }

    setFile(selectedFile);
    setFileSizeText(formatFileSize(selectedFile.size));
    setResult(null);

    // Run inspection
    try {
      setInspecting(true);
      const res = await api.inspectCsvFile(selectedFile);
      if (res.success) {
        setInspectionData(res);
        setColumnMapping({
          date: res.suggestedMapping?.date || '',
          category: res.suggestedMapping?.category || '',
          amount: res.suggestedMapping?.amount || '',
          description: res.suggestedMapping?.description || '',
          paymentMethod: res.suggestedMapping?.paymentMethod || ''
        });
      }
    } catch (err) {
      console.error('Inspection failed:', err);
    } finally {
      setInspecting(false);
    }
  }

  // Handle raw text input inspection
  async function handleTextInspect() {
    if (!csvText.trim()) return;
    try {
      setInspecting(true);
      setResult(null);
      const res = await api.inspectCsvText(csvText, 'pasted_kaggle_data.csv');
      if (res.success) {
        setInspectionData(res);
        setColumnMapping({
          date: res.suggestedMapping?.date || '',
          category: res.suggestedMapping?.category || '',
          amount: res.suggestedMapping?.amount || '',
          description: res.suggestedMapping?.description || '',
          paymentMethod: res.suggestedMapping?.paymentMethod || ''
        });
      }
    } catch (err) {
      alert('Inspection failed: ' + err.message);
    } finally {
      setInspecting(false);
    }
  }

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  }

  // Submit and analyze dataset
  async function handleUploadAndAnalyze(e) {
    e.preventDefault();
    setUploading(true);
    setResult(null);

    try {
      let res;
      const options = {
        columnMapping,
        replace: replaceData,
        datasetName: file ? file.name : 'pasted_dataset.csv'
      };

      if (inputMode === 'file') {
        if (!file) throw new Error('Please select a CSV file first');
        res = await api.uploadCsvFile(file, options);
      } else {
        if (!csvText.trim()) throw new Error('Please paste CSV content');
        res = await api.uploadCsvText(csvText, options);
      }

      setResult(res);
      if (res.success && onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      setResult({
        success: false,
        message: err.message,
        errors: [err.message]
      });
    } finally {
      setUploading(false);
    }
  }

  function downloadKaggleTemplate() {
    const templateContent = `Transaction Date,Expense Category,Transaction Amount,Merchant,Card Type
15/01/2026,Dining Out,1450.00,Swiggy Delivery,Credit Card
16/01/2026,Groceries,3200.00,Supermarket Haul,UPI
18/01/2026,Utilities & Bills,1650.00,Broadband WiFi,UPI
20/01/2026,Shopping,4200.00,Amazon India,Credit Card
22/01/2026,Transportation,1200.00,Metro Recharge,Debit Card
15/02/2026,Dining Out,3100.00,BBQ Nation Dinner,Credit Card
17/02/2026,Groceries,3300.00,Pantry restock,UPI
20/02/2026,Shopping,3800.00,Apparel Mall,Credit Card
15/03/2026,Dining Out,2400.00,Café Brunch,UPI
18/03/2026,Shopping,12500.00,Electronics & Gadgets,Credit Card
20/03/2026,Groceries,3400.00,Vegetables & Dairy,UPI`;

    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'kaggle_expense_sample_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Current Dataset Status Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Currently Active Dataset
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  datasetInfo?.isSample
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {datasetInfo?.isSample ? 'Sample Data' : 'Custom / Kaggle Dataset'}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-800 mt-0.5">
              {datasetInfo?.datasetName || 'personal_expenses_sample.csv'}
            </h3>
            <p className="text-xs text-slate-500">
              {datasetInfo?.totalRecords || 0} active records • Uploaded:{' '}
              {datasetInfo?.uploadedAt ? new Date(datasetInfo.uploadedAt).toLocaleString() : 'System default'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onLoadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Sample Data</span>
          </button>
          <button
            onClick={downloadKaggleTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Kaggle Format Template</span>
          </button>
        </div>
      </div>

      {/* Upload & Mapping Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-extrabold text-slate-800">
            Upload & Analyze Kaggle Expense Dataset
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Download any personal expense or credit card CSV from Kaggle, upload it here, and map the corresponding columns. The system scrubs currency symbols, handles multiple date formats (ISO, DD/MM/YYYY, MM/DD/YYYY, DD-MMM-YYYY), skips duplicate records, and recalculates monthly totals and &gt; 25% budgeting alerts.
          </p>
        </div>

        {/* Input Mode Selector */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-semibold">
          <button
            onClick={() => {
              setInputMode('file');
              setResult(null);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              inputMode === 'file' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Upload .CSV File
          </button>
          <button
            onClick={() => {
              setInputMode('text');
              setResult(null);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              inputMode === 'text' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Paste Raw CSV Text
          </button>
        </div>

        {/* File Picker / Textarea */}
        {inputMode === 'file' ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">
              Drag and drop your Kaggle CSV file here, or{' '}
              <label className="text-emerald-600 cursor-pointer hover:underline">
                browse files
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelected(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports Kaggle datasets, bank transaction exports, and custom personal expense spreadsheets (CSV).
            </p>

            {file && (
              <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>{file.name}</span>
                <span className="font-mono text-[11px] text-emerald-700 font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                  {fileSizeText}
                </span>
                {inspecting && (
                  <span className="text-slate-500 text-[11px] italic flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Inspecting headers...
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Paste CSV Lines (including header row):
              </label>
              <button
                type="button"
                onClick={handleTextInspect}
                disabled={!csvText.trim() || inspecting}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
              >
                Inspect Headers
              </button>
            </div>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={`Transaction Date,Expense Category,Transaction Amount,Merchant\n15/01/2026,Dining Out,1450.00,Dinner\n18/01/2026,Groceries,3200.00,Supermarket`}
              className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}

        {/* Column Mapping Interface & Preview (shown when file is inspected) */}
        {inspectionData && (
          <div className="space-y-4 pt-2 border-t border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Column Mapping Configuration
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">
                Found {inspectionData.headers?.length || 0} columns • {inspectionData.totalRows || 0} rows
              </span>
            </div>

            {/* Column Mapping Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
              {/* Date Column */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800 flex items-center gap-1">
                    <span>Date Column</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  {columnMapping.date === inspectionData.suggestedMapping?.date && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                      Auto-detected
                    </span>
                  )}
                </div>
                <select
                  value={columnMapping.date}
                  onChange={(e) => setColumnMapping({ ...columnMapping, date: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select Date Column --</option>
                  {inspectionData.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Supports YYYY-MM-DD, DD/MM/YYYY, etc.</p>
              </div>

              {/* Category Column */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800 flex items-center gap-1">
                    <span>Category Column</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  {columnMapping.category === inspectionData.suggestedMapping?.category && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                      Auto-detected
                    </span>
                  )}
                </div>
                <select
                  value={columnMapping.category}
                  onChange={(e) => setColumnMapping({ ...columnMapping, category: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select Category Column --</option>
                  {inspectionData.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">e.g. Dining Out, Groceries, Shopping</p>
              </div>

              {/* Amount Column */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800 flex items-center gap-1">
                    <span>Amount Column</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  {columnMapping.amount === inspectionData.suggestedMapping?.amount && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                      Auto-detected
                    </span>
                  )}
                </div>
                <select
                  value={columnMapping.amount}
                  onChange={(e) => setColumnMapping({ ...columnMapping, amount: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select Amount Column --</option>
                  {inspectionData.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Handles ₹, $, commas, negative debits</p>
              </div>

              {/* Description Column (Optional) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold text-slate-800 mb-1">
                  Description / Note Column (Optional)
                </label>
                <select
                  value={columnMapping.description}
                  onChange={(e) => setColumnMapping({ ...columnMapping, description: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- None (use category name) --</option>
                  {inspectionData.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method Column (Optional) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold text-slate-800 mb-1">
                  Payment Method Column (Optional)
                </label>
                <select
                  value={columnMapping.paymentMethod}
                  onChange={(e) => setColumnMapping({ ...columnMapping, paymentMethod: e.target.value })}
                  className="w-full mt-1 p-2 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- None (default to UPI) --</option>
                  {inspectionData.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ingestion Options */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-center">
                <span className="font-bold text-slate-800 mb-1">Dataset Options</span>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 mt-1">
                  <input
                    type="checkbox"
                    checked={replaceData}
                    onChange={(e) => setReplaceData(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span>Replace active dataset</span>
                </label>
              </div>
            </div>

            {/* CSV Data Preview Table */}
            {inspectionData.sampleRows && inspectionData.sampleRows.length > 0 && (
              <div className="mt-3">
                <div className="text-[11px] font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5 text-slate-500" />
                  <span>CSV Sample Data Preview (First Few Rows):</span>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-48 text-[11px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        {inspectionData.headers.map((h) => (
                          <th key={h} className="py-1.5 px-3 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inspectionData.sampleRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          {inspectionData.headers.map((h) => (
                            <td key={h} className="py-1.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                              {row[h]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleUploadAndAnalyze}
            disabled={
              uploading ||
              inspecting ||
              (inputMode === 'file' && !file) ||
              (inputMode === 'text' && !csvText.trim()) ||
              (inspectionData && (!columnMapping.date || !columnMapping.category || !columnMapping.amount))
            }
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${uploading ? 'animate-spin' : ''}`} />
            <span>
              {uploading
                ? 'Validating & Analyzing Dataset...'
                : 'Upload and Analyze Dataset'}
            </span>
          </button>
        </div>
      </div>

      {/* Validation Results Card */}
      {result && (
        <div
          className={`p-6 rounded-2xl border transition-all shadow-sm ${
            result.success
              ? 'bg-white border-emerald-300'
              : 'bg-white border-rose-300'
          }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
            )}

            <div className="flex-1">
              <h3 className="font-extrabold text-sm text-slate-800">
                {result.success ? 'Dataset Ingestion & Analysis Successful!' : 'Ingestion Error Encountered'}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">{result.message}</p>

              {/* Detailed Breakdown Counters */}
              {result.stats && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] text-emerald-700 uppercase font-bold tracking-wider block">
                      Accepted Rows
                    </span>
                    <span className="text-lg font-black text-emerald-800 font-mono">
                      {result.stats.acceptedRows}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                      Skipped Rows
                    </span>
                    <span className="text-lg font-bold text-slate-700 font-mono">
                      {result.stats.skippedRows || 0}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="text-[10px] text-blue-700 uppercase font-bold tracking-wider block">
                      Duplicates Handled
                    </span>
                    <span className="text-lg font-bold text-blue-800 font-mono">
                      {result.stats.duplicateRows || 0}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                    <span className="text-[10px] text-rose-700 uppercase font-bold tracking-wider block">
                      Rejected Rows
                    </span>
                    <span className="text-lg font-bold text-rose-800 font-mono">
                      {result.stats.rejectedRows || 0}
                    </span>
                  </div>
                </div>
              )}

              {/* Navigation Action Buttons if Successful */}
              {result.success && (
                <div className="mt-5 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    <span>View Overview Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setActiveTab('comparison')}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all"
                  >
                    <span>View MoM Comparison</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setActiveTab('alerts')}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all"
                  >
                    <span>Inspect &gt; 25% Alerts</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Rejected Row Details (Expandable) */}
              {result.errors && result.errors.length > 0 && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setShowErrors(!showErrors)}
                    className="text-xs font-bold text-rose-700 flex items-center gap-1 hover:underline"
                  >
                    <span>
                      {showErrors ? 'Hide' : 'Inspect'} {result.errors.length} validation details
                    </span>
                    {showErrors ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {showErrors && (
                    <div className="mt-2 p-3 bg-slate-900 text-rose-300 rounded-xl font-mono text-[11px] max-h-48 overflow-y-auto space-y-1">
                      {result.errors.map((err, i) => (
                        <div key={i}>• {err}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
