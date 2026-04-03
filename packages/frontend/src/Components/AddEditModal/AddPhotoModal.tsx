import { useEffect, useState } from 'react'
import { fetchVoivodeships, fetchCities, fetchTags, createPhoto, type GenericRowData } from '../../api'
import { PhotoPickFormComponent } from './PhotoPickFormComponent'
import { LocationFormComponent } from './LocationFormComponent'
import { DetailsFormComponent } from './DetailsFormComponent'
import { DateFormComponent } from './DateFormComponent'
import { useToast } from '../ToastContainer/ToastContext'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'

export interface AddPhotoModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddPhotoModal({ open, onClose, onSuccess }: AddPhotoModalProps) {
  const { addToast } = useToast();
  const [voivodeships, setVoivodeships] = useState<Array<GenericRowData>>([])
  const [cities, setCities] = useState<Array<GenericRowData>>([])
  const [tagList, setTagList] = useState<Array<string>>([])

  const [voivodeshipId, setVoivodeshipId] = useState<number | null>(null)
  const [cityId, setCityId] = useState<number | null>(null)
  const [customCityName, setCustomCityName] = useState('')
  const [description, setDescription] = useState<string>('')
  const [takenYear, setTakenYear] = useState<number | null>(null)
  const [takenMonth, setTakenMonth] = useState<number | null>(null)
  const [takenDay, setTakenDay] = useState<number | null>(null)
  const [tags, setTags] = useState<Array<string>>([])

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [loadingVoivodeships, setLoadingVoivodeships] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingTags, setLoadingTags] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchInitalData = () => {
    setLoadingVoivodeships(true)
    fetchVoivodeships()
      .then(setVoivodeships)
      .finally(() => setLoadingVoivodeships(false))

    setLoadingTags(true)
    fetchTags()
      .then((list) => setTagList(list.map((t) => t.name)))
      .finally(() => setLoadingTags(false))
  }

  useEffect(() => {
    setSubmitting(false)
    setPhotoFile(null)
    setPhotoPreview(null)
    setVoivodeships([])
    setCities([])
    setVoivodeshipId(null)
    setCityId(null)
    setCustomCityName('')
    setDescription('')
    setTakenYear(null)
    setTakenMonth(null)
    setTakenDay(null)
    setTags([])
    fetchInitalData()
  }, [open])

  useEffect(() => {
    if (!voivodeshipId) {
      setCities([])
      return
    }

    setLoadingCities(true)
    fetchCities(voivodeshipId)
      .then(setCities)
      .finally(() => setLoadingCities(false))
  }, [open, voivodeshipId])

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setPhotoFile(file)
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return file ? URL.createObjectURL(file) : null
    })
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!photoFile) {
      addToast('Wybierz zdjęcie', 'danger')
      return
    }
    if (!voivodeshipId) {
      addToast('Wybierz województwo', 'danger')
      return
    }
    if (cityId === null) {
      addToast('Wybierz miasto', 'danger')
      return
    }
    if (cityId === 0 && !customCityName.trim()) {
      addToast('Wpisz nazwe miasta', 'danger')
      return
    }
    if (!description.trim()) {
      addToast('Opis jest wymagany', 'danger')
      return
    }
    if (!takenYear) {
      addToast('Wybierz co najmniej rok', 'danger')
      return
    }
    if (tags.length === 0) {
      addToast('Wybierz co najmniej jeden tag', 'danger')
      return
    }

    setSubmitting(true)
    try {
      await createPhoto({
        cityId: Number(cityId),
        description: description.trim(),
        takenYear: !takenYear ? null : Number(takenYear),
        takenMonth: !takenMonth ? null : Number(takenMonth),
        takenDay: !takenDay ? null : Number(takenDay),
        tags,
        file: photoFile,
        ...(cityId === 0 ? { customCityName: customCityName.trim(), voivodeshipId: voivodeshipId! } : {}),
      })
      onSuccess()
      addToast('Dodano nowe zdjęcie', 'success')
      onClose()
    } catch (err) {
      addToast('Błąd podczas dodawania zdjęcia', 'danger')
    } finally {
      setSubmitting(false)
    }
  }

  return (

    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      scroll="paper"
    >
      <DialogTitle
      >
        <Typography>
          Add photo
        </Typography>
      </DialogTitle>

      <DialogContent
        dividers
      >
        <Box component="form" id="add-photo-form" onSubmit={onSubmit}>
          <Stack spacing={5}>
            <PhotoPickFormComponent
              previewSrc={photoPreview}
              onPickFile={onPickFile}
              submitting={submitting}
            />
            <LocationFormComponent
              voivodeships={voivodeships}
              cities={cities}
              voivodeshipId={voivodeshipId}
              cityId={cityId}
              onVoivodeshipChange={(id) => { setVoivodeshipId(id); setCityId(null); setCustomCityName('') }}
              onCityChange={(id) => { setCityId(id); if (id !== 0) setCustomCityName('') }}
              loadingVoivodeships={loadingVoivodeships}
              loadingCities={loadingCities}
              customCityName={customCityName}
              onCustomCityNameChange={setCustomCityName}
            />
            <DetailsFormComponent
              description={description}
              onDescriptionChange={setDescription}
              tagList={tagList}
              tags={tags}
              onTagsChange={setTags}
              loadingTags={loadingTags}
            />
            <DateFormComponent
              takenYear={takenYear}
              takenMonth={takenMonth}
              takenDay={takenDay}
              onYearChange={setTakenYear}
              onMonthChange={setTakenMonth}
              onDayChange={setTakenDay}
            />
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Anuluj
        </Button>
        <Button type="submit" form="add-photo-form" variant="contained" disabled={submitting}>
          Zapisz
        </Button>
      </DialogActions>
    </Dialog>
  )
}
