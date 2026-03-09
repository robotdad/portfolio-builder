#!/usr/bin/env tsx
/**
 * Database Reset Script
 *
 * Safely resets the database by truncating all tables.
 * Also cleans up storage files (local or Azure) to prevent orphaned files.
 *
 * Usage: tsx scripts/reset-db.ts
 */

// Load environment variables (Next.js does this automatically, but tsx scripts don't)
// Only load if not already set (allows dotenv-cli to inject production vars)
import { config } from 'dotenv'
if (!process.env.DATABASE_URL) {
  config({ path: '.env' })
  config({ path: '.env.local', override: true })
}

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { getStorageAsync } from '../lib/storage'

async function resetDatabase() {
  const connectionString =
    process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/portfolio'
  const adapter = new PrismaPg({ connectionString })
  const prisma = new PrismaClient({ adapter })

  try {
    console.log('Resetting database...')

    // Clean up ALL storage files (handles orphaned files from prior resets)
    console.log('  Cleaning up storage files...')
    const storage = await getStorageAsync()
    const cleanedCount = await storage.deleteAllFiles()
    console.log(`  Cleaned ${cleanedCount} file(s) from storage`)

    // Truncate content tables in the correct order (respecting foreign keys)
    // AllowedEmail is intentionally preserved — wiping it locks out all admins
    const tables = [
      'ProjectGalleryImage',
      'ProjectTag',
      'Tag',
      'Project',
      'Category',
      'Asset',
      'Page',
      'Portfolio',
    ]

    for (const table of tables) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`)
      console.log(`  Cleared ${table}`)
    }

    console.log('Database reset complete!')
  } catch (error) {
    console.error('Reset failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

resetDatabase()
