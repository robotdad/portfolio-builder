#!/usr/bin/env tsx
/**
 * Database Reset Script
 * 
 * Safely resets the database by truncating all tables instead of deleting
 * the database file. This approach works even when the dev server is running
 * because it doesn't invalidate existing database connections.
 * 
 * Also cleans up storage files (local or Azure) to prevent orphaned files.
 * 
 * Usage: tsx scripts/reset-db.ts
 */

// Load environment variables (Next.js does this automatically, but tsx scripts don't)
// Load .env first, then .env.local with override to match Next.js precedence
import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local', override: true });

import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import { getStorageAsync } from '../lib/storage';

async function resetDatabase() {
  const dbPath = path.join(process.cwd(), 'src', 'prisma', 'dev.db');
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('🗑️  Resetting database...');

    // Clean up ALL storage files (handles orphaned files from prior resets)
    console.log('  Cleaning up storage files...');
    const storage = await getStorageAsync();
    const cleanedCount = await storage.deleteAllFiles();
    console.log(`  ✓ Cleaned ${cleanedCount} file(s) from storage`);

    // Disable foreign key constraints temporarily
    await prisma.$executeRawUnsafe('PRAGMA foreign_keys = OFF;');

    // Truncate all tables in the correct order (respecting foreign keys)
    const tables = [
      'ProjectGalleryImage',
      'Project',
      'Category',
      'Asset',
      'Page',
      'Portfolio',
    ];

    for (const table of tables) {
      await prisma.$executeRawUnsafe(`DELETE FROM "${table}";`);
      console.log(`  ✓ Cleared ${table}`);
    }

    // Re-enable foreign key constraints
    await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON;');

    console.log('✅ Database reset complete!');
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
