import { createContext, useContext, useState } from 'react'
import { ToastContextType, ToastItem, ToastType } from './types'
import ToastContainer from './ToastContainer'

export const ToastContext = createContext<ToastContextType | undefined>(undefined)

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([])

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }

    const addToast = (message: string, type: ToastType = 'success') => {
        const id = Date.now() + Math.random()
        setToasts((prev) => [...prev, { id, message, type }])
    }

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    )
}

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext)
    if (!context) throw new Error('useToast must be used within a ToastProvider')
    return context
}

export default ToastProvider
