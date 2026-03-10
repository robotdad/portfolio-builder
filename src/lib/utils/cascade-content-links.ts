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
  category: string
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
 * Transform applied to each featured item.
 */
interface ItemTransform {
  /** Transform the `link` field. Return the original value for no change. */
  link: (link: string) => string
  /** Optional: transform the `category` field. */
  category?: (category: string) => string
}

/**
 * Parse a content blob, apply transforms to every featured item inside
 * `featured-carousel` and `featured-grid` sections, and return the
 * re-serialised string — or `null` when nothing changed.
 *
 * Content blobs can be either:
 *   - `{"sections":[...]}` (the standard wrapper from serializeSections)
 *   - `[...]` (raw array — legacy or edge case)
 */
function patchBlob(
  raw: string,
  transforms: ItemTransform,
): string | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    console.warn('[cascade-content-links] Skipping unparseable content blob')
    return null
  }

  // Unwrap: handle both {"sections":[...]} and raw [...] formats.
  let sections: AnySection[]
  let wrapped = false

  if (Array.isArray(parsed)) {
    sections = parsed as AnySection[]
  } else if (
    parsed !== null &&
    typeof parsed === 'object' &&
    'sections' in parsed &&
    Array.isArray((parsed as { sections: unknown }).sections)
  ) {
    sections = (parsed as { sections: AnySection[] }).sections
    wrapped = true
  } else {
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
      // Transform link
      if (typeof item.link === 'string') {
        const updatedLink = transforms.link(item.link)
        if (updatedLink !== item.link) {
          item.link = updatedLink
          changed = true
        }
      }

      // Transform category (when provided)
      if (transforms.category && typeof item.category === 'string') {
        const updatedCategory = transforms.category(item.category)
        if (updatedCategory !== item.category) {
          item.category = updatedCategory
          changed = true
        }
      }
    }
  }

  if (!changed) return null

  // Re-serialise in the same format we parsed.
  return wrapped
    ? JSON.stringify({ ...(parsed as object), sections })
    : JSON.stringify(sections)
}

// ---------------------------------------------------------------------------
// Shared fetch + patch + write infrastructure
// ---------------------------------------------------------------------------

/**
 * Fetch all content-bearing records for a portfolio, apply transforms,
 * and write back any that changed.
 */
async function applyToPortfolio(
  portfolioId: string,
  transforms: ItemTransform,
): Promise<void> {
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
    const newDraft = page.draftContent ? patchBlob(page.draftContent, transforms) : null
    const newPublished = page.publishedContent ? patchBlob(page.publishedContent, transforms) : null
    if (newDraft === null && newPublished === null) continue

    const data: Record<string, string> = {}
    if (newDraft !== null) data.draftContent = newDraft
    if (newPublished !== null) data.publishedContent = newPublished

    queue.push(
      prisma.page.update({ where: { id: page.id }, data })
        .then(() => undefined)
        .catch((err: unknown) => {
          console.error(`[cascade-content-links] Failed to update Page ${page.id}:`, err)
        }),
    )
  }

  for (const cat of categories) {
    const newDraft = cat.draftContent ? patchBlob(cat.draftContent, transforms) : null
    const newPublished = cat.publishedContent ? patchBlob(cat.publishedContent, transforms) : null
    if (newDraft === null && newPublished === null) continue

    const data: Record<string, string> = {}
    if (newDraft !== null) data.draftContent = newDraft
    if (newPublished !== null) data.publishedContent = newPublished

    queue.push(
      prisma.category.update({ where: { id: cat.id }, data })
        .then(() => undefined)
        .catch((err: unknown) => {
          console.error(`[cascade-content-links] Failed to update Category ${cat.id}:`, err)
        }),
    )
  }

  if (portfolio) {
    const newDraft = portfolio.categoryPageDraftContent
      ? patchBlob(portfolio.categoryPageDraftContent, transforms)
      : null
    const newPublished = portfolio.categoryPagePublishedContent
      ? patchBlob(portfolio.categoryPagePublishedContent, transforms)
      : null

    if (newDraft !== null || newPublished !== null) {
      const data: Record<string, string> = {}
      if (newDraft !== null) data.categoryPageDraftContent = newDraft
      if (newPublished !== null) data.categoryPagePublishedContent = newPublished

      queue.push(
        prisma.portfolio.update({ where: { id: portfolio.id }, data })
          .then(() => undefined)
          .catch((err: unknown) => {
            console.error(`[cascade-content-links] Failed to update Portfolio ${portfolio.id}:`, err)
          }),
      )
    }
  }

  await Promise.all(queue)
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
 * Also updates the `category` field on items when the category slug changed.
 */
export async function cascadeProjectLinkUpdate(
  portfolioId: string,
  oldPath: string, // e.g. "/photography/old-slug"
  newPath: string, // e.g. "/installations/new-slug"
): Promise<void> {
  const oldCategorySlug = oldPath.split('/').filter(Boolean)[0] || ''
  const newCategorySlug = newPath.split('/').filter(Boolean)[0] || ''

  const transforms: ItemTransform = {
    link: (link) => (link === oldPath ? newPath : link),
    // Only update category field when the category actually changed
    ...(oldCategorySlug !== newCategorySlug && {
      category: (cat) => (cat === oldCategorySlug ? newCategorySlug : cat),
    }),
  }

  await applyToPortfolio(portfolioId, transforms)
}

/**
 * When a category's slug changes, update all content blobs that reference
 * projects under that category.  The category slug is the first path segment,
 * so any link starting with `/{oldSlug}/` gets its prefix replaced with
 * `/{newSlug}/`.  The `category` field is also updated to match.
 */
