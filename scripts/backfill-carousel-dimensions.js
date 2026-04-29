#!/usr/bin/env node
/**
 * Backfill carousel item dimensions from Asset table.
 *
 * The FeaturedCarouselEditor historically did not persist width/height
 * when assigning images to carousel items. This script looks up each
 * item's Asset by imageId and writes the dimensions into the
 * publishedContent and draftContent JSON so portrait detection works.
 *
 * Usage:
 *   cd /app && node scripts/backfill-carousel-dimensions.js
 *   cd /app && node scripts/backfill-carousel-dimensions.js --dry-run
 */

const DRY_RUN = process.argv.includes('--dry-run')

async function main() {
  // Dynamic import so script works whether run from app root or container
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()

  try {
    console.log(DRY_RUN ? '=== DRY RUN ===' : '=== LIVE RUN ===')

    const pages = await prisma.page.findMany({
      select: { id: true, slug: true, draftContent: true, publishedContent: true },
    })

    let totalUpdated = 0

    for (const page of pages) {
      for (const field of ['draftContent', 'publishedContent']) {
        const raw = page[field]
        if (!raw) continue

        let content
        try {
          content = typeof raw === 'string' ? JSON.parse(raw) : raw
        } catch {
          continue
        }

        const sections = content.sections || []
        let changed = false

        for (const section of sections) {
          if (section.type !== 'featured-carousel' && section.type !== 'featured-grid') continue
          const items = section.content?.items || section.items || []

          for (const item of items) {
            // Skip items that already have dimensions or no imageId
            if ((item.width && item.height) || !item.imageId) continue

            const asset = await prisma.asset.findUnique({
              where: { id: item.imageId },
              select: { width: true, height: true },
            })

            if (asset && asset.width && asset.height) {
              console.log(
                `  ${field} | "${item.title || item.id}": ` +
                `setting ${asset.width}x${asset.height} (was ${item.width ?? 'missing'}x${item.height ?? 'missing'})`
              )
              item.width = asset.width
              item.height = asset.height
              changed = true
            }
          }
        }

        if (changed) {
          totalUpdated++
          if (!DRY_RUN) {
            const serialized = typeof raw === 'string'
              ? JSON.stringify(content)
              : content
            await prisma.page.update({
              where: { id: page.id },
              data: { [field]: serialized },
            })
            console.log(`  ✓ Updated page "${page.slug}" ${field}`)
          } else {
            console.log(`  [dry-run] Would update page "${page.slug}" ${field}`)
          }
        }
      }
    }

    console.log(`\nDone. ${totalUpdated} content field(s) ${DRY_RUN ? 'would be' : ''} updated.`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error('Backfill failed:', err)
  process.exit(1)
})
