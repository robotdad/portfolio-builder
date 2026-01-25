'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useProjects, type Project } from '@/hooks/useProjects'
import { ProjectList } from '@/components/admin/ProjectList'
import { ProjectFormModal } from '@/components/admin/ProjectFormModal'
import { DeleteProjectModal } from '@/components/admin/DeleteProjectModal'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
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
    <div className="breadcrumb-skeleton" aria-label="Loading breadcrumb">
      <span className="skeleton-text" style={{ width: '80px' }} />
      <span className="skeleton-separator" />
      <span className="skeleton-text" style={{ width: '120px' }} />
      <span className="skeleton-separator" />
      <span className="skeleton-text" style={{ width: '60px' }} />

      <style jsx>{`
        .breadcrumb-skeleton {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
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

        .skeleton-separator {
          width: 8px;
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
          .skeleton-text,
          .skeleton-separator {
            animation: none;
            background: var(--color-surface-secondary, #f3f4f6);
          }
        }
      `}</style>
    </div>
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

  // Feedback display
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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

  // Show success with auto-dismiss
  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
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
    reorderProjects(orderedIds)
      .then(() => {
        showSuccess('Order saved')
      })
      .catch((err) => {
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
      {categoryLoading ? (
        <div className="loading-header">
          <BreadcrumbSkeleton />
        </div>
      ) : (
        <AdminPageHeader
          navigation={{ 
            type: 'breadcrumb', 
            items: [
              { label: 'Dashboard', href: '/admin' },
              { label: 'Categories', href: '/admin/categories' },
              { label: category?.name || 'Category' }
            ]
          }}
          title={`${category?.name || 'Category'} Projects`}
          actions={
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link href={`/admin/categories/${categoryId}/edit`} className="btn btn-secondary">
                Edit Landing Page
              </Link>
              <button
                type="button"
                className="btn btn-primary"
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
          }
        />
      )}

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

      {/* Success Toast */}
      {successMessage && (
        <div className="success-toast" role="status">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{successMessage}</span>
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

        .loading-header {
          padding: 16px 24px;
          background: var(--admin-bg, #ffffff);
          border-bottom: 1px solid var(--admin-border, #e5e7eb);
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

        /* Success Toast */
        .success-toast {
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: 600px;
          margin: 16px auto;
          padding: 12px 16px;
          background: var(--admin-success-bg, #f0fdf4);
          color: var(--admin-success, #16a34a);
          border: 1px solid var(--admin-success-border, #bbf7d0);
          border-radius: 8px;
          font-size: 14px;
          animation: slideIn 0.2s ease-out;
        }

        .success-toast span {
          flex: 1;
        }

        /* Main Content */
        .page-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        /* Mobile Styles */
        @media (max-width: 767px) {
          .page-content {
            padding: 16px;
          }

          .error-toast,
          .success-toast {
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
          .error-toast,
          .success-toast {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
