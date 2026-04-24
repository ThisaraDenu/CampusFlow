import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeftIcon } from 'lucide-react'
import { resourcesApi } from '../../services/resourcesApi'
import { bookingsApi } from '../../services/bookingsApi'
import { PageHeader } from '../shared/PageHeader'

export function CreateBookingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialResourceId = searchParams.get('resourceId') || ''
  const initialDate = searchParams.get('date') || ''
  const initialStartTime = searchParams.get('startTime') || ''
  const initialEndTime = searchParams.get('endTime') || ''

  const [form, setForm] = useState({
    resourceId: initialResourceId,
    date: initialDate,
    startTime: initialStartTime,
    endTime: initialEndTime,
    purpose: '',
    attendees: 1,
  })
  const [resources, setResources] = useState([])
  const [conflicts, setConflicts] = useState([])
  const [conflictsLoading, setConflictsLoading] = useState(false)
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

  const selectedResource = useMemo(
    () => resources.find((r) => r.id === form.resourceId) || null,
    [resources, form.resourceId],
  )

  const isTimeOrderValid = useMemo(() => {
    if (!form.startTime || !form.endTime) return true
    return String(form.startTime) < String(form.endTime)
  }, [form.startTime, form.endTime])

  const isWithinAvailability = useMemo(() => {
    const r = selectedResource
    if (!r) return true
    const aStart = r.availabilityStart?.slice(0, 5)
    const aEnd = r.availabilityEnd?.slice(0, 5)
    if (!aStart || !aEnd) return true
    if (!form.startTime || !form.endTime) return true
    return (
      String(aStart) <= String(form.startTime) &&
      String(form.endTime) <= String(aEnd)
    )
  }, [selectedResource, form.startTime, form.endTime])

  const overlaps = (aStart, aEnd, bStart, bEnd) =>
    String(aStart) < String(bEnd) && String(bStart) < String(aEnd)

  const hasOverlapConflict = useMemo(() => {
    if (!form.startTime || !form.endTime) return false
    return conflicts.some((c) =>
      overlaps(
        String(c.startTime).slice(0, 5),
        String(c.endTime).slice(0, 5),
        String(form.startTime),
        String(form.endTime),
      ),
    )
  }, [conflicts, form.startTime, form.endTime])

  const hasOngoingApproved = useMemo(() => {
    const now = new Date()
    const today = now.toISOString().slice(0, 10)
    return conflicts.some((c) => {
      if (String(c.status) !== 'APPROVED') return false
      if (form.date !== today) return false
      const s = String(c.startTime).slice(0, 5)
      const e = String(c.endTime).slice(0, 5)
      const nowHHMM = now.toTimeString().slice(0, 5)
      return s <= nowHHMM && nowHHMM < e
    })
  }, [conflicts, form.date])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!form.resourceId || !form.date) {
        setConflicts([])
        return
      }
      setConflictsLoading(true)
      try {
        const rows = await bookingsApi.conflicts(form.resourceId, form.date)
        if (!cancelled) setConflicts(rows || [])
      } catch {
        if (!cancelled) setConflicts([])
      } finally {
        if (!cancelled) setConflictsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [form.resourceId, form.date])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.resourceId) return
    if (!isTimeOrderValid) {
      alert('End time must be after start time.')
      return
    }
    if (!isWithinAvailability) {
      alert('Selected time is outside the resource availability hours.')
      return
    }
    if (hasOverlapConflict) {
      alert('Already booked. Please choose another time slot.')
      return
    }
    setSubmitting(true)
    try {
      await bookingsApi.create({
        resourceId: form.resourceId,
        date: form.date,
        startTime: form.startTime.length === 5 ? `${form.startTime}:00` : form.startTime,
        endTime: form.endTime.length === 5 ? `${form.endTime}:00` : form.endTime,
        purpose: form.purpose,
        attendees: Number(form.attendees) || 1,
      })
      navigate('/bookings')
    } catch (err) {
      const msg = err?.message || 'Could not create booking'
      if (msg.toLowerCase().includes('already booked')) {
        alert('Already booked. Please choose another time slot.')
      } else {
        alert(msg)
      }
    } finally {
      setSubmitting(false)
    }
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
            {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
          </select>
        </div>

        {selectedResource && (
          <div className="bg-campus-gray-50 border border-campus-gray-200 rounded-lg p-4 text-sm text-campus-gray-700">
            <div className="font-semibold text-campus-gray-900 mb-1">
              {selectedResource.name}
            </div>
            <div className="text-campus-gray-700">
              {selectedResource.location}
              {selectedResource.capacity
                ? ` • Capacity: ${selectedResource.capacity}`
                : ''}
              {selectedResource.type
                ? ` • ${String(selectedResource.type).replace(/_/g, ' ')}`
                : ''}
            </div>
            {selectedResource.availabilityStart && selectedResource.availabilityEnd && (
              <div className="text-campus-gray-600 mt-1">
                Available: {String(selectedResource.availabilityStart).slice(0, 5)} -{' '}
                {String(selectedResource.availabilityEnd).slice(0, 5)}
              </div>
            )}
          </div>
        )}

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

        {!isTimeOrderValid && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            End time must be after start time.
          </p>
        )}
        {!isWithinAvailability && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            Selected time is outside resource availability hours.
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-campus-gray-700 mb-1">
            Attendees
          </label>
          <input
            type="number"
            min={1}
            value={form.attendees}
            onChange={(e) => setForm((p) => ({ ...p, attendees: e.target.value }))}
            className="w-full px-3 py-2 border border-campus-gray-300 rounded-lg"
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

        <div className="bg-white border border-campus-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-campus-gray-900">Availability</p>
            {conflictsLoading && (
              <p className="text-xs text-campus-gray-500">Checking…</p>
            )}
          </div>
          {hasOngoingApproved && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
              Warning: this resource has an ongoing approved booking right now.
            </p>
          )}
          {conflicts.length === 0 ? (
            <p className="text-sm text-campus-gray-600">
              No bookings for this resource on the selected date.
            </p>
          ) : (
            <div className="space-y-2">
              {conflicts.map((c, idx) => {
                const s = String(c.startTime).slice(0, 5)
                const e = String(c.endTime).slice(0, 5)
                const status = String(c.status)
                const isBlocking = ['PENDING', 'APPROVED'].includes(status)
                return (
                  <div
                    key={`${s}-${e}-${status}-${idx}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-campus-gray-700">
                      {s} - {e}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs border ${
                        status === 'APPROVED'
                          ? 'bg-red-50 text-red-700 border-red-100'
                          : isBlocking
                            ? 'bg-amber-50 text-amber-800 border-amber-100'
                            : 'bg-campus-gray-50 text-campus-gray-700 border-campus-gray-200'
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                )
              })}
              <p className="text-xs text-campus-gray-500 mt-2">
                Note: Overlapping time slots are not allowed.
              </p>
            </div>
          )}
        </div>
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
            disabled={
              submitting ||
              !isTimeOrderValid ||
              !isWithinAvailability ||
              hasOverlapConflict
            }
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  )
}

