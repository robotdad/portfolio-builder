'use client'

import React from 'react'
import Link from 'next/link'

export interface AdminHeaderProps {
  title?: string
  onMenuToggle?: () => void
  showMenuButton?: boolean
}

// Settings gear icon
const SettingsIcon = () => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

// Hamburger menu icon (for mobile - future slice)
const MenuIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

/**
 * AdminHeader - Header bar for admin interface
 * 
 * Features:
 * - Logo/title on left
 * - Settings dropdown on right
 * - Optional hamburger menu button (for mobile drawer - future slice)
 * - Sticky positioning
 * - Height: 64px desktop, 56px mobile
 */
export function AdminHeader({ 
  title = 'Portfolio Builder', 
  onMenuToggle,
  showMenuButton = false 
}: AdminHeaderProps) {
  return (
    <>
      <header className="admin-header">
        <div className="admin-header-left">
          {showMenuButton && (
            <button 
              type="button"
              className="admin-menu-btn"
              onClick={onMenuToggle}
              aria-label="Toggle navigation menu"
            >
              <MenuIcon />
            </button>
          )}
          <Link href="/admin" className="admin-logo">
            {title}
          </Link>
        </div>
        
        <div className="admin-header-right">
          <button 
            type="button"
            className="admin-settings-btn"
            aria-label="Settings"
          >
            <SettingsIcon />
          </button>
        </div>
      </header>
      <style jsx>{`
        .admin-header {
          grid-area: header;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: var(--admin-header-height-mobile);
          padding: 0 var(--space-4);
          background-color: var(--admin-header-bg);
          border-bottom: 1px solid var(--admin-header-border);
          z-index: var(--z-admin-header);
        }
        
        @media (min-width: 1024px) {
          .admin-header {
            height: var(--admin-header-height);
            padding: 0 var(--space-6);
          }
        }
        
        .admin-header-left {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        
        .admin-header-right {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        
        .admin-menu-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          padding: 0;
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          color: var(--admin-text);
          cursor: pointer;
          transition: background-color var(--transition-fast);
        }
        
        .admin-menu-btn:hover {
          background-color: var(--admin-nav-item-hover);
        }
        
        .admin-menu-btn:focus {
          outline: 2px solid var(--admin-primary);
          outline-offset: 2px;
        }
        
        @media (min-width: 1024px) {
          .admin-menu-btn {
            display: none;
          }
        }
        
        .admin-header :global(.admin-logo) {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--admin-text);
          text-decoration: none;
        }
        
        .admin-header :global(.admin-logo:hover) {
          color: var(--admin-primary);
        }
        
        .admin-header :global(.admin-logo:focus) {
          outline: 2px solid var(--admin-primary);
          outline-offset: 2px;
          border-radius: var(--radius-sm);
        }
        
        .admin-settings-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          padding: 0;
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          color: var(--admin-text-secondary);
          cursor: pointer;
          transition: background-color var(--transition-fast), 
                      color var(--transition-fast);
        }
        
        .admin-settings-btn:hover {
          background-color: var(--admin-nav-item-hover);
          color: var(--admin-text);
        }
        
        .admin-settings-btn:focus {
          outline: 2px solid var(--admin-primary);
          outline-offset: 2px;
        }
      `}</style>
    </>
  )
}

export default AdminHeader
