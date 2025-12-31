'use client'

import React from 'react'

export interface Theme {
  id: string
  name: string
  description: string
}

export const themes: Theme[] = [
  { 
    id: 'modern-minimal', 
    name: 'Modern Minimal', 
    description: 'Clean, professional, neutral - lets work shine' 
  },
  { 
    id: 'classic-elegant', 
    name: 'Classic Elegant', 
    description: 'Sophisticated, established - signals experience' 
  },
  { 
    id: 'bold-editorial', 
    name: 'Bold Editorial', 
    description: 'Dramatic, contemporary - makes a statement' 
  },
]

interface ThemeSelectorProps {
  value: string
  onChange: (themeId: string) => void
  disabled?: boolean
}

/**
 * Simple dropdown theme selector for portfolio settings.
 * Displays theme name and description, with 44px min touch target.
 */
export function ThemeSelector({ value, onChange, disabled = false }: ThemeSelectorProps) {
  const selectedTheme = themes.find(t => t.id === value) || themes[0]

  return (
    <div className="theme-selector-dropdown">
      <label htmlFor="theme-select" className="theme-selector-label">
        Theme
      </label>
      <select
        id="theme-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="theme-selector-select"
        aria-describedby="theme-description"
      >
        {themes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>
      <p id="theme-description" className="theme-selector-description">
        {selectedTheme.description}
      </p>
    </div>
  )
}
