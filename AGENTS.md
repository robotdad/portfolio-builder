# Portfolio Builder - Agent Usage Guide

This document captures lessons learned from development and testing sessions, providing guidance for effective agent usage, tooling patterns, and common pitfalls to avoid.

---

## Overview

This portfolio application is a Next.js-based project for costume designers to showcase their work. Development and testing has revealed important patterns for effective use of AI agents, Playwright automation, image vision analysis, and LSP code navigation.

---

## General Agent Usage Patterns

### ✅ What Worked Well

**Early Investigation Before Implementation:**
- Use `foundation:explorer` to understand existing code structure FIRST
- Use `lsp-typescript:typescript-code-intel` to trace data flows and find root causes
- THEN use `foundation:modular-builder` for implementation with proper context

**Design Agent Consultation:**
- `design-intelligence:layout-architect` for navigation hierarchy and layout structure
- `design-intelligence:component-designer` for component pattern validation
- Consult design agents AFTER identifying issues, not before exploration

**Specialized Agent Delegation:**
- Delegate to `lsp-typescript` for tracing TypeScript/React code issues
- Use `foundation:bug-hunter` for systematic debugging of navigation/routing issues
- Use `foundation:git-ops` for clean commits with proper messages

### ❌ What Created Noise/Confusion

**Todo List Churn:**
- Creating and recreating todo lists 10+ times in a session creates confusion
- Consolidate todos early, update them, don't recreate constantly
- User can see todo churn and finds it distracting

**Agent Timeout Recovery:**
- `foundation:zen-architect` and `foundation:modular-builder` may timeout (300s limit)
- When agents timeout, continue with your own implementation using their partial context
- Don't delegate the same task repeatedly if it times out

**Over-reliance on Automation:**
- Don't create scripts for everything - sometimes direct interaction is better
- User feedback > automated validation in exploratory testing

**Late Delegation:**
- Should use agents from turn 2-3, not turn 15
- When user says "use your agents", it's a signal you're doing too much directly
- Context length becomes concerning - delegate heavily to preserve space

---

## Playwright Best Practices

### Critical Mistakes Identified

#### 1. **Script Organization Disaster** ❌

**What Happened:**
```bash
# Session created 24+ test scripts scattered across:
ai_working/explore-admin.js
ai_working/validate-consistency.js  
ai_working/populate-sarah-portfolio.js
# ... and many more in root directory
```

**Problems:**
- Scripts littered root directory and ai_working/
- Scripts were being checked into git
- No clear organization or cleanup strategy

**Correct Pattern:**
```bash
# Organize test scripts properly
tests/
  ├── exploratory/
  │   ├── admin-exploration.js
  │   └── feature-validation.js
  ├── population/
  │   └── populate-test-data.js
  └── README.md  # Document what each script does

# Add to .gitignore
ai_working/
tests/*.png
tests/*.json
```

#### 2. **API Automation Instead of UI Exploration** ❌

**What Happened:**
- Session used API calls to create categories/projects instead of Playwright
- User expected actual UI interaction with test-assets images
- "I really expected you to explore the site with playwright and use the test-assets profile for sarah to add images"

**Wrong Approach:**
```javascript
// Creating data via API instead of UI
const res = await fetch('/api/categories', {
  method: 'POST',
  body: JSON.stringify({ name: 'Shakespearean Tragedy' })
});
```

**Correct Approach:**
```javascript
// Actually USE the interface
const { chromium } = require('playwright');
const page = await browser.newPage();

await page.goto('http://localhost:3000/admin/categories');
await page.getByRole('button', { name: '+ New Category' }).click();
await page.getByLabel('Category Name').fill('Shakespearean Tragedy');
await page.getByRole('button', { name: 'Save' }).click();

// Upload images from test-assets
const imageInput = page.locator('input[type="file"]');
await imageInput.setInputFiles('test-assets/personas/sarah-chen/images/photo1.jpg');
```

#### 3. **Timeout and Race Condition Issues** ❌

**Problems Found:**
```javascript
// ❌ WRONG: Arbitrary timeouts
await page.waitForTimeout(3000); // Don't guess timing

// ❌ WRONG: setTimeout race conditions
setTimeout(() => {
  saveDraft(); // May not complete before Playwright continues
}, 0);

// ❌ WRONG: Waiting for network that never comes
await page.waitForResponse(/api\/upload/); // Timed out frequently
```

