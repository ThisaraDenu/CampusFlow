import { store } from './store'

export const bookingsApi = {
  async list() {
    return store.bookings
  },
  async getById(id) {
    return store.bookings.find((b) => b.id === id) || null
  },
  async create(data) {
    const booking = {
      ...data,
      id: `book-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    store.bookings.unshift(booking)
    return booking
  },
  async updateStatus(id, status, reviewReason) {
    const idx = store.bookings.findIndex((b) => b.id === id)
    if (idx === -1) return null
    store.bookings[idx].status = status
    if (reviewReason) store.bookings[idx].reviewReason = reviewReason
    store.bookings[idx].updatedAt = new Date().toISOString()
    return store.bookings[idx]
  },
  async cancel(id) {
    return bookingsApi.updateStatus(id, 'CANCELLED')
  },
}

