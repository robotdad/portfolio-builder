# Layout Pattern Options: Category/Project Hierarchy

**Date:** 2026-01-02  
**Context:** Portfolio builder moving from flat pages to hierarchical structure  
**Purpose:** Provide layout options for category pages, project pages, home integration, and system architecture

---

## Decision Point 1: Category Landing Pages

**Question:** How should category pages present their projects?

---

### Option A: Grid Gallery (Recommended)

**Visual Structure:**
```
┌─────────────────────────────────────────┐
│ Theatre Work                            │ ← H1: Category name
│ Classical and contemporary productions  │ ← Description (optional)
│                                         │
│ ┌────────┐ ┌────────┐ ┌────────┐      │
│ │Hamlet  │ │Macbeth │ │Romeo & │      │ ← 3-col grid (desktop)
│ │2024    │ │2023    │ │Juliet  │      │
│ └────────┘ └────────┘ └────────┘      │
│                                         │
│ ┌────────┐ ┌────────┐                 │
│ │King    │ │Midsummer│                │
│ │Lear    │ │Night   │                 │
│ └────────┘ └────────┘                 │
└─────────────────────────────────────────┘
```

**User Workflow:**
- Lands on category → Sees all projects at once
- Scans grid visually (F-pattern)
- Clicks card → Project detail page
- Quick mental model: "This category contains these projects"

**Mobile Behavior:**
- 3/2/1 responsive columns (existing pattern)
- Cards stack vertically on phone
- Title/metadata below image (no hover)
- Infinite scroll OR "Load More" after 12 projects

**Alignment with Templates:**
- **Perfect match** with Featured Grid template pattern
- Reuses ImageCardHoverOverlay component (desktop hover, mobile text below)
- Same 4:3 aspect ratio cards
- Consistent grid spacing (--space-5)

**Implementation Complexity:** ⭐⭐ Low (2/5)
- Reuse existing grid CSS from Featured Grid
- Reuse existing ImageCard component
- Add category metadata at top
- Pagination logic if >12 projects

**Rationale:** Customer said nmhartistry.com is "meticulous organization" — grid pattern supports scanning/comparing projects within category.

---

### Option B: Featured + List

**Visual Structure:**
```
┌─────────────────────────────────────────┐
│ Theatre Work                            │
│                                         │
│ ┌────────────────────────────────────┐ │
│ │                                    │ │ ← Featured project
│ │   Latest: Hamlet 2024 (hero)      │ │   (large, prominent)
│ │                                    │ │
│ └────────────────────────────────────┘ │
│                                         │
│ All Projects:                           │
│ • Romeo & Juliet (2024)                │ ← Chronological list
│ • Macbeth (2023)                       │
│ • King Lear (2022)                     │
│   ...                                  │
└─────────────────────────────────────────┘
```

**User Workflow:**
- Sees latest/featured work prominently
- Scrolls list for older work
- Click list item → Project detail

**Mobile Behavior:**
- Hero image stacks on top
- List items remain text-based
- Tap list item → Navigate

**Alignment with Templates:**
- Hybrid: Featured hero + structured list
- Introduces new list pattern (not in current templates)
- Less visual than grid approach

**Implementation Complexity:** ⭐⭐⭐ Medium (3/5)
- New list component needed
- Logic for "featured within category" (adds complexity)
- Date sorting/grouping

**Rationale:** Good for categories with many projects (>20) where chronological browsing makes sense.

---

### Option C: Timeline Grid

**Visual Structure:**
```
┌─────────────────────────────────────────┐
│ Theatre Work                            │
│                                         │
│ 2024                                    │ ← Year divider
│ ┌────────┐ ┌────────┐                 │
│ │Hamlet  │ │Romeo & │                 │
│ └────────┘ └────────┘                 │
│                                         │
│ 2023                                    │
│ ┌────────┐ ┌────────┐ ┌────────┐      │
│ │Macbeth │ │King    │ │Midsummer│     │
│ └────────┘ └────────┘ └────────┘      │
└─────────────────────────────────────────┘
```