**Correct Patterns:**
```javascript
// ✅ CORRECT: Wait for visible UI changes
await expect(page.getByText('Saved successfully')).toBeVisible();

// ✅ CORRECT: Use async/await properly (fix applied in session)
onImageSelect={async (image) => {
  handleMetadataChange({ featuredImageId: image.id });
  await saveDraft(); // Wait for completion
}}

// ✅ CORRECT: Wait for element state, not network
await page.getByRole('button', { name: 'Save Draft' }).waitFor({ state: 'enabled' });
await page.getByRole('button', { name: 'Save Draft' }).click();
await expect(page.getByText('Draft saved')).toBeVisible();
```

#### 4. **Selector Strategy Issues**

**Lessons:**
- Use role-based selectors (`getByRole`, `getByLabel`) - they survive refactoring
- Avoid CSS selectors unless necessary
- Hidden file inputs need special handling:
  ```javascript
  // File inputs are usually hidden - locate by type
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(imagePath);
  ```

### When to Use Playwright

**✅ DO Use Playwright For:**
- Exploring admin interfaces interactively
- Testing form submissions and multi-step workflows
- Uploading images from test-assets to test file upload controls
- Validating UI state after actions
- Capturing screenshots for vision analysis

**❌ DON'T Use Playwright For:**
- Bulk data population (use API directly)
- Performance testing (use dedicated tools)
- Simple GET requests (use curl instead)

---

## Image Vision Integration Patterns

### Effective Workflow

**Pattern: Screenshot → Vision → Analysis**

```bash
# 1. Capture with Playwright
await page.screenshot({ path: 'admin-categories.png', fullPage: true });

# 2. Analyze with vision skill (use robust wrapper)
./vision-analyze-robust.sh admin-categories.png "Describe the admin interface. Are there any alignment issues with the navigation items?"

# 3. Act on findings
# Vision identified bullet misalignment → fix CSS
```

### Specific Use Cases

**UI Consistency Verification:**
```bash
# Captured multiple admin pages
step-01-dashboard.png
step-02-categories.png  
step-03-projects.png

# Used vision to compare headers
./vision-analyze.sh anthropic step-01-dashboard.png "What navigation elements are in the header?"
./vision-analyze.sh anthropic step-02-categories.png "Is there a breadcrumb trail? What does it show?"
```

**What Vision Is Good At:**
```bash
# Vision reliably detects:
- High-level layout issues (spacing, hierarchy, missing elements)
- Color contrast problems
- Obvious alignment issues (>10px differences)
- Broken UI states
```

**What Vision Struggles With:**
```bash
# Vision unreliable for:
- Font family differences (serif vs sans-serif at small sizes)
- Precise alignment (<5px differences)
- Subtle typography (weight, size variations at 14-16px)
```

### Vision Analysis Tips

1. **Be specific in prompts**: "Do any navigation items have decorative serifs (feet at letter ends) while others don't?" vs "Describe the navigation"
2. **Use for TRIAGE, verify with code**: Vision identifies area of concern → inspect computed styles for facts
3. **Check hierarchy**: "Is there a clear visual hierarchy showing parent-child relationships?" (vision is good at this)
4. **Provider fallback**: Use `vision-analyze-robust.sh` for auto-fallback (Gemini → Anthropic → OpenAI)
5. **Trust code over vision**: If vision says "looks fine" but user sees issue → inspect computed styles
6. **Stop after 2 contradictions**: If vision gives contradictory results twice → switch to DevTools inspection

---

## LSP for Node/TypeScript - Next.js/React Patterns

### Effective Investigation Workflow

**Pattern: Observe → Trace → Fix**

```bash
# 1. User reports: "Profile photo uploads but doesn't persist"

# 2. Delegate to LSP agent to trace
task agent=lsp-typescript:typescript-code-intel "Trace profile photo upload flow in Hero section editor. Why doesn't profilePhotoId persist to Portfolio record?"

# 3. LSP finds:
# - HeroSectionEditor saves to Page.draftContent (works)
# - Portfolio.profilePhotoId never updated (bug!)
# - saveDraft() only calls /api/pages/[id], not /api/portfolio

# 4. Fix identified → delegate to modular-builder
```

### Specific Patterns from Project

**Routing Architecture Investigation:**
```bash
# Problem: Pages navigation broken after Dashboard redesign
# LSP traced:
- PageNavSection generates /admin?pageId={id} URLs
- But page editor moved to /admin/pages/[id]
- Fix: Update getPageHref() and isPageActive() functions
```

