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
import { CategoryGridEditor } from './CategoryGridEditor'
import { ProjectGridEditor } from './ProjectGridEditor'
import { LayoutTwoColumnEditor } from './layouts/LayoutTwoColumnEditor'
import { LayoutThreeColumnEditor } from './layouts/LayoutThreeColumnEditor'
import { LayoutSidebarEditor } from './layouts/LayoutSidebarEditor'
import type { 
  Section,
  ContentSection,
  TextSection as TextSectionType,
  ImageSection as ImageSectionType,
  HeroSection as HeroSectionType,
  FeaturedGridSection as FeaturedGridSectionType,
  FeaturedCarouselSection as FeaturedCarouselSectionType,
  GallerySection as GallerySectionType,
  CategoryGridSection as CategoryGridSectionType,
  ProjectGridSection as ProjectGridSectionType,
  LayoutTwoColumnSection as LayoutTwoColumnSectionType,
  LayoutThreeColumnSection as LayoutThreeColumnSectionType,
  LayoutSidebarSection as LayoutSidebarSectionType,
} from '@/lib/content-schema'

interface SectionListProps {
  sections: Section[]
  portfolioId: string
  categoryId?: string // Optional: for project-grid sections
  projectId?: string // Optional: for project-specific features (e.g., gallery image database records)
  onChange: (sections: Section[]) => void
  onSaveRequest?: () => void
}

export function SectionList({ sections, portfolioId, categoryId, projectId, onChange, onSaveRequest }: SectionListProps) {
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

  // Handle unwrapping a layout: replace it with its flattened content
  const handleUnwrap = (index: number, flattenedSections: ContentSection[]) => {
    const newSections = [...sections]
    // Remove the layout at index and insert flattened sections in its place
    newSections.splice(index, 1, ...flattenedSections)
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
                  categoryId={categoryId}
                  projectId={projectId}
                  onChange={(s) => handleSectionChange(index, s)}
                  onDelete={() => handleSectionDelete(index)}
                  onUnwrap={(flattenedSections) => handleUnwrap(index, flattenedSections)}
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
              categoryId={categoryId}
              projectId={projectId}
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
  categoryId?: string
  projectId?: string
  onChange: (section: Section) => void
  onDelete: () => void
  onUnwrap?: (flattenedSections: ContentSection[]) => void
  onSaveRequest?: () => void
}

function SectionEditor({ section, portfolioId, categoryId, projectId, onChange, onDelete, onUnwrap, onSaveRequest }: SectionEditorProps) {
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
          projectId={projectId}
          onChange={onChange as (s: GallerySectionType) => void}
          onDelete={onDelete}
          onSaveRequest={onSaveRequest}
        />
      )
    case 'category-grid':
      return (
        <CategoryGridEditor
          section={section as CategoryGridSectionType}
          portfolioId={portfolioId}
          onChange={onChange as (s: CategoryGridSectionType) => void}
          onDelete={onDelete}
        />
      )
    case 'project-grid':
      if (!categoryId) {
        return (
          <div className="section-editor section-editor-error">
            <p>Project grid sections require a category context</p>
          </div>
        )
      }
      return (
        <ProjectGridEditor
          section={section as ProjectGridSectionType}
          categoryId={categoryId}
          onChange={onChange as (s: ProjectGridSectionType) => void}
          onDelete={onDelete}
        />
      )
    case 'layout-two-column':
      return (
        <LayoutTwoColumnEditor
          section={section as LayoutTwoColumnSectionType}
          portfolioId={portfolioId}
          categoryId={categoryId}
          projectId={projectId}
          onChange={onChange as (s: LayoutTwoColumnSectionType) => void}
          onDelete={onDelete}
          onUnwrap={onUnwrap}
          onSaveRequest={onSaveRequest}
        />
      )
    case 'layout-three-column':
      return (
        <LayoutThreeColumnEditor
          section={section as LayoutThreeColumnSectionType}
          portfolioId={portfolioId}
          categoryId={categoryId}
          projectId={projectId}
          onChange={onChange as (s: LayoutThreeColumnSectionType) => void}
          onDelete={onDelete}
          onUnwrap={onUnwrap}
          onSaveRequest={onSaveRequest}
        />
      )
    case 'layout-sidebar':
      return (
        <LayoutSidebarEditor
          section={section as LayoutSidebarSectionType}
          portfolioId={portfolioId}
          categoryId={categoryId}
          projectId={projectId}
          onChange={onChange as (s: LayoutSidebarSectionType) => void}
          onDelete={onDelete}
          onUnwrap={onUnwrap}
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
