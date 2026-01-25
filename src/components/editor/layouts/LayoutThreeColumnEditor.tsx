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
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import { ColumnDropZone } from './ColumnDropZone'
import { LayoutSettingsBar } from './LayoutSettingsBar'
import type {
  LayoutThreeColumnSection,
  ContentSection,
  Section,
} from '@/lib/content-schema'

interface LayoutThreeColumnEditorProps {
  section: LayoutThreeColumnSection
  onChange: (section: LayoutThreeColumnSection) => void
  onDelete: () => void
  onUnwrap?: (sections: ContentSection[]) => void
  portfolioId: string
  categoryId?: string
  projectId?: string
  onSaveRequest?: () => void
}

export function LayoutThreeColumnEditor({
  section,
  onChange,
  onDelete,
  onUnwrap,
  portfolioId,
  categoryId,
  projectId,
  onSaveRequest,
}: LayoutThreeColumnEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Find which column contains a section
  const findColumn = (sectionId: string): 0 | 1 | 2 | null => {
    if (section.columns[0].some((s) => s.id === sectionId)) return 0
    if (section.columns[1].some((s) => s.id === sectionId)) return 1
    if (section.columns[2].some((s) => s.id === sectionId)) return 2
    return null
  }

  // Get column index from column ID
  const getColumnIndexFromId = (columnId: string): 0 | 1 | 2 | null => {
    if (columnId === `${section.id}-col-1`) return 0
    if (columnId === `${section.id}-col-2`) return 1
    if (columnId === `${section.id}-col-3`) return 2
    return null
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeColumnIndex = findColumn(active.id as string)
    if (activeColumnIndex === null) return

    // Determine target column
    let overColumnIndex: 0 | 1 | 2 | null = null
    const overData = over.data.current as { columnId?: string } | undefined

    if (overData?.columnId) {
      overColumnIndex = getColumnIndexFromId(overData.columnId)
    }

    // Check if over.id is a column ID
    if (overColumnIndex === null) {
      overColumnIndex = getColumnIndexFromId(over.id as string)
    }

    // Check if over.id is a section - find its column
    if (overColumnIndex === null) {
      overColumnIndex = findColumn(over.id as string)
    }

    if (overColumnIndex === null) return

    const activeSection = section.columns[activeColumnIndex].find(
      (s) => s.id === active.id
    )

    if (!activeSection) return

    if (activeColumnIndex === overColumnIndex) {
      // Same column - reorder
      const sourceColumn = section.columns[activeColumnIndex]
      const oldIndex = sourceColumn.findIndex((s) => s.id === active.id)
      const newIndex = sourceColumn.findIndex((s) => s.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newColumn = arrayMove(sourceColumn, oldIndex, newIndex)
        const newColumns = [...section.columns] as [
          ContentSection[],
          ContentSection[],
          ContentSection[],
        ]
        newColumns[activeColumnIndex] = newColumn
        onChange({ ...section, columns: newColumns })
      }
    } else {
      // Cross-column move
      const newColumns = [...section.columns] as [
        ContentSection[],
        ContentSection[],
        ContentSection[],
      ]
      const sourceColumn = [...newColumns[activeColumnIndex]]
      const targetColumn = [...newColumns[overColumnIndex]]

      // Remove from source
      const sourceIndex = sourceColumn.findIndex((s) => s.id === active.id)
      sourceColumn.splice(sourceIndex, 1)

      // Add to target
      const overIndex = targetColumn.findIndex((s) => s.id === over.id)
      if (overIndex !== -1) {
        targetColumn.splice(overIndex, 0, activeSection)
      } else {
        targetColumn.push(activeSection)
      }

      newColumns[activeColumnIndex] = sourceColumn
      newColumns[overColumnIndex] = targetColumn

      onChange({ ...section, columns: newColumns })
    }
  }

  // Handlers for column content changes
  const createSectionChangeHandler =
    (columnIndex: 0 | 1 | 2) => (index: number, updated: ContentSection) => {
      const newColumns = [...section.columns] as [
        ContentSection[],
        ContentSection[],
        ContentSection[],
      ]
      const newColumn = [...newColumns[columnIndex]]
      newColumn[index] = updated
      newColumns[columnIndex] = newColumn
      onChange({ ...section, columns: newColumns })
    }

  const createSectionDeleteHandler =
    (columnIndex: 0 | 1 | 2) => (index: number) => {
      const newColumns = [...section.columns] as [
        ContentSection[],
        ContentSection[],
        ContentSection[],
      ]
      newColumns[columnIndex] = newColumns[columnIndex].filter(
        (_, i) => i !== index
      )
      onChange({ ...section, columns: newColumns })
    }

  const createSectionAddHandler =
    (columnIndex: 0 | 1 | 2) => (newSection: Section, index: number) => {
      if (newSection.type.startsWith('layout-')) return
      const newColumns = [...section.columns] as [
        ContentSection[],
        ContentSection[],
        ContentSection[],
      ]
      const newColumn = [...newColumns[columnIndex]]
      newColumn.splice(index, 0, newSection as ContentSection)
      newColumns[columnIndex] = newColumn
      onChange({ ...section, columns: newColumns })
    }

  // Find active section for drag overlay
  const activeSection = activeId
    ? section.columns[0].find((s) => s.id === activeId) ||
      section.columns[1].find((s) => s.id === activeId) ||
      section.columns[2].find((s) => s.id === activeId)
    : null

  // Handle gap change
  const handleGapChange = (gap: 'narrow' | 'default' | 'wide') => {
    onChange({ ...section, gap })
  }

  // Handle mobile stack order change
  const handleMobileStackOrderChange = (order: string) => {
    onChange({
      ...section,
      mobileStackOrder: order as 'left-first' | 'right-first',
    })
  }

  // Handle unwrap: flatten all three columns
  const handleUnwrap = () => {
    if (onUnwrap) {
      onUnwrap([
        ...section.columns[0],
        ...section.columns[1],
        ...section.columns[2],
      ])
    }
  }

  return (
    <div className="layout-editor layout-three-column-editor">
      {/* Layout Header */}
      <div className="layout-editor-header">
        <div className="layout-editor-title">
          <span className="layout-icon">|||</span>
          <span>Three Columns</span>
        </div>
        <div className="layout-header-actions">
          {onUnwrap && (
            <button
              type="button"
              className="layout-unwrap-button"
              onClick={handleUnwrap}
              aria-label="Unwrap layout"
              title="Remove layout, keep content"
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
                <path d="M12 3v18M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4" />
              </svg>
            </button>
          )}
          <button
            type="button"
            className="layout-delete-button"
            onClick={onDelete}
            aria-label="Delete three-column layout"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Three Column Editors with cross-column drag */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="layout-columns-container" data-gap={section.gap}>
          <ColumnDropZone
            columnId={`${section.id}-col-1`}
            columnLabel="Column 1"
            sections={section.columns[0]}
            portfolioId={portfolioId}
            categoryId={categoryId}
            projectId={projectId}
            onSectionChange={createSectionChangeHandler(0)}
            onSectionDelete={createSectionDeleteHandler(0)}
            onSectionAdd={createSectionAddHandler(0)}
            onSaveRequest={onSaveRequest}
          />
          <ColumnDropZone
            columnId={`${section.id}-col-2`}
            columnLabel="Column 2"
            sections={section.columns[1]}
            portfolioId={portfolioId}
            categoryId={categoryId}
            projectId={projectId}
            onSectionChange={createSectionChangeHandler(1)}
            onSectionDelete={createSectionDeleteHandler(1)}
            onSectionAdd={createSectionAddHandler(1)}
            onSaveRequest={onSaveRequest}
          />
          <ColumnDropZone
            columnId={`${section.id}-col-3`}
            columnLabel="Column 3"
            sections={section.columns[2]}
            portfolioId={portfolioId}
            categoryId={categoryId}
            projectId={projectId}
            onSectionChange={createSectionChangeHandler(2)}
            onSectionDelete={createSectionDeleteHandler(2)}
            onSectionAdd={createSectionAddHandler(2)}
            onSaveRequest={onSaveRequest}
          />
        </div>

        <DragOverlay>
          {activeSection ? (
            <div className="section-drag-overlay">
              <div className="section-drag-preview">
                <span className="section-type-badge">{activeSection.type}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Settings Bar */}
      <LayoutSettingsBar
        layoutType="three-column"
        gap={section.gap}
        onGapChange={handleGapChange}
        mobileStackOrder={section.mobileStackOrder}
        onMobileStackOrderChange={handleMobileStackOrderChange}
      />

      <style jsx>{`
        .layout-editor {
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          background: var(--color-surface);
        }

        .layout-editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-4);
          padding-bottom: var(--space-3);
          border-bottom: 1px solid var(--color-border);
        }

        .layout-editor-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-secondary);
        }

        .layout-icon {
          font-size: var(--font-size-lg);
        }

        .layout-delete-button {
          padding: var(--space-1) var(--space-3);
          font-size: var(--font-size-sm);
          color: var(--color-error);
          background: transparent;
          border: 1px solid var(--color-error);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .layout-delete-button:hover {
          background: var(--color-error);
          color: white;
        }

        .layout-columns-container {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: var(--space-4);
          margin-bottom: var(--space-4);
        }

        .layout-columns-container[data-gap='narrow'] {
          gap: var(--space-2);
        }

        .layout-columns-container[data-gap='default'] {
          gap: var(--space-4);
        }

        .layout-columns-container[data-gap='wide'] {
          gap: var(--space-6);
        }

        @media (max-width: 1024px) {
          .layout-columns-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
