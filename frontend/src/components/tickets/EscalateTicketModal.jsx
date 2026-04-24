import React, { useEffect, useState } from 'react'
import { XIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function EscalateTicketModal({
  isOpen,
  onClose,
  onConfirm,
  ticket,
  technicians = [],
  allowReassign = false,
}) {
  const [note, setNote] = useState('')
  const [reassignTo, setReassignTo] = useState('')

  useEffect(() => {
    if (isOpen) {
      setNote('')
      setReassignTo('')
    }
  }, [isOpen])

  if (!ticket) return null

  const handleConfirm = () => {
    onConfirm({ note: note.trim() || null, reassignTo: reassignTo || null })
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
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-campus-gray-900">
                    Escalate Ticket
                  </h3>
                  <p className="text-sm text-campus-gray-600 mt-1">
                    Ticket #{ticket.id} • {ticket.resourceName || 'General'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-campus-gray-400 hover:text-campus-gray-600 transition-colors"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              {allowReassign && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-campus-gray-700 mb-1">
                    Reassign to technician (optional)
                  </label>
                  <select
                    value={reassignTo}
                    onChange={(e) => setReassignTo(e.target.value)}
                    className="w-full px-3 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">Keep current assignee</option>
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-campus-gray-700 mb-1">
                  Escalation note
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add context (overdue reason, actions taken, next steps)..."
                  className="w-full px-4 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none h-28"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-campus-gray-100">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-campus-gray-700 hover:bg-campus-gray-100 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-6 py-2 rounded-lg font-medium transition-colors shadow-sm bg-amber-600 text-white hover:bg-amber-700"
                >
                  Escalate
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

