import type { PhotoItem, AdminPhotoItem } from '../api'
import { photoImageUrl } from '../api'
import type { ImageTileData } from '../Components/ImageTile/types'

export function formatTakenDate(p: { takenYear: number; takenMonth?: number | null; takenDay?: number | null }): string {
  if (!p.takenYear) return ''
  if (!p.takenMonth) return String(p.takenYear)
  if (!p.takenDay) return `${p.takenMonth}/${p.takenYear}`
  return `${p.takenDay}/${p.takenMonth}/${p.takenYear}`
}

export function parseTags(text?: string): string[] {
  return (text || '').split(',').map((t) => t.trim()).filter(Boolean)
}

export function photoToImageTileData(p: PhotoItem): ImageTileData {
  return {
    id: String(p.id),
    src: photoImageUrl(p.storedFileName),
    description: p.description,
    voivodeship: p.voivodeshipName ?? '',
    city: p.cityName ?? '',
    takenDate: formatTakenDate(p),
    tags: p.tags ?? [],
  }
}

export function adminPhotoToImageTileData(p: AdminPhotoItem): ImageTileData {
  const name = p.createdByDisplayName || `User #${p.createdByUserId}`
  const banned = p.createdByIsActive ? '' : ' (banned)'

  return {
    ...photoToImageTileData(p),
    creatorLabel: `Added by: ${name}${banned}`,
  }
}
