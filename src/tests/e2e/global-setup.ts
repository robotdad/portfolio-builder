/**
 * Global setup for Playwright E2E tests
 * 
 * Runs once before all tests to ensure a clean, known database state.
 * This makes tests reproducible and prevents state pollution between runs.
 */
import { execSync } from 'child_process'
import path from 'path'

export default async function globalSetup() {
  console.log('🔄 Resetting test database...')
  
  const projectRoot = path.resolve(__dirname, '../../..')
  
  try {
    // Run the populate script to reset database to known state
    execSync('node scripts/populate-persona-api.js', {
      cwd: projectRoot,
      stdio: 'inherit',
      timeout: 60000, // 60 second timeout
    })
    console.log('✅ Test database ready')
  } catch (error) {
    console.error('❌ Failed to populate test database:', error)
    throw error
  }
}
