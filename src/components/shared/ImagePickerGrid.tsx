'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { ImagePickerGridProps } from '@/lib/types/image-picker'
import type { SiteImage } from '@/lib/types/image-picker'

/**
 * Grid of selectable images for the image picker.
 * 
 * Features:
 * - Responsive grid with 140px minimum column width
 * - Single click to select, double-click to confirm
 * - Keyboard navigation with arrow keys
 * - Visual feedback for selected and focused states
 * - Source labels showing page/section info
 */
export function ImagePickerGrid({
  images,
  selectedId,
  focusedIndex,
  onSelect,
  onConfirm,
  onFocusChange,
}: ImagePickerGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map())

  // Focus the currently focused item when focusedIndex changes
  useEffect(() => {
    const item = itemRefs.current.get(focusedIndex)
    if (item && document.activeElement !== item) {
      item.focus()
    }
  }, [focusedIndex])

  // Get grid column count for arrow key navigation
  const getColumnCount = useCallback((): number => {
    if (!gridRef.current) return 3
    const gridStyle = getComputedStyle(gridRef.current)
    const columns = gridStyle.getPropertyValue('grid-template-columns')
    return columns.split(' ').length
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number, image: SiteImage) => {
      const columnCount = getColumnCount()
      const totalItems = images.length
      let newIndex = index

      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault()
          newIndex = index < totalItems - 1 ? index + 1 : index
          break
        case 'ArrowLeft':
          event.preventDefault()
          newIndex = index > 0 ? index - 1 : index
          break
        case 'ArrowDown':
          event.preventDefault()
          newIndex = index + columnCount < totalItems ? index + columnCount : index
          break
        case 'ArrowUp':
          event.preventDefault()
          newIndex = index - columnCount >= 0 ? index - columnCount : index
          break
        case 'Enter':
        case ' ':
          event.preventDefault()
          if (selectedId === image.id) {
            // Already selected, confirm
            onConfirm(image)
          } else {
            // Select first
            onSelect(image)
          }
          return
        case 'Home':
          event.preventDefault()
          newIndex = 0
          break
        case 'End':
          event.preventDefault()
          newIndex = totalItems - 1
          break
        default:
          return
      }

      if (newIndex !== index) {
        onFocusChange(newIndex)
      }
    },
    [images.length, selectedId, getColumnCount, onSelect, onConfirm, onFocusChange]
  )

  // Handle click
  const handleClick = useCallback(
    (image: SiteImage, index: number) => {
      onFocusChange(index)
      onSelect(image)
    },
    [onSelect, onFocusChange]
  )

  // Handle double-click
  const handleDoubleClick = useCallback(
    (image: SiteImage) => {
      onConfirm(image)
    },
    [onConfirm]
  )

  // Set ref for grid item
  const setItemRef = useCallback((el: HTMLButtonElement | null, index: number) => {
    if (el) {
      itemRefs.current.set(index, el)
    } else {
      itemRefs.current.delete(index)
    }
  }, [])

  return (
    <div
      ref={gridRef}
      className="image-picker-grid"
      role="listbox"
      aria-label="Available images"
      aria-multiselectable="false"
    >
      {images.map((image, index) => {
        const isSelected = image.id === selectedId
        const isFocused = index === focusedIndex

        return (
          <button
            key={image.id}
            ref={(el) => setItemRef(el, index)}
            type="button"
            className={`image-item ${isSelected ? 'selected' : ''} ${isFocused ? 'focused' : ''}`}
            role="option"
            aria-selected={isSelected}
            tabIndex={isFocused ? 0 : -1}
            onClick={() => handleClick(image, index)}
            onDoubleClick={() => handleDoubleClick(image)}
            onKeyDown={(e) => handleKeyDown(e, index, image)}
          >
            <div className="image-wrapper">
              <img
                src={image.thumbnailUrl}
                alt={image.meta.alt || image.filename}
                loading="lazy"
                decoding="async"
              />
              {isSelected && (
                <div className="selected-overlay" aria-hidden="true">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </div>
            <div className="image-label">
              <span className="image-source">{image.source.pageTitle}</span>
            </div>
          </button>
        )
      })}

      <style jsx>{`
        .image-picker-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
          padding: 16px;
          overflow-y: auto;
          flex: 1;
        }

        .image-item {
          display: flex;
          flex-direction: column;
          padding: 0;
          border: 2px solid transparent;
          border-radius: 8px;
          background: var(--color-bg, #ffffff);
          cursor: pointer;
          transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
          overflow: hidden;
        }

        .image-item:hover {
          transform: scale(1.02);
        }

        .image-item:focus {
          outline: none;
        }

        .image-item.focused {
          box-shadow: 0 0 0 3px var(--color-accent-light, rgba(59, 130, 246, 0.3));
        }

        .image-item.selected {
          border-color: var(--color-accent, #3b82f6);
        }

        .image-wrapper {
          position: relative;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background: var(--color-bg-secondary, #f3f4f6);
        }

        .image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .selected-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(59, 130, 246, 0.4);
          color: white;
        }

        .image-label {
          padding: 8px;
          border-top: 1px solid var(--color-border, #e5e7eb);
        }

        .image-source {
          display: block;
          font-size: 12px;
          color: var(--color-text-muted, #6b7280);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
        }

        @media (max-width: 640px) {
          .image-picker-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            padding: 12px;
          }

          .image-item:hover {
            transform: none;
          }

          .image-label {
            padding: 6px;
          }

          .image-source {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  )
}
