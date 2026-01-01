'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { CategoryForm } from './CategoryForm'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import type { CategoryFormData } from './CategoryForm'

interface CategoryFormModalProps {
  isOpen: boolean
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
  category,
  onSubmit,
  onClose,
  isSubmitting,
}: CategoryFormModalProps) {
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Set up focus trap
  useFocusTrap({
    isActive: isOpen,
    containerRef: modalRef as React.RefObject<HTMLElement>,
  })

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle visibility animation
  useEffect(() => {
    if (isOpen) {
      // Small delay to trigger CSS transition
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
  }, [isOpen, isSubmitting])

  // Close with animation
  const handleClose = useCallback(() => {
    if (isSubmitting) return
    setIsVisible(false)
    setTimeout(onClose, 200) // Wait for exit animation
  }, [onClose, isSubmitting])

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
      className={`category-modal-backdrop ${isVisible ? 'visible' : ''}`}
      onClick={handleBackdropClick}
      aria-hidden={!isOpen}
    >
      <div
        ref={modalRef}
        className={`category-modal ${isVisible ? 'visible' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className="category-modal-header">
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
        <div className="category-modal-content">
          <CategoryForm
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
          background: rgba(0, 0, 0, 0);
          transition: background-color 0.2s ease-out;
        }

        .category-modal-backdrop.visible {
          background: rgba(0, 0, 0, 0.5);
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
          opacity: 0;
          transform: scale(0.95);
          transition: opacity 0.2s ease-out, transform 0.2s ease-out;
          overflow: hidden;
        }

        .category-modal.visible {
          opacity: 1;
          transform: scale(1);
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
