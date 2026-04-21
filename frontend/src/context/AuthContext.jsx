import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../services/authApi'
import { getToken, setToken } from '../services/apiClient'

const AuthContext = createContext(undefined)

function userForClient(u) {
  if (!u) return u
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    mainAdmin: !!u.mainAdmin,
    avatar: u.avatar,
    createdAt: u.createdAt,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [bootstrapping, setBootstrapping] = useState(true)

  const refreshUser = useCallback(async () => {
    const t = getToken()
    if (!t) {
      setUser(null)
      return null
    }
    const u = await authApi.me()
    const safe = userForClient(u)
    setUser(safe)
    return safe
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (!getToken()) {
          return
        }
        const u = await authApi.me()
        if (!cancelled) {
          setUser(userForClient(u))
        }
      } catch {
        if (!cancelled) {
          setToken(null)
          setUser(null)
        }
      } finally {
        if (!cancelled) {
          setBootstrapping(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const isAuthenticated = !!user && !!getToken()

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password)
    const safe = userForClient(data.user)
    setUser(safe)
    return safe
  }, [])

  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload)
    const safe = userForClient(data.user)
    setUser(safe)
    return safe
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  const completeOAuthSession = useCallback(
    async (token) => {
      authApi.persistTokenFromOAuth(token)
      return refreshUser()
    },
    [refreshUser],
  )

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      bootstrapping,
      login,
      register,
      logout,
      completeOAuthSession,
      refreshUser,
    }),
    [
      user,
      isAuthenticated,
      bootstrapping,
      login,
      register,
      logout,
      completeOAuthSession,
      refreshUser,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
