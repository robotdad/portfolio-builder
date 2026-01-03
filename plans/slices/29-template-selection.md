# Template Selection System

**Goal:** Users can choose between different page templates (Featured Grid, Clean Minimal) and preview how their content looks in each.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/TEMPLATE-SYSTEM.md
@plans/design/templates/featured-grid-landing.md
@plans/design/templates/clean-minimal.md
@plans/design/DESIGN-SYSTEM.md

## Scope

**Included**:
- Template selector UI in portfolio settings
- Portfolio.template field in database (default: 'featured-grid')
- Clean Minimal template implementation
- Template preview functionality (see content in different layouts)
- Template switching without losing content
- Both templates work with all 3 themes
- Responsive templates (mobile/tablet/desktop)
- Template descriptions to help users choose

**NOT Included**:
- Custom template creation by users
- Template marketplace or sharing
- More than 2 templates (Featured Grid, Clean Minimal)
- Per-page template selection (portfolio-wide only)
- Template customization options
- Advanced layout controls
- A/B testing between templates

## Tech Stack
- React components for templates
- Existing section rendering system
- Portfolio model update (template field)
- Prisma migration for database
- CSS for template-specific styles
- Next.js dynamic rendering

## Key Files
```
src/components/portfolio/templates/FeaturedGridTemplate.tsx  # Extract current layout
src/components/portfolio/templates/CleanMinimalTemplate.tsx  # New template
src/components/admin/TemplateSelector.tsx                    # Template picker UI
src/components/admin/TemplatePreview.tsx                     # Preview modal
src/app/[slug]/page.tsx                                      # Update: use template
prisma/schema.prisma                                         # Add template field
```

## UI Design

### Template Selector in Settings

```
┌──────────────────────────────────────────────┐
│  Portfolio Settings                      [×] │
├──────────────────────────────────────────────┤
│                                              │
│  Theme                                       │
│  [ Modern Minimal ▾ ]                        │
│                                              │
│  Template                                    │
│  ┌────────────────┐  ┌────────────────┐    │
│  │ Featured Grid  │  │ Clean Minimal  │    │
│  │ [Preview]      │  │ [Preview]      │    │
│  │ ✓ Selected     │  │                │    │
│  └────────────────┘  └────────────────┘    │
│                                              │
│  Grid of project    Full-width stacked      │
│  cards with hover   images for editorial    │
│  overlay            browsing                 │
│                                              │
│         [Cancel]          [Save Changes]     │
└──────────────────────────────────────────────┘
```

### Template Preview Modal

```
┌──────────────────────────────────────────────────────────┐
│  Featured Grid Landing - Preview                     [×] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │                                                    │ │
│  │  [Live preview of homepage with user's content]   │ │
│  │  [Shows how featured work displays in grid]       │ │
│  │  [All sections visible with actual data]          │ │
│  │                                                    │ │
│  │  [Scrollable to see full page]                    │ │
│  │                                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│           [Close]             [Use This Template]        │
└──────────────────────────────────────────────────────────┘
```

## Template Comparison

### Featured Grid Landing (Current)

**Structure:**
```
Hero (compact)
├─ Name + Title + Resume
└─ --space-6 padding

[Optional About Section]
├─ Headshot + Bio
└─ Toggleable

Featured Work
├─ 3-column grid (responsive 3/2/1)
├─ Image cards with hover overlays
└─ 4-6 projects optimal

Footer
```

**Best for:**
- Organized, systematic presentation
- Multiple projects to showcase
- Professional, gallery-like feel

---

### Clean Minimal (New)

**Structure:**
```
Hero (expansive, centered)
├─ Name + Poetic tagline + Resume
└─ --space-8 padding (larger)

Featured Work
├─ Full-width stacked images (one per row)
├─ 16:9 aspect ratio
├─ Max-width 1200px
└─ 3-6 projects (fewer than grid)

Footer (minimal)
```

**Best for:**
- Visual storytellers
- Fashion/editorial work
- Dramatic, browsable experience
- Fewer projects to showcase

**Reference:** maddievare.com (customer favorite)

---

## Database Schema

### Portfolio Model Update

```prisma
model Portfolio {
  id String @id @default(cuid())
  slug String @unique
  name String
  title String?
  bio String?
  
  // Theme selection
  draftTheme String @default("modern-minimal")
  publishedTheme String @default("modern-minimal")
  
  // NEW: Template selection
  draftTemplate String @default("featured-grid")
  publishedTemplate String @default("featured-grid")
  
  // ... existing fields
}
```

