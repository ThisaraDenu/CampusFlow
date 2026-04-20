import { apiRequest, setToken } from './apiClient'

/**
 * Ask the backend for the exact Google OAuth URL for this server (avoids wrong host/port,
 * e.g. hitting standalone Tomcat or the React dev server by mistake).
 */
export async function fetchGoogleOAuthRedirectUrl() {
  const data = await apiRequest('/api/auth/google-authorization-url', {
    method: 'GET',
    skipAuth: true,
  })
  if (!data?.url || typeof data.url !== 'string') {
    throw new Error('Invalid response when starting Google sign-in')
  }
  return data.url
}

export const authApi = {
  async login(email, password) {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email, password },
      skipAuth: true,
    })
    if (data?.token) {
      setToken(data.token)
    }
    return data
  },

  async register({ name, email, password }) {
    const data = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: { name, email, password },
      skipAuth: true,
    })
    if (data?.token) {
      setToken(data.token)
    }
    return data
  },

  async me() {
    return apiRequest('/api/auth/me')
  },

  async updateProfile({ name, email }) {
    return apiRequest('/api/profile', {
      method: 'PATCH',
      body: { name, email },
    })
  },

  async uploadAvatar(file) {
    const fd = new FormData()
    fd.append('file', file)
    return apiRequest('/api/profile/avatar', {
      method: 'POST',
      body: fd,
    })
  },

  async logout() {
    setToken(null)
    return true
  },

  /** Apply token from OAuth hash and return whether a token was present */
  persistTokenFromOAuth(token) {
    if (!token) return false
    setToken(token)
    return true
  },

}
