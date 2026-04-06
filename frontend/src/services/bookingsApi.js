import { apiRequest } from './apiClient'

export const bookingsApi = {
  async list() {
    return apiRequest('/api/bookings')
  },

  async getById(id) {
    return apiRequest(`/api/bookings/${id}`)
  },

  async create(data) {
    return apiRequest('/api/bookings', { method: 'POST', body: data })
  },

  async updateStatus(id, status, reviewReason) {
    return apiRequest(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      body: { status, reviewReason: reviewReason || null },
    })
  },

  async cancel(id) {
    return apiRequest(`/api/bookings/${id}/cancel`, { method: 'POST' })
  },
}
