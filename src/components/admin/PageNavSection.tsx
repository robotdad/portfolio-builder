'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export interface PageNavSectionProps {
  pages: Array<{
    id: string
    title: string
    slug: string
    isHomepage: boolean
  }>
  currentPath: string
  onNavigate?: () => void
}

/**
 * PageNavSection - Collapsible navigation section for pages
 * 
 * Features:
 * - Collapsible section with "Pages" header
 * - Default expanded
 * - Homepage indicator with star badge
 * - Active state detection from URL
 * - 44px minimum touch targets
 * - Smooth collapse animation
 */
export function PageNavSection({ pages, currentPath, onNavigate }: PageNavSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  /**
   * Determine if a page is currently active
   * Homepage: matches /admin or /admin?pageId={homepageId}
   * Other pages: matches /admin?pageId={pageId}
   */
  const isPageActive = (page: { id: string; isHomepage: boolean }): boolean => {
    // Parse the current path to check for pageId query param
    const url = new URL(currentPath, 'http://localhost')
    const pageIdParam = url.searchParams.get('pageId')
    
    if (page.isHomepage) {
      // Homepage is active if no pageId param or pageId matches homepage
      return url.pathname === '/admin' && (!pageIdParam || pageIdParam === page.id)
    }
    
    // Other pages active when pageId matches
    return pageIdParam === page.id
  }
  
  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }
  
  const handleLinkClick = () => {
    if (onNavigate) {
      onNavigate()
    }
  }
  
  // Build href for page - homepage goes to /admin, others to /admin?pageId={id}
  const getPageHref = (page: { id: string; isHomepage: boolean }): string => {
    if (page.isHomepage) {
      return '/admin'
    }
    return `/admin?pageId=${page.id}`
  }
  
  return (
    <>
      <div className="page-nav-section">
        <button
          className="section-header"
          onClick={handleToggle}
          aria-expanded={isExpanded}
          aria-controls="pages-list"
        >
          <span className="section-title">Pages</span>
          <span className={`chevron ${isExpanded ? 'chevron--expanded' : ''}`} aria-hidden="true">
            ▸
          </span>
        </button>
        
        <div
          id="pages-list"
          className={`pages-list ${isExpanded ? 'pages-list--expanded' : ''}`}
          role="list"
        >
          {pages.map(page => {
            const active = isPageActive(page)
            return (
              <div key={page.id} className="page-item" role="listitem">
                <Link
                  href={getPageHref(page)}
                  className={`page-link ${active ? 'page-link--active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                  onClick={handleLinkClick}
                >
                  <span className="page-title">{page.title}</span>
                  {page.isHomepage && (
                    <span className="homepage-badge" aria-label="Homepage">★</span>
                  )}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
      
      <style jsx>{`
        .page-nav-section {
          margin: 0;
          padding: 0;
        }
        
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          min-height: 44px;
          padding: var(--space-2) var(--space-4);
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--admin-text);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          text-align: left;
          transition: background-color var(--transition-fast);
        }
        
        .section-header:hover {
          background-color: var(--admin-nav-item-hover);
        }
        
        .section-header:focus {
          outline: 2px solid var(--admin-primary);
          outline-offset: -2px;
        }
        
        .section-title {
          flex: 1;
        }
        
        .chevron {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          font-size: 12px;
          transition: transform 200ms ease;
        }
        
        .chevron--expanded {
          transform: rotate(90deg);
        }
        
        .pages-list {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 200ms ease;
        }
        
        .pages-list--expanded {
          grid-template-rows: 1fr;
        }
        
        .pages-list > :global(*) {
          overflow: hidden;
        }
        
        .page-item {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        
        .page-nav-section :global(.page-link) {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          min-height: 44px;
          padding: var(--space-2) var(--space-4);
          padding-left: calc(var(--space-4) + 16px);
          color: var(--admin-text);
          text-decoration: none;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          border-left: 4px solid transparent;
          transition: background-color var(--transition-fast),
                      border-color var(--transition-fast),
                      color var(--transition-fast);
        }
        
        .page-nav-section :global(.page-link:hover) {
          background-color: var(--admin-nav-item-hover);
        }
        
        .page-nav-section :global(.page-link:focus) {
          outline: 2px solid var(--admin-primary);
          outline-offset: -2px;
        }
        
        .page-nav-section :global(.page-link--active) {
          background-color: var(--admin-nav-item-active-bg);
          border-left-color: var(--admin-nav-item-active-border);
          color: var(--admin-primary);
        }
        
        .page-nav-section :global(.page-link--active:hover) {
          background-color: var(--admin-nav-item-active-bg);
        }
        
        .page-title {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .homepage-badge {
          flex-shrink: 0;
          color: var(--admin-primary);
          font-size: var(--font-size-sm);
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .chevron,
          .pages-list {
            transition: none;
          }
        }
      `}</style>
    </>
  )
}

export default PageNavSection
