// ============================================================================
// Messages Module - Barrel Export
// ============================================================================

export * from './errors'
export * from './success'

// Re-export common patterns for convenience
export { API_ERRORS, VALIDATION_ERRORS, ENTITY_ERRORS } from './errors'
export { SUCCESS_MESSAGES } from './success'
