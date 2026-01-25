'use client'

import React from 'react'
import { NavigationTree } from './NavigationTree'
import { UserSessionPanel } from './UserSessionPanel'

export interface AdminSidebarProps {
  className?: string
}

/**
 * AdminSidebar - Navigation sidebar for admin interface
 * 
 * Features:
 * - Uses NavigationTree for unified navigation content
 * - UserSessionPanel at bottom for user info and sign-out
 * - Semantic nav element with aria-label
 * - Responsive: hidden below 1024px via CSS
 * - Sticky positioning for scroll independence
 * - Flex column layout to push session panel to bottom
 */
export function AdminSidebar({ className = '' }: AdminSidebarProps) {
  return (
    <>
      <aside className={`admin-sidebar ${className}`} data-testid="admin-sidebar">
        <div className="admin-sidebar__nav">
          <NavigationTree />
        </div>
        <UserSessionPanel variant="sidebar" />
      </aside>
      <style jsx>{`
        .admin-sidebar {
          grid-area: sidebar;
          display: none;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          width: var(--admin-sidebar-width);
          background-color: var(--admin-sidebar-bg);
          border-right: 1px solid var(--admin-sidebar-border);
          overflow-y: auto;
          z-index: var(--z-admin-sidebar);
        }
        
        .admin-sidebar__nav {
          flex: 1;
        }
        
        @media (min-width: 1024px) {
          .admin-sidebar {
            display: flex;
          }
        }
      `}</style>
    </>
  )
}

export default AdminSidebar
