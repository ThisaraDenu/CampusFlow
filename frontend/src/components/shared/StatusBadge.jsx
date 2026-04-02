import React from 'react'

export function StatusBadge({ status, size = 'md' }) {
  const getStatusStyles = () => {
    const baseStyles =
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

    switch (status) {
      case 'ACTIVE':
      case 'APPROVED':
      case 'RESOLVED':
        return `${baseStyles} bg-green-100 text-green-800 border border-green-200`
      case 'PENDING':
      case 'IN_PROGRESS':
        return `${baseStyles} bg-amber-100 text-amber-800 border border-amber-200`
      case 'REJECTED':
      case 'OUT_OF_SERVICE':
        return `${baseStyles} bg-red-100 text-red-800 border border-red-200`
      case 'CANCELLED':
      case 'CLOSED':
        return `${baseStyles} bg-gray-100 text-gray-800 border border-gray-200`
      case 'OPEN':
        return `${baseStyles} bg-blue-100 text-blue-800 border border-blue-200`
      default:
        return `${baseStyles} bg-gray-100 text-gray-800 border border-gray-200`
    }
  }

  const formatStatus = (s) => (s || '').toString().replace(/_/g, ' ')

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${getStatusStyles()}`}
    >
      {formatStatus(status)}
    </span>
  )
}

