/**
 * Auth Helper Module for Portfolio Scripts
 * 
 * Provides authentication support for scripts that need to call protected APIs.
 * Uses credentials stored by the auth-login.js script.
 * 
 * Usage:
 *   import { getAuthHeaders, requireAuth } from './lib/auth-helper.js'
 *   
 *   // Option 1: Get headers to add to fetch requests
 *   const headers = await getAuthHeaders()
 *   fetch(url, { headers: { ...headers, 'Content-Type': 'application/json' } })
 *   
 *   // Option 2: Require auth at script start (exits if not authenticated)
 *   await requireAuth()
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

const AUTH_FILE = path.join(os.homedir(), '.portfolio-auth');

// ANSI colors
const colors = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

/**
 * Load stored credentials from auth file
 * @returns {Object|null} Credentials object or null if not found
 */
export function loadCredentials() {
  try {
    if (fs.existsSync(AUTH_FILE)) {
      return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
    }
  } catch {
    // Invalid file, ignore
  }
  return null;
}

/**
 * Check if auth is disabled via environment variable
 * @returns {boolean}
 */
export function isAuthDisabled() {
  return process.env.AUTH_DISABLED === 'true';
}

/**
 * Get authentication headers for API requests
 * 
 * Returns headers with Cookie set if authenticated, or empty object if:
 * - AUTH_DISABLED=true (dev bypass)
 * - No credentials stored (will likely fail, but let API handle it)
 * 
 * @returns {Object} Headers object with Cookie if authenticated
 */
export function getAuthHeaders() {
  // Dev bypass - no auth needed
  if (isAuthDisabled()) {
    return {};
  }
  
  const creds = loadCredentials();
  if (creds?.cookie) {
    return {
      Cookie: creds.cookie,
    };
  }
  
  return {};
}

/**
 * Verify stored credentials are still valid
 * @param {string} apiBase - Base URL for API (e.g., http://localhost:3000/api)
 * @returns {Promise<boolean>}
 */
export async function verifyCredentials(apiBase) {
  const creds = loadCredentials();
  if (!creds?.cookie) {
    return false;
  }
  
  try {
    // Use the stored appBase if available, otherwise use provided apiBase
    const baseUrl = creds.appBase || apiBase.replace('/api', '');
    const response = await fetch(`${baseUrl}/api/portfolio`, {
      headers: {
        Cookie: creds.cookie,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Require authentication before proceeding
 * 
 * Call this at the start of scripts that need auth. It will:
 * - Return immediately if AUTH_DISABLED=true
 * - Return immediately if valid credentials exist
 * - Print helpful error and exit if not authenticated
 * 
 * @param {Object} options
 * @param {string} options.apiBase - Base URL for API validation
 * @param {boolean} options.verify - Whether to verify credentials with API (default: true)
 */
export async function requireAuth(options = {}) {
  const { apiBase = 'http://localhost:3000/api', verify = true } = options;
  
  // Dev bypass
  if (isAuthDisabled()) {
    return;
  }
  
  const creds = loadCredentials();
  
  if (!creds) {
    console.error(colors.red('\n✗ Authentication required'));
    console.error(colors.dim('  No stored credentials found.\n'));
    console.error('  Run: ' + colors.cyan('npm run auth:login'));
    console.error('  Or set: ' + colors.cyan('AUTH_DISABLED=true') + ' for local dev\n');
    process.exit(1);
  }
  
  // Optionally verify credentials are still valid
  if (verify) {
    const valid = await verifyCredentials(apiBase);
    if (!valid) {
      console.error(colors.red('\n✗ Session expired or invalid'));
      console.error(colors.dim('  Please re-authenticate.\n'));
      console.error('  Run: ' + colors.cyan('npm run auth:login\n'));
      process.exit(1);
    }
  }
}

/**
 * Create a fetch wrapper that automatically adds auth headers
 * 
 * @param {string} apiBase - Base URL for API
 * @returns {Function} Wrapped fetch function
 */
export function createAuthenticatedFetch(apiBase) {
  const authHeaders = getAuthHeaders();
  
  return async function authenticatedFetch(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${apiBase}${endpoint}`;
    
    const headers = {
      ...authHeaders,
      ...options.headers,
    };
    
    return fetch(url, {
      ...options,
      headers,
    });
  };
}
