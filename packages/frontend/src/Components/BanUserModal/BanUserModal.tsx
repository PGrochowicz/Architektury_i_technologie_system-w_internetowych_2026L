import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'

interface BanUserModalProps {
    open: boolean
    isUserActive: boolean
    userName: string
    onConfirm: () => void
    onClose: () => void
}

export function BanUserModal({
    open,
    isUserActive,
    userName,
    onConfirm,
    onClose,
}: BanUserModalProps) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{isUserActive ? 'Ban user' : 'Unban user'}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {
                        isUserActive
                            ? `Zbanuj "${userName}"? Ich kolekcja będzie ukryta w archiwum oraz nie będą mogli się oni zalogować.`
                            : `Unban "${userName}"? Ich zdjęcia będą znowu widoczne w kolekcji`
                    }
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Anuluj</Button>
                <Button onClick={onConfirm} variant="contained">
                    {isUserActive ? 'Ban user' : 'Unban'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
