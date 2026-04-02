import React, { useEffect, useState } from 'react'
import { CheckCircleIcon, XCircleIcon, XIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function BookingDecisionModal({ isOpen, onClose, onConfirm, booking }) {
  const [decision, setDecision] = useState(null)
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (isOpen) {
      setDecision(null)
      setReason('')
    }
  }, [isOpen])

  if (!booking) return null

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  const handleConfirm = () => {
    if (!decision) return
    onConfirm(decision, decision === 'REJECTED' ? reason : undefined)
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
                <h3 className="text-xl font-bold text-campus-gray-900">
                  Review Booking Request
                </h3>
                <button
                  onClick={onClose}
                  className="text-campus-gray-400 hover:text-campus-gray-600 transition-colors"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-campus-gray-50 rounded-lg p-4 mb-6 border border-campus-gray-100">
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div className="text-campus-gray-500">Resource:</div>
                  <div className="font-medium text-campus-gray-900">
                    {booking.resourceName}
                  </div>
                  <div className="text-campus-gray-500">Requested by:</div>
                  <div className="font-medium text-campus-gray-900">
                    {booking.userName}
                  </div>
                  <div className="text-campus-gray-500">Date & Time:</div>
                  <div className="font-medium text-campus-gray-900">
                    {formatDate(booking.date)} • {booking.startTime} -{' '}
                    {booking.endTime}
                  </div>
                  <div className="text-campus-gray-500">Purpose:</div>
                  <div className="font-medium text-campus-gray-900 col-span-2 mt-1">
                    {booking.purpose}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setDecision('APPROVED')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-colors ${
                    decision === 'APPROVED'
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-campus-gray-200 text-campus-gray-600 hover:border-green-200 hover:bg-green-50'
                  }`}
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  <span className="font-medium">Approve</span>
                </button>
                <button
                  onClick={() => setDecision('REJECTED')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-colors ${
                    decision === 'REJECTED'
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-campus-gray-200 text-campus-gray-600 hover:border-red-200 hover:bg-red-50'
                  }`}
                >
                  <XCircleIcon className="w-5 h-5" />
                  <span className="font-medium">Reject</span>
                </button>
              </div>

              {decision === 'REJECTED' && (
                <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-campus-gray-700 mb-1">
                    Reason for Rejection *
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please explain why this booking is being rejected..."
                    className="w-full px-4 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none h-24"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-campus-gray-100">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-campus-gray-700 hover:bg-campus-gray-100 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!decision || (decision === 'REJECTED' && !reason.trim())}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors shadow-sm ${
                    !decision || (decision === 'REJECTED' && !reason.trim())
                      ? 'bg-campus-gray-200 text-campus-gray-400 cursor-not-allowed'
                      : decision === 'APPROVED'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  Confirm Decision
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

