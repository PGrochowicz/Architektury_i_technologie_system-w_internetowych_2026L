import { useEffect, useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Pagination from '@mui/material/Pagination'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { fetchAllCities, renameCity, type AdminCityItem } from '../../api'
import { useToast } from '../ToastContainer/ToastContext'
import { Button } from '@mui/material'

const PAGE_SIZE = 10

export function CityTable() {
  const { addToast } = useToast()
  const [cities, setCities] = useState<Array<AdminCityItem>>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    setLoading(true)
    fetchAllCities()
      .then(setCities)
      .catch((e) => addToast(e.message, 'danger'))
      .finally(() => setLoading(false))
  }, [])

  const startEdit = (city: AdminCityItem) => {
    setEditId(city.id)
    setEditName(city.name)
  }

  const cancelEdit = () => {
    setEditId(null)
    setEditName('')
  }

  const saveEdit = () => {
    if (editId == null) { cancelEdit(); return }
    const id = editId
    const trimmed = editName.trim()
    if (trimmed.length === 0) {
      addToast("Miasto musi mieć przynajmniej jedną litere w nazwie", 'danger')
      return
    }

    cancelEdit()
    renameCity(id, trimmed)
      .then(() => {
        setCities((prev) => prev.map((c) => c.id === id ? { ...c, name: trimmed } : c))
        addToast("Udało się zmienić nazwe miasta", 'success')
      })
      .catch((e) => addToast(e.message, 'danger'))
  }

  const handleButtonClick = (city: AdminCityItem) => {
    if (editId === city.id) {
      saveEdit()
    } else {
      startEdit(city)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  if (cities.length === 0) {
    return <Typography color="text.secondary" sx={{ py: 2 }}>No cities found.</Typography>
  }

  const pages = Math.max(1, Math.ceil(cities.length / PAGE_SIZE))
  const slice = cities.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>City name</TableCell>
              <TableCell>Voivodeship</TableCell>
              <TableCell>Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {slice.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  {editId === c.id ? (
                    <TextField
                      size="small"
                      value={editName}
                      autoFocus
                    />
                  ) : (
                    <Box
                      component="span"
                    >
                      {c.name}
                    </Box>
                  )}
                </TableCell>
                <TableCell>{c.voivodeshipName}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleButtonClick(c)}
                  >
                    {editId !== c.id ? 'Edytuj' : 'Zapisz'}
                  </Button>
                  {editId !== c.id ? null :
                    <Button
                      size="small"
                      color='error'
                      onClick={cancelEdit}
                    >
                      Anuluj
                    </Button>
                  }
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
