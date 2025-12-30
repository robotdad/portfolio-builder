# Orchestrator Guide: Running Slice Sessions

**Purpose:** Guide for the human orchestrating LLM implementation sessions.

---

## How to Run a Slice Session

### 1. Session Setup

**Start new LLM session with this context:**

```
You are implementing Slice N: [Name] for a portfolio builder.

Read these files to understand your goal:
- plans/slices/0N-[name].md (your slice specification)
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Note: Design specifications auto-load via @mentions in the slice spec.
No need to manually load design files - they're referenced and loaded automatically.

Your goal: Implement the slice specification completely.

Important:
- Read the existing codebase to understand what's there
- Build incrementally on previous work
- Follow the demo script as your acceptance test
- Meet all success criteria before finishing
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Ask clarifying questions if the spec is unclear

When done, confirm:
1. Demo script works end-to-end
2. All success criteria met
3. Tested on desktop and mobile (if slice 4+)
4. Ready for next slice (integration points clear)
```

### 2. During Session

**Let the LLM work autonomously:**
- Answer clarifying questions
- Provide feedback if going off track
- Test the demo as implementation progresses

**Watch for:**
- ⚠️ Implementing "NOT Included" items (scope creep)
- ⚠️ Over-engineering (premature abstraction)
- ⚠️ Skipping success criteria
- ⚠️ Breaking previous slice functionality

### 3. Session Validation

**Before accepting the slice as complete:**

Run through this checklist:

**Functional:**
- [ ] Demo script works exactly as described
- [ ] All success criteria checked off
- [ ] No console errors or warnings
- [ ] Works on desktop (Chrome, Safari)
- [ ] Works on mobile (if slice 4+)

**Design:**
- [ ] Matches design system specifications
- [ ] Follows visual design principles
- [ ] Responsive behavior per design specs (if slice 4+)
- [ ] No visual elements contradict design system

**Code Quality:**
- [ ] Code is simple and clear
- [ ] No over-engineering or premature abstraction
- [ ] Follows tech stack (no surprise dependencies)
- [ ] Within estimated line count (+/- 20% is fine)

**Integration:**
- [ ] Previous slice functionality still works
- [ ] Integration points documented for next slice
- [ ] Database migrations clean (if any)
- [ ] No breaking changes to existing patterns

**Ready for Next:**
- [ ] Can proceed to next slice without blockers
- [ ] Any deviations from spec are documented
- [ ] Known limitations listed

### 4. Move to Next Slice

**Update ai_working/STATUS.md:**
```markdown
### Completed ✅
- ✅ Slice N: [Name] (actual time: X days)

### In Progress →
- → Slice N+1: [Next Name]
```

**Update ai_working/TIMELINE.md** with actual time taken.

**Commit the work** with clear message describing what was implemented.

---

## Special Checkpoints

### After Slice 3
**Integration Checkpoint:** Full end-to-end test
- Can Marcus create a basic text + image portfolio?
- Does the flow feel smooth?
- Any integration issues between slices 1-3?

**Decision:** Proceed to Slice 4 or fix issues?

### After Slice 4 (CRITICAL)
**Mobile Validation Checkpoint - GO/NO-GO**
- Test on REAL iPhone (not just DevTools)
- Can Sarah update from her phone in <5 minutes?
- Do touch interactions feel native?

**If NO:** Stop and fix mobile experience
**If YES:** Proceed with confidence to slices 5-8

### After Slice 8
**Phase 1 Complete:**
- Functional prototype with integrated design system
- All success scenarios work
- Ready for user feedback

---

## Common Issues

### Issue: LLM implements "NOT Included" items
**Fix:** Stop and remind it to follow slice spec exactly. Revert scope creep.

### Issue: Code is over-engineered
**Fix:** Ask "Is this the simplest solution?" Apply ruthless simplicity principle.

### Issue: Breaking previous slice
**Fix:** Test previous demo scripts. Fix regressions before proceeding.

### Issue: Success criteria ambiguous
**Fix:** Clarify the criteria before accepting. Update slice spec if needed.

### Issue: Design specifications ignored
**Fix:** Review the design specs loaded via @mentions in slice spec. Verify implementation matches visual requirements, not just functional.

---

## Session Guide

