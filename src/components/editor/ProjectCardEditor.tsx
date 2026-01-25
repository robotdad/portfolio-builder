'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { ProjectCardSection } from '@/lib/content-schema'

// ============================================================================
// Types
// ============================================================================

interface Project {
  id: string
  title: string
  slug: string
  year: string | null
  venue: string | null
  featuredImage: {
    id: string
    url: string
    thumbnailUrl: string
    altText: string | null
  } | null
}

interface ProjectCardEditorProps {
  section: ProjectCardSection
  onChange: (section: ProjectCardSection) => void
  onDelete: () => void
  categoryId?: string
}

// ============================================================================
// Icons
// ============================================================================

function SearchIcon() {
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
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function ChevronDownIcon() {
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
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function CameraIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}

function DeleteIcon() {
  return (
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
  )
}

// ============================================================================
// ProjectCardEditor Component
// ============================================================================

export function ProjectCardEditor({
  section,
  onChange,
  onDelete,
  categoryId,
}: ProjectCardEditorProps) {
  // State
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Find selected project
  const selectedProject = useMemo(
    () => projects.find((p) => p.id === section.projectId) || null,
    [projects, section.projectId]
  )

  // Filter projects by search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects
    const query = searchQuery.toLowerCase()
    return projects.filter((p) => p.title.toLowerCase().includes(query))
  }, [projects, searchQuery])

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      if (!categoryId) {
        setError('No category context available')
        setIsLoading(false)
        return
      }
      
      try {
        setError(null)
        const response = await fetch(`/api/projects?categoryId=${categoryId}`)
        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch projects')
        }

        setProjects(result.data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch projects'
        setError(message)
        console.error('Error fetching projects:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [categoryId])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isDropdownOpen])

  // Handlers
  const handleToggleDropdown = useCallback(() => {
    setIsDropdownOpen((prev) => !prev)
    if (!isDropdownOpen) {
      setSearchQuery('')
    }
  }, [isDropdownOpen])

  const handleSelectProject = useCallback(
    (projectId: string) => {
      onChange({ ...section, projectId })
      setIsDropdownOpen(false)
      setSearchQuery('')
    },
    [section, onChange]
  )

  const handleClearProject = useCallback(() => {
    onChange({ ...section, projectId: null })
  }, [section, onChange])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleCardSizeChange = useCallback(
    (cardSize: 'compact' | 'standard' | 'large') => {
      onChange({ ...section, cardSize })
    },
    [section, onChange]
  )

  const handleShowMetadataChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...section, showMetadata: e.target.checked })
    },
    [section, onChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false)
        setSearchQuery('')
      }
    },
    []
  )

  return (
    <div className="section-editor section-editor-project-card">
      <div className="section-editor-header">
        <span className="section-type-label">Project Card</span>
        <button
          type="button"
          onClick={onDelete}
          className="section-delete-btn"
          aria-label="Delete section"
        >
          <DeleteIcon />
        </button>
      </div>

      <div className="section-editor-content">
        {/* Project Selector */}
        <div className="form-group">
          <label className="form-label">Project</label>

          {isLoading ? (
            <div className="project-selector-loading">
              <div className="loading-spinner" />
              <span>Loading projects...</span>
            </div>
          ) : error ? (
            <div className="project-selector-error">
              <p>{error}</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="project-selector-empty">
              <p>No projects available. Create projects in your categories first.</p>
            </div>
          ) : selectedProject ? (
            /* Selected Project Preview */
            <div className="selected-project">
              <div className="selected-project-card">
                <div className="selected-project-thumbnail">
                  {selectedProject.featuredImage?.thumbnailUrl ||
                  selectedProject.featuredImage?.url ? (
                    <img
                      src={
                        selectedProject.featuredImage.thumbnailUrl ||
                        selectedProject.featuredImage.url
                      }
                      alt={selectedProject.featuredImage.altText || selectedProject.title}
                    />
                  ) : (
                    <div className="thumbnail-placeholder">
                      <CameraIcon size={24} />
                    </div>
                  )}
                </div>
                <div className="selected-project-info">
                  <span className="selected-project-title">{selectedProject.title}</span>
                  {(selectedProject.year || selectedProject.venue) && (
                    <span className="selected-project-meta">
                      {[selectedProject.year, selectedProject.venue]
                        .filter(Boolean)
                        .join(' \u2022 ')}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="change-project-btn"
                onClick={handleToggleDropdown}
              >
                Change
              </button>
            </div>
          ) : null}

          {/* Dropdown (shown when no selection or dropdown is open) */}
          {!isLoading && !error && projects.length > 0 && (!selectedProject || isDropdownOpen) && (
            <div
              ref={dropdownRef}
              className={`project-dropdown ${isDropdownOpen ? 'open' : ''}`}
              onKeyDown={handleKeyDown}
            >
              <button
                type="button"
                className="project-dropdown-trigger"
                onClick={handleToggleDropdown}
                aria-expanded={isDropdownOpen}
                aria-haspopup="listbox"
              >
                <div className="project-dropdown-trigger-content">
                  <SearchIcon />
                  <span className="project-dropdown-placeholder">
                    {selectedProject ? 'Search projects...' : 'Select a project'}
                  </span>
                </div>
                <ChevronDownIcon />
              </button>

              {isDropdownOpen && (
                <div className="project-dropdown-menu" role="listbox">
                  <div className="project-dropdown-search">
                    <SearchIcon />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search projects..."
                      className="project-dropdown-search-input"
                      aria-label="Search projects"
                    />
                  </div>

                  <div className="project-dropdown-list">
                    {filteredProjects.length === 0 ? (
                      <div className="project-dropdown-no-results">
                        No projects match &ldquo;{searchQuery}&rdquo;
                      </div>
                    ) : (
                      filteredProjects.map((project) => (
                        <button
                          key={project.id}
                          type="button"
                          className={`project-dropdown-item ${
                            project.id === section.projectId ? 'selected' : ''
                          }`}
                          onClick={() => handleSelectProject(project.id)}
                          role="option"
                          aria-selected={project.id === section.projectId}
                        >
                          <div className="project-dropdown-item-thumbnail">
                            {project.featuredImage?.thumbnailUrl ||
                            project.featuredImage?.url ? (
                              <img
                                src={
                                  project.featuredImage.thumbnailUrl ||
                                  project.featuredImage.url
                                }
                                alt={project.featuredImage.altText || project.title}
                              />
                            ) : (
                              <div className="thumbnail-placeholder">
                                <CameraIcon size={16} />
                              </div>
                            )}
                          </div>
                          <div className="project-dropdown-item-info">
                            <span className="project-dropdown-item-title">
                              {project.title}
                            </span>
                            {project.year && (
                              <span className="project-dropdown-item-year">
                                {project.year}
                              </span>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Clear selection link */}
          {selectedProject && !isDropdownOpen && (
            <button
              type="button"
              className="clear-selection-btn"
              onClick={handleClearProject}
            >
              Clear selection
            </button>
          )}
        </div>

        {/* Card Size Selector */}
        <div className="form-group">
          <label className="form-label">Card Size</label>
          <div className="card-size-options">
            {(['compact', 'standard', 'large'] as const).map((size) => (
              <label
                key={size}
                className={`card-size-option ${section.cardSize === size ? 'active' : ''}`}
              >
                <input
                  type="radio"
                  name={`card-size-${section.id}`}
                  value={size}
                  checked={section.cardSize === size}
                  onChange={() => handleCardSizeChange(size)}
                  className="sr-only"
                />
                <div className={`card-size-preview card-size-preview-${size}`}>
                  <div className="card-size-preview-image" />
                  <div className="card-size-preview-content">
                    <div className="card-size-preview-title" />
                    {size !== 'compact' && <div className="card-size-preview-meta" />}
                  </div>
                </div>
                <span className="card-size-label">
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Show Metadata Toggle */}
        <div className="form-group">
          <label className="form-label">Display Options</label>
          <div className="display-options">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={section.showMetadata}
                onChange={handleShowMetadataChange}
                className="form-checkbox"
              />
              <span>Show metadata (year, venue, role)</span>
            </label>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Loading, Error, Empty States */
        .project-selector-loading,
        .project-selector-error,
        .project-selector-empty {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          background: var(--color-bg-secondary, #f9fafb);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-md, 8px);
          color: var(--color-text-secondary, #6b7280);
          font-size: var(--text-sm, 0.875rem);
        }

        .project-selector-error {
          background: rgba(239, 68, 68, 0.05);
          border-color: rgba(239, 68, 68, 0.2);
          color: var(--color-error, #dc2626);
        }

        .project-selector-loading p,
        .project-selector-error p,
        .project-selector-empty p {
          margin: 0;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid var(--color-border, #e5e7eb);
          border-top-color: var(--color-accent, #3b82f6);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Selected Project Preview */
        .selected-project {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .selected-project-card {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          background: var(--color-accent-light, rgba(59, 130, 246, 0.05));
          border: 2px solid var(--color-accent, #3b82f6);
          border-radius: var(--radius-md, 8px);
        }

        .selected-project-thumbnail {
          width: 64px;
          height: 48px;
          border-radius: var(--radius-sm, 4px);
          overflow: hidden;
          flex-shrink: 0;
          background: var(--color-bg-secondary, #f3f4f6);
        }

        .selected-project-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary, #9ca3af);
        }

        .selected-project-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .selected-project-title {
          font-size: var(--text-sm, 0.875rem);
          font-weight: 600;
          color: var(--color-text, #111827);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .selected-project-meta {
          font-size: var(--text-xs, 0.75rem);
          color: var(--color-text-secondary, #6b7280);
        }

        .change-project-btn {
          align-self: flex-end;
          font-size: var(--text-sm, 0.875rem);
          font-weight: 500;
          color: var(--color-accent, #3b82f6);
          background: none;
          border: none;
          cursor: pointer;
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm, 4px);
          transition: background-color 150ms ease;
        }

        .change-project-btn:hover {
          background: var(--color-accent-light, rgba(59, 130, 246, 0.1));
        }

        .clear-selection-btn {
          font-size: var(--text-xs, 0.75rem);
          color: var(--color-text-secondary, #6b7280);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
          transition: color 150ms ease;
        }

        .clear-selection-btn:hover {
          color: var(--color-text, #111827);
        }

        /* Project Dropdown */
        .project-dropdown {
          position: relative;
        }

        .project-dropdown-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: var(--space-3);
          background: var(--color-bg, #ffffff);
          border: 2px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-md, 8px);
          cursor: pointer;
          transition: border-color 150ms ease;
        }

        .project-dropdown-trigger:hover {
          border-color: var(--color-text-secondary, #9ca3af);
        }

        .project-dropdown.open .project-dropdown-trigger {
          border-color: var(--color-accent, #3b82f6);
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }

        .project-dropdown-trigger-content {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--color-text-secondary, #6b7280);
        }

        .project-dropdown-placeholder {
          font-size: var(--text-sm, 0.875rem);
        }

        .project-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--color-bg, #ffffff);
          border: 2px solid var(--color-accent, #3b82f6);
          border-top: none;
          border-bottom-left-radius: var(--radius-md, 8px);
          border-bottom-right-radius: var(--radius-md, 8px);
          z-index: 50;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .project-dropdown-search {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          border-bottom: 1px solid var(--color-border, #e5e7eb);
          color: var(--color-text-secondary, #6b7280);
        }

        .project-dropdown-search-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: var(--text-sm, 0.875rem);
          background: transparent;
          color: var(--color-text, #111827);
        }

        .project-dropdown-search-input::placeholder {
          color: var(--color-text-secondary, #9ca3af);
        }

        .project-dropdown-list {
          max-height: 280px;
          overflow-y: auto;
        }

        .project-dropdown-no-results {
          padding: var(--space-4);
          text-align: center;
          font-size: var(--text-sm, 0.875rem);
          color: var(--color-text-secondary, #6b7280);
        }

        .project-dropdown-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          width: 100%;
          padding: var(--space-2) var(--space-3);
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background-color 150ms ease;
        }

        .project-dropdown-item:hover {
          background: var(--color-bg-secondary, #f9fafb);
        }

        .project-dropdown-item.selected {
          background: var(--color-accent-light, rgba(59, 130, 246, 0.1));
        }

        .project-dropdown-item-thumbnail {
          width: 40px;
          height: 30px;
          border-radius: var(--radius-sm, 4px);
          overflow: hidden;
          flex-shrink: 0;
          background: var(--color-bg-secondary, #f3f4f6);
        }

        .project-dropdown-item-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .project-dropdown-item-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .project-dropdown-item-title {
          font-size: var(--text-sm, 0.875rem);
          font-weight: 500;
          color: var(--color-text, #111827);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .project-dropdown-item-year {
          font-size: var(--text-xs, 0.75rem);
          color: var(--color-text-secondary, #6b7280);
        }

        /* Card Size Selector */
        .card-size-options {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
        }

        .card-size-option {
          flex: 1;
          min-width: 90px;
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

        .card-size-option:hover {
          border-color: var(--color-text-secondary, #6b7280);
        }

        .card-size-option.active {
          border-color: var(--color-accent, #3b82f6);
          background-color: var(--color-accent-light, rgba(59, 130, 246, 0.05));
        }

        .card-size-preview {
          display: flex;
          width: 100%;
          gap: 4px;
          padding: 4px;
          background: var(--color-bg-secondary, #f3f4f6);
          border-radius: var(--radius-sm, 4px);
        }

        .card-size-preview-compact {
          height: 28px;
        }

        .card-size-preview-standard {
          height: 36px;
        }

        .card-size-preview-large {
          height: 48px;
          flex-direction: column;
        }

        .card-size-preview-image {
          background: var(--color-border, #d1d5db);
          border-radius: 2px;
          transition: background-color 150ms ease;
        }

        .card-size-preview-compact .card-size-preview-image {
          width: 24px;
          height: 100%;
        }

        .card-size-preview-standard .card-size-preview-image {
          width: 32px;
          height: 100%;
        }

        .card-size-preview-large .card-size-preview-image {
          width: 100%;
          height: 24px;
        }

        .card-size-option.active .card-size-preview-image {
          background: var(--color-accent, #3b82f6);
        }

        .card-size-preview-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 3px;
        }

        .card-size-preview-title {
          height: 6px;
          background: var(--color-border, #d1d5db);
          border-radius: 2px;
          transition: background-color 150ms ease;
        }

        .card-size-preview-meta {
          height: 4px;
          width: 60%;
          background: var(--color-border, #e5e7eb);
          border-radius: 2px;
        }

        .card-size-option.active .card-size-preview-title {
          background: var(--color-accent, #3b82f6);
        }

        .card-size-label {
          font-size: var(--text-sm, 0.875rem);
          color: var(--color-text, #111827);
          font-weight: 500;
        }

        /* Display Options */
        .display-options {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        @media (max-width: 640px) {
          .card-size-options {
            gap: var(--space-2);
          }

          .card-size-option {
            min-width: 80px;
            padding: var(--space-2);
          }

          .card-size-label {
            font-size: var(--text-xs, 0.75rem);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .loading-spinner {
            animation: none;
          }

          .project-dropdown-trigger,
          .project-dropdown-item,
          .change-project-btn,
          .clear-selection-btn,
          .card-size-option,
          .card-size-preview-image,
          .card-size-preview-title {
            transition: none;
          }
        }
      `}</style>
    </div>
  )
}
