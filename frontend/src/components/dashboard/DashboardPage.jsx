import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BuildingIcon,
  CalendarIcon,
  TicketIcon,
  BellIcon,
  PlusIcon,
  ArrowRightIcon,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { store } from '../../services/store'
import { StatusBadge } from '../shared/StatusBadge'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const userBookings = store.bookings.filter((b) => b.userId === user?.id)
  const userTickets = store.tickets.filter((t) => t.userId === user?.id)
  const userNotifications = store.notifications.filter((n) => n.userId === user?.id)
  const unreadNotifications = userNotifications.filter((n) => !n.isRead)

  const quickActions = [
    {
      label: 'View Resources',
      icon: BuildingIcon,
      action: () => navigate('/resources'),
    },
    {
      label: 'Make Booking',
      icon: PlusIcon,
      action: () => navigate('/bookings/create'),
    },
    {
      label: 'Report Incident',
      icon: TicketIcon,
      action: () => navigate('/tickets/create'),
    },
  ]

  const stats = [
    {
      label: 'Total Resources',
      value: store.resources.length,
      icon: BuildingIcon,
      color: 'bg-blue-100 text-blue-600',
      action: () => navigate('/resources'),
    },
    {
      label: 'My Bookings',
      value: userBookings.length,
      icon: CalendarIcon,
      color: 'bg-teal-100 text-teal-600',
      action: () => navigate('/bookings'),
    },
    {
      label: 'My Tickets',
      value: userTickets.length,
      icon: TicketIcon,
      color: 'bg-amber-100 text-amber-600',
      action: () => navigate('/tickets'),
    },
    {
      label: 'Unread Notifications',
      value: unreadNotifications.length,
      icon: BellIcon,
      color: 'bg-red-100 text-red-600',
      action: () => navigate('/notifications'),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 mb-1">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-campus-gray-600">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={stat.action}
            className="bg-white rounded-xl p-6 shadow-sm border border-campus-gray-200 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <ArrowRightIcon className="w-5 h-5 text-campus-gray-400 group-hover:text-teal-600 transition-colors" />
            </div>
            <p className="text-3xl font-bold text-navy-900 mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-campus-gray-600">{stat.label}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-campus-gray-200">
        <h2 className="text-lg font-semibold text-navy-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.action}
              className="flex items-center gap-3 px-4 py-3 border-2 border-campus-gray-200 rounded-lg hover:border-teal-600 hover:bg-teal-50 transition-all group"
            >
              <action.icon className="w-5 h-5 text-campus-gray-600 group-hover:text-teal-600" />
              <span className="font-medium text-campus-gray-900">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-campus-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy-900">
              Recent Bookings
            </h2>
            <button
              onClick={() => navigate('/bookings')}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {userBookings.slice(0, 4).map((booking) => (
              <div
                key={booking.id}
                className="p-4 border border-campus-gray-200 rounded-lg hover:border-teal-600 transition-colors cursor-pointer"
                onClick={() => navigate(`/bookings/${booking.id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-campus-gray-900">
                    {booking.resourceName}
                  </p>
                  <StatusBadge status={booking.status} size="sm" />
                </div>
                <p className="text-sm text-campus-gray-600">
                  {booking.date} • {booking.startTime} - {booking.endTime}
                </p>
                <p className="text-sm text-campus-gray-500 mt-1">
                  {booking.purpose}
                </p>
              </div>
            ))}
            {userBookings.length === 0 && (
              <p className="text-center text-campus-gray-500 py-8">
                No bookings yet
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-campus-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy-900">
              Recent Tickets
            </h2>
            <button
              onClick={() => navigate('/tickets')}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {userTickets.slice(0, 4).map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 border border-campus-gray-200 rounded-lg hover:border-teal-600 transition-colors cursor-pointer"
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-campus-gray-900">
                    {ticket.resourceName || 'General'}
                  </p>
                  <StatusBadge status={ticket.status} size="sm" />
                </div>
                <p className="text-sm text-campus-gray-600">
                  {ticket.category}
                </p>
                <p className="text-sm text-campus-gray-500 mt-1 line-clamp-2">
                  {ticket.description}
                </p>
              </div>
            ))}
            {userTickets.length === 0 && (
              <p className="text-center text-campus-gray-500 py-8">
                No tickets yet
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-campus-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-navy-900">
            Recent Notifications
          </h2>
          <button
            onClick={() => navigate('/notifications')}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            View All
          </button>
        </div>
        {userNotifications.slice(0, 4).length > 0 ? (
          <div className="space-y-3">
            {userNotifications.slice(0, 4).map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg ${
                  notification.isRead
                    ? 'border-campus-gray-200 bg-white'
                    : 'border-teal-200 bg-teal-50'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="font-medium text-campus-gray-900">
                    {notification.title}
                  </p>
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-teal-600 rounded-full" />
                  )}
                </div>
                <p className="text-sm text-campus-gray-600">
                  {notification.message}
                </p>
                <p className="text-xs text-campus-gray-500 mt-2">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-campus-gray-500 py-8">
            No notifications yet
          </p>
        )}
      </div>
    </div>
  )
}

