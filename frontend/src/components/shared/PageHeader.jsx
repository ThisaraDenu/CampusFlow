import React from 'react'

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-campus-gray-900">{title}</h1>
        {subtitle && <p className="text-campus-gray-600 mt-1">{subtitle}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          {action.icon}
          {action.label}
        </button>
      )}
    </div>
  )
}

