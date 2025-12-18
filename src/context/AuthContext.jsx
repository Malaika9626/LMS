import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { authLogin, authRegister } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.email && parsed.role) {
          setUser(parsed)
        }
      }
    } catch {}
    setIsLoading(false)
  }, [])

  async function login(email, password) {
    const res = await authLogin({ email, password })
    const nextUser = res?.user ?? { email, role: 'student' }
    setUser(nextUser)
    try {
      localStorage.setItem('auth_user', JSON.stringify(nextUser))
      if (res?.token) localStorage.setItem('auth_token', res.token)
    } catch {}
    return { ok: Boolean(res?.ok) }
  }

  async function register(name, email, password, role) {
    // Admin-only create account: do not switch current session or token
    const res = await authRegister({ email, password, role })
    return { ok: Boolean(res?.ok) }
  }

  function logout() {
    setUser(null)
    try {
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
    } catch {}
  }

  const value = useMemo(() => ({ user, isLoading, login, register, logout }), [user, isLoading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}