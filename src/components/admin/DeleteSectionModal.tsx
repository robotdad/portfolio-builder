'use client'

import { useEffect, useState, useCallback, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

const emptySubscribe = () => () => {}

interface DeleteSectionModalProps {
  /** Whether the modal is visible */
  isOpen: boolean
  /** Called when the user cancels or closes the modal */
  onClose: () => void
  /** Called when the user confirms deletion */
  onConfirm: () => void
  /** Whether a deletion is in progress (kept for symmetry; section delete is sync) */
  isDeleting?: boolean
}

/**
 * DeleteSectionModal
 *
 * A small confirmation dialog shown before removing a section from a page.
 * Section-agnostic: shows the same prompt regardless of section type, since
 * users care about losing their content, not the section's category.
 *
 * Patterns mirror DeletePageModal (portal + scroll lock + Escape close +
 * backdrop click + 200ms exit animation).
 */
export function DeleteSectionModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteSectionModalProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  const handleClose = useCallback(() => {
    if (isDeleting) return
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 200)
  }, [onClose, isDeleting])

  useEffect(() => {
    if (!isOpen || isDeleting) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        handleClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isDeleting, handleClose])

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && !isDeleting) {
      handleClose()
    }
  }

  if (!mounted || !isOpen) return null

  const modalContent = (
    <div
      className={`modal-overlay ${isClosing ? 'closing' : 'entering'}`}
      onClick={handleBackdropClick}
      data-testid="delete-section-modal-overlay"
    >
      <div
        className={`modal-content delete-modal ${isClosing ? 'closing' : 'entering'}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-section-modal-title"
        aria-describedby="delete-section-modal-description"
        data-testid="delete-section-modal"
      >
        <div className="modal-header">
          <h2 id="delete-section-modal-title">Delete Section</h2>
          <button
            type="button"
            className="modal-close"
            onClick={handleClose}
            disabled={isDeleting}
            aria-label="Close"
            data-testid="delete-section-modal-close-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div id="delete-section-modal-description" className="delete-modal-message">
            <p>Are you sure you want to delete this section?</p>
            <p className="destructive-warning">This action cannot be undone.</p>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={isDeleting}
              data-testid="delete-section-modal-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={onConfirm}
              disabled={isDeleting}
              data-testid="delete-section-modal-confirm-btn"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay.entering {
          animation: overlayEnter 0.2s ease-out forwards;
        }
        .modal-overlay.closing {
          animation: overlayExit 0.2s ease-out forwards;
        }
        @keyframes overlayEnter {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes overlayExit {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .modal-content.entering {
          animation: modalEnter 0.2s ease-out forwards;
        }
        .modal-content.closing {
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
        .modal-body {
          padding: var(--space-6);
        }
        .delete-modal-message p {
          margin: 0 0 var(--space-3) 0;
        }
        .delete-modal-message p:last-child {
          margin-bottom: 0;
        }
        .destructive-warning {
          color: var(--admin-text-muted);
          font-size: var(--font-size-sm);
          margin-top: var(--space-4) !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .modal-overlay,
          .modal-content {
            animation: none;
          }
        }
      `}</style>
    </div>
  )

  return createPortal(modalContent, document.body)
}
