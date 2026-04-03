import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import type { ToastItem, ToastType } from './types'

function toastTypeToSeverity(type: ToastType): 'success' | 'error' | 'info' | 'warning' {
    switch (type) {
        case 'success':
            return 'success'
        case 'danger':
            return 'error'
        case 'info':
            return 'info'
        case 'warning':
            return 'warning'
        default:
            return 'info'
    }
}

interface ToastContainerProps {
    toasts: ToastItem[]
    removeToast: (id: number) => void
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
    return (
        <>
            {toasts.map((toast, index) => (
                <Snackbar
                    key={toast.id}
                    open
                    autoHideDuration={5000}
                    onClose={() => removeToast(toast.id)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    sx={{
                        top: `${24 + index * 72}px !important`,
                        right: { xs: 8, sm: 24 },
                        left: 'auto !important',
                        maxWidth: { xs: 'calc(100vw - 16px)', sm: 420 },
                    }}
                >
                    <Alert
                        onClose={() => removeToast(toast.id)}
                        severity={toastTypeToSeverity(toast.type)}
                        variant="filled"
                        elevation={6}
                        sx={{ width: '100%', alignItems: 'center' }}
                    >
                        {toast.message}
                    </Alert>
                </Snackbar>
            ))}
        </>
    )
}

export default ToastContainer
