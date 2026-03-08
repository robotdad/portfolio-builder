# Portfolio Builder - Agent Guide

Guidance for effective AI agent usage in this project.

---

## Skills & Bundles

This project uses `bundle:portfolio` which includes:

- **ts-dev** - TypeScript/React development agents and LSP code intelligence
- **design-intelligence** - UX and design review agents
- **browser-tester** - Live browser automation, visual documentation, and UI research

**Additional skills** to load when needed:
- `curl` - API testing (for lightweight HTTP checks not needing a real browser)

---

## Agent Selection Reference

| Task | Agent |
|------|-------|
| Understand codebase | `foundation:explorer` |
| TypeScript/LSP tracing | `ts-dev:typescript-code-intel` |
| React patterns, hooks | `ts-dev:react-dev` |
| ESLint, type issues | `ts-dev:ts-dev` |
| Next.js (App Router, SSR) | `ts-dev:nextjs-dev` |
| Node.js/API scripts | `ts-dev:node-dev` |
| Layout, navigation UX | `design-intelligence:layout-architect` |
| Component design | `design-intelligence:component-designer` |
| Error messages, copy | `design-intelligence:voice-strategist` |
| Navigate/interact with live UI | `browser-tester:browser-operator` |
| Screenshots, visual docs | `browser-tester:visual-documenter` |
| Research sites / extract data | `browser-tester:browser-researcher` |
| Implementation | `foundation:modular-builder` |
| Debugging | `foundation:bug-hunter` |
| Git operations | `foundation:git-ops` |

---

## General Patterns

### ✅ What Works Well

**Investigate before implementing:**
- Use `foundation:explorer` to understand code structure FIRST
- Use `ts-dev:typescript-code-intel` to trace data flows
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

## Browser Testing (browser-tester agents)

Use browser-tester agents instead of manual Playwright scripts for all live UI work. These agents handle browser automation, screenshot capture, and research natively — no skill loading required.

### Which Agent to Use

| Need | Agent | Use For |
|------|-------|---------|
| Interact with live UI | `browser-tester:browser-operator` | Navigation, forms, clicks, data extraction, UX testing |
| Visual documentation | `browser-tester:visual-documenter` | Screenshots, responsive testing, before/after comparisons |
| Research / extract data | `browser-tester:browser-researcher` | Multi-page exploration, docs lookup, competitor research |

### When to Use browser-tester vs Other Tools

| ✅ Use browser-tester | ❌ DON'T Use For |
|----------------------|------------------|
| UI exploration and interaction | Bulk data population (use API scripts) |
| Form submissions, workflows | Simple GET requests (use `curl` skill) |
| Image uploads from test-assets | Running Playwright test suite (`npm run test:e2e`) |
| Screenshots for visual verification | |
| Responsive/viewport testing | |

### Delegation Examples

```
# Explore and document the UI
delegate(agent="browser-tester:browser-operator",
         instruction="Go to http://localhost:3000/admin, log in as test user, and describe the dashboard layout")

# Capture screenshots for review
delegate(agent="browser-tester:visual-documenter",
         instruction="Screenshot the portfolio home page at desktop (1440px), tablet (768px), and mobile (375px)")

# Research an external site
delegate(agent="browser-tester:browser-researcher",
         instruction="Go to https://vercel.com and extract how they structure their case study pages")
```

### Admin Authentication

Admin pages at `/admin/*` require authentication. Browser agents should generate a session token using `AUTH_SECRET` from `.env.local` to access these pages programmatically — the same way the Playwright test suite authenticates.

**Rules:**
- **DO** read `AUTH_SECRET` from `.env.local` and use it to generate a valid session cookie
- **DO** reuse an authenticated browser agent session via `session_id` for follow-up work instead of spawning fresh agents that have to re-authenticate
- **NEVER** modify `.env.local` or any auth configuration (e.g. setting `AUTH_DISABLED=true`)
- **NEVER** weaken, bypass, or disable authentication in code or environment

