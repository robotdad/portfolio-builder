/**
 * Admin API Client
 * 
 * Fetch wrapper for admin API calls with consistent auth error handling.
 * - Always includes credentials
 * - Handles 401 errors with toast + redirect
 * - Provides typed convenience methods
 */

import { showToastStandalone } from '@/components/shared/Toast'

const AUTH_ERROR_TOAST_DURATION = 3000
const AUTH_REDIRECT_DELAY = 1500

/**
 * Handle authentication errors consistently across all admin API calls.
 * Shows a toast notification and redirects to sign-in.
 */
async function handleAuthError(response: Response): Promise<void> {
  if (response.status === 401) {
    showToastStandalone({
      message: 'Session expired. Redirecting to sign in...',
      type: 'error',
      duration: AUTH_ERROR_TOAST_DURATION,
    })
    
    // Delay redirect so user can read the message
    await new Promise(resolve => setTimeout(resolve, AUTH_REDIRECT_DELAY))
    
    const callbackUrl = encodeURIComponent(window.location.pathname)
    window.location.href = `/auth/signin?callbackUrl=${callbackUrl}`
    
    // Throw to prevent further processing
    throw new Error('Session expired')
  }
}

/**
 * Fetch wrapper for admin API calls.
 * - Always includes credentials: 'include'
 * - Handles 401 errors with toast + redirect
 * - Returns standard Response for caller to handle other cases
 */
export async function adminFetch(
  url: string,
  options: Omit<RequestInit, 'credentials'> = {}
): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
  })
  
  await handleAuthError(response)
  
  return response
}

/**
 * POST JSON to admin API endpoint.
 */
export async function adminPost(url: string, body: unknown): Promise<Response> {
  return adminFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/**
 * PUT JSON to admin API endpoint.
 */
export async function adminPut(url: string, body: unknown): Promise<Response> {
  return adminFetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/**
 * PATCH JSON to admin API endpoint.
 */
export async function adminPatch(url: string, body: unknown): Promise<Response> {
  return adminFetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/**
 * DELETE admin API endpoint.
 */
export async function adminDelete(url: string): Promise<Response> {
  return adminFetch(url, {
    method: 'DELETE',
  })
}
