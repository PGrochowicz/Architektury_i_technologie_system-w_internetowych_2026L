import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { AuthUser } from '../../api'

interface MenuLoginProps {
    user: AuthUser | null,
    login: () => void,
    logout: () => void
}

export const MenuLogin = ({ user, login, logout }: MenuLoginProps) => {
    return (
        <>
            {user ? (
                <>
                    <Typography>
                        {user.name}
                    </Typography>
                    <Button color="inherit" onClick={logout}>
                        Logout
                    </Button>
                </>
            ) : (
                <Button
                    variant="contained"
                    size="medium"
                    onClick={login}
                    aria-label="Sign in with Google"
                >
                    Login z Google
                </Button>
            )}
        </>
    )
}
