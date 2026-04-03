import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Pagination from '@mui/material/Pagination'
import { ImageTile } from '../ImageTile'
import type { AdminPhotoItem, PhotoItem } from '../../api'
import { banUser, deletePhoto, fetchAdminPhotos, PHOTOS_PAGE_SIZE, unbanUser } from '../../api'
import { parseTags, photoToImageTileData } from '../../helpers'
import { PhotoGrid } from '../PhotoGrid'
import { useToast } from '../ToastContainer/ToastContext'
import { Button } from '@mui/material'
import { LoggedUserFilterState } from '../LoggedUserFilters'
import { EditPhotoModal } from '../AddEditModal'
import { useAuth } from '../../Contexts'
import { DeletePhotoModal } from '../DeletePhotoModal'
import { BanUserModal } from '../BanUserModal'

interface AdminLatestPhotoArchiveImagesProps {
    filters?: LoggedUserFilterState | null
    selectedUserId: number | null
    reloadUsers: () => void
}

export function AdminLatestPhotoArchiveImages({ filters, selectedUserId, reloadUsers }: AdminLatestPhotoArchiveImagesProps) {
    const { addToast } = useToast();
    const { user } = useAuth()

    const [photos, setPhotos] = useState<Array<AdminPhotoItem>>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [isError, setIsError] = useState<boolean>(false);
    const [deletedPhotoId, setDeletedPhotoId] = useState<number | null>(null)
    const [editedPhoto, setEditedPhoto] = useState<PhotoItem | null>(null)
    const [banTarget, setBanTarget] = useState<{ id: number; name: string; isActive: boolean } | null>(null)

    const reloadData = () => {
        setPage(1)
        fetchData()
    }

    const fetchData = () => {
        setIsError(false)
        setLoading(true)
        fetchAdminPhotos({
            userId: selectedUserId,
            voivodeshipId: filters?.voivodeshipId,
            cityId: filters?.cityId,
            dateFrom: filters?.dateFrom,
            dateTo: filters?.dateTo,
            tags: parseTags(filters?.tagsText),
            isSinceLastLoginChecked: filters?.isSinceLastLoginChecked,
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
        reloadUsers()
    }, [filters, selectedUserId, page])

    const onDelete = () => {
        if (deletedPhotoId == null) return

        deletePhoto(deletedPhotoId)
            .then(reloadData)
            .catch((e) => addToast(e.message, 'danger'))
            .finally(() => setDeletedPhotoId(null))
    }

    const handleBan = () => {
        if (banTarget == null) return
        const id = banTarget.id
        setBanTarget(null)
        banUser(id)
            .then(() => {
                reloadUsers()
                reloadData()
            })
            .catch((e) => addToast(e.message, 'danger'))
    }

    const handleUnban = () => {
        if (banTarget == null) return
        const id = banTarget.id
        setBanTarget(null)
        unbanUser(id)
            .then(() => {
                reloadUsers()
                reloadData()
            })
            .catch((e) => addToast(e.message, 'danger'))
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
                                Delete
                            </Button>
                            {p.createdByUserId !== user?.id &&
                                (p.createdByIsActive ? (
                                    <Button
                                        size="small"
                                        color="error"
                                        onClick={() => setBanTarget({ id: p.createdByUserId, name: p.createdByDisplayName, isActive: p.createdByIsActive })}
                                    >
                                        Ban
                                    </Button>
                                ) : (
                                    <Button
                                        size="small"
                                        onClick={() => setBanTarget({ id: p.createdByUserId, name: p.createdByDisplayName, isActive: p.createdByIsActive })}>
                                        Unban
                                    </Button>
                                ))}
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
            <BanUserModal
                open={banTarget != null}
                isUserActive={banTarget?.isActive ?? false}
                userName={banTarget?.name ?? ''}
                onConfirm={banTarget?.isActive ? handleBan : handleUnban}
                onClose={() => setBanTarget(null)}
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
