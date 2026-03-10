import { prisma } from '@/lib/prisma'

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Minimal shape we care about when walking content blobs.
 * We use `unknown` everywhere else and narrow only what we need.
 */
interface FeaturedItem {
  link: string
  [key: string]: unknown
}

interface FeaturedSection {
  type: 'featured-carousel' | 'featured-grid'
  items: FeaturedItem[]
  [key: string]: unknown
}

interface AnySection {
  type: string
  [key: string]: unknown
}

/**
 * Parse a content blob, apply `transform` to every `item.link` inside
 * `featured-carousel` and `featured-grid` sections, and return the
 * re-serialised string — or `null` when nothing changed (or the blob
 * was unparseable / not an array).
 */
function patchBlob(
  raw: string,
  transform: (link: string) => string,
): string | null {
  let sections: AnySection[]

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    sections = parsed as AnySection[]
  } catch {
    // User-controlled content — malformed JSON should not crash the server.
    console.warn('[cascade-content-links] Skipping unparseable content blob')
    return null
  }

  let changed = false

  for (const section of sections) {
    if (section.type !== 'featured-carousel' && section.type !== 'featured-grid') {
      continue
    }

    const featured = section as FeaturedSection
    if (!Array.isArray(featured.items)) continue

    for (const item of featured.items) {
      if (typeof item.link !== 'string') continue

      const updated = transform(item.link)
      if (updated !== item.link) {
        item.link = updated
        changed = true
      }
    }
  }

  return changed ? JSON.stringify(sections) : null
}

/**
 * Collect and fire off Prisma update promises for a pair of draft/published
 * blobs.  Pushes a self-contained promise (that logs but does not rethrow)
 * onto `queue` so callers can `Promise.all(queue)` at the end.
 */
