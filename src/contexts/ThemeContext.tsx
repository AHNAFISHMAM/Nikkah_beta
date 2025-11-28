import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react'

interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    // Always default to light mode - ignore saved preference
    return 'light'
  })

  // Initialize theme on mount - ensure light mode is applied
  useEffect(() => {
    const root = window.document.documentElement
    // Remove any existing theme classes (in case dark was set before React loaded)
    root.classList.remove('light', 'dark')
    // Force light mode on initial load
    root.classList.add('light')
    // Clear any dark mode preference from localStorage
    localStorage.setItem('theme', 'light')
  }, [])

  // Update theme when state changes
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
