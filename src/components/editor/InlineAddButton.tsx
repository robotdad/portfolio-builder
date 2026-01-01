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

interface InlineAddButtonProps {
  onAdd: (section: Section) => void
  hasHeroSection?: boolean
  /** Position index where section will be inserted */
  insertIndex: number
}

export function InlineAddButton({
  onAdd,
  hasHeroSection = false,
  insertIndex,
}: InlineAddButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
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

  const menuItems = availableTypes.map((sectionType) => ({
    type: sectionType.type,
    label: sectionType.label,
    description: sectionType.description,
    icon: <span style={{ fontSize: '18px' }}>{sectionType.icon}</span>,
  }))

  return (
    <div className="inline-add-container">
      {/* Horizontal line */}
      <div className="inline-add-line" aria-hidden="true" />

      {/* Add button */}
      <button
        ref={buttonRef}
        type="button"
        className="inline-add-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Insert section here"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Desktop: Popover */}
      {!isMobile && (
        <Popover
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          triggerRef={buttonRef}
          align="center"
          gap={8}
        >
          {menuItems.map((item) => (
            <PopoverItem
              key={item.type}
              label={item.label}
              description={item.description}
              icon={item.icon}
              onSelect={() => handleAddSection(item.type)}
            />
          ))}
        </Popover>
      )}

      {/* Mobile: BottomSheet */}
      {isMobile && (
        <BottomSheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Add Section"
        >
          {menuItems.map((item) => (
            <BottomSheetItem
              key={item.type}
              label={item.label}
              description={item.description}
              icon={item.icon}
              onSelect={() => handleAddSection(item.type)}
            />
          ))}
        </BottomSheet>
      )}

      <style jsx>{`
        .inline-add-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 0;
          opacity: 0.4;
          transition: opacity 150ms ease;
        }

        .inline-add-container:hover,
        .inline-add-container:focus-within {
          opacity: 1;
        }

        .inline-add-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--color-border, #e2e8f0);
        }

        .inline-add-btn {
          position: relative;
          z-index: 1;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid var(--color-border, #e2e8f0);
          background: var(--color-surface, white);
          color: var(--color-text-secondary, #64748b);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 150ms ease;
        }

        .inline-add-btn:hover {
          border-color: var(--color-accent, #3b82f6);
          color: var(--color-accent, #3b82f6);
          transform: scale(1.1);
        }

        .inline-add-btn:focus-visible {
          outline: 2px solid var(--color-accent, #3b82f6);
          outline-offset: 2px;
          border-color: var(--color-accent, #3b82f6);
          color: var(--color-accent, #3b82f6);
        }

        .inline-add-btn:active {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  )
}
