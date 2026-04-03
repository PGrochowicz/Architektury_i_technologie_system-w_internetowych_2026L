export interface ArchiveFiltersPayload {
  cityId?: number | null
  dateFrom?: string
  dateTo?: string
  tags?: string[]
  description?: string
  page?: number
}

export interface CreatePhotoPayload {
  file: File
  cityId: number
  description: string
  takenYear: number | null
  takenMonth: number | null
  takenDay: number | null
  tags?: string[]
  customCityName?: string
  voivodeshipId?: number
}

export interface UpdatePhotoPayload {
  cityId: number
  description: string
  takenYear: number | null
  takenMonth: number | null
  takenDay: number | null
  file?: File | null
  tags?: string[]
  customCityName?: string
  voivodeshipId?: number
}

export interface LoggedUserFiltersPayload {
  cityId?: number | null
  voivodeshipId?: number | null
  dateFrom?: string
  dateTo?: string
  tags?: string[]
  page?: number
}

export interface AdminPhotosFiltersPayload {
  userId?: number | null
  voivodeshipId?: number | null
  cityId?: number | null
  dateFrom?: string
  dateTo?: string
  tags?: string[]
  isSinceLastLoginChecked?: boolean
  page?: number
}
