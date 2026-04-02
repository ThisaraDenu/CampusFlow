import React, { useState } from 'react'
import { SendIcon, EditIcon, TrashIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function TicketCommentsSection({ ticketId }) {
  const { user } = useAuth()

  const initialComments =
    ticketId === 'ticket-1'
      ? [
          {
            id: 'comment-1',
            ticketId: 'ticket-1',
            userId: 'tech-1',
            userName: 'David Martinez',
            userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
            content:
              "I've checked workstations 15-20. The network switch on that row seems faulty.",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 'comment-2',
            ticketId: 'ticket-1',
            userId: 'user-1',
            userName: 'Sarah Johnson',
            userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            content: 'Thanks for the update. How long will the repair take?',
            createdAt: new Date(Date.now() - 1800000).toISOString(),
          },
          {
            id: 'comment-3',
            ticketId: 'ticket-1',
            userId: 'tech-1',
            userName: 'David Martinez',
            userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
            content: 'Ordered a replacement switch. Should be fixed by tomorrow.',
            createdAt: new Date(Date.now() - 900000).toISOString(),
          },
        ]
      : []

  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  const handleAddComment = () => {
    if (!newComment.trim() || !user) return
    const comment = {
      id: `comment-${Date.now()}`,
      ticketId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: newComment,
      createdAt: new Date().toISOString(),
    }
    setComments([...comments, comment])
    setNewComment('')
  }

  const handleEditComment = (commentId) => {
    const comment = comments.find((c) => c.id === commentId)
    if (comment) {
      setEditingId(commentId)
      setEditContent(comment.content)
    }
  }

  const handleSaveEdit = () => {
    if (!editContent.trim()) return
    setComments(
      comments.map((c) =>
        c.id === editingId
          ? {
              ...c,
              content: editContent,
            }
          : c,
      ),
    )
    setEditingId(null)
    setEditContent('')
  }

  const handleDeleteComment = (commentId) => {
    setComments(comments.filter((c) => c.id !== commentId))
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-campus-gray-900">
        Comments ({comments.length})
      </h3>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="flex gap-3 p-4 bg-campus-gray-50 rounded-lg"
          >
            <img
              src={comment.userAvatar}
              alt={comment.userName}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-campus-gray-900">
                    {comment.userName}
                  </span>
                  <span className="text-xs text-campus-gray-500">
                    {getRelativeTime(comment.createdAt)}
                  </span>
                </div>
                {user?.id === comment.userId && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditComment(comment.id)}
                      className="text-campus-gray-400 hover:text-teal-600 transition-colors"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-campus-gray-400 hover:text-red-600 transition-colors"
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
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 text-campus-gray-700 text-sm hover:bg-campus-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-campus-gray-700">{comment.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <p className="text-center text-campus-gray-500 py-8">
          No comments yet. Be the first to comment!
        </p>
      )}

      <div className="border-t border-campus-gray-200 pt-4">
        <div className="flex gap-3">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-10 h-10 rounded-full flex-shrink-0"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="w-full px-3 py-2 border border-campus-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SendIcon className="w-4 h-4" />
                Post Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

