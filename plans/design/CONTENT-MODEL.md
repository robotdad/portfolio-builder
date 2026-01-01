# Content Model for Portfolio Builder

**Purpose:** Define how content is structured and organized  
**Status:** Evolving - documents current implementation AND target architecture  
**Last Updated:** 2025-12-31

---

## Overview

The content model defines how users organize their work. This document captures both the current implementation and the target architecture to support migration planning.

**Key principle:** User-defined organization, system-provided patterns.

---

## Content Model Evolution

### Current State (Slices 1-8)

The current implementation uses a **flat, page-centric model** where content is stored as JSON within pages:

```
Portfolio (one per user)
├── Settings
│   ├── name: "Sarah Chen"
│   ├── title: "Theatre Costume Designer"
│   ├── bio: Text
│   └── theme: "modern-minimal"
│
├── Assets[] (uploaded images)
│   ├── Processed image files (display, thumbnail, placeholder)
│   ├── Responsive srcset variants
│   └── Metadata (alt text, caption, dimensions)
│
└── Pages[] (user-created)
    ├── title: "Home"
    ├── slug: "" (empty for homepage)
    ├── navOrder: 0
    ├── isHomepage: true
    ├── showInNav: true
    │
    ├── draftContent: JSON string containing sections[]
    │   └── Sections are stored as JSON array:
    │       ├── { type: "hero", content: {...} }
    │       ├── { type: "featured-grid", items: [...] }
    │       ├── { type: "text-block", content: {...} }
    │       └── { type: "gallery", images: [...] }
    │
    └── publishedContent: JSON string (copy of draft when published)
```

**Current Database Schema:**
```prisma
model Portfolio {
  id        String   @id @default(cuid())
  slug      String   @unique
  name      String
  title     String
  bio       String
  theme     String   @default("modern-minimal")
  assets    Asset[]
  pages     Page[]
}

model Page {
  id               String    @id @default(cuid())
  portfolioId      String
  title            String
  slug             String
  navOrder         Int       @default(0)
  isHomepage       Boolean   @default(false)
  showInNav        Boolean   @default(true)
  draftContent     String?   // JSON: sections array
  publishedContent String?   // JSON: sections array
  lastPublishedAt  DateTime?
}

model Asset {
  id           String @id @default(cuid())
  portfolioId  String
  filename     String
  url          String
  thumbnailUrl String
  // ... image metadata
}
```

**Limitations of Current Model:**
- Projects (like "Hamlet 2024") exist only as items within FeaturedGrid sections
- No way to categorize work (Theatre, Film, Opera)
- No reusable project metadata (year, venue, role)
- Images not linked to semantic project entities
- Navigation based on pages, not content organization

---

### Target State (Slices 14-17)

The target implementation uses a **hierarchical, project-centric model** where work is organized into categories and projects:

```
Portfolio (one per user)
├── Settings
│   ├── Selected Template (Featured Grid, Hero Carousel, Clean Minimal)
│   ├── Selected Theme (Modern Minimal, Classic Elegant, Bold Editorial)
│   └── Resume PDF (optional)
│
├── Categories (user-defined, unlimited)
│   ├── Name (user provides: "Theatre", "Film", "Opera", "Personal", etc.)
│   ├── Description (optional)
│   ├── Display order (user controls)
│   └── Projects []
│
└── Projects (within categories)
    ├── Title (user provides: "Hamlet 2024", "Romeo & Juliet")
    ├── Metadata
    │   ├── Year (optional)
    │   ├── Venue (optional: "Shakespeare Theatre")
    │   ├── Role (optional: "Lead Designer", "First Hand")
    │   ├── Collaborators (optional)
    │   └── Description (optional, text block)
    ├── Featured status (boolean - shows on landing page)
    ├── Featured image (one image for cards/carousels)
    ├── Images [] (gallery)
    │   ├── Image file
    │   ├── Alt text (required for accessibility)
    │   ├── Caption (optional)
    │   └── Display order (user controls)
    └── Display order within category (user controls)
```

