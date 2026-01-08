'use client'

import { useCallback } from 'react'
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
    <div
      role="option"
      tabIndex={0}
      aria-selected={selected}
      aria-label={`${theme.name} theme${selected ? ', selected' : ''}`}
      className={`theme-card ${selected ? 'theme-card--selected' : ''}`}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
    >
      <div className="theme-card__preview">
        <ThemeThumbnail themeId={theme.id} />
      </div>
      
      <div className="theme-card__info">
        <h3 className="theme-card__name">{theme.name}</h3>
        <p className="theme-card__description">{theme.description}</p>
      </div>

      {selected && (
        <span className="theme-card__check" aria-hidden="true">
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
        .theme-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 44px;
          padding: 16px;
          background-color: var(--color-surface, #ffffff);
          border: 2px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-lg, 8px);
          cursor: pointer;
          transition: border-color 150ms ease, background-color 150ms ease;
        }

        .theme-card:hover {
          border-color: var(--color-border-strong, #d1d5db);
          background-color: var(--color-surface-hover, #f9fafb);
        }

        .theme-card:focus-visible {
          outline: 2px solid var(--color-accent, #3b82f6);
          outline-offset: 2px;
        }

        .theme-card--selected {
          border-color: var(--color-accent, #3b82f6);
          background-color: var(--color-accent-subtle, #eff6ff);
        }

        .theme-card--selected:hover {
          border-color: var(--color-accent, #3b82f6);
          background-color: var(--color-accent-subtle, #eff6ff);
        }

        .theme-card__preview {
          width: 100%;
          aspect-ratio: 3 / 2;
          border-radius: var(--radius-md, 6px);
          overflow: hidden;
          border: 1px solid var(--color-border, #e5e7eb);
        }

        .theme-card__preview :global(.theme-thumbnail) {
          width: 100%;
          height: 100%;
          display: block;
        }

        .theme-card__info {
          flex: 1;
          min-width: 0;
        }

        .theme-card__name {
          font-size: var(--font-size-base, 16px);
          font-weight: var(--font-weight-semibold, 600);
          color: var(--color-text-primary, #1f2937);
          margin: 0 0 4px 0;
          line-height: var(--leading-snug, 1.375);
        }

        .theme-card__description {
          font-size: var(--font-size-sm, 14px);
          color: var(--color-text-muted, #6b7280);
          margin: 0;
          line-height: var(--leading-normal, 1.5);
        }

        .theme-card__check {
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

        @media (prefers-reduced-motion: reduce) {
          .theme-card {
            transition: none;
          }
        }
      `}</style>
    </div>
  )
}
