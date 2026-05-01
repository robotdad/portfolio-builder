/**
 * Global setup for Playwright E2E tests
 * 
 * Runs once before all tests to ensure a clean, known database state.
 * This makes tests reproducible and prevents state pollution between runs.
 */
import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

// ESM-compatible __dirname (package.json has "type": "module")
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default async function globalSetup() {
  const projectRoot = path.resolve(__dirname, '../../..')

  // In development (reuseExistingServer), DATABASE_URL may not be available in this
  // subprocess — skip destructive reset to protect the running server's database.
  if (!process.env.DATABASE_URL) {
    console.log('⚠️  DATABASE_URL not set — skipping database reset (reusing existing server state)')
    return
  }

  console.log('🗑️  Resetting test database...')
  try {
    // Reset database to clean state
    execSync('npx prisma db push --force-reset --accept-data-loss', {
      cwd: path.join(projectRoot, 'src'),
      stdio: 'inherit',
      timeout: 30000,
    })
  } catch (error) {
    console.error('❌ Failed to reset database:', error)
    throw error
  }

  console.log('🔄 Populating test data...')
  try {
    // Run the populate script to set up known test state
    execSync('node scripts/populate-persona-api.js', {
      cwd: projectRoot,
      stdio: 'inherit',
      timeout: 60000,
    })
    console.log('✅ Test database ready')
  } catch (error) {
    console.error('❌ Failed to populate test database:', error)
    throw error
  }
}
