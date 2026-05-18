import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, containerClassName = '', containerStyle, className = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col w-full ${containerClassName}`} style={containerStyle}>
        {label && (
          <label className="block font-sans text-[13px] font-semibold tracking-[0.06em] text-[var(--color-text-secondary)] uppercase mb-2 select-none">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-[18px] py-[14px] font-sans text-[15px] text-[var(--color-text-body)] shadow-[var(--shadow-inset)] outline-none [appearance:none] [-webkit-appearance:none] transition-all duration-[180ms] ease-in-out focus:border-[var(--color-border-focus)] focus:shadow-[0_0_0_4px_var(--color-accent-glass),var(--shadow-inset)] focus:bg-[rgba(255,252,248,0.92)] placeholder:text-[var(--color-text-muted)] ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
