'use client'

import {
  useEffect,
  useRef,
  useCallback,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

// Subscription for useSyncExternalStore (no-op since we only need client detection)
const emptySubscribe = () => () => {}

// ============================================================================
// Types
// ============================================================================

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}

interface BottomSheetItemProps {
  label: string
  icon?: ReactNode
  description?: string
  onSelect: () => void
  disabled?: boolean
}

// ============================================================================
// BottomSheetItem Component
// ============================================================================

function BottomSheetItem({
  label,
  icon,
  description,
  onSelect,
  disabled = false,
}: BottomSheetItemProps) {
  const handleClick = () => {
    if (!disabled) {
      onSelect()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault()
      onSelect()
    }
  }

  return (
    <button
      type="button"
      className={`bottom-sheet-item ${disabled ? 'bottom-sheet-item--disabled' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      role="menuitem"
      aria-disabled={disabled}
    >
      {icon && <span className="bottom-sheet-item__icon" aria-hidden="true">{icon}</span>}
      <span className="bottom-sheet-item__content">
        <span className="bottom-sheet-item__label">{label}</span>
        {description && (
          <span className="bottom-sheet-item__description">{description}</span>
        )}
      </span>

      <style jsx>{`
        .bottom-sheet-item {
          display: flex;
          align-items: center;
          gap: var(--space-3, 12px);
          width: 100%;
          min-height: 48px;
          padding: var(--space-3, 12px) var(--space-4, 16px);
          background: transparent;
          border: none;
          border-radius: var(--radius-lg, 8px);
          text-align: left;
          cursor: pointer;
          transition: background-color var(--transition-fast);
        }

        .bottom-sheet-item:hover:not(:disabled) {
          background-color: var(--color-surface-hover, hsla(0, 0%, 0%, 0.05));
        }

        .bottom-sheet-item:focus-visible {
          outline: 2px solid var(--color-accent, #3b82f6);
          outline-offset: -2px;
        }

        .bottom-sheet-item:active:not(:disabled) {
          background-color: var(--color-surface-active, hsla(0, 0%, 0%, 0.08));
        }

        .bottom-sheet-item--disabled {
          cursor: not-allowed;
          opacity: var(--disabled-opacity);
        }

        .bottom-sheet-item__icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          color: var(--color-text-secondary, #6b7280);
        }

        .bottom-sheet-item__content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .bottom-sheet-item__label {
          font-size: var(--font-size-base, 16px);
          font-weight: var(--font-weight-medium, 500);
          color: var(--color-text-primary, #1f2937);
          line-height: var(--leading-snug, 1.375);
        }

        .bottom-sheet-item__description {
          font-size: var(--font-size-sm, 14px);
          color: var(--color-text-muted, #6b7280);
          line-height: var(--leading-normal, 1.5);
        }
      `}</style>
    </button>
  )
}

// ============================================================================
// Helpers
// ============================================================================

/** Read a transition token's duration in ms from the current theme */
function getTransitionMs(token: string, fallback: number): number {
  if (typeof window === 'undefined') return fallback
  return parseInt(getComputedStyle(document.documentElement).getPropertyValue(token), 10) || fallback
}

// ============================================================================
// BottomSheet Component
// ============================================================================

function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}: BottomSheetProps) {
  // Use useSyncExternalStore for hydration-safe client detection
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
  // Track closing state for exit animation (set in event handler, not effect)
  const [isClosing, setIsClosing] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Store focused element when opening (no state change in effect)
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Focus trap
  useEffect(() => {
    if (!isOpen || !sheetRef.current) return

    const sheet = sheetRef.current
    const focusableElements = sheet.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    const firstFocusable = focusableElements[0]
    const lastFocusable = focusableElements[focusableElements.length - 1]

    // Focus first element
    firstFocusable?.focus()

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable?.focus()
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [isOpen])

  // Restore focus on close
  useEffect(() => {
    if (!isOpen && previousActiveElement.current) {
      previousActiveElement.current.focus()
      previousActiveElement.current = null
    }
  }, [isOpen])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  // Handle close with animation - set closing state in event handler (not effect)
  const handleClose = useCallback(() => {
    setIsClosing(true)
    // Wait for animation to complete (synced with --transition-base token)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, getTransitionMs('--transition-base', 250))
  }, [onClose])

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  if (!mounted || !isOpen) return null

  const content = (
    <div
      className={`bottom-sheet-backdrop ${isClosing ? 'bottom-sheet-backdrop--closing' : 'bottom-sheet-backdrop--entering'}`}
      onClick={handleBackdropClick}
      aria-hidden="true"
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`bottom-sheet ${isClosing ? 'bottom-sheet--closing' : 'bottom-sheet--entering'} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="bottom-sheet__handle" aria-hidden="true" />

        {/* Header */}
        <div className="bottom-sheet__header">
          <h2 className="bottom-sheet__title">{title}</h2>
        </div>

        {/* Content */}
        <div className="bottom-sheet__content" role="menu">
          {children}
        </div>

        {/* Cancel button */}
        <div className="bottom-sheet__footer">
          <button
            type="button"
            className="bottom-sheet__cancel"
            onClick={handleClose}
          >
            Cancel
          </button>
        </div>
      </div>

      <style jsx>{`
        .bottom-sheet-backdrop {
          position: fixed;
          inset: 0;
          background: var(--overlay-bg);
          z-index: var(--z-modal-backdrop, 400);
        }

        .bottom-sheet-backdrop--entering {
          animation: backdropEnter var(--transition-base) forwards;
        }

        .bottom-sheet-backdrop--closing {
          animation: backdropExit var(--transition-base) forwards;
        }

        @keyframes backdropEnter {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes backdropExit {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .bottom-sheet-backdrop--entering,
          .bottom-sheet-backdrop--closing {
            animation: none;
            opacity: 1;
          }
        }

        .bottom-sheet {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--color-surface, #ffffff);
          border-radius: 16px 16px 0 0;
          max-height: 80vh;
          padding-bottom: env(safe-area-inset-bottom, 0);
          z-index: var(--z-modal, 500);
          display: flex;
          flex-direction: column;
          box-shadow: 0 -4px 20px hsla(0, 0%, 0%, 0.15);
        }

        .bottom-sheet--entering {
          animation: sheetEnter var(--transition-base) forwards;
        }

        .bottom-sheet--closing {
          animation: sheetExit var(--transition-base) forwards;
        }

        @keyframes sheetEnter {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        @keyframes sheetExit {
          from { transform: translateY(0); }
          to { transform: translateY(100%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .bottom-sheet--entering,
          .bottom-sheet--closing {
            animation: none;
            transform: translateY(0);
          }
        }

        .bottom-sheet__handle {
          width: 36px;
          height: 4px;
          background: var(--color-border-strong, #cbd5e1);
          border-radius: 2px;
          margin: 12px auto 16px;
          flex-shrink: 0;
        }

        .bottom-sheet__header {
          padding: 0 var(--space-4, 16px) var(--space-3, 12px);
          border-bottom: 1px solid var(--color-border, #e5e7eb);
          flex-shrink: 0;
        }

        .bottom-sheet__title {
          font-size: var(--font-size-lg, 18px);
          font-weight: var(--font-weight-semibold, 600);
          color: var(--color-text-primary, #1f2937);
          margin: 0;
          text-align: center;
        }

        .bottom-sheet__content {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-2, 8px) var(--space-2, 8px);
          -webkit-overflow-scrolling: touch;
        }

        .bottom-sheet__footer {
          padding: var(--space-3, 12px) var(--space-4, 16px);
          border-top: 1px solid var(--color-border, #e5e7eb);
          flex-shrink: 0;
        }

        .bottom-sheet__cancel {
          display: block;
          width: 100%;
          min-height: 48px;
          padding: var(--space-3, 12px) var(--space-4, 16px);
          background: var(--color-surface-secondary, #f3f4f6);
          border: none;
          border-radius: var(--radius-lg, 8px);
          font-size: var(--font-size-base, 16px);
          font-weight: var(--font-weight-semibold, 600);
          color: var(--color-text-primary, #1f2937);
          cursor: pointer;
          transition: background-color var(--transition-fast);
        }

        .bottom-sheet__cancel:hover {
          background-color: var(--color-surface-hover, #e5e7eb);
        }

        .bottom-sheet__cancel:focus-visible {
          outline: 2px solid var(--color-accent, #3b82f6);
          outline-offset: 2px;
        }

        .bottom-sheet__cancel:active {
          background-color: var(--color-surface-active, #d1d5db);
        }
      `}</style>
    </div>
  )

  return createPortal(content, document.body)
}

// ============================================================================
// Exports
// ============================================================================

export { BottomSheet, BottomSheetItem }
export type { BottomSheetProps, BottomSheetItemProps }
