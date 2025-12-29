# Template System Architecture

**Purpose:** Define how templates and themes work together  
**Status:** Design specification (pre-implementation)  
**Last Updated:** 2025-12-28

---

## Core Concept

**Templates** and **Themes** are separate, composable choices:

- **Template** = Page structure and content organization (WHERE things go)
- **Theme** = Visual styling (HOW things look)

**User selects both independently:**
- Template: "Featured Grid Landing"
- Theme: "Modern Minimal"
- Result: Grid structure with modern styling

**Templates are swappable:**
- User can change from "Featured Grid" to "Hero Carousel"
- Content stays the same, structure changes
- Preview both before choosing

---

## What Templates Define

Templates specify **structure and layout**, NOT visual styling:

### Page Structure
- Which sections appear on landing page
- Order of sections (hero → featured → about → contact)
- Content organization patterns

### Content Slots
- Where user content goes (name, images, text)
- How many featured projects to show
- Where metadata appears

### Responsive Behavior
- How layout adapts mobile → tablet → desktop
- When to stack vs side-by-side
- Touch vs hover interactions

### Component Usage
- Which components the template uses (carousel, grid, cards)
- How components are arranged
- Content flow through components

**Templates do NOT define:**
- ❌ Colors (theme controls this)
- ❌ Typography choices (theme controls this)
- ❌ Spacing values (uses design system tokens)

---

## What Themes Define

Themes specify **visual appearance**, NOT structure:

### Color Palette
- Background, surface, text, accent colors
- Semantic color mappings
- Contrast ratios validated

### Typography
- Font families (heading, body)
- Type scale (may override base)
- Font weights and line heights

### Spacing Overrides
- Can adjust spacing scale (more/less generous)
- Uses same grid system (8px base)

### Visual Personality
- Warm vs cool
- Traditional vs contemporary
- Bold vs subtle

**Themes do NOT define:**
- ❌ Page structure (template controls this)
- ❌ Content organization (user controls this)
- ❌ Which components to use (template controls this)

---

## How They Combine

**Example: Featured Grid template + Modern Minimal theme**

```
Structure (from template):
├── Hero section (centered)
│   ├── Name slot → {{user.name}}
│   ├── Title slot → {{user.title}}
│   └── Resume slot → {{user.resume_pdf}}
├── Featured work section
│   └── Grid (3 columns desktop, 2 tablet, 1 mobile)
│       └── Image cards → {{featured_projects[]}}

Styling (from theme):
├── Colors: White bg, blue accent
├── Fonts: Playfair headings, Inter body
└── Spacing: Standard 8px grid
```

**User can change template:**
- Switch to "Hero Carousel" template
- Structure changes: Grid → Carousel
- Content stays: Same featured_projects[], just presented differently
- Styling stays: Modern theme colors/fonts still apply

**User can change theme:**
- Switch to "Classic Elegant" theme
- Structure stays: Grid layout unchanged
- Styling changes: Warm cream bg, terracotta accent, larger type
- Content stays: Same featured_projects[]

---

## Template Swapping Behavior

**When user changes template:**

```
Before:  Featured Grid + Modern Minimal
         6 featured projects in 3x2 grid

After:   Hero Carousel + Modern Minimal
         Same 6 projects in rotating carousel
         Colors/fonts unchanged
```

**What's preserved:**
- ✅ All content (categories, projects, images)
- ✅ Featured project selections
- ✅ Metadata (titles, descriptions, captions)
- ✅ Theme choice (colors and fonts stay)

**What changes:**
- Page structure (grid → carousel)
- Component types (image card → carousel slide)
- Layout behavior (all visible → one at a time)

**What user sees:**
- Immediate preview of new template
- Can switch back if they don't like it
- No content lost or modified

---

## Theme Swapping Behavior

**When user changes theme:**

```
Before:  Featured Grid + Modern Minimal
         Blue accent, Playfair/Inter fonts

After:   Featured Grid + Classic Elegant
         Terracotta accent, same fonts but larger scale
         Same grid structure
```

**What's preserved:**
- ✅ All content
- ✅ Template structure (grid stays grid)
- ✅ Featured selections
- ✅ Layout patterns

**What changes:**
- Colors (blue → terracotta, white → cream)
- Typography scale (48px → 67px display)
- Spacing (may be more generous)
- Visual mood (neutral → warm)

---

