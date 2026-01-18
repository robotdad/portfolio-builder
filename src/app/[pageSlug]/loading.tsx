import { SkeletonGrid } from '@/components/ui'

/**
 * Loading state for category/page routes
 * Shows skeleton grid while content loads
 */
export default function CategoryLoading() {
  return (
    <div className="portfolio-page">
      <div className="category-loading" aria-label="Loading category" role="status">
        {/* Navigation skeleton */}
        <header className="portfolio-nav-skeleton">
          <div className="container">
            <div className="skeleton-text" style={{ width: '150px', height: '1.5em' }} />
          </div>
        </header>
        
        <main className="portfolio-main">
          <div className="container">
            {/* Header skeleton */}
            <header className="category-header">
              <div className="skeleton-text" style={{ width: '120px', height: '1em', marginBottom: 'var(--space-2)' }} />
              <div className="skeleton-text skeleton-text--heading" style={{ width: '200px' }} />
            </header>
            
            {/* Grid skeleton */}
            <SkeletonGrid count={6} columns={{ mobile: 1, tablet: 2, desktop: 3 }} />
          </div>
        </main>
      </div>
    </div>
  )
}
