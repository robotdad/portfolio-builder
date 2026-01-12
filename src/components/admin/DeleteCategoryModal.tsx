'use client'

import { useEffect, useState, useCallback, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

// Subscription for useSyncExternalStore (no-op since we only need client detection)
const emptySubscribe = () => () => {}

interface DeleteCategoryModalProps {
  category: { id: string; name: string; _count: { projects: number } } | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting?: boolean
}

/**
 * DeleteCategoryModal
 *
 * A confirmation modal for deleting categories.
 * Shows warning about associated projects that will also be deleted.
 *
 * Features:
 * - Portal renders to document.body
 * - Fade in/out animation
 * - Escape key closes modal (when not deleting)
 * - Backdrop click closes modal (when not deleting)
 * - Body scroll lock when open
 * - Shows project count warning
 * - Accessible with alertdialog role
 *
 * @example
 * ```tsx
 * <DeleteCategoryModal
 *   category={categoryToDelete}
 *   isOpen={showDeleteModal}
 *   onClose={() => setShowDeleteModal(false)}
 *   onConfirm={handleDeleteCategory}
 *   isDeleting={isDeleting}
 * />
 * ```
 */
export function DeleteCategoryModal({
  category,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteCategoryModalProps) {
  // Use useSyncExternalStore for hydration-safe client detection
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
  // Track closing state for exit animation (set in event handler, not effect)
  const [isClosing, setIsClosing] = useState(false)

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

  // Close with animation - set closing state in event handler (not effect)
  const handleClose = useCallback(() => {
    if (isDeleting) return
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 200) // Wait for exit animation
  }, [onClose, isDeleting])

  // Handle Escape key
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

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && !isDeleting) {
      handleClose()
    }
  }

  // Don't render on server, if not mounted, not open, or no category
  if (!mounted || !isOpen || !category) return null

  const projectCount = category._count.projects
  const hasProjects = projectCount > 0

  const modalContent = (
    <div
      className={`modal-overlay ${isClosing ? 'closing' : 'entering'}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`modal-content delete-modal ${isClosing ? 'closing' : 'entering'}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        {/* Header */}
        <div className="modal-header">
          <h2 id="delete-modal-title">Delete Category</h2>
          <button
            type="button"
            className="modal-close"
            onClick={handleClose}
            disabled={isDeleting}
            aria-label="Close"
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

        {/* Body */}
        <div className="modal-body">
          <div id="delete-modal-description" className="delete-modal-message">
            <p>
              Are you sure you want to delete <strong>{category.name}</strong>?
            </p>
            {hasProjects && (
              <p className="warning-text">
                This will also delete {projectCount} project{projectCount !== 1 ? 's' : ''} in this category.
              </p>
            )}
            <p className="destructive-warning">This action cannot be undone.</p>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
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
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes modalExit {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.95);
          }
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

        .warning-text {
          color: var(--admin-warning, #d97706);
          font-weight: var(--font-weight-medium);
        }

        .destructive-warning {
          color: var(--admin-text-muted);
          font-size: var(--font-size-sm);
          margin-top: var(--space-4) !important;
        }

        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          margin-right: var(--space-2);
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .modal-overlay,
          .modal-content {
            transition: none;
          }

          .spinner {
            animation: none;
          }
        }
      `}</style>
    </div>
  )

  return createPortal(modalContent, document.body)
}