## Phase 1 Template Priority

**Build in this order:**

### Slice 1-3: Design System + Base Components
- Design system tokens (colors, typography, spacing)
- Base components (Button, Card, Image, Navigation)
- NO templates yet (just foundation)

### Slice 5-6: First Template Implementation
- **Build: "Featured Grid Landing" template** (customer reference: nmhartistry.com)
- Why first: Simplest, no carousel complexity
- Validates: Image cards, grid layout, hover overlays
- Components: Image card with hover, gallery grid, project detail

### Phase 2: Additional Templates
- **"Clean Minimal"** (customer's favorite: maddievare.com)
- **"Hero Carousel"** (adds carousel component)

**Rationale:**
- Phase 1 proves template concept with simplest pattern
- Phase 2 adds swappable alternatives
- Users get ONE good template in Phase 1, more options in Phase 2

---

## Template File Structure

**Location:** Each template is a specification document

```
plans/design/templates/
├── featured-grid-landing.md     (Phase 1)
├── clean-minimal.md             (Phase 2)
└── hero-carousel.md             (Phase 2)
```

**Implementation files will live in:**
```
src/templates/
├── featured-grid/
│   ├── LandingPage.tsx
│   ├── CategoryPage.tsx
│   ├── ProjectPage.tsx
│   └── README.md (maps to spec)
├── clean-minimal/
└── hero-carousel/
```

---

## Component Reuse Across Templates

**All templates use shared components:**

```
Shared Components:
├── ImageCard (with hover overlay)
├── GalleryGrid (responsive image grid)
├── ProjectHero (featured image + metadata)
├── Navigation (category-based menu)
└── ResumeDownload (PDF link)

Template-Specific Components:
├── Carousel (only Hero Carousel template)
├── CenteredHero (only Clean Minimal template)
└── FeaturedGrid (only Featured Grid template)
```

**Why this matters:**
- Design once, use across templates
- Consistent component behavior
- Easier to swap templates (shared component library)
- Theme styling applies to all components

---

## Validation Criteria

**Template swapping must:**
- [ ] Preserve all user content
- [ ] Update preview immediately (draft mode)
- [ ] Work with any theme
- [ ] Adapt to user's category structure (2 categories or 10)
- [ ] Handle minimal content (1 project) and rich content (50 projects)
- [ ] Mobile responsive for each template
- [ ] Accessible (keyboard nav, screen readers)

**Theme swapping must:**
- [ ] Preserve template structure
- [ ] Update colors/fonts immediately
- [ ] Maintain contrast ratios (WCAG AA)
- [ ] Work with all templates
- [ ] Preview before publishing

---

## User Mental Model

**Simple explanation for users:**

> **Template:** How your content is organized and laid out  
> **Theme:** Colors and fonts that match your style  
> 
> Try different combinations to find what showcases your work best.

**Examples:**
- "Featured Grid + Modern Minimal" = Clean, organized, professional
- "Featured Grid + Classic Elegant" = Sophisticated, traditional, warm
- "Hero Carousel + Bold Editorial" = Dramatic, contemporary, fashion-forward
- "Clean Minimal + Modern Minimal" = Ultra-clean, work-focused

---

## Implementation Notes for Tech Session

**Key architectural decisions:**

1. **Templates are React component sets** (LandingPage.tsx, CategoryPage.tsx, ProjectPage.tsx)
2. **Themes are CSS custom property overrides** (data-theme attribute)
3. **Content model is database schema** (categories, projects, images)
4. **Swapping happens client-side** (React state change, CSS cascade)

**Slice integration:**
- Slice 1: Design system (base tokens)
- Slices 2-4: Base components (used by all templates)
- Slice 5: First template implementation (Featured Grid)
- Slice 7: Template swapping UI (settings page)
- Phase 2: Additional templates (Clean Minimal, Hero Carousel)

---

## Questions for Tech Session

**These will affect implementation approach:**

1. **Template preview:** Show both templates side-by-side OR toggle between them?
2. **Template data structure:** Store template choice in database OR local storage?
3. **Featured project limits:** Hard cap (e.g., max 12) OR soft recommendation?
4. **Category limits:** Max categories in navigation (8-10 before overflow)?
5. **Image count limits:** Max images per project (50? 100? unlimited?)?

**These are implementation questions, not design questions. Flag for tech session.**

---

**Next: Creating the actual template specifications...**
