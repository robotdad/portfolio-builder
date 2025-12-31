'use client'

import { useEffect, useState } from 'react'

export type DraftStatus = 'draft' | 'published' | 'saving' | 'saved' | 'error'

interface DraftIndicatorProps {
  /** Current status */
  status: DraftStatus
  /** Whether there are unpublished changes */
  hasUnpublishedChanges: boolean
  /** Optional className for styling */
  className?: string
}

/**
 * Visual indicator showing draft/published status
 * 
 * States:
 * - Draft (yellow): Content has been edited but not published
 * - Published (green): Content matches published version
 * - Saving... (blue): Currently saving draft
 * - Saved (green, temporary): Just saved successfully
 * - Error (red): Save failed
 */
export function DraftIndicator({ 
  status, 
  hasUnpublishedChanges,
  className = '' 
}: DraftIndicatorProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  // Trigger animation on status change
  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 200)
    return () => clearTimeout(timer)
  }, [status])

  const getStatusConfig = () => {
    // Saving state takes priority
    if (status === 'saving') {
      return {
        label: 'Saving...',
        className: 'draft-indicator--saving',
        icon: (
          <svg className="draft-indicator-spinner" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ),
      }
    }

    if (status === 'saved') {
      return {
        label: 'Saved',
        className: 'draft-indicator--saved',
        icon: (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ),
      }
    }

    if (status === 'error') {
      return {
        label: 'Save failed',
        className: 'draft-indicator--error',
        icon: (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        ),
      }
    }

    // Draft vs Published based on unpublished changes
    if (hasUnpublishedChanges) {
      return {
        label: 'Draft',
        className: 'draft-indicator--draft',
        icon: (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        ),
      }
    }

    return {
      label: 'Published',
      className: 'draft-indicator--published',
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    }
  }

  const config = getStatusConfig()

  return (
    <div 
      className={`draft-indicator ${config.className} ${isAnimating ? 'draft-indicator--animating' : ''} ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="draft-indicator-icon">{config.icon}</span>
      <span className="draft-indicator-label">{config.label}</span>
    </div>
  )
}
