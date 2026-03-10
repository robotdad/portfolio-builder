'use client'

import { useEffect, useState, useRef, useCallback, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap } from '@/hooks/useFocusTrap'

// Subscription for useSyncExternalStore (no-op since we only need client detection)
const emptySubscribe = () => () => {}

// ============================================================================
// Types
// ============================================================================

interface CategoryChild {
  id: string
  name: string
  slug: string
  order: number
  _count: { projects: number }
}

interface CategoryFromAPI {
  id: string
  name: string
  slug: string
  order: number
  children: CategoryChild[]
  _count: { projects: number; children: number }
}

/** Flattened row for the category list UI */
interface FlatCategory {
  id: string
  name: string
  depth: 0 | 1
}

/**
 * Null  → fetch not yet resolved (show spinner)
 * Array → fetch complete (show list; empty array = no categories / error)
 */
type CategoriesState = FlatCategory[] | null

interface MoveProjectModalProps {
  /** Whether the modal is visible */
  isOpen: boolean
  /** Title of the project being moved */
  projectTitle: string
  /** ID of the project's current category */
  currentCategoryId: string
  /** Portfolio ID used to fetch the category tree */
  portfolioId: string
  /** Called with the new categoryId when user confirms */
  onMove: (categoryId: string) => Promise<void>
  /** Called when user cancels or closes the modal */
  onClose: () => void
  /** Whether a move is in progress */
  isSubmitting: boolean
}

// ============================================================================
// MoveProjectModal Component
// ============================================================================

/**
 * MoveProjectModal
 *
 * A modal for selecting a target category to move a project to.
 * Fetches the portfolio's category tree and presents a flat indented list.
 *
 * Follows the same modal patterns as RenameModal:
 * - Portal renders to document.body
 * - Fade + scale animation
 * - Escape key / backdrop click to close
 * - Body scroll lock
 * - Focus trap for accessibility
 * - useSyncExternalStore for SSR safety
 */
