import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import type { ImageTileData } from './types'
import { DialogTitle } from '@mui/material'

interface ImageDetailsModalProps {
  open: boolean
  onClose: () => void
  data: ImageTileData
}

export function ImageDetailsModal({ open, onClose, data }: ImageDetailsModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
      >
        <Typography>
          Szczegóły zdjęcia
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box
            component="img"
            src={data.src}
            alt={`photo ${data.id}`}
            sx={{
              width: '100%',
              maxHeight: '70vh',
              borderRadius: 1,
            }}
          />
          {data.takenDate ? (
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {data.takenDate}
            </Typography>
          ) : null}
          {data.tags && data.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {data.tags.map((t) => (
                <Chip key={t} label={t} size="small" />
              ))}
            </Box>
          )}

          <Box>
            <Typography color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>
              Opis
            </Typography>
            <Typography>
              {data.description || '–'}
            </Typography>
          </Box>

          {data.creatorLabel ? (
            <Typography variant="caption" color="text.secondary">
              {data.creatorLabel}
            </Typography>
          ) : null}

          <Box sx={{ m: 0 }}>
            <Typography variant="body2" color="text.secondary">
              <Box component="span" fontWeight={600} color="text.primary">
                Województwo:{' '}
              </Box>
              {data.voivodeship || '–'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Box component="span" fontWeight={600} color="text.primary">
                Miasto:{' '}
              </Box>
              {data.city || '–'}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Zamknij</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ImageDetailsModal

