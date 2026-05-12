import { useEffect, useState } from 'react'

const THEME_KEY = 'tsh:theme'

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  return window.localStorage.getItem(THEME_KEY) || 'light'
}

function applyTheme(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
    window.localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  return {
    theme,
    toggleTheme() {
      setTheme((value) => (value === 'dark' ? 'light' : 'dark'))
    },
  }
}
