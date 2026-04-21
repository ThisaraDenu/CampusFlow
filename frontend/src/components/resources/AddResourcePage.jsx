import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from 'lucide-react'
import { resourcesApi } from '../../services/resourcesApi'
import { PageHeader } from '../shared/PageHeader'
import { ResourceForm } from './ResourceForm'

export function AddResourcePage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (data) => {
    if (submitting) return
    setSubmitting(true)
    try {
      const created = await resourcesApi.create({
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
        availableDays: data.availableDays || null,
        status: data.status,
        description: data.description || null,
        amenities: data.amenities || [],
        equipmentSerialNumber: data.equipmentSerialNumber || null,
        labSafetyNotes: data.labSafetyNotes || null,
        imageUrl: null,
      })
      if (created?.id) {
        if (data.imageFiles?.length) {
          await resourcesApi.uploadImages(created.id, data.imageFiles)
        } else if (data.imageFile) {
          await resourcesApi.uploadImage(created.id, data.imageFile)
        }
      }
      navigate('/resources')
    } catch (e) {
      alert(e?.message || 'Could not create resource')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <button
        onClick={() => navigate('/resources')}
        className="flex items-center text-campus-gray-500 hover:text-campus-gray-900 transition-colors mb-6 font-medium text-sm"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to Resources
      </button>

      <PageHeader
        title="Add New Resource"
        subtitle="Create a new facility or equipment entry."
      />

      <ResourceForm onSubmit={handleSubmit} onCancel={() => navigate('/resources')} />
    </div>
  )
}
