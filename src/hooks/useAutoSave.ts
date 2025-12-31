'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

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
  const [timeUntilSave, setTimeUntilSave] = useState<number | null>(null)
  
  // Refs for tracking state across renders
  const lastSavedDataRef = useRef<string>('')
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
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
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    setTimeUntilSave(null)
    
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
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
        countdownRef.current = null
      }
      setTimeUntilSave(null)
      return
    }

    // Set up the save timer
    const saveAt = Date.now() + interval
    setTimeUntilSave(interval)

    // Countdown timer for UI
    countdownRef.current = setInterval(() => {
      const remaining = Math.max(0, saveAt - Date.now())
      setTimeUntilSave(remaining)
    }, 1000)

    // Actual save timer
    saveTimeoutRef.current = setTimeout(() => {
      performSave()
    }, interval)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    }
  }, [enabled, hasUnsavedChanges, interval, performSave])

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    
    return () => {
      isMountedRef.current = false
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
      if (debounceRef.current) clearTimeout(debounceRef.current)
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
