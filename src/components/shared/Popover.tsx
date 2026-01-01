'use client'

import {
  useEffect,
  useRef,
  useCallback,
  useState,
  type ReactNode,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { usePopoverPosition } from '@/hooks/usePopoverPosition'

// ============================================================================
// Types
// ============================================================================

interface PopoverProps {
  isOpen: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLElement | null>
  children: ReactNode
  align?: 'start' | 'center' | 'end'
  gap?: number
  showArrow?: boolean
  className?: string
}

interface PopoverItemProps {
  label: string
  icon?: ReactNode
  description?: string
  onSelect: () => void
  disabled?: boolean
}

interface PopoverDividerProps {}

// ============================================================================
// PopoverItem Component
// ============================================================================

function PopoverItem({
  label,
  icon,
  description,
  onSelect,
  disabled = false,
}: PopoverItemProps) {
  const handleClick = () => {
    if (!disabled) {
      onSelect()
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault()
      onSelect()
    }
  }

  return (
    <button
      type="button"
      role="menuitem"
      className={`popover-item ${disabled ? 'popover-item--disabled' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
    >
      {icon && (
        <span className="popover-item__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="popover-item__content">
        <span className="popover-item__label">{label}</span>
        {description && (
          <span className="popover-item__description">{description}</span>
        )}
      </span>

      <style jsx>{`
        .popover-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          min-height: 48px;
          padding: 10px 16px;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          color: var(--color-text, #1f2937);
          transition: background-color 150ms ease;
        }

        .popover-item:hover:not(:disabled) {
          background-color: var(--color-surface-hover, hsla(0, 0%, 0%, 0.04));
        }

        .popover-item:focus-visible {
          outline: none;
          background-color: var(--color-surface-hover, hsla(0, 0%, 0%, 0.04));
        }

        .popover-item--disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .popover-item__icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          color: var(--color-text-muted, #6b7280);
        }

        .popover-item__content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .popover-item__label {
          font-size: 14px;
          font-weight: 500;
          line-height: 1.4;
        }

        .popover-item__description {
          font-size: 12px;
          color: var(--color-text-muted, #6b7280);
          line-height: 1.3;
        }
      `}</style>
    </button>
  )
}

// ============================================================================
// PopoverDivider Component
// ============================================================================

function PopoverDivider({}: PopoverDividerProps) {
  return (
    <div className="popover-divider" role="separator" aria-orientation="horizontal">
      <style jsx>{`
        .popover-divider {
          height: 1px;
          margin: 4px 0;
          background-color: var(--color-border, #e5e7eb);
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// Popover Component
// ============================================================================

function Popover({
  isOpen,
  onClose,
  triggerRef,
  children,
  align = 'start',
  gap = 8,
  showArrow = true,
  className = '',
}: PopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const focusedIndexRef = useRef<number>(-1)

  // Use the positioning hook
  const { placement, style, arrowStyle } = usePopoverPosition({
    triggerRef,
    popoverRef,
    isOpen,
    gap,
    align,
  })

  // Handle client-side mounting for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Get all focusable menu items
  const getFocusableItems = useCallback((): HTMLElement[] => {
    if (!popoverRef.current) return []
    return Array.from(
      popoverRef.current.querySelectorAll<HTMLElement>(
        'button[role="menuitem"]:not([disabled])'
      )
    )
  }, [])

  // Focus a specific item by index
  const focusItem = useCallback((index: number) => {
    const items = getFocusableItems()
    if (items.length === 0) return

    // Clamp index to valid range
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1))
    focusedIndexRef.current = clampedIndex
    items[clampedIndex]?.focus()
  }, [getFocusableItems])

  // Animation and focus management when opening/closing
  useEffect(() => {
    if (isOpen) {
      // Slight delay to allow portal to mount and position to calculate
      const showTimer = setTimeout(() => {
        setIsVisible(true)
      }, 10)

      // Focus first item after animation starts
      const focusTimer = setTimeout(() => {
        focusItem(0)
      }, 50)

      return () => {
        clearTimeout(showTimer)
        clearTimeout(focusTimer)
      }
    } else {
      setIsVisible(false)
      focusedIndexRef.current = -1
    }
  }, [isOpen, focusItem])

  // Return focus to trigger when closing
  const handleClose = useCallback(() => {
    onClose()
    // Return focus to trigger element
    setTimeout(() => {
      triggerRef.current?.focus()
    }, 0)
  }, [onClose, triggerRef])

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const popover = popoverRef.current
      const trigger = triggerRef.current

      if (
        popover &&
        !popover.contains(target) &&
        trigger &&
        !trigger.contains(target)
      ) {
        handleClose()
      }
    }

    // Use mousedown for immediate response
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, handleClose, triggerRef])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const items = getFocusableItems()
      const currentIndex = focusedIndexRef.current

      switch (event.key) {
        case 'Escape':
          event.preventDefault()
          handleClose()
          break

        case 'ArrowDown':
          event.preventDefault()
          if (currentIndex < items.length - 1) {
            focusItem(currentIndex + 1)
          } else {
            // Wrap to first item
            focusItem(0)
          }
          break

        case 'ArrowUp':
          event.preventDefault()
          if (currentIndex > 0) {
            focusItem(currentIndex - 1)
          } else {
            // Wrap to last item
            focusItem(items.length - 1)
          }
          break

        case 'Home':
          event.preventDefault()
          focusItem(0)
          break

        case 'End':
          event.preventDefault()
          focusItem(items.length - 1)
          break

        case 'Tab':
          // Trap focus within popover
          event.preventDefault()
          if (event.shiftKey) {
            // Shift+Tab: go to previous or wrap to last
            if (currentIndex > 0) {
              focusItem(currentIndex - 1)
            } else {
              focusItem(items.length - 1)
            }
          } else {
            // Tab: go to next or wrap to first
            if (currentIndex < items.length - 1) {
              focusItem(currentIndex + 1)
            } else {
              focusItem(0)
            }
          }
          break
      }
    },
    [getFocusableItems, focusItem, handleClose]
  )

  // Handle item selection (close popover after selection)
  const handleItemSelect = useCallback(() => {
    handleClose()
  }, [handleClose])

  // Don't render on server or when not mounted
  if (!mounted || !isOpen) return null

  const popoverContent = (
    <div
      ref={popoverRef}
      role="menu"
      aria-label="Menu"
      data-position={placement}
      className={`popover ${isVisible ? 'popover--visible' : ''} ${className}`}
      style={style}
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        // Close on item click (if it was a menu item button)
        const target = e.target as HTMLElement
        if (target.closest('button[role="menuitem"]')) {
          handleItemSelect()
        }
      }}
    >
      {/* Arrow indicator */}
      {showArrow && (
        <div
          className={`popover__arrow popover__arrow--${placement}`}
          style={{ left: arrowStyle.left }}
          aria-hidden="true"
        />
      )}

      {/* Content */}
      <div className="popover__content">{children}</div>

      <style jsx>{`
        .popover {
          position: absolute;
          z-index: 1000;
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 8px;
          box-shadow: 0 4px 16px hsla(0, 0%, 0%, 0.12),
            0 2px 4px hsla(0, 0%, 0%, 0.08);
          min-width: 200px;
          max-width: 320px;
          overflow: hidden;

          /* Animation initial state */
          opacity: 0;
          transform: scale(0.95);
          transition: opacity 150ms ease-out, transform 150ms ease-out;
        }

        /* Transform origin based on position */
        .popover[data-position='below'] {
          transform-origin: top center;
        }

        .popover[data-position='above'] {
          transform-origin: bottom center;
        }

        .popover--visible {
          opacity: 1;
          transform: scale(1);
        }

        @media (prefers-reduced-motion: reduce) {
          .popover {
            transition: none;
            transform: none;
          }
          .popover--visible {
            transform: none;
          }
        }

        .popover__content {
          padding: 4px 0;
        }

        /* Arrow styles */
        .popover__arrow {
          position: absolute;
          width: 12px;
          height: 12px;
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          transform: translateX(-50%) rotate(45deg);
          pointer-events: none;
        }

        .popover__arrow--below {
          top: -7px;
          border-right: none;
          border-bottom: none;
        }

        .popover__arrow--above {
          bottom: -7px;
          border-left: none;
          border-top: none;
        }
      `}</style>
    </div>
  )

  // Render into portal
  return createPortal(popoverContent, document.body)
}

// ============================================================================
// Exports
// ============================================================================

export { Popover, PopoverItem, PopoverDivider }
export type { PopoverProps, PopoverItemProps, PopoverDividerProps }
