'use client'

import React from 'react'
import { DraftIndicator, type DraftStatus } from './DraftIndicator'
import ViewLinksGroup from './ViewLinksGroup'
import { PublishButton } from './PublishButton'

// ============================================================================
// Types
// ============================================================================

/**
 * Props for AdminEditorToolbar component
 */
export interface AdminEditorToolbarProps {
  /**
   * View links configuration
   */
  viewLinks: {
    draftUrl: string
    liveUrl: string
    hasPublishedVersion: boolean
  }
  
  /**
   * Current draft status
   */
  draftStatus: DraftStatus
  
  /**
   * Whether there are unpublished changes
   */
  hasUnpublishedChanges: boolean
  
  /**
   * Save draft handler
   */
  onSaveDraft: () => void
  
  /**
   * Publish handler
   */
  onPublish: () => Promise<boolean>
  
  /**
   * Whether save draft button should be disabled
   */
  isSaveDraftDisabled?: boolean
  
  /**
   * Optional className for customization
   */
  className?: string
}

// ============================================================================
// Component
// ============================================================================

/**
 * AdminEditorToolbar - Dedicated toolbar for editor pages
 * 
 * Sits below AdminPageHeader to provide editing workflow controls
 * without cramming them into the header. Keeps header clean and consistent.
 * 
 * Features:
 * - Sticky positioning below header
 * - Draft status indicator
 * - View links (Draft/Live preview)
 * - Save and publish actions
 * - Responsive layout (stacks on mobile)
 * 
 * Usage:
 * Place directly below AdminPageHeader in editor pages:
 * 
 * @example
 * ```tsx
 * <AdminPageHeader
 *   navigation={{ type: 'breadcrumb', items: [...] }}
 * />
 * 
 * <AdminEditorToolbar
 *   viewLinks={{
 *     draftUrl: '/preview/category/project',
 *     liveUrl: '/category/project',
 *     hasPublishedVersion: true
 *   }}
 *   draftStatus="draft"
 *   hasUnpublishedChanges={true}
 *   onSaveDraft={handleSave}
 *   onPublish={handlePublish}
 *   isSaveDraftDisabled={false}
 * />
 * ```
 */
export function AdminEditorToolbar({
  viewLinks,
  draftStatus,
  hasUnpublishedChanges,
  onSaveDraft,
  onPublish,
  isSaveDraftDisabled = false,
  className = '',
}: AdminEditorToolbarProps) {
  return (
    <>
      <div className={`admin-editor-toolbar ${className}`}>
        <div className="toolbar-content">
          {/* Left: Status and context */}
          <div className="toolbar-left">
            <DraftIndicator
              status={draftStatus}
              hasUnpublishedChanges={hasUnpublishedChanges}
            />
            <div className="toolbar-divider" aria-hidden="true" />
            <ViewLinksGroup
              draftUrl={viewLinks.draftUrl}
              liveUrl={viewLinks.liveUrl}
              hasPublishedVersion={viewLinks.hasPublishedVersion}
            />
          </div>
          
          {/* Right: Actions */}
          <div className="toolbar-right">
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isSaveDraftDisabled}
              className="btn btn-secondary"
            >
              Save Draft
            </button>
            <PublishButton
              hasChangesToPublish={hasUnpublishedChanges}
              onPublish={onPublish}
            />
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .admin-editor-toolbar {
          position: sticky;
          top: 56px; /* Below mobile header height */
          z-index: 9;
          background: var(--admin-bg, #ffffff);
          border-bottom: 1px solid var(--admin-border, #e5e7eb);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        
        @media (min-width: 1024px) {
          .admin-editor-toolbar {
            top: 64px; /* Below desktop header height */
          }
        }
        
        .toolbar-content {
          max-width: var(--content-max-width, 1200px);
          margin: 0 auto;
          padding: var(--space-3, 12px) var(--space-4, 16px);
          display: flex;
          align-items: center;
          justify-content: space-between;
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
        
        .toolbar-right {
          display: flex;
          align-items: center;
          gap: var(--space-3, 12px);
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
          
          .toolbar-right {
            justify-content: stretch;
          }
          
          .toolbar-right button {
            flex: 1;
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
          
          .toolbar-right {
            flex-basis: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  )
}

export default AdminEditorToolbar
