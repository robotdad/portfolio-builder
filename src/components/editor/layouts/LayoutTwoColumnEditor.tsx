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
  LayoutTwoColumnSection,
  ContentSection,
  Section,
} from '@/lib/content-schema'

interface LayoutTwoColumnEditorProps {
  section: LayoutTwoColumnSection
  onChange: (section: LayoutTwoColumnSection) => void
  onDelete: () => void
  onUnwrap?: (sections: ContentSection[]) => void
  portfolioId: string
  categoryId?: string
  projectId?: string
  onSaveRequest?: () => void
}

export function LayoutTwoColumnEditor({
  section,
  onChange,
  onDelete,
  onUnwrap,
  portfolioId,
  categoryId: _categoryId,
  projectId,
  onSaveRequest,
}: LayoutTwoColumnEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Find which column contains a section
  const findColumn = (sectionId: string): 'left' | 'right' | null => {
    if (section.leftColumn.some((s) => s.id === sectionId)) return 'left'
    if (section.rightColumn.some((s) => s.id === sectionId)) return 'right'
    return null
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeColumn = findColumn(active.id as string)
    if (!activeColumn) return

    // Determine target column (from over.data or over.id if it's a column)
    let overColumn: 'left' | 'right' | null = null
    const overData = over.data.current as { columnId?: string } | undefined

    if (
      overData?.columnId === `${section.id}-left` ||
      over.id === `${section.id}-left`
    ) {
      overColumn = 'left'
    } else if (
      overData?.columnId === `${section.id}-right` ||
      over.id === `${section.id}-right`
    ) {
      overColumn = 'right'
    } else {
      // over.id might be a section - find its column
      overColumn = findColumn(over.id as string)
    }

    if (!overColumn) return

    const activeSection = (
      activeColumn === 'left' ? section.leftColumn : section.rightColumn
    ).find((s) => s.id === active.id)

    if (!activeSection) return

    if (activeColumn === overColumn) {
      // Same column - reorder
      const sourceColumn =
        activeColumn === 'left' ? section.leftColumn : section.rightColumn
      const oldIndex = sourceColumn.findIndex((s) => s.id === active.id)
      const newIndex = sourceColumn.findIndex((s) => s.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newColumn = arrayMove(sourceColumn, oldIndex, newIndex)
        onChange({
          ...section,
          [activeColumn === 'left' ? 'leftColumn' : 'rightColumn']: newColumn,
        })
      }
    } else {
      // Cross-column move
      const sourceColumnKey =
        activeColumn === 'left' ? 'leftColumn' : 'rightColumn'
      const targetColumnKey =
        overColumn === 'left' ? 'leftColumn' : 'rightColumn'

      const sourceColumn = [...section[sourceColumnKey]]
      const targetColumn = [...section[targetColumnKey]]

      // Remove from source
      const sourceIndex = sourceColumn.findIndex((s) => s.id === active.id)
      sourceColumn.splice(sourceIndex, 1)

      // Add to target (at the end, or at over position if over is a section)
      const overIndex = targetColumn.findIndex((s) => s.id === over.id)
      if (overIndex !== -1) {
        targetColumn.splice(overIndex, 0, activeSection)
      } else {
        targetColumn.push(activeSection)
      }

      onChange({
        ...section,
        [sourceColumnKey]: sourceColumn,
        [targetColumnKey]: targetColumn,
      })
    }
  }

  // Handlers for column content changes
  const handleLeftSectionChange = (index: number, updated: ContentSection) => {
    const newColumn = [...section.leftColumn]
    newColumn[index] = updated
    onChange({ ...section, leftColumn: newColumn })
  }

  const handleRightSectionChange = (index: number, updated: ContentSection) => {
    const newColumn = [...section.rightColumn]
    newColumn[index] = updated
    onChange({ ...section, rightColumn: newColumn })
  }

  const handleLeftSectionDelete = (index: number) => {
    onChange({
      ...section,
      leftColumn: section.leftColumn.filter((_, i) => i !== index),
    })
  }

  const handleRightSectionDelete = (index: number) => {
    onChange({
      ...section,
      rightColumn: section.rightColumn.filter((_, i) => i !== index),
    })
  }

  const handleLeftSectionAdd = (newSection: Section, index: number) => {
    if (newSection.type.startsWith('layout-')) return
    const newColumn = [...section.leftColumn]
    newColumn.splice(index, 0, newSection as ContentSection)
    onChange({ ...section, leftColumn: newColumn })
  }

  const handleRightSectionAdd = (newSection: Section, index: number) => {
    if (newSection.type.startsWith('layout-')) return
    const newColumn = [...section.rightColumn]
    newColumn.splice(index, 0, newSection as ContentSection)
    onChange({ ...section, rightColumn: newColumn })
  }

  // Find active section for drag overlay
  const activeSection = activeId
    ? section.leftColumn.find((s) => s.id === activeId) ||
      section.rightColumn.find((s) => s.id === activeId)
    : null

  // Handle unwrap: flatten left column then right column
  const handleUnwrap = () => {
    if (onUnwrap) {
      onUnwrap([...section.leftColumn, ...section.rightColumn])
    }
  }

  return (
    <div className="layout-section-editor" data-layout-type="two-column">
      {/* Header */}
      <div className="layout-section-header">
        <div className="layout-section-title">
          <span className="layout-section-icon" aria-hidden="true">
            ||
          </span>
          <span>Two Columns</span>
        </div>
        <div className="layout-section-actions">
          {onUnwrap && (
            <button
              type="button"
              onClick={handleUnwrap}
              className="layout-unwrap-btn"
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
            onClick={onDelete}
            className="section-delete-btn"
            aria-label="Delete layout"
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
      </div>

      {/* Columns with cross-column drag */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className="layout-two-column-grid"
          data-ratio={section.ratio}
          data-gap={section.gap}
        >
          <ColumnDropZone
            columnId={`${section.id}-left`}
            columnLabel="Left Column"
            sections={section.leftColumn}
            portfolioId={portfolioId}
            projectId={projectId}
            onSectionChange={handleLeftSectionChange}
            onSectionDelete={handleLeftSectionDelete}
            onSectionAdd={handleLeftSectionAdd}
            onSaveRequest={onSaveRequest}
          />
          <ColumnDropZone
            columnId={`${section.id}-right`}
            columnLabel="Right Column"
            sections={section.rightColumn}
            portfolioId={portfolioId}
            projectId={projectId}
            onSectionChange={handleRightSectionChange}
            onSectionDelete={handleRightSectionDelete}
            onSectionAdd={handleRightSectionAdd}
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

      {/* Settings */}
      <LayoutSettingsBar
        layoutType="two-column"
        ratio={section.ratio}
        onRatioChange={(ratio) => onChange({ ...section, ratio })}
        gap={section.gap}
        onGapChange={(gap) => onChange({ ...section, gap })}
        mobileStackOrder={section.mobileStackOrder}
        onMobileStackOrderChange={(order) =>
          onChange({
            ...section,
            mobileStackOrder: order as typeof section.mobileStackOrder,
          })
        }
      />

      <style jsx>{`
        .layout-section-editor {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .layout-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          background: var(--color-background);
          border-bottom: 1px solid var(--color-border);
        }

        .layout-section-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-secondary);
        }

        .layout-section-icon {
          font-size: var(--font-size-xs);
          letter-spacing: -0.1em;
        }

        .layout-section-actions {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .layout-two-column-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          padding: var(--space-4);
        }

        /* Ratio variants */
        .layout-two-column-grid[data-ratio='50-50'] {
          grid-template-columns: 1fr 1fr;
        }

        .layout-two-column-grid[data-ratio='60-40'] {
          grid-template-columns: 3fr 2fr;
        }

        .layout-two-column-grid[data-ratio='40-60'] {
          grid-template-columns: 2fr 3fr;
        }

        .layout-two-column-grid[data-ratio='70-30'] {
          grid-template-columns: 7fr 3fr;
        }

        .layout-two-column-grid[data-ratio='30-70'] {
          grid-template-columns: 3fr 7fr;
        }

        /* Gap variants */
        .layout-two-column-grid[data-gap='narrow'] {
          gap: var(--space-3);
        }

        .layout-two-column-grid[data-gap='default'] {
          gap: var(--space-5);
        }

        .layout-two-column-grid[data-gap='wide'] {
          gap: var(--space-8);
        }

        /* Responsive: stack on mobile */
        @media (max-width: 768px) {
          .layout-two-column-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
