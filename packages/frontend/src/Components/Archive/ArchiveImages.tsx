import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Pagination from '@mui/material/Pagination'
import { ImageTile } from '../ImageTile'
import type { PhotoItem } from '../../api'
import { fetchPhotos, PHOTOS_PAGE_SIZE } from '../../api'
import { parseTags, photoToImageTileData } from '../../helpers'
import { PhotoGrid } from '../PhotoGrid'
import type { ArchiveFilterState } from './ArchiveFilters'
import { useToast } from '../ToastContainer/ToastContext'

interface ArchiveImagesProps {
  voivodeshipId?: number
  filters?: ArchiveFilterState | null
}

export function ArchiveImages({ voivodeshipId, filters }: ArchiveImagesProps) {
  const { addToast } = useToast();
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    setPage(1)
  }, [voivodeshipId, filters])

  useEffect(() => {
    setLoading(true)
    setIsError(false)
    fetchPhotos(voivodeshipId, {
      cityId: filters?.cityId,
      dateFrom: filters?.dateFrom,
      dateTo: filters?.dateTo,
      tags: parseTags(filters?.tagsText),
      description: filters?.description,
      page,
    })
      .then((r) => {
        setPhotos(r.items)
        setTotal(r.total)
      })
      .catch((e) => {
        setIsError(true)
        addToast(e.message, 'danger')
      })
      .finally(() => setLoading(false))
  }, [voivodeshipId, filters, page])

  const pages = Math.max(1, Math.ceil(total / PHOTOS_PAGE_SIZE))

  return (
    <>
      <PhotoGrid loading={loading} itemCount={total}>
        {photos.map((p) => (
          <ImageTile key={p.id} data={photoToImageTileData(p)} />
        ))}
      </PhotoGrid>
      {!loading && !isError && total > 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <Pagination count={pages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
        </Box>
      ) : null}
    </>
  )
}
