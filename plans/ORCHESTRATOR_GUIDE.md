# Orchestrator Guide: Running Slice Sessions

**Purpose:** Guide for the human orchestrating LLM implementation sessions.

---

## How to Run a Slice Session

### 1. Session Setup

**Use the ready-to-use prompts from the [Appendix](#appendix-session-prompts) at the end of this document.**

Copy the complete prompt for your slice and paste into a new LLM session - no modifications needed.

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

**Dev Server Management:**

If the LLM needs to start the Next.js dev server for testing:

```bash
# Start in background with logging
npm run dev > /tmp/nextjs.log 2>&1 & echo $!
# Returns PID immediately, e.g., "95969"

# Verify it's running
ps -p 95969

# View logs
tail -20 /tmp/nextjs.log

# Stop when done
kill 95969
```

**Critical:** 
- Never use `npm run dev` directly (it hangs indefinitely)
- Never use `run_in_background` parameter (unreliable - times out after 30s)
- Always use Unix job control: `command > /tmp/log 2>&1 & echo $!`
- This pattern works for all long-running processes (dev servers, build watchers, etc.)

### 3. Session Validation

**Before accepting the slice as complete:**

Run through this checklist:

**Functional:**
- [ ] All success criteria checked off
- [ ] No console errors or warnings
- [ ] Works on desktop (Chrome, Safari)
- [ ] Works on mobile (for mobile-focused slices)

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

You must test on real devices at this checkpoint:
- Test on iPhone Safari (not just browser DevTools)
- Can you complete edit → publish flow in <5 minutes on phone?
- Do touch interactions feel native?

**If NO:** Stop and fix mobile experience before proceeding
**If YES:** Proceed with confidence to remaining slices

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

### Issue: Breaking previous functionality
**Fix:** Test previous features still work. Fix regressions before proceeding.

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
You are implementing the foundation for a portfolio builder.

Read these files to understand your goal:
- plans/slices/01-static-page-foundation.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

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

Meet ALL success criteria (functional AND design) before finishing.

Stay within the "Included" scope - do NOT implement "NOT Included" items.

When done, confirm all success criteria are met.
```

### Slice 2: Rich Text Editing

```
You are implementing rich text editing for the portfolio builder.

Read these files to understand your goal:
- plans/slices/02-rich-text-editing.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Study the existing codebase and build on it incrementally.

Goal: User can format text professionally with headings, bold, italic, and links.

Your deliverables:
- Replace textarea with Tiptap editor
- Toolbar with formatting controls (Paragraph, H1-H3, Bold, Italic, Link)
- WYSIWYG editing experience
- HTML storage with sanitization
- Typography matching design system specs

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 3: Single Image Upload

```
You are implementing image upload for the portfolio builder.

Read these files to understand your goal:
- plans/slices/03-single-image-upload.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Study the existing codebase and build on it incrementally.

Goal: User can add professional photos to their portfolio with proper optimization.

Your deliverables:
- Image upload component with file input
- Sharp.js processing pipeline (resize, WebP conversion, blur placeholder)
- Asset model in database
- Responsive image display with srcset
- Alt text validation

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 4: Mobile Editing Basics

```
You are implementing mobile editing for the portfolio builder.

Read these files to understand your goal:
- plans/slices/04-mobile-editing-basics.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Study the existing codebase and build on it incrementally.

Goal: User can update portfolio from iPhone backstage in <5 minutes.

⚡ CRITICAL MILESTONE: Mobile editing must be excellent, not just functional.

Your deliverables:
- Responsive editor layout (stacked for mobile)
- Touch-friendly UI (44px minimum targets)
- Mobile-optimized toolbar (keyboard-aware positioning)
- Mobile image upload from photo library
- Complete mobile editing workflow

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- Mobile experience is the core value proposition
- Meet ALL success criteria (functional AND design) - design criteria marked CRITICAL
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 5: Component System & Sections

```
You are implementing a component system for the portfolio builder.

Read these files to understand your goal:
- plans/slices/05-component-system-sections.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Study the existing codebase and build on it incrementally.

Goal: User can structure pages with multiple sections of text and images.

Your deliverables:
- Section-based page architecture (array of sections)
- Add/remove sections UI
- dnd-kit drag-and-drop reordering (desktop + mobile touch)
- Featured Grid Landing template implementation
- Image Card with Hover Overlay component
- Hero section (name + resume + featured work)

This implements the first complete template (Featured Grid).

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 6: Image Gallery Component

```
You are implementing image galleries for the portfolio builder.

Read these files to understand your goal:
- plans/slices/06-image-gallery-component.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Study the existing codebase and build on it incrementally.

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
- Build on existing work, don't replace it
- Gallery grid must match component specification exactly
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 7: Multiple Pages & Navigation

```
You are implementing multi-page navigation for the portfolio builder.

Read these files to understand your goal:
- plans/slices/07-multiple-pages-navigation.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Study the existing codebase and build on it incrementally.

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
- Build on existing work, don't replace it
- Categories are user-defined (NOT hardcoded as Theatre/Film/Opera)
- Navigation adapts dynamically to user's category structure
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 8: Draft/Publish Workflow

```
You are implementing the draft/publish workflow for the portfolio builder.

Read these files to understand your goal:
- plans/slices/08-draft-publish-workflow.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Study the existing codebase and build on it incrementally.

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
- Build on existing work, don't replace it
- Changes must NOT be live until explicit publish action
- Preview must show exact published appearance (DOM parity)
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

---

## Phase 1b: Polish & UX Fixes (Slices 9-13)

### Slice 9: Theme Selection UI

```
You are implementing theme selection for the portfolio builder.

Read these files to understand your goal:
- plans/slices/09-theme-selector.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Study the existing codebase and build on it incrementally.

Goal: Users can select and apply themes to their portfolio via a simple dropdown.

Your deliverables:
- Theme selector dropdown in admin settings area
- Save theme choice via existing portfolio API
- Verify all published pages apply data-theme attribute correctly
- Simple dropdown UI (no preview needed per user decision)

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- Theme infrastructure already exists - this is UI only
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 10: Image Upload Standardization

```
You are standardizing image upload behavior for the portfolio builder.

Read these files to understand your goal:
- plans/slices/10-image-upload-standardization.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Study the existing codebase and build on it incrementally.

Goal: Make profile photo upload behavior consistent with other image uploads.

Your deliverables:
- Optimistic upload pattern for hero profile photo
- Photo applies immediately on upload (no separate "Save" step)
- Toast notification with undo option (5 second window)
- Match existing gallery upload behavior

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- This fixes UX inconsistency, not adding new features
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 11: Smart Add Section Button

```
You are fixing the add section dropdown for the portfolio builder.

Read these files to understand your goal:
- plans/slices/11-smart-add-section.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Design reference (auto-loaded via slice spec):
- plans/design/components/smart-popover.md

Study the existing codebase and build on it incrementally.

Goal: Fix the add section dropdown that renders off-screen.

Your deliverables:
- Position-aware popover (opens above if no room below)
- Bottom sheet on mobile instead of popover
- Keyboard navigation (↑↓, Enter, Escape)
- Inline add buttons between sections (not just at bottom)

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- This fixes a UX bug, not adding new features
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 12: Settings to Header

```
You are moving portfolio settings to the header for the portfolio builder.

Read these files to understand your goal:
- plans/slices/12-settings-to-header.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Study the existing codebase and build on it incrementally.

Goal: Move portfolio settings out of main content area into header dropdown.

Your deliverables:
- SettingsDropdown component for header
- Move portfolio name, tagline, theme selector to dropdown
- Settings accessible from anywhere in admin
- Mobile-friendly (full-width dropdown on mobile)

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- Settings rarely change - free up editing space for content
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 13: Home Page Routing

```
You are implementing home page routing for the portfolio builder.

Read these files to understand your goal:
- plans/slices/13-home-page-routing.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Study the existing codebase and build on it incrementally.

Goal: Allow home page to publish to site root (/).

Your deliverables:
- "Set as home page" toggle in page settings
- Home page publishes to / instead of /[slug]
- Confirmation dialog when changing home page
- Navigation handles root path correctly

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- Single-user model: one portfolio = entire site
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met and Phase 1b is complete.
```

---

## Hierarchical Content Model (Slices 14-17)

### Slice 14: Content Model Schema Design

```
You are designing the content model schema for the portfolio builder.

Read these files to understand your goal:
- plans/slices/14-content-model-schema.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)
- plans/design/CONTENT-MODEL.md (current vs target architecture)

Study the existing codebase and understand current data model.

Goal: Design the Category → Project schema without breaking existing content.

Your deliverables:
- Detailed Category and Project Prisma model definitions
- Migration strategy document for existing FeaturedGrid items
- Backward compatibility plan (pages coexist with categories)
- Data transformation rules documented
- API route specifications

This is a DESIGN slice - produce documentation, not implementation code.

Working space: Use ai_working/ for planning and schema drafts.

Important:
- This is planning/design only, no database changes yet
- Existing content must not be affected
- Design for coexistence (pages + categories)
- Meet ALL success criteria
- Stay within the "Included" scope

When done, confirm schema design is complete and ready for implementation.
```

### Slice 15: Category & Project Models

```
You are implementing Category and Project models for the portfolio builder.

Read these files to understand your goal:
- plans/slices/15-category-project-models.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)
- plans/design/CONTENT-MODEL.md (target schema)

Study the existing codebase and build on it incrementally.

Goal: Implement the new Category → Project hierarchy in the database.

Your deliverables:
- Category and Project models in Prisma schema
- Database migration (preserving existing data)
- Update Asset model for optional Project linkage
- API routes for Category/Project CRUD
- Migration script for existing FeaturedGrid items (if any)

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- Existing pages and sections must continue working
- Migration must be reversible
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 16: Image Picker Component

```
You are implementing an image picker for the portfolio builder.

Read these files to understand your goal:
- plans/slices/16-image-picker.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Study the existing codebase and build on it incrementally.

Goal: Allow featured images to be selected from existing site images.

Your deliverables:
- ImagePicker modal component
- API endpoint to list all site images with source metadata
- Grid view with page/section source labels
- Search and filter by page
- Single image selection with visual feedback
- Keyboard navigation and accessibility

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- This is for selecting existing images, NOT uploading new ones
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 17: Category Management UI

```
You are implementing category management for the portfolio builder.

Read these files to understand your goal:
- plans/slices/17-category-management.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Study the existing codebase and build on it incrementally.

Goal: Users can create and manage categories for their portfolio projects.

Your deliverables:
- Category list view in admin area
- Create/edit/delete categories
- Category reordering (drag-and-drop or up/down buttons)
- Featured image selection using Image Picker
- Project count display per category
- Empty state for no categories
- Navigation to category's projects

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- Uses Image Picker
- Uses Category API
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

---

## Category/Project Hierarchy (Slices 18-22)

### Slice 18: Project Management UI

```
You are implementing project management for the portfolio builder.

Read these files to understand your goal:
- plans/slices/18-project-management-ui.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Study the existing codebase and build on it incrementally.

Goal: Users can create and manage projects within their portfolio categories.

Your deliverables:
- Project list view within category context
- Create project with quick-add flow (title + featured image in 30 seconds)
- Full project form with expand for details (year, venue, role, description)
- Featured image picker supporting BOTH upload new OR choose from gallery
- Gallery image management (add, reorder, remove)
- Project reordering within category (drag-drop)
- Delete confirmation dialog
- Route: /admin/categories/[id]/projects

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- Follow CategoryList patterns (drag-drop, card layout)
- Integrate ImagePicker component for gallery selection
- Featured image supports BOTH upload and gallery pick (unified interface)
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 19: Simple Onboarding Flow

```
You are implementing onboarding for the portfolio builder.

Read these files to understand your goal:
- plans/slices/19-simple-onboarding-flow.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Study the existing codebase and build on it incrementally.

Goal: Guide new users through portfolio creation with first category and project in <5 minutes.

Your deliverables:
- 3-step wizard flow: Portfolio → Theme → Category + Project
- Step 1: Portfolio name + slug (auto-generated)
- Step 2: Theme selection with visual color swatches
- Step 3: Combined category + project form with placeholder examples
- Progress indicators (step 1/3, 2/3, 3/3)
- Atomic creation (all entities created or none)
- Routes: /welcome/portfolio, /welcome/theme, /welcome/first-project
- Direct /admin access still works (skip onboarding)

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- NO authentication system (keep single-portfolio model)
- Placeholder text: "e.g., Theatre, Film, Commercial" (NOT pre-filled)
- Placeholder text: "e.g., Hamlet 2024, Period Drama, Spring Collection"
- Validation on blur with clear error messages
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 20: Admin Sidebar Navigation

```
You are implementing admin sidebar navigation for the portfolio builder.

Read these files to understand your goal:
- plans/slices/20-admin-sidebar.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Study the existing codebase and build on it incrementally.

Goal: Desktop admin has persistent sidebar navigation for quick access.

Your deliverables:
- AdminLayout wrapper component with CSS Grid
- AdminSidebar component with navigation items
- AdminHeader component (simplified, no hamburger on desktop)
- Responsive: sidebar visible >=1024px, hidden below
- Navigation items: Dashboard, Categories (simplified from original spec)
- Active state indication for current page
- Skip link for accessibility

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- Navigation simplified: Dashboard + Categories (projects accessed via category context)
- Mobile drawer is separate - don't implement here
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 21: Mobile Drawer Navigation

```
You are implementing mobile drawer navigation for the portfolio builder.

Read these files to understand your goal:
- plans/slices/21-mobile-drawer.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Study the existing codebase and build on it incrementally.

Goal: Tablet and mobile admin has hamburger menu with slide-out drawer.

Your deliverables:
- MobileDrawer component with slide animation
- Hamburger toggle in header (< 1024px)
- Backdrop overlay when drawer open
- Focus trap within drawer
- Close on: backdrop click, Escape key, navigation
- Same navigation items as desktop sidebar
- Touch-friendly sizing (44px minimum targets)

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- Uses AdminLayout and AdminLayoutContext from previous slice
- Swipe-to-close is optional enhancement (not required)
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 22: Public Category/Project Pages

```
You are implementing public category and project pages for the portfolio builder.

Read these files to understand your goal:
- plans/slices/22-public-category-project-pages.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Study the existing codebase and build on it incrementally.

Goal: Visitors can browse portfolio work organized by categories and view project details.

Your deliverables:
- Category landing page template (grid of project cards)
- Project detail page template (gallery-primary layout)
- Featured work integration on homepage (isFeatured flag)
- Category navigation in site header (dynamic dropdown for >5 categories)
- Breadcrumb navigation (Category > Project)
- Image card hover overlay pattern (desktop) / text below (mobile)
- Gallery lightbox with keyboard navigation
- Routes: /[portfolio]/[category], /[portfolio]/[category]/[project]

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- Reuse existing template patterns (Featured Grid Landing)
- Image hover overlay: desktop only, mobile shows text below
- Gallery: 2-column desktop, 1-column mobile
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

---

## Admin Coherence Remediation (Slices 23-25)

### Slice 23: Admin Navigation Structure

```
You are implementing comprehensive navigation for the portfolio builder admin interface.

Read these files to understand your goal:
- plans/slices/23-admin-navigation-structure.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Study the existing codebase and build on it incrementally.

Goal: Users can navigate to any content (pages, categories, projects) through coherent navigation system.

Your deliverables:
- Populated drawer/sidebar with hierarchical navigation structure
- Pages section showing all pages with homepage indicator (★)
- Categories section with expandable tree showing project counts
- Breadcrumb navigation component
- Click category → Navigate to projects (direct, no menu)
- Click page → Navigate to page editor
- Active state indication for current location
- Unified navigation in both sidebar (desktop) and drawer (mobile)

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- The drawer is currently empty - this populates it with actual navigation
- Categories should show expandable tree (click chevron to show projects)
- Remove references to non-existent routes (/admin/portfolio, /admin/settings)
- Navigation should feel coherent and obvious
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 24: Admin Pattern Unification

```
You are unifying admin interaction patterns for the portfolio builder.

Read these files to understand your goal:
- plans/slices/24-admin-pattern-unification.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Study the existing codebase and build on it incrementally.

Goal: Establish consistent interaction patterns across all admin interfaces.

Your deliverables:
- Convert CategoryCard to CategoryListItem (list pattern for hierarchical management)
- Make category rows fully clickable for direct navigation
- Update ProjectCard to be fully clickable (entire card navigates to editor)
- Remove redundant Edit buttons and hidden dropdown menus
- Improve homepage indication (badge with "Home" text, not just icon)
- Add helper text for homepage routing behavior
- Consistent action button patterns (Edit, Delete always visible)

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- Cards are for visual browsing, lists are for hierarchical management
- Primary action should be obvious (click row/card directly)
- No hidden menus for navigation (actions can be in menus, navigation cannot)
- Entire category row clickable → navigate to projects
- Entire project card clickable → navigate to editor
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 25: Project Editor Design Compliance

```
You are fixing design system compliance in the project editor for the portfolio builder.

Read these files to understand your goal:
- plans/slices/25-project-editor-design-compliance.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Design reference (auto-loaded via slice spec):
- plans/design/DESIGN-SYSTEM.md

Study the existing codebase and build on it incrementally.

Goal: Project editor uses design system tokens consistently for professional appearance.

Your deliverables:
- Fix button spacing (gap-3 → gap-4 for 16px between buttons)
- Replace hardcoded Tailwind classes with design system tokens
- Use .btn, .btn-primary, .btn-secondary classes (already exist in globals.css)
- Replace hardcoded gray-* colors with --admin-* semantic tokens
- Replace hardcoded text-* sizes with --font-size-* tokens
- Fix all spacing to use --space-* tokens consistently
- Use ProjectMetadataSidebar.tsx as reference (already correct!)

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- DO NOT change functionality or layout structure
- Visual appearance improves but structure stays same
- This is about token usage, not refactoring
- Fix: src/app/admin/projects/[id]/page.tsx (main fixes needed here)
- Fix: src/components/admin/FeaturedImagePicker.tsx (button spacing)
- Reference: ProjectMetadataSidebar.tsx (shows correct token usage)
- Meet ALL success criteria (design token compliance)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 26: Admin Code Quality

```
You are improving admin code organization and maintainability for the portfolio builder.

Read these files to understand your goal:
- plans/slices/26-admin-code-quality.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Study the existing codebase and build on it incrementally.

Goal: Improve maintainability by organizing CSS and documenting patterns.

Your deliverables:
- Extract large CSS-in-JS blocks to CSS modules
- Reduce component file sizes (target: <300 lines)
- Convert inline animation styles to CSS classes
- Add missing design tokens for hardcoded values
- Document admin design patterns in ADMIN-PATTERN-LIBRARY.md
- Create component usage guidelines (cards vs lists vs tables)

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- This is REFACTORING - functionality and visual appearance stay the same
- Extract CSS without changing behavior
- Document patterns for future consistency
- Component files should be readable and maintainable
- Meet ALL success criteria (functional AND code quality)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 27: Featured Carousel

```
You are implementing a carousel for featured work on the portfolio builder.

Read these files to understand your goal:
- plans/slices/27-featured-carousel.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Study the existing codebase and build on it incrementally.

**BUSINESS CONTEXT: Customer requires carousel - won't pay without it. This is urgent.**

Goal: Homepage displays featured work in auto-rotating carousel with maximum visual impact.

Your deliverables:
- FeaturedCarousel component with auto-rotation (5s per slide)
- Manual navigation (prev/next buttons, keyboard arrows)
- Touch swipe support (mobile left/right gestures)
- Indicator dots (click/tap to jump to slide)
- Pause/play button (WCAG accessibility requirement)
- Image overlay with project title/venue/year
- Responsive (16:9 desktop, 4:3 mobile)
- Click slide → Navigate to project page
- Full accessibility (keyboard, screen readers, reduced motion)

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- Reuse Lightbox touch swipe pattern (already works)
- Reuse ProjectCard overlay pattern (already works)
- 5 seconds per slide (let viewers appreciate costume work)
- Crossfade transitions (professional, not corporate)
- Pause on ANY user interaction
- Auto-rotation disabled for prefers-reduced-motion
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

**Quick ship option**: Build manual navigation first (4-6 hours), add auto-rotate second (2-3 hours).

When done, confirm all success criteria are met.
```

### Slice 28: Public Site Polish

```
You are implementing professional polish for the published portfolio site.

Read these files to understand your goal:
- plans/slices/28-public-site-polish.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Study the existing codebase and build on it incrementally.

Goal: Portfolio has professional empty states, loading states, and error handling for launch readiness.

Your deliverables:
- Empty states for homepage (no featured projects), categories (no projects), galleries (no images)
- Loading states with skeleton screens for all grids
- Error handling for broken images (fallback placeholders)
- 404 pages for invalid portfolio/category/project URLs
- Helpful messaging and CTAs in empty states
- Mobile-optimized responsive layouts
- Shimmer loading animation
- Blur-up image loading technique

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- Empty states should be encouraging, not negative
- Skeleton screens prevent layout shift
- All edge cases handled gracefully
- Maintain visual hierarchy in empty/loading states
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 29: Template Selection System

```
You are implementing template selection for the portfolio builder.

Read these files to understand your goal:
- plans/slices/29-template-selection.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Design references (auto-loaded via slice spec):
- plans/design/TEMPLATE-SYSTEM.md
- plans/design/templates/featured-grid-landing.md
- plans/design/templates/clean-minimal.md

Study the existing codebase and build on it incrementally.

Goal: Users can choose between different page templates and preview how content looks in each.

Your deliverables:
- Template selector UI in portfolio settings
- Portfolio.template field in database (draftTemplate, publishedTemplate)
- Clean Minimal template implementation (full-width stacked images)
- Template preview modal showing user's actual content
- Template switching preserves all content
- Both templates work with all 3 themes (6 combinations total)
- Responsive templates (mobile/tablet/desktop)

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- Extract current layout as "FeaturedGridTemplate"
- Implement Clean Minimal per design spec (maddievare.com reference)
- Templates share components (Navigation, Footer, ProjectCard)
- Only homepage uses templates (category/project pages stay same)
- Template + Theme = independent choices (2 templates × 3 themes = 6 combos)
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

### Slice 30: About Section

```
You are implementing optional About section for portfolio homepages.

Read these files to understand your goal:
- plans/slices/30-about-section.md
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Design reference (auto-loaded via slice spec):
- plans/design/templates/featured-grid-landing.md (About section spec)

Study the existing codebase and build on it incrementally.

Goal: Portfolio owners can add optional About section with photo and bio to homepage.

Your deliverables:
- AboutSection component for homepage (photo + bio, responsive)
- Portfolio fields: title, bio (exists), profilePhotoId, showAboutSection toggle
- Extend onboarding Step 1 with optional bio fields (collapsible)
- Settings UI to edit bio, upload/change photo, toggle visibility
- Side-by-side layout (desktop), stacked layout (mobile)
- Works with all templates and themes

Working space: Use ai_working/ for planning and notes.

Important:
- Build on existing work, don't replace it
- Bio field already exists in Portfolio schema - just add UI
- Make onboarding fields truly optional (collapsible sections)
- Default: showAboutSection = true if bio provided
- About section appears BETWEEN hero and featured work
- Keep onboarding under <5 min (bio is optional)
- Meet ALL success criteria (functional AND design)
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```
