import { createTheme, type Theme } from '@mui/material/styles'

export type ThemeId = 'light' | 'dark' | 'high-contrast'

const lightPalette = {
  mode: 'light' as const,
  primary: { main: '#005a9c', contrastText: '#ffffff' },
  background: { default: '#ffffff', paper: '#f5f5f5' },
  text: { primary: '#1a1a1a', secondary: '#333333', disabled: '#666666' },
  divider: '#2d2d2d',
}

const darkPalette = {
  mode: 'dark' as const,
  primary: { main: '#6eb3f7' },
  background: { default: '#1e1e1e', paper: '#2d2d2d' },
  text: { primary: '#e8e8e8', secondary: '#b0b0b0', disabled: '#a0a0a0' },
  error: { main: '#ff8a80' },
}

const highContrastPalette = {
  mode: 'light' as const,
  primary: { main: '#000000' },
  background: { default: '#ffffff', paper: '#ffffff' },
  text: { primary: '#000000', secondary: '#000000', disabled: '#595959' },
  divider: '#000000',
  action: { active: '#000000', hover: 'rgba(0,0,0,0.08)' },
}

export function getTheme(mode: ThemeId): Theme {
  const palette =
    mode === 'light' ? lightPalette : mode === 'dark' ? darkPalette : highContrastPalette

  return createTheme({
    palette,
    typography: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    components: {
      MuiInputLabel: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.text.primary,
            '&.Mui-focused': { color: theme.palette.text.primary },
            '&.Mui-disabled': { color: theme.palette.text.disabled },
          }),
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider || theme.palette.text.primary },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.text.primary },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: 2 },
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none' },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: ({ theme }) => ({
            color: theme.palette.text.primary,
            WebkitTextFillColor: theme.palette.text.primary,
            '&.Mui-disabled': {
              color: theme.palette.text.disabled,
              WebkitTextFillColor: theme.palette.text.disabled,
            },
          }),
          nativeInput: ({ theme }) => ({
            position: 'absolute',
            left: 0,
            top: 0,
            width: '1px',
            height: '1px',
            margin: 0,
            padding: 0,
            border: 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            clip: 'rect(0 0 0 0)',
            clipPath: 'inset(50%)',
            pointerEvents: 'none',
            opacity: 1,
            color:
              theme.palette.mode === 'dark'
                ? '#ffffff'
                : '#000000',
            backgroundColor:
              theme.palette.mode === 'dark'
                ? '#000000'
                : '#ffffff',

            WebkitTextFillColor:
              theme.palette.mode === 'dark'
                ? '#ffffff'
                : '#000000',
          }),
          icon: ({ theme }) => ({
            color: theme.palette.text.secondary,
            '&.Mui-disabled': { color: theme.palette.text.disabled },
          }),
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            textTransform: 'none',
            color: theme.palette.text.primary,
            borderColor: theme.palette.divider,
            '&.Mui-selected': {
              color: theme.palette.primary.contrastText,
              backgroundColor: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
            },
          }),
        },
      },
    },
  })
}
