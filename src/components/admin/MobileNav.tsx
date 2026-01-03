'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { AdminNavItem } from './AdminNavItem'
import { adminNavItems } from '@/constants/adminNav'

// Close icon for the header
const CloseIcon = () => (
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
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export interface MobileNavProps {
  onClose: () => void
}

/**
 * MobileNav - Navigation content for mobile drawer
 * 
 * Features:
 * - Reuses AdminNavItem component
 * - Same navItems as AdminSidebar
 * - Closes drawer on navigation
 * - Header with "Menu" title and close button
 * - 44px minimum height for nav items
 */
export function MobileNav({ onClose }: MobileNavProps) {
  const pathname = usePathname()
  
  /**
   * Determine if a nav item is active based on current path
   * - Dashboard: exact match only
   * - Other sections: prefix match (includes child routes)
   */
  const isActive = (href: string): boolean => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }
  
  /**
   * Handle navigation item click
   * Close the drawer after navigation
   */
  const handleNavClick = () => {
    // Small delay to allow navigation to start before closing
    setTimeout(onClose, 100)
  }
  
  return (
    <>
      <div className="mobile-nav">
        <div className="mobile-nav-header">
          <span className="mobile-nav-title">Menu</span>
          <button
            type="button"
            className="mobile-nav-close"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <CloseIcon />
          </button>
        </div>
        
        <nav aria-label="Admin navigation" className="mobile-nav-content">
          <ul className="mobile-nav-list" onClick={handleNavClick}>
            {adminNavItems.map(item => (
              <AdminNavItem
                key={item.href}
                label={item.label}
                href={item.href}
                icon={item.icon}
                isActive={isActive(item.href)}
              />
            ))}
          </ul>
        </nav>
      </div>
      <style jsx>{`
        .mobile-nav {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .mobile-nav-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 56px;
          padding: 0 var(--space-4);
          border-bottom: 1px solid var(--admin-sidebar-border);
          flex-shrink: 0;
        }
        
        .mobile-nav-title {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--admin-text);
        }
        
        .mobile-nav-close {
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
          -webkit-tap-highlight-color: transparent;
        }
        
        .mobile-nav-close:hover {
          background-color: var(--admin-nav-item-hover);
        }
        
        .mobile-nav-close:focus {
          outline: 2px solid var(--admin-primary);
          outline-offset: 2px;
        }
        
        .mobile-nav-content {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-4) 0;
        }
        
        .mobile-nav-list {
          margin: 0;
          padding: 0;
          list-style: none;
        }
      `}</style>
    </>
  )
}

export default MobileNav
