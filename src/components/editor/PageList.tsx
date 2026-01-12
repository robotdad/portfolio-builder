'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { VALIDATION_ERRORS } from '@/lib/messages'

export interface PageData {
  id: string
  title: string
  slug: string
  navOrder: number
  isHomepage: boolean
  showInNav: boolean
  content: string | null
}

interface PageListProps {
  pages: PageData[]
  currentPageId: string | null
  portfolioId: string
  onSelectPage: (pageId: string) => void
  onPagesChange: (pages: PageData[]) => void
  onCreatePage: () => void
}

export function PageList({
  pages,
  currentPageId,
  portfolioId,
  onSelectPage,
  onPagesChange,
  onCreatePage,
}: PageListProps) {
  const [isReordering, setIsReordering] = useState(false)

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = pages.findIndex((p) => p.id === active.id)
      const newIndex = pages.findIndex((p) => p.id === over.id)
      
      const newPages = arrayMove(pages, oldIndex, newIndex)
      onPagesChange(newPages)

      // Save reorder to server
      setIsReordering(true)
      try {
        const response = await fetch('/api/pages/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            portfolioId,
            pageIds: newPages.map((p) => p.id),
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to save reorder')
        }
      } catch (error) {
        console.error('Failed to reorder pages:', error)
        // Revert to original order on failure
        onPagesChange(pages)
      } finally {
        setIsReordering(false)
      }
    }
  }

  return (
    <div className="page-list-container">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={pages.map((p) => p.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="page-tabs" role="tablist" aria-label="Pages">
            {pages.map((page) => (
              <SortablePageTab
                key={page.id}
                page={page}
                isActive={page.id === currentPageId}
                onSelect={() => onSelectPage(page.id)}
                disabled={isReordering}
              />
            ))}
            <button
              type="button"
              className="page-tab page-tab-add"
              onClick={onCreatePage}
              aria-label="Add new page"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Page</span>
            </button>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

interface SortablePageTabProps {
  page: PageData
  isActive: boolean
  onSelect: () => void
  disabled: boolean
}

function SortablePageTab({ page, isActive, onSelect, disabled }: SortablePageTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      type="button"
      className={`page-tab ${isActive ? 'page-tab-active' : ''}`}
      onClick={onSelect}
      disabled={disabled}
      role="tab"
      aria-selected={isActive}
      aria-label={`${page.title}${page.isHomepage ? ' (Homepage)' : ''}`}
    >
      {page.isHomepage && (
        <svg className="page-tab-home-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )}
      <span className="page-tab-title">{page.title}</span>
    </button>
  )
}

// Modal for creating/editing page settings
interface PageSettingsModalProps {
  page?: PageData | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: { title: string; slug: string; isHomepage: boolean; showInNav: boolean }) => void
  existingSlugs: string[]
}

export function PageSettingsModal({
  page,
  isOpen,
  onClose,
  onSave,
  existingSlugs,
}: PageSettingsModalProps) {
  // Use lazy initialization - state initializes from page prop
  // Parent should pass key={page?.id || 'new'} to reset state when page changes
  const [title, setTitle] = useState(() => page?.title || '')
  const [slug, setSlug] = useState(() => page?.slug || '')
  const [isHomepage, setIsHomepage] = useState(() => page?.isHomepage || false)
  const [showInNav, setShowInNav] = useState(() => page?.showInNav !== false)
  const [error, setError] = useState<string | null>(null)

  // Auto-generate slug from title (only for new pages)
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    if (!page) {
      // Only auto-generate for new pages
      const newSlug = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      setSlug(newSlug)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    // Check slug uniqueness (exclude current page)
    const slugsToCheck = page 
      ? existingSlugs.filter((s) => s !== page.slug)
      : existingSlugs
    
    if (slugsToCheck.includes(slug)) {
      setError('A page with this URL already exists')
      return
    }

    // Validate slug format
    if (slug && !/^[a-z0-9-]*$/.test(slug)) {
      setError(VALIDATION_ERRORS.SLUG_FORMAT.message)
      return
    }

    onSave({ title: title.trim(), slug, isHomepage, showInNav })
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content page-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{page ? 'Page Settings' : 'Create New Page'}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="page-title" className="form-label">Page Title</label>
            <input
              id="page-title"
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g., Theatre, About, Contact"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="page-slug" className="form-label">URL Path</label>
            <div className="slug-input-wrapper">
              <span className="slug-prefix">/your-portfolio/</span>
              <input
                id="page-slug"
                type="text"
                className="form-input slug-input"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="page-url"
              />
            </div>
            <p className="form-hint">Leave empty for homepage</p>
          </div>

          <div className="form-group">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={isHomepage}
                onChange={(e) => setIsHomepage(e.target.checked)}
              />
              <span>Set as homepage</span>
            </label>
            <p className="form-hint">
              The homepage is displayed when visitors access your portfolio root URL.
            </p>
          </div>

          <div className="form-group">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={showInNav}
                onChange={(e) => setShowInNav(e.target.checked)}
              />
              <span>Show in navigation</span>
            </label>
          </div>

          <div className="routing-info">
            <svg className="info-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p>
              {isHomepage ? (
                <>This page will be your homepage, accessible at <code>/your-portfolio/</code></>
              ) : (
                <>This page will publish to <code>/your-portfolio/{slug || 'page-slug'}</code></>
              )}
            </p>
          </div>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {page ? 'Save Changes' : 'Create Page'}
            </button>
          </div>
        </form>

        <style jsx>{`
          .routing-info {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            padding: 12px;
            background: hsl(210, 100%, 97%);
            border: 1px solid hsl(210, 100%, 85%);
            border-radius: 6px;
            margin-top: 16px;
          }

          .routing-info :global(.info-icon) {
            flex-shrink: 0;
            margin-top: 2px;
            color: hsl(210, 100%, 45%);
          }

          .routing-info p {
            margin: 0;
            font-size: 14px;
            color: var(--admin-text, #374151);
            line-height: 1.5;
          }

          .routing-info code {
            padding: 2px 6px;
            background: hsl(210, 20%, 95%);
            border-radius: 3px;
            font-family: ui-monospace, monospace;
            font-size: 13px;
          }
        `}</style>
      </div>
    </div>
  )
}

// Delete confirmation modal
interface DeletePageModalProps {
  page: PageData | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeletePageModal({ page, isOpen, onClose, onConfirm }: DeletePageModalProps) {
  if (!isOpen || !page) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Delete Page</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="delete-modal-message">
          Are you sure you want to delete <strong>{page.title}</strong>? This action cannot be undone.
        </p>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            Delete Page
          </button>
        </div>
      </div>
    </div>
  )
}
