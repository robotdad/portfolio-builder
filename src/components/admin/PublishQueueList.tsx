'use client'

import React from 'react'
import Link from 'next/link'

export interface PublishQueueListProps {
  pages: Array<{
    id: string
    title: string
    slug: string
  }>
  projects: Array<{
    id: string
    title: string
    categoryName: string
  }>
}

export function PublishQueueList({ pages, projects }: PublishQueueListProps) {
  const totalCount = pages.length + projects.length

  // Empty state
  if (totalCount === 0) {
    return (
      <div className="publish-queue-list">
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <p>All content is published</p>
        </div>

        <style jsx>{`
          .publish-queue-list {
            width: 100%;
          }

          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--space-3, 12px);
            padding: var(--space-8, 32px);
            color: var(--text-secondary, #6b7280);
            text-align: center;
          }

          .empty-state svg {
            color: var(--color-success, #10b981);
          }

          .empty-state p {
            margin: 0;
            font-size: var(--text-base, 16px);
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="publish-queue-list">
      {pages.length > 0 && (
        <div className="queue-section">
          <h3 className="queue-section__title">
            Pages ({pages.length})
          </h3>
          <ul className="queue-section__list">
            {pages.map(page => (
              <li key={page.id} className="queue-item">
                <Link href={`/admin/pages/${page.id}`} className="queue-item__link">
                  {page.title}
                </Link>
                <span className="draft-badge">Draft</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {projects.length > 0 && (
        <div className="queue-section">
          <h3 className="queue-section__title">
            Projects ({projects.length})
          </h3>
          <ul className="queue-section__list">
            {projects.map(project => (
              <li key={project.id} className="queue-item">
                <Link href={`/admin/projects/${project.id}`} className="queue-item__link">
                  {project.title}
                </Link>
                <span className="category-label">{project.categoryName}</span>
                <span className="draft-badge">Draft</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <style jsx>{`
        .publish-queue-list {
          width: 100%;
        }

        .queue-section {
          margin-bottom: var(--space-4, 16px);
        }

        .queue-section:last-child {
          margin-bottom: 0;
        }

        .queue-section__title {
          font-size: var(--text-base, 16px);
          font-weight: 600;
          color: var(--text-primary, #111827);
          margin: 0 0 var(--space-3, 12px) 0;
        }

        .queue-section__list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-2, 8px);
        }

        .queue-item {
          display: flex;
          align-items: center;
          gap: var(--space-2, 8px);
          padding: var(--space-2, 8px) var(--space-3, 12px);
          background: var(--bg-secondary, #f9fafb);
          border-radius: var(--radius-sm, 6px);
          border: 1px solid var(--border-color, #e5e7eb);
        }

        .queue-item__link {
          flex: 1;
          font-size: var(--text-sm, 14px);
          color: var(--color-primary, #3b82f6);
          text-decoration: none;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .queue-item__link:hover {
          text-decoration: underline;
        }

        .category-label {
          font-size: var(--text-xs, 12px);
          color: var(--text-secondary, #6b7280);
          padding: 2px var(--space-2, 8px);
          background: var(--bg-tertiary, #f3f4f6);
          border-radius: var(--radius-sm, 6px);
          border: 1px solid var(--border-color, #e5e7eb);
          white-space: nowrap;
        }

        .draft-badge {
          font-size: var(--text-xs, 12px);
          font-weight: 500;
          color: #d97706;
          background: #fef3c7;
          padding: 2px var(--space-2, 8px);
          border-radius: var(--radius-sm, 6px);
          border: 1px solid #fde68a;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .queue-item {
            flex-wrap: wrap;
          }

          .category-label {
            order: 3;
          }
        }
      `}</style>
    </div>
  )
}