**User Workflow:**
- Projects organized by year
- Visual scanning within time periods
- Natural chronological narrative

**Mobile Behavior:**
- Same 3/2/1 responsive columns
- Year headers stack naturally
- Scroll through timeline

**Alignment with Templates:**
- Extends grid pattern with year dividers
- Reuses ImageCard component
- Adds semantic structure

**Implementation Complexity:** ⭐⭐⭐ Medium (3/5)
- Group projects by year
- Render year dividers
- Handle projects without year (goes to "Undated" section)

**Rationale:** Best for users who organize work chronologically (theatre designers often do: "my 2024 season").

---

### **Recommendation: Option A (Grid Gallery)**

**Why:**
- ✅ Reuses existing patterns (low complexity)
- ✅ Visual scanning = fast comprehension
- ✅ Customer reference (nmhartistry.com uses grid)
- ✅ Scales well (12 projects fit nicely, pagination handles more)
- ✅ Mobile-friendly (proven pattern)
- ✅ Supports <5 min mobile updates (visual feedback immediate)

**When to consider alternatives:**
- Option B: If category has >30 projects (list more scannable than paginated grid)
- Option C: If user organizes work chronologically (adds narrative structure)

---

## Decision Point 2: Project Detail Pages

**Question:** What layout patterns make sense for individual project pages?

---

### Option A: Gallery Primary (Recommended)

**Visual Structure:**
```
┌─────────────────────────────────────────┐
│ ← Back to Theatre Work                  │ ← Breadcrumb
│                                         │
│ Hamlet 2024                             │ ← H1: Title
│ Shakespeare Theatre, 2024               │ ← Metadata
│                                         │
│ Elaborate Elizabethan court costumes    │ ← Description
│ for this production...                  │   (optional)
│                                         │
│ ┌────────────┐ ┌────────────┐         │
│ │            │ │            │         │ ← 2-col large images
│ │  Image 1   │ │  Image 2   │         │   (desktop)
│ │            │ │            │         │
│ └────────────┘ └────────────┘         │
│                                         │
│ ┌────────────┐ ┌────────────┐         │
│ │  Image 3   │ │  Image 4   │         │
│ └────────────┘ └────────────┘         │
└─────────────────────────────────────────┘
```

**User Workflow:**
- Arrives from category page or home
- Reads title/metadata context
- Scrolls through large images
- Clicks image → Lightbox full-screen
- Returns via breadcrumb

**Mobile Behavior:**
- 2-col → 1-col on mobile
- Images remain prominent (large, not thumbnails)
- Vertical scroll through gallery
- Tap image → Lightbox with swipe navigation

**Alignment with Templates:**
- **Matches mockup session updates** (Featured Grid template spec)
- 2-column large images (changed from 4-column thumbnails)
- Removed redundant hero image (first gallery image serves this role)
- Gallery Grid component exists (4/3/2 pattern)

**Implementation Complexity:** ⭐⭐ Low (2/5)
- Reuse GalleryGrid component (adjust to 2-col from 4-col)
- Lightbox already specified
- Breadcrumb navigation simple
- Metadata display straightforward

**Rationale:** Portfolio focuses on visual work — images are primary content. Large images respect the craft. Mockup session eliminated "hero image duplicating first gallery image" smell.

---

### Option B: Story Layout

**Visual Structure:**
```
┌─────────────────────────────────────────┐
│ Hamlet 2024                             │
│                                         │
│ ┌────────────────────────────────────┐ │
│ │                                    │ │ ← Featured image
│ │         Hero Image                 │ │   (large)
│ └────────────────────────────────────┘ │
│                                         │
│ [Text] The production required...      │
│                                         │
│ ┌─────┐ ┌─────┐ ┌─────┐              │ ← Mixed text
│ │Img 1│ │Img 2│ │Img 3│              │   & images
│ └─────┘ └─────┘ └─────┘              │
│                                         │
│ [Text] For the court scenes...         │
│                                         │
│ ┌────────────────┐                     │
│ │  Large image   │                     │
│ └────────────────┘                     │
└─────────────────────────────────────────┘
```

