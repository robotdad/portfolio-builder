import Link from 'next/link'

/**
 * Category/Page Not Found
 * 
 * Shown when category or page slug doesn't exist within a portfolio.
 * Links back to portfolio home.
 */
export default function CategoryNotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <span className="not-found-code">404</span>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-message">
          This category or page doesn&apos;t exist in this portfolio.
        </p>
        <Link href="/" className="not-found-action btn btn-secondary">
          Browse Portfolios
        </Link>
      </div>
    </div>
  )
}
