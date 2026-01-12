import { test, expect } from '@playwright/test'

/**
 * Admin workflow E2E tests
 * 
 * Prerequisites:
 * - Server running at localhost:3000
 * - Database can be empty (tests handle setup) or pre-populated
 * 
 * These tests use data-testid selectors for reliability.
 * See src/components/admin/*.tsx for available test IDs.
 */

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin')
  })

  test('should display admin sidebar', async ({ page }) => {
    await expect(page.getByTestId('admin-sidebar')).toBeVisible()
  })

  test('should navigate to categories', async ({ page }) => {
    await page.getByTestId('nav-item-admin-categories').click()
    await expect(page).toHaveURL('/admin/categories')
  })
})

test.describe('Category Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/categories')
  })

  test('should show category list or empty state', async ({ page }) => {
    // Either the list exists or the empty state is shown
    const hasList = await page.getByTestId('category-list').isVisible()
    const hasEmpty = await page.getByTestId('category-list-empty').isVisible()
    expect(hasList || hasEmpty).toBe(true)
  })

  test('should open create category modal', async ({ page }) => {
    // Click whichever create button is visible
    const createBtn = page.getByTestId('category-list-create-btn')
    const emptyCreateBtn = page.getByTestId('category-list-empty-create-btn')
    
    if (await createBtn.isVisible()) {
      await createBtn.click()
    } else {
      await emptyCreateBtn.click()
    }
    
    await expect(page.getByTestId('category-modal')).toBeVisible()
    await expect(page.getByTestId('category-form')).toBeVisible()
  })

  test('should create a new category', async ({ page }) => {
    // Open modal
    const createBtn = page.getByTestId('category-list-create-btn').or(
      page.getByTestId('category-list-empty-create-btn')
    )
    await createBtn.first().click()
    
    // Fill form
    await page.getByTestId('category-form-name-input').fill('Test Category')
    await page.getByTestId('category-form-description-input').fill('A test category description')
    
    // Submit
    await page.getByTestId('category-form-submit-btn').click()
    
    // Modal should close
    await expect(page.getByTestId('category-modal')).not.toBeVisible()
  })
})

test.describe('Project Management', () => {
  // These tests assume at least one category exists
  // Use test.beforeAll with API setup for reliable state
  
  test('should show project list when category selected', async ({ page }) => {
    await page.goto('/admin/categories')
    
    // Click first category if exists
    const firstCategory = page.locator('[data-testid^="category-item-"]').first()
    if (await firstCategory.isVisible()) {
      await firstCategory.click()
      await expect(page.getByTestId('project-list')).toBeVisible()
    }
  })
})
