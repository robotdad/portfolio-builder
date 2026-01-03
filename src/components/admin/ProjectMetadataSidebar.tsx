'use client'

import { useState } from 'react'
import Link from 'next/link'

// ============================================================================
// Types
// ============================================================================

interface ProjectMetadataSidebarProps {
  metadata: {
    year: string
    venue: string
    role: string
    isFeatured: boolean
  }
  onChange: (updates: Partial<ProjectMetadataSidebarProps['metadata']>) => void
  categoryId: string
  categoryName: string
}

// ============================================================================
// Icons
// ============================================================================

function ChevronDownIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function ChevronUpIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}

function MapPinIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  )
}

// ============================================================================
// Component
// ============================================================================

export function ProjectMetadataSidebar({
  metadata,
  onChange,
  categoryId,
  categoryName,
}: ProjectMetadataSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleTextChange = (field: 'year' | 'venue' | 'role', value: string) => {
    onChange({ [field]: value })
  }

  const handleCheckboxChange = (checked: boolean) => {
    onChange({ isFeatured: checked })
  }

  return (
    <div className="metadata-sidebar">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="sidebar-header"
        aria-expanded={isExpanded}
        aria-controls="metadata-content"
      >
        <span className="sidebar-title">Project Details</span>
        <span className="sidebar-chevron">
          {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div id="metadata-content" className="sidebar-content">
          {/* Category (display only) */}
          <div className="field-group">
            <label className="field-label">
              <FolderIcon />
              <span>Category</span>
            </label>
            <Link
              href={`/admin/categories/${categoryId}/projects`}
              className="category-link"
            >
              {categoryName}
            </Link>
          </div>

          {/* Year */}
          <div className="field-group">
            <label htmlFor="metadata-year" className="field-label">
              <CalendarIcon />
              <span>Year</span>
            </label>
            <input
              id="metadata-year"
              type="text"
              value={metadata.year}
              onChange={(e) => handleTextChange('year', e.target.value)}
              placeholder="e.g., 2024"
              className="field-input"
            />
          </div>

          {/* Venue */}
          <div className="field-group">
            <label htmlFor="metadata-venue" className="field-label">
              <MapPinIcon />
              <span>Venue</span>
            </label>
            <input
              id="metadata-venue"
              type="text"
              value={metadata.venue}
              onChange={(e) => handleTextChange('venue', e.target.value)}
              placeholder="e.g., Gallery Name"
              className="field-input"
            />
          </div>

          {/* Role */}
          <div className="field-group">
            <label htmlFor="metadata-role" className="field-label">
              <UserIcon />
              <span>Role</span>
            </label>
            <input
              id="metadata-role"
              type="text"
              value={metadata.role}
              onChange={(e) => handleTextChange('role', e.target.value)}
              placeholder="e.g., Lead Designer"
              className="field-input"
            />
          </div>

          {/* Featured */}
          <div className="field-group field-group--featured">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={metadata.isFeatured}
                onChange={(e) => handleCheckboxChange(e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-content">
                <StarIcon />
                <span>Feature on homepage</span>
              </span>
            </label>
            <p className="field-hint">
              Featured projects appear in the portfolio highlights
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        .metadata-sidebar {
          background: var(--color-surface, #ffffff);
          border-radius: var(--radius-lg, 8px);
          border: 1px solid var(--color-border, #e5e7eb);
          box-shadow: var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
          overflow: hidden;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: var(--space-4, 16px);
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background-color var(--transition-fast, 150ms ease);
        }

        .sidebar-header:hover {
          background: var(--color-surface-hover, #f9fafb);
        }

        .sidebar-header:focus-visible {
          outline: 2px solid var(--color-accent, #3b82f6);
          outline-offset: -2px;
        }

        .sidebar-title {
          font-size: var(--font-size-base, 14px);
          font-weight: var(--font-weight-medium, 500);
          color: var(--color-text, #1f2937);
        }

        .sidebar-chevron {
          display: flex;
          align-items: center;
          color: var(--color-text-muted, #6b7280);
        }

        .sidebar-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-4, 16px);
          padding: 0 var(--space-4, 16px) var(--space-4, 16px);
          border-top: 1px solid var(--color-border, #e5e7eb);
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-1, 4px);
        }

        .field-group:first-child {
          padding-top: var(--space-4, 16px);
        }

        .field-group--featured {
          padding-top: var(--space-2, 8px);
        }

        .field-label {
          display: flex;
          align-items: center;
          gap: var(--space-2, 8px);
          font-size: var(--font-size-sm, 13px);
          font-weight: var(--font-weight-medium, 500);
          color: var(--color-text-muted, #6b7280);
        }

        .field-input {
          width: 100%;
          padding: var(--space-2, 8px) var(--space-3, 12px);
          font-size: 16px; /* Prevents iOS zoom */
          color: var(--color-text, #1f2937);
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-md, 6px);
          transition: border-color var(--transition-fast, 150ms ease),
                      box-shadow var(--transition-fast, 150ms ease);
        }

        .field-input::placeholder {
          color: var(--color-text-placeholder, #9ca3af);
        }

        .field-input:focus {
          outline: none;
          border-color: var(--color-accent, #3b82f6);
          box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
        }

        .category-link {
          display: inline-block;
          font-size: var(--font-size-sm, 13px);
          color: var(--color-accent, #3b82f6);
          text-decoration: none;
          transition: text-decoration var(--transition-fast, 150ms ease);
        }

        .category-link:hover {
          text-decoration: underline;
        }

        .category-link:focus-visible {
          outline: 2px solid var(--color-accent, #3b82f6);
          outline-offset: 2px;
          border-radius: 2px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--space-3, 12px);
          cursor: pointer;
        }

        .checkbox-input {
          width: 18px;
          height: 18px;
          margin: 0;
          accent-color: var(--color-accent, #3b82f6);
          cursor: pointer;
        }

        .checkbox-content {
          display: flex;
          align-items: center;
          gap: var(--space-2, 8px);
          font-size: var(--font-size-sm, 13px);
          font-weight: var(--font-weight-medium, 500);
          color: var(--color-text, #1f2937);
        }

        .field-hint {
          margin: 0;
          margin-left: 30px;
          font-size: var(--font-size-xs, 12px);
          color: var(--color-text-muted, #6b7280);
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .sidebar-header,
          .field-input,
          .category-link {
            transition: none;
          }
        }
      `}</style>
    </div>
  )
}
