/**
 * CRUD Operations E2E Tests
 * 
 * Tests for Create, Read, Update, Delete operations on categories and projects.
 * Uses Page Objects for cleaner, more maintainable test code.
 * 
 * Prerequisites:
 * - Database populated with test data (handled by global-setup.ts)
 * - Server running at localhost:3000
 */
import { test, expect, selectors, PortfolioAPI } from './fixtures'
import { CategoryPage, ProjectPage } from './pages/admin'

test.describe('Category CRUD Operations', () => {
  const createdCategoryIds: string[] = []

  test.beforeEach(async ({ isMobile }) => {
    test.skip(isMobile, 'CRUD modal tests unreliable on mobile - see TESTING.md')
  })

  test.afterAll(async () => {
    // Clean up any categories created during tests
    const api = new PortfolioAPI()
    for (const id of createdCategoryIds) {
      try {
        await api.deleteCategory(id)
      } catch {
        // Ignore - category may already be deleted
      }
    }
  })

  test('should edit an existing category', async ({ page, api }) => {
    const categoryPage = new CategoryPage(page)

    // Create a category to edit
    const uniqueName = `Edit Test ${Date.now()}`
    await categoryPage.goto()
    await categoryPage.createCategory(uniqueName, 'Original description')

    // Find the created category
    const portfolioResponse = await api.getPortfolio()
    const portfolio = portfolioResponse.data || portfolioResponse
    const categoriesResponse = await api.getCategories(portfolio.id)
    const categories = categoriesResponse.data || categoriesResponse
    const category = categories.find((c: { name: string }) => c.name === uniqueName)
    expect(category).toBeTruthy()
    createdCategoryIds.push(category.id)

    // Click edit button
    await categoryPage.clickEditButton(category.id)
    await expect(page.getByTestId(selectors.categoryModal)).toBeVisible()

    // Verify form is populated with existing data
    const nameInput = page.getByTestId(selectors.categoryFormNameInput)
    await expect(nameInput).toHaveValue(uniqueName)

    // Edit the category
    const updatedName = `Updated ${uniqueName}`
    await nameInput.fill(updatedName)
    await page.getByTestId(selectors.categoryFormSubmitBtn).click()

    // Verify modal closes and list updates
    await expect(page.getByTestId(selectors.categoryModal)).not.toBeVisible({ timeout: 10000 })
    await expect(page.getByText(updatedName)).toBeVisible()
  })

  test('should delete a category', async ({ page, api }) => {
    const categoryPage = new CategoryPage(page)

    // Create a category to delete
    const uniqueName = `Delete Test ${Date.now()}`
    await categoryPage.goto()
    await categoryPage.createCategory(uniqueName, 'Will be deleted')

    // Find the created category
    const portfolioResponse = await api.getPortfolio()
    const portfolio = portfolioResponse.data || portfolioResponse
    const categoriesResponse = await api.getCategories(portfolio.id)
    const categories = categoriesResponse.data || categoriesResponse
    const category = categories.find((c: { name: string }) => c.name === uniqueName)
    expect(category).toBeTruthy()

    // Click delete button
    await categoryPage.clickDeleteButton(category.id)

    // Confirm deletion
    await categoryPage.confirmDelete()

    // Verify category is removed from list
    await expect(page.getByText(uniqueName)).not.toBeVisible()
  })

  test('should cancel category deletion', async ({ page, api }) => {
    const categoryPage = new CategoryPage(page)

    // Create a category
    const uniqueName = `Cancel Delete ${Date.now()}`
    await categoryPage.goto()
    await categoryPage.createCategory(uniqueName, 'Should remain after cancel')

    // Find the created category
    const portfolioResponse = await api.getPortfolio()
    const portfolio = portfolioResponse.data || portfolioResponse
    const categoriesResponse = await api.getCategories(portfolio.id)
    const categories = categoriesResponse.data || categoriesResponse
    const category = categories.find((c: { name: string }) => c.name === uniqueName)
    expect(category).toBeTruthy()
    createdCategoryIds.push(category.id)

    // Click delete then cancel
    await categoryPage.clickDeleteButton(category.id)
    await categoryPage.cancelDelete()

    // Verify category still exists
    await expect(page.getByText(uniqueName)).toBeVisible()
  })
})

