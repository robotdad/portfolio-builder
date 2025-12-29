# Template: Featured Grid Landing

**Reference:** nmhartistry.com (customer: "meticulous and well organized")  
**Phase:** Phase 1 (Primary template)  
**Status:** Specification ready for implementation

---

## Overview

Clean, organized landing page with grid of featured project cards. Professional, approachable, lets work shine.

**Best for:**
- Users with multiple projects to feature (4-6 optimal)
- Organized, systematic presentation
- Desktop and mobile equally important

**User value:**
- All featured work visible at once (no carousel waiting)
- Clean, professional first impression
- Obvious where to click for more details

---

## Landing Page Structure

### Section 1: Hero (Centered)

```
┌─────────────────────────────────┐
│                                 │
│         Sarah Chen              │  ← Name (Display size)
│   Theatre Costume Designer      │  ← Title/tagline (H3, optional)
│                                 │
│      [Download Resume]          │  ← Resume button (if provided)
│                                 │
└─────────────────────────────────┘
```

**Content slots:**
- `name` (required): Portfolio owner name
- `title` (optional): Professional title/tagline (1-2 sentences max)
- `resume_pdf` (optional): Downloadable resume

**Styling:**
- Background: `--color-background`
- Text: Centered, `max-width: 600px`
- Padding: `--space-6` top/bottom, `--space-5` left/right (mobile)
- **Design Decision**: Reduced from `--space-12` to ensure first featured images visible without scrolling (see anti-patterns doc)

**Responsive:**
- Desktop: Same layout (`--space-6` top/bottom maintained for compact hero)
- Mobile: Centered, reduce padding, stack resume button

---

### Section 2: About Section (Optional)

**NEW FEATURE FROM MOCKUP SESSION:**

```
┌──────────────────────────────────────┐
│  ┌────────┐  Sarah is a costume      │
│  │        │  designer with 10+ years │
│  │ Head-  │  experience in theatre.  │
│  │ shot   │  She specializes in...   │
│  │ (400px)│                           │
│  └────────┘  [Optional bio text]     │
└──────────────────────────────────────┘
```

