'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { AdminNavItem } from './AdminNavItem'

// Navigation items configuration
const navItems = [
  { label: 'Dashboard', href: '/admin', icon: 'dashboard' as const },
  { label: 'Categories', href: '/admin/categories', icon: 'folder' as const },
]

export interface AdminSidebarProps {
  className?: string
}

/**
 * AdminSidebar - Navigation sidebar for admin interface
 * 
 * Features:
 * - Active state detection from current URL path
 * - Dashboard: exact match only (/admin)
 * - Categories: prefix match (/admin/categories/*)
 * - Semantic nav element with aria-label
 * - Responsive: hidden below 1024px via CSS
 * - Sticky positioning for scroll independence
 */
export function AdminSidebar({ className = '' }: AdminSidebarProps) {
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
  
  return (
    <>
      <aside className={`admin-sidebar ${className}`}>
        <nav aria-label="Admin navigation" className="admin-sidebar-nav">
          <ul className="admin-sidebar-list">
            {navItems.map(item => (
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
        
        .admin-sidebar-nav {
          padding: var(--space-4) 0;
        }
        
        .admin-sidebar-list {
          margin: 0;
          padding: 0;
          list-style: none;
        }
      `}</style>
    </>
  )
}

export default AdminSidebar
