'use client'

import { templates } from '@/components/portfolio/templates'

interface TemplateSelectorProps {
  value: string
  onChange: (templateId: string) => void
  onPreview?: (templateId: string) => void
  disabled?: boolean
}

export function TemplateSelector({
  value,
  onChange,
  onPreview,
  disabled = false,
}: TemplateSelectorProps) {
  return (
    <div className="template-selector">
      <label className="template-selector-label">Template</label>
      <div className="template-selector-cards">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            className={`template-card ${value === template.id ? 'template-card--selected' : ''}`}
            onClick={() => onChange(template.id)}
            disabled={disabled}
            aria-pressed={value === template.id}
          >
            <div className="template-card-preview">
              <TemplateThumbnail templateId={template.id} />
            </div>
            <div className="template-card-info">
              <span className="template-card-name">{template.name}</span>
              <span className="template-card-description">{template.description}</span>
            </div>
            {value === template.id && (
              <span className="template-card-check" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>
      {onPreview && (
        <button
          type="button"
          className="template-preview-link"
          onClick={() => onPreview(value)}
          disabled={disabled}
        >
          Preview with your content →
        </button>
      )}
    </div>
  )
}

// Simple SVG thumbnails showing template layout
function TemplateThumbnail({ templateId }: { templateId: string }) {
  if (templateId === 'featured-grid') {
    return (
      <svg viewBox="0 0 120 80" className="template-thumbnail">
        {/* Header */}
        <rect x="10" y="8" width="100" height="6" rx="1" fill="currentColor" opacity="0.2" />
        {/* Hero text */}
        <rect x="30" y="20" width="60" height="4" rx="1" fill="currentColor" opacity="0.4" />
        <rect x="40" y="26" width="40" height="2" rx="1" fill="currentColor" opacity="0.2" />
        {/* 3-column grid */}
        <rect x="10" y="36" width="30" height="20" rx="2" fill="currentColor" opacity="0.3" />
        <rect x="45" y="36" width="30" height="20" rx="2" fill="currentColor" opacity="0.3" />
        <rect x="80" y="36" width="30" height="20" rx="2" fill="currentColor" opacity="0.3" />
        <rect x="10" y="60" width="30" height="20" rx="2" fill="currentColor" opacity="0.3" />
        <rect x="45" y="60" width="30" height="20" rx="2" fill="currentColor" opacity="0.3" />
        <rect x="80" y="60" width="30" height="20" rx="2" fill="currentColor" opacity="0.3" />
      </svg>
    )
  }
  
  // Clean Minimal - stacked full-width
  return (
    <svg viewBox="0 0 120 80" className="template-thumbnail">
      {/* Header */}
      <rect x="10" y="8" width="100" height="6" rx="1" fill="currentColor" opacity="0.2" />
      {/* Expansive hero */}
      <rect x="25" y="18" width="70" height="5" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="35" y="25" width="50" height="2" rx="1" fill="currentColor" opacity="0.2" />
      {/* Stacked full-width images */}
      <rect x="10" y="32" width="100" height="20" rx="2" fill="currentColor" opacity="0.3" />
      <rect x="10" y="56" width="100" height="20" rx="2" fill="currentColor" opacity="0.3" />
    </svg>
  )
}
