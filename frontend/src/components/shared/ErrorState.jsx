import React from 'react'
import { AlertCircleIcon } from 'lucide-react'

export function ErrorState({
  title,
  message = 'Something went wrong. Please try again.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
        <AlertCircleIcon className="w-8 h-8 text-red-600" />
      </div>
      {title && (
        <h2 className="text-lg font-semibold text-campus-gray-900">{title}</h2>
      )}
      <p className="text-campus-gray-700 text-center max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

