// ============================================================================
// Standardized API Response Helpers
// ============================================================================
// Use these helpers for consistent API responses across all routes.
// ============================================================================

import { NextResponse } from 'next/server'
import { API_ERRORS } from '@/lib/messages'

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR'

export interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export interface ApiErrorResponse {
  success: false
  error: string
  code: ApiErrorCode
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// ----------------------------------------------------------------------------
// Success Helpers
// ----------------------------------------------------------------------------

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function apiCreated<T>(data: T) {
  return apiSuccess(data, 201)
}

// ----------------------------------------------------------------------------
// Error Helpers
// ----------------------------------------------------------------------------

export function apiError(
  message: string,
  code: ApiErrorCode,
  status: number
) {
  return NextResponse.json(
    { success: false, error: message, code },
    { status }
  )
}

export function apiNotFound(entity: string) {
  return apiError(
    API_ERRORS.NOT_FOUND(entity),
    'NOT_FOUND',
    404
  )
}

export function apiValidationError(message: string) {
  return apiError(message, 'VALIDATION_ERROR', 400)
}

export function apiConflict(message: string) {
  return apiError(message, 'CONFLICT', 409)
}

export function apiUnauthorized(message: string = API_ERRORS.UNAUTHORIZED) {
  return apiError(message, 'UNAUTHORIZED', 401)
}

export function apiForbidden(message = 'Forbidden') {
  return apiError(message, 'FORBIDDEN', 403)
}

export function apiInternalError(message: string = API_ERRORS.INTERNAL_ERROR) {
  return apiError(message, 'INTERNAL_ERROR', 500)
}

// ----------------------------------------------------------------------------
// Generic error handler for catch blocks
// ----------------------------------------------------------------------------

export function handleApiError(error: unknown, entity: string) {
  console.error(`API Error (${entity}):`, error)
  
  if (error instanceof Error) {
    // Could add specific error type handling here
    return apiInternalError(error.message)
  }
  
  return apiInternalError(API_ERRORS.FETCH_FAILED(entity))
}
