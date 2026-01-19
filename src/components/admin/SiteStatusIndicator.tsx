'use client'

/**
 * SiteStatusIndicator Component
 * 
 * Visual indicator showing site-wide draft/published status
 * Similar to DraftIndicator but for entire site context rather than individual items.
 * 
 * States:
 * - All Published (green): No items have unpublished changes
 * - Has Drafts (yellow): Some items have unpublished changes
 * 
 * Usage:
 * ```tsx
 * <SiteStatusIndicator
 *   hasUnpublishedChanges={true}
 *   unpublishedCount={3}
 * />
 * ```
 */

export interface SiteStatusIndicatorProps {
  /** Whether there are any unpublished changes across the site */
  hasUnpublishedChanges: boolean
  /** Number of items with unpublished changes */
  unpublishedCount: number
  /** Optional className for styling */
  className?: string
}

/**
 * CheckCircle icon (12px) - for published state
 */
function CheckCircleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

/**
 * Edit icon (12px) - for draft state
 */
function EditIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

export function SiteStatusIndicator({ 
  hasUnpublishedChanges, 
  unpublishedCount,
  className = '' 
}: SiteStatusIndicatorProps) {
  const getStatusConfig = () => {
    if (hasUnpublishedChanges) {
      return {
        label: `${unpublishedCount} item${unpublishedCount === 1 ? '' : 's'} with unpublished changes`,
        className: 'site-status-indicator--draft',
        icon: <EditIcon />,
      }
    }

    return {
      label: 'All content published',
      className: 'site-status-indicator--published',
      icon: <CheckCircleIcon />,
    }
  }

  const config = getStatusConfig()

  return (
    <>
      <div 
        className={`site-status-indicator ${config.className} ${className}`}
        role="status"
        aria-live="polite"
      >
        <span className="site-status-indicator-icon">{config.icon}</span>
        <span className="site-status-indicator-label">{config.label}</span>
      </div>

      <style jsx>{`
        .site-status-indicator {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2, 8px);
          padding: var(--space-2, 8px) var(--space-3, 12px);
          border-radius: var(--radius-full, 9999px);
          font-size: var(--text-sm, 14px);
          font-weight: 500;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .site-status-indicator-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .site-status-indicator-label {
          line-height: 1;
        }

        /* Published state - Green */
        .site-status-indicator--published {
          background: var(--color-success-bg, #f0fdf4);
          color: var(--color-success-text, #166534);
          border: 1px solid var(--color-success-border, #bbf7d0);
        }

        /* Draft state - Yellow/Amber */
        .site-status-indicator--draft {
          background: var(--color-warning-bg, #fffbeb);
          color: var(--color-warning-text, #92400e);
          border: 1px solid var(--color-warning-border, #fde68a);
        }

        /* Mobile: Hide long text, show shortened version */
        @media (max-width: 640px) {
          .site-status-indicator-label {
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      `}</style>
    </>
  )
}

export default SiteStatusIndicator
