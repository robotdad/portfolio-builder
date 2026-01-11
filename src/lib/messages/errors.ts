// ============================================================================
// Centralized Error Messages with Recovery Guidance
// ============================================================================
// Single source of truth for all user-facing error messages.
// Each error includes a message and actionable recovery guidance.
// Benefits: Consistency, easy updates, future i18n support, better UX.
// ============================================================================

// ----------------------------------------------------------------------------
// Type Definitions
// ----------------------------------------------------------------------------

export interface ErrorWithRecovery {
  message: string
  recovery: string
}

// ----------------------------------------------------------------------------
// API Errors - Generic operation failures
// ----------------------------------------------------------------------------

export const API_ERRORS = {
  // CRUD operations
  FETCH_FAILED: (entity: string): ErrorWithRecovery => ({
    message: `Failed to fetch ${entity}`,
    recovery: `Please refresh the page. If the problem persists, check your connection.`
  }),
  CREATE_FAILED: (entity: string): ErrorWithRecovery => ({
    message: `Failed to create ${entity}`,
    recovery: `Please try again. Make sure all required fields are filled in correctly.`
  }),
  UPDATE_FAILED: (entity: string): ErrorWithRecovery => ({
    message: `Failed to update ${entity}`,
    recovery: `Your changes could not be saved. Please try again.`
  }),
  DELETE_FAILED: (entity: string): ErrorWithRecovery => ({
    message: `Failed to delete ${entity}`,
    recovery: `Please try again. If the issue continues, refresh the page.`
  }),
  
  // Not found
  NOT_FOUND: (entity: string): ErrorWithRecovery => ({
    message: `${entity} not found`,
    recovery: `The ${entity.toLowerCase()} may have been moved or deleted. Go back and try again.`
  }),
  
  // Generic
  INTERNAL_ERROR: {
    message: 'An unexpected error occurred.',
    recovery: 'Please try again. If the problem persists, contact support.'
  },
  UNAUTHORIZED: {
    message: 'You are not authorized to perform this action.',
    recovery: 'Please sign in with an account that has the required permissions.'
  },
  BAD_REQUEST: {
    message: 'Invalid request.',
    recovery: 'Please check your input and try again.'
  },
} as const

// ----------------------------------------------------------------------------
// Validation Errors - Form and input validation
// ----------------------------------------------------------------------------

export const VALIDATION_ERRORS = {
  // Required fields
  REQUIRED: (field: string): ErrorWithRecovery => ({
    message: `${field} is required`,
    recovery: `Please enter a value for ${field.toLowerCase()}.`
  }),
  
  // Length constraints
  MAX_LENGTH: (field: string, max: number): ErrorWithRecovery => ({
    message: `${field} must be ${max} characters or less`,
    recovery: `Please shorten your ${field.toLowerCase()} to ${max} characters or fewer.`
  }),
  MIN_LENGTH: (field: string, min: number): ErrorWithRecovery => ({
    message: `${field} must be at least ${min} characters`,
    recovery: `Please enter at least ${min} characters for ${field.toLowerCase()}.`
  }),
  
  // Slug/URL validation
  SLUG_FORMAT: {
    message: 'URL can only contain lowercase letters, numbers, and hyphens',
    recovery: 'Remove any special characters, spaces, or uppercase letters from the URL.'
  },
  SLUG_TAKEN: {
    message: 'This URL is already taken.',
    recovery: 'Please choose a different URL. Try adding a number or making it more specific.'
  },
  SLUG_RESERVED: (slug: string): ErrorWithRecovery => ({
    message: `"${slug}" is a reserved URL and cannot be used`,
    recovery: 'Please choose a different URL. This one is reserved for system use.'
  }),
  
  // File validation
  INVALID_FILE_TYPE: {
    message: 'Invalid file type.',
    recovery: 'Please use a JPEG, PNG, or WebP image file.'
  },
  FILE_TOO_LARGE: (maxSize: string): ErrorWithRecovery => ({
    message: `File too large. Maximum size is ${maxSize}.`,
    recovery: `Please compress your file or choose a smaller one (under ${maxSize}).`
  }),
  
  // Uniqueness
  ALREADY_EXISTS: (entity: string): ErrorWithRecovery => ({
    message: `A ${entity} with this name already exists`,
    recovery: `Please choose a different name for your ${entity.toLowerCase()}.`
  }),
  DUPLICATE_ENTRY: (field: string): ErrorWithRecovery => ({
    message: `This ${field} is already in use`,
    recovery: `Please enter a different ${field.toLowerCase()}.`
  }),
} as const

// ----------------------------------------------------------------------------
// Entity-Specific Errors
// ----------------------------------------------------------------------------

export const ENTITY_ERRORS = {
  // Portfolio
  PORTFOLIO_NOT_FOUND: {
    message: 'Portfolio not found',
    recovery: 'The portfolio may have been deleted or the URL is incorrect. Check the address and try again.'
  },
  PORTFOLIO_SLUG_TAKEN: {
    message: 'This portfolio URL is already taken',
    recovery: 'Please choose a unique URL for your portfolio.'
  },
  
  // Project
  PROJECT_NOT_FOUND: {
    message: 'Project not found',
    recovery: 'This project may have been moved or deleted. Return to the projects list to continue.'
  },
  PROJECT_TITLE_REQUIRED: {
    message: 'Project title is required',
    recovery: 'Please enter a title for your project.'
  },
  
  // Category
  CATEGORY_NOT_FOUND: {
    message: 'Category not found',
    recovery: 'This category may have been deleted. Return to the categories list.'
  },
  CATEGORY_NAME_REQUIRED: {
    message: 'Category name is required',
    recovery: 'Please enter a name for the category.'
  },
  CATEGORY_HAS_PROJECTS: {
    message: 'Cannot delete category with existing projects',
    recovery: 'Move or delete all projects in this category first, then try again.'
  },
  
  // Page
  PAGE_NOT_FOUND: {
    message: 'Page not found',
    recovery: 'This page may have been deleted or the URL is incorrect. Check the address or return home.'
  },
  PAGE_TITLE_REQUIRED: {
    message: 'Page title is required',
    recovery: 'Please enter a title for the page.'
  },
  PAGE_SLUG_TAKEN: {
    message: 'A page with this URL already exists',
    recovery: 'Please choose a different URL for your page.'
  },
  
  // Asset/Image
  ASSET_NOT_FOUND: {
    message: 'Asset not found',
    recovery: 'This file may have been deleted. Try uploading a new one.'
  },
  UPLOAD_FAILED: {
    message: 'Failed to upload file.',
    recovery: 'Please check your file and try again. Ensure it meets the size and format requirements.'
  },
  
  // Section
  SECTION_NOT_FOUND: {
    message: 'Section not found',
    recovery: 'This section may have been removed. Refresh the page to see the latest content.'
  },
} as const

// ----------------------------------------------------------------------------
// Type exports for type-safe usage
// ----------------------------------------------------------------------------

export type ApiError = typeof API_ERRORS
export type ValidationError = typeof VALIDATION_ERRORS
export type EntityError = typeof ENTITY_ERRORS