**User Workflow:**
- Narrative reading experience
- Text explains design decisions
- Images support story
- Scrolls linearly through content

**Mobile Behavior:**
- Natural stacking
- Text wraps
- Images resize

**Alignment with Templates:**
- **Introduces new pattern** (not in current templates)
- More editorial than portfolio grid approach
- Similar to blog post layout

**Implementation Complexity:** ⭐⭐⭐⭐ High (4/5)
- New flexible content model needed
- Text + image sections (variable order)
- WYSIWYG editor for rich content
- More complex than pure gallery

**Rationale:** Best for users who want to explain process, not just show results. More work to create/maintain.

---

### Option A: Hero + Grid + Sidebar

**Visual Structure:**
```
┌─────────────────────────────────────────┐
│ ┌────────────┐ ┌──────────────────────┐│
│ │            │ │ Hamlet 2024          ││ ← Sidebar:
│ │  Featured  │ │                      ││   metadata
│ │  Image     │ │ Year: 2024           ││
│ │  (hero)    │ │ Venue: Shakespeare   ││
│ │            │ │ Role: Lead Designer  ││
│ └────────────┘ │                      ││
│                │ [Description...]     ││
│                └──────────────────────┘│
│                                         │
│ Gallery:                                │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐          │
│ │Img │ │Img │ │Img │ │Img │          │ ← 4-col grid
│ └────┘ └────┘ └────┘ └────┘          │
└─────────────────────────────────────────┘
```

**User Workflow:**
- Hero image grabs attention
- Sidebar provides context
- Gallery shows details
- Desktop layout maximizes screen space

**Mobile Behavior:**
- Stacks: Hero → Metadata → Gallery
- 4-col → 2-col → 1-col

**Alignment with Templates:**
- Reintroduces hero image (removed in mockup session as "redundant")
- Sidebar pattern not in current templates
- More complex layout

**Implementation Complexity:** ⭐⭐⭐⭐ High (4/5)
- Sidebar layout CSS
- Responsive stacking
- Featured image separate from gallery (duplicate storage)

**Rationale:** Desktop-optimized, but adds complexity rejected in mockup session.

---

### **Recommendation: Option A (Gallery Primary)**

**Why:**
- ✅ **Aligns with mockup session decisions** (removed redundant hero)
- ✅ Images are primary content (portfolio focus)
- ✅ Large images respect craft (2-col, not tiny thumbnails)
- ✅ Simple, maintainable (customer wants <5 min updates)
- ✅ Mobile-friendly (stacks naturally)
- ✅ Reuses existing components (low complexity)

**When to consider alternatives:**
- Option B: If user wants to tell process stories (more editorial)
- Option C: If desktop sidebar provides value (more metadata fields)

---

## Decision Point 3: Home Page Integration

**Question:** How do featured images from projects/categories flow to home page?

---

### Option A: Manual Featured Flag (Recommended)

**Visual Structure:**
```
Admin: Project Edit Screen
┌─────────────────────────────────────────┐
│ Hamlet 2024                             │
│                                         │
│ ☑ Feature on homepage                  │ ← Toggle checkbox
│                                         │
│ Featured since: Dec 15, 2024           │ ← Metadata
└─────────────────────────────────────────┘

Home Page:
┌─────────────────────────────────────────┐
│ Sarah Chen                              │
│ Theatre Costume Designer                │
│                                         │
│ ┌────────┐ ┌────────┐ ┌────────┐      │
│ │Hamlet  │ │Macbeth │ │Romeo & │      │ ← Featured projects
│ │☆       │ │☆       │ │☆       │      │   (user-selected)
│ └────────┘ └────────┘ └────────┘      │
└─────────────────────────────────────────┘
```

