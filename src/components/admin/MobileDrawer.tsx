'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap } from '@/hooks/useFocusTrap'

export interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

const SWIPE_THRESHOLD = 100 // pixels to trigger close

/**
 * MobileDrawer - Slide-in drawer for mobile navigation
 * 
 * Features:
 * - React Portal to render to document.body
 * - Slide animation from left
 * - Swipe-to-close gesture support
 * - Focus trap when open
 * - Escape key closes drawer
 * - Body scroll lock when open
 * - Safe area inset padding for notched devices
 * - Reduced motion support
 */
export function MobileDrawer({ isOpen, onClose, children }: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)
  useFocusTrap({ 
    isActive: isOpen,
    containerRef: drawerRef as React.RefObject<HTMLElement>
  })
  
  // Swipe gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchCurrent, setTouchCurrent] = useState<number | null>(null)
  const [isSwiping, setIsSwiping] = useState(false)
  
  // Calculate swipe offset (negative = swiping left to close)
  // For left-side drawer, swiping left (touchStart > touchCurrent) should close
  const swipeOffset = touchStart !== null && touchCurrent !== null
    ? Math.max(0, touchStart - touchCurrent) // Positive when swiping left
    : 0
  
  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
    setTouchCurrent(e.touches[0].clientX)
    setIsSwiping(true)
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return
    setTouchCurrent(e.touches[0].clientX)
  }
  
  const handleTouchEnd = () => {
    if (swipeOffset > SWIPE_THRESHOLD) {
      onClose()
    }
    setTouchStart(null)
    setTouchCurrent(null)
    setIsSwiping(false)
  }
  
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])
  
  // Handle Escape key to close drawer
  useEffect(() => {
    if (!isOpen) return
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])
  
  // Don't render on server or if document doesn't exist
  if (typeof document === 'undefined') {
    return null
  }
  
  // Calculate transform for swipe visual feedback
  // When swiping, translate drawer left by swipe amount
  const swipeTransform = isSwiping && swipeOffset > 0 && !prefersReducedMotion
    ? `translateX(-${swipeOffset}px)`
    : undefined
  
  const drawer = (
    <>
      <div
        ref={drawerRef}
        id="mobile-drawer"
        className="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        aria-label="Navigation menu"
        data-open={isOpen}
        data-swiping={isSwiping}
        style={swipeTransform ? { transform: swipeTransform } : undefined}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {children}
      </div>
      <style jsx>{`
        .mobile-drawer {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: var(--admin-sidebar-width-mobile, min(280px, 85vw));
          background-color: var(--admin-sidebar-bg);
          z-index: var(--z-admin-drawer, 130);
          transform: translateX(-100%);
          transition: transform var(--admin-transition-drawer, 250ms cubic-bezier(0.4, 0, 0.2, 1));
          overflow-y: auto;
          overscroll-behavior: contain;
          display: flex;
          flex-direction: column;
          /* Safe area inset for notched devices */
          padding-left: env(safe-area-inset-left, 0);
          padding-bottom: env(safe-area-inset-bottom, 0);
          /* Prevent text selection during swipe */
          touch-action: pan-y;
          user-select: none;
        }
        
        .mobile-drawer[data-open="true"] {
          transform: translateX(0);
        }
        
        /* Disable transition during swipe for responsive feedback */
        .mobile-drawer[data-swiping="true"] {
          transition: none;
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .mobile-drawer {
            transition: none;
          }
        }
      `}</style>
    </>
  )
  
  return createPortal(drawer, document.body)
}

export default MobileDrawer
