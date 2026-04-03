import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { fetchVoivodeships } from '../../api'

export const VoivodeshipList = () => {
  const [voivodeships, setVoivodeships] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchVoivodeships()
      .then((data) => setVoivodeships(data))
      .catch(() => setError('Failed to load voivodeships'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress />
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Loading voivodeships…
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    )
  }

  if (voivodeships.length === 0) {
    return (
      <Box>
        <Typography color="text.secondary">No voivodeships in the archive.</Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography variant="h1" color="text.secondary" fontSize={60} sx={{ mb: 3 }}>
        Wybierz województwo
      </Typography>
      <Box
        sx={{
          maxWidth: '100%',
          mx: 'auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: 'center',
        }}
      >
        {voivodeships.map((v) => (
          <Card key={v.id} variant="outlined" sx={{ width: 200, minHeight: 80, flexShrink: 0 }}>
            <CardActionArea
              component={Link}
              to={`/archive/${encodeURIComponent(v.id)}`}
              sx={{ height: '100%', display: 'block', textAlign: 'center' }}
              aria-label={`View photos from ${v.name}`}
            >
              <CardContent>
                <Typography component="h2" variant="h6" >
                  {v.name}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  )
}