**User Workflow:**
1. Edit project in admin
2. Check "Feature on homepage" box
3. Save
4. Project appears on landing page grid
5. Reorder featured projects (drag-and-drop)

**Implementation:**
- Database: `Project.isFeatured` boolean field (already in schema)
- Query: `SELECT * FROM Project WHERE isFeatured = true ORDER BY order`
- Admin UI: Simple checkbox toggle
- Landing page: Filter featured projects, render in grid

**Pros:**
- ✅ **Explicit user control** (no surprises)
- ✅ Simple mental model ("featured = on homepage")
- ✅ Works with all templates (grid shows featured projects)
- ✅ Low complexity (single boolean field)
- ✅ Drag-reorder featured projects easily

**Cons:**
- ⚠️ Requires manual curation (user must remember to feature/unfeature)
- ⚠️ Empty state if nothing featured (needs prompt)

**Mobile Update Flow:**
1. Open project on phone backstage
2. Tap "Feature" toggle
3. Save (auto-save after 30s)
4. Homepage updates
5. **Time: <1 minute**

---

### Option B: Automatic "Recent + Popular"

**Visual Structure:**
```
Home Page:
┌─────────────────────────────────────────┐
│ Recent Work                             │ ← Section 1
│ ┌────────┐ ┌────────┐ ┌────────┐      │
│ │Hamlet  │ │Romeo & │ │Macbeth │      │ ← 3 most recent
│ │(2 days)│ │(1 week)│ │(2 weeks│      │   projects
│ └────────┘ └────────┘ └────────┘      │
│                                         │
│ Featured                                │ ← Section 2
│ ┌────────┐ ┌────────┐ ┌────────┐      │
│ │Hamlet  │ │Othello │ │Lear    │      │ ← Most viewed
│ │(125    │ │(98     │ │(87     │      │   or flagged
│ │ views) │ │ views) │ │ views) │      │
│ └────────┘ └────────┘ └────────┘      │
└─────────────────────────────────────────┘
```

**User Workflow:**
1. Upload new project
2. System automatically shows as "recent"
3. Projects stay visible based on recency/views
4. Optional manual feature flag for promotion

**Implementation:**
- Database: Track `createdAt`, `viewCount`
- Query: Order by date/views
- Algorithm decides what's prominent
- Hybrid: Allow manual override

**Pros:**
- ✅ Automatic (no curation needed)
- ✅ Always shows recent work
- ✅ Portfolio feels "active"

**Cons:**
- ⚠️ Less control (algorithm decides)
- ⚠️ Tracking complexity (view counts, analytics)
- ⚠️ Not aligned with customer need (wants organized, not algorithmic)

---

### Option C: Category Featured Images

**Visual Structure:**
```
Home Page:
┌─────────────────────────────────────────┐
│ Work by Category                        │
│                                         │
│ ┌────────┐ ┌────────┐ ┌────────┐      │
│ │Theatre │ │Film    │ │Opera   │      │ ← Category cards
│ │Work    │ │Projects│ │        │      │   (featured image
│ └────────┘ └────────┘ └────────┘      │    from category)
│                                         │
│ Recent Projects                         │ ← Below categories
│ ┌────────┐ ┌────────┐ ┌────────┐      │
│ │Hamlet  │ │Macbeth │ │Romeo & │      │
│ └────────┘ └────────┘ └────────┘      │
└─────────────────────────────────────────┘
```

**User Workflow:**
1. Set featured image for each category
2. Homepage shows categories first
3. User clicks category → See all projects
4. Recent projects shown below

**Implementation:**
- Database: `Category.featuredImageId` (already in schema)
- Landing shows categories, not individual projects
- Two-tier navigation (categories → projects)

**Pros:**
- ✅ Organized by category (matches IA structure)
- ✅ Good for many categories (5-10)
- ✅ Reduces homepage clutter

**Cons:**
- ⚠️ Less direct (extra click to see projects)
- ⚠️ Not aligned with templates (Featured Grid shows projects, not categories)
- ⚠️ Requires category featured images (more curation)

