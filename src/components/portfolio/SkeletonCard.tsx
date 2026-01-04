'use client'

interface SkeletonCardProps {
  aspectRatio?: '16/9' | '4/3' | '3/2'
  showText?: boolean
  className?: string
}

/**
 * SkeletonCard Component
 * 
 * Loading placeholder card with shimmer animation.
 * Matches real card dimensions to prevent layout shift.
 * Respects prefers-reduced-motion preference.
 */
export function SkeletonCard({
  aspectRatio = '16/9',
  showText = true,
  className = ''
}: SkeletonCardProps) {
  return (
    <div className={`skeleton-card ${className}`} aria-label="Loading" role="status">
      <div 
        className="skeleton-image"
        style={{ aspectRatio }}
      />
      {showText && (
        <div className="skeleton-text-group">
          <div className="skeleton-text skeleton-text--title" />
          <div className="skeleton-text skeleton-text--subtitle" />
        </div>
      )}
    </div>
  )
}

interface SkeletonGridProps {
  count?: number
  aspectRatio?: '16/9' | '4/3' | '3/2'
  showText?: boolean
  className?: string
}

/**
 * SkeletonGrid Component
 * 
 * Grid of skeleton cards for loading states.
 * Default count matches typical content grids.
 */
export function SkeletonGrid({
  count = 6,
  aspectRatio = '16/9',
  showText = true,
  className = ''
}: SkeletonGridProps) {
  return (
    <div className={`skeleton-grid ${className}`} aria-label="Loading content" role="status">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard
          key={i}
          aspectRatio={aspectRatio}
          showText={showText}
        />
      ))}
    </div>
  )
}

/**
 * SkeletonText Component
 * 
 * Single line skeleton for text placeholders.
 */
export function SkeletonText({ 
  width = '100%',
  height = '1em',
  className = ''
}: {
  width?: string
  height?: string
  className?: string
}) {
  return (
    <div 
      className={`skeleton-text ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

/**
 * FeaturedWorkSkeleton Component
 * 
 * Complete skeleton for featured work section.
 * Shows heading skeleton + 6 card grid.
 */
export function FeaturedWorkSkeleton() {
  return (
    <section className="section section-featured-grid" aria-label="Loading featured work" role="status">
      <div className="skeleton-text skeleton-text--heading" style={{ width: '40%', marginBottom: 'var(--space-6)' }} />
      <SkeletonGrid count={6} aspectRatio="16/9" showText={true} className="featured-grid" />
    </section>
  )
}

/**
 * CategoryGridSkeleton Component
 * 
 * Skeleton for category project grids.
 * Shows 12 cards to match typical category page.
 */
export function CategoryGridSkeleton() {
  return (
    <div className="category-grid" aria-label="Loading projects" role="status">
      {Array.from({ length: 12 }).map((_, i) => (
        <SkeletonCard key={i} aspectRatio="16/9" showText={true} />
      ))}
    </div>
  )
}

/**
 * GallerySkeleton Component
 * 
 * Skeleton for project gallery grids.
 * Shows 8 cards in gallery layout.
 */
export function GallerySkeleton() {
  return (
    <div className="project-gallery" aria-label="Loading gallery" role="status">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-image" style={{ aspectRatio: '3/2' }} />
        </div>
      ))}
    </div>
  )
}
