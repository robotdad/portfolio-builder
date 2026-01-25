'use client'

import { useState, useRef, useSyncExternalStore } from 'react'
import { Popover, PopoverItem } from '@/components/shared/Popover'
import { BottomSheet, BottomSheetItem } from '@/components/shared/BottomSheet'
import { 
  sectionTypes, 
  createTextSection, 
  createImageSection,
  createHeroSection,
  createFeaturedGridSection,
  createFeaturedCarouselSection,
  createGallerySection,
  createCategoryGridSection,
  createProjectGridSection,
  type Section,
  type SectionType,
} from '@/lib/content-schema'
import styles from './AddSectionButton.module.css'

// Media query subscription for useSyncExternalStore
const mobileQuery = '(max-width: 767px)'

function subscribeMobileQuery(callback: () => void) {
  const mediaQuery = window.matchMedia(mobileQuery)
  mediaQuery.addEventListener('change', callback)
  return () => mediaQuery.removeEventListener('change', callback)
}

function getIsMobile() {
  return window.matchMedia(mobileQuery).matches
}

function getServerIsMobile() {
  return false // SSR default
}

interface AddSectionButtonProps {
  onAdd: (section: Section) => void
  hasHeroSection?: boolean
  portfolioId?: string // Optional - used to fetch default bio for profile cards
  context?: 'page' | 'category' | 'category-list' // Editing context for filtering available sections
}

export function AddSectionButton({ 
  onAdd, 
  hasHeroSection = false, 
  portfolioId,
  context = 'page'
}: AddSectionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Detect mobile viewport using useSyncExternalStore (no setState in effect)
  const isMobile = useSyncExternalStore(subscribeMobileQuery, getIsMobile, getServerIsMobile)

  const handleAddSection = async (type: SectionType) => {
    let section: Section

    switch (type) {
      case 'text':
        section = createTextSection()
        break
      case 'image':
        section = createImageSection()
        break
      case 'hero':
        // Fetch default bio from Portfolio settings
        let defaultBio = ''
        let defaultProfileImageId = null
        let defaultProfileImageUrl = null
        
        if (portfolioId) {
          try {
            const res = await fetch('/api/portfolio')
            if (res.ok) {
              const result = await res.json()
              if (result.success && result.data) {
                defaultBio = result.data.bio || ''
                defaultProfileImageId = result.data.profilePhotoId || null
                if (result.data.profilePhoto) {
                  defaultProfileImageUrl = result.data.profilePhoto.url || null
                }
              }
            }
          } catch (err) {
            console.error('Failed to fetch default bio:', err)
          }
        }
        
        section = {
          ...createHeroSection('', '', defaultBio),
          profileImageId: defaultProfileImageId,
          profileImageUrl: defaultProfileImageUrl,
        }
        break
      case 'featured-grid':
        section = createFeaturedGridSection()
        break
      case 'featured-carousel':
        section = createFeaturedCarouselSection()
        break
      case 'gallery':
        section = createGallerySection()
        break
      case 'category-grid':
        section = createCategoryGridSection()
        break
      case 'project-grid':
        section = createProjectGridSection()
        break
      default:
        return
    }

    onAdd(section)
    setIsOpen(false)
  }

  // Filter section types based on context and existing sections
  const availableTypes = sectionTypes.filter((type) => {
    // Only one hero per page
    if (type.type === 'hero' && hasHeroSection) return false
    
    // category-grid doesn't make sense on category landing pages
    if (type.type === 'category-grid' && context === 'category') return false
    
    // project-grid only makes sense on category landing pages
    if (type.type === 'project-grid' && context !== 'category') return false
    
    return true
  })

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
