'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { SkipLink } from './SkipLink'
import { AdminSidebar } from './AdminSidebar'

type Breakpoint = 'mobile' | 'tablet' | 'desktop'

export interface AdminLayoutContextValue {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
  breakpoint: Breakpoint
}

const AdminLayoutContext = createContext<AdminLayoutContextValue | undefined>(undefined)

/**
 * useAdminLayout - Hook to access admin layout context
 * 
 * @throws Error if used outside AdminLayoutProvider
 */
export function useAdminLayout(): AdminLayoutContextValue {
  const context = useContext(AdminLayoutContext)
  if (!context) {
    throw new Error('useAdminLayout must be used within AdminLayoutProvider')
  }
  return context
}

export interface AdminLayoutProps {
  children: ReactNode
}

/**
 * AdminLayout - Root layout wrapper for admin interface
 * 
 * Provides:
 * - CSS Grid layout with sidebar + content structure
 * - Skip link for accessibility
 * - Sidebar component (visible at >=1024px)
 * - Layout context for state management
 * - Responsive breakpoint detection
 * 
 * Note: This layout works WITH existing page headers, not replacing them.
 * Pages continue to render their own headers with page-specific actions
 * (Save, Publish, Settings, etc.) inside the main content area.
 * 
 * Layout Structure (Desktop >=1024px):
 * +------------+-----------------------------+
 * | Sidebar    | Main Content                |
 * | 240px      | (includes page header)      |
 * |            | (flex)                      |
 * +------------+-----------------------------+
 * 
 * Layout Structure (Mobile <1024px):
 * +------------------------------------------+
 * | Main Content (full width)                |
 * | (includes page header)                   |
 * +------------------------------------------+
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop')
  
  // Detect breakpoint changes
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width < 768) {
        setBreakpoint('mobile')
      } else if (width < 1024) {
        setBreakpoint('tablet')
      } else {
        setBreakpoint('desktop')
      }
    }
    
    // Initial check
    updateBreakpoint()
    
    // Listen for resize
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])
  
  // Close sidebar when switching to desktop
  useEffect(() => {
    if (breakpoint === 'desktop') {
      setIsSidebarOpen(false)
    }
  }, [breakpoint])
  
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev)
  }, [])
  
  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false)
  }, [])
  
  const contextValue: AdminLayoutContextValue = {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    breakpoint,
  }
  
  return (
    <AdminLayoutContext.Provider value={contextValue}>
      <div className="admin-layout-wrapper">
        <SkipLink />
        <AdminSidebar />
        <main id="main-content" className="admin-main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
      <style jsx>{`
        .admin-layout-wrapper {
          display: grid;
          grid-template-columns: 1fr;
          grid-template-areas: "main";
          min-height: 100vh;
        }
        
        @media (min-width: 1024px) {
          .admin-layout-wrapper {
            grid-template-columns: var(--admin-sidebar-width) 1fr;
            grid-template-areas: "sidebar main";
          }
        }
        
        .admin-main-content {
          grid-area: main;
          min-height: 100vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        
        /* Focus styling for skip link target */
        .admin-main-content:focus {
          outline: none;
        }
        
        .admin-main-content:focus-visible {
          outline: 2px solid var(--admin-primary);
          outline-offset: -2px;
        }
      `}</style>
    </AdminLayoutContext.Provider>
  )
}

export default AdminLayout
