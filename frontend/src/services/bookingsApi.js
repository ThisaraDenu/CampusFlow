import { apiRequest } from './apiClient'

export const bookingsApi = {
  async list() {
    return apiRequest('/api/bookings')
  },

  async listBooked() {
    return apiRequest('/api/bookings/booked')
  },

  async conflicts(resourceId, date) {
    const q = new URLSearchParams({ resourceId, date })
    return apiRequest(`/api/bookings/conflicts?${q.toString()}`)
  },

  async getById(id) {
    return apiRequest(`/api/bookings/${id}`)
  },

  async create(data) {
    return apiRequest('/api/bookings', { method: 'POST', body: data })
  },

  async update(id, patch) {
    return apiRequest(`/api/bookings/${id}`, { method: 'PATCH', body: patch })
  },

  async adminUpdate(id, patch) {
    return apiRequest(`/api/bookings/${id}/admin`, {
      method: 'PATCH',
      body: patch,
    })
  },

  async adminDelete(id) {
    return apiRequest(`/api/bookings/${id}`, { method: 'DELETE' })
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
