export type ToastType = "success" | "danger" | "info" | "warning"

export interface ToastItem {
    id: number;
    type: ToastType;
    message: string;
}

export interface ToastContextType {
    addToast: (message: string, type?: ToastType) => void;
}