**Target Database Schema:**
```prisma
model Category {
  id          String    @id @default(cuid())
  name        String
  slug        String
  description String?
  order       Int       @default(0)
  
  featuredImageId String?
  featuredImage   Asset?    @relation(fields: [featuredImageId], references: [id])
  
  portfolio   Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
  portfolioId String
  projects    Project[]
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@unique([portfolioId, slug])
}

model Project {
  id          String   @id @default(cuid())
  title       String
  slug        String
  year        String?
  venue       String?
  role        String?
  description String?  @db.Text
  isFeatured  Boolean  @default(false)
  order       Int      @default(0)
  
  featuredImageId String?
  featuredImage   Asset?   @relation("ProjectFeaturedImage", fields: [featuredImageId], references: [id])
  
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId  String
  images      Asset[]  @relation("ProjectImages")
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([categoryId, slug])
}
```

---

## Migration Strategy

### Coexistence Approach

Both models will coexist during the transition:

1. **Pages remain** for static content (About, Contact, custom pages)
2. **Categories/Projects added** for portfolio work organization
3. **FeaturedGrid items migrate** to become Projects
4. **Navigation updates** to show both pages and categories

### Migration Path for Existing Content

**FeaturedGrid Items → Projects:**
```
Current FeaturedGrid item:
{
  title: "Hamlet 2024",
  category: "Theatre",  // This becomes the Category
  imageAssetId: "abc123",
  overlayPosition: "bottom-left"
}

Becomes:
Category: { name: "Theatre", slug: "theatre" }
Project: { 
  title: "Hamlet 2024", 
  categoryId: [theatre-id],
  featuredImageId: "abc123",
  isFeatured: true  // Was in FeaturedGrid, so is featured
}
```

**Default Category:**
- Items without a category → "Uncategorized" category
- User can reorganize after migration

**Asset Reassignment:**
- Images in FeaturedGrid items link to new Project
- Gallery images within projects get projectId
- Standalone page images remain page-scoped

### Rollback Strategy

If migration fails:
1. Category/Project tables can be dropped
2. Original Page.draftContent/publishedContent unchanged
3. FeaturedGrid sections still function as before

---

## User-Defined Elements

**Categories:**
- User creates and names (NOT preset)
- Examples: "Theatre", "Film", "Opera", "Crafts", "Sketches", "Personal"
- Can reorganize, rename, delete
- Navigation menu reflects user's categories

**Projects:**
- User creates and names within categories
- Examples: "Hamlet 2024", "Romeo & Juliet", "Period Drama Film"
- Can move between categories
- Can mark as featured (shows on landing page)

**Metadata:**
- ALL metadata is optional
- System works with minimal input (just images)
- Hover overlays show whatever metadata exists
- Templates adapt to available content

---

## Featured Work Selection

**Principle:** User controls what's prominent on landing page.

**Mechanism:**
- User marks projects as "featured" (toggle)
- Featured projects appear on landing page
- Template determines HOW they appear (carousel, grid, etc.)

**Limits:**
- Featured Grid template: 4-6 featured projects recommended
- Hero Carousel template: 3-8 featured projects
- Clean Minimal template: 6 featured projects

**User flow:**
1. Upload project images
2. Mark project as "Featured" (checkbox or toggle)
3. Landing page automatically includes it
4. Reorder featured projects (drag-and-drop)

---

## Content Slots (What Templates Expect)

### All Templates Expect:

**Portfolio Level:**
- `name` (required): "Sarah Chen"
- `title` (optional): "Theatre Costume Designer"
- `resume_pdf` (optional): Uploaded PDF file
- `featured_projects[]` (required for landing): List of projects marked as featured

**Category Level:**
- `category_name` (required, user-defined): "Theatre Work"
- `category_description` (optional): "Classical and contemporary productions"
- `projects[]` (required): List of projects in this category

**Project Level:**
- `project_title` (required): "Hamlet 2024"
- `featured_image` (required): One image representing project (used in cards)
- `year` (optional): "2024"
- `venue` (optional): "Shakespeare Theatre"
- `description` (optional): Text block about the project
- `images[]` (required): Gallery images for this project

