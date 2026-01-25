'use client'

import React, { useState } from 'react'
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
} from '@dnd-kit/sortable'
import { SortableSection } from '../SortableSection'
import { InlineAddButton } from '../InlineAddButton'
import { TextSection } from '../TextSection'
import { ImageSectionEditor } from '../ImageSectionEditor'
import { GallerySectionEditor } from '../GallerySectionEditor'
import { ProjectCardEditor } from '../ProjectCardEditor'
import { ProjectListEditor } from '../ProjectListEditor'
import type {
  ContentSection,
  TextSection as TextSectionType,
  ImageSection as ImageSectionType,
  GallerySection as GallerySectionType,
  ProjectCardSection as ProjectCardSectionType,
  ProjectListSection as ProjectListSectionType,
  Section,
} from '@/lib/content-schema'

interface ColumnEditorProps {
  sections: ContentSection[]
  onChange: (sections: ContentSection[]) => void
  portfolioId: string
  categoryId?: string
  projectId?: string
  columnLabel: string // e.g., "Left Column", "Right Column", "Sidebar", "Main"
  columnId: string // Unique ID for this column (for drag context)
  onSaveRequest?: () => void
}

export function ColumnEditor({
  sections,
  onChange,
  portfolioId,
  categoryId,
  projectId,
  columnLabel,
  columnId,
  onSaveRequest,
}: ColumnEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((section) => section.id === active.id)
      const newIndex = sections.findIndex((section) => section.id === over.id)

      const newSections = arrayMove(sections, oldIndex, newIndex)
      onChange(newSections)
    }

    setActiveId(null)
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  // Handle section updates
  const handleSectionChange = (index: number, updatedSection: ContentSection) => {
    const newSections = [...sections]
    newSections[index] = updatedSection
    onChange(newSections)
  }

  // Handle section deletion
  const handleSectionDelete = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index)
    onChange(newSections)
  }

  // Handle adding a new section at a specific position
  const handleAddSection = (section: Section, index: number) => {
    // Only allow ContentSection types (text, image, gallery) - filter out layouts
    if (section.type.startsWith('layout-')) {
      console.warn('Layout sections cannot be nested inside columns')
      return
    }

    const newSections = [...sections]
    newSections.splice(index, 0, section as ContentSection)
    onChange(newSections)
  }

  // Render an individual content section editor
  const renderSectionEditor = (section: ContentSection, index: number) => {
    switch (section.type) {
      case 'text':
        return (
          <TextSection
            section={section as TextSectionType}
            onChange={(updated) => handleSectionChange(index, updated)}
            onDelete={() => handleSectionDelete(index)}
          />
        )
      case 'image':
        return (
          <ImageSectionEditor
            section={section as ImageSectionType}
            portfolioId={portfolioId}
            onChange={(updated) => handleSectionChange(index, updated)}
            onDelete={() => handleSectionDelete(index)}
            onSaveRequest={onSaveRequest}
          />
        )
      case 'gallery':
        return (
          <GallerySectionEditor
            section={section as GallerySectionType}
            portfolioId={portfolioId}
            projectId={projectId}
            onChange={(updated) => handleSectionChange(index, updated)}
            onDelete={() => handleSectionDelete(index)}
            onSaveRequest={onSaveRequest}
          />
        )
      case 'project-card':
        return (
          <ProjectCardEditor
            section={section as ProjectCardSectionType}
            onChange={(updated) => handleSectionChange(index, updated)}
            onDelete={() => handleSectionDelete(index)}
            categoryId={categoryId}
          />
        )
      case 'project-list':
        return (
          <ProjectListEditor
            section={section as ProjectListSectionType}
            onChange={(updated) => handleSectionChange(index, updated)}
            onDelete={() => handleSectionDelete(index)}
            categoryId={categoryId}
          />
        )
      default:
        return (
          <div className="section-editor section-editor-unknown">
            <p>Unknown section type: {(section as ContentSection).type}</p>
          </div>
        )
    }
  }

  // Find the active section for DragOverlay
  const activeSection = activeId
    ? sections.find((section) => section.id === activeId)
    : null

  return (
    <div className="layout-column" data-column-id={columnId}>
      <div className="layout-column-label">{columnLabel}</div>

      {sections.length === 0 ? (
        // Empty state
        <div className="layout-column-empty">
          <p>No content yet</p>
          <InlineAddButton
            onAdd={(section) => handleAddSection(section, 0)}
            hasHeroSection={false}
            insertIndex={0}
            layoutContext
          />
        </div>
      ) : (
        // Content with drag-and-drop
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={sections.map((section) => section.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="column-sections">
              {/* Add button at the top */}
              <InlineAddButton
                onAdd={(section) => handleAddSection(section, 0)}
                hasHeroSection={false}
                insertIndex={0}
                layoutContext
              />

              {sections.map((section, index) => (
                <React.Fragment key={section.id}>
                  <SortableSection id={section.id}>
                    {renderSectionEditor(section, index)}
                  </SortableSection>

                  {/* Add button between sections and at the end */}
                  <InlineAddButton
                    onAdd={(s) => handleAddSection(s, index + 1)}
                    hasHeroSection={false}
                    insertIndex={index + 1}
                    layoutContext
                  />
                </React.Fragment>
              ))}
            </div>
          </SortableContext>

          {/* Drag overlay for visual feedback */}
          <DragOverlay>
            {activeSection ? (
              <div className="section-drag-overlay">
                <div className="section-drag-preview">
                  <span className="section-type-badge">
                    {activeSection.type === 'text' && 'Text'}
                    {activeSection.type === 'image' && 'Image'}
                    {activeSection.type === 'gallery' && 'Gallery'}
                    {activeSection.type === 'project-card' && 'Project Card'}
                    {activeSection.type === 'project-list' && 'Project List'}
                  </span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <style jsx>{`
        .column-sections {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .section-drag-overlay {
          background: var(--color-surface);
          border: 2px solid var(--color-accent);
          border-radius: var(--radius-md);
          padding: var(--space-3);
          box-shadow: var(--shadow-lg);
          opacity: 0.9;
        }

        .section-drag-preview {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .section-type-badge {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-secondary);
          background: var(--color-background);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm);
        }
      `}</style>
    </div>
  )
}
