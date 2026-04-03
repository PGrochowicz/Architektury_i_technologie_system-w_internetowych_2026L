import { api } from './httpClient'
import type { AdminUser, AdminCityItem } from './responses'

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const res = await api.get('/auth/admin/users')

  if (res.status === 403 || res.status === 401) throw new Error('Potrzebne uprawnienia adminowskie')
  if (res.status !== 200) throw new Error('Błąd podczas pobierania użytkowników')

  return res.data as AdminUser[]
}

export async function banUser(userId: number): Promise<void> {
  const res = await api.post(`/auth/admin/users/${userId}/ban`, {}, { headers: { 'Content-Type': 'application/json' } })

  if (res.status === 403 || res.status === 401) throw new Error('Potrzebne uprawnienia adminowskie')
  if (res.status === 404) throw new Error('Użytkownik nie istnieje')
  if (res.status !== 200) throw new Error('Nieudało się zbanować użytkownika')
}

export async function unbanUser(userId: number): Promise<void> {
  const res = await api.post(`/auth/admin/users/${userId}/unban`, {}, { headers: { 'Content-Type': 'application/json' } })

  if (res.status === 403 || res.status === 401) throw new Error('Potrzebne uprawnienia adminowskie')
  if (res.status === 404) throw new Error('Użytkownik nie istnieje')
  if (res.status !== 200) throw new Error('Nieudało się odbanować użytkownika')
}

export async function fetchAllCities(): Promise<AdminCityItem[]> {
  const res = await api.get('/cities/all')

  if (res.status === 403 || res.status === 401) throw new Error('Potrzebne uprawnienia adminowskie')
  if (res.status !== 200) throw new Error('Nieudało się pobrać miast')

  return res.data as AdminCityItem[]
}

export async function renameCity(cityId: number, name: string): Promise<void> {
  const res = await api.patch(`/cities/${cityId}`, { name })

  if (res.status === 403 || res.status === 401) throw new Error('Potrzebne uprawnienia adminowskie')
  if (res.status === 404) throw new Error('Miasto nie znalezione')
  if (res.status !== 200) throw new Error('Nieudało się zmienić nazwy miasta')
}
