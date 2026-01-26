'use client'

import React, { useState, useRef, useEffect } from 'react'
import { PublishQueueList } from './PublishQueueList'
import { PublishConfirmationModal } from './PublishConfirmationModal'

export interface PublishQueueCardProps {
  pages: Array<{ id: string; title: string; slug: string }>
  projects: Array<{ id: string; title: string; categoryName: string }>
  onPublishSuccess: () => void
}

export function PublishQueueCard({ pages, projects, onPublishSuccess }: PublishQueueCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const isMountedRef = useRef(true)

  // Add cleanup effect
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const totalCount = pages.length + projects.length

  const handlePublish = async () => {
    setIsPublishing(true)
    setError(null)
    setSuccess(false)

    try {
      // Publish all pages
      const pagePublishPromises = pages.map(page =>
        fetch(`/api/admin/pages/${page.id}/publish`, { method: 'POST' })
      )

      // Publish all projects
      const projectPublishPromises = projects.map(project =>
        fetch(`/api/admin/projects/${project.id}/publish`, { method: 'POST' })
      )

      // Execute all publish operations
      const results = await Promise.allSettled([
        ...pagePublishPromises,
        ...projectPublishPromises
      ])

      // Check for failures
      const failures = results.filter(r => r.status === 'rejected')
      if (failures.length > 0) {
        throw new Error(`Failed to publish ${failures.length} item(s)`)
      }

      // Before setState calls, check if still mounted
      if (!isMountedRef.current) return

      // Success!
      setSuccess(true)
      setIsModalOpen(false)
      
      // Call success callback
      onPublishSuccess()
    } catch (err) {
      console.error('Publish failed:', err)
      if (!isMountedRef.current) return
      setError(err instanceof Error ? err.message : 'Failed to publish')
      setIsModalOpen(false)
    } finally {
      if (!isMountedRef.current) return
      setIsPublishing(false)
    }
  }

  // Compact empty state - no need for full card when nothing to publish
  if (totalCount === 0) {
    return (
      <div className="publish-queue-empty">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <span>Publish Queue</span>
        <span className="empty-status">All content published</span>
        <style jsx>{`
          .publish-queue-empty {
            display: flex;
            align-items: center;
            gap: var(--space-3, 12px);
            padding: var(--space-3, 12px) var(--space-4, 16px);
            background: var(--bg-secondary, #f9fafb);
            border: 1px solid var(--border-color, #e5e7eb);
            border-radius: var(--radius-md, 8px);
            font-size: var(--text-sm, 14px);
            color: var(--text-secondary, #6b7280);
          }
          .publish-queue-empty svg {
            color: var(--color-success, #10b981);
            flex-shrink: 0;
          }
          .publish-queue-empty span:first-of-type {
            font-weight: 600;
            color: var(--text-primary, #111827);
          }
          .empty-status {
            margin-left: auto;
            color: var(--color-success, #10b981);
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="publish-queue-card">
      <div className="card-header">
        <h2>Publish Queue</h2>
        {totalCount > 0 && (
          <span className="count-badge">{totalCount} {totalCount === 1 ? 'item' : 'items'}</span>
        )}
      </div>

      <div className="card-body">
        {totalCount === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p>All content is published</p>
          </div>
        ) : (
          <>
            <PublishQueueList pages={pages} projects={projects} />
            
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={isPublishing}
              className="btn btn-primary publish-button"
            >
              {isPublishing ? 'Publishing...' : `Publish All ${totalCount} ${totalCount === 1 ? 'Item' : 'Items'}`}
            </button>
          </>
        )}

        {error && (
          <div className="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            All changes published successfully!
          </div>
        )}
      </div>

      <PublishConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handlePublish}
        pages={pages}
        projects={projects}
        isPublishing={isPublishing}
      />

      <style jsx>{`
        .publish-queue-card {
          background: white;
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: var(--radius-md, 8px);
          overflow: hidden;
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4, 16px) var(--space-6, 24px);
          border-bottom: 1px solid var(--border-color, #e5e7eb);
          background: var(--bg-secondary, #f9fafb);
        }

        .card-header h2 {
          font-size: var(--text-lg, 18px);
          font-weight: 600;
          color: var(--text-primary, #111827);
          margin: 0;
        }

        .count-badge {
          font-size: var(--text-sm, 14px);
          font-weight: 500;
          color: var(--text-secondary, #6b7280);
          background: white;
          padding: var(--space-1, 4px) var(--space-3, 12px);
          border-radius: var(--radius-full, 9999px);
          border: 1px solid var(--border-color, #e5e7eb);
        }

        .card-body {
          padding: var(--space-6, 24px);
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

        .publish-button {
          margin-top: var(--space-4, 16px);
          width: 100%;
        }

        .btn {
          padding: var(--space-3, 12px) var(--space-4, 16px);
          border-radius: var(--radius-md, 8px);
          font-size: var(--text-sm, 14px);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: var(--color-primary, #3b82f6);
          color: white;
          border-color: var(--color-primary, #3b82f6);
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--color-primary-dark, #2563eb);
          border-color: var(--color-primary-dark, #2563eb);
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: var(--space-2, 8px);
          margin-top: var(--space-4, 16px);
          padding: var(--space-3, 12px);
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: var(--radius-md, 8px);
          color: #991b1b;
          font-size: var(--text-sm, 14px);
        }

        .error-message svg {
          flex-shrink: 0;
        }

        .success-message {
          display: flex;
          align-items: center;
          gap: var(--space-2, 8px);
          margin-top: var(--space-4, 16px);
          padding: var(--space-3, 12px);
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: var(--radius-md, 8px);
          color: #166534;
          font-size: var(--text-sm, 14px);
        }

        .success-message svg {
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .card-header,
          .card-body {
            padding: var(--space-4, 16px);
          }

          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-2, 8px);
          }
        }
      `}</style>
    </div>
  )
}
