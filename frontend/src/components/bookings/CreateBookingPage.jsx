import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeftIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { store } from '../../services/store'
import { PageHeader } from '../shared/PageHeader'

export function CreateBookingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  const initialResourceId = searchParams.get('resourceId') || ''

  const [form, setForm] = useState({
    resourceId: initialResourceId,
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: 1,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const resource = store.resources.find((r) => r.id === form.resourceId)
    if (!resource) return
    store.bookings.unshift({
      id: `book-${Date.now()}`,
      resourceId: resource.id,
      resourceName: resource.name,
      userId: user?.id || '',
      userName: user?.name || '',
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      purpose: form.purpose,
      attendees: Number(form.attendees) || 1,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    navigate('/bookings')
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-campus-gray-600 hover:text-campus-gray-900 mb-4 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back
      </button>

      <PageHeader
        title="Create Booking"
        subtitle="Request a resource for your upcoming event or activity."
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-campus-gray-700 mb-1">
            Resource *
          </label>
          <select
            required
            value={form.resourceId}
            onChange={(e) => setForm((p) => ({ ...p, resourceId: e.target.value }))}
            className="w-full px-3 py-2 border border-campus-gray-300 rounded-lg"
          >
            <option value="" disabled>
              Select a resource...
            </option>
            {store.resources
              .filter((r) => r.status === 'ACTIVE')
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            className="px-3 py-2 border border-campus-gray-300 rounded-lg"
          />
          <input
            type="time"
            required
            value={form.startTime}
            onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
            className="px-3 py-2 border border-campus-gray-300 rounded-lg"
          />
          <input
            type="time"
            required
            value={form.endTime}
            onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
            className="px-3 py-2 border border-campus-gray-300 rounded-lg"
          />
        </div>
        <textarea
          required
          placeholder="Purpose"
          value={form.purpose}
          onChange={(e) => setForm((p) => ({ ...p, purpose: e.target.value }))}
          className="w-full px-3 py-2 border border-campus-gray-300 rounded-lg"
          rows={4}
        />
        <div className="flex justify-end gap-3 pt-4 border-t border-campus-gray-200">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-campus-gray-700 hover:bg-campus-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Submit Request
          </button>
        </div>
      </form>
    </div>
  )
}

