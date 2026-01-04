import Link from 'next/link'

/**
 * Global 404 Page
 * 
 * Shown when no route matches.
 * Provides helpful messaging and navigation.
 */
export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <span className="not-found-code">404</span>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-message">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="not-found-action btn btn-primary">
          Return to Home
        </Link>
      </div>
    </div>
  )
}
