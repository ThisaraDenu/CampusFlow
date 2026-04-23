import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import {
  CalendarDaysIcon,
  ClockIcon,
  TicketIcon,
  TrendingUpIcon,
} from 'lucide-react'
import { PageHeader } from '../shared/PageHeader'
import { analyticsApi } from '../../services/analyticsApi'

const COLORS = ['#0d9488', '#f59e0b', '#10b981', '#6b7280', '#3b82f6', '#ef4444']

function formatDayLabel(day) {
  // backend sends LocalDate as "YYYY-MM-DD"
  try {
    const d = new Date(`${day}T00:00:00`)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return String(day || '')
  }
}

function StatCard({ label, value, hint, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-campus-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-campus-gray-600">{label}</p>
      {hint && <p className="text-xs text-campus-gray-500 mt-2">{hint}</p>}
    </div>
  )
}

export function AdminAnalyticsPage() {
  const [rangeDays, setRangeDays] = useState(30)
  const [topN, setTopN] = useState(5)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const d = await analyticsApi.adminSummary({ rangeDays, topN })
      setData(d)
    } catch (e) {
      setError(e?.message || 'Failed to load analytics')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [rangeDays, topN])

  useEffect(() => {
    load()
  }, [load])

  const bookingsPerDay = useMemo(() => {
    const rows = data?.bookingsPerDay || []
    return rows.map((r) => ({
      day: r.day,
      label: formatDayLabel(r.day),
      count: r.count || 0,
    }))
  }, [data])

  const topResources = useMemo(() => {
    return (data?.topResources || []).map((r) => ({
      resourceId: r.resourceId,
      resourceName: r.resourceName || 'Unknown',
      count: r.count || 0,
    }))
  }, [data])

  const ticketsByStatus = useMemo(() => {
    return (data?.ticketsByStatus || []).map((r) => ({
      name: String(r.name || ''),
      value: r.count || 0,
    }))
  }, [data])

  const ticketsByPriority = useMemo(() => {
    return (data?.ticketsByPriority || []).map((r) => ({
      name: String(r.name || ''),
      count: r.count || 0,
    }))
  }, [data])

  const totalBookings = useMemo(() => {
    return bookingsPerDay.reduce((sum, r) => sum + (r.count || 0), 0)
  }, [bookingsPerDay])

  const totalTickets = useMemo(() => {
    return ticketsByStatus.reduce((sum, r) => sum + (r.value || 0), 0)
  }, [ticketsByStatus])

  const avgResolutionHours = data?.avgResolutionHours
  const avgResolutionLabel =
    avgResolutionHours == null
      ? '—'
      : avgResolutionHours < 1
        ? `${Math.round(avgResolutionHours * 60)} min`
        : `${avgResolutionHours.toFixed(1)} hrs`

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center text-campus-gray-600">
        Loading…
      </div>
    )
  }

  if (!data || error) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <PageHeader
          title="Analytics"
          subtitle="Insights across bookings and maintenance tickets"
        />
        <div className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-6">
          <p className="text-campus-gray-900 font-medium">Failed to load.</p>
          <p className="text-campus-gray-600 text-sm mt-1">{error}</p>
          <button
            type="button"
            onClick={load}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Analytics"
        subtitle="Track trends, hotspots, and operational performance"
      />

      <div className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="text-sm text-campus-gray-700 font-medium">Range</div>
        <select
          value={rangeDays}
          onChange={(e) => setRangeDays(Number(e.target.value))}
          className="px-3 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>

        <div className="text-sm text-campus-gray-700 font-medium ml-2">
          Top resources
        </div>
        <select
          value={topN}
          onChange={(e) => setTopN(Number(e.target.value))}
          className="px-3 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        >
          <option value={3}>Top 3</option>
          <option value={5}>Top 5</option>
          <option value={10}>Top 10</option>
        </select>

        <button
          type="button"
          onClick={load}
          className="ml-auto px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label={`Bookings (last ${rangeDays}d)`}
          value={totalBookings}
          hint="Count of booking requests created"
          icon={CalendarDaysIcon}
          color="bg-amber-100 text-amber-700"
        />
        <StatCard
          label={`Tickets (last ${rangeDays}d)`}
          value={totalTickets}
          hint="Count of reported incidents created"
          icon={TicketIcon}
          color="bg-red-100 text-red-700"
        />
        <StatCard
          label="Avg resolution time"
          value={avgResolutionLabel}
          hint="Resolved/closed tickets updated in range"
          icon={ClockIcon}
          color="bg-teal-100 text-teal-700"
        />
        <StatCard
          label="Top resource"
          value={topResources[0]?.resourceName || '—'}
          hint={
            topResources[0]
              ? `${topResources[0].count} bookings`
              : 'No booking data'
          }
          icon={TrendingUpIcon}
          color="bg-blue-100 text-blue-700"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-6">
          <h3 className="text-lg font-semibold text-campus-gray-900 mb-4">
            Bookings per day
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={bookingsPerDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                name="Bookings"
                stroke="#0d9488"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-6">
          <h3 className="text-lg font-semibold text-campus-gray-900 mb-4">
            Top booked resources
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topResources}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="resourceName" hide />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="Bookings" fill="#0d9488" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {topResources.map((r, idx) => (
              <div
                key={r.resourceId}
                className="flex items-center justify-between text-sm"
              >
                <div className="text-campus-gray-700 truncate">
                  {idx + 1}. {r.resourceName}
                </div>
                <div className="text-campus-gray-500">{r.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-6">
          <h3 className="text-lg font-semibold text-campus-gray-900 mb-4">
            Tickets by status
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={ticketsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={95}
                dataKey="value"
              >
                {ticketsByStatus.map((entry, index) => (
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

        <div className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-6">
          <h3 className="text-lg font-semibold text-campus-gray-900 mb-4">
            Tickets by priority
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={ticketsByPriority}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="Tickets" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

