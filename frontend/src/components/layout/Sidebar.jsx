import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboardIcon,
  BuildingIcon,
  CalendarIcon,
  TicketIcon,
  BellIcon,
  PlusIcon,
  SettingsIcon,
  UsersIcon,
  LogOutIcon,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function Sidebar() {
  const { user, logout } = useAuth()

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
      isActive
        ? 'bg-teal-50 text-teal-700 font-medium'
        : 'text-campus-gray-600 hover:bg-campus-gray-50'
    }`

  return (
    <aside className="w-64 bg-white border-r border-campus-gray-200 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-campus-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center">
            <BuildingIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-navy-900">CampusOps</h1>
            <p className="text-xs text-campus-gray-600">Hub</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <NavLink to="/dashboard" className={navLinkClass}>
          <LayoutDashboardIcon className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>

        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-semibold text-campus-gray-500 uppercase tracking-wider">
            Resources
          </p>
        </div>
        <NavLink to="/resources" className={navLinkClass}>
          <BuildingIcon className="w-5 h-5" />
          <span>View Resources</span>
        </NavLink>

        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-semibold text-campus-gray-500 uppercase tracking-wider">
            Bookings
          </p>
        </div>
        <NavLink to="/bookings" className={navLinkClass}>
          <CalendarIcon className="w-5 h-5" />
          <span>My Bookings</span>
        </NavLink>
        <NavLink to="/bookings/create" className={navLinkClass}>
          <PlusIcon className="w-5 h-5" />
          <span>Create Booking</span>
        </NavLink>

        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-semibold text-campus-gray-500 uppercase tracking-wider">
            Tickets
          </p>
        </div>
        <NavLink to="/tickets" className={navLinkClass}>
          <TicketIcon className="w-5 h-5" />
          <span>My Tickets</span>
        </NavLink>
        <NavLink to="/tickets/create" className={navLinkClass}>
          <PlusIcon className="w-5 h-5" />
          <span>Report Incident</span>
        </NavLink>

        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-semibold text-campus-gray-500 uppercase tracking-wider">
            Other
          </p>
        </div>
        <NavLink to="/notifications" className={navLinkClass}>
          <BellIcon className="w-5 h-5" />
          <span>Notifications</span>
        </NavLink>

        {user?.role === 'ADMIN' && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-campus-gray-500 uppercase tracking-wider">
                Admin
              </p>
            </div>
            <NavLink to="/admin" className={navLinkClass}>
              <SettingsIcon className="w-5 h-5" />
              <span>Admin Dashboard</span>
            </NavLink>
            <NavLink to="/admin/bookings" className={navLinkClass}>
              <CalendarIcon className="w-5 h-5" />
              <span>Manage Bookings</span>
            </NavLink>
            <NavLink to="/admin/tickets" className={navLinkClass}>
              <TicketIcon className="w-5 h-5" />
              <span>Manage Tickets</span>
            </NavLink>
            <NavLink to="/admin/users" className={navLinkClass}>
              <UsersIcon className="w-5 h-5" />
              <span>Manage Users</span>
            </NavLink>
          </>
        )}

        {user?.role === 'TECHNICIAN' && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-campus-gray-500 uppercase tracking-wider">
                Technician
              </p>
            </div>
            <NavLink to="/technician/tickets" className={navLinkClass}>
              <TicketIcon className="w-5 h-5" />
              <span>Assigned Tickets</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-campus-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-campus-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-campus-gray-600 truncate">{user?.role}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={async () => {
            await logout()
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-campus-gray-700 hover:bg-campus-gray-50 rounded-lg transition-colors"
        >
          <LogOutIcon className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

