import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  clearable,
  onClear,
  className = '',
  value,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-zinc-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-zinc-400 pointer-events-none flex items-center">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          value={value}
          className={`w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors ${
            icon ? 'pl-10' : ''
          } ${clearable && value ? 'pr-9' : ''} ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
        {clearable && value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            ✕
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
};
