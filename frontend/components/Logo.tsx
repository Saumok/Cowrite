import React from 'react';

export function Logo({ className = '', size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logo-sheet1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-accent, #C4785A)" />
          <stop offset="100%" stopColor="var(--blob-warm-orange, #F4A96A)" />
        </linearGradient>
        <linearGradient id="logo-sheet2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-sage, #7A9E8E)" />
          <stop offset="100%" stopColor="var(--blob-sky, #A8C0D6)" />
        </linearGradient>
      </defs>
      {/* Stylized background notebook sheet */}
      <path
        d="M6 10C6 7.79086 7.79086 6 10 6H20C21.1046 6 22 6.89543 22 8V20C22 22.2091 20.2091 24 18 24H10C7.79086 24 6 22.2091 6 20V10Z"
        fill="url(#logo-sheet1)"
        fillOpacity="0.9"
      />
      {/* Overlapping collaborative notebook sheet */}
      <path
        d="M11 11C11 8.79086 12.7909 7 15 7H23C24.1046 7 25 7.89543 25 9V21C25 23.2091 23.2091 25 21 25H15C12.7909 25 11 23.2091 11 21V11Z"
        fill="url(#logo-sheet2)"
        fillOpacity="0.8"
        stroke="var(--color-canvas, #FAF7F2)"
        strokeWidth="1.5"
      />
      {/* Dynamic flowing ink/writing swoosh indicating collaboration */}
      <path
        d="M9 16.5C12 13.5 15.5 14 18.5 17C21.5 20 20 22 23 19"
        stroke="var(--color-text-heading, #2C2420)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
