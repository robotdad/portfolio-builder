'use client'

import type { CategoryGridSection } from '@/lib/content-schema'

interface CategoryGridEditorProps {
  section: CategoryGridSection
  portfolioId: string
  onChange: (section: CategoryGridSection) => void
  onDelete: () => void
}

export function CategoryGridEditor({
  section,
  portfolioId,
  onChange,
  onDelete,
}: CategoryGridEditorProps) {
  const handleHeadingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...section, heading: e.target.value })
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...section, description: e.target.value })
  }

  const handleColumnsChange = (columns: 2 | 3 | 4) => {
    onChange({ ...section, columns })
  }

  const handleShowDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...section, showDescription: e.target.checked })
  }

  const handleShowProjectCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...section, showProjectCount: e.target.checked })
  }

  return (
    <div className="section-editor section-editor-category-grid">
      <div className="section-editor-header">
        <span className="section-type-label">Category Grid</span>
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
          <label htmlFor={`category-grid-heading-${section.id}`} className="form-label">
            Section Heading
          </label>
          <input
            type="text"
            id={`category-grid-heading-${section.id}`}
            value={section.heading}
            onChange={handleHeadingChange}
            className="form-input"
            placeholder="e.g., Work, Projects, Portfolio"
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor={`category-grid-description-${section.id}`} className="form-label">
            Description (optional)
          </label>
          <textarea
            id={`category-grid-description-${section.id}`}
            value={section.description}
            onChange={handleDescriptionChange}
            className="form-input"
            placeholder="Optional intro text above the category grid"
            rows={3}
          />
        </div>

        {/* Column Layout */}
        <div className="form-group">
          <label className="form-label">Grid Columns (desktop)</label>
          <div className="category-grid-columns">
            {[2, 3, 4].map((num) => (
              <label
                key={num}
                className={`category-grid-column-option ${
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
                <div className="category-grid-column-preview">
                  {Array.from({ length: num }).map((_, i) => (
                    <div key={i} className="category-grid-column-cell" />
                  ))}
                </div>
                <span className="category-grid-column-label">{num} columns</span>
              </label>
            ))}
          </div>
        </div>

        {/* Display Options */}
        <div className="form-group">
          <label className="form-label">Display Options</label>
          <div className="category-grid-options">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={section.showDescription}
                onChange={handleShowDescriptionChange}
                className="form-checkbox"
              />
              <span>Show category descriptions</span>
            </label>
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={section.showProjectCount}
                onChange={handleShowProjectCountChange}
                className="form-checkbox"
              />
              <span>Show project count</span>
            </label>
          </div>
        </div>

        {/* Category Selection Info */}
        <div className="form-group">
          <label className="form-label">Categories</label>
          <div className="category-grid-info">
            <div className="category-grid-info-box">
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
                All categories will be displayed in the order you set in the Categories page.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .category-grid-columns {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
        }

        .category-grid-column-option {
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

        .category-grid-column-option:hover {
          border-color: var(--color-text-secondary, #6b7280);
        }

        .category-grid-column-option.active {
          border-color: var(--color-accent, #3b82f6);
          background-color: var(--color-accent-light, rgba(59, 130, 246, 0.05));
        }

        .category-grid-column-preview {
          display: grid;
          gap: 4px;
          width: 100%;
          height: 40px;
        }

        .category-grid-column-option:nth-child(1) .category-grid-column-preview {
          grid-template-columns: repeat(2, 1fr);
        }

        .category-grid-column-option:nth-child(2) .category-grid-column-preview {
          grid-template-columns: repeat(3, 1fr);
        }

        .category-grid-column-option:nth-child(3) .category-grid-column-preview {
          grid-template-columns: repeat(4, 1fr);
        }

        .category-grid-column-cell {
          background-color: var(--color-border, #e5e7eb);
          border-radius: 2px;
          transition: background-color 150ms ease;
        }

        .category-grid-column-option.active .category-grid-column-cell {
          background-color: var(--color-accent, #3b82f6);
        }

        .category-grid-column-label {
          font-size: var(--text-sm, 0.875rem);
          color: var(--color-text, #111827);
          font-weight: 500;
        }

        .category-grid-options {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .category-grid-info {
          margin-top: var(--space-1);
        }

        .category-grid-info-box {
          display: flex;
          gap: var(--space-3);
          padding: var(--space-3);
          background-color: var(--color-bg-secondary, #f9fafb);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-md, 8px);
        }

        .category-grid-info-box svg {
          flex-shrink: 0;
          color: var(--color-text-secondary, #6b7280);
        }

        .category-grid-info-box p {
          margin: 0;
          font-size: var(--text-sm, 0.875rem);
          color: var(--color-text-secondary, #6b7280);
          line-height: 1.5;
        }

        @media (max-width: 640px) {
          .category-grid-columns {
            gap: var(--space-2);
          }

          .category-grid-column-option {
            min-width: 70px;
            padding: var(--space-2);
          }

          .category-grid-column-preview {
            height: 30px;
          }

          .category-grid-column-label {
            font-size: var(--text-xs, 0.75rem);
          }
        }
      `}</style>
    </div>
  )
}
