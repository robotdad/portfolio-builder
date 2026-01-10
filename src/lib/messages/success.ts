// ============================================================================
// Centralized Success Messages
// ============================================================================

export const SUCCESS_MESSAGES = {
  // CRUD operations
  CREATED: (entity: string) => `${entity} created successfully`,
  UPDATED: (entity: string) => `${entity} updated successfully`,
  DELETED: (entity: string) => `${entity} deleted successfully`,
  SAVED: (entity: string) => `${entity} saved successfully`,
  
  // Specific actions
  PUBLISHED: (entity: string) => `${entity} published successfully`,
  UNPUBLISHED: (entity: string) => `${entity} unpublished`,
  REORDERED: (entity: string) => `${entity} order updated`,
  
  // Upload
  UPLOAD_COMPLETE: 'Upload complete',
  IMAGE_UPLOADED: 'Image uploaded successfully',
  
  // Context-specific (for useImageUpload hook)
  IMAGE_CONTEXT: {
    profile: 'Profile photo updated',
    gallery: 'Image added to gallery',
    featured: 'Featured image updated',
    hero: 'Hero image updated',
    section: 'Section image updated',
  },
} as const

export type SuccessMessage = typeof SUCCESS_MESSAGES
