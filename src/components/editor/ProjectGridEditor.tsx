'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ProjectGridSection } from '@/lib/content-schema'

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

interface ProjectGridEditorProps {
  section: ProjectGridSection
  categoryId: string
  onChange: (section: ProjectGridSection) => void
  onDelete: () => void
}

// ============================================================================
// Icons
// ============================================================================

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

function DragHandleIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="5" r="1.5" fill="currentColor" />
      <circle cx="15" cy="5" r="1.5" fill="currentColor" />
      <circle cx="9" cy="12" r="1.5" fill="currentColor" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" />
      <circle cx="9" cy="19" r="1.5" fill="currentColor" />
      <circle cx="15" cy="19" r="1.5" fill="currentColor" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
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
      style={{
        transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 150ms ease',
      }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

// ============================================================================
// SortableProjectCard Component
// ============================================================================

interface SortableProjectCardProps {
  project: Project
  onRemove: () => void
}

function SortableProjectCard({ project, onRemove }: SortableProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  } as React.CSSProperties

  const imageUrl = project.featuredImage?.thumbnailUrl || project.featuredImage?.url

  return (
    <div ref={setNodeRef} style={style} className="sortable-project-card">
      <div className="project-card-inner selected">
        {/* Drag Handle */}
        <button
          type="button"
          className="drag-handle"
          {...attributes}
          {...listeners}
          aria-label={`Drag to reorder ${project.title}`}
        >
          <DragHandleIcon />
        </button>

        {/* Image */}
        <div className="project-thumbnail">
          {imageUrl ? (
            <img src={imageUrl} alt={project.featuredImage?.altText || project.title} />
          ) : (
            <div className="thumbnail-placeholder">
              <CameraIcon size={24} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="project-info">
          <span className="project-title">{project.title}</span>
          {project.year && <span className="project-year">{project.year}</span>}
        </div>

        {/* Remove Button */}
        <button
          type="button"
          className="remove-btn"
          onClick={onRemove}
          aria-label={`Remove ${project.title} from selection`}
        >
          <CloseIcon />
        </button>
      </div>

      <style jsx>{`
        .sortable-project-card {
          touch-action: none;
        }

        .project-card-inner {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2);
          background: var(--color-bg, #ffffff);
          border: 2px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-md, 8px);
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }

        .project-card-inner.selected {
          border-color: var(--color-accent, #3b82f6);
          background: var(--color-accent-light, rgba(59, 130, 246, 0.05));
        }

        .drag-handle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          color: var(--color-text-secondary, #6b7280);
          cursor: grab;
          border-radius: var(--radius-sm, 4px);
          flex-shrink: 0;
          transition: color 150ms ease, background-color 150ms ease;
        }

        .drag-handle:hover {
          color: var(--color-text, #111827);
          background: var(--color-bg-secondary, #f3f4f6);
        }

        .drag-handle:active {
          cursor: grabbing;
        }

        .project-thumbnail {
          width: 48px;
          height: 36px;
          border-radius: var(--radius-sm, 4px);
          overflow: hidden;
          flex-shrink: 0;
          background: var(--color-bg-secondary, #f3f4f6);
        }

        .project-thumbnail img {
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

        .project-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .project-title {
          font-size: var(--text-sm, 0.875rem);
          font-weight: 500;
          color: var(--color-text, #111827);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .project-year {
          font-size: var(--text-xs, 0.75rem);
          color: var(--color-text-secondary, #6b7280);
        }

        .remove-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          color: var(--color-text-secondary, #6b7280);
          cursor: pointer;
          border-radius: var(--radius-sm, 4px);
          flex-shrink: 0;
          transition: color 150ms ease, background-color 150ms ease;
        }

        .remove-btn:hover {
          color: var(--color-error, #ef4444);
          background: rgba(239, 68, 68, 0.1);
        }

        @media (prefers-reduced-motion: reduce) {
          .project-card-inner,
          .drag-handle,
          .remove-btn {
            transition: none;
          }
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// AvailableProjectCard Component
// ============================================================================

interface AvailableProjectCardProps {
  project: Project
  onAdd: () => void
}

function AvailableProjectCard({ project, onAdd }: AvailableProjectCardProps) {
  const imageUrl = project.featuredImage?.thumbnailUrl || project.featuredImage?.url

  return (
    <button
      type="button"
      className="available-project-card"
      onClick={onAdd}
      aria-label={`Add ${project.title} to selection`}
    >
      <div className="project-thumbnail">
        {imageUrl ? (
          <img src={imageUrl} alt={project.featuredImage?.altText || project.title} />
        ) : (
          <div className="thumbnail-placeholder">
            <CameraIcon size={24} />
          </div>
        )}
        <div className="add-overlay">
          <PlusIcon />
        </div>
      </div>

      <div className="project-info">
        <span className="project-title">{project.title}</span>
        {project.year && <span className="project-year">{project.year}</span>}
      </div>

      <style jsx>{`
        .available-project-card {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2);
          width: 100%;
          background: var(--color-bg, #ffffff);
          border: 2px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-md, 8px);
          cursor: pointer;
          text-align: left;
          transition: border-color 150ms ease, background-color 150ms ease;
        }

        .available-project-card:hover {
          border-color: var(--color-text-secondary, #9ca3af);
          background: var(--color-bg-secondary, #f9fafb);
        }

        .available-project-card:hover .add-overlay {
          opacity: 1;
        }

        .project-thumbnail {
          position: relative;
          width: 48px;
          height: 36px;
          border-radius: var(--radius-sm, 4px);
          overflow: hidden;
          flex-shrink: 0;
          background: var(--color-bg-secondary, #f3f4f6);
        }

        .project-thumbnail img {
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

        .add-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(59, 130, 246, 0.85);
          color: white;
          opacity: 0;
          transition: opacity 150ms ease;
        }

        .project-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .project-title {
          font-size: var(--text-sm, 0.875rem);
          font-weight: 500;
          color: var(--color-text, #111827);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .project-year {
          font-size: var(--text-xs, 0.75rem);
          color: var(--color-text-secondary, #6b7280);
        }

        @media (prefers-reduced-motion: reduce) {
          .available-project-card,
          .add-overlay {
            transition: none;
          }
        }
      `}</style>
    </button>
  )
}

// ============================================================================
// ProjectGridEditor Component
// ============================================================================

export function ProjectGridEditor({
  section,
  categoryId,
  onChange,
  onDelete,
}: ProjectGridEditorProps) {
  // State
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [excludeSectionExpanded, setExcludeSectionExpanded] = useState<boolean>(
    () => (section.excludeProjectIds?.length ?? 0) > 0
  )

  // Derived state
  const isCustomMode = section.projectIds !== null
  const selectedIds = useMemo(() => section.projectIds || [], [section.projectIds])
  const excludedIds = useMemo(() => section.excludeProjectIds || [], [section.excludeProjectIds])
  const selectedProjects = selectedIds
    .map((id) => projects.find((p) => p.id === id))
    .filter((p): p is Project => p !== null)
  const availableProjects = projects.filter((p) => !selectedIds.includes(p.id))
  
  // Projects sorted alphabetically for exclusion checklist
  const sortedProjectsForExclusion = useMemo(
    () => [...projects].sort((a, b) => a.title.localeCompare(b.title)),
    [projects]
  )
  
  // Count of projects that will be shown (total - excluded)
  const visibleProjectCount = projects.length - excludedIds.length

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      if (!categoryId) {
        setProjects([])
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

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handlers
  const handleModeChange = useCallback(
    (customMode: boolean) => {
      if (customMode) {
        // Switch to custom mode - start with all projects selected in current order
        // Clear excludeProjectIds since custom mode uses explicit selection
        onChange({ ...section, projectIds: projects.map((p) => p.id), excludeProjectIds: null })
      } else {
        // Switch to all mode
        onChange({ ...section, projectIds: null })
      }
    },
    [section, onChange, projects]
  )

  const handleToggleExcludeProject = useCallback(
    (projectId: string) => {
      const currentExcluded = section.excludeProjectIds || []
      const isCurrentlyExcluded = currentExcluded.includes(projectId)
      
      let newExcluded: string[]
      if (isCurrentlyExcluded) {
        // Remove from exclusion list
        newExcluded = currentExcluded.filter((id) => id !== projectId)
      } else {
        // Add to exclusion list
        newExcluded = [...currentExcluded, projectId]
      }
      
      // Set to null if empty, otherwise use the array
      onChange({ 
        ...section, 
        excludeProjectIds: newExcluded.length > 0 ? newExcluded : null 
      })
    },
    [section, onChange]
  )

  const handleAddProject = useCallback(
    (projectId: string) => {
      const newIds = [...selectedIds, projectId]
      onChange({ ...section, projectIds: newIds })
    },
    [section, onChange, selectedIds]
  )

  const handleRemoveProject = useCallback(
    (projectId: string) => {
      const newIds = selectedIds.filter((id) => id !== projectId)
      // If no projects selected, stay in custom mode with empty array
      onChange({ ...section, projectIds: newIds })
    },
    [section, onChange, selectedIds]
  )

  const handleSelectAll = useCallback(() => {
    onChange({ ...section, projectIds: projects.map((p) => p.id) })
  }, [section, onChange, projects])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (over && active.id !== over.id) {
      const oldIndex = selectedIds.indexOf(active.id as string)
      const newIndex = selectedIds.indexOf(over.id as string)
      const newIds = arrayMove(selectedIds, oldIndex, newIndex)
      onChange({ ...section, projectIds: newIds })
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

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

  // Find active project for drag overlay
  const activeProject = activeId ? projects.find((p) => p.id === activeId) : null

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

        {/* Project Selection */}
        <div className="form-group">
          <label className="form-label">Projects</label>

          {isLoading ? (
            <div className="projects-loading">
              <div className="loading-spinner" />
              <span>Loading projects...</span>
            </div>
          ) : error ? (
            <div className="projects-error">
              <p>{error}</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="projects-empty">
              <p>No projects in this category yet.</p>
            </div>
          ) : (
            <>
              {/* Mode Toggle */}
              <div className="mode-toggle">
                <button
                  type="button"
                  className={`mode-btn ${!isCustomMode ? 'active' : ''}`}
                  onClick={() => handleModeChange(false)}
                >
                  <span className="mode-indicator">
                    {!isCustomMode && <CheckIcon />}
                  </span>
                  <span className="mode-label">
                    Show all projects
                    <span className="mode-count">({projects.length})</span>
                  </span>
                </button>
                <button
                  type="button"
                  className={`mode-btn ${isCustomMode ? 'active' : ''}`}
                  onClick={() => handleModeChange(true)}
                >
                  <span className="mode-indicator">
                    {isCustomMode && <CheckIcon />}
                  </span>
                  <span className="mode-label">Custom selection</span>
                </button>
              </div>

              {/* Custom Selection UI */}
              {isCustomMode && (
                <div className="custom-selection">
                  {/* Selected Projects */}
                  <div className="selection-section">
                    <div className="selection-header">
                      <span className="selection-title">
                        Selected ({selectedProjects.length})
                      </span>
                      {availableProjects.length > 0 && (
                        <button
                          type="button"
                          className="select-all-btn"
                          onClick={handleSelectAll}
                        >
                          Select all
                        </button>
                      )}
                    </div>

                    {selectedProjects.length === 0 ? (
                      <div className="selection-empty">
                        <p>No projects selected. Click projects below to add them.</p>
                      </div>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragCancel={handleDragCancel}
                      >
                        <SortableContext
                          items={selectedIds}
                          strategy={rectSortingStrategy}
                        >
                          <div className="selected-grid">
                            {selectedProjects.map((project) => (
                              <SortableProjectCard
                                key={project.id}
                                project={project}
                                onRemove={() => handleRemoveProject(project.id)}
                              />
                            ))}
                          </div>
                        </SortableContext>

                        <DragOverlay dropAnimation={null}>
                          {activeProject ? (
                            <div className="drag-overlay-card">
                              <div className="project-card-inner selected">
                                <div className="drag-handle">
                                  <DragHandleIcon />
                                </div>
                                <div className="project-thumbnail">
                                  {activeProject.featuredImage?.thumbnailUrl ||
                                  activeProject.featuredImage?.url ? (
                                    <img
                                      src={
                                        activeProject.featuredImage?.thumbnailUrl ||
                                        activeProject.featuredImage?.url
                                      }
                                      alt={activeProject.title}
                                    />
                                  ) : (
                                    <div className="thumbnail-placeholder">
                                      <CameraIcon size={24} />
                                    </div>
                                  )}
                                </div>
                                <div className="project-info">
                                  <span className="project-title">{activeProject.title}</span>
                                  {activeProject.year && (
                                    <span className="project-year">{activeProject.year}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </DragOverlay>
                      </DndContext>
                    )}
                  </div>

                  {/* Available Projects */}
                  {availableProjects.length > 0 && (
                    <div className="selection-section">
                      <div className="selection-header">
                        <span className="selection-title">
                          Available ({availableProjects.length})
                        </span>
                      </div>
                      <div className="available-grid">
                        {availableProjects.map((project) => (
                          <AvailableProjectCard
                            key={project.id}
                            project={project}
                            onAdd={() => handleAddProject(project.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Exclude Projects Section (only in "Show all" mode) */}
              {!isCustomMode && projects.length > 0 && (
                <div className="exclude-section">
                  <button
                    type="button"
                    className="exclude-toggle"
                    onClick={() => setExcludeSectionExpanded(!excludeSectionExpanded)}
                    aria-expanded={excludeSectionExpanded}
                  >
                    <ChevronIcon expanded={excludeSectionExpanded} />
                    <span className="exclude-toggle-label">
                      Exclude specific projects
                      {excludedIds.length > 0 && (
                        <span className="exclude-count">({excludedIds.length} excluded)</span>
                      )}
                    </span>
                  </button>
                  
                  {excludeSectionExpanded && (
                    <div className="exclude-content">
                      <div className="exclude-checklist">
                        {sortedProjectsForExclusion.map((project) => {
                          const isExcluded = excludedIds.includes(project.id)
                          return (
                            <label key={project.id} className="exclude-item">
                              <input
                                type="checkbox"
                                checked={isExcluded}
                                onChange={() => handleToggleExcludeProject(project.id)}
                                className="exclude-checkbox"
                              />
                              <span className={`exclude-project-name ${isExcluded ? 'excluded' : ''}`}>
                                {project.title}
                                {isExcluded && <span className="excluded-badge">(excluded)</span>}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                      <p className="exclude-summary">
                        Showing {visibleProjectCount} of {projects.length} projects
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* All Projects Preview */}
              {!isCustomMode && (
                <div className="all-projects-preview">
                  <div className="preview-grid">
                    {projects
                      .filter((p) => !excludedIds.includes(p.id))
                      .slice(0, 6)
                      .map((project) => (
                      <div key={project.id} className="preview-card">
                        <div className="preview-thumbnail">
                          {project.featuredImage?.thumbnailUrl ||
                          project.featuredImage?.url ? (
                            <img
                              src={
                                project.featuredImage?.thumbnailUrl ||
                                project.featuredImage?.url
                              }
                              alt={project.featuredImage?.altText || project.title}
                            />
                          ) : (
                            <div className="thumbnail-placeholder">
                              <CameraIcon size={20} />
                            </div>
                          )}
                        </div>
                        <span className="preview-title">{project.title}</span>
                      </div>
                    ))}
                  </div>
                  {visibleProjectCount > 6 && (
                    <p className="preview-more">+{visibleProjectCount - 6} more projects</p>
                  )}
                </div>
              )}
            </>
          )}
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

        /* Loading, Error, Empty States */
        .projects-loading,
        .projects-error,
        .projects-empty {
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

        .projects-error {
          background: rgba(239, 68, 68, 0.05);
          border-color: rgba(239, 68, 68, 0.2);
          color: var(--color-error, #dc2626);
        }

        .projects-loading p,
        .projects-error p,
        .projects-empty p {
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

        /* Mode Toggle */
        .mode-toggle {
          display: flex;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
        }

        .mode-btn {
          flex: 1;
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3);
          background: var(--color-bg, #ffffff);
          border: 2px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-md, 8px);
          cursor: pointer;
          transition: all 150ms ease;
          text-align: left;
        }

        .mode-btn:hover {
          border-color: var(--color-text-secondary, #9ca3af);
        }

        .mode-btn.active {
          border-color: var(--color-accent, #3b82f6);
          background: var(--color-accent-light, rgba(59, 130, 246, 0.05));
        }

        .mode-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border: 2px solid var(--color-border, #d1d5db);
          border-radius: 50%;
          flex-shrink: 0;
          color: white;
          transition: all 150ms ease;
        }

        .mode-btn.active .mode-indicator {
          background: var(--color-accent, #3b82f6);
          border-color: var(--color-accent, #3b82f6);
        }

        .mode-label {
          font-size: var(--text-sm, 0.875rem);
          font-weight: 500;
          color: var(--color-text, #111827);
        }

        .mode-count {
          font-weight: 400;
          color: var(--color-text-secondary, #6b7280);
          margin-left: 4px;
        }

        /* Custom Selection */
        .custom-selection {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .selection-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .selection-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .selection-title {
          font-size: var(--text-sm, 0.875rem);
          font-weight: 600;
          color: var(--color-text, #111827);
        }

        .select-all-btn {
          font-size: var(--text-xs, 0.75rem);
          font-weight: 500;
          color: var(--color-accent, #3b82f6);
          background: none;
          border: none;
          cursor: pointer;
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm, 4px);
          transition: background-color 150ms ease;
        }

        .select-all-btn:hover {
          background: var(--color-accent-light, rgba(59, 130, 246, 0.1));
        }

        .selection-empty {
          padding: var(--space-4);
          background: var(--color-bg-secondary, #f9fafb);
          border: 2px dashed var(--color-border, #e5e7eb);
          border-radius: var(--radius-md, 8px);
          text-align: center;
        }

        .selection-empty p {
          margin: 0;
          font-size: var(--text-sm, 0.875rem);
          color: var(--color-text-secondary, #6b7280);
        }

        .selected-grid,
        .available-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-2);
        }

        @media (min-width: 640px) {
          .selected-grid,
          .available-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* All Projects Preview */
        .all-projects-preview {
          padding: var(--space-3);
          background: var(--color-bg-secondary, #f9fafb);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-md, 8px);
        }

        .preview-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-2);
        }

        @media (min-width: 640px) {
          .preview-grid {
            grid-template-columns: repeat(6, 1fr);
          }
        }

        .preview-card {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          text-align: center;
        }

        .preview-thumbnail {
          aspect-ratio: 4 / 3;
          border-radius: var(--radius-sm, 4px);
          overflow: hidden;
          background: var(--color-border, #e5e7eb);
        }

        .preview-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-thumbnail .thumbnail-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary, #9ca3af);
        }

        .preview-title {
          font-size: var(--text-xs, 0.75rem);
          color: var(--color-text, #111827);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .preview-more {
          margin: var(--space-2) 0 0 0;
          font-size: var(--text-xs, 0.75rem);
          color: var(--color-text-secondary, #6b7280);
          text-align: center;
        }

        /* Exclude Section */
        .exclude-section {
          margin-bottom: var(--space-3);
        }

        .exclude-toggle {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          width: 100%;
          padding: var(--space-2) var(--space-3);
          background: var(--color-bg-secondary, #f9fafb);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-md, 8px);
          cursor: pointer;
          font-size: var(--text-sm, 0.875rem);
          color: var(--color-text, #111827);
          text-align: left;
          transition: background-color 150ms ease, border-color 150ms ease;
        }

        .exclude-toggle:hover {
          background: var(--color-bg, #ffffff);
          border-color: var(--color-text-secondary, #9ca3af);
        }

        .exclude-toggle-label {
          flex: 1;
          font-weight: 500;
        }

        .exclude-count {
          font-weight: 400;
          color: var(--color-text-secondary, #6b7280);
          margin-left: var(--space-1);
        }

        .exclude-content {
          margin-top: var(--space-2);
          padding: var(--space-3);
          background: var(--color-bg, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-md, 8px);
        }

        .exclude-checklist {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          max-height: 240px;
          overflow-y: auto;
        }

        .exclude-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2);
          border-radius: var(--radius-sm, 4px);
          cursor: pointer;
          transition: background-color 150ms ease;
        }

        .exclude-item:hover {
          background: var(--color-bg-secondary, #f9fafb);
        }

        .exclude-checkbox {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          accent-color: var(--color-accent, #3b82f6);
        }

        .exclude-project-name {
          font-size: var(--text-sm, 0.875rem);
          color: var(--color-text, #111827);
        }

        .exclude-project-name.excluded {
          color: var(--color-text-secondary, #6b7280);
        }

        .excluded-badge {
          font-size: var(--text-xs, 0.75rem);
          color: var(--color-text-secondary, #9ca3af);
          margin-left: var(--space-1);
          font-style: italic;
        }

        .exclude-summary {
          margin: var(--space-3) 0 0 0;
          padding-top: var(--space-2);
          border-top: 1px solid var(--color-border, #e5e7eb);
          font-size: var(--text-xs, 0.75rem);
          color: var(--color-text-secondary, #6b7280);
        }

        /* Drag Overlay */
        .drag-overlay-card {
          opacity: 0.95;
          box-shadow: 0 12px 32px hsla(0, 0%, 0%, 0.2),
            0 4px 12px hsla(0, 0%, 0%, 0.1);
          border-radius: var(--radius-md, 8px);
          transform: rotate(2deg) scale(1.02);
        }

        .drag-overlay-card .project-card-inner {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2);
          background: var(--color-bg, #ffffff);
          border: 2px solid var(--color-accent, #3b82f6);
          border-radius: var(--radius-md, 8px);
        }

        .drag-overlay-card .drag-handle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          color: var(--color-text-secondary, #6b7280);
          flex-shrink: 0;
        }

        .drag-overlay-card .project-thumbnail {
          width: 48px;
          height: 36px;
          border-radius: var(--radius-sm, 4px);
          overflow: hidden;
          flex-shrink: 0;
          background: var(--color-bg-secondary, #f3f4f6);
        }

        .drag-overlay-card .project-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .drag-overlay-card .thumbnail-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary, #9ca3af);
        }

        .drag-overlay-card .project-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .drag-overlay-card .project-title {
          font-size: var(--text-sm, 0.875rem);
          font-weight: 500;
          color: var(--color-text, #111827);
        }

        .drag-overlay-card .project-year {
          font-size: var(--text-xs, 0.75rem);
          color: var(--color-text-secondary, #6b7280);
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

          .mode-toggle {
            flex-direction: column;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .loading-spinner {
            animation: none;
          }

          .project-grid-column-option,
          .project-grid-layout-option,
          .mode-btn,
          .mode-indicator,
          .select-all-btn {
            transition: none;
          }

          .drag-overlay-card {
            transform: none;
          }
        }
      `}</style>
    </div>
  )
}
