import type { StorageAdapter } from './types'
import { localStorageAdapter } from './local'

export type { StorageAdapter, StoredImageUrls } from './types'

function detectStorageMode(): 'local' | 'azure' {
  const hasAzureConfig =
    !!process.env.AZURE_STORAGE_CONNECTION_STRING ||
    !!process.env.AZURE_STORAGE_ACCOUNT_NAME
  return hasAzureConfig ? 'azure' : 'local'
}

let storageMode: 'local' | 'azure' | null = null

// Cached Azure adapter (loaded lazily)
let azureAdapter: StorageAdapter | null = null

export function getStorage(): StorageAdapter {
  const mode = detectStorageMode()

  // Log storage mode on first call (helpful for debugging)
  if (storageMode !== mode) {
    storageMode = mode
    console.log(`[Storage] Using ${mode} storage adapter`)
  }

  if (mode === 'azure') {
    if (!azureAdapter) {
      // This will be set by getStorageAsync() - throw if not initialized
      throw new Error(
        'Azure storage not initialized. Call await getStorageAsync() first in standalone scripts.'
      )
    }
    return azureAdapter
  }

  return localStorageAdapter
}

/**
 * Async version of getStorage() that properly initializes Azure adapter.
 * Use this in standalone scripts (tsx). Next.js routes can use getStorage() directly
 * after calling this once at startup.
 */
export async function getStorageAsync(): Promise<StorageAdapter> {
  const mode = detectStorageMode()

  // Log storage mode on first call (helpful for debugging)
  if (storageMode !== mode) {
    storageMode = mode
    console.log(`[Storage] Using ${mode} storage adapter`)
  }

  if (mode === 'azure') {
    if (!azureAdapter) {
      // Dynamic import for ES modules compatibility
      const { azureStorageAdapter } = await import('./azure')
      azureAdapter = azureStorageAdapter
    }
    return azureAdapter
  }

  return localStorageAdapter
}
