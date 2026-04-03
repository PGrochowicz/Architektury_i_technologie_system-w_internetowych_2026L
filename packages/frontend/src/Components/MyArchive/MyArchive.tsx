import { useState } from 'react'
import Button from '@mui/material/Button'
import {
  LoggedUserFilters,
  emptyLoggedUserFilterState,
  type LoggedUserFilterState,
} from '../LoggedUserFilters'
import { MyArchiveImages } from './MyArchiveImages'
import { Box, Typography } from '@mui/material'

export function MyArchive() {
  const [draft, setDraft] = useState<LoggedUserFilterState>(emptyLoggedUserFilterState)
  const [appliedFilters, setAppliedFitlers] = useState<LoggedUserFilterState>(emptyLoggedUserFilterState)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  return (
    <Box sx={{ width: '100%', flex: 1, display: 'flex', overflow: 'hidden' }}>
      <LoggedUserFilters value={draft} onChange={setDraft} onSearch={setAppliedFitlers} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography variant="h5" component="h1">
            Moje Archiwum
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: 'auto' }}>
            <Button variant="contained" onClick={() => setIsAddDialogOpen(true)}>
              Dodaj zdjęcie
            </Button>
          </Box>
        </Box>
        <MyArchiveImages
          filters={appliedFilters}
          isAddDialogOpen={isAddDialogOpen}
          setIsAddDialogOpen={setIsAddDialogOpen}
        />
      </Box>
    </Box>
  )
}