function enqueueUpdate(
  queue: Promise<void>[],
  updater: (data: Record<string, string>) => Promise<unknown>,
  blobId: string,
  modelLabel: string,
  raw: { draft: string | null; published: string | null },
  transform: (link: string) => string,
): void {
  const newDraft = raw.draft ? patchBlob(raw.draft, transform) : null
  const newPublished = raw.published ? patchBlob(raw.published, transform) : null

  if (newDraft === null && newPublished === null) return

  const data: Record<string, string> = {}
  if (newDraft !== null) data.draftContent = newDraft
  if (newPublished !== null) data.publishedContent = newPublished

  queue.push(
    updater(data)
      .then(() => undefined)
      .catch((err: unknown) => {
        console.error(
          `[cascade-content-links] Failed to update ${modelLabel} ${blobId}:`,
          err,
        )
      }),
  )
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * When a project's URL path changes (due to rename or category move),
 * update all content blobs that reference the old path.
 *
 * Scoped to the project's portfolio to avoid cross-portfolio interference.
 * Uses exact path match so `/photo` cannot accidentally match `/photography`.
 */
export async function cascadeProjectLinkUpdate(
  portfolioId: string,
  oldPath: string, // e.g. "/photography/old-slug"
  newPath: string, // e.g. "/installations/new-slug"
): Promise<void> {
  const transform = (link: string) => (link === oldPath ? newPath : link)

  // Fetch all content-bearing records for this portfolio in parallel.
  const [pages, categories, portfolio] = await Promise.all([
    prisma.page.findMany({
      where: {
        portfolioId,
        OR: [{ draftContent: { not: null } }, { publishedContent: { not: null } }],
      },
      select: { id: true, draftContent: true, publishedContent: true },
    }),
    prisma.category.findMany({
      where: {
        portfolioId,
        OR: [{ draftContent: { not: null } }, { publishedContent: { not: null } }],
      },
      select: { id: true, draftContent: true, publishedContent: true },
    }),
    prisma.portfolio.findUnique({
      where: { id: portfolioId },
      select: {
        id: true,
        categoryPageDraftContent: true,
        categoryPagePublishedContent: true,
      },
    }),
  ])

  const queue: Promise<void>[] = []

  for (const page of pages) {
    enqueueUpdate(
      queue,
      (data) => prisma.page.update({ where: { id: page.id }, data }),
      page.id,
      'Page',
      { draft: page.draftContent, published: page.publishedContent },
      transform,
    )
  }

  for (const category of categories) {
    enqueueUpdate(
      queue,
      (data) => prisma.category.update({ where: { id: category.id }, data }),
      category.id,
      'Category',
      { draft: category.draftContent, published: category.publishedContent },
      transform,
    )
  }

  if (portfolio) {
    // Portfolio uses different column names — map them through a thin wrapper.
    const newDraft = portfolio.categoryPageDraftContent
      ? patchBlob(portfolio.categoryPageDraftContent, transform)
      : null
    const newPublished = portfolio.categoryPagePublishedContent
      ? patchBlob(portfolio.categoryPagePublishedContent, transform)
      : null

    if (newDraft !== null || newPublished !== null) {
      const data: Record<string, string> = {}
      if (newDraft !== null) data.categoryPageDraftContent = newDraft
      if (newPublished !== null) data.categoryPagePublishedContent = newPublished

      queue.push(
        prisma.portfolio
          .update({ where: { id: portfolio.id }, data })
          .then(() => undefined)
          .catch((err: unknown) => {
            console.error(
              `[cascade-content-links] Failed to update Portfolio ${portfolio.id}:`,
              err,
            )
          }),
      )
    }
  }

  await Promise.all(queue)
}

/**
 * When a category's slug changes, update all content blobs that reference
 * projects under that category.  The category slug is the first path segment,
 * so any link starting with `/{oldCategorySlug}/` gets its prefix replaced
 * with `/{newCategorySlug}/`.
 */
export async function cascadeCategorySlugUpdate(
  portfolioId: string,
  oldCategorySlug: string,
  newCategorySlug: string,
): Promise<void> {
  const oldPrefix = `/${oldCategorySlug}/`
  const newPrefix = `/${newCategorySlug}/`

  const transform = (link: string) =>
    link.startsWith(oldPrefix) ? newPrefix + link.slice(oldPrefix.length) : link

  // Reuse the same fetch + patch + write logic via cascadeProjectLinkUpdate's
  // infrastructure, but with our prefix-replacement transform instead of an
  // exact match.  To avoid duplicating the fetch logic we inline it here with
  // the same structure.
  const [pages, categories, portfolio] = await Promise.all([
    prisma.page.findMany({
      where: {
        portfolioId,
        OR: [{ draftContent: { not: null } }, { publishedContent: { not: null } }],
      },
      select: { id: true, draftContent: true, publishedContent: true },
    }),
    prisma.category.findMany({
      where: {
        portfolioId,
        OR: [{ draftContent: { not: null } }, { publishedContent: { not: null } }],
      },
      select: { id: true, draftContent: true, publishedContent: true },
    }),
    prisma.portfolio.findUnique({
      where: { id: portfolioId },
      select: {
        id: true,
        categoryPageDraftContent: true,
        categoryPagePublishedContent: true,
      },
    }),
  ])

  const queue: Promise<void>[] = []

  for (const page of pages) {
    enqueueUpdate(
      queue,
      (data) => prisma.page.update({ where: { id: page.id }, data }),
      page.id,
      'Page',
      { draft: page.draftContent, published: page.publishedContent },
      transform,
    )
  }

  for (const category of categories) {
    enqueueUpdate(
      queue,
      (data) => prisma.category.update({ where: { id: category.id }, data }),
      category.id,
      'Category',
      { draft: category.draftContent, published: category.publishedContent },
      transform,
    )
  }

  if (portfolio) {
    const newDraft = portfolio.categoryPageDraftContent
      ? patchBlob(portfolio.categoryPageDraftContent, transform)
      : null
    const newPublished = portfolio.categoryPagePublishedContent
      ? patchBlob(portfolio.categoryPagePublishedContent, transform)
      : null

    if (newDraft !== null || newPublished !== null) {
      const data: Record<string, string> = {}
      if (newDraft !== null) data.categoryPageDraftContent = newDraft
      if (newPublished !== null) data.categoryPagePublishedContent = newPublished

      queue.push(
        prisma.portfolio
          .update({ where: { id: portfolio.id }, data })
          .then(() => undefined)
          .catch((err: unknown) => {
            console.error(
              `[cascade-content-links] Failed to update Portfolio ${portfolio.id}:`,
              err,
            )
          }),
      )
    }
  }

  await Promise.all(queue)
}
