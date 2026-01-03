'use client'

import React from 'react'
import { NavigationTree } from './NavigationTree'

export interface AdminSidebarProps {
  className?: string
}

/**
 * AdminSidebar - Navigation sidebar for admin interface
 * 
 * Features:
 * - Uses NavigationTree for unified navigation content
 * - Semantic nav element with aria-label
 * - Responsive: hidden below 1024px via CSS
 * - Sticky positioning for scroll independence
 */
export function AdminSidebar({ className = '' }: AdminSidebarProps) {
  return (
    <>
      <aside className={`admin-sidebar ${className}`}>
        <NavigationTree />
      </aside>
      <style jsx>{`
        .admin-sidebar {
          grid-area: sidebar;
          display: none;
          position: sticky;
          top: 0;
          height: 100vh;
          width: var(--admin-sidebar-width);
          background-color: var(--admin-sidebar-bg);
          border-right: 1px solid var(--admin-sidebar-border);
          overflow-y: auto;
          z-index: var(--z-admin-sidebar);
        }
        
        @media (min-width: 1024px) {
          .admin-sidebar {
            display: block;
          }
        }
      `}</style>
    </>
  )
}

export default AdminSidebar
