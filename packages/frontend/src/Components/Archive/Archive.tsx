import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { ArchiveImages } from './ArchiveImages'
import { ArchiveFilters, type ArchiveFilterState } from './ArchiveFilters'
import { fetchVoivodeshipDetails, type VoivodeshipDetails } from '../../api'
import { CircularProgress } from '@mui/material'

const initialFilters: ArchiveFilterState = {
  cityId: null,
  dateFrom: '',
  dateTo: '',
}

export const Archive = () => {
  const { voivodeshipId } = useParams<{ voivodeshipId: string }>()
  const [draftFilters, setDraftFilters] = useState<ArchiveFilterState>(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState<ArchiveFilterState>(initialFilters)
  const [voivodeshipDetails, setVoivodeshipDetails] = useState<VoivodeshipDetails>()
  const [isVoivodeshipLoading, setIsVoivodeshipLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleBackClick = () => navigate('/archive', { replace: true })

  useEffect(() => {
    setIsVoivodeshipLoading(true);
    fetchVoivodeshipDetails(Number(voivodeshipId))
      .then(details => {
        setVoivodeshipDetails(details)
      }).finally(() => setIsVoivodeshipLoading(false))
  }, [voivodeshipId])

  if (isVoivodeshipLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!voivodeshipDetails?.voivodeship.name && !isVoivodeshipLoading) {
    return (
      <Box sx={{ py: 3, px: 2, textAlign: 'center' }}>
        <Typography variant="h5" component="h1" color="text.secondary">Brak województwa</Typography>
        <Button variant="text" onClick={handleBackClick} sx={{ mt: 2 }}>
          Powrót do Archiwum
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', flex: 1, display: 'flex', overflow: 'hidden' }}>
      <ArchiveFilters
        voivodeshipDetails={voivodeshipDetails!}
        value={draftFilters}
        onChange={setDraftFilters}
        onSearch={setAppliedFilters}
      />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <Box
          sx={{ p: 2 }}
        >
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={handleBackClick} variant="outlined" size="small">
              Powrót do wyboru województw
            </Button>
            <Typography variant="h5" component="h1">
              {voivodeshipDetails!.voivodeship.name}
            </Typography>
          </Box>
        </Box>
        <ArchiveImages voivodeshipId={voivodeshipDetails!.voivodeship.id} filters={appliedFilters} />
      </Box>
    </Box>
  )
}