test.describe('Project CRUD Operations', () => {
  test.beforeEach(async ({ isMobile }) => {
    test.skip(isMobile, 'CRUD modal tests unreliable on mobile - see TESTING.md')
  })

  test('should delete a project', async ({ page, api }) => {
    const projectPage = new ProjectPage(page)

    // Get an existing category with projects
    const portfolioResponse = await api.getPortfolio()
    const portfolio = portfolioResponse.data || portfolioResponse
    const categoriesResponse = await api.getCategories(portfolio.id)
    const categories = categoriesResponse.data || categoriesResponse
    
    // Find a category that has projects
    let categoryWithProjects = null
    let projectToDelete = null
    
    for (const category of categories) {
      const projectsResponse = await api.getProjects(category.id)
      const projects = projectsResponse.data || projectsResponse
      if (projects && projects.length > 0) {
        categoryWithProjects = category
        projectToDelete = projects[0]
        break
      }
    }

    expect(categoryWithProjects).toBeTruthy()
    expect(projectToDelete).toBeTruthy()

    // Navigate to the category's project list
    await projectPage.gotoCategory(categoryWithProjects.id)

    // Delete the project
    await projectPage.clickDeleteButton(projectToDelete.id)
    await projectPage.confirmDelete()

    // Verify the specific project card is no longer visible
    await expect(page.getByTestId(`project-card-${projectToDelete.id}`)).not.toBeVisible()
  })

  test('should cancel project deletion', async ({ page, api }) => {
    const projectPage = new ProjectPage(page)

    // Get an existing category with projects
    const portfolioResponse = await api.getPortfolio()
    const portfolio = portfolioResponse.data || portfolioResponse
    const categoriesResponse = await api.getCategories(portfolio.id)
    const categories = categoriesResponse.data || categoriesResponse
    
    let categoryWithProjects = null
    let projectToKeep = null
    
    for (const category of categories) {
      const projectsResponse = await api.getProjects(category.id)
      const projects = projectsResponse.data || projectsResponse
      if (projects && projects.length > 0) {
        categoryWithProjects = category
        projectToKeep = projects[0]
        break
      }
    }

    expect(categoryWithProjects).toBeTruthy()
    expect(projectToKeep).toBeTruthy()

    // Navigate to the category's project list
    await projectPage.gotoCategory(categoryWithProjects.id)

    // Store project count before
    const projectCards = page.locator(`[data-testid^="project-card-"]`)
    const countBefore = await projectCards.count()

    // Click delete then cancel
    await projectPage.clickDeleteButton(projectToKeep.id)
    await projectPage.cancelDelete()

    // Verify project count unchanged
    await expect(projectCards).toHaveCount(countBefore)
  })

  test('should navigate to project edit page', async ({ page, api }) => {
    const projectPage = new ProjectPage(page)

    // Get an existing category with projects
    const portfolioResponse = await api.getPortfolio()
    const portfolio = portfolioResponse.data || portfolioResponse
    const categoriesResponse = await api.getCategories(portfolio.id)
    const categories = categoriesResponse.data || categoriesResponse
    
    let categoryWithProjects = null
    let projectToEdit = null
    
    for (const category of categories) {
      const projectsResponse = await api.getProjects(category.id)
      const projects = projectsResponse.data || projectsResponse
      if (projects && projects.length > 0) {
        categoryWithProjects = category
        projectToEdit = projects[0]
        break
      }
    }

    expect(categoryWithProjects).toBeTruthy()
    expect(projectToEdit).toBeTruthy()

    // Navigate to the category's project list
    await projectPage.gotoCategory(categoryWithProjects.id)

    // Click project card to open edit page
    await projectPage.openProject(projectToEdit.id)

    // Verify we're on the project edit page
    // URL verification is sufficient for a navigation test - the openProject() method
    // already waits for the URL pattern before this assertion runs
    await expect(page).toHaveURL(new RegExp(`/admin/projects/${projectToEdit.id}`))
  })
})
