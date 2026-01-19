'use client'

import type { ProjectGridSection } from '@/lib/content-schema'

interface ProjectGridEditorProps {
  section: ProjectGridSection
  categoryId: string
  onChange: (section: ProjectGridSection) => void
  onDelete: () => void
}

export function ProjectGridEditor({
  section,
  categoryId,
  onChange,
  onDelete,
}: ProjectGridEditorProps) {
  const handleHeadingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...section, heading: e.target.value })
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...section, description: e.target.value })
  }

  const handleColumnsChange = (columns: 2 | 3 | 4) => {
    onChange({ ...section, columns })
  }

  const handleLayoutChange = (layout: 'grid' | 'masonry' | 'list') => {
    onChange({ ...section, layout })
  }

  const handleShowMetadataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...section, showMetadata: e.target.checked })
  }

  return (
    <div className="section-editor section-editor-project-grid">
      <div className="section-editor-header">
        <span className="section-type-label">Project Grid</span>
        <button
          type="button"
          onClick={onDelete}
          className="section-delete-btn"
          aria-label="Delete section"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>

      <div className="section-editor-content">
        {/* Heading */}
        <div className="form-group">
          <label htmlFor={`project-grid-heading-${section.id}`} className="form-label">
            Section Heading
          </label>
          <input
            type="text"
            id={`project-grid-heading-${section.id}`}
            value={section.heading}
            onChange={handleHeadingChange}
            className="form-input"
            placeholder="e.g., Projects, Case Studies, Recent Work"
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor={`project-grid-description-${section.id}`} className="form-label">
            Description (optional)
          </label>
          <textarea
            id={`project-grid-description-${section.id}`}
            value={section.description}
            onChange={handleDescriptionChange}
            className="form-input"
            placeholder="Optional intro text above the project grid"
            rows={3}
          />
        </div>

        {/* Column Layout */}
        <div className="form-group">
          <label className="form-label">Grid Columns (desktop)</label>
          <div className="project-grid-columns">
            {[2, 3, 4].map((num) => (
              <label
                key={num}
                className={`project-grid-column-option ${
                  section.columns === num ? 'active' : ''
                }`}
              >
                <input
                  type="radio"
                  name={`columns-${section.id}`}
                  value={num}
                  checked={section.columns === num}
                  onChange={() => handleColumnsChange(num as 2 | 3 | 4)}
                  className="sr-only"
                />
                <div className="project-grid-column-preview">
                  {Array.from({ length: num }).map((_, i) => (
                    <div key={i} className="project-grid-column-cell" />
                  ))}
                </div>
                <span className="project-grid-column-label">{num} columns</span>
              </label>
            ))}
          </div>
        </div>

        {/* Layout Type */}
        <div className="form-group">
          <label className="form-label">Layout Style</label>
          <div className="project-grid-layout-options">
            <label className="project-grid-layout-option">
              <input
                type="radio"
                name={`layout-${section.id}`}
                value="grid"
                checked={section.layout === 'grid'}
                onChange={() => handleLayoutChange('grid')}
                className="form-radio"
              />
              <div className="project-grid-layout-content">
                <span className="project-grid-layout-name">Grid</span>
                <span className="project-grid-layout-description">
                  Uniform rows and columns
                </span>
              </div>
            </label>
            <label className="project-grid-layout-option">
              <input
                type="radio"
                name={`layout-${section.id}`}
                value="masonry"
                checked={section.layout === 'masonry'}
                onChange={() => handleLayoutChange('masonry')}
                className="form-radio"
              />
              <div className="project-grid-layout-content">
                <span className="project-grid-layout-name">Masonry</span>
                <span className="project-grid-layout-description">
                  Staggered heights (Pinterest-style)
                </span>
              </div>
            </label>
            <label className="project-grid-layout-option">
              <input
                type="radio"
                name={`layout-${section.id}`}
                value="list"
                checked={section.layout === 'list'}
                onChange={() => handleLayoutChange('list')}
                className="form-radio"
              />
              <div className="project-grid-layout-content">
                <span className="project-grid-layout-name">List</span>
                <span className="project-grid-layout-description">
                  Full-width rows with details
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Display Options */}
        <div className="form-group">
          <label className="form-label">Display Options</label>
          <div className="project-grid-options">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={section.showMetadata}
                onChange={handleShowMetadataChange}
                className="form-checkbox"
              />
              <span>Show project metadata (year, venue, role)</span>
            </label>
          </div>
        </div>

        {/* Project Selection Info */}
        <div className="form-group">
          <label className="form-label">Projects</label>
          <div className="project-grid-info">
            <div className="project-grid-info-box">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <p>
                All projects in this category will be displayed in the order you set in the Projects page.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .project-grid-columns {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
        }

        .project-grid-column-option {
          flex: 1;
          min-width: 80px;
          padding: var(--space-3);
          border: 2px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-md, 8px);
          cursor: pointer;
          transition: all 150ms ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
        }

        .project-grid-column-option:hover {
          border-color: var(--color-text-secondary, #6b7280);
        }

        .project-grid-column-option.active {
          border-color: var(--color-accent, #3b82f6);
          background-color: var(--color-accent-light, rgba(59, 130, 246, 0.05));
        }

        .project-grid-column-preview {
          display: grid;
          gap: 4px;
          width: 100%;
          height: 40px;
        }

        .project-grid-column-option:nth-child(1) .project-grid-column-preview {
          grid-template-columns: repeat(2, 1fr);
        }

        .project-grid-column-option:nth-child(2) .project-grid-column-preview {
          grid-template-columns: repeat(3, 1fr);
        }

        .project-grid-column-option:nth-child(3) .project-grid-column-preview {
          grid-template-columns: repeat(4, 1fr);
        }

        .project-grid-column-cell {
          background-color: var(--color-border, #e5e7eb);
          border-radius: 2px;
          transition: background-color 150ms ease;
        }

        .project-grid-column-option.active .project-grid-column-cell {
          background-color: var(--color-accent, #3b82f6);
        }

        .project-grid-column-label {
          font-size: var(--text-sm, 0.875rem);
          color: var(--color-text, #111827);
          font-weight: 500;
        }

        .project-grid-layout-options {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .project-grid-layout-option {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          border: 2px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-md, 8px);
          cursor: pointer;
          transition: all 150ms ease;
        }

        .project-grid-layout-option:hover {
          border-color: var(--color-text-secondary, #6b7280);
        }

        .project-grid-layout-option:has(input:checked) {
          border-color: var(--color-accent, #3b82f6);
          background-color: var(--color-accent-light, rgba(59, 130, 246, 0.05));
        }

        .project-grid-layout-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .project-grid-layout-name {
          font-size: var(--text-sm, 0.875rem);
          color: var(--color-text, #111827);
          font-weight: 500;
        }

        .project-grid-layout-description {
          font-size: var(--text-xs, 0.75rem);
          color: var(--color-text-secondary, #6b7280);
        }

        .project-grid-options {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .project-grid-info {
          margin-top: var(--space-1);
        }

        .project-grid-info-box {
          display: flex;
          gap: var(--space-3);
          padding: var(--space-3);
          background-color: var(--color-bg-secondary, #f9fafb);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-md, 8px);
        }

        .project-grid-info-box svg {
          flex-shrink: 0;
          color: var(--color-text-secondary, #6b7280);
        }

        .project-grid-info-box p {
          margin: 0;
          font-size: var(--text-sm, 0.875rem);
          color: var(--color-text-secondary, #6b7280);
          line-height: 1.5;
        }

        @media (max-width: 640px) {
          .project-grid-columns {
            gap: var(--space-2);
          }

          .project-grid-column-option {
            min-width: 70px;
            padding: var(--space-2);
          }

          .project-grid-column-preview {
            height: 30px;
          }

          .project-grid-column-label {
            font-size: var(--text-xs, 0.75rem);
          }

          .project-grid-layout-option {
            padding: var(--space-2);
          }
        }
      `}</style>
    </div>
  )
}
