'use client'

import Link from 'next/link'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

/**
 * Breadcrumb Navigation Component
 * 
 * Displays hierarchical navigation path (e.g., Category > Project)
 * - Accessible with proper ARIA attributes
 * - Current page marked with aria-current
 * - Theme-aware styling via CSS variables
 */
export function Breadcrumb({ items }: BreadcrumbProps) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      <ol className="breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          
          return (
            <li key={index} className="breadcrumb-item">
              {item.href ? (
                <Link 
                  href={item.href}
                  className="breadcrumb-link"
                >
                  {item.label}
                </Link>
              ) : (
                <span 
                  className="breadcrumb-current"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
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
  )
}