**Component Data Flow Tracing:**
```bash
# Problem: Featured image upload times out in Playwright
# LSP found:
- FeaturedImagePicker uses setTimeout(() => saveDraft(), 0)
- Race condition: Playwright continues before save completes
- Fix: Change to async/await pattern
```

### LSP Usage Dos and Don'ts

**✅ DO:**
- Use LSP to find exact line numbers before making changes
- Trace data flow end-to-end (component → API → database)
- Understand existing patterns before creating new ones
- Verify API endpoint compatibility before changing calls

**❌ DON'T:**
- Skip LSP investigation and guess at fixes
- Use LSP for simple text searches (use grep instead)
- Delegate to LSP for trivial questions - use it for complex tracing

---

## Agent Composition for Web Testing Workflows

### Recommended Workflow for Admin Interface Testing

```
1. foundation:explorer
   ↓ Understand codebase structure, identify components
   
2. playwright + image-vision
   ↓ Explore UI, capture screenshots, analyze with vision
   
3. design-intelligence:* agents
   ↓ Get expert UX/design feedback on findings
   
4. lsp-typescript:typescript-code-intel
   ↓ Trace specific bugs/issues found
   
5. foundation:modular-builder
   ↓ Implement fixes based on investigation
   
6. playwright + image-vision
   ↓ Verify fixes work correctly
   
7. foundation:git-ops
   ↓ Commit changes with proper messages
```

### Context Management

**Lessons Learned:**
- User emphasized multiple times: "use your agents" to preserve context
- Heavy Playwright scripts and vision analysis consume context quickly
- Delegate investigation work to agents to stay lean
- Session reached ~313K tokens - delegate early, not late

### Agent Selection Reference

| Task | Best Agent | Why |
|------|-----------|-----|
| Understand code structure | foundation:explorer | Digests large codebases efficiently |
| Trace TypeScript bugs | lsp-typescript:typescript-code-intel | Precise code navigation |
| UX recommendations | design-intelligence:layout-architect | Expert design guidance |
| Implementation | foundation:modular-builder | Code generation with spec |
| Debugging navigation | foundation:bug-hunter | Systematic issue isolation |

### Common Pitfalls

1. **Doing everything yourself** - Delegate to preserve context
2. **Agent timeout spiral** - If agent times out, don't retry same task endlessly
3. **Not using test-assets** - Personas and images are there for a reason - USE them in tests

---

## Project-Specific Bug Patterns

### Discovered Issues

**1. Profile Photo Persistence Bug**
- **Issue**: Photo uploaded to Asset table but `Portfolio.profilePhotoId` stayed NULL
- **Root Cause**: Hero section saves to `Page.draftContent`, doesn't update Portfolio record
- **Fix**: Add sync logic in saveDraft() to extract heroSection.profileImageId and call /api/portfolio

**2. Featured Image Race Condition**
- **Issue**: Playwright uploads timed out waiting for save confirmation
- **Root Cause**: `setTimeout(() => saveDraft(), 0)` - async save, Playwright doesn't wait
- **Fix**: Change to `await saveDraft()` - synchronous completion

**3. Header Implementation Inconsistency**
- **Issue**: 4 different header implementations across admin pages
- **Impact**: Confusing UX, difficult maintenance
- **Fix**: Extract AdminPageHeader component with unified props API

### UI/UX Issues Found via Vision Analysis

- Star icon (homepage indicator) misaligned 2-3px too high
- Project bullet (•) 1-2px too low - not optically centered
- Categories link indentation inconsistent with navigation hierarchy
- Save Draft button styling didn't match theme (too subtle)

---

## Test-Assets Usage

### Purpose

The `test-assets/personas/` directory contains complete persona data:
```
test-assets/personas/sarah-chen/
├── persona.json          # Full portfolio structure
└── images/              # 77 professional images
    ├── sarah-chen-headshot.jpg
    ├── romeo-juliet-ballgown.jpg
    └── ... (themed costume images)
```

### Correct Usage

**✅ DO:**
```javascript
// Use test-assets interactively via Playwright
const testImage = 'test-assets/personas/sarah-chen/images/sarah-chen-headshot.jpg';

// Upload as profile photo
await page.locator('input[type="file"][accept*="image"]').setInputFiles(testImage);

// Test gallery uploads
await page.getByRole('button', { name: 'Add Images' }).click();
await page.locator('input[type="file"][multiple]').setInputFiles([
  'test-assets/personas/sarah-chen/images/macbeth-witches-trio.jpg',
  'test-assets/personas/sarah-chen/images/hamlet-court-production.jpg',
  'test-assets/personas/sarah-chen/images/midsummer-fairy-costumes.jpg'
]);
```

