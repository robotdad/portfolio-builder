'use client'

import { useCallback } from 'react'
import { Card, CardBody, CardTitle, CardDescription } from '@/components/ui'
import { ThemeThumbnail } from '@/components/shared/ThemeThumbnail'

export interface Theme {
  id: string
  name: string
  description: string
}

interface ThemeCardProps {
  /** Theme data to display */
  theme: Theme
  /** Whether this theme is currently selected */
  selected: boolean
  /** Callback when theme is selected */
  onSelect: () => void
}

/**
 * Selectable card displaying a theme with visual thumbnail preview.
 * Matches the Settings page visual style for consistency.
 * Keyboard accessible with proper ARIA attributes.
 */
export function ThemeCard({ theme, selected, onSelect }: ThemeCardProps) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onSelect()
      }
    },
    [onSelect]
  )

  return (
    <Card
      variant="interactive"
      isSelected={selected}
      role="option"
      tabIndex={0}
      aria-selected={selected}
      aria-label={`${theme.name} theme${selected ? ', selected' : ''}`}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
    >
      {/* Theme preview area */}
      <CardBody noPadding>
        <div className="theme-preview">
          <ThemeThumbnail themeId={theme.id} />
        </div>
      </CardBody>

      {/* Theme info */}
      <CardBody>
        <CardTitle>{theme.name}</CardTitle>
        <CardDescription>{theme.description}</CardDescription>
      </CardBody>

      {/* Selected checkmark indicator */}
      {selected && (
        <span className="theme-check" aria-hidden="true">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.667 5L7.5 14.167 3.333 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}

      <style jsx>{`
        .theme-preview {
          width: 100%;
          aspect-ratio: 3 / 2;
          border-radius: var(--radius-md, 6px);
          overflow: hidden;
          border: 1px solid var(--color-border, #e5e7eb);
          margin: var(--space-4, 16px);
          margin-bottom: 0;
        }

        .theme-preview :global(.theme-thumbnail) {
          width: 100%;
          height: 100%;
          display: block;
        }

        .theme-check {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          color: var(--color-accent, #3b82f6);
        }
      `}</style>
    </Card>
  )
}
