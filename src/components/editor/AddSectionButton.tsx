'use client'

import { useState, useRef, useEffect } from 'react'
import { Popover, PopoverItem } from '@/components/shared/Popover'
import { BottomSheet, BottomSheetItem } from '@/components/shared/BottomSheet'
import { 
  sectionTypes, 
  createTextSection, 
  createImageSection,
  createHeroSection,
  createFeaturedGridSection,
  createGallerySection,
  type Section,
  type SectionType,
} from '@/lib/content-schema'
import styles from './AddSectionButton.module.css'

interface AddSectionButtonProps {
  onAdd: (section: Section) => void
  hasHeroSection?: boolean
}

export function AddSectionButton({ onAdd, hasHeroSection = false }: AddSectionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Detect mobile viewport
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    setIsMobile(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const handleAddSection = (type: SectionType) => {
    let section: Section

    switch (type) {
      case 'text':
        section = createTextSection()
        break
      case 'image':
        section = createImageSection()
        break
      case 'hero':
        section = createHeroSection()
        break
      case 'featured-grid':
        section = createFeaturedGridSection()
        break
      case 'gallery':
        section = createGallerySection()
        break
      default:
        return
    }

    onAdd(section)
    setIsOpen(false)
  }

  // Filter out hero if one already exists (only one hero per page)
  const availableTypes = sectionTypes.filter(
    (type) => !(type.type === 'hero' && hasHeroSection)
  )

  // Compute icon class based on open state
  const iconClass = isOpen 
    ? `${styles.addIcon} ${styles.addIconOpen}` 
    : styles.addIcon

  return (
    <div className="add-section-container">
      <button
        ref={buttonRef}
        type="button"
        className="add-section-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Add section"
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          aria-hidden="true"
          className={iconClass}
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {isMobile ? (
        <BottomSheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Add Section"
        >
          {availableTypes.map((sectionType) => (
            <BottomSheetItem
              key={sectionType.type}
              icon={<span>{sectionType.icon}</span>}
              label={sectionType.label}
              description={sectionType.description}
              onSelect={() => handleAddSection(sectionType.type)}
            />
          ))}
        </BottomSheet>
      ) : (
        <Popover
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          triggerRef={buttonRef}
        >
          {availableTypes.map((sectionType) => (
            <PopoverItem
              key={sectionType.type}
              icon={<span aria-hidden="true">{sectionType.icon}</span>}
              label={sectionType.label}
              description={sectionType.description}
              onSelect={() => handleAddSection(sectionType.type)}
            />
          ))}
        </Popover>
      )}
    </div>
  )
}
