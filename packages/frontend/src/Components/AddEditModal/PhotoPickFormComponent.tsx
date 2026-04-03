import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

export interface PhotoPickFormComponentProps {
  previewSrc: string | null
  onPickFile: (e: React.ChangeEvent<HTMLInputElement>) => void
  submitting: boolean
  showRemoveNewImage?: boolean
  onRemoveNewImage?: () => void
}

export function PhotoPickFormComponent({
  previewSrc,
  onPickFile,
  submitting,
  showRemoveNewImage,
  onRemoveNewImage,
}: PhotoPickFormComponentProps) {
  return (
    <Stack spacing={1.5} alignItems="stretch" sx={{ minWidth: 0 }}>
      <Box
        sx={{
          minWidth: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {previewSrc ? (
          <Box
            component="img"
            src={previewSrc}
            alt={""}
            sx={{
              width: '100%',
              maxHeight: '70vh',
              borderRadius: 1,
            }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center" px={1}>
            Brak zdjęcia
          </Typography>
        )}
      </Box>
      <Button variant="outlined" component="label" size="small" disabled={submitting} fullWidth>
        Wybierz zdjęcie
        <input type="file" hidden accept="image/*" onChange={onPickFile} />
      </Button>
      {showRemoveNewImage && onRemoveNewImage ? (
        <Button size="small" onClick={onRemoveNewImage} fullWidth>
          Usuń zdjęcie
        </Button>
      ) : null}
    </Stack>
  )
}
