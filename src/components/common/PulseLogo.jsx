import React from 'react';

export const PulseLogo = ({ size = 'md', className = '', animated = true }) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 16,
    md: 22,
    lg: 26,
    xl: 36
  };

  return (
    <div
      className={`relative rounded-xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center shrink-0 ${sizeMap[size] || sizeMap.md} ${className}`}
    >
      <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden relative">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-cyan-500/15 to-indigo-500/10 pointer-events-none" />

        {/* High-Peak Vitality Pulse Waveform SVG */}
        <svg
          width={iconSizes[size] || 22}
          height={iconSizes[size] || 22}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={animated ? 'animate-pulse' : ''}
        >
          <defs>
            <linearGradient id="highPeakPulseGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="45%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <filter id="peakGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* High-Energy Peak Waveform */}
          <path
            d="M2 13h3.2l2.3 2.5 4-11.5 3.5 13.5 3-8 2 3.5H22"
            stroke="url(#highPeakPulseGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Glowing Peak Summit Apex (Representing Peak Performance & High Energy) */}
          <circle
            cx="11.5"
            cy="4"
            r="2"
            fill="#06b6d4"
            className="animate-ping origin-center opacity-75"
          />
          <circle
            cx="11.5"
            cy="4"
            r="1.6"
            fill="#38bdf8"
          />
        </svg>
      </div>
    </div>
  );
};
