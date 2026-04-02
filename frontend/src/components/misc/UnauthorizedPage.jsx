import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlertIcon, ArrowLeftIcon, HomeIcon } from 'lucide-react'

export function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlertIcon className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-navy-900 mb-3">Access Denied</h1>
        <p className="text-campus-gray-600 mb-8">
          You don't have permission to access this page. Please contact your
          administrator if you believe this is an error.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 border-2 border-campus-gray-300 text-campus-gray-700 rounded-lg hover:bg-campus-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Go Back
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <HomeIcon className="w-5 h-5" />
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
