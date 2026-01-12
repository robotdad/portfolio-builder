# Testing Guide

This document describes the testing infrastructure for the portfolio application.

## Overview

The testing strategy focuses on:

1. **API-based test data population** - Fast, reliable setup via REST APIs
2. **E2E tests with Playwright** - Browser automation with stable selectors
3. **Human review workflows** - Populated portfolios for visual QA

## Quick Start

```bash
cd src

# Reset database and populate with test data
npm run test:setup

# Run E2E tests
npm run test:e2e

# Run tests with UI (for debugging)
npm run test:e2e:ui
```

## Test Data

### Personas

Test data is organized as "personas" - complete portfolio datasets with realistic content:

| Persona | Description | Images |
|---------|-------------|--------|
| `sarah-chen` | Contemporary artist | 77 |
| `emma-rodriguez` | Photographer | 58 |
| `julian-vane` | Designer | 62 |

Persona data lives in `test-assets/personas/{id}/`:
- `persona.json` - Portfolio structure (categories, projects, metadata)
- `images/` - Sample images for uploads

### Population Scripts

```bash
# Populate specific persona
npm run test:populate:sarah
npm run test:populate:emma
npm run test:populate:julian

# Reset and populate (clean slate)
npm run test:setup
```

The population script (`scripts/populate-persona-api.js`) uses the REST API directly - no browser automation. This is fast (~5-10 seconds) and reliable.

## E2E Tests

### Structure

```
tests/
├── e2e/
│   ├── admin-workflow.spec.ts   # Admin CRUD operations
│   └── fixtures.ts              # API client, selectors
└── (legacy scripts in root)     # Ad-hoc exploration scripts
```

### Running Tests

```bash
npm run test:e2e           # Run all tests (headless)
npm run test:e2e:headed    # Run with visible browser
npm run test:e2e:ui        # Playwright UI mode (best for debugging)
```

### Writing Tests

Tests use `data-testid` selectors for stability. Import from fixtures:

```typescript
import { test, expect, selectors } from './fixtures'

test('should create category', async ({ page, api }) => {
  await page.goto('/admin/categories')
  
  // Use centralized selectors
  await page.getByTestId(selectors.categoryCreateBtn).click()
  await page.getByTestId(selectors.categoryFormNameInput).fill('Test')
  await page.getByTestId(selectors.categoryFormSubmitBtn).click()
  
  // Use API fixture for verification
  const categories = await api.getCategories()
  expect(categories).toContainEqual(expect.objectContaining({ name: 'Test' }))
})
```

### Available Selectors

All interactive elements have `data-testid` attributes. See `tests/e2e/fixtures.ts` for the complete list, organized by component:

- **Navigation**: `admin-sidebar`, `hamburger-btn`, `nav-item-*`
- **Categories**: `category-list`, `category-form-*`, `category-item-*`
- **Projects**: `project-list`, `project-form-*`, `project-card-*`
- **Modals**: `*-modal`, `*-modal-overlay`, `*-modal-close-btn`
- **Image Pickers**: `featured-image-*`, `gallery-*`, `image-picker-*`
- **Settings**: `settings-*`, `publish-btn`

## Human Review Workflow

For manual QA or visual testing:

1. **Reset and populate**: `npm run test:setup`
2. **Start dev server**: `npm run dev`
3. **Review admin**: http://localhost:3000/admin
4. **Review public site**: http://localhost:3000/{portfolio-slug}

The populated portfolio has:
- Multiple categories with featured images
- Projects with galleries and metadata
- Profile photo and bio
- Theme and template settings applied

## AI-Assisted Testing

The `data-testid` attributes enable AI assistants (like Claude with Playwright MCP) to:

1. **Navigate reliably** - No CSS class or text matching fragility
2. **Identify elements** - Clear semantic naming
3. **Verify state** - Check for specific test IDs to confirm UI state

### Naming Convention

```
[component]-[element]-[qualifier]

Examples:
- category-form-name-input
- project-card-delete-btn
- delete-category-modal-confirm-btn
```

### Dynamic IDs

List items include their database ID:
- `category-item-{id}`
- `project-card-{id}`
- `gallery-image-{index}`

## npm Scripts Reference

| Script | Description |
|--------|-------------|
| `test:e2e` | Run Playwright tests (headless) |
| `test:e2e:ui` | Run with Playwright UI |
| `test:e2e:headed` | Run with visible browser |
| `test:populate` | Populate default persona |
| `test:populate:sarah` | Populate Sarah Chen persona |
| `test:populate:emma` | Populate Emma Rodriguez persona |
| `test:populate:julian` | Populate Julian Vane persona |
| `test:reset` | Delete database and recreate schema |
| `test:setup` | Reset + populate Sarah (clean slate) |

## Troubleshooting

### Tests fail to start

Ensure the dev server is running or let Playwright start it:
```bash
# Playwright auto-starts server via webServer config
npm run test:e2e

# Or start manually first
npm run dev &
npm run test:e2e
```

### Selectors not found

1. Check the component has `data-testid` attribute
2. Verify selector name in `tests/e2e/fixtures.ts`
3. Use Playwright UI mode to inspect the page

### Database state issues

Reset to clean state:
```bash
npm run test:setup
```

## Screenshots

When capturing screenshots during testing or debugging:

**Location:** `ai_working/screenshots/`

This directory is:
- Gitignored (screenshots won't be committed)
- Preserved across sessions (unlike temp directories)
- Organized by purpose (create subdirs as needed)

**Example workflow:**
```javascript
// In Playwright scripts
await page.screenshot({ path: 'ai_working/screenshots/admin-dashboard.png' });

// For debugging specific issues
await page.screenshot({ path: 'ai_working/screenshots/debug/carousel-bug.png' });
```

**Do NOT put screenshots in:**
- `tests/screenshots/` - Legacy location, gitignored but cluttered
- Project root - Pollutes the workspace
- `tests/` - Reserved for test specs and fixtures
