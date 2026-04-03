export interface AuthUser {
  id: number
  sub: string
  email: string | null
  name: string | null
  roles: string[]
}

export interface PhotoItem {
  id: number
  cityId: number
  description: string
  storedFileName: string
  takenYear: number
  takenMonth: number | null
  takenDay: number | null
  voivodeshipName: string
  cityName: string
  tags?: string[]
}

export interface AdminPhotoItem extends PhotoItem {
  createdByUserId: number
  createdByDisplayName: string
  createdByIsActive: boolean
}

export interface Paginated<T> {
  items: T[]
  total: number
}

export interface GenericRowData {
  id: number
  name: string
}

export interface VoivodeshipDetails {
  voivodeship: { id: number; name: string }
  cities: Array<{ id: number; name: string }>
}

export interface AdminUser {
  id: number
  email: string
  displayName: string
  isActive: boolean
  photoCount: number
}

export interface TagItem {
  id: number
  name: string
}

export interface AdminCityItem {
  id: number
  name: string
  voivodeshipName: string
}
