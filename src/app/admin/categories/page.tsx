'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CategoryList } from '@/components/admin/CategoryList'
import { CategoryFormModal } from '@/components/admin/CategoryFormModal'
import { DeleteCategoryModal } from '@/components/admin/DeleteCategoryModal'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { useCategories, type Category } from '@/hooks/useCategories'
import type { CategoryFormData } from '@/components/admin/CategoryForm'

/**
 * Category Management Page
 * 
 * Admin page for managing portfolio categories.
 * Supports creating, editing, deleting, and reordering categories.
 */
export default function CategoriesPage() {
  // Portfolio state - fetched dynamically
  const [portfolioId, setPortfolioId] = useState<string | null>(null)
  const [portfolioLoading, setPortfolioLoading] = useState(true)
  const [portfolioError, setPortfolioError] = useState<string | null>(null)

  // Fetch portfolio on mount
  useEffect(() => {
    async function loadPortfolio() {
      try {
        const res = await fetch('/api/portfolio')
        if (res.ok) {
          const result = await res.json()
          // API returns { success: true, data: portfolio } - unwrap it
          if (result.success && result.data?.id) {
            setPortfolioId(result.data.id)
          } else {
            setPortfolioError('No portfolio found. Please create a portfolio first.')
          }
        } else {
          setPortfolioError('Failed to load portfolio')
        }
      } catch (err) {
        console.error('Failed to load portfolio:', err)
        setPortfolioError('Failed to load portfolio')
      } finally {
        setPortfolioLoading(false)
      }
    }
    loadPortfolio()
  }, [])

  // Category data from hook - only fetch when we have a portfolioId
  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  } = useCategories(portfolioId || '')

  // Combined loading and error states
  const isLoading = portfolioLoading || (portfolioId ? categoriesLoading : false)
  const error = portfolioError || categoriesError

  // Form modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Reordering state
  const [isReordering, setIsReordering] = useState(false)

  // Error display
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Clear error after timeout
  const showError = useCallback((message: string) => {
    setErrorMessage(message)
    setTimeout(() => setErrorMessage(null), 5000)
  }, [])

  // Open form modal in create mode
  const handleCreateClick = useCallback(() => {
    setEditingCategory(null)
    setIsFormModalOpen(true)
  }, [])

  // Open form modal in edit mode
  const handleEditClick = useCallback((category: Category) => {
    setEditingCategory(category)
    setIsFormModalOpen(true)
  }, [])

  // Open delete confirmation modal
  const handleDeleteClick = useCallback((category: Category) => {
    setDeletingCategory(category)
    setIsDeleteModalOpen(true)
  }, [])

  // Handle form submission (create or update)
  const handleFormSubmit = useCallback(async (data: CategoryFormData) => {
    setIsSubmitting(true)
    try {
      if (editingCategory) {
        // Update existing category
        await updateCategory(editingCategory.id, {
          name: data.name,
          description: data.description,
          featuredImageId: data.featuredImageId,
        })
      } else {
        // Create new category
        await createCategory({
          name: data.name,
          description: data.description,
          featuredImageId: data.featuredImageId ?? undefined,
        })
      }
      // Close modal on success
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
      setIsFormModalOpen(false)
      setEditingCategory(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      console.error('Category form error:', err)
      showError(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [editingCategory, createCategory, updateCategory, showError])

  // Close form modal and reset state
  const handleFormClose = useCallback(() => {
    if (!isSubmitting) {
      setIsFormModalOpen(false)
      setEditingCategory(null)
    }
  }, [isSubmitting])

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingCategory) return

    setIsDeleting(true)
    try {
      await deleteCategory(deletingCategory.id)
      setIsDeleteModalOpen(false)
      setDeletingCategory(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete category'
      console.error('Delete category error:', err)
      showError(message)
    } finally {
      setIsDeleting(false)
    }
  }, [deletingCategory, deleteCategory, showError])

  // Close delete modal
  const handleDeleteClose = useCallback(() => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false)
      setDeletingCategory(null)
    }
  }, [isDeleting])

  // Handle category reordering
  const handleReorder = useCallback(async (orderedIds: string[]) => {
    setIsReordering(true)
    try {
      await reorderCategories(orderedIds)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reorder categories'
      console.error('Reorder categories error:', err)
      showError(message)
    } finally {
      setIsReordering(false)
    }
  }, [reorderCategories, showError])

  // Router for navigation
  const router = useRouter()

  // Handle view projects navigation
  const handleViewProjects = useCallback((category: Category) => {
    router.push(`/admin/categories/${category.id}/projects`)
  }, [router])

  return (
    <div className="admin-categories-page">
      {/* Admin Header */}
      <AdminPageHeader
        navigation={{ 
          type: 'breadcrumb', 
          items: [
            { label: 'Dashboard', href: '/admin' },
            { label: 'Categories' }
          ]
        }}
        title="Categories"
        actions={
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/admin/categories/edit" className="btn btn-secondary">
              Edit Category List Page
            </Link>
            <button
              type="button"
              onClick={handleCreateClick}
              className="btn btn-primary"
            >
              + New Category
            </button>
          </div>
        }
      />

      {/* Error Toast */}
      {(errorMessage || error) && (
        <div className="error-toast" role="alert">
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
          <span>{errorMessage || error}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="admin-content">
        <CategoryList
          categories={categories}
          onCreateClick={handleCreateClick}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          onViewProjects={handleViewProjects}
          onReorder={handleReorder}
          isReordering={isReordering}
          isLoading={isLoading}
        />
      </main>

      {/* Form Modal (Create/Edit) */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        portfolioId={portfolioId || ''}
        category={editingCategory ? {
          id: editingCategory.id,
          name: editingCategory.name,
          description: editingCategory.description,
          featuredImage: editingCategory.featuredImage,
        } : undefined}
        onSubmit={handleFormSubmit}
        onClose={handleFormClose}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteCategoryModal
        category={deletingCategory}
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      <style jsx>{`
        .admin-categories-page {
          min-height: 100vh;
          background: var(--admin-bg, #ffffff);
        }

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

        .admin-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        /* Mobile styles */
        @media (max-width: 767px) {
          .admin-content {
            padding: 16px;
          }

          .error-toast {
            margin: 12px 16px;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .error-toast {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
