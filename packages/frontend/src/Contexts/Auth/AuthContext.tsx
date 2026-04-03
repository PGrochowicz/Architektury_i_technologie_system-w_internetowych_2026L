import { createContext, useContext, useEffect, useState } from 'react'
import { fetchAuthMe, logoutAuth, type AuthUser } from '../../api'
import { useNavigate } from 'react-router-dom'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: () => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAuthMe()
      .then((u) => setUser(u))
      .finally(() => setLoading(false))
  }, [])

  const login = () => {
    window.location.href = '/api/auth/google'
  }

  const logout = () => {
    logoutAuth().catch(() => {})
    setUser(null)
    navigate('/archive', { replace: true })
  }

  const refreshUser = async () => {
    const u = await fetchAuthMe()
    setUser(u)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
