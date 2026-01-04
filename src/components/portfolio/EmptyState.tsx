'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'

interface EmptyStateProps {
  icon: 'folder' | 'image' | 'grid' | 'camera'
  title: string
  message: string
  action?: {
    label: string
    href: string
  }
  className?: string
}

/**
 * EmptyState Component
 * 
 * Reusable empty state for portfolio pages.
 * Shows helpful, encouraging messaging when content is missing.
 * 
 * Icons:
 * - folder: Category with no projects
 * - image: Project with no gallery images
 * - grid: Homepage with no featured projects
 * - camera: Generic media empty state
 */
export function EmptyState({
  icon,
  title,
  message,
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`empty-state ${className}`} role="status">
      <EmptyStateIcon type={icon} />
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && (
        <Link href={action.href} className="empty-state-action btn btn-secondary">
          {action.label}
        </Link>
      )}
    </div>
  )
}

interface EmptyStateIconProps {
  type: 'folder' | 'image' | 'grid' | 'camera'
}

function EmptyStateIcon({ type }: EmptyStateIconProps) {
  const iconPaths: Record<string, ReactNode> = {
    folder: (
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z" />
    ),
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </>
    ),
    camera: (
      <>
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v11z" />
        <circle cx="12" cy="13" r="4" />
      </>
    ),
  }

  return (
    <svg
      className="empty-state-icon"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[type]}
    </svg>
  )
}
