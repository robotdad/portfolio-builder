'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageList } from '@/components/admin/PageList'
import { DeletePageModal } from '@/components/admin/DeletePageModal'
import { RenameModal } from '@/components/admin/RenameModal'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { usePages, type Page } from '@/hooks/usePages'

/**
 * Page Management Page
 * 
 * Admin page for managing portfolio pages.
 * Supports creating, editing, deleting, and reordering pages.
 */
export default function PagesPage() {
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

  // Page data from hook - only fetch when we have a portfolioId
  const {
    pages,
    isLoading: pagesLoading,
    error: pagesError,
    createPage,
    updatePage,
    deletePage,
    reorderPages,
  } = usePages(portfolioId || '')

  // Combined loading and error states
  const isLoading = portfolioLoading || (portfolioId ? pagesLoading : false)
  const error = portfolioError || pagesError

  // Create modal state (uses RenameModal with empty currentName)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Rename modal state
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [renamingPage, setRenamingPage] = useState<Page | null>(null)
  const [isRenaming, setIsRenaming] = useState(false)

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingPage, setDeletingPage] = useState<Page | null>(null)
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

  // Router for navigation
  const router = useRouter()

  // Open the naming modal — DO NOT create the page until the user provides a name
  const handleCreateClick = useCallback(() => {
    if (!portfolioId) return
    setIsCreateModalOpen(true)
  }, [portfolioId])

  // Submit handler for the create modal
  const handleCreateSave = useCallback(async (name: string) => {
    if (!portfolioId) return
    setIsCreating(true)
    try {
      // Note: we do NOT pass slug — the API auto-derives it from title
      // (see src/app/api/admin/pages/route.ts:21).
      const newPage = await createPage({
        title: name,
        showInNav: true,
        draftContent: JSON.stringify([]),
      })
      setIsCreateModalOpen(false)
      router.push(`/admin/pages/${newPage.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create page'
      console.error('Create page error:', err)
      showError(message)
    } finally {
      setIsCreating(false)
    }
  }, [portfolioId, createPage, router, showError])

  const handleCreateClose = useCallback(() => {
    if (!isCreating) {
      setIsCreateModalOpen(false)
    }
  }, [isCreating])

  // Open page editor (navigate to edit)
  const handleEditClick = useCallback((page: Page) => {
    router.push(`/admin/pages/${page.id}`)
  }, [router])

  // Open rename modal
  const handleRenameClick = useCallback((page: Page) => {
    setRenamingPage(page)
    setIsRenameModalOpen(true)
  }, [])

  const handleRenameSave = useCallback(async (newName: string) => {
    if (!renamingPage) return
    setIsRenaming(true)
    try {
      await updatePage(renamingPage.id, { title: newName })
      setIsRenameModalOpen(false)
      setRenamingPage(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to rename page'
      console.error('Rename page error:', err)
      showError(message)
    } finally {
      setIsRenaming(false)
    }
  }, [renamingPage, updatePage, showError])

  const handleRenameClose = useCallback(() => {
    if (!isRenaming) {
      setIsRenameModalOpen(false)
      setRenamingPage(null)
    }
  }, [isRenaming])

  // Open delete confirmation modal
  const handleDeleteClick = useCallback((page: Page) => {
    setDeletingPage(page)
    setIsDeleteModalOpen(true)
  }, [])

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingPage) return

    setIsDeleting(true)
    try {
      await deletePage(deletingPage.id)
      setIsDeleteModalOpen(false)
      setDeletingPage(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete page'
      console.error('Delete page error:', err)
      showError(message)
    } finally {
      setIsDeleting(false)
    }
  }, [deletingPage, deletePage, showError])

  // Close delete modal
  const handleDeleteClose = useCallback(() => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false)
      setDeletingPage(null)
    }
  }, [isDeleting])

  // Handle page reordering
  const handleReorder = useCallback(async (orderedIds: string[]) => {
    setIsReordering(true)
    try {
      await reorderPages(orderedIds)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reorder pages'
      console.error('Reorder pages error:', err)
      showError(message)
    } finally {
      setIsReordering(false)
    }
  }, [reorderPages, showError])

  return (
    <div className="admin-pages-page">
      {/* Admin Header */}
      <AdminPageHeader
        navigation={{ 
          type: 'breadcrumb', 
          items: [
            { label: 'Dashboard', href: '/admin' },
            { label: 'Pages' }
          ]
        }}
        title="Pages"
        actions={
          <button
            type="button"
            onClick={handleCreateClick}
            className="btn btn-primary"
            disabled={!portfolioId}
          >
            + New Page
          </button>
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
        <PageList
          pages={pages}
          onCreateClick={handleCreateClick}
          onEditClick={handleEditClick}
          onRenameClick={handleRenameClick}
          onDeleteClick={handleDeleteClick}
          onReorder={handleReorder}
          isReordering={isReordering}
          isLoading={isLoading}
        />
      </main>

      {/* Create Page Modal — RenameModal with empty currentName */}
      <RenameModal
        isOpen={isCreateModalOpen}
        title="Create Page"
        label="Page Title"
        currentName=""
        onSave={handleCreateSave}
        onClose={handleCreateClose}
        isSubmitting={isCreating}
      />

      {/* Rename Page Modal */}
      <RenameModal
        isOpen={isRenameModalOpen}
        title="Rename Page"
        label="Page Title"
        currentName={renamingPage?.title || ''}
        onSave={handleRenameSave}
        onClose={handleRenameClose}
        isSubmitting={isRenaming}
      />

      {/* Delete Confirmation Modal */}
      <DeletePageModal
        page={deletingPage}
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      <style jsx>{`
        .admin-pages-page {
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
