/**
 * Input component
 */

import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Input label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helper?: string;
}

/**
 * Reusable input component with Tailwind styling
 */
export function Input({
  label,
  error,
  helper,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const inputClasses = [
    'block w-full px-3 py-2 border rounded-md shadow-sm',
    'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent',
    error
      ? 'border-red-500 text-red-400 placeholder-red-400 bg-gray-800'
      : 'border-gray-600 placeholder-gray-500 text-white bg-gray-800',
    props.disabled ? 'bg-gray-900 cursor-not-allowed text-gray-600' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <input id={inputId} className={inputClasses} {...props} />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      {helper && !error && (
        <p className="mt-1 text-sm text-gray-400">{helper}</p>
      )}
    </div>
  );
}
