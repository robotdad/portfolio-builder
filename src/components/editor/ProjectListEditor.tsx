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
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ProjectListSection } from '@/lib/content-schema'

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

interface ProjectListEditorProps {
  section: ProjectListSection
  onChange: (section: ProjectListSection) => void
  onDelete: () => void
  categoryId?: string
}

const MAX_PROJECTS = 4

// ============================================================================
// Icons
// ============================================================================

function CameraIcon({ size = 24 }: { size?: number }) {
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
      width="12"
      height="12"
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
      width="14"
      height="14"
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
      width="12"
      height="12"
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

function ChevronDownIcon() {
  return (
    <svg
      width="14"
      height="14"
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

function TrashIcon() {
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
    <div ref={setNodeRef} style={style} className="sortable-project-item">
      <div className="project-item-inner">
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

        {/* Thumbnail */}
        <div className="project-thumb">
          {imageUrl ? (
            <img src={imageUrl} alt={project.featuredImage?.altText || project.title} />
          ) : (
            <div className="thumb-placeholder">
              <CameraIcon size={16} />
            </div>
          )}
        </div>

        {/* Title */}
        <span className="project-title">{project.title}</span>

        {/* Remove Button */}
        <button
          type="button"
          className="remove-btn"
          onClick={onRemove}
          aria-label={`Remove ${project.title}`}
        >
          <CloseIcon />
        </button>
      </div>

      <style jsx>{`
        .sortable-project-item {
          touch-action: none;
        }

        .project-item-inner {
          display: flex;
          align-items: center;
          gap: var(--space-2, 8px);
          padding: var(--space-1, 4px) var(--space-2, 8px);
          background: var(--color-bg, #ffffff);
          border: 1px solid var(--color-accent, #3b82f6);
          border-radius: var(--radius-sm, 4px);
          background: var(--color-accent-light, rgba(59, 130, 246, 0.05));
        }

        .drag-handle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border: none;
          background: transparent;
          color: var(--color-text-secondary, #6b7280);
          cursor: grab;
          border-radius: var(--radius-sm, 4px);
          flex-shrink: 0;
          transition: color 150ms ease;
        }

        .drag-handle:hover {
          color: var(--color-text, #111827);
        }

        .drag-handle:active {
          cursor: grabbing;
        }

        .project-thumb {
          width: 32px;
          height: 24px;
          border-radius: 2px;
          overflow: hidden;
          flex-shrink: 0;
          background: var(--color-bg-secondary, #f3f4f6);
        }

        .project-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumb-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary, #9ca3af);
        }

        .project-title {
          flex: 1;
          min-width: 0;
          font-size: var(--text-xs, 0.75rem);
          font-weight: 500;
          color: var(--color-text, #111827);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .remove-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
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
// ProjectListEditor Component
// ============================================================================

export function ProjectListEditor({
  section,
  onChange,
  onDelete,
  categoryId,
}: ProjectListEditorProps) {
  // State
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Derived state
  const selectedIds = useMemo(() => section.projectIds || [], [section.projectIds])
  const selectedProjects = selectedIds
    .map((id) => projects.find((p) => p.id === id))
    .filter((p): p is Project => p !== undefined)
  const availableProjects = projects.filter((p) => !selectedIds.includes(p.id))
  const canAddMore = selectedIds.length < MAX_PROJECTS

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
    if (!isDropdownOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.add-project-wrapper')) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isDropdownOpen])

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
  const handleAddProject = useCallback(
    (projectId: string) => {
      if (selectedIds.length >= MAX_PROJECTS) return
      const newIds = [...selectedIds, projectId]
      onChange({ ...section, projectIds: newIds })
      setIsDropdownOpen(false)
    },
    [section, onChange, selectedIds]
  )

  const handleRemoveProject = useCallback(
    (projectId: string) => {
      const newIds = selectedIds.filter((id) => id !== projectId)
      onChange({ ...section, projectIds: newIds })
    },
    [section, onChange, selectedIds]
  )

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

  const handleLayoutChange = (layout: 'vertical' | 'mini-grid') => {
    onChange({ ...section, layout })
  }

  const handleShowMetadataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...section, showMetadata: e.target.checked })
  }

  // Find active project for drag overlay
  const activeProject = activeId ? projects.find((p) => p.id === activeId) : null

  return (
    <div className="section-editor section-editor-project-list">
      <div className="section-editor-header">
        <span className="section-type-label">Project List</span>
        <button
          type="button"
          onClick={onDelete}
          className="section-delete-btn"
          aria-label="Delete section"
        >
          <TrashIcon />
        </button>
      </div>

      <div className="section-editor-content">
        {/* Selected Projects */}
        <div className="form-group">
          <label className="form-label">
            Selected Projects ({selectedProjects.length}/{MAX_PROJECTS})
          </label>

          {isLoading ? (
            <div className="projects-loading">
              <div className="loading-spinner" />
              <span>Loading...</span>
            </div>
          ) : error ? (
            <div className="projects-error">
              <p>{error}</p>
            </div>
          ) : selectedProjects.length === 0 ? (
            <div className="projects-empty">
              <p>No projects selected</p>
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
                strategy={verticalListSortingStrategy}
              >
                <div className="selected-projects">
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
                  <div className="drag-overlay-item">
                    <div className="project-item-inner">
                      <div className="drag-handle">
                        <DragHandleIcon />
                      </div>
                      <div className="project-thumb">
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
                          <div className="thumb-placeholder">
                            <CameraIcon size={16} />
                          </div>
                        )}
                      </div>
                      <span className="project-title">{activeProject.title}</span>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>

        {/* Add Project Dropdown */}
        {!isLoading && !error && (
          <div className="add-project-wrapper">
            <button
              type="button"
              className="add-project-btn"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={!canAddMore || availableProjects.length === 0}
              aria-expanded={isDropdownOpen}
              aria-haspopup="listbox"
            >
              <PlusIcon />
              <span>Add Project</span>
              <ChevronDownIcon />
            </button>

            {isDropdownOpen && availableProjects.length > 0 && (
              <div className="project-dropdown" role="listbox">
                {availableProjects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    className="dropdown-item"
                    onClick={() => handleAddProject(project.id)}
                    role="option"
                    aria-selected={false}
                  >
                    <div className="dropdown-thumb">
                      {project.featuredImage?.thumbnailUrl ||
                      project.featuredImage?.url ? (
                        <img
                          src={
                            project.featuredImage?.thumbnailUrl ||
                            project.featuredImage?.url
                          }
                          alt=""
                        />
                      ) : (
                        <div className="thumb-placeholder">
                          <CameraIcon size={14} />
                        </div>
                      )}
                    </div>
                    <span className="dropdown-title">{project.title}</span>
                    {project.year && (
                      <span className="dropdown-year">{project.year}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Layout Toggle */}
        <div className="form-group">
          <label className="form-label">Layout</label>
          <div className="layout-options">
            <label className={`layout-option ${section.layout === 'vertical' ? 'active' : ''}`}>
              <input
                type="radio"
                name={`layout-${section.id}`}
                value="vertical"
                checked={section.layout === 'vertical'}
                onChange={() => handleLayoutChange('vertical')}
                className="sr-only"
              />
              <div className="layout-preview layout-preview-vertical">
                <div className="preview-bar" />
                <div className="preview-bar" />
              </div>
              <span className="layout-name">Vertical</span>
            </label>
            <label className={`layout-option ${section.layout === 'mini-grid' ? 'active' : ''}`}>
              <input
                type="radio"
                name={`layout-${section.id}`}
                value="mini-grid"
                checked={section.layout === 'mini-grid'}
                onChange={() => handleLayoutChange('mini-grid')}
                className="sr-only"
              />
              <div className="layout-preview layout-preview-grid">
                <div className="preview-cell" />
                <div className="preview-cell" />
                <div className="preview-cell" />
                <div className="preview-cell" />
              </div>
              <span className="layout-name">Mini Grid</span>
            </label>
          </div>
        </div>

        {/* Show Metadata Toggle */}
        <div className="form-group">
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

      <style jsx>{`
        .section-editor-project-list {
          background: var(--color-bg, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-md, 8px);
          overflow: hidden;
        }

        .section-editor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-2, 8px) var(--space-3, 12px);
          background: var(--color-bg-secondary, #f9fafb);
          border-bottom: 1px solid var(--color-border, #e5e7eb);
        }

        .section-type-label {
          font-size: var(--text-xs, 0.75rem);
          font-weight: 600;
          color: var(--color-text-secondary, #6b7280);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .section-delete-btn {
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
          transition: color 150ms ease, background-color 150ms ease;
        }

        .section-delete-btn:hover {
          color: var(--color-error, #ef4444);
          background: rgba(239, 68, 68, 0.1);
        }

        .section-editor-content {
          padding: var(--space-3, 12px);
          display: flex;
          flex-direction: column;
          gap: var(--space-3, 12px);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-1, 4px);
        }

        .form-label {
          font-size: var(--text-xs, 0.75rem);
          font-weight: 500;
          color: var(--color-text-secondary, #6b7280);
        }

        /* Loading, Error, Empty States */
        .projects-loading,
        .projects-error,
        .projects-empty {
          display: flex;
          align-items: center;
          gap: var(--space-2, 8px);
          padding: var(--space-2, 8px);
          background: var(--color-bg-secondary, #f9fafb);
          border: 1px dashed var(--color-border, #e5e7eb);
          border-radius: var(--radius-sm, 4px);
          color: var(--color-text-secondary, #6b7280);
          font-size: var(--text-xs, 0.75rem);
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
          width: 14px;
          height: 14px;
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

        /* Selected Projects */
        .selected-projects {
          display: flex;
          flex-direction: column;
          gap: var(--space-1, 4px);
        }

        /* Add Project Dropdown */
        .add-project-wrapper {
          position: relative;
        }

        .add-project-btn {
          display: flex;
          align-items: center;
          gap: var(--space-1, 4px);
          width: 100%;
          padding: var(--space-1, 4px) var(--space-2, 8px);
          background: var(--color-bg, #ffffff);
          border: 1px dashed var(--color-border, #d1d5db);
          border-radius: var(--radius-sm, 4px);
          color: var(--color-text-secondary, #6b7280);
          font-size: var(--text-xs, 0.75rem);
          font-weight: 500;
          cursor: pointer;
          transition: all 150ms ease;
        }

        .add-project-btn:hover:not(:disabled) {
          border-color: var(--color-accent, #3b82f6);
          color: var(--color-accent, #3b82f6);
        }

        .add-project-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .add-project-btn span {
          flex: 1;
          text-align: left;
        }

        .project-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 4px;
          background: var(--color-bg, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-sm, 4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 50;
          max-height: 200px;
          overflow-y: auto;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: var(--space-2, 8px);
          width: 100%;
          padding: var(--space-2, 8px);
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background-color 150ms ease;
        }

        .dropdown-item:hover {
          background: var(--color-bg-secondary, #f3f4f6);
        }

        .dropdown-thumb {
          width: 28px;
          height: 20px;
          border-radius: 2px;
          overflow: hidden;
          flex-shrink: 0;
          background: var(--color-bg-secondary, #f3f4f6);
        }

        .dropdown-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .dropdown-title {
          flex: 1;
          min-width: 0;
          font-size: var(--text-xs, 0.75rem);
          font-weight: 500;
          color: var(--color-text, #111827);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-year {
          font-size: var(--text-xs, 0.75rem);
          color: var(--color-text-secondary, #6b7280);
          flex-shrink: 0;
        }

        /* Layout Toggle */
        .layout-options {
          display: flex;
          gap: var(--space-2, 8px);
        }

        .layout-option {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-1, 4px);
          padding: var(--space-2, 8px);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-sm, 4px);
          cursor: pointer;
          transition: all 150ms ease;
        }

        .layout-option:hover {
          border-color: var(--color-text-secondary, #9ca3af);
        }

        .layout-option.active {
          border-color: var(--color-accent, #3b82f6);
          background: var(--color-accent-light, rgba(59, 130, 246, 0.05));
        }

        .layout-preview {
          width: 100%;
          height: 24px;
        }

        .layout-preview-vertical {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .preview-bar {
          flex: 1;
          background: var(--color-border, #d1d5db);
          border-radius: 2px;
          transition: background-color 150ms ease;
        }

        .layout-option.active .preview-bar {
          background: var(--color-accent, #3b82f6);
        }

        .layout-preview-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 3px;
        }

        .preview-cell {
          background: var(--color-border, #d1d5db);
          border-radius: 2px;
          transition: background-color 150ms ease;
        }

        .layout-option.active .preview-cell {
          background: var(--color-accent, #3b82f6);
        }

        .layout-name {
          font-size: var(--text-xs, 0.75rem);
          font-weight: 500;
          color: var(--color-text, #111827);
        }

        /* Checkbox */
        .form-checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--space-2, 8px);
          font-size: var(--text-xs, 0.75rem);
          color: var(--color-text, #111827);
          cursor: pointer;
        }

        .form-checkbox {
          width: 14px;
          height: 14px;
          accent-color: var(--color-accent, #3b82f6);
        }

        /* Drag Overlay */
        .drag-overlay-item {
          opacity: 0.95;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          border-radius: var(--radius-sm, 4px);
          transform: rotate(2deg) scale(1.02);
        }

        .drag-overlay-item .project-item-inner {
          display: flex;
          align-items: center;
          gap: var(--space-2, 8px);
          padding: var(--space-1, 4px) var(--space-2, 8px);
          background: var(--color-bg, #ffffff);
          border: 1px solid var(--color-accent, #3b82f6);
          border-radius: var(--radius-sm, 4px);
        }

        .drag-overlay-item .drag-handle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          color: var(--color-text-secondary, #6b7280);
          flex-shrink: 0;
        }

        .drag-overlay-item .project-thumb {
          width: 32px;
          height: 24px;
          border-radius: 2px;
          overflow: hidden;
          flex-shrink: 0;
          background: var(--color-bg-secondary, #f3f4f6);
        }

        .drag-overlay-item .project-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .drag-overlay-item .thumb-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary, #9ca3af);
        }

        .drag-overlay-item .project-title {
          flex: 1;
          min-width: 0;
          font-size: var(--text-xs, 0.75rem);
          font-weight: 500;
          color: var(--color-text, #111827);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Screen reader only */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .loading-spinner {
            animation: none;
          }

          .section-delete-btn,
          .add-project-btn,
          .dropdown-item,
          .layout-option,
          .preview-bar,
          .preview-cell {
            transition: none;
          }

          .drag-overlay-item {
            transform: none;
          }
        }
      `}</style>
    </div>
  )
}
