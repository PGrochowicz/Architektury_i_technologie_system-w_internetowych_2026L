import { createContext, useContext, useState } from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import GlobalStyles from '@mui/material/GlobalStyles'
import { getTheme, type ThemeId } from './Themes'

type ThemeContextValue = {
  themeId: ThemeId
  setThemeId: (id: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export const useThemeId = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useThemeId must be used inside ThemeProvider')
  return ctx
}

export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const stored = window.localStorage.getItem('theme') as ThemeId | null
  const [themeId, setThemeIdState] = useState<ThemeId>(
    stored === 'light' || stored === 'dark' || stored === 'high-contrast' ? stored : 'light'
  )

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id)
    window.localStorage.setItem('theme', id)
  }

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId }}>
      <MuiThemeProvider theme={getTheme(themeId)}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            html: { height: '100%', overflow: 'hidden' },
            body: { height: '100%', overflow: 'hidden' },
            '#root': {
              height: '100%',
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            },
          }}
        />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
