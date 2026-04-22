import { apiRequest } from './apiClient'

export const ticketsApi = {
  async list(scope = 'my') {
    const q = new URLSearchParams({ scope })
    return apiRequest(`/api/tickets?${q.toString()}`)
  },

  async getById(id) {
    return apiRequest(`/api/tickets/${id}`)
  },

  async create(data) {
    return apiRequest('/api/tickets', { method: 'POST', body: data })
  },

  async update(id, patch) {
    return apiRequest(`/api/tickets/${id}`, { method: 'PATCH', body: patch })
  },

  async delete(id) {
    return apiRequest(`/api/tickets/${id}`, { method: 'DELETE' })
  },

  async listComments(ticketId) {
    return apiRequest(`/api/tickets/${ticketId}/comments`)
  },

  async addComment(ticketId, content) {
    return apiRequest(`/api/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: { content },
    })
  },

  async updateComment(ticketId, commentId, content) {
    return apiRequest(`/api/tickets/${ticketId}/comments/${commentId}`, {
      method: 'PATCH',
      body: { content },
    })
  },

  async deleteComment(ticketId, commentId) {
    return apiRequest(`/api/tickets/${ticketId}/comments/${commentId}`, {
      method: 'DELETE',
    })
  },

  async uploadAttachment(ticketId, file) {
    const form = new FormData()
    form.append('file', file)
    return apiRequest(`/api/tickets/${ticketId}/attachments`, {
      method: 'POST',
      body: form,
    })
  },

  async deleteAttachment(attachmentId) {
    return apiRequest(`/api/ticket-attachments/${attachmentId}`, {
      method: 'DELETE',
    })
  },
}
