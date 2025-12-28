# Slice Implementation Guide

**For LLM Workers Implementing Vertical Slices**

This guide explains how to approach implementing each vertical slice, what to deliver, and how your work will be evaluated.

---

## What is a Vertical Slice?

A vertical slice is a **complete end-to-end feature** that delivers user value. Unlike horizontal layers (database, then API, then UI), a slice includes everything needed for one specific user capability.

### Slice Characteristics

Each slice must be:
- ✅ **Self-contained:** Implement without reading other slice docs (300-500 lines)
- ✅ **Demoable:** User can try the feature immediately
- ✅ **Value-focused:** Delivers complete user capability
- ✅ **Tested:** Includes basic validation
- ✅ **Incremental:** Builds on previous slices

---

## Before You Start

### 1. Read These Documents (In Order)

**Required reading:**
1. `plans/PROJECT_OVERVIEW.md` - Understand the vision
2. Your slice specification (e.g., `plans/slices/01-static-page-foundation.md`)
3. Previous slice deliverables (if not Slice 1)

**Reference as needed:**
- `orig-plans/portfolio-vision-ux.md` - UX requirements
- `orig-plans/portfolio-tech-strategy.md` - Architecture details
- `orig-plans/user-success-scenarios.md` - User stories
- `test-assets/` - Realistic test data

### 2. Understand the Tech Stack

