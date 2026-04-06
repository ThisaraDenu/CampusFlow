import React, { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from 'lucide-react'
import { bookingsApi } from '../../services/bookingsApi'
import { StatusBadge } from '../shared/StatusBadge'
import { ErrorState } from '../shared/ErrorState'

export function BookingDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      setBooking(await bookingsApi.getById(id))
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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-campus-gray-900">
              {booking.resourceName}
            </h1>
            <p className="text-campus-gray-600 mt-1">
              {booking.date} • {booking.startTime} - {booking.endTime}
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-campus-gray-900 mb-2">Purpose</h3>
          <p className="text-campus-gray-700 whitespace-pre-wrap">
            {booking.purpose || '—'}
          </p>
        </div>
      </div>
    </div>
  )
}