---

### **Recommendation: Option A (Manual Featured Flag)**

**Why:**
- ✅ **Aligns with existing template specs** (Featured Grid expects featured projects)
- ✅ Explicit user control (customer wants "meticulous organization")
- ✅ Simple implementation (boolean field + query)
- ✅ Works with <5 min mobile updates (quick toggle)
- ✅ Drag-reorder for prominence control
- ✅ Empty state prompts user to feature projects (discovery)

**Implementation Notes:**
- `Project.isFeatured` boolean (already in schema)
- `Project.order` for featured project order
- Admin: Checkbox in project edit form
- Admin: Drag-reorder in "Featured Projects" section
- Landing: Query featured, render in grid (existing pattern)

**Empty State:**
```
Home Page (0 featured):
┌─────────────────────────────────────────┐
│ Sarah Chen                              │
│ Theatre Costume Designer                │
│                                         │
│ 📸                                      │
│ No featured projects yet                │
│                                         │
│ Mark projects as featured to showcase   │
│ your best work on your homepage         │
│                                         │
│ [Browse Projects]                       │
└─────────────────────────────────────────┘
```

---

## Decision Point 4: Layout System Architecture

**Question:** Should layouts be template-based (choose one) or section-based (compose sections)? Or hybrid?

---

### Option A: Template-Based (Recommended)

**Structure:**
```
Portfolio Settings:
┌─────────────────────────────────────────┐
│ Template: ○ Featured Grid               │ ← Choose ONE
│           ○ Clean Minimal               │   template
│           ○ Hero Carousel (Phase 2)     │
│                                         │
│ Theme:    ○ Modern Minimal              │ ← Choose ONE
│           ○ Classic Elegant             │   theme
│           ○ Bold Editorial              │
└─────────────────────────────────────────┘

Result:
- Template controls STRUCTURE (layout, sections, composition)
- Theme controls APPEARANCE (colors, fonts, spacing)
- Content fills template slots
```

**Content Model:**
```
Template expects:
- Slot: "hero" → User provides: name, title
- Slot: "featured_work" → System queries: featured projects
- Slot: "about" → User provides: bio (optional)
- Slot: "footer" → User provides: email (optional)
```

**User Workflow:**
1. Select template (Featured Grid)
2. Template determines page structure
3. Fill content slots (name, title, projects)
4. Switch template → Structure changes, content preserved

**Pros:**
- ✅ **Consistent structure** (professional results without design expertise)
- ✅ Simple mental model (template = complete layout)
- ✅ Easy to add templates (new complete layouts)
- ✅ Theme-constrained creativity (mission statement)
- ✅ Preview templates side-by-side (helps decision)

