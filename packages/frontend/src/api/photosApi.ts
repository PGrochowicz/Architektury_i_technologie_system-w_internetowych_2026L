import { api, MINIO_BASE } from './httpClient'
import type {
  AdminPhotoItem,
  Paginated,
  PhotoItem,
} from './responses'
import type {
  AdminPhotosFiltersPayload,
  ArchiveFiltersPayload,
  CreatePhotoPayload,
  LoggedUserFiltersPayload,
  UpdatePhotoPayload,
} from './requests'

export const PHOTOS_PAGE_SIZE = 10

export function photoImageUrl(storedFileName: string): string {
  return `${MINIO_BASE}/${storedFileName}?t=${Date.now()}`
}

export async function fetchPhotos(
  voivodeshipId?: number,
  filters?: ArchiveFiltersPayload | null,
): Promise<Paginated<PhotoItem>> {
  const params = new URLSearchParams()

  if (voivodeshipId != null) params.set('voivodeshipId', String(voivodeshipId))
  if (filters?.cityId != null) params.set('cityId', String(filters.cityId))
  if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.set('dateTo', filters.dateTo)
  if (filters?.tags && filters.tags.length) filters.tags.forEach((t) => params.append('tags', t))
  if (filters?.description) params.set('text', filters.description)

  params.set('page', String(filters?.page ?? 1))
  params.set('pageSize', String(PHOTOS_PAGE_SIZE))

  const qs = params.toString()
  const res = await api.get(`/photos?${qs}`)

  if (res.status !== 200) throw new Error('Nieudało się pobrać zdjęć')

  return res.data as Paginated<PhotoItem>
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function createPhoto(payload: CreatePhotoPayload): Promise<void> {
  const file = await fileToBase64(payload.file)
  const res = await api.post('/photos', {
    file,
    fileName: payload.file.name,
    cityId: payload.cityId,
    description: payload.description,
    takenYear: payload.takenYear,
    takenMonth: payload.takenMonth,
    takenDay: payload.takenDay,
    tags: payload.tags?.slice(0, 5) ?? [],
    customCityName: payload.customCityName ?? null,
    voivodeshipId: payload.voivodeshipId ?? null,
  })
  if (res.status !== 200) throw new Error('Nie udało się zapisać zdjęcia')
}

export async function updatePhoto(id: number, payload: UpdatePhotoPayload): Promise<void> {
  const file = payload.file ? await fileToBase64(payload.file) : null
  const res = await api.patch(`/photos/${id}`, {
    cityId: payload.cityId,
    description: payload.description,
    takenYear: payload.takenYear,
    takenMonth: payload.takenMonth,
    takenDay: payload.takenDay,
    tags: payload.tags?.slice(0, 5) ?? null,
    file,
    fileName: payload.file?.name ?? null,
    customCityName: payload.customCityName ?? null,
    voivodeshipId: payload.voivodeshipId ?? null,
  })
  if (res.status === 401) throw new Error('Wymaga autoryzacji')
  if (res.status === 404) throw new Error('Nie znaleziono zdjęcia')
  if (res.status !== 200) throw new Error('Nie udało się zaktualizować zdjęcia')
}

export async function deletePhoto(id: number): Promise<void> {
  const res = await api.delete(`/photos/${id}`)

  if (res.status === 401) throw new Error('Wymaga autoryzacji')
  if (res.status === 404) throw new Error('Nie znaleziono zdjęcia')
  if (res.status !== 200) throw new Error('Nieudało się usunąć zdjęcia')
}

export async function fetchLoggedUserPhotos(filters?: LoggedUserFiltersPayload | null): Promise<Paginated<PhotoItem>> {
  const params = new URLSearchParams()

  if (filters?.voivodeshipId != null) params.set('voivodeshipId', String(filters.voivodeshipId))
  if (filters?.cityId != null) params.set('cityId', String(filters.cityId))
  if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.set('dateTo', filters.dateTo)
  if (filters?.tags && filters.tags.length) filters.tags.forEach((t) => params.append('tags', t))

  params.set('page', String(filters?.page ?? 1))
  params.set('pageSize', String(PHOTOS_PAGE_SIZE))

  const qs = params.toString()
  const res = await api.get(`/photos/logged?${qs}`)

  if (res.status === 401) throw new Error('Wymaga autoryzacji')
  if (res.status !== 200) throw new Error('Nieudało się pobrać zdjęć')

  return res.data as Paginated<PhotoItem>
}

export async function fetchAdminPhotos(
  filters?: AdminPhotosFiltersPayload | null,
): Promise<Paginated<AdminPhotoItem>> {
  const params = new URLSearchParams()

  if (filters?.userId != null) params.set('userId', String(filters.userId))
  if (filters?.voivodeshipId != null) params.set('voivodeshipId', String(filters.voivodeshipId))
  if (filters?.cityId != null) params.set('cityId', String(filters.cityId))
  if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.set('dateTo', filters.dateTo)
  if (filters?.tags && filters.tags.length) filters.tags.forEach((t) => params.append('tags', t))
  if (filters?.isSinceLastLoginChecked) params.set('isSinceLastLoginChecked', 'true')

  params.set('page', String(filters?.page ?? 1))
  params.set('pageSize', String(PHOTOS_PAGE_SIZE))

  const qs = params.toString()
  const res = await api.get(`/photos/admin?${qs}`)

  if (res.status === 401 || res.status === 403) throw new Error('Wymaga uprawnień adminowskich')
  if (res.status !== 200) throw new Error('Nieudało się pobrać zdjęć')

  return res.data as Paginated<AdminPhotoItem>
}
