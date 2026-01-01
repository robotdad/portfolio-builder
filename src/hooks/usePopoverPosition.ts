'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

type PopoverPlacement = 'above' | 'below'
type PopoverAlign = 'start' | 'center' | 'end'

interface UsePopoverPositionOptions {
  /** Reference to the trigger element */
  triggerRef: React.RefObject<HTMLElement | null>
  /** Reference to the popover element */
  popoverRef: React.RefObject<HTMLElement | null>
  /** Whether the popover is currently open */
  isOpen: boolean
  /** Gap between trigger and popover in pixels (default: 8) */
  gap?: number
  /** Horizontal alignment relative to trigger (default: 'start') */
  align?: PopoverAlign
}

interface PopoverPositionStyle {
  position: 'absolute'
  top?: number
  bottom?: number
  left: number
  minWidth: number
}

interface ArrowStyle {
  left: number
}

interface PopoverPositionResult {
  /** Whether popover opens above or below trigger */
  placement: PopoverPlacement
  /** CSS styles for positioning the popover */
  style: PopoverPositionStyle
  /** CSS styles for positioning the arrow indicator */
  arrowStyle: ArrowStyle
}

const VIEWPORT_MARGIN = 8
const MIN_WIDTH = 200

/**
 * Calculate whether popover should open above or below trigger
 * Prefers below if it fits, falls back to above, uses whichever has more space
 */
function calculatePlacement(
  triggerRect: DOMRect,
  popoverHeight: number,
  viewportHeight: number,
  gap: number
): PopoverPlacement {
  const spaceBelow = viewportHeight - triggerRect.bottom
  const spaceAbove = triggerRect.top

  if (spaceBelow >= popoverHeight + gap) return 'below'
  if (spaceAbove >= popoverHeight + gap) return 'above'
  return spaceAbove > spaceBelow ? 'above' : 'below'
}

/**
 * Calculate horizontal position based on alignment
 */
function calculateHorizontalPosition(
  triggerRect: DOMRect,
  popoverWidth: number,
  align: PopoverAlign,
  viewportWidth: number
): number {
  let left: number

  switch (align) {
    case 'center':
      left = triggerRect.left + (triggerRect.width - popoverWidth) / 2
      break
    case 'end':
      left = triggerRect.right - popoverWidth
      break
    case 'start':
    default:
      left = triggerRect.left
      break
  }

  // Clamp to viewport edges with margin
  const maxLeft = viewportWidth - popoverWidth - VIEWPORT_MARGIN
  const minLeft = VIEWPORT_MARGIN

  return Math.max(minLeft, Math.min(left, maxLeft))
}

/**
 * Calculate arrow position relative to popover
 */
function calculateArrowPosition(
  triggerRect: DOMRect,
  popoverLeft: number
): number {
  // Arrow should point to center of trigger
  const triggerCenter = triggerRect.left + triggerRect.width / 2
  return triggerCenter - popoverLeft
}

/**
 * Hook for calculating smart viewport-aware popover positioning
 *
 * Features:
 * - Automatically positions above or below based on available space
 * - Clamps horizontal position to stay within viewport
 * - Updates on scroll, resize, and popover content changes
 * - Returns styles ready to apply to popover element
 *
 * @example
 * ```tsx
 * const { placement, style, arrowStyle } = usePopoverPosition({
 *   triggerRef,
 *   popoverRef,
 *   isOpen,
 *   gap: 8,
 *   align: 'start'
 * })
 *
 * return (
 *   <div ref={popoverRef} style={style}>
 *     <div className="arrow" style={arrowStyle} />
 *     {content}
 *   </div>
 * )
 * ```
 */
export function usePopoverPosition({
  triggerRef,
  popoverRef,
  isOpen,
  gap = 8,
  align = 'start',
}: UsePopoverPositionOptions): PopoverPositionResult {
  const [position, setPosition] = useState<PopoverPositionResult>({
    placement: 'below',
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      minWidth: MIN_WIDTH,
    },
    arrowStyle: {
      left: 0,
    },
  })

  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current
    const popover = popoverRef.current

    if (!trigger || !popover) return

    const triggerRect = trigger.getBoundingClientRect()
    const popoverRect = popover.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth

    // Calculate placement (above or below)
    const placement = calculatePlacement(
      triggerRect,
      popoverRect.height,
      viewportHeight,
      gap
    )

    // Calculate horizontal position
    const popoverWidth = Math.max(popoverRect.width, triggerRect.width, MIN_WIDTH)
    const left = calculateHorizontalPosition(
      triggerRect,
      popoverWidth,
      align,
      viewportWidth
    )

    // Calculate vertical position
    const style: PopoverPositionStyle = {
      position: 'absolute',
      left,
      minWidth: Math.max(triggerRect.width, MIN_WIDTH),
    }

    if (placement === 'below') {
      style.top = triggerRect.bottom + gap + window.scrollY
    } else {
      style.bottom = viewportHeight - triggerRect.top + gap - window.scrollY
    }

    // Calculate arrow position
    const arrowLeft = calculateArrowPosition(triggerRect, left)

    setPosition({
      placement,
      style,
      arrowStyle: { left: arrowLeft },
    })
  }, [triggerRef, popoverRef, gap, align])

  // Update position when popover opens or dependencies change
  useEffect(() => {
    if (!isOpen) return

    // Initial position calculation
    updatePosition()

    // Handle scroll events (capture phase to catch all scrollable containers)
    const handleScroll = () => updatePosition()
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true })

    // Handle window resize
    const handleResize = () => updatePosition()
    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true })
      window.removeEventListener('resize', handleResize)
    }
  }, [isOpen, updatePosition])

  // Use ResizeObserver to handle dynamic popover content changes
  useEffect(() => {
    if (!isOpen) return

    const popover = popoverRef.current
    if (!popover) return

    resizeObserverRef.current = new ResizeObserver(() => {
      updatePosition()
    })

    resizeObserverRef.current.observe(popover)

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
        resizeObserverRef.current = null
      }
    }
  }, [isOpen, popoverRef, updatePosition])

  return position
}
