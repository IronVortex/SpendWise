import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../common/BrandLogo';
import { ArrowRight, Menu, X, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        scrolled
          ? 'bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 shadow-lg'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <BrandLogo size="md" theme="dark" showBadge={true} />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-300">
          <a href="#features" className="hover:text-emerald-400 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
            How It Works
          </a>
          <a href="#preview" className="hover:text-emerald-400 transition-colors">
            Live Preview
          </a>
          <a href="#technology" className="hover:text-emerald-400 transition-colors">
            Big Data Stack
          </a>
        </nav>

        {/* Auth CTA Buttons */}
        <div className="hidden md:flex items-center space-x-3.5">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/25 active:scale-95 transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-6 py-5 space-y-4 text-xs font-semibold animate-in slide-in-from-top duration-150">
          <nav className="flex flex-col space-y-3 text-slate-300">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-emerald-400 py-1"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-emerald-400 py-1"
            >
              How It Works
            </a>
            <a
              href="#preview"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-emerald-400 py-1"
            >
              Live Preview
            </a>
            <a
              href="#technology"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-emerald-400 py-1"
            >
              Big Data Stack
            </a>
          </nav>

          <div className="pt-3 border-t border-slate-800 flex flex-col space-y-2.5">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-bold text-center"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-slate-300 hover:text-white rounded-lg border border-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center bg-emerald-600 text-white rounded-lg font-bold"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
