'use client'

import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { templates } from '@/components/portfolio/templates'

interface TemplatePreviewModalProps {
  templateId: string
  /** @deprecated No longer needed - preview URL is now /preview */
  portfolioSlug?: string
  onClose: () => void
  onSelect: () => void
}

export function TemplatePreviewModal({
  templateId,
  onClose,
  onSelect,
}: TemplatePreviewModalProps) {
  const template = templates.find(t => t.id === templateId)
  const previewUrl = `/preview?template=${templateId}`

  // Close on escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  const modal = (
    <div className="template-preview-overlay" onClick={onClose}>
      <div 
        className="template-preview-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-title"
      >
        <div className="template-preview-header">
          <h2 id="preview-title">{template?.name || 'Template'} Preview</h2>
          <button
            type="button"
            className="template-preview-close"
            onClick={onClose}
            aria-label="Close preview"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="template-preview-viewport">
          <iframe
            src={previewUrl}
            title={`Preview of ${template?.name} template`}
            className="template-preview-iframe"
          />
        </div>

        <div className="template-preview-footer">
          <p className="template-preview-hint">
            {template?.bestFor ? `Best for: ${template.bestFor}` : ''}
          </p>
          <div className="template-preview-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onSelect()
                onClose()
              }}
            >
              Use This Template
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Render to body via portal
  if (typeof document === 'undefined') return null
  return createPortal(modal, document.body)
}
