import { useState, useRef, useCallback } from 'react'
import { useToast } from '@/components/shared/Toast'

// ============================================================================
// Types
// ============================================================================

interface UseImageUploadOptions {
  /** Called when upload starts - receives local preview URL */
  onOptimisticUpdate: (previewUrl: string) => void
  /** Called when upload completes successfully - receives server asset */
  onSuccess: (asset: { id: string; url: string }) => void
  /** Called when user clicks undo - receives previous image URL */
  onUndo: (previousUrl: string | undefined) => void
  /** Called on error */
  onError?: (error: string) => void
  /** Portfolio ID for the upload */
  portfolioId: string
  /** Context for success message (profile, gallery, featured, hero) */
  context: 'profile' | 'gallery' | 'featured' | 'hero'
  /** Current image URL (for undo) */
  currentImageUrl?: string
  /** Undo timeout in ms */
  undoTimeout?: number // default 5000
}

interface UseImageUploadReturn {
  /** Trigger file upload */
  uploadFile: (file: File) => Promise<void>
  /** Current upload state */
  isUploading: boolean
  /** Upload progress 0-100 */
  progress: number
  /** Current error message */
  error: string | null
  /** Retry the last failed upload */
  retry: () => Promise<void>
  /** Clear error state */
  clearError: () => void
}

// ============================================================================
// Constants
// ============================================================================

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

const CONTEXT_MESSAGES: Record<UseImageUploadOptions['context'], string> = {
  profile: 'Profile photo updated',
  gallery: 'Image added',
  featured: 'Featured image updated',
  hero: 'Hero image updated',
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useImageUpload({
  onOptimisticUpdate,
  onSuccess,
  onUndo,
  onError,
  portfolioId,
  context,
  currentImageUrl,
  undoTimeout = 5000,
}: UseImageUploadOptions): UseImageUploadReturn {
  const { showToast } = useToast()

  // State
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Refs for tracking state across async operations
  const previousUrlRef = useRef<string | undefined>(undefined)
  const previewUrlRef = useRef<string | null>(null)
  const failedFileRef = useRef<File | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  // Cleanup function for progress simulation
  const cleanupProgress = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }, [])

  // Cleanup preview URL to prevent memory leaks
  const cleanupPreviewUrl = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
  }, [])

  // Validate file before upload
  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type. Allowed: JPEG, PNG, WebP, HEIC, HEIF`
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File too large. Maximum size: 10MB`
    }
    return null
  }, [])

  // Simulate progress since fetch doesn't support it
  const simulateProgress = useCallback(() => {
    cleanupProgress()
    setProgress(0)

    const startTime = Date.now()
    const duration = 2000 // 2 seconds to reach 90%

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progressPercent = Math.min(90, (elapsed / duration) * 90)
      setProgress(Math.round(progressPercent))

      if (progressPercent >= 90) {
        cleanupProgress()
      }
    }, 50)
  }, [cleanupProgress])

  // Clear error state
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Main upload function
  const uploadFile = useCallback(async (file: File): Promise<void> => {
    // Validate file first
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      onError?.(validationError)
      return
    }

    // Store previous URL for potential undo
    previousUrlRef.current = currentImageUrl
    failedFileRef.current = null
    setError(null)
    setIsUploading(true)

    // Create local preview URL for optimistic update
    cleanupPreviewUrl()
    const previewUrl = URL.createObjectURL(file)
    previewUrlRef.current = previewUrl

    // Trigger optimistic update immediately
    onOptimisticUpdate(previewUrl)

    // Start progress simulation
    simulateProgress()

    try {
      // Prepare form data for upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('portfolioId', portfolioId)
      formData.append('context', context)

      // Perform the actual upload
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!isMountedRef.current) return

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Upload failed: ${response.status}`)
      }

      const asset = await response.json()

      // Complete progress
      cleanupProgress()
      setProgress(100)
      setIsUploading(false)

      // Call success callback
      onSuccess(asset)

      // Clean up preview URL since we now have the server URL
      cleanupPreviewUrl()

      // Show success toast with undo action
      const previousUrl = previousUrlRef.current
      showToast({
        message: CONTEXT_MESSAGES[context],
        type: 'success',
        duration: undoTimeout,
        action: {
          label: 'Undo',
          onClick: () => {
            onUndo(previousUrl)
          },
        },
      })
    } catch (err) {
      if (!isMountedRef.current) return

      // Handle error
      cleanupProgress()
      setProgress(0)
      setIsUploading(false)

      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      onError?.(errorMessage)

      // Store failed file for retry
      failedFileRef.current = file

      // Revert to previous image
      onUndo(previousUrlRef.current)

      // Clean up preview URL
      cleanupPreviewUrl()

      // Show error toast with retry action
      showToast({
        message: errorMessage,
        type: 'error',
        action: {
          label: 'Retry',
          onClick: () => {
            if (failedFileRef.current) {
              uploadFile(failedFileRef.current)
            }
          },
        },
      })
    }
  }, [
    validateFile,
    currentImageUrl,
    cleanupPreviewUrl,
    onOptimisticUpdate,
    simulateProgress,
    portfolioId,
    context,
    cleanupProgress,
    onSuccess,
    showToast,
    undoTimeout,
    onUndo,
    onError,
  ])

  // Retry the last failed upload
  const retry = useCallback(async (): Promise<void> => {
    if (failedFileRef.current) {
      await uploadFile(failedFileRef.current)
    }
  }, [uploadFile])

  return {
    uploadFile,
    isUploading,
    progress,
    error,
    retry,
    clearError,
  }
}
