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
  LayoutSidebarSection,
  ContentSection,
  Section,
} from '@/lib/content-schema'

interface LayoutSidebarEditorProps {
  section: LayoutSidebarSection
  onChange: (section: LayoutSidebarSection) => void
  onDelete: () => void
  onUnwrap?: (sections: ContentSection[]) => void
  portfolioId: string
  categoryId?: string
  projectId?: string
  onSaveRequest?: () => void
}

export function LayoutSidebarEditor({
  section,
  onChange,
  onDelete,
  onUnwrap,
  portfolioId,
  categoryId: _categoryId,
  projectId,
  onSaveRequest,
}: LayoutSidebarEditorProps) {
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
  const findColumn = (sectionId: string): 'sidebar' | 'main' | null => {
    if (section.sidebar.some((s) => s.id === sectionId)) return 'sidebar'
    if (section.main.some((s) => s.id === sectionId)) return 'main'
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

    // Determine target column
    let overColumn: 'sidebar' | 'main' | null = null
    const overData = over.data.current as { columnId?: string } | undefined

    if (
      overData?.columnId === `${section.id}-sidebar` ||
      over.id === `${section.id}-sidebar`
    ) {
      overColumn = 'sidebar'
    } else if (
      overData?.columnId === `${section.id}-main` ||
      over.id === `${section.id}-main`
    ) {
      overColumn = 'main'
    } else {
      // over.id might be a section - find its column
      overColumn = findColumn(over.id as string)
    }

    if (!overColumn) return

    const activeSection = (
      activeColumn === 'sidebar' ? section.sidebar : section.main
    ).find((s) => s.id === active.id)

    if (!activeSection) return

    if (activeColumn === overColumn) {
      // Same column - reorder
      const sourceColumn =
        activeColumn === 'sidebar' ? section.sidebar : section.main
      const oldIndex = sourceColumn.findIndex((s) => s.id === active.id)
      const newIndex = sourceColumn.findIndex((s) => s.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newColumn = arrayMove(sourceColumn, oldIndex, newIndex)
        onChange({
          ...section,
          [activeColumn]: newColumn,
        })
      }
    } else {
      // Cross-column move
      const sourceColumn = [...section[activeColumn]]
      const targetColumn = [...section[overColumn]]

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

      onChange({
        ...section,
        [activeColumn]: sourceColumn,
        [overColumn]: targetColumn,
      })
    }
  }

  // Handlers for sidebar column
  const handleSidebarSectionChange = (
    index: number,
    updated: ContentSection
  ) => {
    const newSidebar = [...section.sidebar]
    newSidebar[index] = updated
    onChange({ ...section, sidebar: newSidebar })
  }

  const handleSidebarSectionDelete = (index: number) => {
    onChange({
      ...section,
      sidebar: section.sidebar.filter((_, i) => i !== index),
    })
  }

  const handleSidebarSectionAdd = (newSection: Section, index: number) => {
    if (newSection.type.startsWith('layout-')) return
    const newSidebar = [...section.sidebar]
    newSidebar.splice(index, 0, newSection as ContentSection)
    onChange({ ...section, sidebar: newSidebar })
  }

  // Handlers for main column
  const handleMainSectionChange = (index: number, updated: ContentSection) => {
    const newMain = [...section.main]
    newMain[index] = updated
    onChange({ ...section, main: newMain })
  }

  const handleMainSectionDelete = (index: number) => {
    onChange({
      ...section,
      main: section.main.filter((_, i) => i !== index),
    })
  }

  const handleMainSectionAdd = (newSection: Section, index: number) => {
    if (newSection.type.startsWith('layout-')) return
    const newMain = [...section.main]
    newMain.splice(index, 0, newSection as ContentSection)
    onChange({ ...section, main: newMain })
  }

  // Find active section for drag overlay
  const activeSection = activeId
    ? section.sidebar.find((s) => s.id === activeId) ||
      section.main.find((s) => s.id === activeId)
    : null

  // Handle sidebar position change
  const handleSidebarPositionChange = (position: 'left' | 'right') => {
    onChange({ ...section, sidebarPosition: position })
  }

  // Handle sidebar width change
  const handleSidebarWidthChange = (width: 240 | 280 | 320) => {
    onChange({ ...section, sidebarWidth: width })
  }

  // Handle gap change
  const handleGapChange = (gap: 'narrow' | 'default' | 'wide') => {
    onChange({ ...section, gap })
  }

  // Handle mobile stack order change
  const handleMobileStackOrderChange = (order: string) => {
    onChange({
      ...section,
      mobileStackOrder: order as 'sidebar-first' | 'main-first',
    })
  }

  // Handle unwrap: flatten main content first, then sidebar
  const handleUnwrap = () => {
    if (onUnwrap) {
      onUnwrap([...section.main, ...section.sidebar])
    }
  }

  // Render columns in correct order based on sidebar position
  const renderColumns = () => {
    const sidebarColumn = (
      <ColumnDropZone
        key="sidebar"
        columnId={`${section.id}-sidebar`}
        columnLabel="Sidebar"
        sections={section.sidebar}
        portfolioId={portfolioId}
        projectId={projectId}
        onSectionChange={handleSidebarSectionChange}
        onSectionDelete={handleSidebarSectionDelete}
        onSectionAdd={handleSidebarSectionAdd}
        onSaveRequest={onSaveRequest}
      />
    )

    const mainColumn = (
      <ColumnDropZone
        key="main"
        columnId={`${section.id}-main`}
        columnLabel="Main Content"
        sections={section.main}
        portfolioId={portfolioId}
        projectId={projectId}
        onSectionChange={handleMainSectionChange}
        onSectionDelete={handleMainSectionDelete}
        onSectionAdd={handleMainSectionAdd}
        onSaveRequest={onSaveRequest}
      />
    )

    // If sidebar is on left, render sidebar first; otherwise render main first
    if (section.sidebarPosition === 'left') {
      return (
        <>
          {sidebarColumn}
          {mainColumn}
        </>
      )
    } else {
      return (
        <>
          {mainColumn}
          {sidebarColumn}
        </>
      )
    }
  }

  return (
    <div className="layout-section-editor">
      {/* Header */}
      <div className="layout-section-header">
        <span className="layout-section-label">Sidebar + Main</span>
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
            aria-label="Delete layout section"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Columns container with CSS grid and cross-column drag */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className="layout-sidebar"
          data-position={section.sidebarPosition}
          data-width={section.sidebarWidth}
          data-gap={section.gap}
          data-mobile-stack={section.mobileStackOrder}
        >
          {renderColumns()}
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

      {/* Settings bar */}
      <LayoutSettingsBar
        layoutType="sidebar"
        sidebarPosition={section.sidebarPosition}
        onSidebarPositionChange={handleSidebarPositionChange}
        sidebarWidth={section.sidebarWidth}
        onSidebarWidthChange={handleSidebarWidthChange}
        gap={section.gap}
        onGapChange={handleGapChange}
        mobileStackOrder={section.mobileStackOrder}
        onMobileStackOrderChange={handleMobileStackOrderChange}
      />
    </div>
  )
}
