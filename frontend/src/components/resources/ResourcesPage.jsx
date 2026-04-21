import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PlusIcon,
  SearchIcon,
  BuildingIcon,
  MapPinIcon,
  UsersIcon,
  ClockIcon,
  ImagesIcon,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { resourcesApi } from '../../services/resourcesApi'
import { PageHeader } from '../shared/PageHeader'
import { StatusBadge } from '../shared/StatusBadge'
import { EmptyState } from '../shared/EmptyState'

export function ResourcesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [query, setQuery] = useState('')
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setResources(await resourcesApi.list())
    } catch {
      setResources([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = resources.filter((r) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return r.name.toLowerCase().includes(q) || r.location.toLowerCase().includes(q)
  })

  const typeLabel = (t) => String(t || '').replace(/_/g, ' ')

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Campus Resources"
        subtitle="Browse and manage university facilities and equipment."
        action={
          isAdmin
            ? {
                label: 'Add Resource',
                icon: <PlusIcon className="w-5 h-5" />,
                onClick: () => navigate('/resources/add'),
              }
            : undefined
        }
      />

      <div className="bg-white p-4 rounded-xl shadow-sm border border-campus-gray-200 mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-campus-gray-400 w-5 h-5" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resources..."
            className="w-full pl-10 pr-4 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-campus-gray-500 py-12">Loading resources…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BuildingIcon}
          title="No resources found"
          description="Try adjusting your search."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((resource) => (
            <div
              key={resource.id}
              onClick={() => navigate(`/resources/${resource.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ')
                  navigate(`/resources/${resource.id}`)
              }}
              className="group bg-white rounded-2xl shadow-sm border border-campus-gray-200 overflow-hidden hover:border-teal-500 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="h-44 bg-campus-gray-100 relative overflow-hidden">
                {resource.imageUrl ? (
                  <img
                    src={resource.imageUrl}
                    alt={resource.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-campus-gray-400">
                    <BuildingIcon className="w-12 h-12 opacity-50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0" />

                <div className="absolute top-3 right-3">
                  <StatusBadge status={resource.status} size="sm" />
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur border border-white/60 text-campus-gray-800">
                    {typeLabel(resource.type) || 'RESOURCE'}
                  </span>
                  {(resource.imageUrls?.length || 0) > 1 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur border border-white/60 text-campus-gray-700">
                      <ImagesIcon className="w-3.5 h-3.5" />
                      {resource.imageUrls.length}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-campus-gray-900 mb-1 line-clamp-1 group-hover:text-teal-700 transition-colors">
                  {resource.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-campus-gray-600 line-clamp-1">
                  <MapPinIcon className="w-4 h-4 text-campus-gray-400 shrink-0" />
                  <span className="truncate">{resource.location}</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-campus-gray-600">
                  <div className="flex items-center gap-2 rounded-lg bg-campus-gray-50 border border-campus-gray-200 px-3 py-2">
                    <UsersIcon className="w-4 h-4 text-campus-gray-400" />
                    <span className="font-medium text-campus-gray-700">
                      {resource.capacity}
                    </span>
                    <span className="text-campus-gray-500">capacity</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-campus-gray-50 border border-campus-gray-200 px-3 py-2">
                    <ClockIcon className="w-4 h-4 text-campus-gray-400" />
                    <span className="text-campus-gray-700 font-medium">
                      {String(resource.availabilityStart || '').slice(0, 5)}–
                      {String(resource.availabilityEnd || '').slice(0, 5)}
                    </span>
                  </div>
                </div>

                {resource.amenities?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {resource.amenities.slice(0, 4).map((a) => (
                      <span
                        key={a}
                        className="px-2.5 py-1 rounded-full text-xs border bg-white text-campus-gray-700 border-campus-gray-200"
                      >
                        {a}
                      </span>
                    ))}
                    {resource.amenities.length > 4 && (
                      <span className="px-2.5 py-1 rounded-full text-xs border bg-campus-gray-50 text-campus-gray-600 border-campus-gray-200">
                        +{resource.amenities.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
