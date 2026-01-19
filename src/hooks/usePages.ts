'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ============================================================================
// Types
// ============================================================================

/**
 * Page data structure from API
 */
export interface Page {
  id: string
  portfolioId: string
  title: string
  slug: string
  navOrder: number
  isHomepage: boolean
  showInNav: boolean
  draftContent: string | null
  publishedContent: string | null
  lastPublishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Data for creating a new page
 */
export interface CreatePageData {
  title: string
  slug?: string
  isHomepage?: boolean
  showInNav?: boolean
  draftContent?: string
}

/**
 * Data for updating a page
 */
export interface UpdatePageData {
  title?: string
  slug?: string
  isHomepage?: boolean
  showInNav?: boolean
  draftContent?: string
}

/**
 * Return type for usePages hook
 */
export interface UsePagesReturn {
  /** List of pages */
  pages: Page[]
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Create a new page */
  createPage: (data: CreatePageData) => Promise<Page>
  /** Update an existing page */
  updatePage: (id: string, data: UpdatePageData) => Promise<Page>
  /** Delete a page */
  deletePage: (id: string) => Promise<boolean>
  /** Reorder pages (optimistic update) */
  reorderPages: (pageIds: string[]) => Promise<void>
  /** Refresh pages from API */
  refreshPages: () => Promise<void>
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for managing pages in a portfolio.
 *
 * Provides CRUD operations with optimistic updates for better UX.
 * Pages are automatically sorted by navOrder.
 *
 * @param portfolioId - The portfolio ID to manage pages for
 */
export function usePages(portfolioId: string): UsePagesReturn {
  const [pages, setPages] = useState<Page[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Track mounted state to prevent state updates after unmount
  const isMountedRef = useRef(true)

  // Fetch pages from API
  const fetchPages = useCallback(async () => {
    if (!portfolioId) {
      setPages([])
      setIsLoading(false)
      return
    }

    try {
      setError(null)
      const response = await fetch(`/api/pages?portfolioId=${portfolioId}`)

      if (!isMountedRef.current) return

      if (!response.ok) {
        throw new Error('Failed to fetch pages')
      }

      const data = await response.json()
      setPages(data)
    } catch (err) {
      if (!isMountedRef.current) return
      const message = err instanceof Error ? err.message : 'Failed to fetch pages'
      setError(message)
      console.error('Error fetching pages:', err)
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [portfolioId])

  // Initial fetch
  useEffect(() => {
    isMountedRef.current = true
    setIsLoading(true)
    fetchPages()

    return () => {
      isMountedRef.current = false
    }
  }, [fetchPages])

  // Create a new page
  const createPage = useCallback(
    async (data: CreatePageData): Promise<Page> => {
      setError(null)

      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioId,
          title: data.title,
          slug: data.slug,
          isHomepage: data.isHomepage,
          showInNav: data.showInNav,
          draftContent: data.draftContent,
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        const errorMessage = result.message || 'Failed to create page'
        setError(errorMessage)
        throw new Error(errorMessage)
      }

      const newPage: Page = await response.json()

      if (isMountedRef.current) {
        setPages((prev) => [...prev, newPage].sort((a, b) => a.navOrder - b.navOrder))
      }

      return newPage
    },
    [portfolioId]
  )

  // Update an existing page
  const updatePage = useCallback(
    async (id: string, data: UpdatePageData): Promise<Page> => {
      setError(null)

      // Store previous state for rollback
      const previousPages = pages

      // Optimistic update
      setPages((prev) =>
        prev.map((page) => (page.id === id ? { ...page, ...data } : page))
      )

      try {
        const response = await fetch(`/api/pages/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const result = await response.json()
          throw new Error(result.message || 'Failed to update page')
        }

        const updatedPage: Page = await response.json()

        if (isMountedRef.current) {
          setPages((prev) =>
            prev
              .map((page) => (page.id === id ? updatedPage : page))
              .sort((a, b) => a.navOrder - b.navOrder)
          )
        }

        return updatedPage
      } catch (err) {
        // Rollback on error
        if (isMountedRef.current) {
          setPages(previousPages)
          const message = err instanceof Error ? err.message : 'Failed to update page'
          setError(message)
        }
        throw err
      }
    },
    [pages]
  )

  // Delete a page
  const deletePage = useCallback(
    async (id: string): Promise<boolean> => {
      setError(null)

      // Store previous state for rollback
      const previousPages = pages

      // Optimistic update
      setPages((prev) => prev.filter((page) => page.id !== id))

      try {
        const response = await fetch(`/api/pages/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const result = await response.json()
          throw new Error(result.message || 'Failed to delete page')
        }

        return true
      } catch (err) {
        // Rollback on error
        if (isMountedRef.current) {
          setPages(previousPages)
          const message = err instanceof Error ? err.message : 'Failed to delete page'
          setError(message)
        }
        throw err
      }
    },
    [pages]
  )

  // Reorder pages
  const reorderPages = useCallback(
    async (pageIds: string[]): Promise<void> => {
      setError(null)

      // Store previous state for rollback
      const previousPages = pages

      // Optimistic update - reorder locally based on new order
      const reorderedPages = pageIds
        .map((id, index) => {
          const page = pages.find((p) => p.id === id)
          return page ? { ...page, navOrder: index } : null
        })
        .filter((p): p is Page => p !== null)

      setPages(reorderedPages)

      try {
        const response = await fetch('/api/pages/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ portfolioId, pageIds }),
        })

        if (!response.ok) {
          const result = await response.json()
          throw new Error(result.message || 'Failed to reorder pages')
        }

        // Server confirmed - keep optimistic state
      } catch (err) {
        // Rollback on error
        if (isMountedRef.current) {
          setPages(previousPages)
          const message = err instanceof Error ? err.message : 'Failed to reorder pages'
          setError(message)
        }
        throw err
      }
    },
    [portfolioId, pages]
  )

  // Refresh pages from API
  const refreshPages = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    await fetchPages()
  }, [fetchPages])

  return {
    pages,
    isLoading,
    error,
    createPage,
    updatePage,
    deletePage,
    reorderPages,
    refreshPages,
  }
}
