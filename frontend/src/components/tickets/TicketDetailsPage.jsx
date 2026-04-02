import React, { useState, Fragment } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, CalendarIcon, ClockIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { store } from '../../services/store'
import { StatusBadge } from '../shared/StatusBadge'
import { ErrorState } from '../shared/ErrorState'
import { TicketAttachmentGallery } from './TicketAttachmentGallery'
import { TicketCommentsSection } from './TicketCommentsSection'
import { UpdateTicketStatusModal } from './UpdateTicketStatusModal'

export function TicketDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [, setRevision] = useState(0)

  const ticket = store.tickets.find((t) => t.id === id)

  if (!ticket) {
    return (
      <ErrorState
        title="Ticket Not Found"
        message="The ticket you're looking for doesn't exist or has been removed."
        onRetry={() => navigate('/tickets')}
      />
    )
  }

  const isAdmin = user?.role === 'ADMIN'
  const isTechnician =
    user?.role === 'TECHNICIAN' && ticket.assignedTo === user?.id

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
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const handleUpdateStatus = (newStatus, resolutionNotes, assignedTo) => {
    const idx = store.tickets.findIndex((t) => t.id === ticket.id)
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
    setRevision((r) => r + 1)
  }

  const statusSteps = [
    { status: 'OPEN', label: 'Open' },
    { status: 'IN_PROGRESS', label: 'In Progress' },
    { status: 'RESOLVED', label: 'Resolved' },
    { status: 'CLOSED', label: 'Closed' },
  ]
  const currentStepIndex = statusSteps.findIndex((s) => s.status === ticket.status)

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => navigate('/tickets')}
        className="flex items-center gap-2 text-campus-gray-600 hover:text-campus-gray-900 mb-4 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Tickets
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-campus-gray-900 mb-2">
              Ticket #{ticket.id}
            </h1>
            <div className="flex items-center gap-3">
              <StatusBadge status={ticket.status} />
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full border ${getPriorityColor(
                  ticket.priority,
                )}`}
              >
                {ticket.priority} Priority
              </span>
            </div>
          </div>
          {(isAdmin || isTechnician) && (
            <button
              onClick={() => setUpdateModalOpen(true)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Update Status
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-campus-gray-500 mb-1">
              Resource / Location
            </h3>
            <p className="text-campus-gray-900">
              {ticket.resourceName || 'General'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-campus-gray-500 mb-1">
              Category
            </h3>
            <p className="text-campus-gray-900">
              {ticket.category.replace(/_/g, ' ')}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-campus-gray-500 mb-1">
              Priority
            </h3>
            <p className="text-campus-gray-900">{ticket.priority}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-campus-gray-500 mb-1">
              Assigned To
            </h3>
            <p className="text-campus-gray-900">
              {ticket.assignedToName || 'Unassigned'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-campus-gray-500 mb-1 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Created
            </h3>
            <p className="text-campus-gray-900">{formatDate(ticket.createdAt)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-campus-gray-500 mb-1 flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              Last Updated
            </h3>
            <p className="text-campus-gray-900">{formatDate(ticket.updatedAt)}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-campus-gray-500 mb-2">
            Status Timeline
          </h3>
          <div className="flex items-center gap-2">
            {statusSteps.map((step, index) => (
              <Fragment key={step.status}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index <= currentStepIndex
                        ? 'bg-teal-600 text-white'
                        : 'bg-campus-gray-200 text-campus-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-xs text-campus-gray-600 mt-1">
                    {step.label}
                  </span>
                </div>
                {index < statusSteps.length - 1 && (
                  <div
                    className={`flex-1 h-1 ${
                      index < currentStepIndex ? 'bg-teal-600' : 'bg-campus-gray-200'
                    }`}
                  />
                )}
              </Fragment>
            ))}
          </div>
        </div>

        <div className="border-t border-campus-gray-200 pt-6 mb-6">
          <h3 className="text-lg font-semibold text-campus-gray-900 mb-2">
            Description
          </h3>
          <p className="text-campus-gray-700 whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>

        {ticket.resolutionNotes && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-green-900 mb-2">
              Resolution Notes
            </h3>
            <p className="text-green-800">{ticket.resolutionNotes}</p>
          </div>
        )}

        <div className="border-t border-campus-gray-200 pt-6 mb-6">
          <h3 className="text-lg font-semibold text-campus-gray-900 mb-4">
            Attachments
          </h3>
          <TicketAttachmentGallery attachments={ticket.attachments} />
        </div>

        <div className="border-t border-campus-gray-200 pt-6">
          <TicketCommentsSection ticketId={ticket.id} />
        </div>
      </div>

      <UpdateTicketStatusModal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        ticket={ticket}
        onUpdate={handleUpdateStatus}
      />
    </div>
  )
}

