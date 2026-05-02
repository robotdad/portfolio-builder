import { test as base, expect } from '@playwright/test'

/**
 * Test fixtures and helpers for portfolio E2E tests
 * 
 * Provides:
 * - API client for direct backend calls
 * - Test data helpers
 * - Common page object patterns
 */

// API client for test setup/teardown
export class PortfolioAPI {
  private baseUrl: string
  /** Pages created during this test — cleaned up automatically by the fixture. */
  readonly createdPageIds: string[] = []

  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl
  }

  async fetch(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    return response
  }

  async getPortfolio() {
    const res = await this.fetch('/api/portfolio')
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${await res.text()}`)
    }
    return res.json()
  }

  async createCategory(data: { name: string; description?: string }) {
    const res = await this.fetch('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${await res.text()}`)
    }
    return res.json()
  }

  async getCategories(portfolioId?: string) {
    const url = portfolioId
      ? `/api/categories?portfolioId=${portfolioId}`
      : '/api/categories'
    const res = await this.fetch(url)
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${await res.text()}`)
    }
    return res.json()
  }

  async createProject(data: { 
    title: string
    categoryId: string
    year?: number
    description?: string 
  }) {
    const res = await this.fetch('/api/admin/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${await res.text()}`)
    }
    return res.json()
  }

  async getProjects(categoryId?: string) {
    const url = categoryId 
      ? `/api/projects?categoryId=${categoryId}`
      : '/api/projects'
    const res = await this.fetch(url)
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${await res.text()}`)
    }
    return res.json()
  }

  async deleteCategory(id: string) {
    return this.fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
  }

  async deleteProject(id: string) {
    return this.fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
  }

  async getPages(portfolioId: string) {
    const res = await this.fetch(`/api/pages?portfolioId=${portfolioId}`)
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${await res.text()}`)
    }
    return res.json()
  }

  async createPage(data: {
    portfolioId: string
    title: string
    slug?: string
    showInNav?: boolean
    draftContent?: string
  }) {
    const res = await this.fetch('/api/admin/pages', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${await res.text()}`)
    }
    const body = await res.json()
    const result = body.data ?? body
    if (result.id) this.createdPageIds.push(result.id)
    return result
  }

  async deletePage(id: string) {
    return this.fetch(`/api/admin/pages/${id}`, { method: 'DELETE' })
  }
}

// Extended test with API fixture — auto-cleans pages created during the test
export const test = base.extend<{ api: PortfolioAPI }>({
  api: async ({}, use) => {
    const api = new PortfolioAPI()
    await use(api)
    // Teardown: delete any pages created during this test
    for (const id of api.createdPageIds) {
      await api.deletePage(id).catch(() => {})
    }
  },
})

export { expect }

// Test selectors - centralized for easy updates
export const selectors = {
  // Navigation
  sidebar: 'admin-sidebar',
  hamburger: 'hamburger-btn',
  mobileDrawer: 'mobile-drawer',
  navItem: (path: string) => `nav-item-${path.replace(/\//g, '-').replace(/^-/, '')}`,

  // Category
  categoryList: 'category-list',
  categoryListEmpty: 'category-list-empty',
  categoryCreateBtn: 'category-list-create-btn',
  categoryItem: (id: string) => `category-item-${id}`,
  categoryItemDragHandle: 'category-item-drag-handle',
  categoryItemEditBtn: 'category-item-edit-btn',
  categoryItemDeleteBtn: 'category-item-delete-btn',

  // Category Modal/Form
  categoryModal: 'category-modal',
  categoryModalOverlay: 'category-modal-overlay',
  categoryModalCloseBtn: 'category-modal-close-btn',
  categoryForm: 'category-form',
  categoryFormNameInput: 'category-form-name-input',
  categoryFormDescriptionInput: 'category-form-description-input',
  categoryFormImagePicker: 'category-form-image-picker',
  categoryFormCancelBtn: 'category-form-cancel-btn',
  categoryFormSubmitBtn: 'category-form-submit-btn',

  // Delete Category Modal
  deleteCategoryModal: 'delete-category-modal',
  deleteCategoryModalConfirmBtn: 'delete-category-modal-confirm-btn',
  deleteCategoryModalCancelBtn: 'delete-category-modal-cancel-btn',

  // Project
  projectList: 'project-list',
  projectListEmpty: 'project-list-empty',
  projectCreateBtn: 'project-list-create-btn',
  projectCard: (id: string) => `project-card-${id}`,
  projectCardDeleteBtn: 'project-card-delete-btn',

  // Project Modal/Form
  projectModal: 'project-modal',
  projectModalOverlay: 'project-modal-overlay',
  projectModalCloseBtn: 'project-modal-close-btn',
  projectForm: 'project-form',
  projectFormTitleInput: 'project-form-title-input',
  projectFormYearInput: 'project-form-year-input',
  projectFormVenueInput: 'project-form-venue-input',
  projectFormRoleInput: 'project-form-role-input',
  projectFormDescriptionInput: 'project-form-description-input',
  projectFormFeaturedCheckbox: 'project-form-featured-checkbox',
  projectFormCancelBtn: 'project-form-cancel-btn',
  projectFormSubmitBtn: 'project-form-submit-btn',

  // Project Metadata Sidebar (on project edit page)
  projectMetadataYearInput: 'project-metadata-year-input',
  projectMetadataVenueInput: 'project-metadata-venue-input',
  projectMetadataRoleInput: 'project-metadata-role-input',

  // Delete Project Modal
  deleteProjectModal: 'delete-project-modal',
  deleteProjectModalConfirmBtn: 'delete-project-modal-confirm-btn',
  deleteProjectModalCancelBtn: 'delete-project-modal-cancel-btn',

  // Settings
  settingsDropdown: 'settings-dropdown',
  settingsNameInput: 'settings-name-input',
  settingsThemeSelector: 'settings-theme-selector',
  settingsTemplateSelector: 'settings-template-selector',

  // Image Pickers
  featuredImagePicker: 'featured-image-picker',
  featuredImageInput: 'featured-image-input',
  featuredImageDropzone: 'featured-image-dropzone',
  featuredImageRemoveBtn: 'featured-image-remove-btn',
  galleryImageGrid: 'gallery-image-grid',
  galleryAddBtn: 'gallery-add-btn',
  galleryImage: (index: number) => `gallery-image-${index}`,

  // Other
  publishBtn: 'publish-btn',
  imagePickerModal: 'image-picker-modal',
  imagePickerSelectBtn: 'image-picker-select-btn',
  imagePickerCancelBtn: 'image-picker-cancel-btn',

  // Public Portfolio
  portfolioNav: 'portfolio-nav',
  portfolioNavLogo: 'portfolio-nav-logo',
  projectDetail: 'project-detail',
  projectDetailTitle: 'project-detail-title',
  projectDetailVenue: 'project-detail-venue',
  projectDetailYear: 'project-detail-year',
  projectDetailRole: 'project-detail-role',
  featuredWork: 'featured-work',

  // Pages
  pageList: 'page-list',
  pageListEmpty: 'page-list-empty',
  pageListEmptyCreateBtn: 'page-list-empty-create-btn',
  pageCreateBtn: 'page-list-create-btn',
  pageItem: (id: string) => `page-item-${id}`,
  pageItemDragHandle: 'page-item-drag-handle',
  pageItemEditBtn: 'page-item-edit-btn',
  pageItemRenameBtn: 'page-item-rename-btn',
  pageItemDeleteBtn: 'page-item-delete-btn',
  pageEditorRenameBtn: 'page-editor-rename-btn',

  // Page create/rename Modal (RenameModal — generic)
  renameModal: 'rename-modal',
  renameModalOverlay: 'rename-modal-overlay',
  renameModalInput: 'rename-modal-input',
  renameModalSaveBtn: 'rename-modal-save-btn',
  renameModalCancelBtn: 'rename-modal-cancel-btn',
  renameModalCloseBtn: 'rename-modal-close-btn',

  // Delete Page Modal
  deletePageModal: 'delete-page-modal',
  deletePageModalConfirmBtn: 'delete-page-modal-confirm-btn',
  deletePageModalCancelBtn: 'delete-page-modal-cancel-btn',

  // Delete Section Modal (in page editor)
  deleteSectionModal: 'delete-section-modal',
  deleteSectionModalConfirmBtn: 'delete-section-modal-confirm-btn',
  deleteSectionModalCancelBtn: 'delete-section-modal-cancel-btn',
}
