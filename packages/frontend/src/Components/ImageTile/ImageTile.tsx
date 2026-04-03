import { useMemo, useState, type ReactNode } from 'react'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import type { ImageTileData } from './types'
import ImageDetailsModal from './ImageDetailsModal'
import { IMAGE_TILE_MAX_TEXT_LENGTH } from './constants'

interface ImageTileProps {
  data: ImageTileData
  actions?: ReactNode
}

export const ImageTile = ({ data, actions }: ImageTileProps) => {
  const [detailsOpen, setDetailsOpen] = useState(false)

  const imageTileDescription = useMemo(() => {
    const text = data.description?.trim() ?? ''
    if (!text.length) return '-'
    if (text.length <= IMAGE_TILE_MAX_TEXT_LENGTH) return text
    return text.slice(0, IMAGE_TILE_MAX_TEXT_LENGTH - 1) + '…'
  }, [data.description])

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          cursor: 'pointer',
        }}
        data-tile-id={data.id}
        onClick={() => setDetailsOpen(true)}
        role="button"
        onKeyDown={() => setDetailsOpen(true)}
      >
        <CardMedia
          component="img"
          image={data.src}
          loading="lazy"
          alt={`Zdjęcie z opisem: ${data.description}`}
          sx={{ aspectRatio: '4/3', objectFit: 'cover' }}
        />
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {data.takenDate ? (
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
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
          <Typography color="text.primary">{imageTileDescription}</Typography>
          {data.creatorLabel ? (
            <Typography variant="caption" color="text.secondary">
              {data.creatorLabel}
            </Typography>
          ) : null}
          <Box sx={{ m: 0 }}>
            <Typography variant="caption" color="text.secondary" component="div">
              <Box component="span" fontWeight={600} color="text.primary">
                Województwo:{' '}
              </Box>
              {data.voivodeship}
            </Typography>
            <Typography variant="caption" color="text.secondary" component="div">
              <Box component="span" fontWeight={600} color="text.primary">
                Miasto:{' '}
              </Box>
              {data.city}
            </Typography>
          </Box>
        </CardContent>
        {actions ? (
          <CardActions
            disableSpacing
            sx={{ justifyContent: 'flex-end', pt: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {actions}
          </CardActions>
        ) : null}
      </Card>

      <ImageDetailsModal open={detailsOpen} onClose={() => setDetailsOpen(false)} data={data} />
    </>
  )
}

