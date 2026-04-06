import { store } from './store'

export const resourcesApi = {
  async list() {
    return store.resources
  },
  async getById(id) {
    return store.resources.find((r) => r.id === id) || null
  },
  async create(data) {
    const newResource = { ...data, id: `res-${Date.now()}`, createdAt: new Date().toISOString() }
    store.resources.unshift(newResource)
    return newResource
  },
  async update(id, data) {
    const idx = store.resources.findIndex((r) => r.id === id)
    if (idx === -1) return null
    store.resources[idx] = { ...store.resources[idx], ...data }
    return store.resources[idx]
  },
  async remove(id) {
    const idx = store.resources.findIndex((r) => r.id === id)
    if (idx === -1) return false
    store.resources.splice(idx, 1)
    return true
  },
}

