import React from 'react'
import { Loader2Icon } from 'lucide-react'

export function LoadingSpinner({ message = 'Loading...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2Icon
        className={`${sizeClasses[size] || sizeClasses.md} text-teal-600 animate-spin`}
      />
      {message && (
        <p className="text-campus-gray-600 text-sm font-medium">{message}</p>
      )}
    </div>
  )
}

