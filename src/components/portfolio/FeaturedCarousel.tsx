'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// =============================================================================
// TYPES
// =============================================================================

interface FeaturedProject {
  id: string
  slug: string
  title: string
  venue: string | null
  year: string | null
  featuredImageUrl: string | null
  featuredImageAlt?: string
  categorySlug: string
  categoryName: string
}

interface FeaturedCarouselProps {
  portfolioSlug: string
  projects: FeaturedProject[]
  heading?: string
  autoRotate?: boolean
  autoRotateInterval?: number
}

// =============================================================================
// ICONS (inline SVG to avoid dependencies)
// =============================================================================

function ChevronLeftIcon() {
  return (
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
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
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
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

// =============================================================================
// CAROUSEL SLIDE COMPONENT
// =============================================================================

interface CarouselSlideProps {
  project: FeaturedProject
  portfolioSlug: string
  isActive: boolean
  isExiting: boolean
  transitionDuration: number
}

function CarouselSlide({
  project,
  portfolioSlug,
  isActive,
  isExiting,
  transitionDuration,
}: CarouselSlideProps) {
  const href = `/${portfolioSlug}/${project.categorySlug}/${project.slug}`

  // Determine CSS classes based on state
  let stateClass = ''
  if (isActive) {
    stateClass = 'carousel-slide-active'
  } else if (isExiting) {
    stateClass = 'carousel-slide-exiting'
  }

  return (
    <div
      className={`carousel-slide ${stateClass}`}
      role="group"
      aria-roledescription="slide"
      aria-label={`${project.title}`}
      aria-hidden={!isActive}
      style={{
        transitionDuration: `${transitionDuration}ms`,
      }}
    >
      <Link href={href} className="carousel-slide-link">
        {project.featuredImageUrl ? (
          <Image
            src={project.featuredImageUrl}
            alt={project.featuredImageAlt || project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
            className="carousel-slide-image"
            priority={isActive}
          />
        ) : (
          <div className="carousel-slide-placeholder" aria-hidden="true">
            <span>No Image</span>
          </div>
        )}

        {/* Overlay - always visible */}
        <div className="carousel-slide-overlay">
          <div className="carousel-slide-info">
            <h3 className="carousel-slide-title">{project.title}</h3>
            <p className="carousel-slide-meta">
              {project.venue && <span>{project.venue}</span>}
              {project.venue && project.year && <span> · </span>}
              {project.year && <span>{project.year}</span>}
            </p>
          </div>
        </div>
      </Link>
    </div>
  )
}

// =============================================================================
// MAIN CAROUSEL COMPONENT
// =============================================================================

/**
 * FeaturedCarousel Component
 *
 * A full-featured, accessible carousel for featured portfolio projects:
 * - Auto-rotation with configurable interval (default 5s)
 * - Pauses on hover, touch, focus, and manual interaction
 * - Touch swipe support for mobile
 * - Keyboard navigation (Arrow keys, Home, End, Escape)
 * - Crossfade transitions (800ms auto, 600ms manual)
 * - Pause/Play button (WCAG compliance)
 * - Reduced motion support
 * - Responsive: 16:9 desktop, 4:3 mobile
 */
export function FeaturedCarousel({
  portfolioSlug,
  projects,
  heading = 'Featured Work',
  autoRotate = true,
  autoRotateInterval = 5000,
}: FeaturedCarouselProps) {
  // Limit to 6 projects max
  const displayProjects = projects.slice(0, 6)

  // Initialize prefersReducedMotion with SSR-safe default
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  // State
  const [currentIndex, setCurrentIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState<number | null>(null)
  // Initialize isPlaying based on autoRotate and reduced motion preference
  const [isPlaying, setIsPlaying] = useState(() => {
    if (typeof window === 'undefined') return autoRotate
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return autoRotate && !reducedMotion
  })
  const [isManualInteraction, setIsManualInteraction] = useState(false)
  const [transitionDuration, setTransitionDuration] = useState(800) // Auto transition
  const [userPaused, setUserPaused] = useState(false) // WCAG 2.2.2: Track explicit user pause

  // Touch state
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Refs
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  const minSwipeDistance = 50
  const hoverResumeDelay = 1000
  const manualResumeDelay = 10000

  // ==========================================================================
  // REDUCED MOTION CHECK - Subscribe to changes only
  // ==========================================================================

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
      if (e.matches) {
        setIsPlaying(false)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // ==========================================================================
  // NAVIGATION FUNCTIONS
  // ==========================================================================

  const goToSlide = useCallback(
    (index: number, isManual = false) => {
      if (index === currentIndex) return

      // Set transition duration based on interaction type
      const duration = prefersReducedMotion ? 0 : isManual ? 600 : 800
      setTransitionDuration(duration)

      // Track previous slide for exit animation
      setPreviousIndex(currentIndex)
      setCurrentIndex(index)

      // Clear previous index after transition completes
      setTimeout(() => {
        setPreviousIndex(null)
      }, duration)

      // Handle manual interaction pause/resume
      if (isManual) {
        setIsManualInteraction(true)
        setIsPlaying(false)

        // Clear any existing resume timeout
        if (resumeTimeoutRef.current) {
          clearTimeout(resumeTimeoutRef.current)
        }

        // WCAG 2.2.2: Only schedule auto-resume if user hasn't explicitly paused
        if (autoRotate && !prefersReducedMotion && !userPaused) {
          resumeTimeoutRef.current = setTimeout(() => {
            setIsManualInteraction(false)
            setIsPlaying(true)
          }, manualResumeDelay)
        }
      }
    },
    [currentIndex, prefersReducedMotion, autoRotate, userPaused]
  )

  const goNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % displayProjects.length
    goToSlide(nextIndex, true)
  }, [currentIndex, displayProjects.length, goToSlide])

  const goPrev = useCallback(() => {
    const prevIndex =
      (currentIndex - 1 + displayProjects.length) % displayProjects.length
    goToSlide(prevIndex, true)
  }, [currentIndex, displayProjects.length, goToSlide])

  const goFirst = useCallback(() => {
    goToSlide(0, true)
  }, [goToSlide])

  const goLast = useCallback(() => {
    goToSlide(displayProjects.length - 1, true)
  }, [displayProjects.length, goToSlide])

  // ==========================================================================
  // AUTO-ROTATION
  // ==========================================================================

  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Only auto-rotate if playing and more than 1 slide
    if (isPlaying && displayProjects.length > 1 && !prefersReducedMotion) {
      intervalRef.current = setInterval(() => {
        setTransitionDuration(prefersReducedMotion ? 0 : 800)
        setPreviousIndex(() => {
          // Use functional update to get current index
          return currentIndex
        })
        setCurrentIndex((prev) => (prev + 1) % displayProjects.length)

        // Clear previous index after transition
        setTimeout(() => {
          setPreviousIndex(null)
        }, 800)
      }, autoRotateInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [
    isPlaying,
    displayProjects.length,
    autoRotateInterval,
    prefersReducedMotion,
    currentIndex,
  ])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current)
    }
  }, [])

  // ==========================================================================
  // PAUSE/PLAY HANDLERS
  // ==========================================================================

  const pause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const play = useCallback(() => {
    if (!prefersReducedMotion) {
      setIsPlaying(true)
    }
  }, [prefersReducedMotion])

  // ==========================================================================
  // HOVER HANDLERS (desktop)
  // ==========================================================================

  const handleMouseEnter = useCallback(() => {
    if (!isManualInteraction) {
      pause()
    }
  }, [isManualInteraction, pause])

  const handleMouseLeave = useCallback(() => {
    // WCAG 2.2.2: Only resume if user hasn't explicitly paused and autoRotate is enabled
    if (!isManualInteraction && autoRotate && !prefersReducedMotion && !userPaused) {
      // Clear any existing resume timeout
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current)
      }

      // Resume after hover leave delay (1s)
      resumeTimeoutRef.current = setTimeout(() => {
        play()
      }, hoverResumeDelay)
    }
  }, [isManualInteraction, autoRotate, prefersReducedMotion, userPaused, play])

  // ==========================================================================
  // TOUCH HANDLERS (mobile swipe)
  // ==========================================================================

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setTouchEnd(null)
      setTouchStart(e.targetTouches[0].clientX)
      pause()
    },
    [pause]
  )

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      goToSlide((currentIndex + 1) % displayProjects.length, true)
    } else if (isRightSwipe) {
      goToSlide(
        (currentIndex - 1 + displayProjects.length) % displayProjects.length,
        true
      )
    }

    setTouchStart(null)
    setTouchEnd(null)
  }, [touchStart, touchEnd, currentIndex, displayProjects.length, goToSlide])

  // ==========================================================================
  // KEYBOARD NAVIGATION
  // ==========================================================================

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          goPrev()
          break
        case 'ArrowRight':
          e.preventDefault()
          goNext()
          break
        case 'Home':
          e.preventDefault()
          goFirst()
          break
        case 'End':
          e.preventDefault()
          goLast()
          break
        case 'Escape':
          e.preventDefault()
          setIsPlaying(false)
          setUserPaused(true) // WCAG 2.2.2: Escape is explicit user pause
          break
      }
    },
    [goPrev, goNext, goFirst, goLast]
  )

  // Pause on focus within carousel
  const handleFocus = useCallback(() => {
    if (!isManualInteraction) {
      pause()
    }
  }, [isManualInteraction, pause])

  // ==========================================================================
  // RENDER
  // ==========================================================================

  // Edge case: no projects
  if (displayProjects.length === 0) {
    return null
  }

  // Edge case: single project (show without controls)
  const showControls = displayProjects.length > 1

  return (
    <section className="featured-carousel-section">
      {heading && <h2 className="featured-carousel-heading">{heading}</h2>}

      <div
        ref={carouselRef}
        className="featured-carousel"
        role="region"
        aria-label="Featured work carousel"
        aria-roledescription="carousel"
        tabIndex={0}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
      >
        <div className="carousel-viewport">
          <div className="carousel-slides">
            {displayProjects.map((project, index) => (
              <CarouselSlide
                key={project.id}
                project={project}
                portfolioSlug={portfolioSlug}
                isActive={index === currentIndex}
                isExiting={index === previousIndex}
                transitionDuration={transitionDuration}
              />
            ))}
          </div>
        </div>

        {/* Navigation - only if more than 1 slide */}
        {showControls && (
          <>
            {/* Prev/Next buttons - hidden on mobile via CSS */}
            <button
              className="carousel-nav-button carousel-nav-prev"
              onClick={goPrev}
              aria-label="Previous slide"
              type="button"
            >
              <ChevronLeftIcon />
            </button>
            <button
              className="carousel-nav-button carousel-nav-next"
              onClick={goNext}
              aria-label="Next slide"
              type="button"
            >
              <ChevronRightIcon />
            </button>

            {/* Indicators */}
            <div
              className="carousel-indicators"
              role="tablist"
              aria-label="Slide indicators"
            >
              {displayProjects.map((project, index) => (
                <button
                  key={project.id}
                  className={`carousel-indicator ${
                    index === currentIndex ? 'carousel-indicator-active' : ''
                  }`}
                  onClick={() => goToSlide(index, true)}
                  aria-label={`Go to slide ${index + 1}: ${project.title}`}
                  aria-selected={index === currentIndex}
                  aria-current={index === currentIndex ? 'true' : undefined}
                  role="tab"
                  type="button"
                />
              ))}
            </div>

            {/* Pause/Play button - hidden if reduced motion */}
            {!prefersReducedMotion && (
              <button
                className="carousel-pause-button"
                onClick={() => {
                  // WCAG 2.2.2: Track explicit user pause to prevent auto-resume
                  if (isPlaying) {
                    setUserPaused(true)
                  } else {
                    setUserPaused(false)
                  }
                  setIsPlaying(!isPlaying)
                }}
                aria-label={isPlaying ? 'Pause carousel' : 'Play carousel'}
                type="button"
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
            )}
          </>
        )}

        {/* Screen reader announcement */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Slide {currentIndex + 1} of {displayProjects.length}:{' '}
          {displayProjects[currentIndex]?.title}
        </div>
      </div>
    </section>
  )
}
