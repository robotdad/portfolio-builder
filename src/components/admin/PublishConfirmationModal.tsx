'use client'

import React, { useEffect } from 'react'
import { PublishQueueList } from './PublishQueueList'

export interface PublishConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  pages: Array<{ id: string; title: string; slug: string }>
  projects: Array<{ id: string; title: string; categoryName: string }>
  isPublishing?: boolean
}

export function PublishConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  pages,
  projects,
  isPublishing = false
}: PublishConfirmationModalProps) {
  const totalCount = pages.length + projects.length

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPublishing) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, isPublishing, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleConfirm = async () => {
    await onConfirm()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isPublishing) {
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Confirm Publish</h2>
          <button
            onClick={onClose}
            disabled={isPublishing}
            className="close-button"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="warning">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p>
              This will publish <strong>{totalCount}</strong> {totalCount === 1 ? 'item' : 'items'} to the live site.
            </p>
          </div>

          <div className="queue-preview">
            <PublishQueueList pages={pages} projects={projects} />
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={onClose}
            disabled={isPublishing}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPublishing}
            className="btn btn-primary"
          >
            {isPublishing ? 'Publishing...' : `Publish ${totalCount} ${totalCount === 1 ? 'Item' : 'Items'}`}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--overlay-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--space-4, 16px);
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background: white;
          border-radius: var(--radius-lg, 12px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.2s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4, 16px) var(--space-6, 24px);
          border-bottom: 1px solid var(--border-color, #e5e7eb);
        }

        .modal-header h2 {
          font-size: var(--text-xl, 20px);
          font-weight: 600;
          color: var(--text-primary, #111827);
          margin: 0;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 32px;
          line-height: 1;
          color: var(--text-secondary, #6b7280);
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm, 6px);
          transition: all 0.2s ease;
        }

        .close-button:hover:not(:disabled) {
          background: var(--bg-secondary, #f9fafb);
          color: var(--text-primary, #111827);
        }

        .close-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-6, 24px);
        }

        .warning {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3, 12px);
          padding: var(--space-4, 16px);
          background: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: var(--radius-md, 8px);
          margin-bottom: var(--space-4, 16px);
        }

        .warning svg {
          flex-shrink: 0;
          color: #d97706;
          margin-top: 2px;
        }

        .warning p {
          margin: 0;
          font-size: var(--text-sm, 14px);
          color: #92400e;
          line-height: 1.5;
        }

        .warning strong {
          font-weight: 600;
        }

        .queue-preview {
          margin-top: var(--space-4, 16px);
        }

        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: var(--space-3, 12px);
          padding: var(--space-4, 16px) var(--space-6, 24px);
          border-top: 1px solid var(--border-color, #e5e7eb);
        }

        .btn {
          padding: var(--space-2, 8px) var(--space-4, 16px);
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

        .btn-secondary {
          background: white;
          color: var(--text-primary, #111827);
          border-color: var(--border-color, #e5e7eb);
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--bg-secondary, #f9fafb);
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

        @media (max-width: 768px) {
          .modal-content {
            max-height: 95vh;
          }

          .modal-header,
          .modal-footer {
            padding: var(--space-4, 16px);
          }

          .modal-body {
            padding: var(--space-4, 16px);
          }
        }
      `}</style>
    </div>
  )
}
