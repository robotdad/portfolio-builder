'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ============================================================================
// Types
// ============================================================================

/**
 * Featured image data from API response
 */
interface FeaturedImage {
  id: string
  url: string
  thumbnailUrl: string
  altText: string
}

/**
 * Category data structure from API
 */
export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  order: number
  featuredImageId: string | null
  featuredImage: FeaturedImage | null
  _count: {
    projects: number
    children: number
  }
}

/**
 * Data for creating a new category
 */
export interface CreateCategoryData {
  name: string
  description?: string
  featuredImageId?: string
}

/**
 * Data for updating a category
 */
export interface UpdateCategoryData {
  name?: string
  description?: string
  featuredImageId?: string | null
}

/**
 * Return type for useCategories hook
 */
export interface UseCategoriesReturn {
  /** List of categories */
  categories: Category[]
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Create a new category */
  createCategory: (data: CreateCategoryData) => Promise<Category>
  /** Update an existing category */
  updateCategory: (id: string, data: UpdateCategoryData) => Promise<Category>
  /** Delete a category */
  deleteCategory: (id: string) => Promise<boolean>
  /** Reorder categories (optimistic update) */
  reorderCategories: (categoryIds: string[]) => Promise<void>
  /** Refresh categories from API */
  refreshCategories: () => Promise<void>
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for managing categories in a portfolio.
 *
 * Provides CRUD operations with optimistic updates for better UX.
 * Categories are automatically sorted by order.
 *
 * @param portfolioId - The portfolio ID to manage categories for
 */
export function useCategories(portfolioId: string): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Track mounted state to prevent state updates after unmount
  const isMountedRef = useRef(true)

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    if (!portfolioId) {
      setCategories([])
      setIsLoading(false)
      return
    }

    try {
      setError(null)
      const response = await fetch(`/api/categories?portfolioId=${portfolioId}`)
      const result = await response.json()

      if (!isMountedRef.current) return

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch categories')
      }

      setCategories(result.data)
    } catch (err) {
      if (!isMountedRef.current) return
      const message = err instanceof Error ? err.message : 'Failed to fetch categories'
      setError(message)
      console.error('Error fetching categories:', err)
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
    fetchCategories()

    return () => {
      isMountedRef.current = false
    }
  }, [fetchCategories])

  // Create a new category
  const createCategory = useCallback(
    async (data: CreateCategoryData): Promise<Category> => {
      setError(null)

      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioId,
          name: data.name,
          description: data.description,
          featuredImageId: data.featuredImageId,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        const errorMessage = result.error || 'Failed to create category'
        setError(errorMessage)
        throw new Error(errorMessage)
      }

      // Add new category with _count (API may not return it for creates)
      const newCategory: Category = {
        ...result.data,
        _count: result.data._count || { projects: 0 },
      }

      if (isMountedRef.current) {
        setCategories((prev) => [...prev, newCategory].sort((a, b) => a.order - b.order))
      }

      return newCategory
    },
    [portfolioId]
  )

  // Update an existing category
  const updateCategory = useCallback(
    async (id: string, data: UpdateCategoryData): Promise<Category> => {
      setError(null)

      // Store previous state for rollback
      const previousCategories = categories

      // Optimistic update
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? { ...cat, ...data } : cat))
      )

      try {
        const response = await fetch(`/api/admin/categories/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to update category')
        }

        // Update with server response (includes generated slug, etc.)
        const updatedCategory: Category = {
          ...result.data,
          _count: result.data._count || previousCategories.find((c) => c.id === id)?._count || { projects: 0 },
        }

        if (isMountedRef.current) {
          setCategories((prev) =>
            prev
              .map((cat) => (cat.id === id ? updatedCategory : cat))
              .sort((a, b) => a.order - b.order)
          )
        }

        return updatedCategory
      } catch (err) {
        // Rollback on error
        if (isMountedRef.current) {
          setCategories(previousCategories)
          const message = err instanceof Error ? err.message : 'Failed to update category'
          setError(message)
        }
        throw err
      }
    },
    [categories]
  )

  // Delete a category
  const deleteCategory = useCallback(
    async (id: string): Promise<boolean> => {
      setError(null)

      // Store previous state for rollback
      const previousCategories = categories

      // Optimistic update
      setCategories((prev) => prev.filter((cat) => cat.id !== id))

      try {
        const response = await fetch(`/api/admin/categories/${id}`, {
          method: 'DELETE',
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to delete category')
        }

        return true
      } catch (err) {
        // Rollback on error
        if (isMountedRef.current) {
          setCategories(previousCategories)
          const message = err instanceof Error ? err.message : 'Failed to delete category'
          setError(message)
        }
        throw err
      }
    },
    [categories]
  )

  // Reorder categories
  const reorderCategories = useCallback(
    async (categoryIds: string[]): Promise<void> => {
      setError(null)

      // Store previous state for rollback
      const previousCategories = categories

      // Optimistic update - reorder locally based on new order
      const reorderedCategories = categoryIds
        .map((id, index) => {
          const category = categories.find((c) => c.id === id)
          return category ? { ...category, order: index } : null
        })
        .filter((c): c is Category => c !== null)

      setCategories(reorderedCategories)

      try {
        const response = await fetch('/api/admin/categories/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categoryIds }),
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to reorder categories')
        }

        // Server confirmed - keep optimistic state
      } catch (err) {
        // Rollback on error
        if (isMountedRef.current) {
          setCategories(previousCategories)
          const message = err instanceof Error ? err.message : 'Failed to reorder categories'
          setError(message)
        }
        throw err
      }
    },
    [categories]
  )

  // Refresh categories from API
  const refreshCategories = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    await fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    refreshCategories,
  }
}
