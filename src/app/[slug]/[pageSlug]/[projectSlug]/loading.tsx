import { SkeletonGrid } from '@/components/ui'

/**
 * Loading state for project detail page
 * Shows skeleton for project info and gallery
 */
export default function ProjectLoading() {
  return (
    <div className="portfolio-page">
      <div className="project-loading" aria-label="Loading project" role="status">
        {/* Navigation skeleton */}
        <header className="portfolio-nav-skeleton">
          <div className="container">
            <div className="skeleton-text" style={{ width: '150px', height: '1.5em' }} />
          </div>
        </header>
        
        <main className="portfolio-main">
          <div className="container">
            {/* Breadcrumb skeleton */}
            <div className="skeleton-text" style={{ width: '200px', height: '1em', marginBottom: 'var(--space-4)' }} />
            
            {/* Project header skeleton */}
            <header className="project-header-skeleton">
              <div className="skeleton-text skeleton-text--heading" style={{ width: '60%', marginBottom: 'var(--space-2)' }} />
              <div className="skeleton-text" style={{ width: '40%', height: '1em' }} />
            </header>
            
            {/* Gallery skeleton */}
            <section className="project-gallery-section" style={{ marginTop: 'var(--space-8)' }}>
              <SkeletonGrid count={4} columns={{ mobile: 1, tablet: 2, desktop: 2 }} />
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
