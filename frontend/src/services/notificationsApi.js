import { apiRequest } from './apiClient'

export const notificationsApi = {
  async list() {
    return apiRequest('/api/notifications')
  },

  async markRead(id) {
    return apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH' })
  },

  async markAllRead() {
    return apiRequest('/api/notifications/read-all', { method: 'POST' })
  },
}
