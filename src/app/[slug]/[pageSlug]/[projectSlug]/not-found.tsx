import Link from 'next/link'

/**
 * Project Not Found
 * 
 * Shown when project slug doesn't exist within a category.
 */
export default function ProjectNotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <span className="not-found-code">404</span>
        <h1 className="not-found-title">Project Not Found</h1>
        <p className="not-found-message">
          This project doesn&apos;t exist or has been removed.
        </p>
        <Link href="/" className="not-found-action btn btn-secondary">
          Browse Portfolios
        </Link>
      </div>
    </div>
  )
}
