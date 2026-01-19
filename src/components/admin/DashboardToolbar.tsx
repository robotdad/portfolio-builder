'use client'

import React from 'react'
import { SiteStatusIndicator } from './SiteStatusIndicator'
import ViewLinksGroup from './ViewLinksGroup'

// ============================================================================
// Types
// ============================================================================

/**
 * Site status configuration for the dashboard
 */
export interface SiteStatus {
  /** Whether there are any unpublished changes across the site */
  hasUnpublishedChanges: boolean
  /** Number of items with unpublished changes */
  unpublishedCount: number
}

/**
 * View links configuration for the dashboard
 */
export interface ViewLinks {
  /** URL to draft preview (e.g., /preview) */
  draftUrl: string
  /** URL to published version (e.g., /) */
  liveUrl: string
}

/**
 * Props for DashboardToolbar component
 */
export interface DashboardToolbarProps {
  /**
   * Site-wide status information
   */
  siteStatus: SiteStatus
  
  /**
   * View links configuration
   */
  viewLinks: ViewLinks
  
  /**
   * Optional className for customization
   */
  className?: string
}

// ============================================================================
// Component
// ============================================================================

/**
 * DashboardToolbar - Dedicated toolbar for dashboard page
 * 
 * Sits below AdminPageHeader to provide site-wide context and navigation
 * without cramming them into the header. Keeps header clean and consistent.
 * 
 * Features:
 * - Sticky positioning below header
 * - Site-wide status indicator (all published vs has drafts)
 * - View links (Draft/Live preview)
 * - Responsive layout (stacks on mobile)
 * 
 * Key Difference from AdminEditorToolbar:
 * - NO "Save Draft" or "Publish" buttons (those are for individual items)
 * - Shows SITE-WIDE status instead of single item status
 * - Simpler: Status + View Links only
 * 
 * Usage:
 * Place directly below AdminPageHeader on dashboard page:
 * 
 * @example
 * ```tsx
 * <AdminPageHeader
 *   navigation={{ type: 'dashboard', title: 'Dashboard' }}
 * />
 * 
 * <DashboardToolbar
 *   siteStatus={{
 *     hasUnpublishedChanges: true,
 *     unpublishedCount: 3
 *   }}
 *   viewLinks={{
 *     draftUrl: '/preview',
 *     liveUrl: '/'
 *   }}
 * />
 * ```
 */
export function DashboardToolbar({
  siteStatus,
  viewLinks,
  className = '',
}: DashboardToolbarProps) {
  return (
    <>
      <div className={`dashboard-toolbar ${className}`}>
        <div className="toolbar-content">
          {/* Left: Status and view links */}
          <div className="toolbar-left">
            <SiteStatusIndicator
              hasUnpublishedChanges={siteStatus.hasUnpublishedChanges}
              unpublishedCount={siteStatus.unpublishedCount}
            />
            <div className="toolbar-divider" aria-hidden="true" />
            <ViewLinksGroup
              draftUrl={viewLinks.draftUrl}
              liveUrl={viewLinks.liveUrl}
              hasPublishedVersion={true}
            />
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .dashboard-toolbar {
          position: sticky;
          top: 56px; /* Below mobile header height */
          z-index: 9;
          background: var(--admin-bg, #ffffff);
          border-bottom: 1px solid var(--admin-border, #e5e7eb);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        
        @media (min-width: 1024px) {
          .dashboard-toolbar {
            top: 64px; /* Below desktop header height */
          }
        }
        
        .toolbar-content {
          max-width: var(--content-max-width, 1200px);
          margin: 0 auto;
          padding: var(--space-3, 12px) var(--space-4, 16px);
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: var(--space-4, 16px);
        }
        
        @media (min-width: 1024px) {
          .toolbar-content {
            padding: var(--space-3, 12px) var(--space-6, 24px);
          }
        }
        
        .toolbar-left {
          display: flex;
          align-items: center;
          gap: var(--space-3, 12px);
          flex: 1;
          min-width: 0;
        }
        
        .toolbar-divider {
          width: 1px;
          height: 24px;
          background: var(--admin-border, #e5e7eb);
          flex-shrink: 0;
        }
        
        /* Mobile: Stack on very small screens */
        @media (max-width: 640px) {
          .toolbar-content {
            flex-direction: column;
            align-items: stretch;
            gap: var(--space-3, 12px);
          }
          
          .toolbar-left {
            justify-content: center;
            flex-wrap: wrap;
          }
          
          .toolbar-divider {
            display: none;
          }
        }
        
        /* Tablet: Allow wrap but keep horizontal */
        @media (min-width: 641px) and (max-width: 1023px) {
          .toolbar-content {
            flex-wrap: wrap;
          }
          
          .toolbar-left {
            flex-basis: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  )
}

export default DashboardToolbar
