'use client'

import React from 'react'
import Link from 'next/link'
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb'
import { HamburgerButton } from './HamburgerButton'
import { useAdminLayout } from './AdminLayout'

// ============================================================================
// Types
// ============================================================================

/**
 * Props for AdminPageHeader component
 */
export interface AdminPageHeaderProps {
  /**
   * Navigation context - determines left side of header
   * - 'dashboard': Logo + global nav links (Level 1)
   * - 'breadcrumb': Breadcrumb trail (Level 2+)
   */
  navigation: 
    | { type: 'dashboard'; title?: string }
    | { type: 'breadcrumb'; items: BreadcrumbItem[] }
  
  /**
   * Page title - shown below breadcrumb on mobile, optional on desktop
   */
  title?: string
  
  /**
   * Action buttons for header right side
   * Compose your own - header provides the container
   */
  actions?: React.ReactNode
  
  /**
   * Whether to show mobile hamburger menu button
   * @default true
   */
  showMobileMenu?: boolean
  
  /**
   * Optional className for customization
   */
  className?: string
}

// ============================================================================
// Component
// ============================================================================

/**
 * AdminPageHeader - Unified header component for all admin pages
 * 
 * Features:
 * - Sticky positioning with backdrop blur
 * - Responsive hamburger menu (hidden on desktop ≥1024px)
 * - Two navigation modes: dashboard logo or breadcrumb trail
 * - Flexible actions slot for page-specific buttons
 * - Semantic HTML with proper accessibility
 * 
 * Navigation Pattern:
 * - Level 1 (Dashboard): Use type='dashboard' (shows logo)
 * - Level 2+ (All other pages): Use type='breadcrumb' with full trail
 * 
 * @example
 * ```tsx
 * // Dashboard
 * <AdminPageHeader
 *   navigation={{ type: 'dashboard', title: 'Portfolio Builder' }}
 *   actions={<PublishButton />}
 * />
 * 
 * // Category page
 * <AdminPageHeader
 *   navigation={{ 
 *     type: 'breadcrumb', 
 *     items: [
 *       { label: 'Dashboard', href: '/admin' },
 *       { label: 'Categories' }
 *     ]
 *   }}
 *   title="Categories"
 *   actions={<button>+ New Category</button>}
 * />
 * ```
 */
export function AdminPageHeader({
  navigation,
  title,
  actions,
  showMobileMenu = true,
  className = '',
}: AdminPageHeaderProps) {
  const { isSidebarOpen, toggleSidebar } = useAdminLayout()
  
  return (
    <>
      <header className={`admin-page-header ${className}`}>
        <div className="admin-page-header-content">
          {/* Left: Mobile menu + Navigation */}
          <div className="header-left">
            {showMobileMenu && (
              <HamburgerButton
                isOpen={isSidebarOpen}
                onClick={toggleSidebar}
              />
            )}
            
            {navigation.type === 'dashboard' && (
              <Link href="/admin" className="dashboard-logo">
                {navigation.title || 'Portfolio Builder'}
              </Link>
            )}
            
            {navigation.type === 'breadcrumb' && (
              <div className="breadcrumb-wrapper">
                <Breadcrumb items={navigation.items} />
                {title && <h1 className="page-title">{title}</h1>}
              </div>
            )}
          </div>
          
          {/* Right: Actions */}
          {actions && (
            <div className="header-actions">
              {actions}
            </div>
          )}
        </div>
      </header>
      <style jsx>{`
        .admin-page-header {
          position: sticky;
          top: 0;
          z-index: 10;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--admin-border);
        }
        
        .admin-page-header-content {
          max-width: var(--content-max-width, 1200px);
          margin: 0 auto;
          padding: var(--space-3, 12px) var(--space-4, 16px);
          min-height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4, 16px);
        }
        
        @media (min-width: 1024px) {
          .admin-page-header-content {
            padding: var(--space-4, 16px) var(--space-6, 24px);
            min-height: 64px;
          }
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: var(--space-3, 12px);
          flex: 1;
          min-width: 0; /* Allow flex child to shrink */
        }
        
        /* Hide hamburger on desktop (≥1024px) via CSS to avoid hydration mismatch */
        @media (min-width: 1024px) {
          .header-left :global(button[data-testid="hamburger-btn"]) {
            display: none;
          }
        }
        
        .header-left :global(.dashboard-logo) {
          font-size: var(--font-size-lg, 18px);
          font-weight: var(--font-weight-semibold, 600);
          color: var(--admin-text);
          text-decoration: none;
          transition: color var(--transition-fast, 150ms);
        }
        
        .header-left :global(.dashboard-logo:hover) {
          color: var(--admin-primary);
        }
        
        .header-left :global(.dashboard-logo:focus) {
          outline: 2px solid var(--admin-primary);
          outline-offset: 2px;
          border-radius: 2px;
        }
        
        .breadcrumb-wrapper {
          display: flex;
          flex-direction: column;
          gap: var(--space-2, 8px);
          min-width: 0; /* Allow breadcrumb to shrink */
        }
        
        .page-title {
          margin: 0;
          font-size: var(--font-size-lg, 18px);
          font-weight: var(--font-weight-semibold, 600);
          color: var(--admin-text);
        }
        
        @media (min-width: 768px) {
          .page-title {
            font-size: var(--font-size-xl, 20px);
          }
        }
        
        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3, 12px);
          flex-shrink: 0; /* Prevent actions from shrinking */
        }
      `}</style>
    </>
  )
}

export default AdminPageHeader
