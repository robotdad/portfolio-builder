'use client'

import React, { useState, useCallback, useSyncExternalStore } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'admin-nav-expanded-categories'

/**
 * Save expanded categories to localStorage
 */
function saveToStorage(categoryIds: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categoryIds))
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Custom hook to sync expanded categories with localStorage
 * Uses useSyncExternalStore for proper hydration handling
 */
function useExpandedCategories() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set())
  
  // Subscribe to storage events (for cross-tab sync)
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener('storage', callback)
    return () => window.removeEventListener('storage', callback)
  }, [])
  
  // Get current snapshot from localStorage
  const getSnapshot = useCallback(() => {
    return localStorage.getItem(STORAGE_KEY) || '[]'
  }, [])
  
  // Server snapshot (empty during SSR)
  const getServerSnapshot = useCallback(() => '[]', [])
  
  // Sync with localStorage using useSyncExternalStore
  const storedValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  
  // Parse stored value and update state if different
  const storedSet = React.useMemo(() => {
    try {
      const parsed = JSON.parse(storedValue)
      return Array.isArray(parsed) ? new Set<string>(parsed) : new Set<string>()
    } catch {
      return new Set<string>()
    }
  }, [storedValue])
  
  // Use stored value if we have it, otherwise use local state
  const currentExpanded = storedSet.size > 0 ? storedSet : expandedCategories
  
  const toggle = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev.size > 0 ? prev : storedSet)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      saveToStorage([...next])
      return next
    })
  }, [storedSet])
  
  return { expandedCategories: currentExpanded, toggle }
}

export interface Project {
  id: string
  title: string
}

export interface CategoryWithProjects {
  id: string
  name: string
  parentId: string | null
  _count: { projects: number; children: number }
  projects?: Project[]
  children?: CategoryWithProjects[]
}

export interface CategoryNavSectionProps {
  categories: CategoryWithProjects[]
  currentPath: string
  onNavigate?: () => void
}

/**
 * CategoryNavSection - Portfolio Work section with expandable category tree
 * 
 * Features:
 * - Static "Portfolio Work" header (not collapsible)
 * - "Categories" link to categories list
 * - Expandable categories showing project count
 * - Nested project links when category is expanded
 * - Persists expanded state to localStorage
 * - Active state detection from URL
 * - 44px minimum touch targets
 * - Smooth collapse animations
 */
