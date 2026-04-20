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

  async deleteUser(userId) {
    return apiRequest(`/api/admin/users/${userId}`, { method: 'DELETE' })
  },

  async updateProfile(userId, { name, email }) {
    return apiRequest(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      body: { name, email },
    })
  },

  async uploadAvatar(userId, file) {
    const fd = new FormData()
    fd.append('file', file)
    return apiRequest(`/api/admin/users/${userId}/avatar`, {
      method: 'POST',
      body: fd,
    })
  },

  async listTechnicians() {
    return apiRequest('/api/technicians')
  },
}
