import { store } from './store'

export const usersApi = {
  async list() {
    return store.users
  },
  async updateRole(userId, role) {
    const idx = store.users.findIndex((u) => u.id === userId)
    if (idx === -1) return null
    store.users[idx] = { ...store.users[idx], role }
    return store.users[idx]
  },
}

