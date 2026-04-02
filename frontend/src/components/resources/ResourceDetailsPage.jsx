import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, BuildingIcon, CalendarIcon, EditIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { store } from '../../services/store'
import { StatusBadge } from '../shared/StatusBadge'
import { ErrorState } from '../shared/ErrorState'

export function ResourceDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const resource = store.resources.find((r) => r.id === id)
  if (!resource) {
    return (
      <ErrorState
        message="Resource not found."
        onRetry={() => navigate('/resources')}
      />
    )
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <button
        onClick={() => navigate('/resources')}
        className="flex items-center text-campus-gray-500 hover:text-campus-gray-900 transition-colors mb-6 font-medium text-sm"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to Resources
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-campus-gray-200 overflow-hidden">
        <div className="h-64 w-full bg-campus-gray-100 relative">
          {resource.imageUrl ? (
            <img
              src={resource.imageUrl}
              alt={resource.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-campus-gray-400">
              <BuildingIcon className="w-20 h-20 opacity-30" />
            </div>
          )}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
            <StatusBadge status={resource.status} />
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-campus-gray-900 mb-2">
                {resource.name}
              </h1>
              <p className="text-campus-gray-600">{resource.location}</p>
              <p className="text-sm text-campus-gray-500 mt-2">
                Capacity: {resource.capacity}
              </p>
            </div>

            <div className="flex gap-3">
              {isAdmin && (
                <button
                  onClick={() => navigate(`/resources/${resource.id}/edit`)}
                  className="flex items-center justify-center px-4 py-2 border border-campus-gray-300 text-campus-gray-700 rounded-lg hover:bg-campus-gray-50 transition-colors font-medium"
                >
                  <EditIcon className="w-4 h-4 mr-2" />
                  Edit
                </button>
              )}
              <button
                onClick={() => navigate(`/bookings/create?resourceId=${resource.id}`)}
                className="flex items-center justify-center px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Book Resource
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-campus-gray-900 mb-3">
              About this Resource
            </h2>
            <p className="text-campus-gray-700 leading-relaxed whitespace-pre-line">
              {resource.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

