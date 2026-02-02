/**
 * Seed script for Category and Project models
 *
 * Run with: npx tsx prisma/seed-categories.ts
 */

// Load environment variables (Next.js does this automatically, but tsx scripts don't)
// Only load if not already set (allows dotenv-cli to inject production vars)
import { config } from 'dotenv'
if (!process.env.DATABASE_URL) {
  config({ path: '.env' })
  config({ path: '.env.local', override: true })
}

import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const databaseUrl = process.env.DATABASE_URL ?? 'file:./dev.db'
const adapter = new PrismaLibSql({ url: databaseUrl })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding categories and projects...')

  // Get the first portfolio (or create one if none exists)
  let portfolio = await prisma.portfolio.findFirst()

  if (!portfolio) {
    console.log('Creating test portfolio...')
    portfolio = await prisma.portfolio.create({
      data: {
        name: 'Test Designer',
        title: 'Costume Designer',
        bio: 'A test portfolio for development',
        draftTheme: 'modern-minimal',
        publishedTheme: 'modern-minimal',
      },
    })
  }

  console.log(`Using portfolio: ${portfolio.name} (${portfolio.id})`)

  // Create categories
  const categories = [
    {
      name: 'Theatre',
      slug: 'theatre',
      description: 'Stage productions and live performances',
      order: 0,
    },
    {
      name: 'Film',
      slug: 'film',
      description: 'Feature films and short films',
      order: 1,
    },
    {
      name: 'Television',
      slug: 'television',
      description: 'TV series and specials',
      order: 2,
    },
    {
      name: 'Commercial',
      slug: 'commercial',
      description: 'Advertising and promotional content',
      order: 3,
    },
  ]

  // Sample projects for each category
  const projectsByCategory: Record<
    string,
    Array<{
      title: string
      slug: string
      year: string
      venue?: string
      isFeatured: boolean
    }>
  > = {
    theatre: [
      {
        title: 'Hamlet',
        slug: 'hamlet',
        year: '2023',
        venue: 'Royal Theatre Company',
        isFeatured: true,
      },
      {
        title: 'Les Misérables',
        slug: 'les-miserables',
        year: '2022',
        venue: 'Broadway Productions',
        isFeatured: false,
      },
    ],
    film: [
      {
        title: 'The Last Dawn',
        slug: 'the-last-dawn',
        year: '2023',
        venue: 'Paramount Pictures',
        isFeatured: true,
      },
      {
        title: 'Midnight Express',
        slug: 'midnight-express',
        year: '2022',
        isFeatured: false,
      },
    ],
    television: [
      {
        title: 'Crown & Country',
        slug: 'crown-and-country',
        year: '2023',
        venue: 'HBO',
        isFeatured: true,
      },
    ],
    commercial: [
      {
        title: 'Nike Campaign',
        slug: 'nike-campaign',
        year: '2023',
        venue: 'Nike Inc.',
        isFeatured: false,
      },
    ],
  }

  for (const cat of categories) {
    // Upsert category
    const category = await prisma.category.upsert({
      where: {
        portfolioId_slug: {
          portfolioId: portfolio.id,
          slug: cat.slug,
        },
      },
      update: {
        name: cat.name,
        description: cat.description,
        order: cat.order,
      },
      create: {
        portfolioId: portfolio.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        order: cat.order,
      },
    })
    console.log(`  ✓ Category: ${category.name}`)

    // Create projects for this category
    const projects = projectsByCategory[cat.slug] || []
    for (const proj of projects) {
      await prisma.project.upsert({
        where: {
          categoryId_slug: {
            categoryId: category.id,
            slug: proj.slug,
          },
        },
        update: {
          title: proj.title,
          year: proj.year,
          venue: proj.venue,
          isFeatured: proj.isFeatured,
        },
        create: {
          categoryId: category.id,
          title: proj.title,
          slug: proj.slug,
          year: proj.year,
          venue: proj.venue,
          isFeatured: proj.isFeatured,
        },
      })
      console.log(`    ✓ Created project: ${proj.title}${proj.isFeatured ? ' ⭐' : ''}`)
    }
  }

  // Summary
  const categoryCount = await prisma.category.count({ where: { portfolioId: portfolio.id } })
  const projectCount = await prisma.project.count({
    where: { category: { portfolioId: portfolio.id } },
  })
  const featuredCount = await prisma.project.count({
    where: { category: { portfolioId: portfolio.id }, isFeatured: true },
  })

  console.log('\n📊 Summary:')
  console.log(`   Categories: ${categoryCount}`)
  console.log(`   Projects: ${projectCount}`)
  console.log(`   Featured: ${featuredCount}`)
  console.log('\n✅ Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
