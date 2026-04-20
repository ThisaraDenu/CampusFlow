import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, TicketIcon, SearchIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ticketsApi } from '../../services/ticketsApi'
import { PageHeader } from '../shared/PageHeader'
import { StatusBadge } from '../shared/StatusBadge'
import { EmptyState } from '../shared/EmptyState'

export function MyTicketsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await ticketsApi.list('my')
      setTickets(list)
    } catch {
      setTickets([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Keep statuses fresh while user is on this page (technician/admin may update tickets).
  useEffect(() => {
    if (!user?.id) return
    const t = setInterval(() => {
      load()
    }, 8000)
    return () => clearInterval(t)
  }, [load, user?.id])

  const userTickets = tickets.filter((t) => t.userId === user?.id)

  const filteredTickets = userTickets.filter((ticket) => {
    const matchesTab = activeTab === 'ALL' || ticket.status === activeTab
    const matchesSearch =
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.resourceName?.toLowerCase() || '').includes(
        searchQuery.toLowerCase(),
      ) ||
      ticket.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const priorityWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority]
    if (priorityDiff !== 0) return priorityDiff
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  const tabs = [
    { id: 'ALL', label: 'All Tickets' },
    { id: 'OPEN', label: 'Open' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'RESOLVED', label: 'Resolved' },
    { id: 'CLOSED', label: 'Closed' },
    { id: 'REJECTED', label: 'Rejected' },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="My Tickets"
        subtitle="Track your reported incidents and maintenance requests."
        action={{
          label: 'Report Incident',
          icon: <PlusIcon className="w-5 h-5" />,
          onClick: () => navigate('/tickets/create'),
        }}
      />

      <div className="bg-white rounded-xl shadow-sm border border-campus-gray-200 overflow-hidden mb-6">
        <div className="border-b border-campus-gray-200 flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-campus-gray-500 hover:text-campus-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-campus-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets..."
              className="w-full pl-10 pr-4 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-campus-gray-500 py-12">Loading tickets…</p>
      ) : sortedTickets.length === 0 ? (
        <EmptyState
          icon={TicketIcon}
          title="No tickets found"
          description="Try adjusting your filters or report a new incident."
        />
      ) : (
        <div className="space-y-3">
          {sortedTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ')
                  navigate(`/tickets/${ticket.id}`)
              }}
              className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-4 hover:border-teal-500 transition-colors cursor-pointer"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={ticket.status} size="sm" />
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(
                        ticket.priority,
                      )}`}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="font-medium text-campus-gray-900 line-clamp-2">
                    {ticket.description}
                  </p>
                  <p className="text-sm text-campus-gray-500 mt-1">
                    {ticket.resourceName} · {formatDate(ticket.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
