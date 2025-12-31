'use client'

import { useEffect, useCallback, useState, useRef } from 'react'

interface LightboxImage {
  imageUrl: string
  altText?: string
  caption?: string
}

interface LightboxProps {
  images: LightboxImage[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

/**
 * Lightbox Component
 * 
 * Full-screen image viewer for gallery images with:
 * - Keyboard navigation (Escape, Arrow keys)
 * - Touch/swipe support for mobile
 * - Focus trap for accessibility
 * - Body scroll lock when open
 * - Fade animation with reduced motion support
 */
export function Lightbox({ 
  images, 
  currentIndex, 
  onClose, 
  onNavigate 
}: LightboxProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  
  const overlayRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const prevButtonRef = useRef<HTMLButtonElement>(null)
  const nextButtonRef = useRef<HTMLButtonElement>(null)

  const currentImage = images[currentIndex]
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < images.length - 1

  // Fade in on mount
  useEffect(() => {
    // Small delay to trigger CSS transition
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  // Body scroll lock
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  // Focus trap - focus close button on mount
  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowLeft':
        if (hasPrev) onNavigate(currentIndex - 1)
        break
      case 'ArrowRight':
        if (hasNext) onNavigate(currentIndex + 1)
        break
      case 'Tab':
        // Focus trap - cycle through close, prev, next buttons
        e.preventDefault()
        const focusableElements = [
          closeButtonRef.current,
          hasPrev ? prevButtonRef.current : null,
          hasNext ? nextButtonRef.current : null,
        ].filter(Boolean) as HTMLElement[]
        
        const currentFocusIndex = focusableElements.findIndex(
          el => el === document.activeElement
        )
        
        let nextIndex: number
        if (e.shiftKey) {
          nextIndex = currentFocusIndex <= 0 
            ? focusableElements.length - 1 
            : currentFocusIndex - 1
        } else {
          nextIndex = currentFocusIndex >= focusableElements.length - 1 
            ? 0 
            : currentFocusIndex + 1
        }
        
        focusableElements[nextIndex]?.focus()
        break
    }
  }, [currentIndex, hasPrev, hasNext, onClose, onNavigate])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Touch/swipe handling
  const minSwipeDistance = 50

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && hasNext) {
      onNavigate(currentIndex + 1)
    } else if (isRightSwipe && hasPrev) {
      onNavigate(currentIndex - 1)
    }

    setTouchStart(null)
    setTouchEnd(null)
  }

  // Click outside image to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose()
    }
  }

  const handlePrev = () => {
    if (hasPrev) onNavigate(currentIndex - 1)
  }

  const handleNext = () => {
    if (hasNext) onNavigate(currentIndex + 1)
  }

  if (!currentImage) return null

  return (
    <div
      ref={overlayRef}
      className={`lightbox-overlay ${isVisible ? 'lightbox-visible' : ''}`}
      onClick={handleOverlayClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      {/* Close button */}
      <button
        ref={closeButtonRef}
        className="lightbox-close"
        onClick={onClose}
        aria-label="Close lightbox"
        type="button"
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
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Previous button */}
      {hasPrev && (
        <button
          ref={prevButtonRef}
          className="lightbox-nav lightbox-nav-prev"
          onClick={handlePrev}
          aria-label="Previous image"
          type="button"
        >
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {/* Next button */}
      {hasNext && (
        <button
          ref={nextButtonRef}
          className="lightbox-nav lightbox-nav-next"
          onClick={handleNext}
          aria-label="Next image"
          type="button"
        >
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {/* Image container */}
      <div className="lightbox-content">
        <img
          src={currentImage.imageUrl}
          alt={currentImage.altText || 'Gallery image'}
          className="lightbox-image"
        />
      </div>

      {/* Counter */}
      <div className="lightbox-counter" aria-live="polite">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Caption */}
      {currentImage.caption && (
        <div className="lightbox-caption">
          {currentImage.caption}
        </div>
      )}
    </div>
  )
}
