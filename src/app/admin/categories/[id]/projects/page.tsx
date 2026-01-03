'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useProjects, type Project } from '@/hooks/useProjects'
import { ProjectList } from '@/components/admin/ProjectList'
import { ProjectFormModal } from '@/components/admin/ProjectFormModal'
import { DeleteProjectModal } from '@/components/admin/DeleteProjectModal'
import type { ProjectFormData } from '@/components/admin/ProjectForm'

// ============================================================================
// Types
// ============================================================================

interface Category {
  id: string
  name: string
}

// ============================================================================
// Icons
// ============================================================================

function ChevronRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function AlertCircleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  )
}

// ============================================================================
// Skeleton Components
// ============================================================================

function BreadcrumbSkeleton() {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li>
          <span className="skeleton-text" style={{ width: '80px' }} />
        </li>
        <li aria-hidden="true">
          <ChevronRightIcon />
        </li>
        <li>
          <span className="skeleton-text" style={{ width: '120px' }} />
        </li>
        <li aria-hidden="true">
          <ChevronRightIcon />
        </li>
        <li>
          <span className="skeleton-text" style={{ width: '60px' }} />
        </li>
      </ol>

      <style jsx>{`
        .breadcrumb ol {
          display: flex;
          align-items: center;
          gap: 8px;
          list-style: none;
          margin: 0;
          padding: 0;
          font-size: 14px;
        }

        .breadcrumb li {
          display: flex;
          align-items: center;
          color: var(--admin-text-muted, #6b7280);
        }

        .skeleton-text {
          display: inline-block;
          height: 14px;
          background: linear-gradient(
            90deg,
            var(--color-surface-secondary, #f3f4f6) 25%,
            var(--color-surface-tertiary, #e5e7eb) 50%,
            var(--color-surface-secondary, #f3f4f6) 75%
          );
          background-size: 200% 100%;
          border-radius: 4px;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .skeleton-text {
            animation: none;
            background: var(--color-surface-secondary, #f3f4f6);
          }
        }
      `}</style>
    </nav>
  )
}

// ============================================================================
// ProjectsPage Component
// ============================================================================

/**
 * Projects Management Page
 *
 * Admin page for managing projects within a category.
 * Supports creating, editing, deleting, and reordering projects via drag-drop.
 *
 * Route: /admin/categories/[id]/projects
 */
