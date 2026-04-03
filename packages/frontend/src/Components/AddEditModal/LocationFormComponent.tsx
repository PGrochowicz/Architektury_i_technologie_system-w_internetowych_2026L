import Stack from '@mui/material/Stack'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import TextField from '@mui/material/TextField'
import type { GenericRowData } from '../../api'

interface LocationFormComponentProps {
  voivodeships: Array<GenericRowData>
  cities: Array<GenericRowData>
  voivodeshipId: number | null
  cityId: number | null
  onVoivodeshipChange: (id: number | null) => void
  onCityChange: (id: number | null) => void
  loadingVoivodeships: boolean
  loadingCities: boolean
  customCityName?: string
  onCustomCityNameChange?: (name: string) => void
}

export function LocationFormComponent({
  voivodeships,
  cities,
  voivodeshipId,
  cityId,
  onVoivodeshipChange,
  onCityChange,
  loadingVoivodeships,
  loadingCities,
  customCityName,
  onCustomCityNameChange,
}: LocationFormComponentProps) {
  return (
    <Stack spacing={1.5} sx={{ minWidth: 0 }}>
      <FormControl fullWidth size="small" disabled={loadingVoivodeships}>
        <InputLabel htmlFor={'location-voivodeship-select'} id="location-voivodeship-select">Województwo</InputLabel>
        <Select
          labelId="location-voivodeship-select"
          inputProps={{ id: 'location-voivodeship-select' }}
          label="Voivodeship"
          value={voivodeshipId ?? ''}
          onChange={(e) => onVoivodeshipChange(e.target.value === '' ? null : Number(e.target.value))}
        >
          {voivodeships.map((v) => (
            <MenuItem key={v.id} value={v.id}>
              {v.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small" disabled={loadingCities || !voivodeshipId}>
        <InputLabel htmlFor={'location-city-select'} id="location-city-select">Miasto</InputLabel>
        <Select
          labelId="location-city-select"
          inputProps={{ id: 'location-city-select' }}
          label="City"
          value={cityId === 0 || cities.some((c) => c.id === cityId) ? cityId : ''}
          onChange={(e) => onCityChange(e.target.value === '' ? null : Number(e.target.value))}
        >
          {cities.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
          <MenuItem value={0}>Dodaj miasto</MenuItem>
        </Select>
      </FormControl>
      {cityId === 0 && onCustomCityNameChange && (
        <TextField
          fullWidth
          size="small"
          label="Nowe miasto"
          value={customCityName ?? ''}
          onChange={(e) => onCustomCityNameChange(e.target.value)}
        />
      )}
    </Stack>
  )
}
