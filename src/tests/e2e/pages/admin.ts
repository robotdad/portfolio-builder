/**
 * Page Objects for Admin Pages
 * 
 * Encapsulates common admin page interactions for cleaner, more maintainable tests.
 * Each class represents a page or major component and provides methods for common actions.
 */
import { Page, Locator, expect } from '@playwright/test'
import { selectors } from '../fixtures'

/**
 * Base class for admin pages with common functionality
 */
export class AdminPage {
  constructor(protected page: Page) {}

  /** Navigate to a specific admin page */
  async goto(path: string) {
    await this.page.goto(`/admin${path}`)
  }

  /** Get the sidebar element */
  get sidebar(): Locator {
    return this.page.getByTestId(selectors.sidebar)
  }

  /** Wait for page to be ready (network idle) */
  async waitForReady() {
    await this.page.waitForLoadState('networkidle')
  }
}

/**
 * Category management page (/admin/categories)
 */
export class CategoryPage extends AdminPage {
  async goto() {
    await super.goto('/categories')
    await this.waitForListOrEmpty()
  }

  /** Wait for either category list or empty state to be visible */
  async waitForListOrEmpty() {
    await expect(
      this.page.getByTestId(selectors.categoryList).or(this.page.getByTestId(selectors.categoryListEmpty))
    ).toBeVisible()
  }

  /** Get the category list element */
  get list(): Locator {
    return this.page.getByTestId(selectors.categoryList)
  }

  /** Get the create button (works for both list and empty state) */
  get createButton(): Locator {
    return this.page.getByTestId(selectors.categoryCreateBtn)
      .or(this.page.getByTestId('category-list-empty-create-btn'))
  }

  /** Get a specific category item by ID */
  categoryItem(id: string): Locator {
    return this.page.getByTestId(selectors.categoryItem(id))
  }

  /** Get the edit button for a category (hover to reveal) */
  async clickEditButton(categoryId: string) {
    const item = this.categoryItem(categoryId)
    await item.hover()
    await item.getByTestId(selectors.categoryItemEditBtn).click()
  }

  /** Get the delete button for a category (hover to reveal) */
  async clickDeleteButton(categoryId: string) {
    const item = this.categoryItem(categoryId)
    await item.hover()
    await item.getByTestId(selectors.categoryItemDeleteBtn).click()
  }

  /** Open the create category modal */
  async openCreateModal() {
    await this.createButton.first().click()
    await expect(this.page.getByTestId(selectors.categoryModal)).toBeVisible()
  }

  /** Fill and submit the category form */
  async fillCategoryForm(name: string, description?: string) {
    await this.page.getByTestId(selectors.categoryFormNameInput).fill(name)
    if (description) {
      await this.page.getByTestId(selectors.categoryFormDescriptionInput).fill(description)
    }
    await this.page.getByTestId(selectors.categoryFormSubmitBtn).click()
  }

  /** Create a category (opens modal, fills form, submits) */
  async createCategory(name: string, description?: string) {
    await this.openCreateModal()
    await this.fillCategoryForm(name, description)
    await expect(this.page.getByTestId(selectors.categoryModal)).not.toBeVisible({ timeout: 10000 })
  }

  /** Confirm category deletion in modal */
  async confirmDelete() {
    await expect(this.page.getByTestId(selectors.deleteCategoryModal)).toBeVisible()
    await this.page.getByTestId(selectors.deleteCategoryModalConfirmBtn).click()
    // Wait for API call + animation to complete
    await expect(this.page.getByTestId(selectors.deleteCategoryModal)).not.toBeVisible({ timeout: 10000 })
  }

  /** Cancel category deletion in modal */
  async cancelDelete() {
    await expect(this.page.getByTestId(selectors.deleteCategoryModal)).toBeVisible()
    await this.page.getByTestId(selectors.deleteCategoryModalCancelBtn).click()
    // Small delay for mobile to start close animation, then wait for completion
    await this.page.waitForTimeout(100)
    await expect(this.page.getByTestId(selectors.deleteCategoryModal)).not.toBeVisible({ timeout: 15000 })
  }
}

/**
 * Project management within a category
 */
export class ProjectPage extends AdminPage {
  constructor(page: Page, private categoryId?: string) {
    super(page)
  }

  /** Navigate to projects for a category */
  async gotoCategory(categoryId: string) {
    await super.goto(`/categories/${categoryId}/projects`)
    await this.waitForListOrEmpty()
  }

