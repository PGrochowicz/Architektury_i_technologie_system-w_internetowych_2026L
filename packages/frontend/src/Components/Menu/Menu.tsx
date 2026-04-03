import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import { useAuth } from '../../Contexts/Auth/AuthContext'
import { isAdmin } from '../../api'
import { MenuThemeSelector } from './MenuThemeSelector'
import { MenuItems } from './MenuItems'
import { MenuLogin } from './MenuLogin'

export const Menu = () => {
  const { user, login, logout } = useAuth()

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: 2, borderColor: 'divider', bgcolor: 'background.paper', }}>
      <Toolbar sx={{ width: '100%' }}>
        <MenuItems user={user} isAdmin={isAdmin(user)} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
          <MenuLogin user={user} login={login} logout={logout} />
          <MenuThemeSelector />
        </Box>
      </Toolbar>
    </AppBar>
  )
}
