import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BellIcon, TrashIcon, CheckIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { store } from '../../services/store'
import { PageHeader } from '../shared/PageHeader'
import { EmptyState } from '../shared/EmptyState'

export function NotificationsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('ALL')
  const [notifications, setNotifications] = useState(
    store.notifications.filter((n) => n.userId === user?.id),
  )

  const filtered = notifications.filter((n) => {
    if (activeTab === 'UNREAD') return !n.isRead
    if (activeTab === 'READ') return n.isRead
    return true
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
  }

  const deleteNotification = (id, e) => {
    e.stopPropagation()
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const handleClick = (n) => {
    markAsRead(n.id)
    if (n.relatedId && n.type.startsWith('BOOKING_')) navigate(`/bookings/${n.relatedId}`)
    if (n.relatedId && n.type.startsWith('TICKET_')) navigate(`/tickets/${n.relatedId}`)
  }

  const tabs = [
    { id: 'ALL', label: 'All' },
    { id: 'UNREAD', label: 'Unread' },
    { id: 'READ', label: 'Read' },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Notifications"
        action={
          unreadCount > 0
            ? { label: 'Mark All as Read', onClick: markAllAsRead }
            : undefined
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-campus-gray-200 overflow-hidden mb-6">
        <div className="border-b border-campus-gray-200 flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-campus-gray-500 hover:text-campus-gray-700 hover:border-campus-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BellIcon}
          title="No notifications"
          description={activeTab === 'UNREAD' ? "You're all caught up!" : 'Nothing here yet.'}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={`bg-white rounded-xl shadow-sm border p-4 hover:border-teal-500 transition-colors cursor-pointer ${
                n.isRead ? 'border-campus-gray-200' : 'border-blue-200 bg-blue-50/30'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-campus-gray-100 text-campus-gray-700">
                  <BellIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-campus-gray-900">{n.title}</h3>
                    <span className="text-xs text-campus-gray-500 whitespace-nowrap ml-2">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-campus-gray-700">{n.message}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        markAsRead(n.id)
                      }}
                      className="p-1 text-campus-gray-400 hover:text-teal-600 transition-colors"
                      title="Mark as read"
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => deleteNotification(n.id, e)}
                    className="p-1 text-campus-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

