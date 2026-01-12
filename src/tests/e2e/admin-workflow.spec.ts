import { test, expect, selectors } from './fixtures'

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

const MOBILE_BREAKPOINT = 768

/**
 * Opens the mobile menu if viewport is below mobile breakpoint.
 * On desktop viewports, this is a no-op.
 * Returns true if mobile menu was opened, false if desktop viewport.
 */
async function openMobileMenuIfNeeded(page: import('@playwright/test').Page): Promise<boolean> {
  const viewport = page.viewportSize()
  if (viewport && viewport.width < MOBILE_BREAKPOINT) {
    const hamburger = page.getByTestId(selectors.hamburger)
    // Wait for hamburger to be visible on mobile
    await expect(hamburger).toBeVisible({ timeout: 5000 })
    await hamburger.click()
    // Wait for drawer to open with animation
    const drawer = page.getByTestId(selectors.mobileDrawer)
    await expect(drawer).toBeVisible({ timeout: 5000 })
    return true
  }
  return false
}

/**
 * Gets the navigation container based on viewport.
 * On mobile, returns the mobile drawer; on desktop, returns the sidebar.
 */
function getNavContainer(page: import('@playwright/test').Page) {
  const viewport = page.viewportSize()
  if (viewport && viewport.width < MOBILE_BREAKPOINT) {
    return page.getByTestId(selectors.mobileDrawer)
  }
  return page.getByTestId(selectors.sidebar)
}

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin')
  })

  test('should display admin sidebar', async ({ page }) => {
    const isMobile = await openMobileMenuIfNeeded(page)
    // On mobile, the sidebar is hidden - check for mobile drawer instead
    if (isMobile) {
      await expect(page.getByTestId(selectors.mobileDrawer)).toBeVisible()
    } else {
      await expect(page.getByTestId(selectors.sidebar)).toBeVisible()
    }
  })

  test('should navigate to categories', async ({ page }) => {
    await openMobileMenuIfNeeded(page)
    // Scope nav item search to the visible navigation container
    // to avoid duplicate testid matches between sidebar and mobile drawer
    const navContainer = getNavContainer(page)
    await navContainer.getByTestId(selectors.navItem('admin-categories')).click()
    await expect(page).toHaveURL('/admin/categories')
  })
})

test.describe('Category Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/categories')
  })

  test('should show category list or empty state', async ({ page }) => {
    // Use .or() with toBeVisible() assertion to properly wait for either element
    await expect(
      page.getByTestId(selectors.categoryList).or(page.getByTestId(selectors.categoryListEmpty))
    ).toBeVisible()
  })

  test('should open create category modal', async ({ page }) => {
    // Wait for either create button to be visible, then click the first one found
    const createBtn = page.getByTestId(selectors.categoryCreateBtn)
    const emptyCreateBtn = page.getByTestId('category-list-empty-create-btn')
    
    // Wait for page to load with proper assertion
    await expect(
      createBtn.or(emptyCreateBtn)
    ).toBeVisible()
    
    // Click whichever is visible
    await createBtn.or(emptyCreateBtn).first().click()
    
    await expect(page.getByTestId(selectors.categoryModal)).toBeVisible()
    await expect(page.getByTestId(selectors.categoryForm)).toBeVisible()
  })

  test('should create a new category', async ({ page }) => {
    // Wait for and click create button
    const createBtn = page.getByTestId(selectors.categoryCreateBtn).or(
      page.getByTestId('category-list-empty-create-btn')
    )
    await expect(createBtn).toBeVisible()
    await createBtn.first().click()
    
    // Fill form
    await page.getByTestId(selectors.categoryFormNameInput).fill('Test Category')
    await page.getByTestId(selectors.categoryFormDescriptionInput).fill('A test category description')
    
    // Submit
    await page.getByTestId(selectors.categoryFormSubmitBtn).click()
    
    // Modal should close (longer timeout for mobile animations)
    await expect(page.getByTestId(selectors.categoryModal)).not.toBeVisible({ timeout: 10000 })
  })
})

test.describe('Project Management', () => {
  // These tests assume at least one category exists
  // Use test.beforeAll with API setup for reliable state
  
  test('should show project list when category selected', async ({ page }) => {
    await page.goto('/admin/categories')
    
    // Wait for category list to load
    await expect(
      page.getByTestId(selectors.categoryList).or(page.getByTestId(selectors.categoryListEmpty))
    ).toBeVisible()
    
    // Click first category if exists
    const firstCategory = page.locator('[data-testid^="category-item-"]').first()
    const categoryCount = await firstCategory.count()
    
    if (categoryCount > 0) {
      await firstCategory.click()
      await expect(page.getByTestId(selectors.projectList)).toBeVisible()
    }
  })
})
