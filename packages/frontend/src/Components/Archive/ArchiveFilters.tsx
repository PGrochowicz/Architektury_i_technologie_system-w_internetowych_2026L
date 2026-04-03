import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Autocomplete from '@mui/material/Autocomplete'
import { fetchTags, type VoivodeshipDetails } from '../../api'
import { parseTags } from '../../helpers'
import { useToast } from '../ToastContainer/ToastContext'
import { Typography } from '@mui/material'

export interface ArchiveFilterState {
  cityId: number | null
  dateFrom: string
  dateTo: string
  tagsText?: string
  description?: string
}

const emptyFilterState: ArchiveFilterState = {
  cityId: null,
  dateFrom: '',
  dateTo: '',
  tagsText: '',
  description: '',
}

interface ArchiveFiltersProps {
  voivodeshipDetails: VoivodeshipDetails
  value: ArchiveFilterState
  onChange: (state: ArchiveFilterState) => void
  onSearch: (state: ArchiveFilterState) => void
}

export function ArchiveFilters({ voivodeshipDetails, value, onChange, onSearch }: ArchiveFiltersProps) {
  const { addToast } = useToast();
  const handleCityChange = (cityId: number | '') => {
    const id = cityId === '' ? null : cityId
    onChange({ ...value, cityId: id })
  }

  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [isLoadingTags, setIsLoadingTags] = useState(false)

  useEffect(() => {
    setIsLoadingTags(true)
    fetchTags()
      .then((list) => setAvailableTags(list.map((t) => t.name)))
      .catch(() => addToast("Cannot get tags", 'danger'))
      .finally(() => setIsLoadingTags(false))
  }, [])

  const selectedTags = parseTags(value.tagsText)

  const hasActiveFilters =
    value.cityId != null ||
    value.dateFrom !== '' ||
    value.dateTo !== '' ||
    (value.tagsText != null && value.tagsText.trim() !== '') ||
    (value.description != null && value.description.trim() !== '')

  return (
    <Box
      sx={{
        width: 260,
        height: '100%',
        p: 2,
        borderRight: 1,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Filtry
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minHeight: 0 }}>
        <TextField
          size="small"
          label="Szukaj w opisie"
          fullWidth
          value={value.description ?? ''}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
        <FormControl fullWidth size="small">
          <InputLabel htmlFor={'filter-city-label'} id="filter-city-label">Miasto</InputLabel>
          <Select
            labelId="filter-city-label"
            inputProps={{ id: 'filter-city-label' }}
            label="Miasto"
            value={value.cityId ?? ''}
            onChange={(e) => handleCityChange(e.target.value as number | '')}
          >
            {voivodeshipDetails.cities.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          label="Od"
          aria-label='data od'
          type="date"
          fullWidth
          value={value.dateFrom}
          onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small"
          label="Do"
          aria-label='data do'
          type="date"
          fullWidth
          value={value.dateTo}
          onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
        <Autocomplete
          multiple
          options={availableTags}
          value={selectedTags}
          onChange={(_, next) => onChange({ ...value, tagsText: next.join(',') })}
          disableCloseOnSelect
          filterSelectedOptions
          loading={isLoadingTags}
          renderInput={(params) => <TextField {...params} size="small" label="Tagi" placeholder="Wybierz tagi" />}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2, pt: 2 }}>
        <Button variant="contained" onClick={() => onSearch(value)} fullWidth>Szukaj</Button>
        {hasActiveFilters && (
          <Button variant="outlined" size="small" onClick={() => { onChange(emptyFilterState); onSearch(emptyFilterState) }} fullWidth>
            Wyczyść filtry
          </Button>
        )}
      </Box>
    </Box>
  )
}
