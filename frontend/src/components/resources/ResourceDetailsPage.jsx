import React, { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, BuildingIcon, CalendarIcon, EditIcon, TrashIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { resourcesApi } from '../../services/resourcesApi'
import { StatusBadge } from '../shared/StatusBadge'
import { ErrorState } from '../shared/ErrorState'

export function ResourceDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      setResource(await resourcesApi.getById(id))
    } catch (e) {
      setError(e?.message || 'Not found')
      setResource(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center text-campus-gray-600">
        Loading…
      </div>
    )
  }

  if (!resource || error) {
    return (
      <ErrorState
        message={error || 'Resource not found.'}
        onRetry={() => navigate('/resources')}
      />
    )
  }

  const handleDelete = async () => {
    const ok = window.confirm('Delete this resource? This cannot be undone.')
    if (!ok) return
    try {
      await resourcesApi.remove(resource.id)
      navigate('/resources', { replace: true })
    } catch (e) {
      alert(e?.message || 'Could not delete resource')
    }
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
                <>
                  <button
                    onClick={() => navigate(`/resources/${resource.id}/edit`)}
                    className="flex items-center justify-center px-4 py-2 border border-campus-gray-300 text-campus-gray-700 rounded-lg hover:bg-campus-gray-50 transition-colors font-medium"
                  >
                    <EditIcon className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </>
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
              {resource.description || 'No description provided.'}
            </p>
          </div>

          {(resource.availableDays?.length ||
            resource.amenities?.length ||
            resource.equipmentSerialNumber ||
            resource.labSafetyNotes ||
            resource.imageUrls?.length) && (
            <div className="mt-8 border-t border-campus-gray-200 pt-6 space-y-4">
              {resource.availableDays?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-campus-gray-900 mb-2">
                    Available Days
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {resource.availableDays.map((d) => (
                      <span
                        key={d}
                        className="px-3 py-1 rounded-full text-xs border bg-teal-50 text-teal-700 border-teal-200"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {resource.amenities?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-campus-gray-900 mb-2">
                    Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {resource.amenities.map((a) => (
                      <span
                        key={a}
                        className="px-3 py-1 rounded-full text-xs border bg-campus-gray-50 text-campus-gray-700 border-campus-gray-200"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {resource.type === 'EQUIPMENT' && resource.equipmentSerialNumber && (
                <div>
                  <h3 className="text-sm font-semibold text-campus-gray-900 mb-2">
                    Serial Number
                  </h3>
                  <p className="text-sm text-campus-gray-700">
                    {resource.equipmentSerialNumber}
                  </p>
                </div>
              )}

              {resource.type === 'LABORATORY' && resource.labSafetyNotes && (
                <div>
                  <h3 className="text-sm font-semibold text-campus-gray-900 mb-2">
                    Safety Notes
                  </h3>
                  <p className="text-sm text-campus-gray-700 whitespace-pre-wrap">
                    {resource.labSafetyNotes}
                  </p>
                </div>
              )}

              {resource.imageUrls?.length > 1 && (
                <div>
                  <h3 className="text-sm font-semibold text-campus-gray-900 mb-2">
                    Gallery
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {resource.imageUrls.map((u) => (
                      <img
                        key={u}
                        src={u}
                        alt="Resource"
                        className="w-full h-28 object-cover rounded-lg border border-campus-gray-200"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
