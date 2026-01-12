'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'

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

// Icons as simple components
const PublishIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
)

const SuccessIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ErrorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)

/**
 * Button to publish draft content to live site
 *
 * Features:
 * - Disabled when no changes to publish
 * - Shows loading state during publish (via Button primitive)
 * - Shows success/error feedback with auto-reset
 * - Uses Button primitive for consistent styling
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

  const isDisabled = disabled || !hasChangesToPublish
  const isPublishing = state === 'publishing'

  // Variant: destructive for error, primary otherwise
  const variant = state === 'error' ? 'destructive' : 'primary'

  // Left icon based on state (undefined during loading - Button shows spinner)
  const leftIcon = (() => {
    switch (state) {
      case 'success':
        return <SuccessIcon />
      case 'error':
        return <ErrorIcon />
      case 'idle':
        return <PublishIcon />
      default:
        return undefined
    }
  })()

  // Button text based on state
  const label = (() => {
    switch (state) {
      case 'publishing':
        return 'Publishing...'
      case 'success':
        return 'Published!'
      case 'error':
        return 'Failed - Retry'
      default:
        return 'Publish'
    }
  })()

  return (
    <Button
      type="button"
      variant={variant}
      onClick={handlePublish}
      disabled={isDisabled}
      isLoading={isPublishing}
      leftIcon={leftIcon}
      className={className}
      aria-disabled={isDisabled || isPublishing}
      title={!hasChangesToPublish ? 'No changes to publish' : 'Publish changes to live site'}
      data-testid="publish-btn"
    >
      {label}
    </Button>
  )
}