**Image Level:**
- `image_file` (required): The actual image
- `alt_text` (required for accessibility): "Elizabethan court costumes"
- `caption` (optional): Hover/click to reveal

---

## Upload Workflows

### Workflow 1: Create New Project

```
1. User navigates to category (or creates new category)
   → "Theatre Work" category

2. Clicks "New Project"
   → Form appears

3. Provides project info:
   - Title: "Hamlet 2024" (required)
   - Year: "2024" (optional)
   - Venue: "Shakespeare Theatre" (optional)
   - Description: "Elaborate Elizabethan court costumes..." (optional)

4. Uploads images (drag-and-drop or file picker)
   → Multiple images at once (batch upload)

5. Selects featured image
   → Which image represents this project in cards/carousel

6. Optionally adds captions to individual images
   → Can skip this, add later

7. Marks as "Featured" if should appear on landing
   → Toggle checkbox

8. Saves project
   → Appears in category
   → If featured, appears on landing page
```

### Workflow 2: Add Images to Existing Project

```
1. Navigate to project page
2. Click "Add Images" button
3. Upload new images (batch)
4. Optionally add captions
5. Images appear in project gallery
```

### Workflow 3: Reorganize Featured Work

```
1. Go to landing page (or settings)
2. See all featured projects
3. Drag-and-drop to reorder
4. Landing page updates immediately (draft mode)
5. Publish when ready
```

---

## Template Adaptability

**Key requirement:** Templates adapt to user's content structure

**Example: User with 2 categories**
```
Navigation:
- Home
- Theatre (user-defined category)
- Film (user-defined category)
- About
- Contact
```

**Example: User with 6 categories**
```
Navigation:
- Home
- Theatre (user-defined)
- Film (user-defined)
- Opera (user-defined)
- Sketches (user-defined)
- Crafts (user-defined)
- Personal (user-defined)
- About
- Contact
```

**Template handles this by:**
- Dynamically generating navigation from user's categories
- Adapting grid layouts to content volume
- Maintaining visual consistency regardless of content amount

---

## Graceful Degradation

**Principle:** Templates work beautifully with minimal input.

**Minimal viable content:**
- Portfolio name: "Sarah Chen"
- One category: "Work"
- One project: "Recent Production"
- One image: uploaded
- Result: Complete, professional-looking site

**Progressive enhancement:**
- Add resume → Appears in navigation
- Add more images → Gallery populates
- Add descriptions → Hover overlays show them
- Mark as featured → Appears on landing
- Create categories → Navigation organizes them

**Design implication:**
- Components designed for "empty states" (placeholder text)
- Hover overlays work with just project title (no year/venue)
- Cards work without descriptions
- Galleries work with 1 image or 100

---

## Template Requirements from Content Model

**All templates must:**
- Render with 0 featured projects (show prompt to mark some)
- Render with 1-100 featured projects (grid pagination or carousel)
- Handle 1-20 categories in navigation
- Handle 1-100 projects per category
- Handle 1-100 images per project
- Work with minimal metadata (just title + image)
- Work with rich metadata (title + year + venue + description)

**Performance considerations:**
- Lazy-load images below fold
- Paginate if >50 projects in category
- Optimize featured images (critical for landing page load time)

---

## Validation Questions for Templates

When implementing templates, validate:

- [ ] Works with user-defined category names (not hardcoded "Theatre/Film")?
- [ ] Adapts to 2 categories vs 10 categories?
- [ ] Handles 0 featured projects gracefully (prompts user)?
- [ ] Handles 20 featured projects (pagination or limits)?
- [ ] Works with no metadata (just images)?
- [ ] Works with rich metadata (descriptions, credits)?
- [ ] Mobile navigation works with many categories?
- [ ] Featured work selection is obvious to user?

---

## Implementation Phases

