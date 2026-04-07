import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftIcon } from 'lucide-react'
import { resourcesApi } from '../../services/resourcesApi'
import { PageHeader } from '../shared/PageHeader'
import { ResourceForm } from './ResourceForm'
import { ErrorState } from '../shared/ErrorState'

export function EditResourcePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  const handleSubmit = async (data) => {
    if (submitting || !id) return
    setSubmitting(true)
    try {
      await resourcesApi.update(id, {
        name: data.name,
        type: data.type,
        capacity: data.capacity,
        location: data.location,
        availabilityStart:
          data.availabilityStart.length === 5
            ? `${data.availabilityStart}:00`
            : data.availabilityStart,
        availabilityEnd:
          data.availabilityEnd.length === 5
            ? `${data.availabilityEnd}:00`
            : data.availabilityEnd,
        status: data.status,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
      })
      navigate(`/resources/${id}`)
    } catch (e) {
      alert(e?.message || 'Could not update resource')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-campus-gray-600">
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

  const initial = {
    ...resource,
    availabilityStart: resource.availabilityStart?.slice(0, 5) || resource.availabilityStart,
    availabilityEnd: resource.availabilityEnd?.slice(0, 5) || resource.availabilityEnd,
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
        initialData={initial}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/resources/${id}`)}
        isEditing
      />
    </div>
  )
}