**❌ DON'T:**
```javascript
// Don't populate via API without testing UI
const profileData = JSON.parse(fs.readFileSync('persona.json'));
await fetch('/api/portfolio', { method: 'PUT', body: JSON.stringify(profileData) });
// ^ This tests the API, not the USER EXPERIENCE
```

---

## Playwright + Vision + LSP Integration

### Power Pattern: Multi-Agent Investigation

**Scenario:** User reports "Images upload but don't show on site"

**Step 1: Capture Evidence (Playwright)**
```javascript
await page.goto('http://localhost:3000/admin/projects/[id]');
await page.screenshot({ path: 'tests/screenshots/project-before.png' });

// Try to upload
await page.locator('input[type="file"]').setInputFiles('test-assets/image.jpg');
await page.screenshot({ path: 'tests/screenshots/project-after-upload.png' });
```

**Step 2: Visual Analysis (Image Vision)**
```bash
./vision-analyze-robust.sh tests/screenshots/project-after-upload.png \
  "Is there an actual image visible in the Featured Image section, or is it still showing a placeholder?"
  
# Result: "No, there is not an actual image visible. It shows placeholder."
```

**Step 3: Code Investigation (LSP)**
```bash
task agent=lsp-typescript:typescript-code-intel \
  "Investigate why featured image uploads don't persist. Trace FeaturedImagePicker upload flow."
  
# LSP finds: setTimeout race condition + missing Portfolio.profilePhotoId sync
```

**Step 4: Fix (Modular Builder)**
```bash
task agent=foundation:modular-builder \
  "Fix featured image race condition: change setTimeout to await saveDraft()"
```

**Step 5: Verify (Playwright + Vision)**
```javascript
// Test again after fix
await page.locator('input[type="file"]').setInputFiles('test-assets/image.jpg');
await page.screenshot({ path: 'tests/screenshots/project-fixed.png' });

// Vision confirms: "Yes, there is an actual image visible"
```

### Multi-Modal Pattern: CSS/Typography Debugging

**Scenario:** User reports "Navigation font looks wrong" (from session b8c32e51)

**Step 1: Vision Triage (Identifies Area)**
```bash
./vision-analyze-robust.sh admin-nav.png \
  "Are there any visual inconsistencies in the navigation menu?"
  
# Vision may identify general area but FAILS at typography details
# Result: "Navigation looks inconsistent" (vague, doesn't identify serif font)
```

**Step 2: Browser DevTools Inspection (Facts)**
```javascript
// Query computed CSS styles directly
const styles = await page.locator('.project-title').evaluate(el => ({
  fontFamily: getComputedStyle(el).fontFamily,
  fontSize: getComputedStyle(el).fontSize,
  fontWeight: getComputedStyle(el).fontWeight
}));

// Result: { fontFamily: "Playfair Display, Georgia, serif" } ← SMOKING GUN!
```

**Step 3: Code Investigation (Root Cause)**
```bash
# Find CSS rules for the class
grep -r "\.project-title" src/

# Result: Class collision!
# - Global CSS: .project-title { font-family: var(--font-family-primary); } // Playfair
# - Component CSS: .project-title { font-family: Inter; } // Intended
```

**Step 4: Design Agent Consultation (Architecture)**
```bash
task agent=design-intelligence:component-designer \
  "Why is global .project-title CSS overriding component styles?"
  
# Result: Next.js CSS load order + specificity issue
# Solution: Rename class to avoid collision
```

**Step 5: Vision Verification (Confirm Fix)**
```bash
./vision-analyze-robust.sh admin-nav-fixed.png \
  "Is the navigation font now consistently sans-serif with clean edges?"
  
# Vision confirms: "Yes, all navigation items use sans-serif font"
```

**Key Insight**: For CSS/typography issues, **vision is for triage and verification only**. The actual diagnosis requires browser inspection + code analysis + architectural understanding.

---

## Common Mistakes to Avoid

### ❌ Script Litter Anti-Pattern

**Mistake:**
```
portfolio/
├── ai_working/
│   ├── explore-admin.js
│   ├── validate-consistency.js
│   ├── populate-sarah-portfolio.js
│   └── ... (20+ more scripts)
├── explore-admin-proper.js  ← Root directory!
├── setup-test-data.js       ← Root directory!
```

