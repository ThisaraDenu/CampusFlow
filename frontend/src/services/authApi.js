import { store } from './store'

const pickUserByRole = (role) => store.users.find((u) => u.role === role) || null

export const authApi = {
  async login(role) {
    const u = pickUserByRole(role)
    if (!u) throw new Error('No demo user found for role')
    return u
  },
  async logout() {
    return true
  },
  async switchRole(role) {
    const u = pickUserByRole(role)
    if (!u) throw new Error('No demo user found for role')
    return u
  },
}

