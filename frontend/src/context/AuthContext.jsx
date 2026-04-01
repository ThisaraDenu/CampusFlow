import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../services/authApi'

const AuthContext = createContext(undefined)

const STORAGE_KEY = 'campusops_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setUser(JSON.parse(saved))
  }, [])

  const isAuthenticated = !!user

  const login = async (role) => {
    const u = await authApi.login(role)
    setUser(u)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    return u
  }

  const logout = async () => {
    await authApi.logout()
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const switchRole = async (role) => {
    const u = await authApi.switchRole(role)
    setUser(u)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    return u
  }

  const value = useMemo(
    () => ({ user, isAuthenticated, login, logout, switchRole }),
    [user, isAuthenticated],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

