'use client'

import React from 'react'
import Link from 'next/link'

// ============================================================================
// Types
// ============================================================================

/**
 * Individual breadcrumb item
 */
export interface BreadcrumbItem {
  /** Display label for the breadcrumb */
  label: string
  /** Link href - if undefined, this is the current page (not clickable) */
  href?: string
}

/**
 * Props for the Breadcrumb component
 */
export interface BreadcrumbProps {
  /** Array of breadcrumb items from root to current page */
  items: BreadcrumbItem[]
}

// ============================================================================
// Component
// ============================================================================

/**
 * Breadcrumb - Navigation breadcrumb trail for the admin interface
 *
 * Features:
 * - Semantic navigation with aria-label
 * - Ordered list structure for accessibility
 * - Current page indicated with aria-current="page"
 * - Visual separators between items (hidden from screen readers)
 * - Mobile-first responsive styling
 *
 * @example
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { label: 'Dashboard', href: '/admin' },
 *     { label: 'Categories', href: '/admin/categories' },
 *     { label: 'Architecture' }  // Current page, no href
 *   ]}
 * />
 * ```
 */
export function Breadcrumb({ items }: BreadcrumbProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <>
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <ol className="breadcrumb-list">
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            const isCurrent = !item.href

            return (
              <li key={index} className="breadcrumb-item">
                {isCurrent ? (
                  <span
                    className="breadcrumb-current"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href!} className="breadcrumb-link">
                    {item.label}
                  </Link>
                )}
                {!isLast && (
                  <span className="breadcrumb-separator" aria-hidden="true">
                    ›
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
      <style jsx>{`
        .breadcrumb {
          font-size: var(--font-size-sm);
        }

        .breadcrumb-list {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .breadcrumb-item {
          display: flex;
          align-items: center;
        }

        .breadcrumb-item :global(.breadcrumb-link) {
          color: var(--admin-text-muted);
          text-decoration: none;
          transition: color var(--transition-fast),
                      text-decoration var(--transition-fast);
        }

        .breadcrumb-item :global(.breadcrumb-link:hover) {
          color: var(--admin-text);
          text-decoration: underline;
        }

        .breadcrumb-item :global(.breadcrumb-link:focus) {
          outline: 2px solid var(--admin-primary);
          outline-offset: 2px;
          border-radius: 2px;
        }

        .breadcrumb-current {
          color: var(--admin-text);
          font-weight: var(--font-weight-semibold);
        }

        .breadcrumb-separator {
          color: var(--admin-text-muted);
          margin: 0 8px;
          user-select: none;
        }
      `}</style>
    </>
  )
}

export default Breadcrumb
