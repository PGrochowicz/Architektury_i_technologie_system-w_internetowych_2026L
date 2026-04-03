import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import {
  fetchAdminUsers,
  banUser,
  unbanUser,
  isAdmin,
  type AdminUser,
} from '../../api'
import { useAuth } from '../../Contexts/Auth/AuthContext'
import { useToast } from '../ToastContainer/ToastContext'
import { UserTable } from './UserTable'
import { CityTable } from './CityTable'
import { BanUserModal } from '../BanUserModal'

export function AdminUsers() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [banTarget, setBanTarget] = useState<{ id: number; name: string; isActive: boolean } | null>(null)

  const loadUsers = () => {
    setLoading(true)
    fetchAdminUsers()
      .then(setUsers)
      .catch((e) => addToast(e.message, 'danger'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!user || !isAdmin(user)) {
      navigate('/archive', { replace: true })
      return
    }
    loadUsers()
  }, [user, navigate])

  const handleBanConfirm = () => {
    if (!banTarget) return
    const action = banTarget.isActive ? banUser : unbanUser
    const id = banTarget.id
    setBanTarget(null)
    action(id)
      .then(loadUsers)
      .catch((e) => addToast(e.message, 'danger'))
  }

  if (!user || !isAdmin(user)) return null

  return (
    <Box sx={{ width: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'auto', p: 2, gap: 3 }}>
      <Box>
        <Typography component="h1">Panel Kontrolny</Typography>
        <Typography component="h2" variant="h6" sx={{ mb: 1 }}>Użytkownicy</Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <UserTable
            users={users}
            currentUserId={user.id}
            onBanToggle={(u) => setBanTarget({
              id: u.id,
              name: u.displayName || u.email || `User #${u.id}`,
              isActive: u.isActive,
            })}
          />
        )}
      </Box>

      <Box>
        <Typography component="h2" variant="h6" sx={{ mb: 1 }}>Miasta</Typography>
        <CityTable />
      </Box>

      <BanUserModal
        open={banTarget != null}
        isUserActive={banTarget?.isActive ?? false}
        userName={banTarget?.name ?? ''}
        onConfirm={handleBanConfirm}
        onClose={() => setBanTarget(null)}
      />
    </Box>
  )
}
