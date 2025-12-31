'use client'

import { useState } from 'react'

interface PublishButtonProps {
  /** Whether there are changes to publish */
  hasChangesToPublish: boolean
  /** Callback when publish is clicked */
  onPublish: () => Promise<boolean>
  /** Optional className */
  className?: string
  /** Whether publishing is disabled */
  disabled?: boolean
}

type PublishState = 'idle' | 'publishing' | 'success' | 'error'

/**
 * Button to publish draft content to live site
 * 
 * Features:
 * - Disabled when no changes to publish
 * - Shows loading state during publish
 * - Shows success/error feedback
 * - Follows 200ms ease-out motion timing
 */
export function PublishButton({
  hasChangesToPublish,
  onPublish,
  className = '',
  disabled = false,
}: PublishButtonProps) {
  const [state, setState] = useState<PublishState>('idle')

  const handlePublish = async () => {
    if (state === 'publishing' || disabled || !hasChangesToPublish) return

    setState('publishing')
    
    try {
      const success = await onPublish()
      
      if (success) {
        setState('success')
        // Reset after showing success
        setTimeout(() => setState('idle'), 2000)
      } else {
        setState('error')
        setTimeout(() => setState('idle'), 3000)
      }
    } catch (error) {
      console.error('Publish failed:', error)
      setState('error')
      setTimeout(() => setState('idle'), 3000)
    }
  }

  const getButtonContent = () => {
    switch (state) {
      case 'publishing':
        return (
          <>
            <svg className="publish-btn-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Publishing...
          </>
        )
      case 'success':
        return (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Published!
          </>
        )
      case 'error':
        return (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            Failed - Retry
          </>
        )
      default:
        return (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Publish
          </>
        )
    }
  }

  const isDisabled = disabled || !hasChangesToPublish || state === 'publishing'

  return (
    <button
      type="button"
      onClick={handlePublish}
      disabled={isDisabled}
      className={`publish-btn publish-btn--${state} ${className}`}
      aria-disabled={isDisabled}
      title={!hasChangesToPublish ? 'No changes to publish' : 'Publish changes to live site'}
    >
      {getButtonContent()}
    </button>
  )
}
