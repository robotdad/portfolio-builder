'use client'

import React from 'react'

/**
 * SkipLink - Accessibility skip link for keyboard users
 * 
 * Allows keyboard users to skip directly to main content,
 * bypassing navigation. Only visible on keyboard focus.
 */
export function SkipLink() {
  return (
    <>
      <a href="#main-content" className="admin-skip-link">
        Skip to main content
      </a>
      <style jsx>{`
        .admin-skip-link {
          position: absolute;
          top: -100%;
          left: var(--space-4);
          z-index: var(--z-admin-skip-link, 120);
          padding: var(--space-2) var(--space-4);
          background: var(--admin-primary);
          color: white;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          text-decoration: none;
          border-radius: var(--radius-md);
          transition: top var(--transition-fast);
        }
        
        .admin-skip-link:focus {
          top: var(--space-2);
          outline: 2px solid var(--admin-primary);
          outline-offset: 2px;
        }
      `}</style>
    </>
  )
}

export default SkipLink
