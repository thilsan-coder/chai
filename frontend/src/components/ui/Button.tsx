import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] select-none rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[34px]',
    md: 'text-sm px-4 py-2.5 gap-2 min-h-[42px]',
    lg: 'text-base px-6 py-3.5 gap-2.5 min-h-[50px] font-semibold',
  };

  const variantStyles = {
    primary: 'bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold shadow-md shadow-amber-500/10 hover:shadow-amber-500/20',
    secondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/60 shadow-sm',
    outline: 'bg-transparent hover:bg-zinc-900/80 text-amber-400 border border-amber-500/40 hover:border-amber-500',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/20',
    ghost: 'bg-transparent hover:bg-zinc-800/60 text-zinc-300 hover:text-zinc-100',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
