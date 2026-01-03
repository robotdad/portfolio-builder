'use client'

import React from 'react'
import { createPortal } from 'react-dom'

export interface DrawerBackdropProps {
  isOpen: boolean
  onClick: () => void
}

/**
 * DrawerBackdrop - Overlay backdrop for mobile drawer
 * 
 * Features:
 * - Fixed position covering viewport
 * - Fade animation (opacity 0 → 1)
 * - Click to close drawer
 * - Uses Portal (same as drawer)
 * - Reduced motion support
 */
export function DrawerBackdrop({ isOpen, onClick }: DrawerBackdropProps) {
  // Don't render on server or if document doesn't exist
  if (typeof document === 'undefined') {
    return null
  }
  
  const backdrop = (
    <>
      <div
        className="drawer-backdrop"
        data-open={isOpen}
        onClick={onClick}
        aria-hidden="true"
      />
      <style jsx>{`
        .drawer-backdrop {
          position: fixed;
          inset: 0;
          background: var(--admin-drawer-backdrop, rgba(0, 0, 0, 0.5));
          z-index: var(--z-admin-drawer-backdrop, 120);
          opacity: 0;
          pointer-events: none;
          transition: opacity var(--admin-transition-drawer, 250ms cubic-bezier(0.4, 0, 0.2, 1));
        }
        
        .drawer-backdrop[data-open="true"] {
          opacity: 1;
          pointer-events: auto;
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .drawer-backdrop {
            transition: none;
          }
        }
      `}</style>
    </>
  )
  
  return createPortal(backdrop, document.body)
}

export default DrawerBackdrop