| Phase | Content Model State | Slices |
|-------|---------------------|--------|
| Current | Pages → Sections (JSON) | 1-8 (complete) |
| Phase 1 | Polish current model | 9-13 |
| Phase 2 | Add Categories/Projects | 14-17 |
| Future | Templates use new model | TBD |

---

## Finalized Schema Design (Slice 14)

### Finalized Category Model

```prisma
model Category {
  id          String   @id @default(cuid())
  name        String
  slug        String
  description String?
  order       Int      @default(0)
  
  // Featured image (references existing Asset)
  featuredImageId String?
  featuredImage   Asset?    @relation("CategoryFeaturedImage", fields: [featuredImageId], references: [id], onDelete: SetNull)
  
  // Relationships
  portfolio   Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
  portfolioId String
  projects    Project[]
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([portfolioId, slug])
  @@index([portfolioId, order])
}
```

### Finalized Project Model

```prisma
model Project {
  id          String   @id @default(cuid())
  title       String
  slug        String
  year        String?
  venue       String?
  role        String?
  description String?  @db.Text
  isFeatured  Boolean  @default(false)
  order       Int      @default(0)
  
  // Featured image
  featuredImageId String?
  featuredImage   Asset?   @relation("ProjectFeaturedImage", fields: [featuredImageId], references: [id], onDelete: SetNull)
  
  // Relationships
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId String
  
  // Gallery images (many-to-many via junction table)
  galleryImages ProjectGalleryImage[]
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([categoryId, slug])
  @@index([categoryId, order])
  @@index([isFeatured])
}
```

### Gallery Junction Table

```prisma
model ProjectGalleryImage {
  id        String   @id @default(cuid())
  projectId String
  assetId   String
  order     Int      @default(0)
  
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  asset   Asset   @relation(fields: [assetId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@unique([projectId, assetId])
  @@index([projectId, order])
}
```

### Asset Model Updates

Add these relations to existing Asset model:
```prisma
model Asset {
  // ... existing fields remain unchanged ...
  
  // New reverse relations for featured images
  categoriesFeatured Category[] @relation("CategoryFeaturedImage")
  projectsFeatured   Project[]  @relation("ProjectFeaturedImage")
  
  // Gallery image relation
  projectGalleries ProjectGalleryImage[]
}
```

### Portfolio Model Updates

Add Category relation to existing Portfolio model:
```prisma
model Portfolio {
  // ... existing fields remain unchanged ...
  
  categories Category[]
}
```

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Featured image reference | Use Asset ID (not copy) | Saves storage, single source of truth |
| Project-Category relation | One-to-one (project in exactly one category) | Simpler UX, clear organization |
| Slug uniqueness | Scoped to parent | `/theatre/hamlet` and `/film/hamlet` both valid |
| Delete behavior | Cascade from parent | Deleting category removes its projects |
| Featured image on delete | SetNull | Don't delete project if image is removed |
| Sub-categories | Not supported in v1 | Keep it simple, can add later |
| Project movement | Allowed | Projects can move between categories |

### Relationship Diagram

```
Portfolio (1)
    │
    ├──── (N) Page (unchanged, for static content)
    │           └── draftContent/publishedContent (JSON sections)
    │
    ├──── (N) Category
    │           │
    │           ├── featuredImageId ──────┐
    │           │                         │
    │           └──── (N) Project         │
    │                       │             │
    │                       ├── featuredImageId ──────┤
    │                       │                         │
    │                       └── galleryImages ───┐    │
    │                              (junction)    │    │
    │                                            ▼    ▼
    └──── (N) Asset ◄────────────────────────────────┘
```

### Migration Compatibility

This schema is designed for coexistence:
- Page model unchanged - existing content works
- Asset model only adds optional relations - backward compatible
- Category/Project tables are additive - no existing data affected
- FeaturedGrid sections continue to function during transition

See `plans/design/MIGRATION-STRATEGY.md` for detailed migration plan.

---

**See also:**
- `plans/slices/14-content-model-schema.md` - Schema design details
- `plans/slices/15-category-project-models.md` - Implementation plan
- `ai_working/REVISED-PATH-FORWARD.md` - Overall roadmap
