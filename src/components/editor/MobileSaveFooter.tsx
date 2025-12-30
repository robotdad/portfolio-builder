'use client'

import { useEffect, useState } from 'react'
import type { SaveStatus } from './SaveIndicator'

interface MobileSaveFooterProps {
  /** Whether form has unsaved changes */
  isDirty: boolean
  /** Current save status */
  saveStatus: SaveStatus
  /** Whether save is in progress */
  isSaving: boolean
  /** Submit handler */
  onSave: () => void
  /** Button label when creating new */
  createLabel?: string
  /** Button label when updating existing */
  updateLabel?: string
  /** Whether this is an existing item (vs new) */
  isExisting: boolean
}

/**
 * MobileSaveFooter - Sticky save action for mobile editing
 * 
 * Design decisions (per design consultation):
 * - Only shows on mobile (<768px)
 * - Fixed to viewport bottom with safe area padding
 * - Shows dirty/clean state to reduce save anxiety
 * - 64px height with 48px touch target button
 */
export function MobileSaveFooter({
  isDirty,
  saveStatus,
  isSaving,
  onSave,
  createLabel = 'Create',
  updateLabel = 'Save Changes',
  isExisting,
}: MobileSaveFooterProps) {
  const [isMobile, setIsMobile] = useState(false)

  // Only show on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Don't render on desktop
  if (!isMobile) {
    return null
  }

  const getStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...'
      case 'saved':
        return 'All changes saved'
      case 'error':
        return 'Save failed'
      default:
        return isDirty ? 'Unsaved changes' : 'All changes saved'
    }
  }

  const getStatusClass = () => {
    if (saveStatus === 'error') return 'error'
    if (saveStatus === 'saving') return 'saving'
    if (saveStatus === 'saved') return 'saved'
    return isDirty ? 'dirty' : 'clean'
  }

  const buttonLabel = isExisting ? updateLabel : createLabel
  const isDisabled = isSaving || (!isDirty && saveStatus !== 'error')

  return (
    <div className="mobile-save-footer">
      <div className={`mobile-save-status ${getStatusClass()}`}>
        {saveStatus === 'saving' && (
          <svg 
            className="mobile-save-spinner" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
        )}
        {saveStatus === 'saved' && (
          <svg 
            className="mobile-save-icon" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {saveStatus === 'error' && (
          <svg 
            className="mobile-save-icon" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4m0 4h.01" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <span>{getStatusText()}</span>
      </div>
      <button
        type="button"
        className="mobile-save-btn"
        onClick={onSave}
        disabled={isDisabled}
        aria-label={isSaving ? 'Saving...' : buttonLabel}
      >
        {isSaving ? 'Saving...' : saveStatus === 'error' ? 'Retry' : buttonLabel}
      </button>
    </div>
  )
}
