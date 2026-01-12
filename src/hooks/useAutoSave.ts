'use client'

import { useEffect, useRef, useCallback, useState, useSyncExternalStore } from 'react'

export type AutoSaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

interface UseAutoSaveOptions {
  /** Data to save */
  data: unknown
  /** Function to perform the save - should return true on success */
  onSave: () => Promise<boolean>
  /** Interval in milliseconds (default: 30000 = 30 seconds) */
  interval?: number
  /** Debounce delay for change detection (default: 1000ms) */
  debounceDelay?: number
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean
}

interface UseAutoSaveReturn {
  /** Current save status */
  status: AutoSaveStatus
  /** Trigger a manual save */
  saveNow: () => Promise<void>
  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean
  /** Time until next auto-save (ms), null if not pending */
  timeUntilSave: number | null
  /** Last saved timestamp */
  lastSavedAt: Date | null
}

// Timer store for countdown - avoids setState in useEffect
function createTimerStore() {
  let timeUntilSave: number | null = null
  let listeners: Array<() => void> = []
  let countdownInterval: NodeJS.Timeout | null = null
  let saveEndTime: number | null = null

  return {
    subscribe(listener: () => void) {
      listeners.push(listener)
      return () => {
        listeners = listeners.filter(l => l !== listener)
      }
    },
    getSnapshot() {
      return timeUntilSave
    },
    getServerSnapshot() {
      return null
    },
    startCountdown(duration: number) {
      this.stopCountdown()
      saveEndTime = Date.now() + duration
      timeUntilSave = duration
      listeners.forEach(l => l())
      
      countdownInterval = setInterval(() => {
        if (saveEndTime) {
          timeUntilSave = Math.max(0, saveEndTime - Date.now())
          listeners.forEach(l => l())
        }
      }, 1000)
    },
    stopCountdown() {
      if (countdownInterval) {
        clearInterval(countdownInterval)
        countdownInterval = null
      }
      saveEndTime = null
      timeUntilSave = null
      listeners.forEach(l => l())
    },
    cleanup() {
      this.stopCountdown()
      listeners = []
    }
  }
}

/**
 * Hook for auto-saving content at regular intervals
 * 
 * Features:
 * - Saves every 30 seconds (configurable)
 * - Only saves when content has changed
 * - Provides status feedback for UI
 * - Supports manual save trigger
 * - Debounces rapid changes
 */
export function useAutoSave({
  data,
  onSave,
  interval = 30000,
  debounceDelay = 1000,
  enabled = true,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [status, setStatus] = useState<AutoSaveStatus>('idle')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  
  // Timer store for countdown (avoids setState in useEffect)
  const timerStoreRef = useRef(createTimerStore())
  const timeUntilSave = useSyncExternalStore(
    timerStoreRef.current.subscribe,
    timerStoreRef.current.getSnapshot,
    timerStoreRef.current.getServerSnapshot
  )
  
  // Refs for tracking state across renders
  const lastSavedDataRef = useRef<string>('')
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  // Serialize data for comparison
  const serializedData = JSON.stringify(data)

  // Perform the actual save
  const performSave = useCallback(async () => {
    if (!isMountedRef.current) return
    
    // Don't save if there are no changes
    if (serializedData === lastSavedDataRef.current) {
      setStatus('idle')
      setHasUnsavedChanges(false)
      return
    }

    setStatus('saving')
    
    try {
      const success = await onSave()
      
      if (!isMountedRef.current) return
      
      if (success) {
        lastSavedDataRef.current = serializedData
        setLastSavedAt(new Date())
        setHasUnsavedChanges(false)
        setStatus('saved')
        
        // Reset to idle after showing "saved" feedback
        setTimeout(() => {
          if (isMountedRef.current) {
            setStatus('idle')
          }
        }, 2000)
      } else {
        setStatus('error')
      }
    } catch (error) {
      console.error('Auto-save failed:', error)
      if (isMountedRef.current) {
        setStatus('error')
      }
    }
  }, [serializedData, onSave])

  // Manual save function
  const saveNow = useCallback(async () => {
    // Clear any pending auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
    timerStoreRef.current.stopCountdown()
    
    await performSave()
  }, [performSave])

  // Detect changes with debouncing
  useEffect(() => {
    if (!enabled) return
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce change detection
    debounceRef.current = setTimeout(() => {
      const hasChanges = serializedData !== lastSavedDataRef.current
      setHasUnsavedChanges(hasChanges)
      
      if (hasChanges && status === 'idle') {
        setStatus('pending')
      }
    }, debounceDelay)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [serializedData, enabled, debounceDelay, status])

  // Auto-save timer
  useEffect(() => {
    if (!enabled || !hasUnsavedChanges) {
      // Clear timers if disabled or no changes
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = null
      }
      timerStoreRef.current.stopCountdown()
      return
    }

    // Start countdown using the timer store (no setState in effect)
    timerStoreRef.current.startCountdown(interval)

    // Actual save timer
    saveTimeoutRef.current = setTimeout(() => {
      performSave()
    }, interval)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      timerStoreRef.current.stopCountdown()
    }
  }, [enabled, hasUnsavedChanges, interval, performSave])

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    const timerStore = timerStoreRef.current
    
    return () => {
      isMountedRef.current = false
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      timerStore.cleanup()
    }
  }, [])

  // Initialize lastSavedDataRef with initial data
  useEffect(() => {
    if (lastSavedDataRef.current === '') {
      lastSavedDataRef.current = serializedData
    }
  }, [serializedData])

  return {
    status,
    saveNow,
    hasUnsavedChanges,
    timeUntilSave,
    lastSavedAt,
  }
}
