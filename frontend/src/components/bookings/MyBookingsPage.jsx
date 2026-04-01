import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarIcon, PlusIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { store } from '../../services/store'
import { PageHeader } from '../shared/PageHeader'
import { StatusBadge } from '../shared/StatusBadge'
import { EmptyState } from '../shared/EmptyState'

export function MyBookingsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const bookings = store.bookings.filter((b) => b.userId === user?.id)

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="My Bookings"
        subtitle="Manage your resource reservations and requests."
        action={{
          label: 'New Booking',
          icon: <PlusIcon className="w-5 h-5" />,
          onClick: () => navigate('/bookings/create'),
        }}
      />

      {bookings.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No bookings yet"
          description="Create a booking request to get started."
          action={{ label: 'Create Booking', onClick: () => navigate('/bookings/create') }}
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              onClick={() => navigate(`/bookings/${b.id}`)}
              className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-4 hover:border-teal-500 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-campus-gray-900">
                    {b.resourceName}
                  </div>
                  <div className="text-sm text-campus-gray-600">
                    {b.date} • {b.startTime} - {b.endTime}
                  </div>
                </div>
                <StatusBadge status={b.status} size="sm" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

