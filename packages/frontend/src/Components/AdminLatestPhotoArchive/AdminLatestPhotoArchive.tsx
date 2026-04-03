import { useState } from 'react'
import {
    fetchAdminUsers,
    isAdmin,
    type AdminUser,
} from '../../api'
import { useAuth } from '../../Contexts/Auth/AuthContext'
import {
    LoggedUserFilters,
    emptyLoggedUserFilterState,
    type LoggedUserFilterState,
} from '../LoggedUserFilters'
import { AdminLatestPhotoArchiveImages } from './AdminLatestPhotoArchiveImages'
import { Box, Typography } from '@mui/material'

export function AdminLatestPhotoArchive() {
    const { user } = useAuth()
    const [users, setUsers] = useState<AdminUser[]>([])

    const [draft, setDraft] = useState<LoggedUserFilterState>(emptyLoggedUserFilterState)
    const [appliedFilters, setAppliedFitlers] = useState<LoggedUserFilterState>(emptyLoggedUserFilterState)
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
    const [appliedUserId, setAppliedUserId] = useState<number | null>(null)

    const reloadUsers = () => {
        fetchAdminUsers().then(setUsers).catch(() => setUsers([]))
    }

    const onSearch = () => {
        setAppliedFitlers(draft)
        setAppliedUserId(selectedUserId)
    }

    const clearFilters = () => {
        setSelectedUserId(null)
        setAppliedUserId(null)
        setDraft(emptyLoggedUserFilterState)
        setAppliedFitlers(emptyLoggedUserFilterState)
    }

    if (!user || !isAdmin(user)) return null

    return (
        <Box sx={{ width: '100%', flex: 1, display: 'flex', overflow: 'hidden' }}>
            <LoggedUserFilters
                value={draft}
                onChange={setDraft}
                onSearch={onSearch}
                userFilter={{
                    users: users.map((u) => ({
                        id: u.id,
                        displayName: u.displayName,
                        email: u.email,
                        isActive: u.isActive,
                    })),
                    value: selectedUserId,
                    onChange: setSelectedUserId,
                }}
                onClear={clearFilters}
            />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
                <Box
                    sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="h5" component="h1">
                        Admin archiwum
                    </Typography>
                </Box>
                <AdminLatestPhotoArchiveImages filters={appliedFilters} selectedUserId={appliedUserId} reloadUsers={reloadUsers} />
            </Box>
        </Box>
    )
}
