'use client'

import { useEffect, useState, useRef, useCallback, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap } from '@/hooks/useFocusTrap'

// Subscription for useSyncExternalStore (no-op since we only need client detection)
const emptySubscribe = () => () => {}

// ============================================================================
// Types
// ============================================================================

interface RenameModalProps {
  /** Whether the modal is visible */
  isOpen: boolean
  /** Dialog title, e.g. "Rename Category" */
  title: string
  /** Input label, e.g. "Category Name" */
  label: string
  /** The current name to pre-populate */
  currentName: string
  /** Called with the new name when user saves */
  onSave: (newName: string) => Promise<void>
  /** Called when user cancels or closes the modal */
  onClose: () => void
  /** Whether a save is in progress */
  isSubmitting: boolean
}

// ============================================================================
// RenameModal Component
// ============================================================================

/**
 * RenameModal
 *
 * A lightweight modal for renaming entities (categories, subcategories, projects).
 * Shows a single text input with Save/Cancel.
 *
 * Follows the same modal patterns as CategoryFormModal:
 * - Portal renders to document.body
 * - Fade + scale animation
 * - Escape key / backdrop click to close
 * - Body scroll lock
 * - Focus trap for accessibility
 */
export function RenameModal({
  isOpen,
  title,
  label,
  currentName,
  onSave,
  onClose,
  isSubmitting,
}: RenameModalProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
  const [isClosing, setIsClosing] = useState(false)
  const [name, setName] = useState(currentName)
  const modalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Set up focus trap
  useFocusTrap({
    isActive: isOpen,
    containerRef: modalRef as React.RefObject<HTMLElement>,
  })

  // Reset name and focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(currentName)
      setTimeout(() => inputRef.current?.select(), 100)
    }
  }, [isOpen, currentName])

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  // Close with animation
  const handleClose = useCallback(() => {
    if (isSubmitting) return
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 200)
  }, [onClose, isSubmitting])

  // Handle Escape key
  useEffect(() => {
    if (!isOpen || isSubmitting) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, handleClose])

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && !isSubmitting) {
      handleClose()
    }
  }

  // Handle form submit
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || trimmed === currentName) {
      handleClose()
      return
    }
    await onSave(trimmed)
  }

  // Don't render on server or if not mounted
  if (!mounted || !isOpen) return null

  const trimmed = name.trim()
  const isUnchanged = trimmed === currentName || trimmed === ''

  const modalContent = (
    <div
      className={`rename-modal-backdrop ${isClosing ? 'closing' : 'entering'}`}
      onClick={handleBackdropClick}
      aria-hidden={!isOpen}
      data-testid="rename-modal-overlay"
    >
      <div
        ref={modalRef}
        className={`rename-modal ${isClosing ? 'closing' : 'entering'}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-testid="rename-modal"
      >
        {/* Header */}
        <div className="rename-modal-header">
          <h2>{title}</h2>
          <button
            type="button"
            className="close-btn"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close"
            data-testid="rename-modal-close-btn"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rename-modal-body">
          <label htmlFor="rename-input" className="rename-label">
            {label}
          </label>
          <input
            ref={inputRef}
            id="rename-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            maxLength={200}
            className="rename-input"
            autoComplete="off"
            data-testid="rename-modal-input"
          />
          <div className="rename-modal-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={handleClose}
              disabled={isSubmitting}
              data-testid="rename-modal-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={isSubmitting || isUnchanged}
              data-testid="rename-modal-save-btn"
            >
              {isSubmitting ? 'Saving\u2026' : 'Save'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .rename-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .rename-modal-backdrop.entering {
          animation: backdropEnter 0.2s ease-out forwards;
        }

        .rename-modal-backdrop.closing {
          animation: backdropExit 0.2s ease-out forwards;
        }

        @keyframes backdropEnter {
          from { background: rgba(0, 0, 0, 0); }
          to { background: var(--overlay-bg, rgba(0, 0, 0, 0.5)); }
        }

        @keyframes backdropExit {
          from { background: var(--overlay-bg, rgba(0, 0, 0, 0.5)); }
          to { background: rgba(0, 0, 0, 0); }
        }

        .rename-modal {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 420px;
          background: var(--admin-bg, #ffffff);
          border-radius: 12px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        .rename-modal.entering {
          animation: modalEnter 0.2s ease-out forwards;
        }

        .rename-modal.closing {
          animation: modalExit 0.2s ease-out forwards;
        }

        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes modalExit {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.95); }
        }

        .rename-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--admin-border, #e5e7eb);
        }

        .rename-modal-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--admin-text, #111827);
        }

        .close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          padding: 0;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: var(--admin-text-muted, #6b7280);
          cursor: pointer;
          transition: background-color 0.15s, color 0.15s;
        }

        .close-btn:hover:not(:disabled) {
          background: var(--admin-bg-secondary, #f3f4f6);
          color: var(--admin-text, #111827);
        }

        .close-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .rename-modal-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .rename-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--admin-text, #111827);
        }

        .rename-input {
          width: 100%;
          padding: 10px 12px;
          font-size: 15px;
          color: var(--admin-text, #111827);
          background: var(--admin-bg, #ffffff);
          border: 1px solid var(--admin-border, #d1d5db);
          border-radius: 8px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .rename-input:focus {
          border-color: var(--color-accent, #3b82f6);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .rename-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .rename-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 4px;
        }

        .cancel-btn,
        .save-btn {
          padding: 9px 18px;
          font-size: 14px;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.15s, transform 0.1s;
        }

        .cancel-btn {
          background: transparent;
          color: var(--admin-text-muted, #6b7280);
          border: 1px solid var(--admin-border, #d1d5db);
        }

        .cancel-btn:hover:not(:disabled) {
          background: var(--admin-bg-secondary, #f3f4f6);
          color: var(--admin-text, #111827);
        }

        .save-btn {
          background: var(--color-accent, #3b82f6);
          color: white;
          border: none;
        }

        .save-btn:hover:not(:disabled) {
          background: var(--color-accent-hover, #2563eb);
        }

        .save-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .cancel-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Mobile styles */
        @media (max-width: 767px) {
          .rename-modal-backdrop {
            padding: 16px;
          }

          .rename-modal {
            max-width: 100%;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .rename-modal-backdrop,
          .rename-modal {
            animation: none;
          }

          .rename-modal-backdrop.entering {
            background: var(--overlay-bg, rgba(0, 0, 0, 0.5));
          }

          .rename-modal.entering {
            opacity: 1;
            transform: scale(1);
          }

          .save-btn:active:not(:disabled) {
            transform: none;
          }
        }
      `}</style>
    </div>
  )

  return createPortal(modalContent, document.body)
}
