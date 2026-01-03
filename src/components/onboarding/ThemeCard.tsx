'use client'

import { useCallback } from 'react'

export interface ThemeColors {
  background: string
  surface: string
  text: string
  accent: string
}

export interface Theme {
  id: string
  name: string
  description: string
  colors: ThemeColors
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
 * Selectable card displaying a theme with color swatches.
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

  const colorSwatches = [
    { color: theme.colors.background, label: 'Background' },
    { color: theme.colors.surface, label: 'Surface' },
    { color: theme.colors.text, label: 'Text' },
    { color: theme.colors.accent, label: 'Accent' },
  ]

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
      <div className="theme-card__content">
        <div className="theme-card__info">
          <h3 className="theme-card__name">{theme.name}</h3>
          <p className="theme-card__description">{theme.description}</p>
        </div>

        <div className="theme-card__swatches" aria-hidden="true">
          {colorSwatches.map(({ color, label }) => (
            <span
              key={label}
              className="theme-card__swatch"
              style={{ backgroundColor: color }}
              title={label}
            />
          ))}
        </div>
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

        .theme-card__content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        @media (min-width: 480px) {
          .theme-card__content {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
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

        .theme-card__swatches {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }

        .theme-card__swatch {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 1px solid var(--color-border, #e5e7eb);
          box-shadow: inset 0 0 0 1px hsla(0, 0%, 0%, 0.05);
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
