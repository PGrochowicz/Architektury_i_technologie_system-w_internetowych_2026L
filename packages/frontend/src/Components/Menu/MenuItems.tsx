import { Link } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { AuthUser } from '../../api'

interface MenuItemsProps {
    user: AuthUser | null,
    isAdmin: boolean
}

export const MenuItems = ({ user, isAdmin }: MenuItemsProps) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5">
                Archiwum Cyfrowe
            </Typography>
            <Button component={Link} to="/archive" color="inherit">
                Archiwum
            </Button>
            {user && (
                <Button component={Link} to="/my-archive" color="inherit">
                    Moje Archiwum
                </Button>
            )}
            {user && isAdmin && (
                <>
                    <Button component={Link} to="/admin/photos" color="inherit">
                        Archiwum Adminowskie
                    </Button>
                    <Button component={Link} to="/admin/control" color="inherit">
                        Panel Kontrolny
                    </Button>
                </>
            )}
        </Box>
    )
}
