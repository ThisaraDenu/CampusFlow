import { store } from './store'

export const ticketsApi = {
  async list() {
    return store.tickets
  },
  async getById(id) {
    return store.tickets.find((t) => t.id === id) || null
  },
  async create(data) {
    const ticket = {
      ...data,
      id: `ticket-${Date.now()}`,
      status: 'OPEN',
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    store.tickets.unshift(ticket)
    return ticket
  },
  async update(id, patch) {
    const idx = store.tickets.findIndex((t) => t.id === id)
    if (idx === -1) return null
    store.tickets[idx] = { ...store.tickets[idx], ...patch, updatedAt: new Date().toISOString() }
    return store.tickets[idx]
  },
}

