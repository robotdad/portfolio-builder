'use client'

import { useCallback } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import styles from './PageListItem.module.css'
import type { Page } from '@/hooks/usePages'

// ============================================================================
// Types
// ============================================================================

interface PageListItemProps {
  page: Page
  onNavigate: (pageId: string) => void
  onEdit: (page: Page) => void
  onRename: (page: Page) => void
  onDelete: (page: Page) => void
}

// ============================================================================
// Icons
// ============================================================================

function DragHandleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="6" cy="4" r="1" fill="currentColor" />
      <circle cx="10" cy="4" r="1" fill="currentColor" />
      <circle cx="6" cy="8" r="1" fill="currentColor" />
      <circle cx="10" cy="8" r="1" fill="currentColor" />
      <circle cx="6" cy="12" r="1" fill="currentColor" />
      <circle cx="10" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

// ============================================================================
// PageListItem Component
// ============================================================================

export function PageListItem({
  page,
  onNavigate,
  onEdit,
  onRename,
  onDelete,
}: PageListItemProps) {
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
  }

  const handleNavigate = useCallback(() => {
    onNavigate(page.id)
  }, [page.id, onNavigate])

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(page)
  }, [page, onEdit])

  const handleRename = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onRename(page)
  }, [page, onRename])

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (page.isHomepage) return
    onDelete(page)
  }, [page, onDelete])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleNavigate()
    }
  }, [handleNavigate])

  // Determine status
  const hasPublished = page.publishedContent !== null
  const hasDraft = page.draftContent !== null
  const hasUnpublishedChanges = hasPublished && hasDraft && page.publishedContent !== page.draftContent

  // Format slug for display
  const displaySlug = page.slug ? `/${page.slug}` : '/'

  // Format last published date
  const timeAgo = page.lastPublishedAt ? getTimeAgo(new Date(page.lastPublishedAt)) : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? styles.pageListItemDragging : styles.pageListItem}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Edit ${page.title}`}
      data-testid={`page-item-${page.id}`}
    >
      {/* Drag Handle */}
      <div 
        className={styles.dragHandle} 
        {...listeners} 
        {...attributes}
        onClick={(e) => e.stopPropagation()}
        data-testid="page-item-drag-handle"
      >
        <DragHandleIcon />
      </div>

      {/* Info */}
      <div className={styles.info}>
        <div className={styles.nameRow}>
          <h3 className={styles.title}>{page.title}</h3>
          <button
            className={styles.renameBtn}
            onClick={handleRename}
            aria-label={`Rename ${page.title}`}
            type="button"
            data-testid="page-item-rename-btn"
          >
            <PencilIcon />
          </button>
        </div>
        <span className={styles.slug}>{displaySlug}</span>
        <div className={styles.badges}>
          {/* Status Badge */}
          {hasPublished ? (
            <span className={styles.badgePublished}>
              <CheckIcon />
              Published{timeAgo ? ` • ${timeAgo}` : ''}
            </span>
          ) : (
            <span className={styles.badgeDraft}>
              <PencilIcon />
              Draft • Never published
            </span>
          )}
          
          {/* Unpublished Changes Indicator */}
          {hasUnpublishedChanges && (
            <span className={styles.badgeDraft}>
              <PencilIcon />
              Unpublished changes
            </span>
          )}

          {/* Special Badges */}
          {page.isHomepage && (
            <span className={styles.badgeHomepage}>
              🏠 Homepage
            </span>
          )}
          {page.showInNav && (
            <span className={styles.badgeInNav}>
              🧭 In Nav
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={`${styles.action} icon-btn`}
          onClick={handleEdit}
          aria-label={`Edit ${page.title}`}
          type="button"
          data-testid="page-item-edit-btn"
        >
          <EditIcon />
          <span className={styles.actionText}>Edit</span>
        </button>

        <button
          className={`${page.isHomepage ? styles.actionDisabled : styles.actionDanger} icon-btn ${page.isHomepage ? '' : 'destructive'}`}
          onClick={handleDelete}
          aria-label={
            page.isHomepage
              ? `Cannot delete ${page.title} — this is the homepage`
              : `Delete ${page.title}`
          }
          title={page.isHomepage ? 'Homepage cannot be deleted' : undefined}
          disabled={page.isHomepage}
          aria-disabled={page.isHomepage}
          type="button"
          data-testid="page-item-delete-btn"
        >
          <TrashIcon />
          <span className={styles.actionText}>Delete</span>
        </button>
      </div>

      {/* Navigation Indicator */}
      <div className={styles.chevron} aria-hidden="true">
        <ChevronRightIcon />
      </div>
    </div>
  )
}

// ============================================================================
// Helper Functions
// ============================================================================

function getTimeAgo(date: Date): string {
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`
  return `${Math.floor(seconds / 2592000)}mo ago`
}

export type { PageListItemProps }
