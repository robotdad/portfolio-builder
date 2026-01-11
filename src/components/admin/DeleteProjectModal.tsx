'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap } from '@/hooks/useFocusTrap'

interface DeleteProjectModalProps {
  isOpen: boolean
  projectTitle: string
  onConfirm: () => Promise<void>
  onCancel: () => void
  isDeleting: boolean
}

/**
 * DeleteProjectModal
 *
 * A confirmation dialog for deleting a project from the portfolio.
 * Shows warning about permanent deletion.
 *
 * Features:
 * - Portal renders to document.body
 * - Fade in/out animation for backdrop
 * - Scale animation for modal content
 * - Escape key closes modal (when not deleting)
 * - Backdrop click closes modal (when not deleting)
 * - Body scroll lock when open
 * - Focus trap for accessibility
 * - Auto-focuses Cancel button on open
 * - Warning icon visual indicator
 *
 * @example
 * ```tsx
 * <DeleteProjectModal
 *   isOpen={showDeleteModal}
 *   projectTitle="My Project"
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowDeleteModal(false)}
 *   isDeleting={isDeleting}
 * />
 * ```
 */
export function DeleteProjectModal({
  isOpen,
  projectTitle,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteProjectModalProps) {
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  // Set up focus trap with initial focus on Cancel button
  useFocusTrap({
    isActive: isOpen,
    containerRef: modalRef as React.RefObject<HTMLElement>,
    initialFocusRef: cancelButtonRef as React.RefObject<HTMLElement>,
  })

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle visibility animation
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 10)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

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
    if (isDeleting) return
    setIsVisible(false)
    setTimeout(onCancel, 200)
  }, [onCancel, isDeleting])

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

  // Don't render on server or if not mounted/open
  if (!mounted || !isOpen) return null

  const modalContent = (
    <div
      className={`delete-project-backdrop ${isVisible ? 'visible' : ''}`}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`delete-project-modal ${isVisible ? 'visible' : ''}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-project-title"
        aria-describedby="delete-project-description"
      >
        {/* Warning Icon */}
        <div className="warning-icon" aria-hidden="true">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 id="delete-project-title">
          Delete &ldquo;{projectTitle}&rdquo;?
        </h2>

        {/* Description */}
        <div id="delete-project-description" className="description">
          <p>
            This will permanently delete the project and remove it from your portfolio.
          </p>
        </div>

        {/* Actions */}
        <div className="actions">
          <button
            ref={cancelButtonRef}
            type="button"
            className="btn-cancel"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-delete"
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

      <style jsx>{`
        .delete-project-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(0, 0, 0, 0);
          transition: background-color 0.2s ease-out;
        }

        .delete-project-backdrop.visible {
          background: rgba(0, 0, 0, 0.5);
        }

        .delete-project-modal {
          width: 100%;
          max-width: 400px;
          padding: 24px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          text-align: center;
          opacity: 0;
          transform: scale(0.95);
          transition: opacity 0.2s ease-out, transform 0.2s ease-out;
        }

        .delete-project-modal.visible {
          opacity: 1;
          transform: scale(1);
        }

        .warning-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          margin: 0 auto 16px;
          background: #fef2f2;
          border-radius: 50%;
          color: #dc2626;
        }

        h2 {
          margin: 0 0 12px;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          line-height: 1.4;
        }

        .description {
          margin-bottom: 24px;
        }

        .description p {
          margin: 0 0 12px;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }

        .description p:last-child {
          margin-bottom: 0;
        }

        .actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .btn-cancel,
        .btn-delete {
          flex: 1;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.15s, border-color 0.15s, opacity 0.15s;
        }

        .btn-cancel {
          background: #ffffff;
          border: 1px solid #d1d5db;
          color: #374151;
        }

        .btn-cancel:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .btn-delete {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #dc2626;
          border: 1px solid #dc2626;
          color: #ffffff;
        }

        .btn-delete:hover:not(:disabled) {
          background: #b91c1c;
          border-color: #b91c1c;
        }

        .btn-cancel:disabled,
        .btn-delete:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Mobile adjustments */
        @media (max-width: 480px) {
          .delete-project-backdrop {
            padding: 16px;
          }

          .delete-project-modal {
            padding: 20px;
          }

          .actions {
            flex-direction: column-reverse;
          }

          .btn-cancel,
          .btn-delete {
            width: 100%;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .delete-project-backdrop,
          .delete-project-modal {
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
