import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Pagination from '@mui/material/Pagination'
import { ImageTile } from '../ImageTile'
import type { PhotoItem } from '../../api'
import { deletePhoto, fetchLoggedUserPhotos, PHOTOS_PAGE_SIZE } from '../../api'
import { parseTags, photoToImageTileData } from '../../helpers'
import { PhotoGrid } from '../PhotoGrid'
import { useToast } from '../ToastContainer/ToastContext'
import { Button } from '@mui/material'
import { LoggedUserFilterState } from '../LoggedUserFilters'
import { AddPhotoModal, EditPhotoModal } from '../AddEditModal'
import { DeletePhotoModal } from '../DeletePhotoModal'

interface MyArchiveImagesProps {
    filters?: LoggedUserFilterState | null
    isAddDialogOpen: boolean
    setIsAddDialogOpen: (value: boolean) => void
}

export function MyArchiveImages({ filters, isAddDialogOpen, setIsAddDialogOpen }: MyArchiveImagesProps) {
    const { addToast } = useToast();
    const [photos, setPhotos] = useState<Array<PhotoItem>>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [isError, setIsError] = useState<boolean>(false);
    const [deletedPhotoId, setDeletedPhotoId] = useState<number | null>(null)
    const [editedPhoto, setEditedPhoto] = useState<PhotoItem | null>(null)

    const reloadData = () => {
        setPage(1)
        fetchData()
    }

    const fetchData = () => {
        setLoading(true)
        setIsError(false)
        fetchLoggedUserPhotos({
            voivodeshipId: filters?.voivodeshipId,
            cityId: filters?.cityId,
            dateFrom: filters?.dateFrom,
            dateTo: filters?.dateTo,
            tags: parseTags(filters?.tagsText),
            page,
        })
            .then((r) => {
                setPhotos(r.items)
                setTotal(r.total)
            })
            .catch((e) => {
                addToast(e.message, 'danger')
                setIsError(true);
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        setPage(1)
    }, [filters])

    useEffect(() => {
        fetchData()
    }, [filters, page])

    const onDelete = () => {
        if (deletedPhotoId == null) return

        deletePhoto(deletedPhotoId)
            .then(reloadData)
            .catch((e) => addToast(e.message, 'danger'))
            .finally(() => setDeletedPhotoId(null))
    }

    const pages = Math.max(1, Math.ceil(total / PHOTOS_PAGE_SIZE))

    return (
        <>
            <PhotoGrid loading={loading} itemCount={total}>
                {photos.map((p) => (
                    <ImageTile key={p.id} data={photoToImageTileData(p)} actions={
                        <>
                            <Button size="small" onClick={() => setEditedPhoto(p)}>
                                Edit
                            </Button>
                            <Button size="small" color="error" onClick={() => setDeletedPhotoId(p.id)}>
                                Usuń
                            </Button>
                        </>
                    } />
                ))}
            </PhotoGrid>
            {!loading && !isError && total > 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <Pagination count={pages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
                </Box>
            ) : null}

            <DeletePhotoModal
                open={deletedPhotoId != null}
                onConfirm={onDelete}
                onClose={() => setDeletedPhotoId(null)}
            />
            <AddPhotoModal
                open={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                onSuccess={() => {
                    setIsAddDialogOpen(false)
                    reloadData()
                }}
            />
            {editedPhoto ? (
                <EditPhotoModal
                    photo={editedPhoto}
                    onClose={() => setEditedPhoto(null)}
                    onSuccess={() => {
                        setEditedPhoto(null)
                        reloadData()
                    }}
                />
            ) : null}
        </>
    )
}
