import Box from '@mui/material/Box'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Menu } from './Components/Menu'
import { VoivodeshipList } from './Components/VoivodeshipList'
import { AuthCallback } from './Components/AuthCallback'
import { MyArchive } from './Components/MyArchive'
import { AdminUsers } from './Components/AdminPanel'
import { Archive } from './Components'
import { AdminLatestPhotoArchive } from './Components/AdminLatestPhotoArchive'
import { PageWrapper } from './Components/Page'
import { AuthGuard } from './Components/AuthGuard'

function App() {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Menu />
      <Box
        component="section"
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/archive" replace />} />
          <Route path="/archive" element={<VoivodeshipList />} />
          <Route path="/archive/:voivodeshipId" element={<PageWrapper><Archive /></PageWrapper>} />
          <Route path="/my-archive" element={<AuthGuard><PageWrapper><MyArchive /></PageWrapper></AuthGuard>} />
          <Route path="/admin/photos" element={<AuthGuard requireAdmin><PageWrapper><AdminLatestPhotoArchive /></PageWrapper></AuthGuard>} />
          <Route path="/admin/control" element={<AuthGuard requireAdmin><PageWrapper><AdminUsers /></PageWrapper></AuthGuard>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default App
