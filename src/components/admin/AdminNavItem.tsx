'use client'

import React from 'react'
import Link from 'next/link'

// Icon components - inline SVGs for performance
const DashboardIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
)

const FolderIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
)

// Icon map for dynamic icon selection
export const navIcons: Record<string, React.ComponentType> = {
  dashboard: DashboardIcon,
  folder: FolderIcon,
}

export interface AdminNavItemProps {
  label: string
  href: string
  icon: keyof typeof navIcons
  isActive: boolean
  testId?: string
}

/**
 * AdminNavItem - Individual navigation item in the admin sidebar
 * 
 * Features:
 * - Active state with aria-current="page"
 * - Visual active indicator (left border + background)
 * - Hover state
 * - 44px minimum height for touch targets
 */
export function AdminNavItem({ label, href, icon, isActive, testId }: AdminNavItemProps) {
  const IconComponent = navIcons[icon] || DashboardIcon
  
  return (
    <>
      <li className="admin-nav-item">
        <Link 
          href={href}
          className={`admin-nav-link ${isActive ? 'admin-nav-link--active' : ''}`}
          aria-current={isActive ? 'page' : undefined}
          data-testid={testId ?? `nav-item-${href.replace(/\//g, '-').replace(/^-/, '')}`}
        >
          <span className="admin-nav-icon">
            <IconComponent />
          </span>
          <span className="admin-nav-label">{label}</span>
        </Link>
      </li>
      <style jsx>{`
        .admin-nav-item {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        
        .admin-nav-item :global(.admin-nav-link) {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          min-height: 44px;
          padding: var(--space-2) var(--space-4);
          color: var(--admin-text);
          text-decoration: none;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          border-left: 4px solid transparent;
          transition: background-color var(--transition-fast), 
                      border-color var(--transition-fast),
                      color var(--transition-fast);
        }
        
        .admin-nav-item :global(.admin-nav-link:hover) {
          background-color: var(--admin-nav-item-hover);
        }
        
        .admin-nav-item :global(.admin-nav-link:focus) {
          outline: 2px solid var(--admin-primary);
          outline-offset: -2px;
        }
        
        .admin-nav-item :global(.admin-nav-link--active) {
          background-color: var(--admin-nav-item-active-bg);
          border-left-color: var(--admin-nav-item-active-border);
          color: var(--admin-primary);
        }
        
        .admin-nav-item :global(.admin-nav-link--active:hover) {
          background-color: var(--admin-nav-item-active-bg);
        }
        
        .admin-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .admin-nav-label {
          flex: 1;
        }
      `}</style>
    </>
  )
}

export default AdminNavItem
