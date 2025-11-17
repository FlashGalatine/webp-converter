/**
 * Select component
 */

import type { SelectHTMLAttributes, ReactNode } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Select label */
  label?: string;
  /** Select children (options) */
  children: ReactNode;
}

/**
 * Reusable select component with Tailwind styling
 */
export function Select({
  label,
  className = '',
  id,
  children,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const selectClasses = [
    'block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm',
    'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent',
    'bg-gray-800 text-white',
    props.disabled ? 'bg-gray-900 cursor-not-allowed text-gray-600' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <select id={selectId} className={selectClasses} {...props}>
        {children}
      </select>
    </div>
  );
}
