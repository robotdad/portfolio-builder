'use client'

import React from 'react'
import { ThemeThumbnail } from '@/components/shared/ThemeThumbnail'

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
 * Card-based theme selector for portfolio settings.
 * Displays visual theme previews with name and description.
 */
export function ThemeSelector({ value, onChange, disabled = false }: ThemeSelectorProps) {
  return (
    <div className="theme-selector">
      <label className="theme-selector-label">Theme</label>
      <div className="theme-selector-cards">
        {themes.map((theme) => (
          <button
            key={theme.id}
            type="button"
            className={`theme-card ${value === theme.id ? 'theme-card--selected' : ''}`}
            onClick={() => onChange(theme.id)}
            disabled={disabled}
            aria-pressed={value === theme.id}
          >
            <div className="theme-card-preview">
              <ThemeThumbnail themeId={theme.id} />
            </div>
            <div className="theme-card-info">
              <span className="theme-card-name">{theme.name}</span>
              <span className="theme-card-description">{theme.description}</span>
            </div>
            {value === theme.id && (
              <span className="theme-card-check" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
