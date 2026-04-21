import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WrenchIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ticketsApi } from '../../services/ticketsApi'
import { PageHeader } from '../shared/PageHeader'
import { StatusBadge } from '../shared/StatusBadge'
import { EmptyState } from '../shared/EmptyState'
import { UpdateTicketStatusModal } from './UpdateTicketStatusModal'

export function AssignedTicketsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('ALL')
  const [sortByRecent, setSortByRecent] = useState(false)
  const [tickets, setTickets] = useState([])
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)

  const load = useCallback(async () => {
    try {
      const list = await ticketsApi.list('assigned')
      setTickets(list)
    } catch {
      setTickets([])
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const assignedTickets = tickets.filter((t) => t.assignedTo === user?.id)

  const rejectTicket = async (ticketId) => {
    const ok = window.confirm(
      'Reject this ticket? It will be visible to the admin and the user.',
    )
    if (!ok) return
    const reason =
      window.prompt('Reason for rejection (optional):', '')?.trim() || ''
    const body = { status: 'REJECTED' }
    if (reason) body.resolutionNotes = reason
    await ticketsApi.update(ticketId, body)
    await load()
  }

  const handleUpdate = async (newStatus, resolutionNotes) => {
    if (!selectedTicket?.id) return
    const body = { status: newStatus }
    if (resolutionNotes) body.resolutionNotes = resolutionNotes
    await ticketsApi.update(selectedTicket.id, body)
    await load()
  }

  const filteredTickets = assignedTickets.filter((ticket) => {
    if (activeTab === 'ALL') return true
    return ticket.status === activeTab
  })

  const priorityWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    // When enabled, show recent first (no date selection).
    if (sortByRecent) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
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
    { id: 'ALL', label: 'All Assigned' },
    { id: 'OPEN', label: 'Open' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'RESOLVED', label: 'Resolved' },
    { id: 'CLOSED', label: 'Closed' },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Assigned Tickets"
        subtitle={`Tickets assigned to ${user?.name}`}
      />

      <div className="bg-white rounded-xl shadow-sm border border-campus-gray-200 overflow-hidden mb-6">
        <div className="border-b border-campus-gray-200 flex">
          {tabs.map((tab) => {
            const count =
              tab.id === 'ALL'
                ? assignedTickets.length
                : assignedTickets.filter((t) => t.status === tab.id).length
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
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
        <div className="p-4 border-t border-campus-gray-200 bg-white flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 px-3 py-2 border border-campus-gray-300 rounded-lg bg-white text-sm text-campus-gray-700">
            <input
              type="checkbox"
              checked={sortByRecent}
              onChange={(e) => setSortByRecent(e.target.checked)}
              className="accent-teal-600"
            />
            Date filter (recent first)
          </label>
        </div>
      </div>

      {sortedTickets.length === 0 ? (
        <EmptyState
          icon={WrenchIcon}
          title="No assigned tickets"
          description={
            activeTab === 'ALL'
              ? "You don't have any tickets assigned to you yet."
              : `No tickets in ${activeTab.toLowerCase().replace('_', ' ')} status.`
          }
        />
      ) : (
        <div className="grid gap-4">
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
              className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-6 hover:border-teal-500 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-mono text-campus-gray-500">
                    #{ticket.id}
                  </span>
                  <StatusBadge status={ticket.status} size="sm" />
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(
                      ticket.priority,
                    )}`}
                  >
                    {ticket.priority}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-campus-gray-500">
                    {formatDate(ticket.createdAt)}
                  </span>
                  {!['REJECTED', 'RESOLVED', 'CLOSED'].includes(ticket.status) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedTicket(ticket)
                        setUpdateModalOpen(true)
                      }}
                      className="px-3 py-1 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      Update
                    </button>
                  )}
                  {!['REJECTED', 'RESOLVED', 'CLOSED'].includes(ticket.status) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        rejectTicket(ticket.id)
                      }}
                      className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 text-sm rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <h3 className="font-semibold text-campus-gray-900 mb-1">
                  {ticket.resourceName || 'General'}
                </h3>
                <p className="text-sm text-campus-gray-600 line-clamp-2">
                  {ticket.description}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-campus-gray-600">
                <span className="px-2 py-1 bg-campus-gray-100 rounded text-xs">
                  {ticket.category.replace(/_/g, ' ')}
                </span>
                <span>Reported by: {ticket.userName}</span>
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
          context="technician"
        />
      )}
    </div>
  )
}
