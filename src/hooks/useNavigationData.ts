'use client'

import { useState, useEffect, useRef } from 'react'

// ============================================================================
// Types
// ============================================================================

/**
 * Page data structure from API
 */
export interface Page {
  id: string
  title: string
  slug: string
  isHomepage: boolean
  order: number
}

/**
 * Project data for navigation tree
 */
export interface Project {
  id: string
  title: string
  slug: string
}

/**
 * Category with projects for expandable navigation tree
 */
export interface CategoryWithProjects {
  id: string
  name: string
  slug: string
  _count: { projects: number }
  projects?: Project[]
}

/**
 * Return type for useNavigationData hook
 */
export interface NavigationData {
  /** List of pages */
  pages: Page[]
  /** List of categories with their projects */
  categories: CategoryWithProjects[]
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for fetching navigation data for the admin interface.
 *
 * Fetches portfolio first, then pages and categories in parallel.
 * For categories with projects, also fetches the projects for the expandable tree.
 *
 * @returns Navigation data including pages and categories with projects
 */
export function useNavigationData(): NavigationData {
  const [pages, setPages] = useState<Page[]>([])
  const [categories, setCategories] = useState<CategoryWithProjects[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Track mounted state to prevent state updates after unmount
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    async function fetchNavigationData() {
      try {
        setError(null)

        // Step 1: Fetch portfolio to get portfolioId
        const portfolioResponse = await fetch('/api/portfolio')

        if (!portfolioResponse.ok) {
          throw new Error('Failed to fetch portfolio')
        }

        const portfolio = await portfolioResponse.json()

        if (!isMountedRef.current) return

        if (!portfolio) {
          throw new Error('No portfolio found')
        }

        const portfolioId = portfolio.id

        // Step 2: Fetch pages and categories in parallel
        const [pagesResponse, categoriesResponse] = await Promise.all([
          fetch(`/api/pages?portfolioId=${portfolioId}`),
          fetch(`/api/categories?portfolioId=${portfolioId}`),
        ])

        if (!pagesResponse.ok) {
          throw new Error('Failed to fetch pages')
        }
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories')
        }

        const pagesData = await pagesResponse.json()
        const categoriesResult = await categoriesResponse.json()

        if (!isMountedRef.current) return

        // Pages API returns raw array
        const pages: Page[] = Array.isArray(pagesData) ? pagesData : []

        // Categories API returns { success, data } wrapper
        if (!categoriesResult.success) {
          throw new Error(categoriesResult.error || 'Failed to fetch categories')
        }

        // Set pages
        setPages(pages)

        // Step 3: For each category with projects, fetch the projects
        const categoriesData: CategoryWithProjects[] = categoriesResult.data

        // Fetch projects for categories that have them
        const categoriesWithProjects = await Promise.all(
          categoriesData.map(async (category) => {
            if (category._count.projects > 0) {
              try {
                const projectsResponse = await fetch(
                  `/api/projects?categoryId=${category.id}`
                )
                const projectsResult = await projectsResponse.json()

                if (projectsResult.success) {
                  return {
                    ...category,
                    projects: projectsResult.data.map((p: Project) => ({
                      id: p.id,
                      title: p.title,
                      slug: p.slug,
                    })),
                  }
                }
              } catch {
                // If fetching projects fails, return category without projects
                console.error(`Failed to fetch projects for category ${category.id}`)
              }
            }
            return category
          })
        )

        if (!isMountedRef.current) return

        setCategories(categoriesWithProjects)
      } catch (err) {
        if (!isMountedRef.current) return
        const message = err instanceof Error ? err.message : 'Failed to fetch navigation data'
        setError(message)
        console.error('Error fetching navigation data:', err)
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false)
        }
      }
    }

    fetchNavigationData()

    return () => {
      isMountedRef.current = false
    }
  }, [])

  return {
    pages,
    categories,
    isLoading,
    error,
  }
}

export default useNavigationData
