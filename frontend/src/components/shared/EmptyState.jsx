import React from 'react'
import { BoxIcon } from 'lucide-react'

export function EmptyState({ icon: Icon = BoxIcon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 py-12">
      <div className="w-16 h-16 bg-campus-gray-100 rounded-full flex items-center justify-center">
        <Icon className="w-8 h-8 text-campus-gray-400" />
      </div>
      <div className="text-center max-w-md">
        <h3 className="text-lg font-semibold text-campus-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-campus-gray-600">{description}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

