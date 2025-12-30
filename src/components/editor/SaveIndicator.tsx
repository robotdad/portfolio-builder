'use client'

import { useEffect, useState } from 'react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface SaveIndicatorProps {
  status: SaveStatus
  /** Optional error message to display */
  errorMessage?: string
}

/**
 * SaveIndicator - Visual feedback for save operations
 * 
 * Features:
 * - Quick visual feedback (<200ms animation)
 * - Clear status states (idle, saving, saved, error)
 * - Accessible announcements via aria-live
 * - Auto-hides after successful save
 */
export function SaveIndicator({ status, errorMessage }: SaveIndicatorProps) {
  const [visible, setVisible] = useState(false)

  // Show indicator when status changes from idle
  useEffect(() => {
    if (status !== 'idle') {
      setVisible(true)
    }

    // Auto-hide after successful save
    if (status === 'saved') {
      const timer = setTimeout(() => {
        setVisible(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [status])

  if (!visible && status === 'idle') {
    return null
  }

  const getStatusText = () => {
    switch (status) {
      case 'saving':
        return 'Saving...'
      case 'saved':
        return 'Saved'
      case 'error':
        return errorMessage || 'Failed to save'
      default:
        return ''
    }
  }

  const getIcon = () => {
    switch (status) {
      case 'saving':
        return (
          <svg 
            className="save-indicator-icon" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
        )
      case 'saved':
        return (
          <svg 
            className="save-indicator-icon" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )
      case 'error':
        return (
          <svg 
            className="save-indicator-icon" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4m0 4h.01" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div 
      className={`save-indicator ${status}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {getIcon()}
      <span>{getStatusText()}</span>
    </div>
  )
}
