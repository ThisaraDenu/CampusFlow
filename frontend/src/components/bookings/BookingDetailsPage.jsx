import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { bookingsApi } from '../../services/bookingsApi'
import { resourcesApi } from '../../services/resourcesApi'
import { StatusBadge } from '../shared/StatusBadge'
import { ErrorState } from '../shared/ErrorState'

export function BookingDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [booking, setBooking] = useState(null)
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [adminEditOpen, setAdminEditOpen] = useState(false)
  const [adminForm, setAdminForm] = useState(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const b = await bookingsApi.getById(id)
      setBooking(b)
      try {
        setResource(await resourcesApi.getById(b.resourceId))
      } catch {
        setResource(null)
      }
      setForm({
        date: b.date,
        startTime: (b.startTime || '').slice(0, 5),
        endTime: (b.endTime || '').slice(0, 5),
        purpose: b.purpose || '',
        attendees: b.attendees || 1,
      })
    } catch (e) {
      setError(e?.message || 'Not found')
      setBooking(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-campus-gray-600">
        Loading…
      </div>
    )
  }

  if (!booking || error) {
    return (
      <ErrorState
        message={error || 'Booking not found.'}
        onRetry={() => navigate('/bookings')}
      />
    )
  }

  const isOwner = booking.userId === user?.id
  const canCancel =
    isOwner && (booking.status === 'PENDING' || booking.status === 'APPROVED')
  const canEdit = isOwner && booking.status === 'PENDING'
  const isAdmin = user?.role === 'ADMIN'

  const handleCancel = async () => {
    const ok = window.confirm('Cancel this booking?')
    if (!ok) return
    try {
      await bookingsApi.cancel(booking.id)
      await load()
    } catch (e) {
      alert(e?.message || 'Could not cancel booking')
    }
  }

  const handleSave = async () => {
    if (!form) return
    try {
      await bookingsApi.update(booking.id, {
        date: form.date,
        startTime:
          form.startTime?.length === 5 ? `${form.startTime}:00` : form.startTime,
        endTime: form.endTime?.length === 5 ? `${form.endTime}:00` : form.endTime,
        purpose: form.purpose,
        attendees: Number(form.attendees) || 1,
      })
      setEditing(false)
      await load()
    } catch (e) {
      alert(e?.message || 'Could not update booking')
    }
  }

  const openAdminEdit = () => {
    setAdminForm({
      date: booking.date,
      startTime: (booking.startTime || '').slice(0, 5),
      endTime: (booking.endTime || '').slice(0, 5),
      attendees: booking.attendees || 1,
      purpose: booking.purpose || '',
    })
    setAdminEditOpen(true)
  }

  const saveAdminEdit = async () => {
    if (!adminForm) return
    try {
      await bookingsApi.adminUpdate(booking.id, {
        date: adminForm.date,
        startTime:
          adminForm.startTime?.length === 5
            ? `${adminForm.startTime}:00`
            : adminForm.startTime,
        endTime:
          adminForm.endTime?.length === 5 ? `${adminForm.endTime}:00` : adminForm.endTime,
        attendees: Number(adminForm.attendees) || 1,
        purpose: adminForm.purpose || '',
      })
      setAdminEditOpen(false)
      await load()
    } catch (e) {
      alert(e?.message || 'Could not update booking')
    }
  }

  const adminDelete = async () => {
    const ok = window.confirm('Delete this booking?')
    if (!ok) return
    try {
      await bookingsApi.adminDelete(booking.id)
      navigate('/bookings', { replace: true })
    } catch (e) {
      alert(e?.message || 'Could not delete booking')
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-campus-gray-500 hover:text-campus-gray-900 transition-colors mb-6 font-medium text-sm"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-campus-gray-200 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-campus-gray-900">
              {booking.resourceName}
            </h1>
            <p className="text-campus-gray-600 mt-1">
              {booking.date} • {booking.startTime} - {booking.endTime}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={booking.status} />
            {canEdit && (
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                className="px-3 py-1 border border-campus-gray-300 rounded-lg text-sm text-campus-gray-700 hover:bg-campus-gray-50"
              >
                {editing ? 'Close' : 'Edit'}
              </button>
            )}
            {canCancel && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm hover:bg-red-100"
              >
                Cancel Booking
              </button>
            )}
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={openAdminEdit}
                  className="px-3 py-1 border border-campus-gray-300 rounded-lg text-sm text-campus-gray-700 hover:bg-campus-gray-50"
                >
                  Admin Edit
                </button>
                <button
                  type="button"
                  onClick={adminDelete}
                  className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm hover:bg-red-100"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="bg-campus-gray-50 border border-campus-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-campus-gray-900 mb-2">
              Booking Details
            </h3>
            <div className="text-sm text-campus-gray-700 space-y-1">
              <div>
                <span className="text-campus-gray-500">Attendees:</span>{' '}
                {booking.attendees}
              </div>
              {isAdmin && (
                <div>
                  <span className="text-campus-gray-500">Booked by:</span>{' '}
                  {booking.userName}
                </div>
              )}
              {booking.reviewReason && (
                <div>
                  <span className="text-campus-gray-500">Review reason:</span>{' '}
                  {booking.reviewReason}
                </div>
              )}
            </div>
          </div>

          <div className="bg-campus-gray-50 border border-campus-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-campus-gray-900 mb-2">
              Resource Details
            </h3>
            {resource ? (
              <div className="text-sm text-campus-gray-700 space-y-1">
                <div>
                  <span className="text-campus-gray-500">Location:</span>{' '}
                  {resource.location}
                </div>
                <div>
                  <span className="text-campus-gray-500">Capacity:</span>{' '}
                  {resource.capacity}
                </div>
                {resource.type && (
                  <div>
                    <span className="text-campus-gray-500">Type:</span>{' '}
                    {String(resource.type).replace(/_/g, ' ')}
                  </div>
                )}
                {resource.availabilityStart && resource.availabilityEnd && (
                  <div>
                    <span className="text-campus-gray-500">Availability:</span>{' '}
                    {String(resource.availabilityStart).slice(0, 5)} -{' '}
                    {String(resource.availabilityEnd).slice(0, 5)}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => navigate(`/resources/${resource.id}`)}
                  className="mt-2 text-sm text-teal-700 font-medium hover:text-teal-800"
                >
                  View resource →
                </button>
              </div>
            ) : (
              <p className="text-sm text-campus-gray-600">
                Resource details unavailable.
              </p>
            )}
          </div>
        </div>

        {editing && form && (
          <div className="mt-6 bg-campus-gray-50 border border-campus-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-campus-gray-900 mb-3">
              Update booking (pending only)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                className="px-3 py-2 border border-campus-gray-300 rounded-lg"
              />
              <input
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm((p) => ({ ...p, startTime: e.target.value }))
                }
                className="px-3 py-2 border border-campus-gray-300 rounded-lg"
              />
              <input
                type="time"
                value={form.endTime}
                onChange={(e) =>
                  setForm((p) => ({ ...p, endTime: e.target.value }))
                }
                className="px-3 py-2 border border-campus-gray-300 rounded-lg"
              />
            </div>
            <textarea
              value={form.purpose}
              onChange={(e) => setForm((p) => ({ ...p, purpose: e.target.value }))}
              className="w-full mt-3 px-3 py-2 border border-campus-gray-300 rounded-lg"
              rows={3}
              placeholder="Purpose"
            />
            <div className="mt-3">
              <label className="block text-sm font-medium text-campus-gray-700 mb-1">
                Attendees
              </label>
              <input
                type="number"
                min={1}
                value={form.attendees}
                onChange={(e) =>
                  setForm((p) => ({ ...p, attendees: e.target.value }))
                }
                className="w-full px-3 py-2 border border-campus-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-center justify-end gap-3 mt-3">
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setForm({
                    date: booking.date,
                    startTime: (booking.startTime || '').slice(0, 5),
                    endTime: (booking.endTime || '').slice(0, 5),
                    purpose: booking.purpose || '',
                    attendees: booking.attendees || 1,
                  })
                }}
                className="px-4 py-2 text-campus-gray-700 hover:bg-campus-gray-100 rounded-lg"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        <div className="mt-6">
          <h3 className="font-semibold text-campus-gray-900 mb-2">Purpose</h3>
          <p className="text-campus-gray-700 whitespace-pre-wrap">
            {booking.purpose || '—'}
          </p>
        </div>
      </div>

      {isAdmin && adminEditOpen && adminForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setAdminEditOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl border border-campus-gray-200 w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-campus-gray-900 mb-1">
              Admin edit booking
            </h3>
            <p className="text-sm text-campus-gray-600 mb-4">
              {booking.resourceName} • {booking.userName}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="date"
                value={adminForm.date}
                onChange={(e) =>
                  setAdminForm((p) => ({ ...p, date: e.target.value }))
                }
                className="px-3 py-2 border border-campus-gray-300 rounded-lg"
              />
              <input
                type="time"
                value={adminForm.startTime}
                onChange={(e) =>
                  setAdminForm((p) => ({ ...p, startTime: e.target.value }))
                }
                className="px-3 py-2 border border-campus-gray-300 rounded-lg"
              />
              <input
                type="time"
                value={adminForm.endTime}
                onChange={(e) =>
                  setAdminForm((p) => ({ ...p, endTime: e.target.value }))
                }
                className="px-3 py-2 border border-campus-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <input
                type="number"
                min={1}
                value={adminForm.attendees}
                onChange={(e) =>
                  setAdminForm((p) => ({ ...p, attendees: e.target.value }))
                }
                className="px-3 py-2 border border-campus-gray-300 rounded-lg"
                placeholder="Attendees"
              />
              <input
                type="text"
                value={adminForm.purpose}
                onChange={(e) =>
                  setAdminForm((p) => ({ ...p, purpose: e.target.value }))
                }
                className="px-3 py-2 border border-campus-gray-300 rounded-lg"
                placeholder="Purpose"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setAdminEditOpen(false)}
                className="px-4 py-2 text-campus-gray-700 hover:bg-campus-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveAdminEdit}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
