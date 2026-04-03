import { api } from './httpClient'
import type { GenericRowData, TagItem, VoivodeshipDetails } from './responses'

export async function fetchVoivodeships(): Promise<GenericRowData[]> {
  const res = await api.get('/voivodeships')

  if (res.status !== 200) throw new Error('Nieudało się pobrać województw')

  return res.data as GenericRowData[]
}

export async function fetchVoivodeshipDetails(voivodeshipId: number): Promise<VoivodeshipDetails> {
  const res = await api.get(`/voivodeships/details?Id=${voivodeshipId}`)

  if (res.status !== 200) throw new Error('Nieudało się pobrać województw')

  return res.data as VoivodeshipDetails
}

export async function fetchCities(voivodeshipId: number): Promise<GenericRowData[]> {
  const res = await api.get(`/cities?voivodeshipId=${voivodeshipId}`)

  if (res.status !== 200) throw new Error('Nieudało się pobrać miast')

  return res.data as GenericRowData[]
}

export async function fetchTags(): Promise<TagItem[]> {
  const res = await api.get('/tags')

  if (res.status !== 200) throw new Error('Nieudało się pobrać tagów')

  return res.data as TagItem[]
}
