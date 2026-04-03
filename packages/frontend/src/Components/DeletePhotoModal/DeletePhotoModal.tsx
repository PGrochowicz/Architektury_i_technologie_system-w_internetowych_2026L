import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'

interface DeletePhotoModalProps {
    open: boolean
    onConfirm: () => void
    onClose: () => void
}

export function DeletePhotoModal({
    open,
    onConfirm,
    onClose,
}: DeletePhotoModalProps) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Usuń zdjęcie</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Operacja na zawsze usunie zdjęcie z archiwum
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Anuluj</Button>
                <Button onClick={onConfirm} variant="contained">
                    Usuń
                </Button>
            </DialogActions>
        </Dialog>
    )
}
