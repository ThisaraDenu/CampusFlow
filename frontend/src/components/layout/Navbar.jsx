import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  SearchIcon,
  BellIcon,
  ChevronDownIcon,
  UserIcon,
  LogOutIcon,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { notificationsApi } from '../../services/notificationsApi'
import { motion, AnimatePresence } from 'framer-motion'

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const list = await notificationsApi.list()
        const n = list.filter((x) => x.userId === user?.id && !x.isRead).length
        if (!cancelled) setUnreadCount(n)
      } catch {
        if (!cancelled) setUnreadCount(0)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.id, location.pathname])

  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/dashboard') return 'Dashboard'
    if (path === '/resources') return 'Resources'
    if (path.startsWith('/resources/add')) return 'Add Resource'
    if (path.startsWith('/resources/') && path.endsWith('/edit'))
      return 'Edit Resource'
    if (path.startsWith('/resources/')) return 'Resource Details'
    if (path === '/bookings') return 'My Bookings'
    if (path === '/bookings/create') return 'Create Booking'
    if (path.startsWith('/bookings/')) return 'Booking Details'
    if (path === '/tickets') return 'My Tickets'
    if (path === '/tickets/create') return 'Report Incident'
    if (path.startsWith('/tickets/')) return 'Ticket Details'
    if (path === '/notifications') return 'Notifications'
    if (path === '/profile') return 'Profile'
    if (path === '/admin') return 'Admin Dashboard'
    if (path === '/admin/bookings') return 'Manage Bookings'
    if (path === '/admin/tickets') return 'Manage Tickets'
    if (path === '/admin/users') return 'Manage Users'
    if (path === '/technician/tickets') return 'Assigned Tickets'
    return 'CampusFlow'
  }

  return (
    <header className="h-16 bg-white border-b border-campus-gray-200 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-30">
      <h2 className="text-xl font-semibold text-navy-900">{getPageTitle()}</h2>

      <div className="flex items-center gap-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-campus-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-64 border border-campus-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-campus-gray-600 hover:bg-campus-gray-50 rounded-lg transition-colors"
        >
          <BellIcon className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-2 hover:bg-campus-gray-50 rounded-lg transition-colors"
          >
            <img
              src={
                user?.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'user')}`
              }
              alt={user?.name}
              className="w-8 h-8 rounded-full"
            />
            <ChevronDownIcon className="w-4 h-4 text-campus-gray-600" />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-campus-gray-200 py-2"
              >
                <div className="px-4 py-2 border-b border-campus-gray-200">
                  <p className="text-sm font-medium text-campus-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-campus-gray-600">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    navigate('/profile')
                    setShowProfileMenu(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-campus-gray-700 hover:bg-campus-gray-50"
                >
                  <UserIcon className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={async () => {
                    await logout()
                    setShowProfileMenu(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-campus-gray-200 mt-1"
                >
                  <LogOutIcon className="w-4 h-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

