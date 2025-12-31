/**
 * Serialization utilities for section-based content
 * 
 * Handles conversion between Section[] and JSON string for database storage
 */

import type { Section, PageContent } from './content-schema'

/**
 * Serialize sections array to JSON string for database storage
 */
export function serializeSections(sections: Section[]): string {
  const content: PageContent = { sections }
  return JSON.stringify(content)
}

/**
 * Deserialize JSON string from database to sections array
 * Returns empty array if parsing fails or content is invalid
 */
export function deserializeSections(json: string | null | undefined): Section[] {
  if (!json) return []
  
  try {
    const parsed = JSON.parse(json)
    
    // Handle both { sections: [...] } and direct array formats
    if (Array.isArray(parsed)) {
      return validateSections(parsed)
    }
    
    if (parsed && Array.isArray(parsed.sections)) {
      return validateSections(parsed.sections)
    }
    
    return []
  } catch {
    console.error('Failed to parse sections JSON:', json)
    return []
  }
}

/**
 * Validate and filter sections to ensure they have required fields
 */
function validateSections(sections: unknown[]): Section[] {
  return sections.filter((section): section is Section => {
    if (!section || typeof section !== 'object') return false
    
    const s = section as Record<string, unknown>
    
    // Must have id and type
    if (typeof s.id !== 'string' || typeof s.type !== 'string') return false
    
    // Validate based on type
    switch (s.type) {
      case 'text':
        return typeof s.content === 'string'
      case 'image':
        return true // imageId can be null
      case 'hero':
        return typeof s.name === 'string' && 
               typeof s.title === 'string' && 
               typeof s.bio === 'string'
      case 'featured-grid':
        return typeof s.heading === 'string' && Array.isArray(s.items)
      default:
        return false
    }
  })
}

/**
 * Create a deep clone of sections (useful for state updates)
 */
export function cloneSections(sections: Section[]): Section[] {
  return JSON.parse(JSON.stringify(sections))
}
