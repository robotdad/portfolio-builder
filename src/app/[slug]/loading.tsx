import { FeaturedWorkSkeleton } from '@/components/portfolio/SkeletonCard'

/**
 * Loading state for portfolio homepage
 * Shows skeleton screen while page data loads
 */
export default function PortfolioLoading() {
  return (
    <div className="portfolio-page">
      <div className="portfolio-loading" aria-label="Loading portfolio" role="status">
        {/* Navigation skeleton */}
        <header className="portfolio-nav-skeleton">
          <div className="container">
            <div className="skeleton-text" style={{ width: '150px', height: '1.5em' }} />
          </div>
        </header>
        
        {/* Hero skeleton */}
        <section className="hero-skeleton">
          <div className="skeleton-image" style={{ width: '150px', height: '150px', borderRadius: '50%' }} />
          <div className="skeleton-text skeleton-text--name" />
          <div className="skeleton-text skeleton-text--title" />
        </section>
        
        {/* Featured work skeleton */}
        <FeaturedWorkSkeleton />
      </div>
    </div>
  )
}