**Content slots:**
- `about_image` (optional): Professional headshot (not selfie)
- `about_bio` (optional): Text block about the designer
- `show_about` (boolean): Toggle control in Navigation header
- Default: OFF (client didn't want it, but some users will)

**Layout:**
- Desktop: Image (400px) + bio text side-by-side
- Mobile: Stacked (image above text)
- Location: Between hero and featured work
- Stored: PortfolioContext with localStorage persistence

**Toggle control:**
- Location: Navigation header
- Label: "About"
- Behavior: Show/hide section, persist preference

**Design rationale:**
- Made optional because client doesn't want it
- Some users prefer personal connection via bio
- Headshot image = professional presentation
- Toggle enables user choice without forcing either approach

---

### Section 3: Featured Work Grid

```
┌──────────────────────────────────────────┐
│  Featured Work                           │  ← H2
│                                          │
│  ┌────────┐  ┌────────┐  ┌────────┐    │
│  │ Image  │  │ Image  │  │ Image  │    │  ← Row 1
│  │ Card 1 │  │ Card 2 │  │ Card 3 │    │
│  └────────┘  └────────┘  └────────┘    │
│                                          │
│  ┌────────┐  ┌────────┐  ┌────────┐    │
│  │ Image  │  │ Image  │  │ Image  │    │  ← Row 2
│  │ Card 4 │  │ Card 5 │  │ Card 6 │    │
│  └────────┘  └────────┘  └────────┘    │
└──────────────────────────────────────────┘
```

**Content slots:**
- `featured_projects[]`: List of projects marked as featured
- Each project provides:
  - `featured_image`: One image representing the project
  - `title`: Project name
  - `year` (optional): "2024"
  - `venue` (optional): "Shakespeare Theatre"

**Grid specifications:**
- Columns: 3 (desktop >1024px), 2 (tablet 640-1024px), 1 (mobile <640px)
- Gap: `--space-5` (24px desktop), `--space-4` (16px mobile)
- Aspect ratio: 4:3 (all cards consistent)
- Max featured projects: 12 (recommend 4-6 for clean look)

**Image card behavior:**
- Default: Clean image, no text overlay
- Hover (desktop): Dark overlay (30% opacity) + project title + metadata
- Mobile: Title + metadata below image (no overlay)
- Click: Navigate to project detail page

**Responsive:**
- Desktop: 3-column grid, hover overlays
- Tablet: 2-column grid, hover overlays
- Mobile: 1-column stack, titles below images

**Empty state:**
- If no featured projects: "Mark projects as featured to showcase your best work"
- Call-to-action button: "Add Your First Project"

---

### Section 4: Footer (Minimal)

```
┌─────────────────────────────────┐
│  About  |  Contact              │  ← Links to other pages
│  © 2024 Sarah Chen               │  ← Copyright (optional)
└─────────────────────────────────┘
```

**Content slots:**
- `contact_email` (optional)
- Social links (optional)

**Styling:**
- Background: `--color-surface`
- Text: `--color-text-secondary`
- Padding: `--space-8` top/bottom
- Border-top: 1px solid `--color-border`

---

## Category Page Structure

Shows all projects within one user-defined category.

```
┌──────────────────────────────────────────┐
│  Theatre Work                            │  ← Category name (H1)
│  Classical and contemporary productions  │  ← Description (optional)
│                                          │
│  ┌────────┐  ┌────────┐  ┌────────┐    │
│  │Hamlet  │  │Macbeth │  │Romeo & │    │
│  │2024    │  │2023    │  │Juliet  │    │
│  └────────┘  └────────┘  └────────┘    │
│                                          │
│  ┌────────┐  ┌────────┐                │
│  │King    │  │Midsummer│               │
│  │Lear    │  │Night   │               │
│  └────────┘  └────────┘                │
└──────────────────────────────────────────┘
```

**Content slots:**
- `category_name` (required, user-defined): "Theatre Work"
- `category_description` (optional): Text block
- `projects[]`: All projects in this category

**Grid specifications:**
- Same as featured grid (3/2/1 columns)
- Same card component (hover overlay)
- Click card → Project detail page

**Pagination:**
- If >12 projects: Paginate (12 per page)
- "Load More" button OR page numbers
- Maintain scroll position

---

## Project Detail Page Structure

Shows full gallery and details for one project.

```
┌──────────────────────────────────────────┐
│  ← Back to Theatre Work                  │  ← Breadcrumb nav
│                                          │
│  Hamlet 2024                             │  ← Project title (H1)
│  Shakespeare Theatre                     │  ← Venue (metadata)
│                                          │
│  ┌──────────────────────────┐           │
│  │                          │           │
│  │   Featured Image         │           │  ← Hero image
│  │   (Large, prominent)     │           │
│  │                          │           │
│  └──────────────────────────┘           │
│                                          │
│  Elaborate Elizabethan court costumes    │  ← Description (optional)
│  for this production of Hamlet...        │
│                                          │
│  Full Gallery                            │  ← H2
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │ Img │ │ Img │ │ Img │ │ Img │       │
│  └─────┘ └─────┘ └─────┘ └─────┘       │  ← Gallery grid
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │ Img │ │ Img │ │ Img │ │ Img │       │
│  └─────┘ └─────┘ └─────┘ └─────┘       │
│                                          │
│  Credits                                 │  ← H3 (optional)
│  Director: Jane Smith                    │
│  Production Designer: John Doe           │
└──────────────────────────────────────────┘
```

**Content slots (UPDATED FROM MOCKUP SESSION):**
- `project_title` (required)
- `year` (optional)
- `venue` (optional)
- `description` (optional, text block)
- `images[]` (required): Gallery images with captions
- **REMOVED**: `featured_image` - No separate hero (first gallery image serves this role)
- **REMOVED**: `credits` - Portfolio focuses on designer's work, not collaborators

**Gallery grid specifications (UPDATED FROM MOCKUP SESSION):**
- Columns: 2 (desktop), 1 (mobile) - Changed from 4-column thumbnails to 2-column large images
- Gap: `--space-6`
- Image size: Large, prominent (not thumbnails)
- Captions: Below each image, `--font-size-body` (readable, not tiny)
- Click image → Lightbox with:
  - Full-screen overlay with dark backdrop
  - Prev/next navigation buttons
  - Close button + ESC key support
  - Image counter ("3 of 12")

**REMOVED elements:**
- Hero featured image (was redundant - duplicated first gallery image)
- Credits section (portfolio focuses on designer's work, not collaborators)
- "Full Gallery" heading (template smell)

**Breadcrumb navigation:**
- Pattern: Category > Project
- Example: "Theatre Work > Hamlet 2024"
- Links back to category page

---

## Navigation Pattern

Dynamic navigation based on user's categories.

```
Desktop Header:
┌──────────────────────────────────────────┐
│ Sarah Chen    Work  Theatre  Film  About │
│               Resume [Modern][Classic]   │  ← Theme switcher
└──────────────────────────────────────────┘
```

**Navigation items:**
- Logo/Name (left, links to landing)
- "Work" dropdown → Lists user's categories
  - Theatre Work
  - Film Projects
  - Opera
  - (user-defined)
- Individual category links (if ≤5 categories)
- About page link
- Resume download link
- Theme switcher (right, for user to preview themes)

**Mobile:**
- Hamburger menu (top-right)
- Slide-out panel with:
  - Categories (collapsible sections)
  - About
  - Resume Download
  - Theme switcher (bottom of menu)

---

## Interaction Specifications

### Image Card Hover (Desktop)

**Default state:**
```css
.image-card {
  position: relative;
  aspect-ratio: 4/3;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.image-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 200ms var(--ease-smooth);
}
```

**Hover state:**
```css
.image-card:hover img {
  transform: scale(1.05);
}

.image-card:hover .overlay {
  opacity: 1;
}

.overlay {
  position: absolute;
  inset: 0;
  background: hsla(0, 0%, 0%, 0.4);
  opacity: 0;
  transition: opacity 200ms var(--ease-smooth);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: var(--space-4);
  text-align: center;
}

.overlay-title {
  color: white;
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-2);
}

.overlay-metadata {
  color: white;
  font-size: var(--font-size-small);
  opacity: 0.9;
}
```

### Image Card (Mobile)

**Structure:**
```html
<div class="image-card-mobile">
  <img src="..." alt="..." />
  <div class="card-info">
    <h3>Hamlet 2024</h3>
    <p class="metadata">Shakespeare Theatre</p>
  </div>
</div>
```

**Styling:**
- No overlay (no hover on mobile)
- Title + metadata always visible below image
- Tap entire card → Navigate to project

---

## Component Mapping

**This template uses these components:**

| Component | Purpose | Spec Location |
|-----------|---------|---------------|
| ImageCardHoverOverlay | Featured project cards | components/image-card-hover-overlay.md |
| GalleryGrid | Project detail galleries | components/gallery-grid.md |
| Lightbox | Full-screen image enlargement | (NEW - added in mockup session) |
| AboutSection | Optional bio section | (NEW - added in mockup session) |
| Navigation | Category-based menu + About toggle | components/navigation.md |
| ResumeDownload | PDF download link/button | components/resume-download.md |

**REMOVED**: ProjectHero (redundant hero image eliminated in mockup session)

---

## Content Requirements

**Minimum viable content:**
- Name: "Sarah Chen"
- 1 featured project with 1 image
- Result: Clean, complete-looking landing page

**Recommended content:**
- Name + title
- Resume PDF
- 4-6 featured projects
- 2-4 categories with multiple projects each
- Result: Professional, comprehensive portfolio

**Maximum content:**
- 12 featured projects (grid pagination after 12)
- 10 categories (navigation overflow menu after 10)
- 50 projects per category (pagination)
- 50 images per project (gallery pagination)

---

## Theme Compatibility

**Works with all themes:**

**Modern Minimal theme:**
- Clean grid, neutral colors
- Featured work prominent without competing
- Professional, approachable

**Classic Elegant theme:**
- Same grid structure
- Warm colors, larger typography
- More generous spacing between cards
- Traditional, sophisticated feel

**Bold Editorial theme:**
- Same grid structure
- Dark background, high contrast
- Contemporary, fashion-forward

**Key:** Template structure stays constant, theme changes appearance.

---

## Accessibility Requirements

**Keyboard navigation:**
- Tab order: Logo → Nav links → Featured cards (row by row) → Footer links
- Enter on card → Navigate to project page
- Escape on lightbox → Close

**Screen reader:**
- Page structure: `<header>` → `<main>` → `<footer>`
- Featured section: `<section aria-label="Featured Work">`
- Image cards: Proper heading hierarchy (H2 section → H3 card titles)

**Touch targets:**
- All interactive elements ≥ 44px
- Card minimum size: 280px width (ensures touch-friendly)
- Adequate spacing between cards (8px minimum)

---

## Performance Targets

**Landing page load (critical first impression):**
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s (featured images)
- Time to Interactive: <3.5s

**Optimization strategies:**
- Lazy-load featured images (above fold = eager, below fold = lazy)
- WebP format with fallback
- Responsive images (srcset for different screen sizes)
- Placeholder blur while loading

---

## Implementation Notes

**For Slice 5-6 (Component System & Sections):**

This template maps to your slice structure:

**Slice 5 (Component System & Sections):**
- Implement: ImageCardHoverOverlay component
- Implement: Featured Work grid section
- Implement: Hero section (name + title + resume)

**Slice 6 (Image Gallery Component):**
- Implement: GalleryGrid component
- Implement: Project detail page (hero + gallery)
- Implement: Lightbox (click to expand)

**Slice 7 (Multiple Pages & Navigation):**
- Implement: Category pages (same grid pattern)
- Implement: Dynamic navigation (based on user's categories)
- Implement: Breadcrumb navigation

**Template swapping (Phase 2):**
- Settings page: Toggle between templates
- Preview both side-by-side
- Change template → Structure updates, content preserved

---

## Validation Checklist

Before marking this template complete:

- [ ] Landing page works with 0 featured projects (prompts user)
- [ ] Works with 1 featured project (grid adapts)
- [ ] Works with 12 featured projects (pagination or limit)
- [ ] Card hover overlay shows on desktop
- [ ] Card title/metadata visible on mobile (no hover)
- [ ] Click card navigates to project detail page
- [ ] Project detail page shows all images in grid
- [ ] Gallery supports 1-50 images (pagination after 20)
- [ ] Navigation adapts to 2-10 user-defined categories
- [ ] Resume download works (if provided)
- [ ] Keyboard navigable
- [ ] Screen reader announces structure correctly
- [ ] Works with all 3 themes (Modern, Classic, Bold)
- [ ] Loads in <2.5s on 3G connection
- [ ] Mobile touch targets ≥ 44px

---

## User Scenarios

### Scenario: Marcus (First Portfolio)

**Content:**
- Name: "Marcus Williams"
- Title: "Fashion Designer"
- 1 category: "Recent Work"
- 3 projects: Fashion shoots
- 10 total images
- 3 projects marked as featured

**Template behavior:**
- Landing: Shows 3 featured cards in responsive grid
- Click card → Project detail with 3-4 images each
- Clean, professional, not overwhelming
- **Goal met:** <30 minutes to create, looks professional

### Scenario: Sarah (Mobile Update)

**Action:** Add new project from iPhone backstage

**Flow:**
1. Tap "Theatre Work" category in mobile nav
2. Tap "New Project" button
3. Upload 4 images from camera roll
4. Enter title: "Hamlet Opening Night"
5. Mark as featured
6. Save

**Template behavior:**
- New project appears in "Theatre Work" category
- Featured card appears on landing page grid (mobile 1-column)
- Touch targets work perfectly (44px+)
- **Goal met:** <5 minutes, mobile-friendly

### Scenario: Emma (50+ Projects)

**Content:**
- 6 categories (Film, Theatre, Opera, Crafts, Sketches, Personal)
- 50 total projects
- 8 featured projects

**Template behavior:**
- Landing: 8 featured cards (2 rows on desktop)
- Navigation: 6 category links (fits comfortably)
- Category pages: 8-12 projects each (pagination if needed)
- Professional, organized, not overwhelming
- **Goal met:** Organized, navigable

---

## Variations to Consider (Phase 2)

**Alternative grid layouts:**
- 4 columns desktop (more compact)
- Masonry grid (varied heights, Pinterest-style)
- Featured + recent (6 featured + 6 recent below)

**Alternative hero treatments:**
- Left-aligned name instead of centered
- Background image behind hero (subtle, doesn't compete)
- Video background option (autoplay muted)

**Alternative footer:**
- Expanded footer with all categories
- Newsletter signup
- Testimonials section

---

**Next: Creating Clean Minimal template (customer's favorite landing page)...**
