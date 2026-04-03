import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Autocomplete from '@mui/material/Autocomplete'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { fetchVoivodeships, fetchCities, fetchTags, GenericRowData } from '../../api'
import { parseTags } from '../../helpers'
import { useToast } from '../ToastContainer/ToastContext'

export interface LoggedUserFilterState {
  voivodeshipId: number | null
  cityId: number | null
  dateFrom: string
  dateTo: string
  tagsText?: string
  isSinceLastLoginChecked?: boolean
}

export const emptyLoggedUserFilterState: LoggedUserFilterState = {
  voivodeshipId: null,
  cityId: null,
  dateFrom: '',
  dateTo: '',
  tagsText: '',
  isSinceLastLoginChecked: false,
}

export interface AdminUserFilterOption {
  id: number
  displayName: string
  email: string
  isActive: boolean
}

export interface LoggedUserFiltersProps {
  value: LoggedUserFilterState
  onChange: (state: LoggedUserFilterState) => void
  onSearch: (state: LoggedUserFilterState) => void
  userFilter?: {
    users: Array<AdminUserFilterOption>
    value: number | null
    onChange: (userId: number | null) => void
  }
  onClear?: () => void
}

export function LoggedUserFilters({ value, onChange, onSearch, userFilter, onClear }: LoggedUserFiltersProps) {
  const { addToast } = useToast();
  const [voivodeships, setVoivodeships] = useState<Array<GenericRowData>>([])
  const [cities, setCities] = useState<Array<GenericRowData>>([])
  const [availableTags, setAvailableTags] = useState<Array<string>>([])
  const [isLoadingTags, setIsLoadingTags] = useState(false)
  const [isLoadingVoivodeships, setIsLoadingVoivodeships] = useState(true)
  const [isLoadingCities, setIsLoadingCities] = useState(false)

  useEffect(() => {
    setIsLoadingVoivodeships(true)

    fetchVoivodeships()
      .then((list) => {
        setVoivodeships(list)
      })
      .catch(() => addToast("Cannot get Voivodeship", 'danger'))
      .finally(() => setIsLoadingVoivodeships(false))

    setIsLoadingTags(true)

    fetchTags()
      .then((list) => setAvailableTags(list.map((t) => t.name)))
      .catch(() => addToast("Cannot get tags", 'danger'))
      .finally(() => setIsLoadingTags(false))
  }, [])

  useEffect(() => {
    if (value.voivodeshipId == null) {
      setCities([])
      return
    }
    setIsLoadingCities(true)
    fetchCities(value.voivodeshipId)
      .then((list) => {
        setCities(list)
      })
      .catch(() => addToast("Cannot get Cities", 'danger'))
      .finally(() => setIsLoadingCities(false))
  }, [value.voivodeshipId])

  const handleVoivodeshipChange = (voivodeshipId: number | '') => {
    const id = voivodeshipId === '' ? null : voivodeshipId
    onChange({
      ...value,
      voivodeshipId: id,
      cityId: null,
    })
  }

  const handleCityChange = (cityId: number | '') => {
    onChange({
      ...value,
      cityId: cityId === '' ? null : cityId,
    })
  }

  const handleClear = () => {
    if (onClear) {
      onClear()
    } else {
      onChange(emptyLoggedUserFilterState)
      onSearch(emptyLoggedUserFilterState)
    }
  }

  const handleSearch = () => {
    onSearch({ ...value })
  }

  const hasActiveFilters =
    value.voivodeshipId != null ||
    value.cityId != null ||
    value.dateFrom !== '' ||
    value.dateTo !== '' ||
    value.isSinceLastLoginChecked ||
    userFilter?.value != null ||
    (value.tagsText != null && value.tagsText.trim() !== '')

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
      {isLoadingVoivodeships ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Loading…
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
            {userFilter && (
              <FormControl fullWidth size="small">
                <InputLabel htmlFor={'filter-user-label'} id="filter-user-label">
                  Użytkownicy
                </InputLabel>
                <Select
                  inputProps={{ id: 'filter-user-label' }}
                  labelId="filter-user-label"
                  label="User"
                  value={userFilter.value ?? ''}
                  onChange={(e) => userFilter.onChange(e.target.value === '' ? null : Number(e.target.value))}
                >
                  {userFilter.users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.displayName || u.email || `User #${u.id}`}
                      {!u.isActive ? ' (banned)' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl fullWidth size="small">
              <InputLabel htmlFor={'filter-voivodeship-label'} id="filter-voivodeship-label">
                Województwa
              </InputLabel>
              <Select
                inputProps={{ id: 'filter-voivodeship-label' }}
                labelId="filter-voivodeship-label"
                label="Voivodeship"
                value={value.voivodeshipId ?? ''}
                onChange={(e) => handleVoivodeshipChange(e.target.value as number | '')}
              >
                {voivodeships.map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" disabled={value.voivodeshipId == null}>
              <InputLabel htmlFor={'filter-city-label'} id="filter-city-label">
                Miasta
              </InputLabel>
              <Select
                inputProps={{ id: 'filter-city-label' }}
                labelId="filter-city-label"
                label="City"
                value={value.cityId ?? ''}
                disabled={value.voivodeshipId === null && !isLoadingCities}
                onChange={(e) => handleCityChange(e.target.value as number | '')}
              >
                {cities.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="From"
              type="date"
              fullWidth
              value={value.dateFrom}
              onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              label="To"
              type="date"
              fullWidth
              value={value.dateTo}
              onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <Autocomplete
              multiple
              options={availableTags}
              value={parseTags(value.tagsText)}
              onChange={(_, next) => onChange({ ...value, tagsText: next.join(',') })}
              disableCloseOnSelect
              filterSelectedOptions
              loading={isLoadingTags}
              renderInput={(params) => <TextField {...params} size="small" label="Tags" placeholder="Select tags" />}
            />
            {userFilter && (
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={value.isSinceLastLoginChecked ?? false}
                    onChange={(e) => onChange({ ...value, isSinceLastLoginChecked: e.target.checked })}
                  />
                }
                label="Od ostatniego logowania"
              />
            )}
          </Box>

          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2, pt: 2 }}
          >
            <Button variant="contained" onClick={handleSearch} fullWidth>
              Szukaj
            </Button>
            {hasActiveFilters && (
              <Button variant="outlined" size="small" onClick={handleClear} fullWidth>
                Wyczyść filtry
              </Button>
            )}
          </Box>
        </>
      )}
    </Box>
  )
}
