'use client'

import { useEffect, useState, useRef, useCallback, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { ProjectForm } from './ProjectForm'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import type { ProjectFormData } from './ProjectForm'

// Subscription for useSyncExternalStore (no-op since we only need client detection)
const emptySubscribe = () => () => {}

interface ProjectFormModalProps {
  isOpen: boolean
  portfolioId: string
  project?: {
    id: string
    title: string
    year: string | null
    venue: string | null
    role: string | null
    description: string | null
    isFeatured: boolean
    featuredImage: {
      id: string
      url: string
      thumbnailUrl: string
      altText: string | null
    } | null
    galleryImages?: Array<{
      id: string
      url: string
      thumbnailUrl: string
      altText: string | null
    }>
  }
  categoryId: string
  onSubmit: (data: ProjectFormData) => Promise<void>
  onClose: () => void
  isSubmitting: boolean
}

/**
 * ProjectFormModal
 * 
 * A modal wrapper for the ProjectForm component.
 * Handles portal rendering, animations, keyboard navigation, and mobile responsiveness.
 * 
 * Features:
 * - Portal renders to document.body
 * - Fade in/out animation for backdrop
 * - Scale + fade animation for modal content
 * - Escape key closes modal (unless submitting)
 * - Backdrop click closes modal (unless submitting)
 * - Body scroll lock when open
 * - Focus trap for accessibility
 * - Full-screen on mobile with safe area padding
 * - Responsive sizing: 480px (quick-add) / 640px (full edit)
 * 
 * @example
 * ```tsx
 * <ProjectFormModal
 *   isOpen={showModal}
 *   project={editingProject}
 *   categoryId="cat-123"
 *   onSubmit={handleSubmit}
 *   onClose={() => setShowModal(false)}
 *   isSubmitting={isLoading}
 * />
 * ```
 */
export function ProjectFormModal({
  isOpen,
  portfolioId,
  project,
  categoryId,
  onSubmit,
  onClose,
  isSubmitting,
}: ProjectFormModalProps) {
  // Use useSyncExternalStore for hydration-safe client detection
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
  // Track closing state for exit animation (set in event handler, not effect)
  const [isClosing, setIsClosing] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Set up focus trap
  useFocusTrap({
    isActive: isOpen,
    containerRef: modalRef as React.RefObject<HTMLElement>,
  })

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
    if (isSubmitting) return
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 200) // Wait for exit animation
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

  // Don't render on server or if not mounted
  if (!mounted || !isOpen) return null

  const isEditing = Boolean(project)
  const title = isEditing ? 'Edit Project' : 'New Project'
  // Use larger modal for edit mode (has gallery images), smaller for quick-add
  const modalSizeClass = isEditing ? 'full-mode' : 'quick-add-mode'

  const modalContent = (
    <div
      className={`project-modal-backdrop ${isClosing ? 'closing' : 'entering'}`}
      onClick={handleBackdropClick}
      aria-hidden={!isOpen}
    >
      <div
        ref={modalRef}
        className={`project-modal ${modalSizeClass} ${isClosing ? 'closing' : 'entering'}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className="project-modal-header">
          {/* Back button for mobile */}
          <button
            type="button"
            className="back-btn mobile-only"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <h2>{title}</h2>

          {/* Close button for desktop */}
          <button
            type="button"
            className="close-btn desktop-only"
            onClick={handleClose}
            disabled={isSubmitting}
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

        {/* Content */}
        <div className="project-modal-content">
          <ProjectForm
            portfolioId={portfolioId}
            project={project}
            categoryId={categoryId}
            onSubmit={onSubmit}
            onCancel={handleClose}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>

      <style jsx>{`
        .project-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .project-modal-backdrop.entering {
          animation: backdropEnter 0.2s ease-out forwards;
        }

        .project-modal-backdrop.closing {
          animation: backdropExit 0.2s ease-out forwards;
        }

        @keyframes backdropEnter {
          from { background: rgba(0, 0, 0, 0); }
          to { background: rgba(0, 0, 0, 0.5); }
        }

        @keyframes backdropExit {
          from { background: rgba(0, 0, 0, 0.5); }
          to { background: rgba(0, 0, 0, 0); }
        }

        .project-modal {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-height: 90vh;
          background: var(--admin-bg, #ffffff);
          border-radius: 12px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        .project-modal.entering {
          animation: modalEnter 0.2s ease-out forwards;
        }

        .project-modal.closing {
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

        .project-modal.quick-add-mode {
          max-width: 480px;
        }

        .project-modal.full-mode {
          max-width: 640px;
        }

        .project-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--admin-border, #e5e7eb);
        }

        .project-modal-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--admin-text, #111827);
        }

        .close-btn,
        .back-btn {
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

        .close-btn:hover:not(:disabled),
        .back-btn:hover:not(:disabled) {
          background: var(--admin-bg-secondary, #f3f4f6);
          color: var(--admin-text, #111827);
        }

        .close-btn:disabled,
        .back-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .mobile-only {
          display: none;
        }

        .project-modal-content {
          flex: 1;
          overflow-y: auto;
        }

        /* Mobile styles - full screen */
        @media (max-width: 767px) {
          .project-modal-backdrop {
            padding: 0;
          }

          .project-modal {
            max-width: 100%;
            max-height: 100%;
            height: 100%;
            border-radius: 0;
          }

          .project-modal.quick-add-mode,
          .project-modal.full-mode {
            max-width: 100%;
          }

          .desktop-only {
            display: none;
          }

          .mobile-only {
            display: flex;
          }

          .project-modal-header {
            padding: 12px 16px;
          }

          .project-modal-header h2 {
            flex: 1;
            text-align: center;
          }

          .project-modal-content {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .project-modal-backdrop,
          .project-modal {
            transition: none;
          }
        }
      `}</style>
    </div>
  )

  return createPortal(modalContent, document.body)
}