**Valid template values:**
- `"featured-grid"` - Grid layout (default)
- `"clean-minimal"` - Stacked layout

## Component Interfaces

### TemplateSelector Component

```typescript
interface TemplateSelectorProps {
  currentTemplate: string
  onSelect: (templateId: string) => void
  onPreview: (templateId: string) => void
}

const templates = [
  {
    id: 'featured-grid',
    name: 'Featured Grid Landing',
    description: 'Grid of project cards with hover overlay',
    thumbnail: '/templates/featured-grid-preview.jpg',
    bestFor: 'Organized, systematic presentation'
  },
  {
    id: 'clean-minimal',
    name: 'Clean Minimal',
    description: 'Full-width stacked images for editorial browsing',
    thumbnail: '/templates/clean-minimal-preview.jpg',
    bestFor: 'Visual storytellers and fashion designers'
  }
]
```

### TemplatePreview Component

```typescript
interface TemplatePreviewProps {
  templateId: string
  portfolioData: Portfolio & {
    pages: Page[]
    featuredProjects: Project[]
  }
  theme: string
  onClose: () => void
  onSelect: () => void
}
```

### Template Components

```typescript
// FeaturedGridTemplate.tsx
interface FeaturedGridTemplateProps {
  portfolio: Portfolio
  sections: Section[]
  featuredProjects: FeaturedProject[]
  theme: string
}

// CleanMinimalTemplate.tsx
interface CleanMinimalTemplateProps {
  portfolio: Portfolio
  sections: Section[]
  featuredProjects: FeaturedProject[]
  theme: string
}
```

## Template Rendering Logic

### Homepage Template Selection

```tsx
// src/app/[slug]/page.tsx

export default async function PortfolioPage({ params }: PageProps) {
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug: params.slug },
    include: { /* ... */ }
  })
  
  const template = portfolio.publishedTemplate || 'featured-grid'
  const theme = portfolio.publishedTheme || 'modern-minimal'
  
  // Render appropriate template
  switch (template) {
    case 'featured-grid':
      return (
        <FeaturedGridTemplate
          portfolio={portfolio}
          sections={sections}
          featuredProjects={featuredProjects}
          theme={theme}
        />
      )
    
    case 'clean-minimal':
      return (
        <CleanMinimalTemplate
          portfolio={portfolio}
          sections={sections}
          featuredProjects={featuredProjects}
          theme={theme}
        />
      )
    
    default:
      return <FeaturedGridTemplate ... /> // Safe fallback
  }
}
```

## Clean Minimal Template Implementation

### Layout Structure

```tsx
export function CleanMinimalTemplate({
  portfolio,
  sections,
  featuredProjects,
  theme
}: CleanMinimalTemplateProps) {
  return (
    <div className="portfolio-page clean-minimal" data-theme={theme}>
      <Navigation
        portfolioSlug={portfolio.slug}
        categories={categories}
        pages={pages}
        theme={theme}
      />
      
      <main className="portfolio-main">
        {/* Hero - Centered, Expansive */}
        <header className="hero hero--expansive">
          <div className="hero-content">
            <h1 className="hero-title">{portfolio.name}</h1>
            {portfolio.title && (
              <p className="hero-subtitle">{portfolio.title}</p>
            )}
            {resumeUrl && (
              <a href={resumeUrl} className="hero-cta">
                Download Resume
              </a>
            )}
          </div>
        </header>
        
        {/* Featured Work - Full-Width Stacked */}
        {featuredProjects.length > 0 && (
          <section className="featured-work featured-work--stacked">
            <h2 className="section-heading">Featured Work</h2>
            
            <div className="featured-stack">
              {featuredProjects.slice(0, 6).map(project => (
                <FeaturedCard
                  key={project.id}
                  project={project}
                  layout="full-width"
                  theme={theme}
                />
              ))}
            </div>
          </section>
        )}
      </main>
      
      <Footer theme={theme} />
    </div>
  )
}
```

### Featured Card Variants

```tsx
// Featured Grid: 3-column cards
<FeaturedCard project={project} layout="grid" />

// Clean Minimal: Full-width cards
<FeaturedCard project={project} layout="full-width" />

// Shared component, different layouts
interface FeaturedCardProps {
  project: FeaturedProject
  layout: 'grid' | 'full-width'
  theme: string
}
```

## Template Switching Logic

### Settings Update Handler

