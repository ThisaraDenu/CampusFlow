import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from 'lucide-react'
import { PageHeader } from '../shared/PageHeader'
import { ResourceForm } from './ResourceForm'
import { store } from '../../services/store'

export function AddResourcePage() {
  const navigate = useNavigate()

  const handleSubmit = (data) => {
    store.resources.unshift({
      ...data,
      id: `res-${Date.now()}`,
      createdAt: new Date().toISOString(),
    })
    navigate('/resources')
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

