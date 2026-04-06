import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, SearchIcon, BuildingIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { store } from '../../services/store'
import { PageHeader } from '../shared/PageHeader'
import { StatusBadge } from '../shared/StatusBadge'
import { EmptyState } from '../shared/EmptyState'

export function ResourcesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [query, setQuery] = useState('')

  const resources = store.resources.filter((r) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return r.name.toLowerCase().includes(q) || r.location.toLowerCase().includes(q)
  })

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

      {resources.length === 0 ? (
        <EmptyState
          icon={BuildingIcon}
          title="No resources found"
          description="Try adjusting your search."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div
              key={resource.id}
              onClick={() => navigate(`/resources/${resource.id}`)}
              className="bg-white rounded-xl shadow-sm border border-campus-gray-200 overflow-hidden hover:border-teal-500 transition-colors cursor-pointer"
            >
              <div className="h-40 bg-campus-gray-100 relative">
                {resource.imageUrl ? (
                  <img
                    src={resource.imageUrl}
                    alt={resource.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-campus-gray-400">
                    <BuildingIcon className="w-12 h-12 opacity-50" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <StatusBadge status={resource.status} size="sm" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-campus-gray-900 mb-1 line-clamp-1">
                  {resource.name}
                </h3>
                <p className="text-sm text-campus-gray-600 line-clamp-1">
                  {resource.location}
                </p>
                <p className="text-xs text-campus-gray-500 mt-3">
                  Capacity: {resource.capacity}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

