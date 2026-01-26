'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ============================================================================
// Types
// ============================================================================

/**
 * Featured image data from API response
 */
export interface FeaturedImage {
  id: string
  url: string
  thumbnailUrl: string
  altText: string | null
}

/**
 * Project data structure from API
 */
export interface Project {
  id: string
  title: string
  slug: string
  year: string | null
  venue: string | null
  role: string | null
  description: string | null
  order: number
  isFeatured: boolean
  categoryId: string
  featuredImageId: string | null
  featuredImage: FeaturedImage | null
  createdAt: string
  updatedAt: string
}

/**
 * Data for creating a new project
 */
export interface CreateProjectData {
  categoryId: string
  title: string
  year?: string
  venue?: string
  role?: string
  description?: string
  isFeatured?: boolean
  featuredImageId?: string
}

/**
 * Data for updating a project
 */
export interface UpdateProjectData {
  title?: string
  year?: string | null
  venue?: string | null
  role?: string | null
  description?: string | null
  isFeatured?: boolean
  featuredImageId?: string | null
}

/**
 * Return type for useProjects hook
 */
export interface UseProjectsReturn {
  /** List of projects */
  projects: Project[]
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Create a new project */
  createProject: (data: CreateProjectData) => Promise<Project>
  /** Update an existing project */
  updateProject: (id: string, data: UpdateProjectData) => Promise<Project>
  /** Delete a project */
  deleteProject: (id: string) => Promise<boolean>
  /** Reorder projects (optimistic update) */
  reorderProjects: (projectIds: string[]) => Promise<void>
  /** Refresh projects from API */
  refreshProjects: () => Promise<void>
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for managing projects in a category.
 *
 * Provides CRUD operations with optimistic updates for better UX.
 * Projects are automatically sorted by order.
 *
 * @param categoryId - The category ID to manage projects for
 */
export function useProjects(categoryId: string): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Track mounted state to prevent state updates after unmount
  const isMountedRef = useRef(true)

  // Fetch projects from API
  const fetchProjects = useCallback(async () => {
    if (!categoryId) {
      setProjects([])
      setIsLoading(false)
      return
    }

    try {
      setError(null)
      const response = await fetch(`/api/projects?categoryId=${categoryId}`)
      const result = await response.json()

      if (!isMountedRef.current) return

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch projects')
      }

      setProjects(result.data)
    } catch (err) {
      if (!isMountedRef.current) return
      const message = err instanceof Error ? err.message : 'Failed to fetch projects'
      setError(message)
      console.error('Error fetching projects:', err)
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [categoryId])

  // Initial fetch
  useEffect(() => {
    isMountedRef.current = true
    setIsLoading(true)
    fetchProjects()

    return () => {
      isMountedRef.current = false
    }
  }, [fetchProjects])

  // Create a new project
  const createProject = useCallback(
    async (data: CreateProjectData): Promise<Project> => {
      setError(null)

      const response = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: data.categoryId,
          title: data.title,
          year: data.year,
          venue: data.venue,
          role: data.role,
          description: data.description,
          isFeatured: data.isFeatured,
          featuredImageId: data.featuredImageId,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        const errorMessage = result.error || 'Failed to create project'
        setError(errorMessage)
        throw new Error(errorMessage)
      }

      if (isMountedRef.current) {
        setProjects((prev) => [...prev, result.data].sort((a, b) => a.order - b.order))
      }

      return result.data
    },
    []
  )

  // Update an existing project
  const updateProject = useCallback(
    async (id: string, data: UpdateProjectData): Promise<Project> => {
      setError(null)

      // Store previous state for rollback
      const previousProjects = projects

      // Optimistic update
      setProjects((prev) =>
        prev.map((proj) => (proj.id === id ? { ...proj, ...data } : proj))
      )

      try {
        const response = await fetch(`/api/admin/projects/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to update project')
        }

        // Update with server response (includes generated slug, etc.)
        if (isMountedRef.current) {
          setProjects((prev) =>
            prev
              .map((proj) => (proj.id === id ? result.data : proj))
              .sort((a, b) => a.order - b.order)
          )
        }

        return result.data
      } catch (err) {
        // Rollback on error
        if (isMountedRef.current) {
          setProjects(previousProjects)
          const message = err instanceof Error ? err.message : 'Failed to update project'
          setError(message)
        }
        throw err
      }
    },
    [projects]
  )

  // Delete a project
  const deleteProject = useCallback(
    async (id: string): Promise<boolean> => {
      setError(null)

      // Store previous state for rollback
      const previousProjects = projects

      // Optimistic update
      setProjects((prev) => prev.filter((proj) => proj.id !== id))

      try {
        const response = await fetch(`/api/admin/projects/${id}`, {
          method: 'DELETE',
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to delete project')
        }

        return true
      } catch (err) {
        // Rollback on error
        if (isMountedRef.current) {
          setProjects(previousProjects)
          const message = err instanceof Error ? err.message : 'Failed to delete project'
          setError(message)
        }
        throw err
      }
    },
    [projects]
  )

  // Reorder projects
  const reorderProjects = useCallback(
    async (projectIds: string[]): Promise<void> => {
      setError(null)

      // Store previous state for rollback
      const previousProjects = projects

      // Optimistic update - reorder locally based on new order
      const reorderedProjects = projectIds
        .map((id, index) => {
          const project = projects.find((p) => p.id === id)
          return project ? { ...project, order: index } : null
        })
        .filter((p): p is Project => p !== null)

      setProjects(reorderedProjects)

      try {
        const response = await fetch('/api/admin/projects/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectIds }),
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to reorder projects')
        }

        // Server confirmed - keep optimistic state
      } catch (err) {
        // Rollback on error
        if (isMountedRef.current) {
          setProjects(previousProjects)
          const message = err instanceof Error ? err.message : 'Failed to reorder projects'
          setError(message)
        }
        throw err
      }
    },
    [projects]
  )

  // Refresh projects from API
  const refreshProjects = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    await fetchProjects()
  }, [fetchProjects])

  return {
    projects,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    reorderProjects,
    refreshProjects,
  }
}
