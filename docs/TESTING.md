# Testing Guide

This document describes the testing infrastructure for the portfolio application.

## Overview

The testing strategy focuses on:

1. **API-based test data population** - Fast, reliable setup via REST APIs
2. **E2E tests with Playwright** - Browser automation with stable selectors
3. **Human review workflows** - Populated portfolios for visual QA

## Quick Start

```bash
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
portfolio-builder/
├── playwright.config.ts           # E2E test configuration (root)
└── src/
    └── tests/
        └── e2e/
            ├── admin-workflow.spec.ts   # E2E test specs
            └── fixtures.ts              # API client, selectors
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

All interactive elements have `data-testid` attributes. See `src/tests/e2e/fixtures.ts` for the complete list, organized by component:

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

## Acceptance Testing with DTU

The DTU (Digital Twin Universe) acceptance environment provides an isolated, fully-populated instance for validating changes before they reach production.

**Profile:** `.amplifier/digital-twin-universe/profiles/portfolio-builder-acceptance.yaml`

### Prerequisites

- `amplifier-digital-twin` CLI installed
- Incus running on the host
- Git LFS: images in `test-assets/` are LFS-tracked — pull them before launch or Sharp will receive pointer files instead of real JPEGs and fail during population:

```bash
sudo apt-get install -y git-lfs   # one-time, if not installed
git lfs install                    # one-time per user
git lfs pull                       # run in repo root
```

### Launch

```bash
amplifier-digital-twin launch \
  .amplifier/digital-twin-universe/profiles/portfolio-builder-acceptance.yaml \
  --name portfolio-builder-acceptance
```

Provision takes a few minutes on first run (Node.js install, `npm ci`, Prisma migrations). The profile starts the Next.js dev server with `AUTH_DISABLED=true` — no Google OAuth required.

### Populate

After the readiness probe passes (`GET /api/portfolio` returns 200), populate with the Sarah Chen persona:

```bash
amplifier-digital-twin exec portfolio-builder-acceptance -- bash -lc \
  'cd /app && AUTH_DISABLED=true node scripts/populate-persona-api.js sarah-chen'
