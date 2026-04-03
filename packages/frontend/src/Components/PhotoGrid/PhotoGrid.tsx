import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

interface PhotoGridProps {
  loading: boolean
  itemCount: number
  children: ReactNode
}

export function PhotoGrid({
  loading,
  itemCount,
  children,
}: PhotoGridProps) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    )
  }
  if (itemCount === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center', px: 2 }}>
        Brak zdjęć w Archiwum
      </Typography>
    )
  }
  return (
    <Box
      sx={{
        px: 2,
        pb: 3,
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(5, minmax(0, 1fr))' },
        gap: 2,
      }}
    >
      {children}
    </Box>
  )
}
