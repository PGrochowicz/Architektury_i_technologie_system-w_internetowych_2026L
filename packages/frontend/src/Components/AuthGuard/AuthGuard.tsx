import { Navigate } from 'react-router-dom'
import { useAuth } from '../../Contexts/Auth/AuthContext'
import { isAdmin } from '../../api/authApi'

interface AuthGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function AuthGuard({ children, requireAdmin: adminOnly }: AuthGuardProps) {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) return <Navigate to="/archive" replace />

  if (adminOnly && !isAdmin(user)) return <Navigate to="/archive" replace />

  return <>{children}</>
}