export async function cascadeCategorySlugUpdate(
  portfolioId: string,
  oldCategorySlug: string,
  newCategorySlug: string,
): Promise<void> {
  const oldPrefix = `/${oldCategorySlug}/`
  const newPrefix = `/${newCategorySlug}/`

  const transforms: ItemTransform = {
    link: (link) =>
      link.startsWith(oldPrefix) ? newPrefix + link.slice(oldPrefix.length) : link,
    category: (cat) => (cat === oldCategorySlug ? newCategorySlug : cat),
  }

  await applyToPortfolio(portfolioId, transforms)
}

/**
 * One-time repair: reconcile ALL featured-carousel and featured-grid links
 * in a portfolio against the current project/category slugs in the database.
 *
 * Builds a lookup table from the current DB state, then rewrites every stale
 * link it finds.  Safe to run multiple times (idempotent).
 */
export async function repairAllContentLinks(
  portfolioId: string,
): Promise<{ repairedCount: number }> {
  // Build a lookup: projectId -> { link, category } from current DB state
  const projects = await prisma.project.findMany({
    where: { category: { portfolioId } },
    select: {
      id: true,
      slug: true,
      title: true,
      category: { select: { slug: true } },
    },
  })

  // Also build a title-based lookup for items that don't have an ID match
  // (the FeaturedWorkItem.id is a section-local ID, not the project DB ID)
  const titleToPath = new Map<string, { link: string; categorySlug: string }>()
  for (const p of projects) {
    const link = `/${p.category.slug}/${p.slug}`
    titleToPath.set(p.title, { link, categorySlug: p.category.slug })
  }

  // For each content blob, check each item.title against the lookup
  // and fix link + category if they don't match current DB state.
  const transforms: ItemTransform = {
    link: () => '', // placeholder — we use a custom patcher below
  }
  void transforms // not used directly; we use patchBlobWithRepair

  // Custom repair: walk blobs and fix items by title match
  let repairedCount = 0

  function repairBlob(raw: string): string | null {
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return null
    }

    let sections: AnySection[]
    let wrapped = false

    if (Array.isArray(parsed)) {
      sections = parsed as AnySection[]
    } else if (
      parsed !== null &&
      typeof parsed === 'object' &&
      'sections' in parsed &&
      Array.isArray((parsed as { sections: unknown }).sections)
    ) {
      sections = (parsed as { sections: AnySection[] }).sections
      wrapped = true
    } else {
      return null
    }

    let changed = false

    for (const section of sections) {
      if (section.type !== 'featured-carousel' && section.type !== 'featured-grid') continue
      const featured = section as FeaturedSection
      if (!Array.isArray(featured.items)) continue

      for (const item of featured.items) {
        if (typeof item.title !== 'string') continue
        const current = titleToPath.get(item.title as string)
        if (!current) continue

        if (typeof item.link === 'string' && item.link !== current.link) {
          item.link = current.link
          changed = true
          repairedCount++
        }
        if (typeof item.category === 'string' && item.category !== current.categorySlug) {
          item.category = current.categorySlug
          changed = true
        }
      }
    }

    if (!changed) return null
    return wrapped
      ? JSON.stringify({ ...(parsed as object), sections })
      : JSON.stringify(sections)
  }

  // Fetch everything, repair, write back
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
    const newDraft = page.draftContent ? repairBlob(page.draftContent) : null
    const newPublished = page.publishedContent ? repairBlob(page.publishedContent) : null
    if (newDraft === null && newPublished === null) continue

    const data: Record<string, string> = {}
    if (newDraft !== null) data.draftContent = newDraft
    if (newPublished !== null) data.publishedContent = newPublished

    queue.push(
      prisma.page.update({ where: { id: page.id }, data })
        .then(() => undefined)
        .catch((err: unknown) => {
          console.error(`[cascade-content-links] Repair: failed to update Page ${page.id}:`, err)
        }),
    )
  }

  for (const cat of categories) {
    const newDraft = cat.draftContent ? repairBlob(cat.draftContent) : null
    const newPublished = cat.publishedContent ? repairBlob(cat.publishedContent) : null
    if (newDraft === null && newPublished === null) continue

    const data: Record<string, string> = {}
    if (newDraft !== null) data.draftContent = newDraft
    if (newPublished !== null) data.publishedContent = newPublished

    queue.push(
      prisma.category.update({ where: { id: cat.id }, data })
        .then(() => undefined)
        .catch((err: unknown) => {
          console.error(`[cascade-content-links] Repair: failed to update Category ${cat.id}:`, err)
        }),
    )
  }

  if (portfolio) {
    const newDraft = portfolio.categoryPageDraftContent
      ? repairBlob(portfolio.categoryPageDraftContent)
      : null
    const newPublished = portfolio.categoryPagePublishedContent
      ? repairBlob(portfolio.categoryPagePublishedContent)
      : null

    if (newDraft !== null || newPublished !== null) {
      const data: Record<string, string> = {}
      if (newDraft !== null) data.categoryPageDraftContent = newDraft
      if (newPublished !== null) data.categoryPagePublishedContent = newPublished

      queue.push(
        prisma.portfolio.update({ where: { id: portfolio.id }, data })
          .then(() => undefined)
          .catch((err: unknown) => {
            console.error(`[cascade-content-links] Repair: failed to update Portfolio ${portfolio.id}:`, err)
          }),
      )
    }
  }

  await Promise.all(queue)
  return { repairedCount }
}
