'use client'

import { useEffect, useState, useRef, useCallback, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { CategoryForm } from './CategoryForm'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import type { CategoryFormData } from './CategoryForm'

// Subscription for useSyncExternalStore (no-op since we only need client detection)
const emptySubscribe = () => () => {}

interface CategoryFormModalProps {
  isOpen: boolean
  portfolioId: string
  category?: {
    id: string
    name: string
    description: string | null
    featuredImage: {
      id: string
      url: string
      thumbnailUrl: string
      altText: string
    } | null
  }
  onSubmit: (data: CategoryFormData) => Promise<void>
  onClose: () => void
  isSubmitting: boolean
}

/**
 * CategoryFormModal
 * 
 * A modal wrapper for the CategoryForm component.
 * Handles portal rendering, animations, keyboard navigation, and mobile responsiveness.
 * 
 * Features:
 * - Portal renders to document.body
 * - Fade in/out animation for backdrop
 * - Scale + fade animation for modal content
 * - Escape key closes modal
 * - Backdrop click closes modal
 * - Body scroll lock when open
 * - Focus trap for accessibility
 * - Full-screen on mobile with safe area padding
 * 
 * @example
 * ```tsx
 * <CategoryFormModal
 *   isOpen={showModal}
 *   category={editingCategory}
 *   onSubmit={handleSubmit}
 *   onClose={() => setShowModal(false)}
 *   isSubmitting={isLoading}
 * />
 * ```
 */
export function CategoryFormModal({
  isOpen,
  portfolioId,
  category,
  onSubmit,
  onClose,
  isSubmitting,
}: CategoryFormModalProps) {
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

  const isEditing = Boolean(category)
  const title = isEditing ? 'Edit Category' : 'Create Category'

  const modalContent = (
    <div
      className={`category-modal-backdrop ${isClosing ? 'closing' : 'entering'}`}
      onClick={handleBackdropClick}
      aria-hidden={!isOpen}
      data-testid="category-modal-overlay"
    >
      <div
        ref={modalRef}
        className={`category-modal ${isClosing ? 'closing' : 'entering'}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-testid="category-modal"
      >
        {/* Header */}
        <div className="category-modal-header" data-testid="category-modal-header">
          {/* Back button for mobile */}
          <button
            type="button"
            className="back-btn mobile-only"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close"
            data-testid="category-modal-back-btn"
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
            data-testid="category-modal-close-btn"
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
        <div className="category-modal-content">
          <CategoryForm
            portfolioId={portfolioId}
            category={category}
            onSubmit={onSubmit}
            onCancel={handleClose}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>

      <style jsx>{`
        .category-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .category-modal-backdrop.entering {
          animation: backdropEnter 0.2s ease-out forwards;
        }

        .category-modal-backdrop.closing {
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

        .category-modal {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          background: var(--admin-bg, #ffffff);
          border-radius: 12px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        .category-modal.entering {
          animation: modalEnter 0.2s ease-out forwards;
        }

        .category-modal.closing {
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

        .category-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--admin-border, #e5e7eb);
        }

        .category-modal-header h2 {
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

        .category-modal-content {
          flex: 1;
          overflow-y: auto;
        }

        /* Mobile styles - full screen */
        @media (max-width: 767px) {
          .category-modal-backdrop {
            padding: 0;
          }

          .category-modal {
            max-width: 100%;
            max-height: 100%;
            height: 100%;
            border-radius: 0;
          }

          .desktop-only {
            display: none;
          }

          .mobile-only {
            display: flex;
          }

          .category-modal-header {
            padding: 12px 16px;
          }

          .category-modal-header h2 {
            flex: 1;
            text-align: center;
          }

          .category-modal-content {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .category-modal-backdrop,
          .category-modal {
            transition: none;
          }
        }
      `}</style>
    </div>
  )

  return createPortal(modalContent, document.body)
}
