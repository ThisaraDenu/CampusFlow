import { store } from './store'

const pickUserByRole = (role) => store.users.find((u) => u.role === role) || null

/** Demo-only: any registered mock email with this password signs in. */
const DEMO_PASSWORD = 'password'

const emailLooksValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export const authApi = {
  async register({ name, email, password }) {
    const trimmedName = (name || '').trim()
    const normalizedEmail = (email || '').trim().toLowerCase()
    if (!trimmedName) throw new Error('Name is required')
    if (!normalizedEmail) throw new Error('Email is required')
    if (!emailLooksValid(normalizedEmail)) {
      throw new Error('Enter a valid email address')
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }
    const exists = store.users.some(
      (x) => x.email.toLowerCase() === normalizedEmail,
    )
    if (exists) {
      throw new Error('An account with this email already exists')
    }
    const newUser = {
      id: `user-${Date.now()}`,
      name: trimmedName,
      email: normalizedEmail,
      role: 'USER',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(trimmedName)}`,
      createdAt: new Date().toISOString(),
      /** Demo-only: allows sign-in with the password chosen at registration */
      demoPassword: password,
    }
    store.users.push(newUser)
    return newUser
  },
  async login(email, password) {
    const normalized = (email || '').trim().toLowerCase()
    if (!normalized) throw new Error('Email is required')
    if (!password) throw new Error('Password is required')
    const u = store.users.find((x) => x.email.toLowerCase() === normalized)
    const passwordOk =
      password === DEMO_PASSWORD ||
      (u?.demoPassword != null && password === u.demoPassword)
    if (!u || !passwordOk) {
      throw new Error('Invalid email or password')
    }
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

