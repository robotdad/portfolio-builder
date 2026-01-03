'use client'

// ============================================================================
// HomeBadge Component
// ============================================================================
// Displays a badge indicating the homepage, replacing the small icon that
// was easy to miss. Uses accent color for visibility.
//
// Usage:
//   <HomeBadge />           // Full version with "Home" text
//   <HomeBadge compact />   // Compact version with just star
// ============================================================================

interface HomeBadgeProps {
  compact?: boolean
  className?: string
}

export function HomeBadge({ compact = false, className = '' }: HomeBadgeProps) {
  return (
    <>
      <span 
        className={`home-badge ${compact ? 'home-badge--compact' : ''} ${className}`}
        aria-label="Homepage"
      >
        {compact ? '★' : 'Home'}
      </span>
      
      <style jsx>{`
        .home-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 2px 8px;
          background: var(--admin-primary, #3b82f6);
          color: white;
          font-size: var(--font-size-xs, 0.75rem);
          font-weight: 600;
          border-radius: var(--radius-md, 6px);
          text-transform: uppercase;
          letter-spacing: 0.025em;
          line-height: 1.4;
          white-space: nowrap;
        }
        
        .home-badge--compact {
          padding: 2px 6px;
          font-size: var(--font-size-sm, 0.875rem);
        }
      `}</style>
    </>
  )
}

export type { HomeBadgeProps }