**Fix:**
- Create tests/ directory at project start
- Move all test scripts there immediately  
- Add tests/*.{js,png,json} to .gitignore
- Only commit reusable test utilities, not one-off scripts

### ❌ Timeout Spiral

**Mistake:**
```javascript
await page.waitForTimeout(3000); // Hope it's done
await page.waitForResponse(/api\/upload/); // Times out after 30s
// Script fails, try again with longer timeout...
```

**Fix:**
```javascript
// Wait for UI changes, not arbitrary time
await expect(page.getByText('Upload complete')).toBeVisible();

// Or wait for element state
await page.getByRole('button', { name: 'Save' }).waitFor({ state: 'enabled' });
```

### ❌ Race Conditions in Async Handlers

**Mistake Found in Session:**
```javascript
// FeaturedImagePicker.tsx - WRONG
onImageSelect={(image) => {
  handleMetadataChange({ featuredImageId: image.id });
  setTimeout(() => saveDraft(), 0); // Playwright won't wait!
}}
```

**Fix Applied:**
```javascript
// CORRECT
onImageSelect={async (image) => {
  handleMetadataChange({ featuredImageId: image.id });
  await saveDraft(); // Completes before returning
}}
```

---

## Next.js/React Specific Learnings

### App Router Behavior

- Next.js 15 Link components may not render `href` attribute in DOM (client-side routing optimization)
- This is **expected behavior**, not a bug
- Test navigation by clicking and checking URL change, not inspecting href attribute

### Component Patterns

**Data Persistence Pattern (from fixes):**
```typescript
// When editing nested data that needs to sync to parent:
const saveDraft = async () => {
  // 1. Save primary entity
  await fetch(`/api/pages/${id}`, {
    body: JSON.stringify({ draftContent: serialize(sections) })
  });
  
  // 2. Sync related entity if nested data exists
  const heroSection = sections.find(isHeroSection);
  if (heroSection?.profileImageId) {
    await fetch('/api/portfolio', {
      body: JSON.stringify({
        id: portfolioId,
        profilePhotoId: heroSection.profileImageId
      })
    });
  }
};
```

### File Upload Patterns

- Hidden file inputs are common (CSS: `position: absolute; opacity: 0`)
- Use `page.locator('input[type="file"]').setInputFiles(path)` - works even if hidden
- Multi-file uploads: `.setInputFiles([path1, path2, path3])`
- Wait for upload completion by checking UI feedback, not network responses

---

## Recommendations for Future Sessions

### Before Starting

1. **Load required skills early**: `playwright`, `image-vision`
2. **Create tests/ directory structure** if not exists
3. **Review test-assets/** to understand available personas/images

### During Exploratory Testing

1. **Use Playwright to INTERACT**, not just validate
   - Upload images from test-assets through UI
   - Fill forms manually to test controls
   - Navigate as a real user would

2. **Capture + Analyze Systematically**
   ```bash
   # After each major interaction
   await page.screenshot({ path: 'tests/screenshots/step-N-description.png' });
   # Then analyze with vision
   ```

3. **Delegate Investigation to Specialists**
   - Code tracing → lsp-typescript
   - UX feedback → design-intelligence agents
   - Bug isolation → foundation:bug-hunter

4. **Organize Artifacts as You Go**
   - Screenshots → tests/screenshots/
   - Test scripts → tests/
   - Analysis notes → ai_working/ (gitignored)

### After Testing

1. **Clean up test artifacts** - Don't check temporary files into git
2. **Document bugs found** with line numbers from LSP
3. **Commit fixes separately** from test artifacts

---

## Key Takeaways

1. **Playwright is for EXPLORATION, not just automation** - Use it to interact with the UI as a user would
2. **Test-assets exist for interactive testing** - Upload images through UI to test controls
3. **Organize test artifacts from the start** - tests/ directory, proper .gitignore
4. **Fix async race conditions** - setTimeout(..., 0) breaks Playwright timing
5. **Delegate to preserve context** - Use specialized agents early and often
6. **Vision analysis catches visual bugs** - Alignment, spacing, hierarchy issues
7. **LSP traces root causes** - Don't guess, investigate with LSP first
8. **Todo list stability** - Create once, update; don't recreate repeatedly

---

*This guide is based on session 3350e6b6 analysis and should be updated as new patterns emerge.*
