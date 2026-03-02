import type { StorageAdapter } from './types'

export type { StorageAdapter, StoredImageUrls } from './types'

function detectStorageMode(): 'local' | 'azure' {
  const hasAzureConfig =
    !!process.env.AZURE_STORAGE_CONNECTION_STRING ||
    !!process.env.AZURE_STORAGE_ACCOUNT_NAME
  return hasAzureConfig ? 'azure' : 'local'
}

let storageMode: 'local' | 'azure' | null = null

// Cached adapter (loaded lazily via dynamic import)
let cachedAdapter: StorageAdapter | null = null

/**
 * Get the storage adapter (sync). Requires prior initialization via getStorageAsync().
 * All Next.js API routes should use getStorageAsync() directly.
 */
export function getStorage(): StorageAdapter {
  if (!cachedAdapter) {
    throw new Error(
      'Storage not initialized. Call await getStorageAsync() first.'
    )
  }
  return cachedAdapter
}

/**
 * Initialize and return the storage adapter.
 * Both local and azure adapters are loaded via dynamic import to prevent
 * Turbopack from statically analyzing filesystem path patterns in local.ts
 * (which otherwise matches thousands of files in public/uploads/).
 */
export async function getStorageAsync(): Promise<StorageAdapter> {
  const mode = detectStorageMode()

  // Log storage mode on first call or mode change
  if (storageMode !== mode) {
    storageMode = mode
    cachedAdapter = null
    console.log(`[Storage] Using ${mode} storage adapter`)
  }

  if (!cachedAdapter) {
    if (mode === 'azure') {
      const { azureStorageAdapter } = await import('./azure')
      cachedAdapter = azureStorageAdapter
    } else {
      const { localStorageAdapter } = await import('./local')
      cachedAdapter = localStorageAdapter
    }
  }

  return cachedAdapter
}
