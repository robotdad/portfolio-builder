'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'

// ============================================================================
// Types
// ============================================================================

interface ToastAction {
  label: string
  onClick: () => void
}

interface ToastProps {
  id: string
  message: string
  type: 'success' | 'error'
  action?: ToastAction
  duration?: number
  onDismiss: (id: string) => void
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastProps, 'id' | 'onDismiss'>) => string
  dismissToast: (id: string) => void
}

interface ToastData extends Omit<ToastProps, 'onDismiss'> {
  createdAt: number
}

// ============================================================================
// Context
// ============================================================================

const ToastContext = createContext<ToastContextValue | null>(null)

// ============================================================================
// Toast Component
// ============================================================================

const DEFAULT_DURATION = 5000

/** Read a transition token's duration in ms from the current theme */
function getTransitionMs(token: string, fallback: number): number {
  if (typeof window === 'undefined') return fallback
  return parseInt(getComputedStyle(document.documentElement).getPropertyValue(token), 10) || fallback
}

function Toast({ id, message, type, action, duration = DEFAULT_DURATION, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const animationRef = useRef<number | null>(null)

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false

  // Animate in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  // Dismiss handler - defined before useEffect that references it
  const handleDismiss = useCallback(() => {
    setIsVisible(false)
    // Wait for exit animation before removing (synced with --transition-base token)
    setTimeout(() => onDismiss(id), prefersReducedMotion ? 0 : getTransitionMs('--transition-base', 250))
  }, [id, onDismiss, prefersReducedMotion])

  // Progress bar animation
  useEffect(() => {
    if (prefersReducedMotion) {
      // Skip progress animation for reduced motion
      timeoutRef.current = setTimeout(() => {
        handleDismiss()
      }, duration)
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
      }
    }

    startTimeRef.current = Date.now()

    const updateProgress = () => {
      const elapsed = Date.now() - (startTimeRef.current ?? Date.now())
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)

      if (remaining > 0) {
        animationRef.current = requestAnimationFrame(updateProgress)
      } else {
        handleDismiss()
      }
    }

    animationRef.current = requestAnimationFrame(updateProgress)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [duration, prefersReducedMotion, handleDismiss])

  const handleActionClick = () => {
    action?.onClick()
    handleDismiss()
  }

  const role = type === 'error' ? 'alert' : 'status'
  const ariaLive = type === 'error' ? 'assertive' : 'polite'

  return (
    <div
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      className={`toast toast--${type} ${isVisible ? 'toast--visible' : ''}`}
      style={{
        '--toast-bg': 'var(--color-surface)',
        '--toast-border': 'var(--color-border)',
        '--toast-shadow': '0 4px 12px hsla(0, 0%, 0%, 0.15)',
        '--toast-radius': '8px',
        '--toast-padding-y': 'var(--space-3, 12px)',
        '--toast-padding-x': 'var(--space-4, 16px)',
        '--toast-icon-success': 'var(--color-success, #22c55e)',
        '--toast-icon-error': 'var(--color-error, #ef4444)',
        '--toast-accent': 'var(--color-accent, #3b82f6)',
      } as React.CSSProperties}
    >
      {/* Icon */}
      <span className="toast__icon" aria-hidden="true">
        {type === 'success' ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--toast-icon-success)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="9 12 12 15 16 10" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--toast-icon-error)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )}
      </span>

      {/* Message */}
      <span className="toast__message">{message}</span>

      {/* Action button */}
      {action && (
        <button
          type="button"
          className="toast__action"
          onClick={handleActionClick}
        >
          {action.label}
        </button>
      )}

      {/* Dismiss button */}
      <button
        type="button"
        className="toast__dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Progress bar */}
      <div
        className="toast__progress"
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />

      {/* Inline styles for the component */}
      <style jsx>{`
        .toast {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--toast-bg);
          border: 1px solid var(--toast-border);
          border-radius: var(--toast-radius);
          padding: var(--toast-padding-y) var(--toast-padding-x);
          padding-bottom: calc(var(--toast-padding-y) + 3px);
          box-shadow: var(--toast-shadow);
          min-width: 300px;
          max-width: 420px;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity var(--transition-base), transform var(--transition-base);
          overflow: hidden;
        }

        @media (prefers-reduced-motion: reduce) {
          .toast {
            transition: none;
            transform: none;
          }
          .toast--visible {
            transform: none;
          }
        }

        .toast--visible {
          opacity: 1;
          transform: translateY(0);
        }

        .toast__icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toast__message {
          flex: 1;
          font-size: 14px;
          line-height: 1.4;
          color: var(--color-text, #1f2937);
        }

        .toast__action {
          flex-shrink: 0;
          background: none;
          border: none;
          padding: 4px 8px;
          font-size: 14px;
          font-weight: 500;
          color: var(--toast-accent);
          cursor: pointer;
          border-radius: 4px;
          transition: background-color var(--transition-fast);
        }

        .toast__action:hover {
          background-color: hsla(220, 80%, 50%, 0.1);
        }

        .toast__action:focus-visible {
          outline: 2px solid var(--toast-accent);
          outline-offset: 2px;
        }

        .toast__dismiss {
          flex-shrink: 0;
          background: none;
          border: none;
          padding: 4px;
          color: var(--color-text-muted, #6b7280);
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color var(--transition-fast), background-color var(--transition-fast);
        }

        .toast__dismiss:hover {
          color: var(--color-text, #1f2937);
          background-color: hsla(0, 0%, 0%, 0.05);
        }

        .toast__dismiss:focus-visible {
          outline: 2px solid var(--toast-accent);
          outline-offset: 2px;
        }

        .toast__progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background-color: var(--toast-accent);
          transition: width 100ms linear;
        }

        .toast--error .toast__progress {
          background-color: var(--toast-icon-error);
        }

        .toast--success .toast__progress {
          background-color: var(--toast-icon-success);
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// Toast Container
// ============================================================================

function ToastContainer({ toasts, onDismiss }: { toasts: ToastData[]; onDismiss: (id: string) => void }) {
  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          action={toast.action}
          duration={toast.duration}
          onDismiss={onDismiss}
        />
      ))}

      <style jsx>{`
        .toast-container {
          position: fixed;
          bottom: var(--space-6, 24px);
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          display: flex;
          flex-direction: column-reverse;
          gap: 8px;
          pointer-events: none;
          padding-bottom: env(safe-area-inset-bottom, 0);
        }

        .toast-container > :global(.toast) {
          pointer-events: auto;
        }

        @media (max-width: 480px) {
          .toast-container {
            left: var(--space-4, 16px);
            right: var(--space-4, 16px);
            transform: none;
          }

          .toast-container > :global(.toast) {
            min-width: 0;
            max-width: none;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// Toast Provider
// ============================================================================

let toastCounter = 0

function generateId(): string {
  // Use crypto.randomUUID if available, otherwise fallback to counter
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `toast-${++toastCounter}-${Date.now()}`
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const showToast = useCallback((toast: Omit<ToastProps, 'id' | 'onDismiss'>): string => {
    const id = generateId()
    const newToast: ToastData = {
      ...toast,
      id,
      createdAt: Date.now(),
    }

    setToasts((prev) => [...prev, newToast])
    return id
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  // Register for standalone toast access
  useEffect(() => {
    registerToastProvider(showToast)
    return () => unregisterToastProvider()
  }, [showToast])

  const contextValue: ToastContextValue = {
    showToast,
    dismissToast,
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

// ============================================================================
// Standalone Toast (for use outside React components)
// ============================================================================

type StandaloneToastFn = ((toast: Omit<ToastProps, 'id' | 'onDismiss'>) => string) | null

let registeredShowToast: StandaloneToastFn = null

export function registerToastProvider(showToast: (toast: Omit<ToastProps, 'id' | 'onDismiss'>) => string): void {
  registeredShowToast = showToast
}

export function unregisterToastProvider(): void {
  registeredShowToast = null
}

/**
 * Show a toast from outside React component tree.
 * Requires ToastProvider to be mounted.
 */
export function showToastStandalone(toast: {
  message: string
  type: 'success' | 'error'
  duration?: number
}): void {
  if (!registeredShowToast) {
    console.error('[Toast] Provider not mounted. Toast message:', toast.message)
    return
  }
  registeredShowToast(toast)
}

// ============================================================================
// useToast Hook
// ============================================================================

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return context
}

// ============================================================================
// Exports
// ============================================================================

export type { ToastProps, ToastAction, ToastContextValue }