**Cons:**
- ⚠️ Less flexible (can't mix template elements)
- ⚠️ Template switching may lose some content (if slots differ)

**Implementation Complexity:** ⭐⭐⭐ Medium (3/5)
- Define template interface (slots)
- Create template components (Featured Grid, Clean Minimal)
- Template switcher in settings
- Preview mode
- Content slot mapping

**Mobile Workflow:**
- Settings on phone → Choose template
- See preview
- Tap "Apply"
- Template switches
- **Time: <2 minutes**

---

### Option B: Section-Based (Flexible Composition)

**Structure:**
```
Page Builder:
┌─────────────────────────────────────────┐
│ [+ Add Section] ▼                       │
│   • Hero                                │
│   • Featured Work Grid                  │
│   • About                               │
│   • Gallery                             │
│   • Text Block                          │
│                                         │
│ Current Page:                           │
│ ┌─────────────────────────────────────┐ │
│ │ ☰ Hero                              │ │ ← Drag to reorder
│ ├─────────────────────────────────────┤ │
│ │ ☰ Featured Work Grid                │ │
│ ├─────────────────────────────────────┤ │
│ │ ☰ About                             │ │
│ ├─────────────────────────────────────┤ │
│ │ ☰ Text Block                        │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**User Workflow:**
1. Add sections in any order
2. Configure each section
3. Drag to reorder
4. Delete unwanted sections
5. Build custom page layout

**Pros:**
- ✅ Maximum flexibility (compose any layout)
- ✅ User controls everything
- ✅ Can evolve layout over time

**Cons:**
- ⚠️ **Overwhelming for target user** (costume designers, not developers)
- ⚠️ Blank canvas problem (where to start?)
- ⚠️ Easy to create unprofessional layouts
- ⚠️ Conflicts with "theme-constrained creativity" mission
- ⚠️ Already implemented (current system uses sections)

**Implementation Complexity:** ⭐⭐ Low (2/5)
- Already exists in current implementation
- Pages have sections stored as JSON
- Section-based editor already built

**Why Not Recommended:**
- Customer wants "meticulous organization" not "complete freedom"
- Target user: <5 min updates, not hours customizing
- Professional results > creative freedom

---

### Option C: Hybrid (Template + Custom Sections)

**Structure:**
```
1. Choose Template (sets default structure)
   ↓
2. Template loads with recommended sections
   ↓
3. User can add/remove/reorder sections
   ↓
4. Custom layout saved, but started from template
```

**Example:**
```
Start with: Featured Grid template
Default sections:
- Hero
- Featured Work Grid
- Footer

User customizes:
- Add "About" section
- Add "Client Logos" section
- Reorder: Hero → About → Featured Work → Client Logos → Footer
```

**Pros:**
- ✅ Guided starting point (template)
- ✅ Flexibility to customize
- ✅ Best of both worlds

**Cons:**
- ⚠️ More complex mentally (two concepts: template + sections)
- ⚠️ Template switching harder (custom sections may not fit)
- ⚠️ Partial abandonment of "theme-constrained" mission

**Implementation Complexity:** ⭐⭐⭐⭐ High (4/5)
- Template system + section system
- Migration between template/custom
- Complexity managing both

---

### **Recommendation: Option A (Template-Based)**

**Why:**
- ✅ **Aligns with mission** ("theme-constrained creativity")
- ✅ Professional results without design expertise
- ✅ Simple mental model (choose template, fill content)
- ✅ Enables template marketplace (Phase 3: user-created templates)
- ✅ Matches reference sites (nmhartistry, maddievare use consistent structures)
- ✅ Mobile-friendly decision (quick template switch)

**Structure vs Content Separation:**
```
TEMPLATE (structure) → User chooses
  ├─ Layout composition
  ├─ Section order
  ├─ Grid patterns
  └─ Interaction patterns

THEME (appearance) → User chooses
  ├─ Colors
  ├─ Fonts
  ├─ Spacing scale
  └─ Visual style

CONTENT (substance) → User provides
  ├─ Projects
  ├─ Images
  ├─ Text
  └─ Metadata
```

**Migration Path:**
1. Current pages with sections → Map to "Custom" template
2. New users → Choose template (Featured Grid or Clean Minimal)
3. Phase 2: Add more templates (Hero Carousel, etc.)
4. Phase 3: Template marketplace (advanced users can create/share)

---

## Summary Recommendations

| Decision Point | Recommended Option | Rationale |
|----------------|-------------------|-----------|
| **Category Pages** | Grid Gallery | Reuses existing patterns, visual scanning, customer reference |
| **Project Pages** | Gallery Primary | Large images (2-col), aligns with mockup session, portfolio focus |
| **Home Integration** | Manual Featured Flag | Explicit control, simple implementation, <5 min mobile updates |
| **Layout System** | Template-Based | Theme-constrained creativity, professional results, mission-aligned |

---

## Space Dimension Application (Nine Dimensions #4)

**Consistent spacing hierarchy across all layouts:**

### Category Page Spacing:
```css
.category-page {
  padding: var(--space-8) var(--mobile-padding);  /* Outer container */
}

.category-header {
  margin-bottom: var(--space-8);  /* Header to grid */
}

.category-grid {
  gap: var(--space-5);  /* Between cards: 24px */
}
```

### Project Page Spacing:
```css
.project-page {
  padding: var(--space-6) var(--mobile-padding);  /* Outer */
}

.project-header {
  margin-bottom: var(--space-6);  /* Header to gallery */
}

.project-gallery {
  gap: var(--space-6);  /* Between images: 32px (larger for 2-col) */
}
```

### Home Page Spacing:
```css
.landing-hero {
  padding: var(--space-6) var(--mobile-padding) var(--space-5);  /* Compact hero */
}

.featured-section {
  padding: 0 var(--mobile-padding) var(--space-10);  /* Featured work */
}

.featured-grid {
  gap: var(--space-5);  /* 24px between cards */
}
```

**Spacing creates visual hierarchy:**
- Larger gaps (--space-6 to --space-10) = Section separation
- Medium gaps (--space-4 to --space-5) = Related items
- Small gaps (--space-2 to --space-3) = Tightly coupled content

---

## Accessibility Requirements

### Keyboard Navigation Order:

**Category Page:**
1. Skip to main content link
2. Navigation menu
3. Category title (H1)
4. Project cards (tab through grid, left-to-right, top-to-bottom)
5. Pagination controls (if applicable)
6. Footer links

**Project Page:**
1. Skip to main content
2. Navigation menu
3. Breadcrumb navigation
4. Project title (H1)
5. Gallery images (tab through, can activate with Enter/Space)
6. Footer links

**Home Page:**
1. Skip to main content
2. Navigation menu
3. Hero content
4. Featured project cards
5. Footer links

### Landmark Regions:

```html
<header role="banner">
  <nav aria-label="Main navigation">...</nav>
</header>

<main role="main">
  <nav aria-label="Breadcrumb" aria-describedby="breadcrumb-desc">
    <span id="breadcrumb-desc" class="sr-only">You are here:</span>
    ...
  </nav>
  
  <section aria-labelledby="category-heading">
    <h1 id="category-heading">Theatre Work</h1>
    ...
  </section>
</main>

<footer role="contentinfo">...</footer>
```

---

## Mobile-First Responsive Patterns

### Breakpoint Strategy:

```css
/* Mobile first (base styles) */
.grid {
  grid-template-columns: 1fr;  /* 1 column */
  gap: var(--space-4);
}

/* Tablet (640px+) */
@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);  /* 2 columns */
    gap: var(--space-5);
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);  /* 3 columns */
    gap: var(--space-5);
  }
}
```

### Touch Targets (Mobile):
- All interactive elements ≥ 44px
- Card minimum height: 280px (ensures touch-friendly)
- Spacing between cards: 16px minimum (prevent mis-taps)

---

## Implementation Roadmap

### Phase 1: Core Hierarchy (Current)
1. ✅ Database schema (Category, Project models)
2. ✅ Category CRUD admin UI
3. ⏳ Project CRUD admin UI (in progress)
4. ⏳ Category landing pages (Grid Gallery)
5. ⏳ Project detail pages (Gallery Primary)
6. ⏳ Featured flag integration on home page

### Phase 2: Template System
1. Extract Featured Grid into template component
2. Create Clean Minimal template component
3. Add template selector in settings
4. Template preview mode
5. Content slot mapping

### Phase 3: Polish
1. Drag-reorder featured projects
2. Pagination for large categories
3. Breadcrumb navigation
4. Empty states for all pages
5. Loading states
6. Error states

---

## Next Steps

1. **Validate with stakeholder:** Show these options, get feedback
2. **Prototype category page:** Build Grid Gallery pattern first (lowest complexity)
3. **Test with real content:** Use existing projects to validate layout decisions
4. **Mobile test:** Verify <5 min update workflow on actual device
5. **Iterate:** Adjust based on usage patterns

---

**Status:** Ready for review and decision  
**Next Session:** Implement chosen patterns