**Already decided (don't reconsider):**
- Next.js 14+ App Router
- Tailwind CSS + CSS custom properties
- shadcn/ui components
- dnd-kit for drag-drop (later slices)
- Tiptap for rich text (later slices)
- Sharp.js for images (later slices)
- Prisma + SQLite (dev) / PostgreSQL (prod)
- Session-based auth (custom)

**Tech decisions validated via spikes.** See `orig-plans/work-packages/foundation/tech-decisions.md` for rationale.

### 3. Set Up Your Environment

```bash
# Port allocation (avoid conflicts)
# Use port 4000 for main application
npm run dev # Should start on port 4000

# Create test database if needed
npm run db:setup

# Seed test data if provided
npm run db:seed
```

---

## Implementation Approach

### Step 1: Understand the User Value

**Ask yourself:**
- What can the user DO after this slice?
- How will they know it works?
- What's the simplest implementation?

**Example (Slice 1: Text Portfolio MVP):**
- User can: Create a page, click to edit text, save, view result
- They know it works: Text persists after page reload
- Simplest: Basic contentEditable + localStorage (no database yet)

### Step 2: Implement Incrementally

**Build in this order:**
1. **Data model** (if needed) - What state do we track?
2. **UI structure** - Static layout first
3. **Make it interactive** - Add click handlers, state
4. **Persistence** - Save/load data
5. **Polish** - Error states, loading states

**Test after each step.** Don't write 500 lines then test.

### Step 3: Follow Ruthless Simplicity

**DO:**
- ✅ Use the simplest solution that works
- ✅ Leverage existing libraries (don't reinvent)
- ✅ Copy patterns from similar features
- ✅ Hard-code values initially (refactor in later slices)
- ✅ Skip edge cases in early slices

**DON'T:**
- ❌ Build for hypothetical future requirements
- ❌ Add configuration options "just in case"
- ❌ Create abstractions before you need them
- ❌ Optimize prematurely
- ❌ Implement features not in your slice spec

### Step 4: Make It Demoable

**Every slice must be runnable by a human reviewer.**

Include in your deliverables:
- `README.md` in your slice directory with:
  - What was implemented
  - How to run/test it
  - Screenshots or GIF of it working
  - Known limitations
  - What the next slice should build on

**Example README structure:**
```markdown
# Slice 1: Text Portfolio MVP

## What's Implemented
- Single page with editable text
- Click-to-edit interaction
- Save to localStorage
- Load on page refresh

## How to Test
1. npm run dev
2. Navigate to http://localhost:4000
3. Click on text to edit
4. Make changes
5. Refresh page - changes persist

## Demo
[Screenshot showing before/after editing]

## Known Limitations
- No authentication (Slice 2)
- No database (Slice 2)
- Basic contentEditable (upgrade to Tiptap in Slice 3)
- Single page only (multi-page in Slice 7)

## For Next Slice
- State structure is in src/lib/portfolio-state.ts
- Save/load functions in src/lib/storage.ts
- Replace localStorage with database calls
```

---

## Deliverables Checklist

Before submitting, verify:

### Code Deliverables
- [ ] All code is in the project directory
- [ ] Follows existing code style (Prettier/ESLint)
- [ ] No console.log statements (use proper logging)
- [ ] No hardcoded credentials or secrets
- [ ] TypeScript types defined
- [ ] Comments explain "why" not "what"

### Functional Deliverables
- [ ] Feature works as specified
- [ ] Tested in Chrome, Safari, Firefox
- [ ] Tested on mobile (actual device or DevTools)
- [ ] Error states handled gracefully
- [ ] Loading states where appropriate
- [ ] No console errors or warnings

### Documentation Deliverables
- [ ] README.md in slice directory
- [ ] Screenshots/GIF of working feature
- [ ] Known limitations documented
- [ ] Integration points noted for next slice

### Quality Checks
- [ ] Code is simple and clear
- [ ] No over-engineering
- [ ] Follows project tech decisions
- [ ] Build succeeds (`npm run build`)
- [ ] Linting passes (`npm run lint`)

---

## Common Pitfalls to Avoid

### 1. Scope Creep
**Problem:** "While I'm here, I'll also add..."  
**Solution:** Stick to your slice spec. Note ideas for future slices in your README.

### 2. Premature Abstraction
**Problem:** Creating generic systems before patterns emerge  
**Solution:** Hard-code first, abstract in later slices when patterns are clear

**Example:**
```typescript
// ❌ DON'T (Slice 1)
interface StorageAdapter {
  save<T>(key: string, data: T): Promise<void>;
  load<T>(key: string): Promise<T | null>;
}

class LocalStorageAdapter implements StorageAdapter { ... }
class DatabaseAdapter implements StorageAdapter { ... }

// ✅ DO (Slice 1)
function savePortfolio(data: Portfolio) {
  localStorage.setItem('portfolio', JSON.stringify(data));
}

// Later (Slice 2), when you have 2 implementations:
// NOW create the abstraction
```

### 3. Perfect Is the Enemy of Done
**Problem:** Endlessly refining details  
**Solution:** Ship working > ship perfect. Note polish items for future slices.

### 4. Ignoring Previous Slices
**Problem:** Re-implementing what exists  
**Solution:** Build on previous work. Extend, don't replace.

### 5. No Visual Confirmation
**Problem:** "It works in the console"  
**Solution:** Show it working in the browser. Screenshots required.

---

## Evaluation Criteria

Your work will be evaluated on:

### 1. Does It Work? (40%)
- Feature is functional as specified
- No critical bugs
- Works in major browsers
- Mobile-friendly (touch targets, responsive)

### 2. Is It Simple? (30%)
- Code is clear and straightforward
- No unnecessary complexity
- Follows "ruthless simplicity" principle
- Easy for next implementer to understand

### 3. Is It Complete? (20%)
- All deliverables provided
- Documentation clear
- Screenshots/demo included
- Integration points noted

### 4. Does It Follow Standards? (10%)
- Uses agreed tech stack
- Follows project patterns
- TypeScript properly used
- No security issues

---

## Asking for Help

### When to Ask
- Slice spec is unclear or contradictory
- Previous slice is broken/incomplete
- Tech decision seems wrong for this slice
- Stuck after 2+ hours on same issue

### How to Ask
Include:
1. What you're trying to accomplish
2. What you've tried
3. Specific error or blocker
4. Relevant code snippet

### Where to Ask
- Project GitHub Issues
- Slack channel: #portfolio-builder
- Email: [project lead email]

---

## Slice Dependencies

### If You're Implementing Slice 1
- No dependencies! Start fresh.
- Create new Next.js project if needed
- Set up basic project structure

### If You're Implementing Slice N (N > 1)
- Clone/pull latest from previous slice
- Verify previous slice works before starting
- Read previous slice README for integration points
- Build on existing patterns

**If previous slice is broken:**
1. Document the issue
2. Fix if simple (<30 min)
3. Otherwise, flag for review before proceeding

---

## Testing Your Slice

### Manual Testing Checklist

Test these scenarios before submitting:

1. **Happy path**
   - Feature works as intended
   - User can complete the workflow

2. **Error paths**
   - Invalid input handled gracefully
   - Network failures (if applicable)
   - Unexpected data

3. **Edge cases**
   - Empty state (no data)
   - Maximum data (100 items)
   - Special characters in input
   - Very long text strings

4. **Browsers**
   - Chrome/Edge (Chromium)
   - Safari
   - Firefox

5. **Mobile**
   - iOS Safari (actual device preferred)
   - Android Chrome
   - Touch interactions work
   - No horizontal scroll
   - Text readable without zoom

### Automated Testing (If Specified)

Some slices may require automated tests. Check your slice spec.

```typescript
// Example: Slice 2 might require basic tests
test('saves portfolio to database', async () => {
  const data = { title: 'Test', content: 'Hello' };
  await savePortfolio(data);
  const loaded = await loadPortfolio();
  expect(loaded).toEqual(data);
});
```

---

## Time Estimation

### Expected Time per Slice

- **Slice 1-2:** 8-12 hours (setup + foundation)
- **Slice 3-5:** 4-8 hours (build on existing)
- **Slice 6-8:** 6-10 hours (more complex features)

**If you're spending 2x expected time:**
- Re-read "Ruthless Simplicity" section
- Consider if you're over-engineering
- Ask for help (don't spin for days)

### Time Allocation

Recommended breakdown:
- 20% - Read docs, understand scope
- 50% - Implementation
- 20% - Testing (manual + automated)
- 10% - Documentation and screenshots

---

## Success Stories

### What Good Looks Like

**Slice 1 Example:**
```
✅ Created simple text editor in 350 lines
✅ User can click, edit, save to localStorage
✅ Works on mobile (tested on iPhone)
✅ README with screenshot and clear instructions
✅ Noted 3 integration points for Slice 2
✅ Completed in 10 hours
```

**Slice 3 Example:**
```
✅ Added image upload using existing auth
✅ Reused storage patterns from Slice 2
✅ Simple Sharp.js optimization (300 lines added)
✅ Works with existing text editor
✅ Mobile camera integration tested
✅ README shows before/after optimization
✅ Completed in 6 hours
```

### What Needs Improvement

**Over-engineered:**
```
❌ Created 8-file abstraction layer for storage
❌ Built generic component system "for reuse"
❌ Added caching layer not in spec
❌ Took 25 hours for 8-hour slice
❌ Next implementer can't find core logic
```

**Under-delivered:**
```
❌ Feature works in console but no UI
❌ No screenshots or demo instructions
❌ Breaks previous slice functionality
❌ No documentation for next slice
❌ Reviewer can't figure out how to test it
```

---

## Final Checklist

Before you submit:

- [ ] Feature works end-to-end
- [ ] Tested in 3 browsers
- [ ] Tested on mobile (real device or DevTools)
- [ ] README.md created with screenshots
- [ ] Known limitations documented
- [ ] Integration points noted
- [ ] Code is simple and clear
- [ ] No over-engineering
- [ ] Build succeeds
- [ ] Linting passes
- [ ] Ready for next implementer

---

## Questions?

**This guide unclear?** Submit a pull request or GitHub issue.

**Stuck on implementation?** Ask in #portfolio-builder Slack.

**Slice spec unclear?** Flag in issue tracker before starting.

---

**Remember:** Vertical slices succeed by delivering **working user value** in **simple, clear code**. Ship features, not frameworks.