```typescript
const handleTemplateChange = async (templateId: string) => {
  await fetch('/api/portfolio', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      draftTemplate: templateId
    })
  })
  
  // Show preview
  router.push(`/preview/${portfolio.slug}`)
}

// Publish applies draftTemplate → publishedTemplate
const handlePublish = async () => {
  await fetch('/api/portfolio/publish', {
    method: 'POST'
  })
  // Copies draftTemplate to publishedTemplate
}
```

## Demo Script (30 seconds)
1. Open portfolio settings in admin
2. See "Template" section with two cards: Featured Grid (selected) and Clean Minimal
3. Click "Preview" on Clean Minimal
4. Modal opens showing homepage with content in stacked layout
5. See featured work as full-width images (not grid)
6. Click "Use This Template"
7. Modal closes, Clean Minimal now selected
8. Settings show "Clean Minimal ✓ Selected"
9. Click "Save" - Template saved to draftTemplate
10. Click "Preview" button in admin - See preview with Clean Minimal
11. Verify featured work is stacked full-width
12. Click "Publish" - Template goes live
13. Visit published site - See Clean Minimal layout
14. All 3 themes work with both templates
15. Switch back to Featured Grid - Content preserved
16. **Success**: Users can choose templates without losing content

## Success Criteria

### Functional Requirements
- [ ] Portfolio.draftTemplate field exists
- [ ] Portfolio.publishedTemplate field exists
- [ ] Template selector UI in settings
- [ ] Can select Featured Grid template
- [ ] Can select Clean Minimal template
- [ ] Preview shows content in selected template
- [ ] Template change saves to draftTemplate
- [ ] Publish copies draftTemplate to publishedTemplate
- [ ] Published site uses publishedTemplate
- [ ] Preview uses draftTemplate
- [ ] FeaturedGridTemplate component works
- [ ] CleanMinimalTemplate component works
- [ ] Both templates work with all 3 themes
- [ ] Content preserved when switching templates
- [ ] Featured projects display in both templates

### Design Requirements
- [ ] Template cards show preview thumbnails
- [ ] Template descriptions helpful
- [ ] Preview modal shows actual user content
- [ ] Clean Minimal has expansive centered hero
- [ ] Clean Minimal has full-width stacked images
- [ ] Featured Grid maintains current grid layout
- [ ] Both templates responsive (mobile/tablet/desktop)
- [ ] Typography scales per theme (1.25 or 1.333)
- [ ] Spacing uses theme tokens
- [ ] Border radius uses theme values

### Accessibility Requirements
- [ ] Template selector keyboard accessible
- [ ] Preview modal has focus trap
- [ ] Preview modal has aria-label
- [ ] Template cards have descriptive labels
- [ ] Selected template has aria-selected
- [ ] Keyboard can navigate between templates
- [ ] Enter/Space activates template selection
- [ ] Escape closes preview modal

### Mobile Requirements
- [ ] Template selector works on mobile
- [ ] Preview modal full-screen on mobile
- [ ] Clean Minimal stacks properly on mobile
- [ ] Featured Grid maintains 2-column on mobile
- [ ] Touch-friendly template selection
- [ ] Both templates perform well on mobile

## Pattern Reference

### Template Pattern

```typescript
// All templates accept same props
interface TemplateProps {
  portfolio: Portfolio
  sections: Section[]
  featuredProjects: FeaturedProject[]
  theme: string
}

// Template selection logic
const TemplateMap = {
  'featured-grid': FeaturedGridTemplate,
  'clean-minimal': CleanMinimalTemplate,
}

const Template = TemplateMap[portfolio.publishedTemplate] || FeaturedGridTemplate
return <Template {...props} />
```

### Theme + Template Matrix

```typescript
// All combinations work
Templates: featured-grid | clean-minimal
Themes: modern-minimal | classic-elegant | bold-editorial

Total combinations: 2 × 3 = 6 working layouts
```

## Integration Points

These elements are designed to be extended:
- **TemplateMap** - Add future templates easily
- **Template components** - Accept same props interface
- **TemplateSelector** - Can add more template cards
- **Preview system** - Works with any template

## Effort Estimate

**Total: 16-24 hours**
- Portfolio schema update: 1 hour
- FeaturedGridTemplate extraction: 3-4 hours
- CleanMinimalTemplate implementation: 4-6 hours
- TemplateSelector component: 3-4 hours
- TemplatePreview modal: 2-3 hours
- Template switching logic: 2-3 hours
- Integration and testing: 2-3 hours
- Polish and refinement: 2-3 hours
