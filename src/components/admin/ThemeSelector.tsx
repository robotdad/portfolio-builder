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

// Simple SVG thumbnails showing theme visual styles
function ThemeThumbnail({ themeId }: { themeId: string }) {
  if (themeId === 'modern-minimal') {
    // Sans-serif typography, neutral grays, clean spacing
    return (
      <svg viewBox="0 0 120 80" className="theme-thumbnail">
        {/* Header - clean sans-serif style */}
        <rect x="10" y="8" width="40" height="3" rx="0.5" fill="currentColor" opacity="0.3" />
        {/* Body text blocks - geometric and clean */}
        <rect x="10" y="20" width="100" height="2" rx="0.5" fill="currentColor" opacity="0.2" />
        <rect x="10" y="24" width="95" height="2" rx="0.5" fill="currentColor" opacity="0.2" />
        <rect x="10" y="28" width="100" height="2" rx="0.5" fill="currentColor" opacity="0.2" />
        {/* Subheading */}
        <rect x="10" y="38" width="35" height="2.5" rx="0.5" fill="currentColor" opacity="0.3" />
        {/* More body text */}
        <rect x="10" y="46" width="100" height="2" rx="0.5" fill="currentColor" opacity="0.2" />
        <rect x="10" y="50" width="85" height="2" rx="0.5" fill="currentColor" opacity="0.2" />
        <rect x="10" y="54" width="100" height="2" rx="0.5" fill="currentColor" opacity="0.2" />
        {/* Clean geometric accent */}
        <circle cx="100" cy="68" r="6" fill="currentColor" opacity="0.15" />
      </svg>
    )
  }
  
  if (themeId === 'classic-elegant') {
    // Serif typography, warm palette, traditional spacing
    return (
      <svg viewBox="0 0 120 80" className="theme-thumbnail">
        {/* Serif header with decorative elements */}
        <rect x="10" y="8" width="2" height="8" fill="currentColor" opacity="0.25" />
        <rect x="14" y="8" width="50" height="4" rx="0.5" fill="currentColor" opacity="0.35" />
        <rect x="14" y="13" width="30" height="2" rx="0.5" fill="currentColor" opacity="0.2" />
        <rect x="108" y="8" width="2" height="8" fill="currentColor" opacity="0.25" />
        {/* Traditional body text with serifs */}
        <rect x="18" y="24" width="84" height="2" rx="0.3" fill="currentColor" opacity="0.25" />
        <rect x="18" y="28" width="88" height="2" rx="0.3" fill="currentColor" opacity="0.25" />
        <rect x="18" y="32" width="82" height="2" rx="0.3" fill="currentColor" opacity="0.25" />
        {/* Drop cap effect */}
        <rect x="10" y="24" width="6" height="10" rx="0.5" fill="currentColor" opacity="0.3" />
        {/* Elegant divider */}
        <line x1="30" y1="44" x2="90" y2="44" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
        <circle cx="60" cy="44" r="2" fill="currentColor" opacity="0.25" />
        {/* More traditional text */}
        <rect x="18" y="52" width="84" height="2" rx="0.3" fill="currentColor" opacity="0.25" />
        <rect x="18" y="56" width="88" height="2" rx="0.3" fill="currentColor" opacity="0.25" />
        <rect x="18" y="60" width="75" height="2" rx="0.3" fill="currentColor" opacity="0.25" />
        {/* Corner ornament */}
        <path d="M 100 68 L 105 72 L 100 76 M 105 72 L 110 72" stroke="currentColor" strokeWidth="0.8" opacity="0.2" fill="none" />
      </svg>
    )
  }
  
  // Bold Editorial - large headlines, high contrast, magazine-style
  return (
    <svg viewBox="0 0 120 80" className="theme-thumbnail">
      {/* Massive bold headline */}
      <rect x="8" y="8" width="60" height="8" rx="0.5" fill="currentColor" opacity="0.5" />
      <rect x="8" y="18" width="75" height="8" rx="0.5" fill="currentColor" opacity="0.5" />
      {/* High contrast subheading */}
      <rect x="8" y="32" width="45" height="3" rx="0.5" fill="currentColor" opacity="0.35" />
      {/* Magazine-style column layout */}
      <rect x="8" y="40" width="48" height="1.5" rx="0.3" fill="currentColor" opacity="0.25" />
      <rect x="8" y="43" width="48" height="1.5" rx="0.3" fill="currentColor" opacity="0.25" />
      <rect x="8" y="46" width="48" height="1.5" rx="0.3" fill="currentColor" opacity="0.25" />
      <rect x="8" y="49" width="45" height="1.5" rx="0.3" fill="currentColor" opacity="0.25" />
      {/* Second column */}
      <rect x="62" y="40" width="48" height="1.5" rx="0.3" fill="currentColor" opacity="0.25" />
      <rect x="62" y="43" width="48" height="1.5" rx="0.3" fill="currentColor" opacity="0.25" />
      <rect x="62" y="46" width="48" height="1.5" rx="0.3" fill="currentColor" opacity="0.25" />
      <rect x="62" y="49" width="43" height="1.5" rx="0.3" fill="currentColor" opacity="0.25" />
      {/* Bold pull quote or accent */}
      <rect x="8" y="58" width="104" height="16" rx="1" fill="currentColor" opacity="0.15" />
      <rect x="15" y="63" width="40" height="3" rx="0.5" fill="currentColor" opacity="0.4" />
      <rect x="15" y="68" width="30" height="2" rx="0.3" fill="currentColor" opacity="0.3" />
    </svg>
  )
}
