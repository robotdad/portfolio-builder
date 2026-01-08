/**
 * ViewLinksGroup Component
 * 
 * Provides consistent "View Draft" and "View Live" links for navigating to preview
 * and published versions of portfolio content across admin pages.
 * 
 * @example
 * ```tsx
 * <ViewLinksGroup
 *   draftUrl={`/preview/${portfolio.slug}`}
 *   liveUrl={`/${portfolio.slug}`}
 *   hasPublishedVersion={!!portfolio.lastPublishedAt}
 * />
 * ```
 */

interface ViewLinksGroupProps {
  /** URL to draft preview (e.g., /preview/julian-vane) */
  draftUrl: string
  /** URL to published version (e.g., /julian-vane) */
  liveUrl: string
  /** Whether published version exists (hides Live link if false) */
  hasPublishedVersion: boolean
  /** Optional className for styling */
  className?: string
}

/**
 * Eye icon (12px) - outline style
 */
function EyeIcon() {
  return (
    <svg
      className="view-link-icon-eye"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

/**
 * External link icon (10px) - arrow up right
 */
function ExternalLinkIcon() {
  return (
    <svg
      className="view-link-icon-external"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

export default function ViewLinksGroup({
  draftUrl,
  liveUrl,
  hasPublishedVersion,
  className = '',
}: ViewLinksGroupProps) {
  return (
    <div className={`view-links-group ${className}`.trim()}>
      {/* View Draft Link */}
      <a
        href={draftUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="view-link view-link--draft"
        aria-label="View draft preview in new tab"
        title="View draft preview"
      >
        <EyeIcon />
        <span>View Draft</span>
        <ExternalLinkIcon />
      </a>

      {/* View Live Link - only shown if published version exists */}
      {hasPublishedVersion && (
        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="view-link view-link--live"
          aria-label="View published version in new tab"
          title="View published version"
        >
          <EyeIcon />
          <span>View Live</span>
          <ExternalLinkIcon />
        </a>
      )}
    </div>
  )
}
