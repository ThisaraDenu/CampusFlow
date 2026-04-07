import { apiRequest } from './apiClient'

export const resourcesApi = {
  async list() {
    return apiRequest('/api/resources')
  },

  async getById(id) {
    return apiRequest(`/api/resources/${id}`)
  },

  async create(data) {
    return apiRequest('/api/resources', { method: 'POST', body: data })
  },

  async update(id, data) {
    return apiRequest(`/api/resources/${id}`, { method: 'PUT', body: data })
  },

  async remove(id) {
    return apiRequest(`/api/resources/${id}`, { method: 'DELETE' })
  },
}
