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
import { SortableSection } from './SortableSection'
import { InlineAddButton } from './InlineAddButton'
import { TextSection } from './TextSection'
import { ImageSectionEditor } from './ImageSectionEditor'
import { HeroSectionEditor } from './HeroSectionEditor'
import { FeaturedGridEditor } from './FeaturedGridEditor'
import { FeaturedCarouselEditor } from './FeaturedCarouselEditor'
import { GallerySectionEditor } from './GallerySectionEditor'
import type { 
  Section, 
  TextSection as TextSectionType,
  ImageSection as ImageSectionType,
  HeroSection as HeroSectionType,
  FeaturedGridSection as FeaturedGridSectionType,
  FeaturedCarouselSection as FeaturedCarouselSectionType,
  GallerySection as GallerySectionType,
} from '@/lib/content-schema'

interface SectionListProps {
  sections: Section[]
  portfolioId: string
  onChange: (sections: Section[]) => void
  onSaveRequest?: () => void
}

export function SectionList({ sections, portfolioId, onChange, onSaveRequest }: SectionListProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  
  // Detect if a hero section already exists (only one allowed)
  const hasHeroSection = sections.some(s => s.type === 'hero')

  // Configure sensors for desktop and mobile
  // Touch sensor: 150ms delay prevents accidental drags while scrolling
  // Pointer sensor: 8px tolerance for precise mouse control
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150, // 150ms delay before touch drag starts
        tolerance: 8, // 8px movement tolerance during delay
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
      const oldIndex = sections.findIndex((s) => s.id === active.id)
      const newIndex = sections.findIndex((s) => s.id === over.id)
      
      const newSections = arrayMove(sections, oldIndex, newIndex)
      onChange(newSections)
    }

    setActiveId(null)
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  const handleSectionChange = (index: number, updatedSection: Section) => {
    const newSections = [...sections]
    newSections[index] = updatedSection
    onChange(newSections)
  }

  const handleSectionDelete = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index)
    onChange(newSections)
  }

  const handleInsertSection = (index: number, section: Section) => {
    const newSections = [...sections]
    newSections.splice(index, 0, section)
    onChange(newSections)
  }

  const activeSection = activeId 
    ? sections.find((s) => s.id === activeId) 
    : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={sections.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="section-list">
          {sections.length === 0 && (
            <InlineAddButton
              onAdd={(section) => handleInsertSection(0, section)}
              hasHeroSection={false}
              insertIndex={0}
            />
          )}
          {sections.map((section, index) => (
            <React.Fragment key={section.id}>
              {index === 0 && (
                <InlineAddButton
                  onAdd={(s) => handleInsertSection(0, s)}
                  hasHeroSection={hasHeroSection}
                  insertIndex={0}
                />
              )}
              <SortableSection id={section.id}>
                <SectionEditor
                  section={section}
                  portfolioId={portfolioId}
                  onChange={(s) => handleSectionChange(index, s)}
                  onDelete={() => handleSectionDelete(index)}
                  onSaveRequest={onSaveRequest}
                />
              </SortableSection>
              <InlineAddButton
                onAdd={(s) => handleInsertSection(index + 1, s)}
                hasHeroSection={hasHeroSection}
                insertIndex={index + 1}
              />
            </React.Fragment>
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeSection ? (
          <div className="section-drag-overlay">
            <SectionEditor
              section={activeSection}
              portfolioId={portfolioId}
              onChange={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

// Internal component to render the appropriate editor based on section type
interface SectionEditorProps {
  section: Section
  portfolioId: string
  onChange: (section: Section) => void
  onDelete: () => void
  onSaveRequest?: () => void
}

function SectionEditor({ section, portfolioId, onChange, onDelete, onSaveRequest }: SectionEditorProps) {
  switch (section.type) {
    case 'text':
      return (
        <TextSection
          section={section as TextSectionType}
          onChange={onChange as (s: TextSectionType) => void}
          onDelete={onDelete}
        />
      )
    case 'image':
      return (
        <ImageSectionEditor
          section={section as ImageSectionType}
          portfolioId={portfolioId}
          onChange={onChange as (s: ImageSectionType) => void}
          onDelete={onDelete}
          onSaveRequest={onSaveRequest}
        />
      )
    case 'hero':
      return (
        <HeroSectionEditor
          section={section as HeroSectionType}
          portfolioId={portfolioId}
          onChange={onChange as (s: HeroSectionType) => void}
          onDelete={onDelete}
        />
      )
    case 'featured-grid':
      return (
        <FeaturedGridEditor
          section={section as FeaturedGridSectionType}
          portfolioId={portfolioId}
          onChange={onChange as (s: FeaturedGridSectionType) => void}
          onDelete={onDelete}
        />
      )
    case 'featured-carousel':
      return (
        <FeaturedCarouselEditor
          section={section as FeaturedCarouselSectionType}
          portfolioId={portfolioId}
          onChange={onChange as (s: FeaturedCarouselSectionType) => void}
          onDelete={onDelete}
        />
      )
    case 'gallery':
      return (
        <GallerySectionEditor
          section={section as GallerySectionType}
          portfolioId={portfolioId}
          onChange={onChange as (s: GallerySectionType) => void}
          onDelete={onDelete}
          onSaveRequest={onSaveRequest}
        />
      )
    default:
      return (
        <div className="section-editor section-editor-unknown">
          <p>Unknown section type</p>
        </div>
      )
  }
}
