import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftIcon } from 'lucide-react'
import { PageHeader } from '../shared/PageHeader'
import { ResourceForm } from './ResourceForm'
import { store } from '../../services/store'
import { ErrorState } from '../shared/ErrorState'

export function EditResourcePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const resource = store.resources.find((r) => r.id === id)

  if (!resource) {
    return (
      <ErrorState
        message="Resource not found."
        onRetry={() => navigate('/resources')}
      />
    )
  }

  const handleSubmit = (data) => {
    const idx = store.resources.findIndex((r) => r.id === id)
    if (idx !== -1) store.resources[idx] = { ...store.resources[idx], ...data }
    navigate(`/resources/${id}`)
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <button
        onClick={() => navigate(`/resources/${id}`)}
        className="flex items-center text-campus-gray-500 hover:text-campus-gray-900 transition-colors mb-6 font-medium text-sm"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to Resource Details
      </button>

      <PageHeader title="Edit Resource" subtitle={`Update ${resource.name}`} />

      <ResourceForm
        initialData={resource}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/resources/${id}`)}
        isEditing
      />
    </div>
  )
}

