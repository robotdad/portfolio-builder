'use client'

import { useState, useRef, useEffect } from 'react'
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

interface AddSectionButtonProps {
  onAdd: (section: Section) => void
  hasHeroSection?: boolean
}

export function AddSectionButton({ onAdd, hasHeroSection = false }: AddSectionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

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
          style={{
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease',
          }}
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {isOpen && (
        <div 
          ref={menuRef}
          className="add-section-menu"
          role="menu"
          aria-label="Section types"
        >
          <div className="add-section-menu-header">
            Add Section
          </div>
          {availableTypes.map((sectionType) => (
            <button
              key={sectionType.type}
              type="button"
              className="add-section-menu-item"
              onClick={() => handleAddSection(sectionType.type)}
              role="menuitem"
            >
              <span className="add-section-menu-icon" aria-hidden="true">
                {sectionType.icon}
              </span>
              <div className="add-section-menu-text">
                <span className="add-section-menu-label">{sectionType.label}</span>
                <span className="add-section-menu-description">{sectionType.description}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
