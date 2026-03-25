import { type InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
  error?: string
  prefix?: string
}

export function Input({ label, hint, error, prefix, className = '', id, ...props }: InputProps) {
  const inputId = id ?? props.name

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className={`flex rounded-lg border ${error ? 'border-red-400' : 'border-gray-300'} focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500`}>
        {prefix && (
          <span className="flex items-center pl-3 pr-1 text-sm text-gray-500 bg-gray-50 border-r border-gray-300 rounded-l-lg whitespace-nowrap">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          {...props}
          className={`
            block w-full px-3 py-2.5 text-sm text-gray-900 bg-white
            placeholder:text-gray-400
            focus:outline-none
            ${prefix ? 'rounded-r-lg' : 'rounded-lg'}
            ${className}
          `}
        />
      </div>
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
