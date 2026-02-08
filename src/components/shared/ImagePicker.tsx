'use client'

import { useEffect, useState, useRef, useCallback, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import type { ImagePickerProps, SiteImage } from '@/lib/types/image-picker'
import { useImagePicker } from '@/hooks/useImagePicker'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { ImagePickerControls } from './ImagePickerControls'
import { ImagePickerGrid } from './ImagePickerGrid'

// Subscription for useSyncExternalStore (no-op since we only need client detection)
const emptySubscribe = () => () => {}

/**
 * Image Picker Modal
 * 
 * A modal component for selecting existing site images.
 * 
 * Features:
 * - Responsive grid of available images
 * - Search by filename, alt text, page title
 * - Filter by page/category
 * - Single click to select, double-click to confirm
 * - Full keyboard navigation (arrow keys, Enter, Escape)
 * - Accessible with focus trap and ARIA attributes
 * - Mobile-responsive (full-screen on mobile)
 * 
 * @example
 * ```tsx
 * <ImagePicker
 *   isOpen={showPicker}
 *   onSelect={(image) => setFeaturedImage(image)}
 *   onCancel={() => setShowPicker(false)}
 *   title="Choose Featured Image"
 * />
 * ```
 */
export function ImagePicker({
  isOpen,
  portfolioId,
  selectedId: initialSelectedId,
  onSelect,
  onMultiSelect,
  onCancel,
  title = 'Choose Image',
  filter,
  multiSelect = false,
}: ImagePickerProps) {
  // Use useSyncExternalStore for hydration-safe client detection
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
  // Track closing state for exit animation (set in event handler, not effect)
  const [isClosing, setIsClosing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const modalRef = useRef<HTMLDivElement>(null)

  const {
    state,
    selectedImage,
    setSearchQuery,
    setPageFilter,
    selectImage,
    clearFilters,
    focusedIndex,
    setFocusedIndex,
  } = useImagePicker({
    portfolioId,
    initialSelectedId,
    minWidth: filter?.minWidth,
    minHeight: filter?.minHeight,
  })

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
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onCancel()
    }, 200) // Wait for exit animation
  }, [onCancel])

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleClose()
    }
  }

  // Handle confirm selection
  const handleConfirm = useCallback(() => {
    if (multiSelect && onMultiSelect) {
      // Multi-select mode: get selected images in order
      const selectedImages = selectedIds
        .map(id => state.images.find(img => img.id === id))
        .filter((img): img is SiteImage => img !== undefined)
      
      if (selectedImages.length > 0) {
        onMultiSelect(selectedImages)
      }
    } else if (selectedImage && onSelect) {
      // Single-select mode
      onSelect(selectedImage)
    }
  }, [multiSelect, onMultiSelect, selectedIds, state.images, selectedImage, onSelect])

  // Handle image selection from grid
  const handleImageSelect = useCallback(
    (image: typeof selectedImage) => {
      if (image && !multiSelect && onSelect) {
        selectImage(image.id)
      }
    },
    [selectImage, multiSelect, onSelect]
  )
  
  // Handle multi-select changes
  const handleMultiSelectChange = useCallback(
    (imageIds: string[]) => {
      setSelectedIds(imageIds)
    },
    []
  )

  // Handle double-click confirm from grid
  const handleImageConfirm = useCallback(
    (image: typeof selectedImage) => {
      if (image && onSelect) {
        onSelect(image)
      }
    },
    [onSelect]
  )

  // Don't render on server or if not mounted
  if (!mounted || !isOpen) return null

  const modalContent = (
    <div
      className={`image-picker-backdrop ${isClosing ? 'closing' : 'entering'}`}
      onClick={handleBackdropClick}
      aria-hidden={!isOpen}
    >
      <div
        ref={modalRef}
        className={`image-picker-modal ${isClosing ? 'closing' : 'entering'}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-testid="image-picker-modal"
      >
        {/* Header */}
        <div className="image-picker-header">
          {/* Back button for mobile */}
          <button
            type="button"
            className="back-btn mobile-only"
            onClick={handleClose}
            aria-label="Close picker"
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

          <h2 className="image-picker-title">{title}</h2>

          {/* Close button for desktop */}
          <button
            type="button"
            className="close-btn desktop-only"
            onClick={handleClose}
            aria-label="Close picker"
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

        {/* Controls (Search & Filter) */}
        <ImagePickerControls
          searchQuery={state.searchQuery}
          onSearchChange={setSearchQuery}
          pageFilter={state.pageFilter}
          onPageFilterChange={setPageFilter}
          pages={state.pages}
          onClearFilters={clearFilters}
        />

        {/* Content Area */}
        <div className="image-picker-content">
          {state.status === 'loading' && (
            <div className="image-picker-state">
              <div className="spinner" aria-label="Loading images" />
              <p>Loading images...</p>
            </div>
          )}

          {state.status === 'empty' && (
            <div className="image-picker-state">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              <p>No images available</p>
              <span className="state-hint">Upload images to your portfolio to see them here</span>
            </div>
          )}

          {state.status === 'no-results' && (
            <div className="image-picker-state">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
                <path d="M8 8h6" />
              </svg>
              <p>No images match your search</p>
              <button
                type="button"
                className="clear-filters-btn"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>
          )}

          {state.status === 'populated' && (
            <ImagePickerGrid
              images={state.filteredImages}
              selectedId={state.selectedId}
              focusedIndex={focusedIndex}
              onSelect={handleImageSelect}
              onConfirm={handleImageConfirm}
              onFocusChange={setFocusedIndex}
              multiSelect={multiSelect}
              selectedIds={selectedIds}
              onMultiSelectChange={handleMultiSelectChange}
            />
          )}
        </div>

        {/* Footer */}
        <div className="image-picker-footer">
          <button
            type="button"
            className="cancel-btn"
            onClick={handleClose}
            data-testid="image-picker-cancel-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            className="confirm-btn"
            onClick={handleConfirm}
            disabled={multiSelect ? selectedIds.length === 0 : !selectedImage}
            data-testid="image-picker-select-btn"
          >
            {multiSelect 
              ? `Add ${selectedIds.length} Image${selectedIds.length !== 1 ? 's' : ''}`
              : 'Use Selected Image'
            }
          </button>
        </div>
      </div>

      <style jsx>{`
        .image-picker-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .image-picker-backdrop.entering {
          animation: backdropEnter 0.2s ease-out forwards;
        }

        .image-picker-backdrop.closing {
          animation: backdropExit 0.2s ease-out forwards;
        }

        @keyframes backdropEnter {
          from { background: rgba(0, 0, 0, 0); }
          to { background: var(--overlay-bg); }
        }

        @keyframes backdropExit {
          from { background: var(--overlay-bg); }
          to { background: rgba(0, 0, 0, 0); }
        }

        .image-picker-modal {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 900px;
          max-height: 85vh;
          background: var(--color-bg, #ffffff);
          border-radius: 12px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        .image-picker-modal.entering {
          animation: modalEnter 0.2s ease-out forwards;
        }

        .image-picker-modal.closing {
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

        .image-picker-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid var(--color-border, #e5e7eb);
        }

        .image-picker-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text, #111827);
          margin: 0;
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
          color: var(--color-text-muted, #6b7280);
          cursor: pointer;
          transition: background-color 0.15s, color 0.15s;
        }

        .close-btn:hover,
        .back-btn:hover {
          background: var(--color-bg-hover, #f3f4f6);
          color: var(--color-text, #111827);
        }

        .mobile-only {
          display: none;
        }

        .image-picker-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .image-picker-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 48px 24px;
          color: var(--color-text-muted, #6b7280);
        }

        .image-picker-state p {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: var(--color-text, #111827);
        }

        .state-hint {
          font-size: 14px;
          color: var(--color-text-muted, #9ca3af);
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--color-border, #e5e7eb);
          border-top-color: var(--color-accent, #3b82f6);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .clear-filters-btn {
          padding: 8px 16px;
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 6px;
          background: transparent;
          color: var(--color-text, #111827);
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.15s, border-color 0.15s;
        }

        .clear-filters-btn:hover {
          background: var(--color-bg-hover, #f3f4f6);
          border-color: var(--color-text-muted, #9ca3af);
        }

        .image-picker-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px;
          border-top: 1px solid var(--color-border, #e5e7eb);
        }

        .cancel-btn,
        .confirm-btn {
          height: 40px;
          padding: 0 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.15s, opacity 0.15s;
        }

        .cancel-btn {
          border: 1px solid var(--color-border, #e5e7eb);
          background: transparent;
          color: var(--color-text, #111827);
        }

        .cancel-btn:hover {
          background: var(--color-bg-hover, #f3f4f6);
        }

        .confirm-btn {
          border: none;
          background: var(--color-accent, #3b82f6);
          color: white;
        }

        .confirm-btn:hover:not(:disabled) {
          background: var(--color-accent-hover, #2563eb);
        }

        .confirm-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Mobile styles */
        @media (max-width: 767px) {
          .image-picker-backdrop {
            padding: 0;
          }

          .image-picker-modal {
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

          .image-picker-header {
            padding: 12px 16px;
          }

          .image-picker-title {
            flex: 1;
            text-align: center;
          }

          .image-picker-footer {
            padding: 12px 16px;
            padding-bottom: max(12px, env(safe-area-inset-bottom));
          }

          .cancel-btn {
            display: none;
          }

          .confirm-btn {
            flex: 1;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .image-picker-backdrop,
          .image-picker-modal {
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