### Notes on Playwright Test Suite

The Playwright test suite (`npm run test:e2e`) is a separate thing — run it directly from the terminal, not via browser-tester agents:

```bash
npm run test:setup    # Reset DB + populate test data
npm run test:e2e      # Run Playwright tests
npm run test:e2e:ui   # Playwright UI mode
```

**Key conventions for the test suite:**
- All interactive elements have `data-testid` attributes
- Selectors centralized in `src/tests/e2e/fixtures.ts`
- Use API population for setup, Playwright for UI verification
- **Never commit screenshots** — use `ai_working/screenshots/` (gitignored)

### Visual Triage Rule

Use browser-tester:visual-documenter for TRIAGE (layout issues, broken states, spacing). Verify precise findings with code inspection — vision can miss sub-5px alignment details and subtle font differences.

---

## LSP Patterns

### Investigation Workflow

```
1. User reports issue
2. Delegate to ts-dev:typescript-code-intel to trace data flow
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

Recommended sequence for UI/admin interface work:

```
1. foundation:explorer      → Understand structure
2. browser-tester:*         → Explore UI, capture evidence  
3. design-intelligence:*    → Get UX feedback
4. ts-dev:typescript-code-intel → Trace specific issues
5. foundation:modular-builder → Implement fixes
6. browser-tester:visual-documenter → Verify fixes
7. foundation:git-ops       → Commit with proper messages
```

---

## Testing

**Full documentation:** `docs/TESTING.md`

**Quick reference (run from project root):**
```bash
npm run db:generate       # Generate Prisma client (after fresh install)
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

## AI Working Directory

**Location:** `ai_working/`

This is the **only** place for AI agent temporary work. Every session must use it.

### Date Folder Convention (Required)

**Always** create a date folder for your session's work using `YYYY-MM-DD` format:

```
ai_working/YYYY-MM-DD/your-analysis.md
ai_working/YYYY-MM-DD/your-script.js
ai_working/YYYY-MM-DD/screenshots/capture.png
```

Multiple sessions on the same date share the date folder. Use descriptive filenames to avoid collisions.

### What Goes Here

| Content | Location |
|---------|----------|
| Analysis docs, specs, plans | `ai_working/YYYY-MM-DD/ANALYSIS.md` |
| Session summaries | `ai_working/YYYY-MM-DD/SESSION_SUMMARY.md` |
| Temporary scripts | `ai_working/YYYY-MM-DD/verify-fixes.js` |
| Screenshots | `ai_working/YYYY-MM-DD/screenshots/` (gitignored) |
| Recipe files | `ai_working/YYYY-MM-DD/my-recipe.yaml` |
| Reference data, JSON exports | `ai_working/YYYY-MM-DD/data.json` |

### What Is Gitignored

Images and binary artifacts are automatically excluded everywhere under `ai_working/`:
- All image formats (`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`)
- All `screenshots*/` directories
- Base64 encoded files (`.b64`, `.b64.txt`, `*_uri.txt`)

Text artifacts (`.md`, `.yaml`, `.json`, `.js`, `.py`) are **tracked** and serve as useful session history.

### Rules

- **Always** use a date folder — never dump files in `ai_working/` root
- **Never** create folders or leave files in the project root
- **Never** leave intermediate artifacts outside `ai_working/`
- **Never** commit screenshots — they are gitignored automatically

See `ai_working/README.md` for full guidelines.

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
3. **Vision for triage** - Use browser-tester:visual-documenter; verify precise findings with code inspection
4. **Fix async issues** - setTimeout breaks the Playwright test suite timing
5. **Use test-assets** - Personas and images exist for testing
6. **Organize artifacts** - Screenshots in ai_working/, not committed
7. **Use issue_manager** - For complex multi-session work with dependencies
8. **Populate via API** - Use scripts, not UI automation, for test data

---

*Based on sessions 3350e6b6, 18d9144c, and d59ce54f.*
