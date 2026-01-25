'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { SortableSection } from '../SortableSection'
import { InlineAddButton } from '../InlineAddButton'
import { TextSection } from '../TextSection'
import { ImageSectionEditor } from '../ImageSectionEditor'
import { GallerySectionEditor } from '../GallerySectionEditor'
import { FeaturedCarouselEditor } from '../FeaturedCarouselEditor'
import type {
  ContentSection,
  TextSection as TextSectionType,
  ImageSection as ImageSectionType,
  GallerySection as GallerySectionType,
  FeaturedCarouselSection as FeaturedCarouselSectionType,
  Section,
} from '@/lib/content-schema'

interface ColumnDropZoneProps {
  columnId: string
  columnLabel: string
  sections: ContentSection[]
  portfolioId: string
  projectId?: string
  onSectionChange: (index: number, section: ContentSection) => void
  onSectionDelete: (index: number) => void
  onSectionAdd: (section: Section, index: number) => void
  onSaveRequest?: () => void
}

export function ColumnDropZone({
  columnId,
  columnLabel,
  sections,
  portfolioId,
  projectId,
  onSectionChange,
  onSectionDelete,
  onSectionAdd,
  onSaveRequest,
}: ColumnDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    data: { type: 'column', columnId },
  })

  const renderSectionEditor = (section: ContentSection, index: number) => {
    switch (section.type) {
      case 'text':
        return (
          <TextSection
            section={section as TextSectionType}
            onChange={(updated) => onSectionChange(index, updated)}
            onDelete={() => onSectionDelete(index)}
          />
        )
      case 'image':
        return (
          <ImageSectionEditor
            section={section as ImageSectionType}
            portfolioId={portfolioId}
            onChange={(updated) => onSectionChange(index, updated)}
            onDelete={() => onSectionDelete(index)}
            onSaveRequest={onSaveRequest}
          />
        )
      case 'gallery':
        return (
          <GallerySectionEditor
            section={section as GallerySectionType}
            portfolioId={portfolioId}
            projectId={projectId}
            onChange={(updated) => onSectionChange(index, updated)}
            onDelete={() => onSectionDelete(index)}
            onSaveRequest={onSaveRequest}
          />
        )
      case 'featured-carousel':
        return (
          <FeaturedCarouselEditor
            section={section as FeaturedCarouselSectionType}
            portfolioId={portfolioId}
            onChange={(updated) => onSectionChange(index, updated)}
            onDelete={() => onSectionDelete(index)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`layout-column ${isOver ? 'drag-over' : ''}`}
      data-column-id={columnId}
    >
      <div className="layout-column-label">{columnLabel}</div>

      {sections.length === 0 ? (
        <div className="layout-column-empty">
          <p>No content yet</p>
          <InlineAddButton
            onAdd={(section) => onSectionAdd(section, 0)}
            hasHeroSection={false}
            insertIndex={0}
            layoutContext
          />
        </div>
      ) : (
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="column-sections">
            <InlineAddButton
              onAdd={(section) => onSectionAdd(section, 0)}
              hasHeroSection={false}
              insertIndex={0}
              layoutContext
            />
            {sections.map((section, index) => (
              <React.Fragment key={section.id}>
                <SortableSection id={section.id} data={{ columnId }}>
                  {renderSectionEditor(section, index)}
                </SortableSection>
                <InlineAddButton
                  onAdd={(s) => onSectionAdd(s, index + 1)}
                  hasHeroSection={false}
                  insertIndex={index + 1}
                  layoutContext
                />
              </React.Fragment>
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  )
}
