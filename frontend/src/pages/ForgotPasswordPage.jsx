import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { BrandLogo } from '../components/common/BrandLogo';
import { Mail, ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [step, setStep] = useState(1); // 1: request, 2: reset
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRequestToken(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.forgotPassword(email);
      setSuccess(res.message);
      if (res.devResetToken) {
        setResetToken(res.devResetToken);
      }
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to request reset token');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.resetPassword(resetToken, newPassword);
      setSuccess(res.message);
      setStep(3); // Complete
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link to="/" className="inline-flex justify-center mb-6">
          <BrandLogo size="md" />
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">
          Reset Password
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Recover access to your SpendSense account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-3 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-lg text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <form className="space-y-4" onSubmit={handleRequestToken}>
              <p className="text-xs text-slate-400 mb-2">
                Enter your registered email address. For local college evaluations, a direct reset token is returned.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="demo@spendsense.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Sending Request...' : 'Send Recovery Token'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-4" onSubmit={handleResetPassword}>
              <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-lg text-xs text-emerald-300">
                <p className="font-semibold mb-1">Recovery Token Received</p>
                <p className="font-mono break-all bg-slate-950/60 p-1.5 rounded text-[11px] border border-emerald-900/50">
                  {resetToken}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter strong new password"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Password Updated</h3>
                <p className="text-xs text-slate-400 mt-1">
                  You can now sign in with your updated credentials.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-block w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition"
              >
                Sign In
              </Link>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
