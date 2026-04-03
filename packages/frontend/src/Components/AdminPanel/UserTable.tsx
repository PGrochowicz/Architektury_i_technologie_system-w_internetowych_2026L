import { useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Pagination from '@mui/material/Pagination'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { AdminUser } from '../../api'

const PAGE_SIZE = 10

interface UserTableProps {
  users: AdminUser[]
  currentUserId: number
  onBanToggle: (user: AdminUser) => void
}

export function UserTable({ users, currentUserId, onBanToggle }: UserTableProps) {
  const [page, setPage] = useState<number>(1)
  const pages = Math.max(1, Math.ceil(users.length / PAGE_SIZE))
  const slice = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (users.length === 0) {
    return <Typography color="text.secondary" sx={{ py: 2 }}>No users found.</Typography>
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Użytkownik</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Akcja</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {slice.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.displayName || u.email || `User #${u.id}`}</TableCell>
                <TableCell>
                  <Chip
                    label={u.isActive ? 'Active' : 'Banned'}
                    size="small"
                    color={u.isActive ? 'success' : 'default'}
                    variant={u.isActive ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell align="right">
                  {u.id !== currentUserId && (
                    <Button
                      size="small"
                      color={u.isActive ? 'error' : 'primary'}
                      onClick={() => onBanToggle(u)}
                    >
                      {u.isActive ? 'Ban' : 'Unban'}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
        <Pagination count={pages} page={page} onChange={(_, p) => setPage(p)} size="small" />
      </Box>
    </>
  )
}
