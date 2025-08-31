'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'
type ThemeCtx = { theme: Theme; toggle: () => void }

const ThemeContext = createContext<ThemeCtx | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem('hanu_theme')
      if (stored === 'dark' || stored === 'light') return stored
    } catch {}
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'dark'
  })

  useEffect(() => {
    try {
      localStorage.setItem('hanu_theme', theme)
    } catch {}
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.remove('light-theme')
      root.classList.add('dark-theme')
      root.setAttribute('data-theme', 'dark')
    } else {
      root.classList.add('light-theme')
      root.classList.remove('dark-theme')
      root.setAttribute('data-theme', 'light')
    }
    // notify other components
    window.dispatchEvent(new CustomEvent('hanu-theme-change', { detail: { theme } }))
  }, [theme])

  function toggle() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}