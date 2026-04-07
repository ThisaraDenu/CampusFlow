import { apiRequest } from './apiClient'

export const usersApi = {
  async list() {
    return apiRequest('/api/admin/users')
  },

  async updateRole(userId, role) {
    return apiRequest(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: { role },
    })
  },

  async listTechnicians() {
    return apiRequest('/api/technicians')
  },
}