```

Population takes ~3 minutes on Raspberry Pi 5. Expected baseline when complete:

| Item | Count |
|------|-------|
| Portfolio rows | 1 (`Sarah Chen`) |
| Categories | 6 |
| Projects | 9 |
| Assets / images | 136 (each processed into 6 WebP variants) |

### Access

**From the host machine** (container bridge — always works from host):

```bash
incus list                                      # find container IP, e.g. 10.191.237.x
curl http://<container-ip>:3000/api/portfolio   # verify API
```

**From other LAN devices** (requires iptables NAT — see profile header for exact commands):

```text
http://192.168.1.203:3000/    # host LAN IP
```

**Via SSH tunnel** (no server changes needed):

```bash
ssh -L 3000:<container-ip>:3000 <user>@<host>
# then browse http://localhost:3000/
```

> **Note:** The Incus `user-1000` project forbids proxy devices, so standard port forwarding (`access.ports`) is not available. The container bridge IP (`10.191.237.x`) is only routable from the host machine itself. Use iptables NAT or SSH tunneling for browser access from other devices. iptables rules are ephemeral — reapply after each host reboot.

### Validation Guidance

Run non-destructive operations only:

- `GET` requests against any API or public route
- Browser smoke tests (public site, admin dashboard, image rendering)
- Log inspection: `amplifier-digital-twin exec portfolio-builder-acceptance -- bash -lc 'tail -50 /var/log/portfolio-builder.log'`

> **Warning:** Do not send `POST /api/admin/portfolio` with arbitrary or test payloads. This endpoint creates a portfolio row unconditionally and has no name validation. If multiple portfolio rows exist, the admin UI and public site resolve "the portfolio" through different queries (admin picks newest; public picks first-inserted), causing the admin panel to appear empty while the public site still shows data. The only safe portfolio creation flows are the standard onboarding wizard or the `populate-persona-api.js` script.

### Cleanup

```bash
amplifier-digital-twin destroy portfolio-builder-acceptance
```

Also remove any ephemeral iptables rules added for LAN access (see profile header comments for the exact rule set).

---

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
2. Verify selector name in `src/tests/e2e/fixtures.ts`
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
- Project root - Pollutes the workspace
- `src/tests/` - Reserved for test specs and fixtures

## E2E Test Coverage

The following workflows are covered by automated E2E tests:

### Admin Workflow (`admin-workflow.spec.ts`)

| Test | Coverage |
|------|----------|
| Admin sidebar display | Desktop and mobile responsive |
| Navigation to categories | Mobile hamburger menu handling |
| Category list/empty state | Conditional rendering |
| Create category modal | Form interaction |
| Create new category | Full CRUD flow |
| Project list display | Category-project relationship |

### Publish Workflow (`publish-workflow.spec.ts`)

| Test | Coverage |
|------|----------|
| Publish project → public verification | Full draft-to-published lifecycle |
| Unpublished content 404 | Draft content not visible publicly |
| Draft vs published status | Admin status indicator |
| Draft preview | Preview mode before publishing |
| Publish button state | Disabled when no changes |
| Settings publish | Theme/template changes |
| Page publish | Page content workflow |

### Mobile Responsive Testing

All admin workflow tests run against multiple viewports via Playwright config. The test helpers (`openMobileMenuIfNeeded`, `getNavContainer`) automatically adapt to viewport size.

## Manual Testing Areas

Some features require manual testing due to their complexity or reliance on browser APIs that are difficult to automate reliably.

### Rich Text Editor (TipTap/ProseMirror)

**Location:** Project descriptions, page sections with text content

**Why Manual:**
- TipTap uses ProseMirror's `contenteditable` implementation
- `contenteditable` behavior varies across browsers
- Keyboard shortcuts, selection handling, and cursor positioning are highly stateful
- Clipboard paste formatting is browser-dependent
- Playwright's `fill()` doesn't simulate real typing in contenteditable

**Test Scenarios:**
- [ ] Type and format text (bold, italic, links)
- [ ] Paste from external sources (Word, web pages)
- [ ] Undo/redo behavior
- [ ] Keyboard navigation within editor
- [ ] Mobile keyboard interaction

### Drag-and-Drop Reordering

**Location:** Category list, project list, section ordering, gallery images

**Why Manual:**
- DnD libraries (dnd-kit, react-beautiful-dnd) use pointer events
- Requires precise coordinate calculations that are fragile in automation
- Touch vs mouse behavior differs significantly
- Animation timing affects drop target detection
- Accessibility (keyboard reordering) needs separate testing

**Test Scenarios:**
- [ ] Drag category to reorder (mouse)
- [ ] Drag project cards to reorder
- [ ] Drag gallery images to reorder
- [ ] Drag sections within page editor
- [ ] Touch drag on mobile devices
- [ ] Keyboard-based reordering (accessibility)

### Image Upload with Progress

**Location:** Featured image picker, gallery upload, profile photo

**Why Manual:**
- File input interactions are limited in automation
- Upload progress UI depends on network timing
- Drag-drop file upload uses DataTransfer API
- Image validation (size, dimensions) needs real files
- Progress indicators are time-sensitive

**Test Scenarios:**
- [ ] Upload via file picker dialog
- [ ] Drag-drop files onto dropzone
- [ ] Progress bar during upload
- [ ] Error handling for invalid files (too large, wrong type)
- [ ] Cancel upload mid-progress
- [ ] Multiple file upload to gallery

### Section Editors

**Location:** `/admin/pages/{id}` - Hero, Gallery, Featured Carousel, etc.

**Why Manual:**
- Each section type has unique interactive controls
- Combines rich text, image upload, and ordering
- Complex state management between section types
- Real-time preview synchronization

**Test Scenarios:**
- [ ] Hero section: title, subtitle, background image
- [ ] Gallery section: add/remove/reorder images, captions
- [ ] Featured Carousel: select featured projects, ordering
- [ ] Text section: rich text editing
- [ ] Add/remove/reorder sections on page

## Known Mobile Limitations

Some tests are skipped on mobile viewports due to timing issues with animations and modal interactions.

### Category Modal Close Animation

**Affected Tests:**
- `admin-workflow.spec.ts` - "should create a new category"
- `crud-operations.spec.ts` - "should delete a category"

**Issue:** The category modal close animation timing is unreliable on mobile viewports. After form submission or deletion confirmation, the modal sometimes takes longer than expected to fully close, causing `not.toBeVisible()` assertions to flake.

**Root Cause:** Mobile viewports trigger different CSS transitions and touch-optimized animations. The combination of:
- Slower animation durations on mobile
- Touch event handling differences
- Viewport resize effects on modal positioning

...creates inconsistent timing that cannot be reliably awaited.

**Workaround:** These tests use `test.skip(isMobile, 'Modal close animation unreliable on mobile')` to skip on mobile viewports while still running on desktop.

### Publish Button State Detection

**Affected Tests:**
- `publish-workflow.spec.ts` - "should load project editor and navigate to public site"

**Issue:** The publish button state detection (enabled/disabled, text changes to "Published!") is unreliable on mobile viewports. The button state transitions don't always complete within expected timeouts.

**Workaround:** Test uses `test.skip(isMobile, 'Publish button state unreliable on mobile viewport')` to skip on mobile viewports.

### Publish Button Detection (Desktop)

**Test:** `should publish a project and verify it appears on public site`

**Issue:** The test cannot reliably click the publish button on the admin project editor page.

**Status:** Skipped pending investigation

**Future Fix:** Consider one of:
1. Add `data-testid` for modal animation state (e.g., `data-modal-state="closed"`)
2. Use `waitForFunction` to check computed styles
3. Disable animations in test mode via CSS media query `prefers-reduced-motion`

---

## Adding New Tests

### Test File Location

```
portfolio-builder/
├── playwright.config.ts             # E2E test configuration
└── src/
    └── tests/
        └── e2e/
            ├── fixtures.ts              # API client, selectors, test extensions
            ├── admin-workflow.spec.ts   # Admin CRUD tests
            └── publish-workflow.spec.ts # Publish lifecycle tests
