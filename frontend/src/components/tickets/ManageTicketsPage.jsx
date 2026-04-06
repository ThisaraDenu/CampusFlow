import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchIcon, UserIcon, WrenchIcon } from 'lucide-react'
import { store } from '../../services/store'
import { PageHeader } from '../shared/PageHeader'
import { StatusBadge } from '../shared/StatusBadge'
import { EmptyState } from '../shared/EmptyState'
import { UpdateTicketStatusModal } from './UpdateTicketStatusModal'

export function ManageTicketsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [, setVersion] = useState(0)

  const filteredTickets = store.tickets.filter((ticket) => {
    const matchesTab = activeTab === 'ALL' || ticket.status === activeTab
    const matchesPriority =
      priorityFilter === 'ALL' || ticket.priority === priorityFilter
    const matchesCategory =
      categoryFilter === 'ALL' || ticket.category === categoryFilter
    const matchesSearch =
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.resourceName?.toLowerCase() || '').includes(
        searchQuery.toLowerCase(),
      )
    return matchesTab && matchesPriority && matchesCategory && matchesSearch
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

  const handleUpdateClick = (ticket, e) => {
    e.stopPropagation()
    setSelectedTicket(ticket)
    setUpdateModalOpen(true)
  }

  const handleUpdate = (newStatus, resolutionNotes, assignedTo) => {
    if (!selectedTicket) return
    const idx = store.tickets.findIndex((t) => t.id === selectedTicket.id)
    if (idx === -1) return
    store.tickets[idx].status = newStatus
    if (resolutionNotes) store.tickets[idx].resolutionNotes = resolutionNotes
    if (assignedTo !== undefined) {
      store.tickets[idx].assignedTo = assignedTo || undefined
      const tech = assignedTo
        ? store.users.find((u) => u.id === assignedTo)
        : null
      store.tickets[idx].assignedToName = tech ? tech.name : undefined
    }
    store.tickets[idx].updatedAt = new Date().toISOString()
    setVersion((v) => v + 1)
  }

  const tabs = [
    { id: 'ALL', label: 'All' },
    { id: 'OPEN', label: 'Open' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'RESOLVED', label: 'Resolved' },
    { id: 'CLOSED', label: 'Closed' },
    { id: 'REJECTED', label: 'Rejected' },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Manage Tickets"
        subtitle="Review and process maintenance and incident tickets."
      />

      <div className="bg-white rounded-xl shadow-sm border border-campus-gray-200 overflow-hidden mb-6">
        <div className="border-b border-campus-gray-200 overflow-x-auto">
          <div className="flex px-4 min-w-max">
            {tabs.map((tab) => {
              const count =
                tab.id === 'ALL'
                  ? store.tickets.length
                  : store.tickets.filter((t) => t.status === tab.id).length
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-teal-600 text-teal-600'
                      : 'border-transparent text-campus-gray-500 hover:text-campus-gray-700 hover:border-campus-gray-300'
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className="ml-2 bg-campus-gray-100 text-campus-gray-700 py-0.5 px-2 rounded-full text-xs">
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-4 space-y-4">
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

          <div className="flex gap-4 flex-wrap">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="ALL">All Categories</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="HVAC">HVAC</option>
              <option value="IT_EQUIPMENT">IT Equipment</option>
              <option value="FURNITURE">Furniture</option>
              <option value="CLEANING">Cleaning</option>
              <option value="SAFETY">Safety</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      {sortedTickets.length === 0 ? (
        <EmptyState
          icon={WrenchIcon}
          title="No tickets found"
          description="Try adjusting your search or filters"
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
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 flex-1 flex-wrap min-w-0">
                  <span className="text-sm font-mono text-campus-gray-500 w-24 shrink-0">
                    #{ticket.id}
                  </span>
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-campus-gray-400" />
                    <span className="text-sm text-campus-gray-700">
                      {ticket.userName}
                    </span>
                  </div>
                  <span className="text-sm text-campus-gray-700">
                    {ticket.resourceName || 'General'}
                  </span>
                  <span className="px-2 py-1 bg-campus-gray-100 rounded text-xs">
                    {ticket.category.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(
                      ticket.priority,
                    )}`}
                  >
                    {ticket.priority}
                  </span>
                  <StatusBadge status={ticket.status} size="sm" />
                  {ticket.assignedToName && (
                    <span className="text-sm text-campus-gray-600">
                      → {ticket.assignedToName}
                    </span>
                  )}
                  <span className="text-sm text-campus-gray-500">
                    {formatDate(ticket.createdAt)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleUpdateClick(ticket, e)}
                  className="px-3 py-1 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors shrink-0"
                >
                  Update
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTicket && (
        <UpdateTicketStatusModal
          isOpen={updateModalOpen}
          onClose={() => setUpdateModalOpen(false)}
          ticket={selectedTicket}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}
