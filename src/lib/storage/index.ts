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

export function getStorage(): StorageAdapter {
  const mode = detectStorageMode()

  // Log storage mode on first call (helpful for debugging)
  if (storageMode !== mode) {
    storageMode = mode
    console.log(`[Storage] Using ${mode} storage adapter`)
  }

  if (mode === 'azure') {
    // Lazy load Azure adapter to avoid importing SDK when not needed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { azureStorageAdapter } = require('./azure')
    return azureStorageAdapter
  }

  return localStorageAdapter
}
