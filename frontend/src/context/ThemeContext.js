import React, { createContext, useContext, useMemo, useState } from 'react'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'

const ThemeModeContext = createContext()

export function AppThemeProvider({ children }) {
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  const [mode, setMode] = useState(() => localStorage.getItem('playon-theme') || (prefersDark ? 'dark' : 'light'))
  const theme = useMemo(() => createTheme({
    palette: { mode, primary: { main: '#147d78' }, secondary: { main: '#e2774d' }, background: mode === 'dark' ? { default: '#101918', paper: '#172321' } : { default: '#f5f7f6', paper: '#ffffff' } },
    typography: { fontFamily: '"DM Sans", "Helvetica Neue", sans-serif', h1: { fontWeight: 800 }, h2: { fontWeight: 800 }, h3: { fontWeight: 750 } },
    shape: { borderRadius: 10 },
    components: { MuiButton: { defaultProps: { variant: 'contained' } }, MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } } },
  }), [mode])
  const value = { mode, toggleMode: () => setMode((current) => { const next = current === 'light' ? 'dark' : 'light'; localStorage.setItem('playon-theme', next); return next }) }
  return <ThemeModeContext.Provider value={value}><ThemeProvider theme={theme}><CssBaseline />{children}</ThemeProvider></ThemeModeContext.Provider>
}

export function useThemeMode() { return useContext(ThemeModeContext) }