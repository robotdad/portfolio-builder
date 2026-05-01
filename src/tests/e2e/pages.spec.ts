import { test, expect, selectors } from './fixtures'
import { PagesPage } from './pages/admin'

test.describe('Pages — naming and management', () => {
  test('Create Page opens a naming modal and uses the chosen title', async ({ page, api }) => {
    const pages = new PagesPage(page)
    await pages.goto()

    // Snapshot existing page IDs so we can find the new one afterwards
    const portfolio = await api.getPortfolio()
    const portfolioId = portfolio.data.id
    const before = await api.getPages(portfolioId)
    const beforeIds = new Set<string>(before.map((p: { id: string }) => p.id))

    // Click "Create Page" — the modal should appear, NO page should be created yet
    await pages.openCreateModal()
    await expect(page.getByTestId(selectors.renameModalInput)).toBeVisible()

    // Verify nothing was created yet (the bug: pre-fix, a page was created on click)
    const midflight = await api.getPages(portfolioId)
    expect(midflight.length).toBe(before.length)

    // Type a name and save
    await pages.submitRename('My Custom Page Title')

    // Editor should open at /admin/pages/{id}
    await page.waitForURL(/\/admin\/pages\/[a-z0-9]+$/i, { timeout: 10000 })

    // Backend should now have a page with the chosen title and a derived slug
    const after = await api.getPages(portfolioId)
    expect(after.length).toBe(before.length + 1)

    const created = after.find((p: { id: string }) => !beforeIds.has(p.id))
    expect(created).toBeDefined()
    expect(created.title).toBe('My Custom Page Title')
    // Slug should be derived from title, NOT a "new-page-{timestamp}" placeholder
    expect(created.slug).toBe('my-custom-page-title')
  })

  test('Cancel on the create modal does not create a page', async ({ page, api }) => {
    const pages = new PagesPage(page)
    await pages.goto()

    const portfolio = await api.getPortfolio()
    const portfolioId = portfolio.data.id
    const before = await api.getPages(portfolioId)

    await pages.openCreateModal()
    await pages.cancelRename()

    // URL should still be /admin/pages (no navigation)
    await expect(page).toHaveURL(/\/admin\/pages\/?$/)

    // No page created
    const after = await api.getPages(portfolioId)
    expect(after.length).toBe(before.length)
  })

  test('Rename pencil opens RenameModal and persists the new title', async ({ page, api }) => {
    const portfolio = await api.getPortfolio()
    const portfolioId = portfolio.data.id

    // Create a fixture page directly via API (bypass UI for setup speed)
    const created = await api.createPage({
      portfolioId,
      title: 'Original Title',
      showInNav: true,
    })
    const pageId = created.id as string

    const pages = new PagesPage(page)
    await pages.goto()

    // Sanity: the item appears with the original title
    await expect(pages.pageItem(pageId)).toContainText('Original Title')

    // Click rename pencil and submit a new name
    await pages.clickRenameButton(pageId)
    await expect(page.getByTestId(selectors.renameModal)).toBeVisible()
    await pages.submitRename('Renamed Title')

    // UI should reflect the new title
    await expect(pages.pageItem(pageId)).toContainText('Renamed Title')

    // Backend should agree
    const after = await api.getPages(portfolioId)
    const updated = after.find((p: { id: string }) => p.id === pageId)
    expect(updated.title).toBe('Renamed Title')
  })

  test('Homepage delete button is disabled and does not open the delete modal', async ({ page, api }) => {
    const portfolio = await api.getPortfolio()
    const portfolioId = portfolio.data.id

    // The seeded persona always has a homepage. Find it.
    const allPages = await api.getPages(portfolioId)
    const homepage = allPages.find((p: { isHomepage: boolean }) => p.isHomepage)
    expect(homepage, 'expected a homepage in seeded data').toBeDefined()

    const pages = new PagesPage(page)
    await pages.goto()

    const homepageItem = pages.pageItem(homepage.id)
    await expect(homepageItem).toBeVisible()

    const deleteBtn = homepageItem.getByTestId(selectors.pageItemDeleteBtn)
    await expect(deleteBtn).toBeDisabled()

    // Clicking a disabled button must not open the delete modal
    await deleteBtn.click({ force: true }).catch(() => {})
    await expect(page.getByTestId(selectors.deletePageModal)).not.toBeVisible()
  })
})