export function CategoryNavSection({ categories, currentPath, onNavigate }: CategoryNavSectionProps) {
  const { expandedCategories, toggle: handleCategoryToggle } = useExpandedCategories()
  
  /**
   * Determine if a category is currently active
   * Active when path starts with /admin/categories/{id}
   */
  const isCategoryActive = (categoryId: string): boolean => {
    return currentPath.startsWith(`/admin/categories/${categoryId}`)
  }
  
  /**
   * Determine if a project is currently active
   * Active when path is /admin/projects/{id}
   */
  const isProjectActive = (projectId: string): boolean => {
    return currentPath === `/admin/projects/${projectId}`
  }
  
  const handleLinkClick = () => {
    if (onNavigate) {
      onNavigate()
    }
  }
  
  return (
    <>
      <div className="category-nav-section">
        {/* Section Header - Clickable link to categories list */}
        <div className="section-header">
          <Link
            href="/admin/categories"
            className={`section-title-link ${currentPath === '/admin/categories' ? 'section-title-link--active' : ''}`}
            data-testid="nav-item-admin-categories"
            aria-current={currentPath === '/admin/categories' ? 'page' : undefined}
            onClick={handleLinkClick}
          >
            Categories
          </Link>
        </div>
        
        {/* Category list with expandable projects and subcategory nesting */}
        <div className="categories-list" role="list">
          {categories.map(category => {
            const categoryExpanded = expandedCategories.has(category.id)
            const hasProjects = category._count.projects > 0
            const hasChildren = (category.children?.length ?? 0) > 0
            const isExpandable = hasProjects || hasChildren
            const active = isCategoryActive(category.id)
            
            return (
              <div key={category.id} className="category-item" role="listitem">
                <div className="category-row">
                  {/* Chevron button - separate click target */}
                  <button
                    className={`chevron-button ${!isExpandable ? 'chevron-button--disabled' : ''}`}
                    onClick={() => isExpandable && handleCategoryToggle(category.id)}
                    disabled={!isExpandable}
                    aria-expanded={isExpandable ? categoryExpanded : undefined}
                    aria-label={isExpandable ? `${categoryExpanded ? 'Collapse' : 'Expand'} ${category.name}` : undefined}
                    aria-controls={isExpandable ? `children-${category.id}` : undefined}
                    tabIndex={isExpandable ? 0 : -1}
                  >
                    <span className={`chevron ${categoryExpanded ? 'chevron--expanded' : ''}`} aria-hidden="true">
                      {isExpandable ? '▸' : ''}
                    </span>
                  </button>
                  
                  {/* Category name link */}
                  <Link
                    href={`/admin/categories/${category.id}/projects`}
                    className={`category-link ${active ? 'category-link--active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                    onClick={handleLinkClick}
                  >
                    <span className="category-name" title={category.name}>{category.name}</span>
                    <span className="project-count">({hasChildren ? category._count.children : category._count.projects})</span>
                  </Link>
                </div>
                
                {/* Expandable children: subcategories and/or projects */}
                {isExpandable && (
                  <div
                    id={`children-${category.id}`}
                    className={`projects-list ${categoryExpanded ? 'projects-list--expanded' : ''}`}
                  >
                    <div className="projects-list-inner">
                      {/* Subcategories nested under parent */}
                      {hasChildren && category.children!.map(sub => {
                        const subExpanded = expandedCategories.has(sub.id)
                        const subHasProjects = sub._count.projects > 0
                        const subActive = isCategoryActive(sub.id)
                        
                        return (
                          <div key={sub.id} className="subcategory-item">
                            <div className="subcategory-row">
                              <button
                                className={`chevron-button subcategory-chevron ${!subHasProjects ? 'chevron-button--disabled' : ''}`}
                                onClick={() => subHasProjects && handleCategoryToggle(sub.id)}
                                disabled={!subHasProjects}
                                aria-expanded={subHasProjects ? subExpanded : undefined}
                                aria-label={subHasProjects ? `${subExpanded ? 'Collapse' : 'Expand'} ${sub.name}` : undefined}
                                aria-controls={subHasProjects ? `projects-${sub.id}` : undefined}
                                tabIndex={subHasProjects ? 0 : -1}
                              >
                                <span className={`chevron ${subExpanded ? 'chevron--expanded' : ''}`} aria-hidden="true">
                                  {subHasProjects ? '▸' : ''}
                                </span>
                              </button>
                              
                              <Link
                                href={`/admin/categories/${sub.id}/projects`}
                                className={`category-link subcategory-link ${subActive ? 'category-link--active' : ''}`}
                                aria-current={subActive ? 'page' : undefined}
                                onClick={handleLinkClick}
                              >
                                <span className="category-name" title={sub.name}>{sub.name}</span>
                                <span className="project-count">({sub._count.projects})</span>
                              </Link>
                            </div>
                            
                            {/* Subcategory projects */}
                            {subHasProjects && sub.projects && (
                              <div
                                id={`projects-${sub.id}`}
                                className={`projects-list ${subExpanded ? 'projects-list--expanded' : ''}`}
                              >
                                <div className="projects-list-inner">
                                  {sub.projects.map(project => {
                                    const projectActive = isProjectActive(project.id)
                                    return (
                                      <div key={project.id} className="project-item subcategory-project-item">
                                        <Link
                                          href={`/admin/projects/${project.id}`}
                                          className={`project-link subcategory-project-link ${projectActive ? 'project-link--active' : ''}`}
                                          aria-current={projectActive ? 'page' : undefined}
                                          onClick={handleLinkClick}
                                        >
                                          <span className="project-bullet" aria-hidden="true">•</span>
                                          <span className="project-nav-label" title={project.title}>{project.title}</span>
                                        </Link>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                      
                      {/* Direct projects (for categories without subcategories) */}
                      {hasProjects && category.projects && category.projects.map(project => {
                        const projectActive = isProjectActive(project.id)
                        return (
                          <div key={project.id} className="project-item">
                            <Link
                              href={`/admin/projects/${project.id}`}
                              className={`project-link ${projectActive ? 'project-link--active' : ''}`}
                              aria-current={projectActive ? 'page' : undefined}
                              onClick={handleLinkClick}
                            >
                              <span className="project-bullet" aria-hidden="true">•</span>
                              <span className="project-nav-label" title={project.title}>{project.title}</span>
                            </Link>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      <style jsx>{`
        .category-nav-section {
          margin: 0;
          padding: 0;
        }
        
        .section-header {
          display: flex;
          align-items: center;
          min-height: 44px;
          padding: var(--space-2) var(--space-4);
          color: var(--admin-text);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
        }
        
        .section-title {
          flex: 1;
        }
        
        .category-nav-section :global(.section-title-link) {
          flex: 1;
          color: var(--admin-text);
          text-decoration: none;
          transition: color var(--transition-fast);
        }
        
        .category-nav-section :global(.section-title-link:hover) {
          color: var(--admin-primary);
        }
        
        .category-nav-section :global(.section-title-link:focus) {
          outline: 2px solid var(--admin-primary);
          outline-offset: 2px;
          border-radius: var(--radius-sm);
        }
        
        .category-nav-section :global(.section-title-link--active) {
          color: var(--admin-primary);
        }
        
        .nav-item {
          margin: 0;
          padding: 0;
        }
        
        .category-nav-section :global(.nav-link) {
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
        
        .category-nav-section :global(.nav-link:hover) {
          background-color: var(--admin-nav-item-hover);
        }
        
        .category-nav-section :global(.nav-link:focus) {
          outline: 2px solid var(--admin-primary);
          outline-offset: -2px;
        }
        
        .category-nav-section :global(.nav-link--active) {
          background-color: var(--admin-nav-item-active-bg);
          border-left-color: var(--admin-nav-item-active-border);
          color: var(--admin-primary);
        }
        
        .categories-list {
          margin: 0;
          padding: 0;
        }
        
        .category-item {
          margin: 0;
          padding: 0;
        }
        
        .category-row {
          display: flex;
          align-items: center;
          min-height: 44px;
        }
        
        .chevron-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          min-height: 44px;
          padding: 0;
          margin-left: var(--space-4);
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--admin-text-secondary);
          flex-shrink: 0;
        }
        
        .chevron-button:hover:not(.chevron-button--disabled) {
          color: var(--admin-text);
        }
        
        .chevron-button:focus {
          outline: 2px solid var(--admin-primary);
          outline-offset: -2px;
        }
        
        .chevron-button--disabled {
          cursor: default;
          opacity: 0;
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
        
        .category-nav-section :global(.category-link) {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex: 1;
          min-height: 44px;
          padding: var(--space-2) var(--space-4);
          padding-left: 0;
          color: var(--admin-text);
          text-decoration: none;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          border-left: 4px solid transparent;
          margin-left: -4px;
          transition: background-color var(--transition-fast),
                      border-color var(--transition-fast),
                      color var(--transition-fast);
        }
        
        .category-nav-section :global(.category-link:hover) {
          background-color: var(--admin-nav-item-hover);
        }
        
        .category-nav-section :global(.category-link:focus) {
          outline: 2px solid var(--admin-primary);
          outline-offset: -2px;
        }
        
        .category-nav-section :global(.category-link--active) {
          background-color: var(--admin-nav-item-active-bg);
          border-left-color: var(--admin-nav-item-active-border);
          color: var(--admin-primary);
        }
        
        .category-name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .project-count {
          flex-shrink: 0;
          color: var(--admin-text-muted);
          font-size: var(--font-size-xs);
        }
        
        .projects-list {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 200ms ease;
        }
        
        .projects-list--expanded {
          grid-template-rows: 1fr;
        }
        
        .projects-list-inner {
          overflow: hidden;
        }
        
        .subcategory-item {
          margin: 0;
          padding: 0;
        }
        
        .subcategory-row {
          display: flex;
          align-items: center;
          min-height: 44px;
        }
        
        .category-nav-section :global(.subcategory-chevron) {
          margin-left: calc(var(--space-4) + 16px);
        }
        
        .category-nav-section :global(.subcategory-link) {
          padding-left: 0;
          font-size: var(--font-size-xs);
        }
        
        .project-item {
          margin: 0;
          padding: 0;
        }
        
        .category-nav-section :global(.subcategory-project-link) {
          padding-left: calc(var(--space-4) + 80px);
        }
        
        .category-nav-section :global(.project-link) {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          min-height: 44px;
          padding: var(--space-2) var(--space-4);
          padding-left: calc(var(--space-4) + 48px);
          color: var(--admin-text);
          text-decoration: none;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          border-left: 4px solid transparent;
          transition: background-color var(--transition-fast),
                      border-color var(--transition-fast),
                      color var(--transition-fast);
        }
        
        .category-nav-section :global(.project-link:hover) {
          background-color: var(--admin-nav-item-hover);
        }
        
        .category-nav-section :global(.project-link:focus) {
          outline: 2px solid var(--admin-primary);
          outline-offset: -2px;
        }
        
        .category-nav-section :global(.project-link--active) {
          background-color: var(--admin-nav-item-active-bg);
          border-left-color: var(--admin-nav-item-active-border);
          color: var(--admin-primary);
        }
        
        .category-nav-section :global(.project-bullet) {
          flex-shrink: 0;
          color: var(--admin-text-muted);
          line-height: inherit;
        }
        
        .category-nav-section :global(.project-nav-label) {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .chevron,
          .projects-list {
            transition: none;
          }
        }
      `}</style>
    </>
  )
}

export default CategoryNavSection