```

Add new spec files to `src/tests/e2e/` with the naming pattern `{feature}-workflow.spec.ts`.

### Adding Test IDs to Components

1. **Add `data-testid` attribute to interactive elements:**

```tsx
// In your component
<button
  data-testid="my-feature-submit-btn"
  onClick={handleSubmit}
>
  Submit
</button>
```

2. **Follow the naming convention:**

```
[component]-[element]-[qualifier]

Examples:
- gallery-upload-btn
- section-editor-save-btn
- profile-photo-remove-btn
```

3. **For dynamic items, include the ID:**

```tsx
<div data-testid={`section-item-${section.id}`}>
  {/* section content */}
</div>
```

### Using fixtures.ts Selectors

1. **Add selector to `fixtures.ts`:**

```typescript
// src/tests/e2e/fixtures.ts
export const selectors = {
  // ... existing selectors
  
  // My new feature
  myFeatureContainer: 'my-feature-container',
  myFeatureSubmitBtn: 'my-feature-submit-btn',
  myFeatureItem: (id: string) => `my-feature-item-${id}`,
}
```

2. **Use in tests:**

```typescript
import { test, expect, selectors } from './fixtures'

test('should submit my feature', async ({ page }) => {
  await page.goto('/admin/my-feature')
  
  // Use centralized selector
  await page.getByTestId(selectors.myFeatureSubmitBtn).click()
  
  // Dynamic selector for list items
  await expect(page.getByTestId(selectors.myFeatureItem('123'))).toBeVisible()
})
```

3. **Use the API fixture for backend verification:**

```typescript
test('should create item via UI and verify via API', async ({ page, api }) => {
  // Perform UI action
  await page.getByTestId(selectors.myFeatureSubmitBtn).click()
  
  // Verify via API (add method to PortfolioAPI class in fixtures.ts)
  const items = await api.getMyFeatureItems()
  expect(items).toContainEqual(expect.objectContaining({ name: 'Test' }))
})
```

### Test Organization Guidelines

- **One workflow per file** - Keep tests focused on a single user journey
- **Use `test.describe` blocks** - Group related tests logically
- **Prefer API verification** - Use `api` fixture to verify state, not just UI
- **Handle responsive** - Use helpers like `openMobileMenuIfNeeded()` for mobile support
- **Clean test data** - Use `test:setup` before test runs for consistent state
