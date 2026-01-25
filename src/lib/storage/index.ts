import type { StorageAdapter } from './types'
import { localStorageAdapter } from './local'

export type { StorageAdapter, StoredImageUrls } from './types'

function detectStorageMode(): 'local' | 'azure' {
  const hasAzureConfig = !!process.env.AZURE_STORAGE_CONNECTION_STRING ||
                         !!process.env.AZURE_STORAGE_ACCOUNT_NAME
  return hasAzureConfig ? 'azure' : 'local'
}

export function getStorage(): StorageAdapter {
  const mode = detectStorageMode()
  
  if (mode === 'azure') {
    throw new Error(
      'Azure storage configured but not implemented. ' +
      'Remove AZURE_STORAGE_* env vars to use local storage.'
    )
  }
  
  return localStorageAdapter
}
