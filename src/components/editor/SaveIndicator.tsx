'use client'

import { useSyncExternalStore } from 'react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface SaveIndicatorProps {
  status: SaveStatus
}

// External store for tracking if indicator has ever been shown
// This avoids useState/useEffect patterns that violate React hooks rules
function createHasShownStore() {
  let hasShown = false
  const listeners = new Set<() => void>()
  
  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot: () => hasShown,
    getServerSnapshot: () => false,
    setShown: () => {
      if (!hasShown) {
        hasShown = true
        listeners.forEach(l => l())
      }
    },
    reset: () => {
      hasShown = false
      listeners.forEach(l => l())
    }
  }
}

// Create store instance outside component
const hasShownStore = createHasShownStore()

export function SaveIndicator({ status }: SaveIndicatorProps) {
  const hasShown = useSyncExternalStore(
    hasShownStore.subscribe,
    hasShownStore.getSnapshot,
    hasShownStore.getServerSnapshot
  )
  
  // Update store when status becomes non-idle (in effect, not render)
  // Using a micro-task to avoid synchronous state update during render
  if (status !== 'idle' && !hasShown) {
    queueMicrotask(() => hasShownStore.setShown())
  }
  
  // Only render if we have something to show or have shown before
  const visible = status !== 'idle' || hasShown
  
  if (!visible) {
    return null
  }

  const getMessage = () => {
    switch (status) {
      case 'saving':
        return 'Saving...'
      case 'saved':
        return 'Saved'
      case 'error':
        return 'Error saving'
      default:
        return 'Saved'
    }
  }

  const getIcon = () => {
    switch (status) {
      case 'saving':
        return (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )
      case 'saved':
        return (
          <svg className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'error':
        return (
          <svg className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div 
      className={`
        flex items-center gap-2 text-sm transition-opacity duration-300
        ${status === 'idle' ? 'opacity-0' : 'opacity-100'}
      `}
    >
      {getIcon()}
      <span className={status === 'error' ? 'text-red-500' : 'text-gray-500'}>
        {getMessage()}
      </span>
    </div>
  )
}
