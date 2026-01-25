/**
 * Seed script for adding admin emails to the allowlist.
 *
 * Usage: npm run db:seed-admin <email>
 * Example: npm run db:seed-admin admin@example.com
 */

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

// Use same adapter pattern as lib/prisma.ts
const dbPath = path.join(process.cwd(), 'src', 'prisma', 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('Usage: npm run db:seed-admin <email>')
    console.error('Example: npm run db:seed-admin admin@example.com')
    process.exit(1)
  }

  const normalizedEmail = email.toLowerCase()

  try {
    const result = await prisma.allowedEmail.upsert({
      where: { email: normalizedEmail },
      update: {}, // No update needed if exists
      create: { email: normalizedEmail },
    })

    console.log(`✓ Admin email added: ${result.email}`)
    console.log(`  ID: ${result.id}`)
    console.log(`  Created: ${result.createdAt.toISOString()}`)
  } catch (error) {
    console.error('Failed to add admin email:', error)
    process.exit(1)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
