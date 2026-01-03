'use client'

import React from 'react'

export interface HamburgerButtonProps {
  isOpen: boolean
  onClick: () => void
  className?: string
}

/**
 * HamburgerButton - Accessible hamburger menu button
 * 
 * Features:
 * - 44px touch target (minimum WCAG)
 * - 24px icon size
 * - aria-expanded state
 * - aria-controls linking to drawer
 * - Dynamic aria-label
 * - Three horizontal lines (hamburger) using inline SVG
 */
export function HamburgerButton({ isOpen, onClick, className = '' }: HamburgerButtonProps) {
  return (
    <>
      <button
        type="button"
        className={`hamburger-btn ${className}`}
        onClick={onClick}
        aria-expanded={isOpen}
        aria-controls="mobile-drawer"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      >
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
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <style jsx>{`
        .hamburger-btn {
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
          touch-action: manipulation;
        }
        
        .hamburger-btn:hover {
          background-color: var(--admin-nav-item-hover);
        }
        
        .hamburger-btn:focus {
          outline: 2px solid var(--admin-primary);
          outline-offset: 2px;
        }
        
        .hamburger-btn:active {
          background-color: var(--admin-bg-tertiary);
        }
      `}</style>
    </>
  )
}

export default HamburgerButton