export function MoveProjectModal({
  isOpen,
  projectTitle,
  currentCategoryId,
  portfolioId,
  onMove,
  onClose,
  isSubmitting,
}: MoveProjectModalProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
  const [isClosing, setIsClosing] = useState(false)
  /**
   * null  → fetch in-flight (show spinner)
   * array → fetch resolved (empty = no categories / error)
   */
  const [categories, setCategories] = useState<CategoriesState>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Set up focus trap
  useFocusTrap({
    isActive: isOpen,
    containerRef: modalRef as React.RefObject<HTMLElement>,
  })

  // Fetch categories when modal opens.
  // All setState calls are inside async callbacks (.then / .catch) — never
  // synchronously in the effect body — to satisfy react-hooks/set-state-in-effect.
  useEffect(() => {
    if (isOpen && portfolioId) {
      fetch(`/api/categories?portfolioId=${portfolioId}&parentId=null`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch categories')
          return res.json()
        })
        .then((result) => {
          // API may return { data: [...] } or the array directly
          const data: CategoryFromAPI[] = Array.isArray(result) ? result : (result.data ?? [])
          const flat: FlatCategory[] = []
          for (const cat of data) {
            flat.push({ id: cat.id, name: cat.name, depth: 0 })
            for (const child of cat.children ?? []) {
              flat.push({ id: child.id, name: child.name, depth: 1 })
            }
          }
          // Reset selection alongside new data — both land in one render
          setSelectedCategoryId(null)
          setCategories(flat)
        })
        .catch((err) => {
          console.error('MoveProjectModal: failed to fetch categories:', err)
          setCategories([]) // Exit the null/spinner state even on error
        })
    }
  }, [isOpen, portfolioId])

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

  // Handle move confirmation
  const handleSubmit = async () => {
    if (!selectedCategoryId) return
    await onMove(selectedCategoryId)
  }

  // Don't render on server or when closed
  if (!mounted || !isOpen) return null

  const canMove =
    selectedCategoryId !== null &&
    selectedCategoryId !== currentCategoryId &&
    !isSubmitting

  const modalContent = (
    <div
      className={`move-modal-backdrop ${isClosing ? 'closing' : 'entering'}`}
      onClick={handleBackdropClick}
      aria-hidden={!isOpen}
      data-testid="move-modal-overlay"
    >
      <div
        ref={modalRef}
        className={`move-modal ${isClosing ? 'closing' : 'entering'}`}
        role="dialog"
        aria-modal="true"
        aria-label={`Move "${projectTitle}" to a different category`}
        data-testid="move-modal"
      >
        {/* Header */}
        <div className="move-modal-header">
          <h2>Move Project</h2>
          <button
            type="button"
            className="close-btn"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close"
            data-testid="move-modal-close-btn"
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
        <div className="move-modal-body">
          <p className="move-modal-subtitle">
            Select a category to move <strong>{projectTitle}</strong> to:
          </p>

          {/* Category list */}
          <div
            className="category-list"
            role="group"
            aria-label="Available categories"
          >
            {categories === null ? (
              <div className="category-list-status" aria-live="polite" aria-busy="true">
                Loading categories…
              </div>
            ) : categories.length === 0 ? (
              <div className="category-list-status" aria-live="polite">
                No categories found.
              </div>
            ) : (
              categories.map((cat) => {
                const isCurrent = cat.id === currentCategoryId
                const isSelected = cat.id === selectedCategoryId

                return (
                  <button
                    key={cat.id}
                    type="button"
                    aria-pressed={isSelected && !isCurrent}
                    aria-disabled={isCurrent}
                    disabled={isCurrent || isSubmitting}
                    className={[
                      'category-item',
                      cat.depth === 1 ? 'depth-1' : 'depth-0',
                      isCurrent ? 'is-current' : '',
                      isSelected ? 'is-selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => {
                      if (!isCurrent) setSelectedCategoryId(cat.id)
                    }}
                    data-testid={`move-modal-category-${cat.id}`}
                  >
                    <span className="category-item-name">{cat.name}</span>

                    {isCurrent && (
                      <span className="current-badge" aria-label="current category">
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>current</span>
                      </span>
                    )}

                    {isSelected && !isCurrent && (
                      <svg
                        className="selected-check"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* URL warning */}
          <p className="url-warning" role="note">
            ⚠ Moving changes the project&apos;s public URL
          </p>
        </div>

        {/* Footer */}
        <div className="move-modal-footer">
          <button
            type="button"
            className="cancel-btn"
            onClick={handleClose}
            disabled={isSubmitting}
            data-testid="move-modal-cancel-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            className="submit-btn"
            disabled={!canMove}
            onClick={handleSubmit}
            data-testid="move-modal-submit-btn"
          >
            {isSubmitting ? 'Moving\u2026' : 'Move Project'}
          </button>
        </div>
      </div>

      <style jsx>{`
        /* ── Backdrop ────────────────────────────────────────── */
        .move-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .move-modal-backdrop.entering {
          animation: backdropEnter 0.2s ease-out forwards;
        }

        .move-modal-backdrop.closing {
          animation: backdropExit 0.2s ease-out forwards;
        }

        @keyframes backdropEnter {
          from { background: rgba(0, 0, 0, 0); }
          to   { background: var(--overlay-bg, rgba(0, 0, 0, 0.5)); }
        }

        @keyframes backdropExit {
          from { background: var(--overlay-bg, rgba(0, 0, 0, 0.5)); }
          to   { background: rgba(0, 0, 0, 0); }
        }

        /* ── Dialog ──────────────────────────────────────────── */
        .move-modal {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 480px;
          max-height: 80vh;
          background: var(--admin-bg, #ffffff);
          border-radius: 12px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        .move-modal.entering {
          animation: modalEnter 0.2s ease-out forwards;
        }

        .move-modal.closing {
          animation: modalExit 0.2s ease-out forwards;
        }

        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }

        @keyframes modalExit {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(0.95); }
        }

        /* ── Header ──────────────────────────────────────────── */
        .move-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--admin-border, #e5e7eb);
          flex-shrink: 0;
        }

        .move-modal-header h2 {
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

        /* ── Body ────────────────────────────────────────────── */
        .move-modal-body {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 20px;
          overflow-y: auto;
          flex: 1;
          min-height: 0;
        }

        .move-modal-subtitle {
          margin: 0;
          font-size: 14px;
          color: var(--admin-text-muted, #6b7280);
          line-height: 1.5;
        }

        .move-modal-subtitle strong {
          color: var(--admin-text, #111827);
          font-weight: 500;
        }

        /* ── Category list ───────────────────────────────────── */
        .category-list {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--admin-border, #e5e7eb);
          border-radius: 8px;
          overflow: hidden;
        }

        .category-list-status {
          padding: 16px;
          text-align: center;
          font-size: 14px;
          color: var(--admin-text-muted, #6b7280);
        }

        /* ── Category items ──────────────────────────────────── */
        .category-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 10px 14px;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--admin-border, #e5e7eb);
          text-align: left;
          cursor: pointer;
          transition: background-color 0.12s;
          color: var(--admin-text, #111827);
          font-size: 14px;
          font-weight: 500;
        }

        .category-item:last-child {
          border-bottom: none;
        }

        /* Subcategory indent + secondary treatment */
        .category-item.depth-1 {
          padding-left: 30px;
          background: var(--admin-bg-secondary, #f9fafb);
          font-size: 13px;
          font-weight: 400;
          color: var(--admin-text, #374151);
        }

        .category-item:hover:not(:disabled) {
          background: var(--color-accent-alpha-5, rgba(59, 130, 246, 0.06));
        }

        .category-item.is-selected {
          background: var(--color-accent-alpha-10, rgba(59, 130, 246, 0.09)) !important;
          color: var(--color-accent, #3b82f6);
        }

        .category-item.is-current {
          opacity: 0.55;
          cursor: default;
        }

        .category-item:focus-visible {
          outline: 2px solid var(--color-accent, #3b82f6);
          outline-offset: -2px;
          position: relative;
          z-index: 1;
        }

        .category-item-name {
          flex: 1;
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .current-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 500;
          color: var(--admin-text-muted, #6b7280);
          flex-shrink: 0;
          margin-left: 10px;
        }

        .selected-check {
          flex-shrink: 0;
          color: var(--color-accent, #3b82f6);
          margin-left: 10px;
        }

        /* ── URL warning ─────────────────────────────────────── */
        .url-warning {
          margin: 0;
          padding: 8px 12px;
          font-size: 12px;
          line-height: 1.5;
          color: var(--admin-warning-text, #92400e);
          background: var(--admin-warning-bg, #fffbeb);
          border: 1px solid var(--admin-warning-border, #fde68a);
          border-radius: 6px;
        }

        /* ── Footer ──────────────────────────────────────────── */
        .move-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 16px 20px;
          border-top: 1px solid var(--admin-border, #e5e7eb);
          flex-shrink: 0;
        }

        .cancel-btn,
        .submit-btn {
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

        .submit-btn {
          background: var(--color-accent, #3b82f6);
          color: white;
          border: none;
        }

        .submit-btn:hover:not(:disabled) {
          background: var(--color-accent-hover, #2563eb);
        }

        .submit-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .submit-btn:disabled,
        .cancel-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ── Mobile ──────────────────────────────────────────── */
        @media (max-width: 767px) {
          .move-modal-backdrop {
            padding: 16px;
            align-items: flex-end;
          }

          .move-modal {
            max-width: 100%;
            max-height: 90vh;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
          }
        }

        /* ── Reduced motion ──────────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .move-modal-backdrop,
          .move-modal {
            animation: none;
          }

          .move-modal-backdrop.entering {
            background: var(--overlay-bg, rgba(0, 0, 0, 0.5));
          }

          .move-modal.entering {
            opacity: 1;
            transform: scale(1);
          }

          .submit-btn:active:not(:disabled) {
            transform: none;
          }

          .category-item {
            transition: none;
          }
        }
      `}</style>
    </div>
  )

  return createPortal(modalContent, document.body)
}
