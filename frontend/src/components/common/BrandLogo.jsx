import React from 'react';
import { Link } from 'react-router-dom';

export function BrandLogo({
  size = 'md',
  theme = 'light',
  to = '/',
  showBadge = false,
  badgeText = 'FINTECH ANALYTICS'
}) {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs rounded-lg',
    md: 'w-9 h-9 text-base rounded-xl',
    lg: 'w-11 h-11 text-xl rounded-2xl'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  const isDark = theme === 'dark';

  const content = (
    <div className="flex items-center gap-2.5 select-none group">
      {/* Emblem */}
      <div
        className={`${iconSizes[size]} bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white font-extrabold shadow-md shadow-emerald-600/25 transition-transform duration-200 group-hover:scale-105 shrink-0`}
      >
        <span>₹</span>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col">
        <div className={`font-extrabold tracking-tight leading-none ${textSizes[size]}`}>
          <span className={isDark ? 'text-white' : 'text-slate-900'}>Spend</span>
          <span className="text-emerald-500">Sense</span>
        </div>

        {showBadge && (
          <span className="text-[9px] font-bold tracking-widest uppercase text-emerald-400/90 mt-0.5">
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className="inline-block">{content}</Link>;
  }

  return content;
}

export default BrandLogo;
