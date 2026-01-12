'use client'

import { useCallback } from 'react'
import Image from 'next/image'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import styles from './CategoryListItem.module.css'

// ============================================================================
// Types
// ============================================================================

interface FeaturedImage {
  id: string
  url: string
  thumbnailUrl: string
  altText: string
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  order: number
  featuredImage: FeaturedImage | null
  _count: {
    projects: number
  }
}

interface CategoryListItemProps {
  category: Category
  onNavigate: (categoryId: string) => void
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
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

function FolderIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
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

// ============================================================================
// CategoryListItem Component
// ============================================================================

export function CategoryListItem({
  category,
  onNavigate,
  onEdit,
  onDelete,
}: CategoryListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleNavigate = useCallback(() => {
    onNavigate(category.id)
  }, [category.id, onNavigate])

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(category)
  }, [category, onEdit])

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(category)
  }, [category, onDelete])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleNavigate()
    }
  }, [handleNavigate])

  const projectCountText = category._count.projects === 1
    ? '1 project'
    : `${category._count.projects} projects`

  const imageUrl = category.featuredImage?.thumbnailUrl || category.featuredImage?.url

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? styles.categoryListItemDragging : styles.categoryListItem}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View ${category.name} projects`}
      data-testid={`category-item-${category.id}`}
    >
      {/* Drag Handle */}
      <div 
        className={styles.dragHandle} 
        {...listeners} 
        {...attributes}
        onClick={(e) => e.stopPropagation()}
        data-testid="category-item-drag-handle"
      >
        <DragHandleIcon />
      </div>

      {/* Thumbnail */}
      <div className={styles.thumbnail}>
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt="" 
            fill
            unoptimized
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className={styles.placeholder}>
            <FolderIcon />
          </div>
        )}
      </div>

      {/* Info */}
      <div className={styles.info}>
        <h3 className={styles.name}>{category.name}</h3>
        <span className={styles.count}>{projectCountText}</span>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={`${styles.action} icon-btn`}
          onClick={handleEdit}
          aria-label={`Edit ${category.name}`}
          type="button"
          data-testid="category-item-edit-btn"
        >
          <EditIcon />
          <span className={styles.actionText}>Edit</span>
        </button>

        <button
          className={`${styles.actionDanger} icon-btn destructive`}
          onClick={handleDelete}
          aria-label={`Delete ${category.name}`}
          type="button"
          data-testid="category-item-delete-btn"
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

export type { CategoryListItemProps, Category, FeaturedImage }
