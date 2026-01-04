import Link from 'next/link'

/**
 * Portfolio Not Found Page
 * 
 * Shown when portfolio slug doesn't exist.
 * Encourages user to create their portfolio.
 */
export default function PortfolioNotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <span className="not-found-code">404</span>
        <h1 className="not-found-title">Portfolio Not Found</h1>
        <p className="not-found-message">
          This portfolio doesn&apos;t exist or is no longer available.
        </p>
        <Link href="/admin" className="not-found-action btn btn-primary">
          Create Your Portfolio
        </Link>
      </div>
    </div>
  )
}