  /** Wait for either project list or empty state */
  async waitForListOrEmpty() {
    await expect(
      this.page.getByTestId(selectors.projectList).or(this.page.getByTestId(selectors.projectListEmpty))
    ).toBeVisible({ timeout: 10000 })
  }

  /** Get a project card by ID */
  projectCard(id: string): Locator {
    return this.page.getByTestId(selectors.projectCard(id))
  }

  /** Click delete button on a project card */
  async clickDeleteButton(projectId: string) {
    const card = this.projectCard(projectId)
    await card.hover()
    await card.getByTestId(selectors.projectCardDeleteBtn).click()
  }

  /** Confirm project deletion */
  async confirmDelete() {
    await expect(this.page.getByTestId(selectors.deleteProjectModal)).toBeVisible()
    await this.page.getByTestId(selectors.deleteProjectModalConfirmBtn).click()
    // Wait for API call + animation to complete
    await expect(this.page.getByTestId(selectors.deleteProjectModal)).not.toBeVisible({ timeout: 10000 })
  }

  /** Cancel project deletion */
  async cancelDelete() {
    await expect(this.page.getByTestId(selectors.deleteProjectModal)).toBeVisible()
    await this.page.getByTestId(selectors.deleteProjectModalCancelBtn).click()
    // Small delay for mobile to start close animation, then wait for completion
    await this.page.waitForTimeout(100)
    await expect(this.page.getByTestId(selectors.deleteProjectModal)).not.toBeVisible({ timeout: 15000 })
  }

  /** Click a project card to navigate to edit page */
  async openProject(projectId: string) {
    await this.page.waitForTimeout(500)
    await this.projectCard(projectId).click()
    await this.page.waitForURL(/\/admin\/projects\//, { timeout: 10000 })
  }
}

/**
 * Page management (/admin/pages)
 *
 * Mirrors CategoryPage but uses the generic RenameModal for both create
 * and rename flows.
 */
export class PagesPage extends AdminPage {
  async goto() {
    await super.goto('/pages')
    await this.waitForListOrEmpty()
  }

  async waitForListOrEmpty() {
    await expect(
      this.page.getByTestId(selectors.pageList).or(this.page.getByTestId(selectors.pageListEmpty))
    ).toBeVisible({ timeout: 10000 })
  }

  get list(): Locator {
    return this.page.getByTestId(selectors.pageList)
  }

  /** Create button (works for both list and empty state). */
  get createButton(): Locator {
    return this.page.getByTestId(selectors.pageCreateBtn)
      .or(this.page.getByTestId(selectors.pageListEmptyCreateBtn))
  }

  pageItem(id: string): Locator {
    return this.page.getByTestId(selectors.pageItem(id))
  }

  /** Open the create-page naming modal. */
  async openCreateModal() {
    await this.createButton.first().click()
    await expect(this.page.getByTestId(selectors.renameModal)).toBeVisible()
  }

  /** Type a name and submit the rename modal (used for create AND rename). */
  async submitRename(name: string) {
    const input = this.page.getByTestId(selectors.renameModalInput)
    await input.fill(name)
    await this.page.getByTestId(selectors.renameModalSaveBtn).click()
    await expect(this.page.getByTestId(selectors.renameModal)).not.toBeVisible({ timeout: 10000 })
  }

  /** Click cancel on the rename modal. */
  async cancelRename() {
    await this.page.getByTestId(selectors.renameModalCancelBtn).click()
    await expect(this.page.getByTestId(selectors.renameModal)).not.toBeVisible({ timeout: 10000 })
  }

  /** Click the rename pencil on a page item. */
  async clickRenameButton(pageId: string) {
    const item = this.pageItem(pageId)
    await item.hover()
    await item.getByTestId(selectors.pageItemRenameBtn).click()
  }

  /** Click the delete trash on a page item. */
  async clickDeleteButton(pageId: string) {
    const item = this.pageItem(pageId)
    await item.hover()
    await item.getByTestId(selectors.pageItemDeleteBtn).click()
  }

  async confirmDelete() {
    await expect(this.page.getByTestId(selectors.deletePageModal)).toBeVisible()
    await this.page.getByTestId(selectors.deletePageModalConfirmBtn).click()
    await expect(this.page.getByTestId(selectors.deletePageModal)).not.toBeVisible({ timeout: 10000 })
  }
}
