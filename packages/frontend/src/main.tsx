import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeContextProvider, AuthContextProvider } from './Contexts'
import App from './App'
import ToastProvider from './Components/ToastContainer/ToastContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeContextProvider>
        <AuthContextProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthContextProvider>
      </ThemeContextProvider>
    </BrowserRouter>
  </StrictMode>,
)
