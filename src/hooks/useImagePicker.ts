import { useState, useEffect, useCallback, useMemo } from 'react'
import type { SiteImage, PageSummary, ImagePickerState } from '@/lib/types/image-picker'

interface UseImagePickerOptions {
  /** Portfolio ID to fetch images for */
  portfolioId: string
  /** Initially selected image ID */
  initialSelectedId?: string
  /** Minimum image width filter */
  minWidth?: number
  /** Minimum image height filter */
  minHeight?: number
}

interface UseImagePickerReturn {
  /** Current state */
  state: ImagePickerState
  /** Currently selected image */
  selectedImage: SiteImage | null
  /** Set search query */
  setSearchQuery: (query: string) => void
  /** Set page filter */
  setPageFilter: (pageId: string | null) => void
  /** Select an image */
  selectImage: (id: string | null) => void
  /** Clear all filters */
  clearFilters: () => void
  /** Refresh images from API */
  refresh: () => Promise<void>
  /** Currently focused grid index for keyboard nav */
  focusedIndex: number
  /** Set focused index */
  setFocusedIndex: (index: number) => void
}

/**
 * Hook for managing image picker state and data fetching.
 *
 * Handles:
 * - Fetching images from API
 * - Client-side search filtering
 * - Page/category filtering
 * - Selection state
 * - Keyboard navigation index
 */
export function useImagePicker({
  portfolioId,
  initialSelectedId,
  minWidth,
  minHeight,
}: UseImagePickerOptions): UseImagePickerReturn {
  const [images, setImages] = useState<SiteImage[]>([])
  const [pages, setPages] = useState<PageSummary[]>([])
  const [status, setStatus] = useState<ImagePickerState['status']>('loading')
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId || null)
  const [searchQuery, setSearchQuery] = useState('')
  const [pageFilter, setPageFilter] = useState<string | null>(null)
  const [focusedIndex, setFocusedIndex] = useState(0)

  // Fetch images from API
  const fetchImages = useCallback(async () => {
    setStatus('loading')
    try {
      const params = new URLSearchParams({ portfolioId })
      if (minWidth) params.set('minWidth', minWidth.toString())
      if (minHeight) params.set('minHeight', minHeight.toString())

      const response = await fetch(`/api/images?${params}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch images')
      }

      const data = result.data
      setImages(data.images)
      setPages(data.pages)
      setStatus(data.images.length === 0 ? 'empty' : 'populated')
    } catch (error) {
      console.error('Error fetching images:', error)
      setImages([])
      setPages([])
      setStatus('empty')
    }
  }, [portfolioId, minWidth, minHeight])

  // Initial fetch
  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  // Filter images based on search and page filter
  const filteredImages = useMemo(() => {
    let result = images

    // Apply page filter
    if (pageFilter) {
      result = result.filter((img) => img.source.pageId === pageFilter)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter((img) => {
        const searchableText = [
          img.filename,
          img.meta.alt,
          img.source.pageTitle,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return searchableText.includes(query)
      })
    }

    return result
  }, [images, searchQuery, pageFilter])

  // Determine status based on filters
  const currentStatus = useMemo((): ImagePickerState['status'] => {
    if (status === 'loading') return 'loading'
    if (images.length === 0) return 'empty'
    if (filteredImages.length === 0) return 'no-results'
    return 'populated'
  }, [status, images.length, filteredImages.length])

  // Reset focused index when filtered images change
  useEffect(() => {
    setFocusedIndex(0)
  }, [filteredImages.length])

  // Get selected image object
  const selectedImage = useMemo(() => {
    if (!selectedId) return null
    return images.find((img) => img.id === selectedId) || null
  }, [images, selectedId])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setPageFilter(null)
  }, [])

  const selectImage = useCallback((id: string | null) => {
    setSelectedId(id)
  }, [])

  const state: ImagePickerState = {
    status: currentStatus,
    images,
    filteredImages,
    selectedId,
    searchQuery,
    pageFilter,
    pages,
  }

  return {
    state,
    selectedImage,
    setSearchQuery,
    setPageFilter,
    selectImage,
    clearFilters,
    refresh: fetchImages,
    focusedIndex,
    setFocusedIndex,
  }
}
