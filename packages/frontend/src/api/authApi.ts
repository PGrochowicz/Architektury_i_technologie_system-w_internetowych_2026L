import { api } from './httpClient'
import type { AuthUser } from './responses'

export function isAdmin(user: AuthUser | null): boolean {
  return Boolean(user?.roles?.includes('Admin'))
}

export async function fetchAuthMe(): Promise<AuthUser | null> {
  const res = await api.get('/auth/me')

  if (res.status === 401) return null
  if (res.status !== 200) return null

  return res.data as AuthUser
}

export async function logoutAuth(): Promise<void> {
  await api.post('/auth/logout')
}
