'use client'

import React from 'react'
import { NavigationTree } from './NavigationTree'
import { UserSessionPanel } from './UserSessionPanel'

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
 * - Header with "Menu" title and close button
 * - Uses NavigationTree for unified navigation content
 * - UserSessionPanel at bottom for user info and sign-out
 * - Closes drawer on navigation via onNavigate prop
 * - 44px minimum height for touch targets
 */
export function MobileNav({ onClose }: MobileNavProps) {
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
        
        <div className="mobile-nav-content">
          <NavigationTree onNavigate={onClose} />
        </div>
        
        <UserSessionPanel variant="drawer" />
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
        }
      `}</style>
    </>
  )
}

export default MobileNav
