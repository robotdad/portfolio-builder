import { useEffect, useRef, useCallback } from 'react'

/**
 * Focusable element selector for focus trap
 */
const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

interface UseFocusTrapOptions {
  /** Whether the focus trap is active */
  isActive: boolean
  /** Optional ref to the container element (creates one if not provided) */
  containerRef?: React.RefObject<HTMLElement>
  /** Initial element to focus when trap activates */
  initialFocusRef?: React.RefObject<HTMLElement>
  /** Whether to restore focus when trap deactivates */
  restoreFocus?: boolean
}

interface UseFocusTrapReturn {
  /** Ref to attach to the container element */
  containerRef: React.RefObject<HTMLElement>
  /** Get all focusable elements in the container */
  getFocusableElements: () => HTMLElement[]
}

/**
 * Hook to trap focus within a container element.
 * 
 * Features:
 * - Traps Tab and Shift+Tab navigation
 * - Stores and restores focus when deactivating
 * - Focuses initial element or first focusable on activation
 * 
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   const { containerRef } = useFocusTrap({ isActive: isOpen })
 *   
 *   return isOpen ? (
 *     <div ref={containerRef} role="dialog" aria-modal="true">
 *       <button>First</button>
 *       <button onClick={onClose}>Close</button>
 *     </div>
 *   ) : null
 * }
 * ```
 */
export function useFocusTrap({
  isActive,
  containerRef: externalRef,
  initialFocusRef,
  restoreFocus = true,
}: UseFocusTrapOptions): UseFocusTrapReturn {
  const internalRef = useRef<HTMLElement>(null)
  const containerRef = externalRef || internalRef
  const previousActiveElement = useRef<HTMLElement | null>(null)

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return []
    return Array.from(containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
  }, [containerRef])

  // Store previous focus and set initial focus when activating
  useEffect(() => {
    if (!isActive) return

    // Store currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement

    // Set initial focus
    const setInitialFocus = () => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus()
      } else {
        const focusable = getFocusableElements()
        if (focusable.length > 0) {
          focusable[0].focus()
        }
      }
    }

    // Delay to allow DOM to update
    const timer = setTimeout(setInitialFocus, 10)
    return () => clearTimeout(timer)
  }, [isActive, initialFocusRef, getFocusableElements])

  // Restore focus when deactivating
  useEffect(() => {
    if (!isActive && restoreFocus && previousActiveElement.current) {
      previousActiveElement.current.focus()
      previousActiveElement.current = null
    }
  }, [isActive, restoreFocus])

  // Handle Tab key to trap focus
  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const focusable = getFocusableElements()
      if (focusable.length === 0) return

      const firstFocusable = focusable[0]
      const lastFocusable = focusable[focusable.length - 1]

      if (event.shiftKey) {
        // Shift+Tab: if on first element, go to last
        if (document.activeElement === firstFocusable) {
          event.preventDefault()
          lastFocusable.focus()
        }
      } else {
        // Tab: if on last element, go to first
        if (document.activeElement === lastFocusable) {
          event.preventDefault()
          firstFocusable.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isActive, containerRef, getFocusableElements])

  return {
    containerRef: containerRef as React.RefObject<HTMLElement>,
    getFocusableElements,
  }
}
