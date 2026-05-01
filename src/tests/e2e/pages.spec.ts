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
})
