/**
 * Button component
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Full width button */
  fullWidth?: boolean;
  /** Button children */
  children: ReactNode;
}

/**
 * Reusable button component with Tailwind styling
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900';

  const variantStyles = {
    primary:
      'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed',
    secondary:
      'bg-gray-700 text-gray-100 hover:bg-gray-600 focus:ring-gray-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed',
    danger:
      'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed',
    outline:
      'border-2 border-amber-500 text-amber-500 hover:bg-amber-900/30 focus:ring-amber-500 disabled:border-gray-600 disabled:text-gray-600 disabled:cursor-not-allowed',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  const classes = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    widthStyle,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
