import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, UploadIcon } from 'lucide-react'
import { resourcesApi } from '../../services/resourcesApi'
import { ticketsApi } from '../../services/ticketsApi'
import { PageHeader } from '../shared/PageHeader'

export function CreateTicketPage() {
  const navigate = useNavigate()
  const [resourceId, setResourceId] = useState('')
  const [otherLocation, setOtherLocation] = useState('')
  const [category, setCategory] = useState('OTHER')
  const [priority, setPriority] = useState('MEDIUM')
  const [description, setDescription] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [resources, setResources] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const loadResources = useCallback(async () => {
    try {
      const list = await resourcesApi.list()
      setResources(list.filter((r) => r.status === 'ACTIVE'))
    } catch {
      setResources([])
    }
  }, [])

  useEffect(() => {
    loadResources()
  }, [loadResources])

  const categories = [
    { value: 'ELECTRICAL', label: 'Electrical' },
    { value: 'PLUMBING', label: 'Plumbing' },
    { value: 'HVAC', label: 'HVAC' },
    { value: 'IT_EQUIPMENT', label: 'IT Equipment' },
    { value: 'FURNITURE', label: 'Furniture' },
    { value: 'CLEANING', label: 'Cleaning' },
    { value: 'SAFETY', label: 'Safety' },
    { value: 'OTHER', label: 'Other' },
  ]

  const priorities = [
    {
      value: 'LOW',
      label: 'Low',
      description: 'Minor issue, no immediate impact',
      color: 'bg-green-500',
    },
    {
      value: 'MEDIUM',
      label: 'Medium',
      description: 'Affects work but not critical',
      color: 'bg-amber-500',
    },
    {
      value: 'HIGH',
      label: 'High',
      description: 'Urgent, significant impact',
      color: 'bg-orange-500',
    },
    {
      value: 'CRITICAL',
      label: 'Critical',
      description: 'Safety risk or complete failure',
      color: 'bg-red-500',
    },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!description.trim()) {
      alert('Please provide a description')
      return
    }
    if (!resourceId) {
      alert('Please select a resource (required for the API).')
      return
    }
    let desc = description.trim()
    if (otherLocation.trim()) {
      desc = `${desc}\n\nLocation note: ${otherLocation.trim()}`
    }
    if (contactInfo.trim()) {
      desc = `${desc}\n\nContact: ${contactInfo.trim()}`
    }
    setSubmitting(true)
    try {
      await ticketsApi.create({
        resourceId,
        category,
        priority,
        description: desc,
      })
      navigate('/tickets')
    } catch (err) {
      alert(err?.message || 'Could not create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/tickets')}
        className="flex items-center gap-2 text-campus-gray-600 hover:text-campus-gray-900 mb-4 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Tickets
      </button>

      <PageHeader
        title="Report Incident"
        subtitle="Submit a maintenance or incident report"
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-6"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-campus-gray-700 mb-2">
              Resource / Location
            </label>
            <select
              required
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              className="w-full px-3 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="" disabled>
                Select a resource…
              </option>
              {resources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name} - {resource.location}
                </option>
              ))}
            </select>
            {!resourceId && (
              <input
                type="text"
                value={otherLocation}
                onChange={(e) => setOtherLocation(e.target.value)}
                placeholder="Specify location..."
                className="w-full px-3 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 mt-2"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-campus-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              required
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-campus-gray-700 mb-2">
              Priority Level <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {priorities.map((p) => (
                <label
                  key={p.value}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    priority === p.value
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-campus-gray-300 hover:border-campus-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={p.value}
                    checked={priority === p.value}
                    onChange={(e) => setPriority(e.target.value)}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <div className={`w-3 h-3 rounded-full ${p.color}`} />
                  <div className="flex-1">
                    <div className="font-medium text-campus-gray-900">
                      {p.label}
                    </div>
                    <div className="text-sm text-campus-gray-600">
                      {p.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-campus-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              rows={6}
              className="w-full px-3 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-campus-gray-700 mb-2">
              Preferred Contact (Optional)
            </label>
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Email or phone number"
              className="w-full px-3 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-campus-gray-700 mb-2">
              Attachments (Optional)
            </label>
            <div className="border-2 border-dashed border-campus-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors">
              <UploadIcon className="w-12 h-12 mx-auto text-campus-gray-400 mb-2" />
              <p className="text-sm text-campus-gray-600">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-campus-gray-500 mt-1">
                (Image upload functionality coming soon)
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-campus-gray-200">
          <button
            type="button"
            onClick={() => navigate('/tickets')}
            className="px-4 py-2 text-campus-gray-700 hover:bg-campus-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit Ticket'}
          </button>
        </div>
      </form>
    </div>
  )
}

