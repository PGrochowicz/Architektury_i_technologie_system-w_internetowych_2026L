import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import { MAX_TAGS } from './constants'
import { useToast } from '../ToastContainer/ToastContext'

interface DetailsFormComponentProps {
  description: string
  onDescriptionChange: (description: string) => void
  tagList: Array<string>
  tags: Array<string>
  onTagsChange: (next: Array<string>) => void
  loadingTags: boolean
}

export function DetailsFormComponent({
  description,
  onDescriptionChange,
  tagList,
  tags,
  onTagsChange,
  loadingTags
}: DetailsFormComponentProps) {
  const { addToast } = useToast();

  return (
    <Stack spacing={1.5} sx={{ minWidth: 0 }}>
      <TextField
        size="small"
        fullWidth
        required
        label="Opis"
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
      />
      <Autocomplete
        multiple
        fullWidth
        options={tagList}
        value={tags}
        onChange={(_, next) => {
          const limited = next.slice(0, MAX_TAGS)
          if (next.length > MAX_TAGS) addToast(`Możesz wybrać max ${MAX_TAGS} tagów`, 'danger')
          onTagsChange(limited)
        }}
        disableCloseOnSelect
        filterSelectedOptions
        loading={loadingTags}
        sx={{ minWidth: 0 }}
        renderInput={(params) => (
          <TextField {...params} size="small" label={`Tagi (max ${MAX_TAGS})`} placeholder="Szukaj tagi" />
        )}
      />
    </Stack>
  )
}
