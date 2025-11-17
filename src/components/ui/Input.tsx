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
      ? 'border-red-300 text-red-900 placeholder-red-300'
      : 'border-gray-300 placeholder-gray-400',
    props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <input id={inputId} className={inputClasses} {...props} />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helper && !error && (
        <p className="mt-1 text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
}
