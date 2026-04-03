import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import { useAuth } from '../../Contexts/Auth/AuthContext'
import { useToast } from '../ToastContainer/ToastContext'

export function AuthCallback() {
  const { addToast } = useToast()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get('error')
    if (error) {
      if (error === 'account_disabled') addToast('Konto zablokowane', 'danger')
      else addToast('Coś poszło nie tak podczas logowania', 'danger')
      navigate('/archive', { replace: true })
      return
    }

    refreshUser()
      .then(() => navigate('/archive', { replace: true }))
      .catch(() => {
        addToast('Nie można zweryfikować sesji', 'danger')
        navigate('/archive', { replace: true })
      })
  }, [navigate, refreshUser])

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 2 }}>Signing in…</Box>
  )
}
