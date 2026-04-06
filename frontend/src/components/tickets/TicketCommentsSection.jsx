import React, { useCallback, useEffect, useState } from 'react'
import { SendIcon, EditIcon, TrashIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ticketsApi } from '../../services/ticketsApi'

export function TicketCommentsSection({ ticketId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [newComment, setNewComment] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)

  const refresh = useCallback(async () => {
    if (!ticketId) return
    setLoading(true)
    setLoadError('')
    try {
      const list = await ticketsApi.listComments(ticketId)
      setComments(list)
    } catch (e) {
      setLoadError(e?.message || 'Failed to load comments')
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || saving) return
    setSaving(true)
    try {
      await ticketsApi.addComment(ticketId, newComment.trim())
      setNewComment('')
      await refresh()
    } catch (err) {
      alert(err?.message || 'Could not post comment')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const saveEdit = async (commentId) => {
    if (!editContent.trim() || saving) return
    setSaving(true)
    try {
      await ticketsApi.updateComment(ticketId, commentId, editContent.trim())
      setEditingId(null)
      await refresh()
    } catch (err) {
      alert(err?.message || 'Could not update comment')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return
    setSaving(true)
    try {
      await ticketsApi.deleteComment(ticketId, commentId)
      await refresh()
    } catch (err) {
      alert(err?.message || 'Could not delete comment')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-campus-gray-900 mb-4">
        Comments ({comments.length})
      </h3>

      {loadError && (
        <p className="text-sm text-red-600 mb-4" role="alert">
          {loadError}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-campus-gray-500">Loading comments…</p>
      ) : (
        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-campus-gray-50 rounded-lg p-4 border border-campus-gray-200"
            >
              <div className="flex items-start gap-3">
                <img
                  src={
                    comment.userAvatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(comment.userName || 'user')}`
                  }
                  alt={comment.userName}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-campus-gray-900">
                        {comment.userName}
                      </span>
                      <span className="text-sm text-campus-gray-500 ml-2">
                        {getRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    {(user?.id === comment.userId || user?.role === 'ADMIN') && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(comment)}
                          className="p-1 text-campus-gray-400 hover:text-teal-600 transition-colors"
                          title="Edit comment"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(comment.id)}
                          className="p-1 text-campus-gray-400 hover:text-red-600 transition-colors"
                          title="Delete comment"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(comment.id)}
                          disabled={saving}
                          className="px-3 py-1 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 text-campus-gray-600 text-sm hover:bg-campus-gray-100 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-campus-gray-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && comments.length === 0 && !loadError && (
        <p className="text-sm text-campus-gray-500 mb-6 italic">
          No comments yet. Be the first to comment!
        </p>
      )}

      <form onSubmit={handleSubmit} className="border-t border-campus-gray-200 pt-6">
        <label className="block text-sm font-medium text-campus-gray-700 mb-2">
          Add a comment
        </label>
        <div className="flex gap-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Type your comment..."
            rows={3}
            className="flex-1 px-3 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || saving}
            className="self-end px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
          >
            <SendIcon className="w-4 h-4" />
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
