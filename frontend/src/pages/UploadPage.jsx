import React, { useState } from 'react';
import { api } from '../services/api';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  FileSpreadsheet,
  RefreshCw,
  Info
} from 'lucide-react';

export default function UploadPage({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [csvText, setCsvText] = useState('');
  const [inputMode, setInputMode] = useState('file'); // 'file' or 'text'
  const [replaceData, setReplaceData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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
      setFile(e.dataTransfer.files[0]);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      let res;
      if (inputMode === 'file') {
        if (!file) {
          throw new Error('Please select a CSV file first');
        }
        res = await api.uploadCsvFile(file, replaceData);
      } else {
        if (!csvText.trim()) {
          throw new Error('Please paste CSV content in the text box');
        }
        res = await api.uploadCsvText(csvText, replaceData);
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
      setLoading(false);
    }
  }

  function downloadTemplate() {
    const templateContent = `date,category,amount,description,payment_method
2026-06-01,Groceries,3200.00,Supermarket pantry items,UPI
2026-06-02,Rent & Housing,22000.00,Apartment rent,Net Banking
2026-06-05,Dining Out,1850.00,Weekend bistro lunch,Credit Card
2026-06-08,Utilities & Bills,1600.00,Broadband internet and power,UPI
2026-06-12,Transportation,1400.00,Fuel and toll charges,UPI
2026-06-15,Entertainment,999.00,Streaming subscription,Credit Card
2026-06-18,Shopping,2400.00,Books and casual wear,Debit Card
2026-06-22,Healthcare,1200.00,Medical routine consultation,Cash`;

    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_expense_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Informative Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Personal Expense CSV Import Engine
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Upload your personal expense data. All records are validated against ISO date standards, strictly positive amounts, and standardized categories before ingestion into the analytics pipeline.
            </p>
          </div>

          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg shrink-0 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* Input Mode Selector */}
        <div className="mt-5 flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-semibold">
          <button
            onClick={() => setInputMode('file')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              inputMode === 'file'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Upload .CSV File
          </button>
          <button
            onClick={() => setInputMode('text')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              inputMode === 'text'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Paste Raw CSV Text
          </button>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleUpload} className="mt-5 space-y-4">
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
                Drag and drop your expense .csv file here, or{' '}
                <label className="text-emerald-600 cursor-pointer hover:underline">
                  browse files
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Required columns: <code className="font-mono">date</code>, <code className="font-mono">category</code>, <code className="font-mono">amount</code>
              </p>

              {file && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>{file.name}</span>
                  <span className="text-emerald-600 font-mono text-[10px]">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Paste CSV Lines (including header row)
              </label>
              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`date,category,amount,description,payment_method\n2026-06-01,Dining Out,1450.00,Dinner,UPI\n2026-06-03,Groceries,2300.00,Pantry staples,UPI`}
                className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Append vs Replace Option */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="font-semibold text-slate-700 block">Dataset Ingestion Mode</span>
              <span className="text-slate-500 text-[11px]">
                {replaceData
                  ? 'Replace: Wipes prior transactions and imports only this new CSV.'
                  : 'Append: Adds new transactions alongside existing records.'}
              </span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={replaceData}
                onChange={(e) => setReplaceData(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>Replace entire dataset</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || (inputMode === 'file' && !file) || (inputMode === 'text' && !csvText.trim())}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Validating and Ingesting...' : 'Validate & Upload Data'}</span>
          </button>
        </form>
      </div>

      {/* Validation Results Accordion */}
      {result && (
        <div
          className={`p-5 rounded-2xl border transition-all ${
            result.success
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : 'bg-rose-50/80 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className="font-bold text-sm">
                {result.success ? 'CSV Ingestion Successful' : 'Validation Errors Encountered'}
              </h3>
              <p className="text-xs mt-0.5">{result.message}</p>

              {/* Counters */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {result.totalRows !== undefined && (
                  <span className="px-2.5 py-1 bg-white/80 rounded-lg font-semibold border border-slate-200">
                    Total Rows: <span className="font-mono">{result.totalRows}</span>
                  </span>
                )}
                {result.validRows !== undefined && (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-semibold border border-emerald-300">
                    Valid Imported: <span className="font-mono">{result.validRows}</span>
                  </span>
                )}
                {result.invalidRows !== undefined && result.invalidRows > 0 && (
                  <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg font-semibold border border-rose-300">
                    Invalid Skipped: <span className="font-mono">{result.invalidRows}</span>
                  </span>
                )}
              </div>

              {/* Error messages list */}
              {result.errors && result.errors.length > 0 && (
                <div className="mt-3 p-3 bg-white/90 rounded-xl border border-rose-200 text-xs space-y-1 max-h-48 overflow-y-auto font-mono text-[11px] text-rose-700">
                  <p className="font-bold font-sans text-rose-800 mb-1">
                    Line-by-Line Error Log:
                  </p>
                  {result.errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-500">•</span>
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
