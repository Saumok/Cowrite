import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-sans transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none outline-none';
  
  const variantClasses = {
    primary: 
      'bg-[var(--color-accent)] text-[var(--color-text-inverse)] border-none rounded-[var(--radius-full)] px-7 py-3 text-sm font-medium shadow-[0_4px_16px_rgba(196,120,90,0.30),inset_0_1px_0_rgba(255,255,255,0.2)] cursor-pointer [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] hover:bg-[var(--color-accent-hover)] hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(196,120,90,0.35)] active:scale-[0.97]',
    secondary: 
      'bg-[var(--color-surface-glass)] backdrop-blur-[12px] border border-[var(--color-border-glass)] rounded-[var(--radius-full)] text-[var(--color-text-body)] px-[22px] py-2.5 text-sm font-medium shadow-[var(--shadow-soft)] hover:bg-[var(--color-elevated)] cursor-pointer hover:scale-[1.01] active:scale-[0.99]',
    danger: 
      'bg-[rgba(220,80,60,0.07)] border border-[rgba(220,80,60,0.25)] rounded-[var(--radius-full)] text-[#C0392B] px-[22px] py-2.5 text-sm font-medium hover:bg-[rgba(220,80,60,0.14)] cursor-pointer hover:scale-[1.01] active:scale-[0.99]',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
