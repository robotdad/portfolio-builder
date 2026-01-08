'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useNavigationData } from '@/hooks/useNavigationData'
import { PageNavSection } from './PageNavSection'
import { CategoryNavSection } from './CategoryNavSection'

export interface NavigationTreeProps {
  /** Called after any navigation occurs (for mobile drawer close) */
  onNavigate?: () => void
}

/**
 * NavigationTree - Unified navigation component for admin interface
 * 
 * Features:
 * - Dashboard link always visible at top
 * - PageNavSection for pages
 * - CategoryNavSection for portfolio work
 * - Loading skeleton state
 * - Error state with retry
 * - Calls onNavigate prop on any navigation (for mobile drawer)
 * 
 * Structure:
 * Dashboard              ← single link
 * Pages ▾                ← PageNavSection
 *   Home ★
 *   About
 * Portfolio Work         ← CategoryNavSection
 *   Categories
 *   ▸ Theatre (3)
 *   ▾ Film (2)
 *     • Project 1
 */
export function NavigationTree({ onNavigate }: NavigationTreeProps) {
  const pathname = usePathname()
  const { pages, categories, isLoading, error } = useNavigationData()
  
  // Include search params in current path for accurate page detection
  const currentPath = typeof window !== 'undefined' 
    ? pathname + window.location.search 
    : pathname
  
  /**
   * Determine if Dashboard is active
   * Active only on exact /admin path without pageId param
   */
  const isDashboardActive = (): boolean => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      return pathname === '/admin' && !url.searchParams.has('pageId')
    }
    return pathname === '/admin'
  }
  
  const handleDashboardClick = () => {
    if (onNavigate) {
      onNavigate()
    }
  }
  
  // Loading state
  if (isLoading) {
    return (
      <>
        <nav aria-label="Main navigation" className="navigation-tree">
          {/* Dashboard skeleton */}
          <div className="skeleton-item skeleton-dashboard" />
          
          {/* Pages skeleton */}
          <div className="skeleton-section">
            <div className="skeleton-header" />
            <div className="skeleton-item" />
            <div className="skeleton-item" />
            <div className="skeleton-item" />
          </div>
          
          {/* Categories skeleton */}
          <div className="skeleton-section">
            <div className="skeleton-header" />
            <div className="skeleton-item" />
            <div className="skeleton-item" />
            <div className="skeleton-item" />
          </div>
        </nav>
        
        <style jsx>{`
          .navigation-tree {
            padding: var(--space-4) 0;
          }
          
          .skeleton-item {
            height: 44px;
            margin: 0 var(--space-4);
            background: linear-gradient(
              90deg,
              var(--admin-bg-tertiary) 25%,
              var(--admin-bg-secondary) 50%,
              var(--admin-bg-tertiary) 75%
            );
            background-size: 200% 100%;
            border-radius: var(--radius-sm);
            animation: shimmer 1.5s infinite;
          }
          
          .skeleton-dashboard {
            margin-bottom: var(--space-2);
          }
          
          .skeleton-section {
            margin-top: var(--space-2);
          }
          
          .skeleton-header {
            height: 44px;
            margin: 0 var(--space-4);
            background: linear-gradient(
              90deg,
              var(--admin-bg-tertiary) 25%,
              var(--admin-bg-secondary) 50%,
              var(--admin-bg-tertiary) 75%
            );
            background-size: 200% 100%;
            border-radius: var(--radius-sm);
            animation: shimmer 1.5s infinite;
          }
          
          .skeleton-section .skeleton-item {
            margin-left: calc(var(--space-4) + 16px);
            margin-right: var(--space-4);
            margin-top: var(--space-1);
          }
          
          @keyframes shimmer {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
          
          @media (prefers-reduced-motion: reduce) {
            .skeleton-item,
            .skeleton-header {
              animation: none;
            }
          }
        `}</style>
      </>
    )
  }
  
  // Error state
  if (error) {
    return (
      <>
        <nav aria-label="Main navigation" className="navigation-tree">
          <div className="error-state" role="alert">
            <p className="error-message">Failed to load navigation</p>
            <button 
              type="button"
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </nav>
        
        <style jsx>{`
          .navigation-tree {
            padding: var(--space-4) 0;
          }
          
          .error-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--space-3);
            padding: var(--space-6) var(--space-4);
            text-align: center;
          }
          
          .error-message {
            margin: 0;
            color: var(--admin-text-muted);
            font-size: var(--font-size-sm);
          }
          
          .retry-button {
            padding: var(--space-2) var(--space-4);
            background-color: var(--admin-primary);
            color: white;
            border: none;
            border-radius: var(--radius-md);
            font-size: var(--font-size-sm);
            font-weight: var(--font-weight-medium);
            cursor: pointer;
            transition: background-color var(--transition-fast);
          }
          
          .retry-button:hover {
            background-color: var(--admin-primary-hover);
          }
          
          .retry-button:focus {
            outline: 2px solid var(--admin-primary);
            outline-offset: 2px;
          }
        `}</style>
      </>
    )
  }
  
  const dashboardActive = isDashboardActive()
  
  return (
    <>
      <nav aria-label="Main navigation" className="navigation-tree">
        {/* Dashboard link */}
        <div className="dashboard-link-wrapper">
          <Link
            href="/admin"
            className={`dashboard-link ${dashboardActive ? 'dashboard-link--active' : ''}`}
            aria-current={dashboardActive ? 'page' : undefined}
            onClick={handleDashboardClick}
          >
            <DashboardIcon />
            <span>Dashboard</span>
          </Link>
        </div>
        
        {/* Pages section */}
        <div className="nav-section">
          <PageNavSection 
            pages={pages}
            currentPath={currentPath}
            onNavigate={onNavigate}
          />
        </div>
        
        {/* Portfolio Work section */}
        <div className="nav-section">
          <CategoryNavSection
            categories={categories}
            currentPath={pathname}
            onNavigate={onNavigate}
          />
        </div>
        
        {/* Settings link */}
        <div className="nav-section nav-section--settings">
          <Link
            href="/admin/settings"
            className={`settings-link ${pathname === '/admin/settings' ? 'settings-link--active' : ''}`}
            aria-current={pathname === '/admin/settings' ? 'page' : undefined}
            onClick={handleDashboardClick}
          >
            <SettingsIcon />
            <span>Settings</span>
          </Link>
        </div>
      </nav>
      
      <style jsx>{`
        .navigation-tree {
          padding: var(--space-4) 0;
        }
        
        .dashboard-link-wrapper {
          margin: 0;
          padding: 0;
        }
        
        .navigation-tree :global(.dashboard-link) {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          min-height: 44px;
          padding: var(--space-2) var(--space-4);
          color: var(--admin-text);
          text-decoration: none;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          border-left: 4px solid transparent;
          transition: background-color var(--transition-fast),
                      border-color var(--transition-fast),
                      color var(--transition-fast);
        }
        
        .navigation-tree :global(.dashboard-link:hover) {
          background-color: var(--admin-nav-item-hover);
        }
        
        .navigation-tree :global(.dashboard-link:focus) {
          outline: 2px solid var(--admin-primary);
          outline-offset: -2px;
        }
        
        .navigation-tree :global(.dashboard-link--active) {
          background-color: var(--admin-nav-item-active-bg);
          border-left-color: var(--admin-nav-item-active-border);
          color: var(--admin-primary);
        }
        
        .nav-section {
          margin-top: var(--space-2);
        }
        
        .nav-section--settings {
          margin-top: var(--space-6);
          padding-top: var(--space-6);
          border-top: 1px solid var(--admin-border);
        }
        
        .navigation-tree :global(.settings-link) {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          min-height: 44px;
          padding: var(--space-2) var(--space-4);
          color: var(--admin-text);
          text-decoration: none;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          border-left: 4px solid transparent;
          transition: background-color var(--transition-fast),
                      border-color var(--transition-fast),
                      color var(--transition-fast);
        }
        
        .navigation-tree :global(.settings-link:hover) {
          background-color: var(--admin-nav-item-hover);
        }
        
        .navigation-tree :global(.settings-link:focus) {
          outline: 2px solid var(--admin-primary);
          outline-offset: -2px;
        }
        
        .navigation-tree :global(.settings-link--active) {
          background-color: var(--admin-nav-item-active-bg);
          border-left-color: var(--admin-nav-item-active-border);
          color: var(--admin-primary);
        }
      `}</style>
    </>
  )
}

/**
 * Dashboard icon component
 */
function DashboardIcon() {
  return (
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
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}

/**
 * Settings icon component
 */
function SettingsIcon() {
  return (
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
}

export default NavigationTree
