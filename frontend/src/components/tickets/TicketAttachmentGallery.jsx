import React, { useState } from 'react'
import { XIcon, ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

export function TicketAttachmentGallery({ attachments, onDelete }) {
  const { user } = useAuth()
  const [selectedImage, setSelectedImage] = useState(null)
  const isAdmin = user?.role === 'ADMIN'

  if (!attachments || attachments.length === 0) {
    return (
      <div className="flex items-center gap-2 text-campus-gray-500 text-sm italic">
        <ImageIcon className="w-4 h-4" />
        No attachments provided
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {attachments.map((url, index) => (
          <div key={index} className="relative group aspect-square">
            <img
              src={url}
              alt={`Attachment ${index + 1}`}
              className="w-full h-full object-cover rounded-lg cursor-pointer border border-campus-gray-200 hover:border-teal-500 transition-colors"
              onClick={() => setSelectedImage(url)}
            />
            {isAdmin && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(index)
                }}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50"
              onClick={() => setSelectedImage(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="relative max-w-4xl w-full max-h-[90vh] pointer-events-auto">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
                >
                  <XIcon className="w-6 h-6" />
                </button>
                <img
                  src={selectedImage}
                  alt="Full size attachment"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