**For rebuilding context between sessions:**

When resuming work after a pause, this template helps you understand the slice structure:

- Each slice spec includes three files: the slice specification itself, PRINCIPLES.md, and TECH_STACK.md
- Design specs auto-load via @mentions in the slice spec (no manual loading needed)
- Demo script serves as the acceptance test
- Success criteria split into Functional and Design requirements
- "Included" scope is what to build, "NOT Included" is explicitly out of scope

**For ready-to-use session prompts:** See [Appendix: Session Prompts](#appendix-session-prompts) at the end of this document.

---

## Validation Reference

See plans/USERS.md for:
- User personas (Marcus, Sarah, Emma)
- Success scenarios to validate against
- Validation questions

See plans/design/ for:
- Design system specifications (auto-loaded via slice specs)
- Visual design principles
- Component guidelines

See plans/VISION.md for:
- Overall success criteria
- Design principles explained in detail
- What we're building and why

---

## After Phase 1 (All 8 Slices)

1. **Design Spike:** Use working prototype for mockups and user testing
2. **Review:** Evaluate what worked, what needs refinement
3. **Plan Phase 2:** Auth, themes, polish based on learnings

---

## Appendix: Session Prompts

Ready-to-use prompts for starting each slice implementation session.

### Slice 1: Static Page Foundation

```
You are implementing Slice 1: Static Page Foundation for a portfolio builder.

Read these files to understand your goal:
- plans/slices/01-static-page-foundation.md (your slice specification)
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Design specifications auto-load via @mentions in the slice spec - they'll be available as context automatically.

This is the first implementation. No previous work exists.

Goal: User can create a basic portfolio page with text and see it published live.

Your deliverables:
- Next.js app with database (Prisma + SQLite)
- Simple admin form at /admin
- Published page viewer at /[slug]
- Design system foundation with CSS custom properties
- All 3 themes implemented (Modern Minimal, Classic Elegant, Bold Editorial)
- Theme switching functionality

Working space: Use ai_working/ for any temporary documents, notes, or planning during implementation.

Follow the demo script in the slice spec as your acceptance test. Meet ALL success criteria (functional AND design) before finishing.

Stay within the "Included" scope - do NOT implement "NOT Included" items.

When done, confirm:
1. Demo script works end-to-end
2. All functional criteria met
3. All design criteria met
4. Ready for Slice 2 (integration points clear)
```

### Slice 2: Rich Text Editing

```
You are implementing Slice 2: Rich Text Editing for the portfolio builder.

Read these files to understand your goal:
- plans/slices/02-rich-text-editing.md (your slice specification)
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Design specifications auto-load via @mentions in the slice spec.

Read the existing codebase from Slice 1 to understand the foundation. Build on it incrementally.

Goal: User can format text professionally with headings, bold, italic, and links.

Your deliverables:
- Replace textarea with Tiptap editor
- Toolbar with formatting controls (Paragraph, H1-H3, Bold, Italic, Link)
- WYSIWYG editing experience
- HTML storage with sanitization
- Typography matching design system specs

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work from Slice 1, don't replace it
- Follow the demo script as your acceptance test
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 3: Single Image Upload

```
You are implementing Slice 3: Single Image Upload for the portfolio builder.

Read these files to understand your goal:
- plans/slices/03-single-image-upload.md (your slice specification)
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Design specifications auto-load via @mentions in the slice spec.

Read the existing codebase from Slices 1-2. Build on it incrementally.

Goal: User can add professional photos to their portfolio with proper optimization.

Your deliverables:
- Image upload component with file input
- Sharp.js processing pipeline (resize, WebP conversion, blur placeholder)
- Asset model in database
- Responsive image display with srcset
- Alt text validation

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work from Slices 1-2, don't replace it
- Follow the demo script as your acceptance test
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 4: Mobile Editing Basics

```
You are implementing Slice 4: Mobile Editing Basics for the portfolio builder.

Read these files to understand your goal:
- plans/slices/04-mobile-editing-basics.md (your slice specification)
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Design specifications auto-load via @mentions in the slice spec.

Read the existing codebase from Slices 1-3. Build on it incrementally.

Goal: Sarah can update her portfolio from iPhone backstage in <5 minutes.

⚡ CRITICAL MILESTONE: This is a GO/NO-GO checkpoint for mobile editing excellence.

Your deliverables:
- Responsive editor layout (stacked for mobile)
- Touch-friendly UI (44px minimum targets)
- Mobile-optimized toolbar (keyboard-aware positioning)
- Mobile image upload from photo library
- Complete mobile editing workflow

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work from Slices 1-3, don't replace it
- Test on REAL iPhone, not just browser DevTools
- Follow the demo script as your acceptance test on iPhone
- Meet ALL success criteria (functional AND design) - design criteria marked CRITICAL
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

Validation before finishing:
- Can complete edit → publish flow on iPhone in <5 minutes?
- Do touch interactions feel native (not clumsy)?
- Is mobile editing excellent (not just "okay")?

When done, confirm all success criteria are met and mobile experience is excellent.
```

### Slice 5: Component System & Sections

```
You are implementing Slice 5: Component System & Sections for the portfolio builder.

Read these files to understand your goal:
- plans/slices/05-component-system-sections.md (your slice specification)
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Design specifications auto-load via @mentions in the slice spec.

Read the existing codebase from Slices 1-4. Build on it incrementally.

Goal: User can structure pages with multiple sections of text and images.

Your deliverables:
- Section-based page architecture (array of sections)
- Add/remove sections UI
- dnd-kit drag-and-drop reordering (desktop + mobile touch)
- Featured Grid Landing template implementation
- Image Card with Hover Overlay component
- Hero section (name + resume + featured work)

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work from Slices 1-4, don't replace it
- This slice implements the first complete template (Featured Grid)
- Follow the demo script as your acceptance test
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 6: Image Gallery Component

```
You are implementing Slice 6: Image Gallery Component for the portfolio builder.

Read these files to understand your goal:
- plans/slices/06-image-gallery-component.md (your slice specification)
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Design specifications auto-load via @mentions in the slice spec.

Read the existing codebase from Slices 1-5. Build on it incrementally.

Goal: User can showcase multiple costume photos in professional grid layouts.

Your deliverables:
- Gallery section type (multiple images)
- Multi-image upload
- Masonry grid layout (3/2/1 columns responsive)
- Image reordering within galleries
- Lightbox for full-size viewing
- Pagination for galleries >20 images

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work from Slices 1-5, don't replace it
- Gallery grid must match component specification exactly
- Follow the demo script as your acceptance test
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 7: Multiple Pages & Navigation

```
You are implementing Slice 7: Multiple Pages & Navigation for the portfolio builder.

Read these files to understand your goal:
- plans/slices/07-multiple-pages-navigation.md (your slice specification)
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Design specifications auto-load via @mentions in the slice spec.

Read the existing codebase from Slices 1-6. Build on it incrementally.

Goal: User can organize work into different pages with dynamic navigation.

Your deliverables:
- Multi-page creation and management
- Page list/switcher in admin
- Dynamic navigation component (adapts to user-defined categories)
- Horizontal desktop / hamburger mobile navigation
- Homepage designation
- Page slug management
- Navigation rendering across all 3 themes

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work from Slices 1-6, don't replace it
- Categories are user-defined (NOT hardcoded as Theatre/Film/Opera)
- Navigation adapts dynamically to user's category structure
- Follow the demo script as your acceptance test
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 8: Draft/Publish Workflow

```
You are implementing Slice 8: Draft/Publish Workflow for the portfolio builder.

Read these files to understand your goal:
- plans/slices/08-draft-publish-workflow.md (your slice specification)
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Design specifications auto-load via @mentions in the slice spec.

Read the existing codebase from Slices 1-7. Build on it incrementally.

Goal: User can work on changes without affecting live site, preview before publishing.

Your deliverables:
- Draft/published content separation in database
- Auto-save drafts every 30 seconds
- Manual save button
- Preview mode (shows draft in published layout)
- Publish action (atomic draft → published copy)
- Visual status indicators (Draft/Published/Saving)
- Template and theme swapping in draft mode

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work from Slices 1-7, don't replace it
- Changes must NOT be live until explicit publish action
- Preview must show exact published appearance (DOM parity)
- Follow the demo script as your acceptance test
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met and Phase 1 is complete.
```
