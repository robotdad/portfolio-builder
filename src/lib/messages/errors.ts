// ============================================================================
// Centralized Error Messages
// ============================================================================
// Single source of truth for all user-facing error messages.
// Benefits: Consistency, easy updates, future i18n support.
// ============================================================================

// ----------------------------------------------------------------------------
// API Errors - Generic operation failures
// ----------------------------------------------------------------------------

export const API_ERRORS = {
  // CRUD operations
  FETCH_FAILED: (entity: string) => `Failed to fetch ${entity}`,
  CREATE_FAILED: (entity: string) => `Failed to create ${entity}`,
  UPDATE_FAILED: (entity: string) => `Failed to update ${entity}`,
  DELETE_FAILED: (entity: string) => `Failed to delete ${entity}`,
  
  // Not found
  NOT_FOUND: (entity: string) => `${entity} not found`,
  
  // Generic
  INTERNAL_ERROR: 'An unexpected error occurred. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  BAD_REQUEST: 'Invalid request. Please check your input.',
} as const

// ----------------------------------------------------------------------------
// Validation Errors - Form and input validation
// ----------------------------------------------------------------------------

export const VALIDATION_ERRORS = {
  // Required fields
  REQUIRED: (field: string) => `${field} is required`,
  
  // Length constraints
  MAX_LENGTH: (field: string, max: number) => 
    `${field} must be ${max} characters or less`,
  MIN_LENGTH: (field: string, min: number) => 
    `${field} must be at least ${min} characters`,
  
  // Slug/URL validation
  SLUG_FORMAT: 'URL can only contain lowercase letters, numbers, and hyphens',
  SLUG_TAKEN: 'This URL is already taken. Please choose a different one.',
  SLUG_RESERVED: (slug: string) => `"${slug}" is a reserved URL and cannot be used`,
  
  // File validation
  INVALID_FILE_TYPE: 'Invalid file type. Please use JPEG, PNG, or WebP.',
  FILE_TOO_LARGE: (maxSize: string) => `File too large. Maximum size is ${maxSize}.`,
  
  // Uniqueness
  ALREADY_EXISTS: (entity: string) => `A ${entity} with this name already exists`,
  DUPLICATE_ENTRY: (field: string) => `This ${field} is already in use`,
} as const

// ----------------------------------------------------------------------------
// Entity-Specific Errors
// ----------------------------------------------------------------------------

export const ENTITY_ERRORS = {
  // Portfolio
  PORTFOLIO_NOT_FOUND: 'Portfolio not found',
  PORTFOLIO_SLUG_TAKEN: 'This portfolio URL is already taken',
  
  // Project
  PROJECT_NOT_FOUND: 'Project not found',
  PROJECT_TITLE_REQUIRED: 'Project title is required',
  
  // Category
  CATEGORY_NOT_FOUND: 'Category not found',
  CATEGORY_NAME_REQUIRED: 'Category name is required',
  CATEGORY_HAS_PROJECTS: 'Cannot delete category with existing projects',
  
  // Page
  PAGE_NOT_FOUND: 'Page not found',
  PAGE_TITLE_REQUIRED: 'Page title is required',
  PAGE_SLUG_TAKEN: 'A page with this URL already exists',
  
  // Asset/Image
  ASSET_NOT_FOUND: 'Asset not found',
  UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  
  // Section
  SECTION_NOT_FOUND: 'Section not found',
} as const

// ----------------------------------------------------------------------------
// Type exports for type-safe usage
// ----------------------------------------------------------------------------

export type ApiError = typeof API_ERRORS
export type ValidationError = typeof VALIDATION_ERRORS
export type EntityError = typeof ENTITY_ERRORS
