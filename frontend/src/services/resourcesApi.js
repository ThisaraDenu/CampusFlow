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

  async uploadImage(id, file) {
    const fd = new FormData()
    fd.append('file', file)
    return apiRequest(`/api/resources/${id}/image`, { method: 'POST', body: fd })
  },

  async uploadImages(id, files) {
    const fd = new FormData()
    for (const f of files || []) {
      fd.append('files', f)
    }
    return apiRequest(`/api/resources/${id}/images`, { method: 'POST', body: fd })
  },
}
