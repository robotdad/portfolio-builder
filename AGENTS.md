# Portfolio Builder - Agent Guide

Guidance for effective AI agent usage in this project.

---

## Skills & Bundles

This project uses `bundle:portfolio` which includes:

- **ts-dev** - TypeScript/React development agents
- **design-intelligence** - UX and design review agents  
- **lsp-typescript** - Code navigation and intelligence

**Additional skills** to load when needed:
- `playwright` - Browser automation for UI testing
- `image-vision` - Screenshot analysis for visual QA
- `curl` - API testing

---

## Agent Selection Reference

| Task | Agent |
|------|-------|
| Understand codebase | `foundation:explorer` |
| TypeScript/LSP tracing | `lsp-typescript:typescript-code-intel` |
| React patterns, hooks | `ts-dev:react-dev` |
| ESLint, type issues | `ts-dev:ts-dev` |
| Next.js (App Router, SSR) | `ts-dev:nextjs-dev` |
| Node.js/API scripts | `ts-dev:node-dev` |
| Layout, navigation UX | `design-intelligence:layout-architect` |
| Component design | `design-intelligence:component-designer` |
| Error messages, copy | `design-intelligence:voice-strategist` |
| Implementation | `foundation:modular-builder` |
| Debugging | `foundation:bug-hunter` |
| Git operations | `foundation:git-ops` |

---

## General Patterns

### ✅ What Works Well

**Investigate before implementing:**
- Use `foundation:explorer` to understand code structure FIRST
- Use `lsp-typescript:typescript-code-intel` to trace data flows
- THEN use `foundation:modular-builder` with proper context

**Delegate early:**
- Start delegating by turn 2-3, not turn 15
- Context length becomes a concern - delegate to preserve space
- When user says "use your agents", you're doing too much directly

**Consult design agents after exploration:**
- Identify issues first, then get design feedback
- Design agents give better guidance with specific context

### ❌ What Creates Problems

**Todo list churn:**
- Create once, update as you go - don't recreate constantly
- User can see todo activity and finds excessive churn distracting

**Agent timeouts:**
- Some agents may timeout (300s limit)
- When timeout occurs, continue with partial context - don't retry endlessly

**Over-automation:**
- Don't create scripts for everything
- Sometimes direct interaction is better

---

## Playwright Patterns

### Timing Issues (Critical)

```javascript
// ❌ WRONG: Arbitrary timeouts
await page.waitForTimeout(3000);

// ❌ WRONG: Race conditions with setTimeout
setTimeout(() => saveDraft(), 0); // Playwright won't wait

// ✅ CORRECT: Wait for visible UI changes
await expect(page.getByText('Saved')).toBeVisible();

// ✅ CORRECT: Wait for element state
await page.getByRole('button', { name: 'Save' }).waitFor({ state: 'enabled' });
```

### When to Use Playwright

| ✅ DO Use For | ❌ DON'T Use For |
|---------------|------------------|
| UI exploration and interaction | Bulk data population (use API) |
| Form submissions, workflows | Performance testing |
| Image uploads from test-assets | Simple GET requests (use curl) |
| Validating UI state | |
| Screenshots for vision analysis | |

### Selector Strategy

- Use `data-testid` selectors - all interactive elements have them
- See `src/tests/e2e/fixtures.ts` for centralized selector definitions
- File inputs are often hidden - use `page.locator('input[type="file"]').setInputFiles(path)`

---

## Image Vision Patterns

### Effective Workflow

```bash
# 1. Capture with Playwright
await page.screenshot({ path: 'ai_working/check.png' });

# 2. Analyze with vision
# Ask specific questions, not generic "describe this"

# 3. Act on findings or verify with code
```

### What Vision Is Good At

- Layout issues (spacing, hierarchy, missing elements)
- Color contrast problems
- Obvious alignment issues (>10px)
- Broken UI states

### What Vision Struggles With

- Font family differences at small sizes
- Precise alignment (<5px)
- Subtle typography variations

**Rule:** Use vision for TRIAGE, verify findings with code inspection.

---

## LSP Patterns

### Investigation Workflow

```
1. User reports issue
2. Delegate to lsp-typescript to trace data flow
3. LSP finds root cause with line numbers
4. Delegate to modular-builder for fix
```

### When to Use LSP vs Grep

| Use LSP | Use Grep |
|---------|----------|
| Find exact definition | Search text patterns |
| Trace data flow end-to-end | Bulk search across files |
| Understand call hierarchy | Find string occurrences |
| Complex type relationships | Simple text matching |

---

## Agent Composition Workflow

