// ============================================================================
// PublicFooter - Shared footer for public portfolio pages
// ============================================================================

interface PublicFooterProps {
  portfolioName: string
  /** Optional additional content to render in the footer */
  children?: React.ReactNode
}

export function PublicFooter({ portfolioName, children }: PublicFooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="portfolio-footer">
      <div className="container">
        {children}
        <p>© {currentYear} {portfolioName}</p>
      </div>
    </footer>
  )
}

export default PublicFooter
