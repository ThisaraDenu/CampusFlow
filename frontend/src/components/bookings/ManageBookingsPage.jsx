import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchIcon, CalendarIcon, ClockIcon, UserIcon } from 'lucide-react'
import { store } from '../../services/store'
import { PageHeader } from '../shared/PageHeader'
import { StatusBadge } from '../shared/StatusBadge'
import { EmptyState } from '../shared/EmptyState'
import { BookingDecisionModal } from './BookingDecisionModal'

export function ManageBookingsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('PENDING')
  const [searchQuery, setSearchQuery] = useState('')
  const [decisionModalOpen, setDecisionModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [, setVersion] = useState(0)

  const filteredBookings = store.bookings.filter((booking) => {
    const matchesTab = activeTab === 'ALL' || booking.status === activeTab
    const matchesSearch =
      booking.resourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.purpose.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  const handleReviewClick = (booking, e) => {
    e.stopPropagation()
    setSelectedBooking(booking)
    setDecisionModalOpen(true)
  }

  const handleDecision = (decision, reason) => {
    if (selectedBooking) {
      const index = store.bookings.findIndex((b) => b.id === selectedBooking.id)
      if (index !== -1) {
        store.bookings[index].status = decision
        if (reason) store.bookings[index].reviewReason = reason
        store.bookings[index].updatedAt = new Date().toISOString()
        setVersion((v) => v + 1)
      }
    }
  }

  const pendingCount = store.bookings.filter((b) => b.status === 'PENDING').length

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Manage Bookings"
        subtitle="Review and process resource booking requests from users."
      />

      <div className="bg-white rounded-xl shadow-sm border border-campus-gray-200 overflow-hidden mb-6">
        <div className="border-b border-campus-gray-200 flex">
          <button
            type="button"
            onClick={() => setActiveTab('PENDING')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'PENDING'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-campus-gray-500 hover:text-campus-gray-700 hover:border-campus-gray-300'
            }`}
          >
            Needs Review
            {pendingCount > 0 && (
              <span className="bg-amber-100 text-amber-800 py-0.5 px-2 rounded-full text-xs">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'ALL'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-campus-gray-500 hover:text-campus-gray-700 hover:border-campus-gray-300'
            }`}
          >
            All Bookings
          </button>
        </div>

        <div className="p-4 bg-campus-gray-50/50 border-b border-campus-gray-200">
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-campus-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by resource, user, or purpose..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
            />
          </div>
        </div>

        {sortedBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-campus-gray-50 border-b border-campus-gray-200 text-xs uppercase tracking-wider text-campus-gray-500">
                  <th className="px-6 py-4 font-medium">Resource & Purpose</th>
                  <th className="px-6 py-4 font-medium">Requested By</th>
                  <th className="px-6 py-4 font-medium">Date & Time</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-campus-gray-100">
                {sortedBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    onClick={() => navigate(`/bookings/${booking.id}`)}
                    className="hover:bg-campus-gray-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-campus-gray-900 mb-1">
                        {booking.resourceName}
                      </div>
                      <div className="text-sm text-campus-gray-500 truncate max-w-xs">
                        {booking.purpose}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-campus-gray-700">
                        <UserIcon className="w-4 h-4 mr-2 text-campus-gray-400" />
                        {booking.userName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-campus-gray-900 flex items-center mb-1">
                        <CalendarIcon className="w-4 h-4 mr-2 text-campus-gray-400" />
                        {formatDate(booking.date)}
                      </div>
                      <div className="text-sm text-campus-gray-500 flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2 text-campus-gray-400" />
                        {booking.startTime} - {booking.endTime}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={booking.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {booking.status === 'PENDING' ? (
                        <button
                          type="button"
                          onClick={(e) => handleReviewClick(booking, e)}
                          className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
                        >
                          Review
                        </button>
                      ) : (
                        <span className="text-sm text-campus-gray-400 group-hover:text-teal-600 transition-colors font-medium">
                          View Details &rarr;
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={CalendarIcon}
            title={
              searchQuery
                ? 'No matching bookings found'
                : 'No bookings to review'
            }
            description={
              searchQuery
                ? 'Try adjusting your search terms.'
                : activeTab === 'PENDING'
                  ? 'All caught up! There are no pending booking requests.'
                  : 'There are no bookings in the system yet.'
            }
          />
        )}
      </div>

      <BookingDecisionModal
        isOpen={decisionModalOpen}
        onClose={() => setDecisionModalOpen(false)}
        onConfirm={handleDecision}
        booking={selectedBooking}
      />
    </div>
  )
}