Recommended sequence for admin interface work:

```
1. foundation:explorer      → Understand structure
2. playwright + vision      → Explore UI, capture evidence  
3. design-intelligence:*    → Get UX feedback
4. lsp-typescript           → Trace specific issues
5. foundation:modular-builder → Implement fixes
6. playwright + vision      → Verify fixes
7. foundation:git-ops       → Commit with proper messages
```

---

## Testing

**Full documentation:** `docs/TESTING.md`

**Quick reference:**
```bash
npm run test:setup        # Reset DB + populate test data
npm run test:e2e          # Run Playwright tests
npm run test:e2e:ui       # Playwright UI mode
```

**Key conventions:**
- All interactive elements have `data-testid` attributes
- Selectors centralized in `src/tests/e2e/fixtures.ts`
- Use API population for setup, Playwright for UI verification
- **Never commit screenshots** - use `ai_working/screenshots/` (gitignored)

---

## Project Documentation

| Document | Content |
|----------|---------|
| `docs/API.md` | REST API endpoints, request/response formats |
| `docs/ARCHITECTURE.md` | Tech stack, project structure, data model |
| `docs/TESTING.md` | Test infrastructure, personas, E2E patterns |
| `README.md` | Setup, development, deployment |

---

## Test Data Scripts

### Persona Population

**Script:** `scripts/populate-persona-api.js`

Populates the database with complete persona portfolios using direct API calls (not UI automation).

```bash
# Populate a single persona
node scripts/populate-persona-api.js sarah-chen

# Available personas: sarah-chen, julian-vane, emma-rodriguez
```

**What it does:**
- Creates portfolio with bio, location, profile photos
- Creates categories with descriptions and featured images
- Creates projects with full metadata (venue, year, budget, etc.)
- Uploads all images and creates gallery sections
- Takes 10-20 seconds per persona

**When to use:**
- Setting up test data for development
- Resetting database to known state
- Demo preparation

### Image Generation

**Script:** `scripts/generate-persona-images.js`

Generates AI images for personas using prompts from `persona.json`.

```bash
# Generate all images for a persona
node scripts/generate-persona-images.js sarah-chen

# Generate only profile images
node scripts/generate-persona-images.js sarah-chen --profile-only

# Generate for a specific category
node scripts/generate-persona-images.js sarah-chen --category theater-production
```

**Features:**
- Uses identity reference (headshot) for consistency across images
- Skips existing images (incremental generation)
- Organized output to `images/profile/` and `images/categories/`

**Full documentation:** `test-assets/README.md`

---

## Issue Tracking

The `issue_manager` tool provides persistent issue tracking with dependency management. Use it to:

- Break down complex tasks into trackable issues
- Track blockers and dependencies between issues
- Find ready work (issues with no blockers)
- Link issues to Amplifier sessions for context

### Common Operations

```
# Create an issue
issue_manager(operation="create", params={title: "...", issue_type: "task", priority: 2})

# List open issues
issue_manager(operation="list", params={status: "open"})

# Get issues ready to work on (no blockers)
issue_manager(operation="get_ready")

# Check what's blocked
issue_manager(operation="get_blocked")

# Update an issue
issue_manager(operation="update", params={issue_id: "...", status: "in_progress"})

# Close an issue
issue_manager(operation="close", params={issue_id: "...", reason: "Completed"})
```

### Priority Levels

| Priority | Level | Use For |
|----------|-------|---------|
| 0 | Critical | Blocking issues, production bugs |
| 1 | High | Important features, significant bugs |
| 2 | Normal | Standard tasks (default) |
| 3 | Low | Nice-to-have, minor improvements |
| 4 | Deferred | Future consideration |

### When to Use Issues vs Todos

| Use Issues | Use Todos |
|------------|-----------|
| Multi-session work | Single session tasks |
| Complex dependencies | Simple sequential steps |
| Need to track blockers | Linear workflow |
| Want session history | Ephemeral tracking |

---

## Key Takeaways

1. **Delegate early** - Use agents from turn 2-3 to preserve context
2. **Investigate first** - LSP trace before guessing at fixes
3. **Vision for triage** - Verify findings with code inspection
4. **Fix async issues** - setTimeout breaks Playwright timing
5. **Use test-assets** - Personas and images exist for testing
6. **Organize artifacts** - Screenshots in ai_working/, not committed
7. **Use issue_manager** - For complex multi-session work with dependencies
8. **Populate via API** - Use scripts, not UI automation, for test data

---

*Based on sessions 3350e6b6, 18d9144c, and d59ce54f.*
