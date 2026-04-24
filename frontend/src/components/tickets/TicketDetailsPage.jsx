import React, { useCallback, useEffect, useState, Fragment } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertTriangleIcon, ArrowLeftIcon, CalendarIcon, ClockIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ticketsApi } from '../../services/ticketsApi'
import { usersApi } from '../../services/usersApi'
import { fetchAttachmentBlobUrl } from '../../services/apiClient'
import { StatusBadge } from '../shared/StatusBadge'
import { ErrorState } from '../shared/ErrorState'
import { TicketAttachmentGallery } from './TicketAttachmentGallery'
import { TicketCommentsSection } from './TicketCommentsSection'
import { UpdateTicketStatusModal } from './UpdateTicketStatusModal'
import { EscalateTicketModal } from './EscalateTicketModal'

export function TicketDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [technicians, setTechnicians] = useState([])
  const [attachmentUrls, setAttachmentUrls] = useState([])
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(true)
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [escalateOpen, setEscalateOpen] = useState(false)

  const loadTicket = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setLoadError('')
    try {
      const t = await ticketsApi.getById(id)
      setTicket(t)
    } catch (e) {
      setLoadError(e?.message || 'Failed to load ticket')
      setTicket(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadTicket()
  }, [loadTicket])

  useEffect(() => {
    let cancelled = false
    const urls = []
    ;(async () => {
      if (!ticket?.attachments?.length) {
        if (!cancelled) setAttachmentUrls([])
        return
      }
      const next = []
      for (const att of ticket.attachments) {
        if (cancelled) break
        if (att.mimeType?.startsWith('image/')) {
          try {
            const u = await fetchAttachmentBlobUrl(att.id)
            next.push(u)
            urls.push(u)
          } catch {
            /* skip broken image */
          }
        }
      }
      if (!cancelled) setAttachmentUrls(next)
    })()
    return () => {
      cancelled = true
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [ticket?.id, ticket?.attachments])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const techs = await usersApi.listTechnicians()
        if (!cancelled) setTechnicians(techs)
      } catch {
        if (!cancelled) setTechnicians([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center text-campus-gray-600">
        Loading ticket…
      </div>
    )
  }

  if (!ticket || loadError) {
    return (
      <ErrorState
        title="Ticket Not Found"
        message={
          loadError ||
          "The ticket you're looking for doesn't exist or has been removed."
        }
        onRetry={() => {
          if (user?.role === 'ADMIN') return navigate('/admin/tickets')
          if (user?.role === 'TECHNICIAN') return navigate('/technician/tickets')
          return navigate('/tickets')
        }}
      />
    )
  }

  const isAdmin = user?.role === 'ADMIN'
  const isTechnician =
    user?.role === 'TECHNICIAN' && ticket.assignedTo === user?.id
  const isReporter = ticket.userId === user?.id

  const displayStatus =
    isReporter &&
    ticket.status === 'OPEN' &&
    (!ticket.assignedTo || ticket.technicianViewed === false)
      ? 'PENDING'
      : ticket.status

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

  const handleUpdateStatus = async (newStatus, resolutionNotes, assignedTo) => {
    const body = { status: newStatus }
    if (resolutionNotes) body.resolutionNotes = resolutionNotes
    if (assignedTo !== undefined) {
      body.assignedTo = assignedTo || null
    }
    await ticketsApi.update(ticket.id, body)
    await loadTicket()
  }

  const handleReject = async () => {
    const ok = window.confirm(
      'Reject this ticket? It will be visible to the admin and the user.',
    )
    if (!ok) return
    const reason =
      window.prompt('Reason for rejection (optional):', '')?.trim() || ''
    const body = { status: 'REJECTED' }
    if (reason) body.resolutionNotes = reason
    await ticketsApi.update(ticket.id, body)
    await loadTicket()
    navigate('/technician/tickets')
  }

  const isOverdue =
    ticket.slaDueAt &&
    !['REJECTED', 'RESOLVED', 'CLOSED'].includes(ticket.status) &&
    new Date(ticket.slaDueAt).getTime() < Date.now()

  const formatShort = (dateString) =>
    new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const handleEscalate = async ({ note, reassignTo }) => {
    await ticketsApi.escalate(ticket.id, { note, reassignTo })
    await loadTicket()
  }

  const statusSteps = [
    { status: 'OPEN', label: 'Open' },
    { status: 'IN_PROGRESS', label: 'In Progress' },
    { status: 'RESOLVED', label: 'Resolved' },
    { status: 'CLOSED', label: 'Closed' },
  ]
  const currentStepIndex =
    displayStatus === 'REJECTED'
      ? -1
      : statusSteps.findIndex((s) => s.status === displayStatus)

  const backPath = isAdmin
    ? '/admin/tickets'
    : user?.role === 'TECHNICIAN'
      ? '/technician/tickets'
      : '/tickets'

  const backLabel = isAdmin ? 'Back to Manage Tickets' : 'Back to Tickets'

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => navigate(backPath)}
        className="flex items-center gap-2 text-campus-gray-600 hover:text-campus-gray-900 mb-4 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        {backLabel}
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-campus-gray-900 mb-2">
              Ticket #{ticket.id}
            </h1>
            <div className="flex items-center gap-3">
              <StatusBadge status={displayStatus} />
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full border ${getPriorityColor(
                  ticket.priority,
                )}`}
              >
                {ticket.priority} Priority
              </span>
              {isOverdue && (
                <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full border bg-red-50 text-red-700 border-red-200">
                  <AlertTriangleIcon className="w-4 h-4" />
                  Overdue
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(isAdmin || isTechnician) && (
              <button
                onClick={() => setUpdateModalOpen(true)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Update Status
              </button>
            )}
            {(isAdmin || isTechnician) &&
              !['REJECTED', 'RESOLVED', 'CLOSED'].includes(ticket.status) && (
                <button
                  onClick={() => setEscalateOpen(true)}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Escalate
                </button>
              )}
            {isTechnician &&
              !['REJECTED', 'RESOLVED', 'CLOSED'].includes(ticket.status) && (
                <button
                  onClick={handleReject}
                  className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Reject
                </button>
              )}
          </div>
        </div>

        {ticket.slaDueAt && (
          <div
            className={`mb-6 rounded-lg border px-3 py-2 text-sm ${
              isOverdue
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-teal-50 border-teal-200 text-teal-800'
            }`}
          >
            <span className="font-medium">SLA due:</span>{' '}
            {formatShort(ticket.slaDueAt)}
          </div>
        )}

        {ticket.status === 'REJECTED' && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
            This ticket was rejected.
          </p>
        )}

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
              {String(ticket.category || '').replace(/_/g, ' ')}
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
                      currentStepIndex >= 0 && index <= currentStepIndex
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
                      currentStepIndex >= 0 && index < currentStepIndex
                        ? 'bg-teal-600'
                        : 'bg-campus-gray-200'
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
          <TicketAttachmentGallery attachments={attachmentUrls} />
        </div>

        <div className="border-t border-campus-gray-200 pt-6">
          <TicketCommentsSection ticketId={ticket.id} />
        </div>
      </div>

      {ticket.escalations?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-campus-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-campus-gray-900 mb-4">
            Escalation notes
          </h3>
          <div className="space-y-3">
            {[...ticket.escalations]
              .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
              .map((e, idx) => (
                <div
                  key={`${e.at || idx}-${idx}`}
                  className="bg-campus-gray-50 border border-campus-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-campus-gray-900">
                        {e.actorName || 'SYSTEM'}
                      </p>
                      {e.note && (
                        <p className="text-sm text-campus-gray-700 mt-1 whitespace-pre-wrap">
                          {e.note}
                        </p>
                      )}
                      {(e.previousAssigneeId || e.newAssigneeId) && (
                        <p className="text-xs text-campus-gray-500 mt-2">
                          Assignee: {e.previousAssigneeId || '—'} →{' '}
                          {e.newAssigneeId || '—'}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-campus-gray-500 shrink-0">
                      {formatShort(e.at)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <UpdateTicketStatusModal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        ticket={ticket}
        onUpdate={handleUpdateStatus}
        technicians={isAdmin ? technicians : []}
        context={isAdmin ? 'admin' : 'technician'}
      />

      <EscalateTicketModal
        isOpen={escalateOpen}
        onClose={() => setEscalateOpen(false)}
        onConfirm={handleEscalate}
        ticket={ticket}
        technicians={technicians}
        allowReassign={isAdmin}
      />
    </div>
  )
}