export default function ProjectsPage() {
  const params = useParams()
  const categoryId = params.id as string

  // Portfolio state
  const [portfolioId, setPortfolioId] = useState<string | null>(null)

  // Category state
  const [category, setCategory] = useState<Category | null>(null)
  const [categoryLoading, setCategoryLoading] = useState(true)
  const [categoryError, setCategoryError] = useState<string | null>(null)

  // Projects from hook
  const {
    projects,
    isLoading: projectsLoading,
    error: projectsError,
    createProject,
    deleteProject,
    reorderProjects,
    refreshProjects,
  } = useProjects(categoryId)

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)

  // Operation states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Error display
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Fetch category info (which includes portfolioId)
  useEffect(() => {
    async function loadCategory() {
      if (!categoryId) return

      try {
        setCategoryError(null)
        const response = await fetch(`/api/categories/${categoryId}`)
        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Category not found')
        }

        setCategory({
          id: result.data.id,
          name: result.data.name,
        })
        setPortfolioId(result.data.portfolioId)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load category'
        setCategoryError(message)
        console.error('Error loading category:', err)
      } finally {
        setCategoryLoading(false)
      }
    }

    loadCategory()
  }, [categoryId])

  // Show error with auto-dismiss
  const showError = useCallback((message: string) => {
    setErrorMessage(message)
    setTimeout(() => setErrorMessage(null), 5000)
  }, [])

  // Handle create project
  const handleCreate = async (data: ProjectFormData) => {
    setIsSubmitting(true)
    try {
      await createProject({
        categoryId,
        title: data.title,
        year: data.year,
        venue: data.venue,
        role: data.role,
        description: data.description,
        isFeatured: data.isFeatured,
        featuredImageId: data.featuredImageId ?? undefined,
      })
      setShowCreateModal(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create project'
      showError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete project
  const handleDelete = async () => {
    if (!deletingProject) return

    setIsDeleting(true)
    try {
      await deleteProject(deletingProject.id)
      setDeletingProject(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete project'
      showError(message)
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle reorder
  const handleReorder = (orderedIds: string[]) => {
    reorderProjects(orderedIds).catch((err) => {
      const message = err instanceof Error ? err.message : 'Failed to reorder projects'
      showError(message)
    })
  }

  // Handle close modals
  const handleCloseCreateModal = () => {
    if (!isSubmitting) {
      setShowCreateModal(false)
    }
  }

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setDeletingProject(null)
    }
  }

  // Retry loading
  const handleRetry = () => {
    refreshProjects()
  }

  // Combined loading state
  const isLoading = categoryLoading || projectsLoading

  // Category not found state
  if (!categoryLoading && categoryError) {
    return (
      <div className="projects-page">
        <div className="error-container">
          <div className="error-icon">
            <AlertCircleIcon />
          </div>
          <h2>Category not found</h2>
          <p>{categoryError}</p>
          <Link href="/admin/categories" className="back-button">
            Back to Categories
          </Link>
        </div>

        <style jsx>{`
          .projects-page {
            min-height: 100vh;
            background: var(--admin-bg, #ffffff);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }

          .error-container {
            text-align: center;
            max-width: 400px;
          }

          .error-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 64px;
            height: 64px;
            margin: 0 auto 16px;
            background: var(--admin-error-bg, #fef2f2);
            border-radius: 50%;
            color: var(--admin-error, #dc2626);
          }

          h2 {
            margin: 0 0 8px;
            font-size: 20px;
            font-weight: 600;
            color: var(--admin-text, #111827);
          }

          p {
            margin: 0 0 24px;
            font-size: 14px;
            color: var(--admin-text-muted, #6b7280);
          }

          .back-button {
            display: inline-flex;
            align-items: center;
            padding: 10px 20px;
            background: var(--color-accent, #3b82f6);
            color: white;
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            border-radius: 8px;
            transition: background-color 0.15s;
          }

          .back-button:hover {
            background: var(--color-accent-hover, #2563eb);
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="projects-page">
      {/* Header with Breadcrumb */}
      <header className="page-header">
        {categoryLoading ? (
          <BreadcrumbSkeleton />
        ) : (
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/admin/categories">Categories</Link>
              </li>
              <li aria-hidden="true">
                <ChevronRightIcon />
              </li>
              <li>
                <span className="category-name">{category?.name || 'Category'}</span>
              </li>
              <li aria-hidden="true">
                <ChevronRightIcon />
              </li>
              <li aria-current="page">
                <span>Projects</span>
              </li>
            </ol>
          </nav>
        )}

        <div className="header-row">
          <h1>{category?.name ? `${category.name} Projects` : 'Projects'}</h1>
          <button
            type="button"
            className="create-button"
            onClick={() => setShowCreateModal(true)}
            disabled={isLoading}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>New Project</span>
          </button>
        </div>
      </header>

      {/* Error Toast */}
      {(errorMessage || projectsError) && (
        <div className="error-toast" role="alert">
          <AlertCircleIcon />
          <span>{errorMessage || projectsError}</span>
          {projectsError && (
            <button
              type="button"
              className="retry-button"
              onClick={handleRetry}
              aria-label="Retry loading projects"
            >
              <RefreshIcon />
              Retry
            </button>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="page-content">
        <ProjectList
          projects={projects}
          onCreateClick={() => setShowCreateModal(true)}
          onDeleteClick={(project) => setDeletingProject(project)}
          onReorder={handleReorder}
          isLoading={isLoading}
          categoryName={category?.name || 'this category'}
        />
      </main>

      {/* Create Modal */}
      <ProjectFormModal
        isOpen={showCreateModal}
        portfolioId={portfolioId || ''}
        categoryId={categoryId}
        onSubmit={handleCreate}
        onClose={handleCloseCreateModal}
        isSubmitting={isSubmitting}
      />

      {/* Delete Modal */}
      <DeleteProjectModal
        isOpen={deletingProject !== null}
        projectTitle={deletingProject?.title || ''}
        onConfirm={handleDelete}
        onCancel={handleCloseDeleteModal}
        isDeleting={isDeleting}
      />

      <style jsx>{`
        .projects-page {
          min-height: 100vh;
          background: var(--admin-bg, #ffffff);
        }

        .page-header {
          padding: 16px 24px 0;
          background: var(--admin-bg, #ffffff);
          border-bottom: 1px solid var(--admin-border, #e5e7eb);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        /* Breadcrumb */
        .breadcrumb ol {
          display: flex;
          align-items: center;
          gap: 8px;
          list-style: none;
          margin: 0 0 16px;
          padding: 0;
          font-size: 14px;
        }

        .breadcrumb li {
          display: flex;
          align-items: center;
          color: var(--admin-text-muted, #6b7280);
        }

        .breadcrumb a {
          color: var(--color-accent, #3b82f6);
          text-decoration: none;
          transition: color 0.15s;
        }

        .breadcrumb a:hover {
          text-decoration: underline;
        }

        .breadcrumb .category-name {
          color: var(--admin-text, #111827);
          font-weight: 500;
        }

        .breadcrumb li[aria-current='page'] span {
          color: var(--admin-text-muted, #6b7280);
        }

        /* Header Row */
        .header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding-bottom: 16px;
        }

        .header-row h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: var(--admin-text, #111827);
        }

        .create-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: var(--color-accent, #3b82f6);
          color: white;
          font-size: 14px;
          font-weight: 500;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.15s, transform 0.1s;
        }

        .create-button:hover:not(:disabled) {
          background: var(--color-accent-hover, #2563eb);
        }

        .create-button:active:not(:disabled) {
          transform: scale(0.98);
        }

        .create-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .create-button:focus {
          outline: none;
        }

        .create-button:focus-visible {
          outline: 2px solid var(--color-accent, #3b82f6);
          outline-offset: 2px;
        }

        /* Error Toast */
        .error-toast {
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: 600px;
          margin: 16px auto;
          padding: 12px 16px;
          background: var(--admin-error-bg, #fef2f2);
          color: var(--admin-error, #dc2626);
          border: 1px solid var(--admin-error-border, #fecaca);
          border-radius: 8px;
          font-size: 14px;
          animation: slideIn 0.2s ease-out;
        }

        .error-toast span {
          flex: 1;
        }

        .retry-button {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: transparent;
          color: var(--admin-error, #dc2626);
          font-size: 13px;
          font-weight: 500;
          border: 1px solid var(--admin-error-border, #fecaca);
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.15s;
        }

        .retry-button:hover {
          background: rgba(220, 38, 38, 0.1);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Main Content */
        .page-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        /* Mobile Styles */
        @media (max-width: 767px) {
          .page-header {
            padding: 12px 16px 0;
          }

          .breadcrumb ol {
            font-size: 13px;
            gap: 6px;
            margin-bottom: 12px;
          }

          .header-row {
            padding-bottom: 12px;
          }

          .header-row h1 {
            font-size: 20px;
          }

          .create-button {
            padding: 8px 12px;
            font-size: 13px;
          }

          .create-button span {
            display: none;
          }

          .page-content {
            padding: 16px;
          }

          .error-toast {
            margin: 12px 16px;
            flex-wrap: wrap;
          }

          .retry-button {
            width: 100%;
            justify-content: center;
            margin-top: 8px;
          }
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .create-button {
            transition: none;
          }

          .create-button:active:not(:disabled) {
            transform: none;
          }

          .error-toast {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
