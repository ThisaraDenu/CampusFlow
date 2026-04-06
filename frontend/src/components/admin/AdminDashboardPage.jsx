import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BuildingIcon,
  CalendarIcon,
  TicketIcon,
  UsersIcon,
  ArrowRightIcon,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'
import { store } from '../../services/store'
import { PageHeader } from '../shared/PageHeader'
import { StatusBadge } from '../shared/StatusBadge'

export function AdminDashboardPage() {
  const navigate = useNavigate()

  const pendingBookings = store.bookings.filter((b) => b.status === 'PENDING').length
  const openTickets = store.tickets.filter(
    (t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS',
  ).length

  const stats = [
    {
      label: 'Total Resources',
      value: store.resources.length,
      icon: BuildingIcon,
      color: 'bg-blue-100 text-blue-600',
      link: '/resources',
    },
    {
      label: 'Pending Bookings',
      value: pendingBookings,
      icon: CalendarIcon,
      color: 'bg-amber-100 text-amber-600',
      link: '/admin/bookings',
    },
    {
      label: 'Open Tickets',
      value: openTickets,
      icon: TicketIcon,
      color: 'bg-red-100 text-red-600',
      link: '/admin/tickets',
    },
    {
      label: 'Total Users',
      value: store.users.length,
      icon: UsersIcon,
      color: 'bg-teal-100 text-teal-600',
      link: '/admin/users',
    },
  ]

  const resourceTypeData = [
    {
      name: 'Lecture Halls',
      count: store.resources.filter((r) => r.type === 'LECTURE_HALL').length,
    },
    {
      name: 'Laboratories',
      count: store.resources.filter((r) => r.type === 'LABORATORY').length,
    },
    {
      name: 'Meeting Rooms',
      count: store.resources.filter((r) => r.type === 'MEETING_ROOM').length,
    },
    {
      name: 'Equipment',
      count: store.resources.filter((r) => r.type === 'EQUIPMENT').length,
    },
  ]

  const ticketStatusData = [
    { name: 'Open', value: store.tickets.filter((t) => t.status === 'OPEN').length },
    {
      name: 'In Progress',
      value: store.tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    },
    {
      name: 'Resolved',
      value: store.tickets.filter((t) => t.status === 'RESOLVED').length,
    },
    { name: 'Closed', value: store.tickets.filter((t) => t.status === 'CLOSED').length },
  ]

  const COLORS = ['#0d9488', '#f59e0b', '#10b981', '#6b7280']

  const recentActivity = [
    ...store.bookings.slice(0, 3).map((b) => ({
      id: b.id,
      type: 'booking',
      description: `${b.userName} requested ${b.resourceName}`,
      status: b.status,
      date: b.updatedAt,
    })),
    ...store.tickets.slice(0, 2).map((t) => ({
      id: t.id,
      type: 'ticket',
      description: `${t.userName} reported: ${t.description.substring(0, 50)}...`,
      status: t.status,
      date: t.updatedAt,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const quickActions = [
    {
      title: 'Manage Resources',
      description: 'Add, edit, or remove campus resources',
      link: '/resources',
      icon: BuildingIcon,
    },
    {
      title: 'Review Bookings',
      description: 'Approve or reject booking requests',
      link: '/admin/bookings',
      icon: CalendarIcon,
    },
    {
      title: 'Manage Tickets',
      description: 'Assign and track maintenance tickets',
      link: '/admin/tickets',
      icon: TicketIcon,
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      link: '/admin/users',
      icon: UsersIcon,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Overview of campus operations"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              onClick={() => navigate(stat.link)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') navigate(stat.link)
              }}
              className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-6 hover:border-teal-500 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-campus-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-campus-gray-600">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <div
              key={action.title}
              onClick={() => navigate(action.link)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') navigate(action.link)
              }}
              className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-6 hover:border-teal-500 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-campus-gray-900 mb-1">
                      {action.title}
                    </h3>
                    <p className="text-sm text-campus-gray-600">
                      {action.description}
                    </p>
                  </div>
                </div>
                <ArrowRightIcon className="w-5 h-5 text-campus-gray-400 group-hover:text-teal-600 transition-colors" />
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-6">
          <h3 className="text-lg font-semibold text-campus-gray-900 mb-4">
            Resource Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resourceTypeData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0d9488" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-6">
          <h3 className="text-lg font-semibold text-campus-gray-900 mb-4">
            Ticket Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ticketStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {ticketStatusData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-6">
        <h3 className="text-lg font-semibold text-campus-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {recentActivity.map((activity) => {
            const Icon = activity.type === 'booking' ? CalendarIcon : TicketIcon
            return (
              <div
                key={`${activity.type}-${activity.id}`}
                className="flex items-center gap-4 p-3 bg-campus-gray-50 rounded-lg"
              >
                <div className="w-8 h-8 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-campus-gray-900 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-campus-gray-500">
                    {formatDate(activity.date)}
                  </p>
                </div>
                <StatusBadge status={activity.status} size="sm" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
