import React, { useState, useEffect } from 'react'
import { X as XIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { StatusBadge } from '../shared/StatusBadge'
import { store } from '../../services/store'

export function UpdateTicketStatusModal({ isOpen, onClose, ticket, onUpdate }) {
  const [newStatus, setNewStatus] = useState(ticket?.status || 'OPEN')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [assignedTo, setAssignedTo] = useState(ticket?.assignedTo || '')

  const technicians = store.users.filter((u) => u.role === 'TECHNICIAN')

  useEffect(() => {
    if (isOpen && ticket) {
      setNewStatus(ticket.status)
      setResolutionNotes('')
      setAssignedTo(ticket.assignedTo || '')
    }
  }, [isOpen, ticket?.id]) // eslint-disable-line react-hooks/exhaustive-deps -- ticket fields read only when id changes

  const getValidStatuses = () => {
    const status = ticket?.status
    switch (status) {
      case 'OPEN':
        return ['OPEN', 'IN_PROGRESS', 'REJECTED']
      case 'IN_PROGRESS':
        return ['IN_PROGRESS', 'RESOLVED', 'REJECTED']
      case 'RESOLVED':
        return ['RESOLVED', 'CLOSED']
      case 'CLOSED':
        return ['CLOSED']
      case 'REJECTED':
        return ['REJECTED']
      default:
        return status ? [status] : ['OPEN']
    }
  }

  const handleSubmit = () => {
    if (newStatus === 'RESOLVED' && !resolutionNotes.trim()) {
      alert('Resolution notes are required when resolving a ticket')
      return
    }
    onUpdate(newStatus, resolutionNotes || undefined, assignedTo || undefined)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-campus-gray-900">
                    Update Ticket Status
                  </h3>
                  <p className="text-sm text-campus-gray-600 mt-1">
                    Ticket #{ticket?.id} - {ticket?.resourceName}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-campus-gray-400 hover:text-campus-gray-600 transition-colors"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-campus-gray-700 mb-2">
                    Current Status
                  </label>
                  <StatusBadge status={ticket?.status} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-campus-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    {getValidStatuses().map((status) => (
                      <option key={status} value={status}>
                        {status.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-campus-gray-700 mb-2">
                    Assign Technician
                  </label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">Unassigned</option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name}
                      </option>
                    ))}
                  </select>
                </div>

                {(newStatus === 'RESOLVED' || newStatus === 'CLOSED') && (
                  <div>
                    <label className="block text-sm font-medium text-campus-gray-700 mb-2">
                      Resolution Notes{' '}
                      {newStatus === 'RESOLVED' && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Describe how the issue was resolved..."
                      rows={4}
                      className="w-full px-3 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-campus-gray-700 hover:bg-campus-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Update Status
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

