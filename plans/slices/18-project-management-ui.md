# Project Management UI

**Goal:** User can create, edit, and organize projects within their portfolio categories using inline section-based editing.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/DESIGN-SYSTEM.md
@plans/design/ADMIN-LAYOUT.md
@plans/design/CONTENT-MODEL.md
@plans/design/LAYOUT-PATTERNS.md

## Scope

**Included**:
- Project list view within category context
- Create new project (navigates to inline editor)
- Edit project with inline section-based editing (same UX as Pages)
- Delete project with confirmation dialog
- Project reordering within category (drag-and-drop)
- Metadata editing in sidebar (year, venue, role, isFeatured)
- Gallery images via Gallery section type (same as Pages)
- Featured image = first image in project sections (Hero or Gallery)
- Auto-save with 30-second interval
- Draft/publish workflow
- Project count tracking per category
- Empty state for category with no projects
- Navigation breadcrumb (Categories > Category Name > Projects)

**NOT Included**:
- Public project pages (separate future slice)
- Project duplication or templates
- Bulk project operations
- Project archiving or hiding
- SEO settings per project
- Project collaboration or sharing

## Unified Content Model

Projects use the same content architecture as Pages:

```typescript
interface Project {
  id: string
  title: string
  slug: string
  
  // Section-based content (same as Pages)
  draftContent: SectionContent | null    // JSON: sections being edited
  publishedContent: SectionContent | null // JSON: live sections
  
  // Project-specific metadata (in sidebar, not sections)
  year?: number
  venue?: string
  role?: string
  isFeatured: boolean
  
  // Standard fields
  categoryId: string
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

interface SectionContent {
  sections: Section[]
}

// Featured image is derived, not stored separately
// featuredImage = first image found in sections (Hero image or first Gallery image)
```

## Section Types

Projects support the same section types as Pages:

| Section Type | Purpose | Fields |
|--------------|---------|--------|
| **Hero** | Large header image with optional title overlay | image, title, subtitle |
| **Text** | Rich text content block | content (markdown/prose) |
| **Image** | Single image with caption | image, caption, alt |
| **Gallery** | Grid of images | images[], columns, gap |

**Featured Image Derivation:**
- System scans sections in order
- First image found becomes featured image for cards/lists
- Priority: Hero section image > first Image section > first Gallery image

## Tech Stack
- React components for project UI
- SectionList component (shared with Pages)
- Section editor components (Hero, Text, Image, Gallery)
- Metadata sidebar for project-specific fields
- Auto-save hook (shared with Pages)
- @dnd-kit for drag-and-drop reordering
- Existing API routes for projects

## Key Files
```
src/app/admin/projects/page.tsx                    # Project list (all projects)
src/app/admin/projects/[id]/page.tsx               # Project inline editor
src/app/admin/categories/[id]/projects/page.tsx    # Projects within category
src/components/admin/ProjectList.tsx               # List component
src/components/admin/ProjectCard.tsx               # Individual project display
src/components/admin/ProjectMetadataSidebar.tsx    # Year, venue, role, isFeatured
src/components/admin/SectionList.tsx               # Shared section editor (from Pages)
src/components/admin/sections/                     # Section type editors
src/hooks/useProjects.ts                           # Project data fetching/mutations
src/hooks/useAutoSave.ts                           # Shared auto-save logic
```

## Navigation Flow

```
/admin/categories
    │
    ▼ Click "View Projects" on category card
/admin/categories/[categoryId]/projects
    │
    ▼ Click project card OR "+ New Project"
/admin/projects/[projectId]
    │
    │  ◄─── Inline editor with:
    │       - Section list (center)
    │       - Metadata sidebar (right)
    │       - Save/Publish controls (header)
    │
    ▼ Click "Back" or breadcrumb
/admin/categories/[categoryId]/projects
```

## UI Design

### Project List View (Within Category)

```
+------------------------------------------------------------------+
| Categories > Theatre > Projects                [+ New Project]   |
+------------------------------------------------------------------+
|                                                                   |
|  +------------------+  +------------------+  +------------------+ |
|  |    [image]       |  |    [image]       |  |    [image]       | |
|  |                  |  |                  |  |                  | |
|  |  Hamlet 2024     |  |  Macbeth 2023    |  |  Romeo & Juliet  | |
|  |  Oregon Shakes   |  |  Portland Center |  |  5th Ave Theatre | |
|  |  [DRAFT]         |  |  [PUBLISHED]     |  |  [PUBLISHED]     | |
|  +------------------+  +------------------+  +------------------+ |
|                                                                   |
|  +------------------+                                             |
|  |  [+ placeholder] |                                             |
|  |                  |                                             |
|  |  Add Project     |                                             |
|  |                  |                                             |
|  +------------------+                                             |
|                                                                   |
+------------------------------------------------------------------+
```

### Project Inline Editor (at /admin/projects/[id])

```
+------------------------------------------------------------------+
| < Back to Projects              Hamlet 2024    [Save] [Publish ▼] |
+------------------------------------------------------------------+
|                                           |                       |
|  +------------------------------------+   |  Project Details      |
|  | [+ Add Section]                    |   |  +-----------------+  |
|  +------------------------------------+   |  | Year            |  |
|                                           |  | [2024        ]  |  |
|  +------------------------------------+   |  +-----------------+  |
|  | HERO SECTION           [drag] [x]  |   |  | Venue           |  |
|  | +--------------------------------+ |   |  | [Oregon Shakes] |  |
|  | |        [Hero Image]            | |   |  +-----------------+  |
|  | |                                | |   |  | Role            |  |
|  | |  Title: Hamlet 2024            | |   |  | [Lead Designer] |  |
|  | +--------------------------------+ |   |  +-----------------+  |
|  +------------------------------------+   |  | [ ] Featured    |  |
|                                           |  +-----------------+  |
|  +------------------------------------+   |                       |
|  | TEXT SECTION           [drag] [x]  |   |  Status: Draft        |
|  | +--------------------------------+ |   |  Last saved: 2 min ago|
|  | | Classical production with      | |   |                       |
|  | | modern interpretations...      | |   |                       |
|  | +--------------------------------+ |   |                       |
|  +------------------------------------+   |                       |
|                                           |                       |
|  +------------------------------------+   |                       |
|  | GALLERY SECTION        [drag] [x]  |   |                       |
|  | +--------------------------------+ |   |                       |
|  | | [img] [img] [img] [+ Add]      | |   |                       |
|  | | Drag to reorder                | |   |                       |
|  | +--------------------------------+ |   |                       |
|  +------------------------------------+   |                       |
|                                           |                       |
+------------------------------------------------------------------+
```

### Empty State (No Projects)

```
+------------------------------------------------------------------+
|                                                                   |
|                         [folder icon]                             |
|                                                                   |
|                    No projects in Theatre yet                     |
|                                                                   |
|         Create projects to showcase your work in this category    |
|                                                                   |
|                   [+ Create First Project]                        |
|                                                                   |
+------------------------------------------------------------------+
```

## Demo Script (30 seconds)
1. Navigate to `/admin/categories` - Click "View Projects" on Theatre category
2. See breadcrumb: "Categories > Theatre > Projects"
3. Empty state shows: "No projects in Theatre yet"
4. Click "+ Create First Project" - Navigates to `/admin/projects/new?categoryId=xxx`
5. New project editor opens with empty section list and metadata sidebar
6. Enter "Hamlet 2024" in title field (auto-saves)
7. Click "+ Add Section" - Choose "Hero"
8. Upload hero image via drag-drop or click
9. Add title overlay text
10. Click "+ Add Section" - Choose "Text"
11. Enter description text
12. Click "+ Add Section" - Choose "Gallery"
13. Upload multiple images to gallery
14. Fill in sidebar metadata: Year=2024, Venue="Oregon Shakespeare Festival", Role="Lead Designer"
15. See "Saving..." indicator, then "Saved"
16. Click "Publish" dropdown - Choose "Publish"
17. Status changes to "Published"
18. Click "< Back to Projects" - Return to list
19. Project card shows: featured image (from Hero), title, venue, "PUBLISHED" badge
20. **Success**: Full project management with inline editing

## Success Criteria

### Functional Requirements
- [ ] Project list displays all projects for the category
- [ ] Each project shows: featured image (derived from sections), title, venue, status badge
- [ ] Breadcrumb navigation shows: Categories > [Category Name] > Projects
- [ ] "+ New Project" navigates to inline editor (NOT modal)
- [ ] Inline editor matches Pages editor UX
- [ ] Can add Hero, Text, Image, Gallery sections
- [ ] Sections can be reordered via drag-drop
- [ ] Sections can be deleted
- [ ] Gallery section supports direct image upload
- [ ] Gallery images can be reordered within section
- [ ] Metadata sidebar shows year, venue, role, isFeatured
- [ ] Metadata does NOT block content editing (sidebar, not modal)
- [ ] Auto-save triggers every 30 seconds when changes exist
- [ ] Manual save button available
- [ ] Draft/Publish workflow works (same as Pages)
- [ ] Featured image derived from first image in sections
- [ ] Delete shows confirmation with impact warning
- [ ] Delete removes project and updates category project count
- [ ] Projects can be reordered within category list
- [ ] Order persists after page refresh
- [ ] Navigate between project list and project editor seamlessly

### Design Requirements
- [ ] Project cards use consistent card styling from design system
- [ ] Cards display in responsive grid (3 columns desktop, 2 tablet, 1 mobile)
- [ ] Featured image shows as card header (aspect ratio 16:9 or 4:3)
- [ ] Status badge (DRAFT/PUBLISHED) on cards
- [ ] Venue uses secondary text color
- [ ] Inline editor layout matches Pages editor
- [ ] Section list is scrollable, metadata sidebar is fixed
- [ ] Loading state shows skeleton cards
- [ ] Breadcrumb uses design system navigation styles

### Accessibility Requirements
- [ ] Project cards are keyboard navigable
- [ ] Edit/delete actions accessible via keyboard
- [ ] Breadcrumb navigation is keyboard accessible
- [ ] Delete confirmation is keyboard accessible
- [ ] Section editors are keyboard accessible
- [ ] Drag-and-drop has keyboard alternative (up/down buttons)
- [ ] Form labels properly associated with inputs
- [ ] Error messages announced to screen readers

### Mobile Requirements
- [ ] Single column layout on mobile
- [ ] Touch-friendly action buttons (44px min)
- [ ] Metadata sidebar collapses to accordion on mobile
- [ ] Touch-friendly drag-drop with 150ms delay
- [ ] Section editors work on touch devices
- [ ] Form inputs use 16px font (prevents iOS zoom)

## Pattern Reference

### Auto-Save Pattern (Shared with Pages)

```typescript
// From useAutoSave hook
const { saveStatus, triggerSave } = useAutoSave({
  data: { sections: draftContent, metadata },
  onSave: async (data) => {
    await updateProject(projectId, {
      draftContent: data.sections,
      year: data.metadata.year,
      venue: data.metadata.venue,
      role: data.metadata.role,
      isFeatured: data.metadata.isFeatured,
    })
  },
  interval: 30000, // 30 seconds
})
```

### Section List Pattern (Shared with Pages)

```typescript
import { SectionList } from '@/components/admin/SectionList'

<SectionList
  sections={draftContent?.sections ?? []}
  onChange={(sections) => setDraftContent({ sections })}
  availableTypes={['hero', 'text', 'image', 'gallery']}
/>
```

### Publish Pattern (Shared with Pages)

```typescript
const handlePublish = async () => {
  // Copy draft to published
  await updateProject(projectId, {
    publishedContent: draftContent,
  })
}

const handleUnpublish = async () => {
  await updateProject(projectId, {
    publishedContent: null,
  })
}
```

## Component Props

```typescript
interface ProjectListProps {
  categoryId: string
  projects: Project[]
  onCreateClick: () => void  // Navigates to /admin/projects/new
  onProjectClick: (project: Project) => void  // Navigates to /admin/projects/[id]
  onDeleteClick: (project: Project) => void
  onReorder: (orderedIds: string[]) => void
}

interface ProjectCardProps {
  project: Project
  onClick: () => void  // Navigate to editor
  onDelete: () => void
  featuredImage?: string  // Derived from sections
}

interface ProjectMetadataSidebarProps {
  year?: number
  venue?: string
  role?: string
  isFeatured: boolean
  onChange: (metadata: ProjectMetadata) => void
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
}

interface ProjectMetadata {
  year?: number
  venue?: string
  role?: string
  isFeatured: boolean
}
```

## API Integration

Uses existing endpoints with updated payload structure:

- `GET /api/projects?categoryId={id}` - Load projects for category
- `POST /api/projects` - Create project (returns new ID for navigation)
- `PUT /api/projects/[id]` - Update project (draftContent, metadata)
- `PUT /api/projects/[id]/publish` - Publish project (copy draft to published)
- `DELETE /api/projects/[id]` - Delete project
- `PUT /api/projects/reorder` - Reorder projects within category
- `POST /api/upload` - Upload images (for section content)

### Request/Response Examples

**Create Project:**
```typescript
POST /api/projects
{
  title: "New Project",
  categoryId: "cat_123",
  draftContent: null,
  publishedContent: null
}
// Returns: { id: "proj_456", ... }
// Then navigate to /admin/projects/proj_456
```

**Update Project (auto-save):**
```typescript
PUT /api/projects/proj_456
{
  draftContent: {
    sections: [
      { type: 'hero', image: 'img_789', title: 'Hamlet 2024' },
      { type: 'text', content: 'Classical production...' },
      { type: 'gallery', images: ['img_001', 'img_002'] }
    ]
  },
  year: 2024,
  venue: "Oregon Shakespeare Festival",
  role: "Lead Designer",
  isFeatured: false
}
```

**Publish Project:**
```typescript
PUT /api/projects/proj_456/publish
// Copies draftContent to publishedContent
```

## Effort Estimate

**Total: 8-12 hours** (reduced from 12-16 due to shared components)

- ProjectList page with breadcrumb: 2 hours
- ProjectCard component: 1 hour
- Project inline editor page: 2-3 hours (reuses SectionList)
- ProjectMetadataSidebar: 1-2 hours
- Publish workflow integration: 1 hour
- useProjects hook updates: 1 hour
- Delete confirmation: 0.5 hours
- Testing and polish: 1-2 hours

**Note:** Significant code reuse from Pages implementation:
- SectionList component (shared)
- Section editors (Hero, Text, Image, Gallery) (shared)
- useAutoSave hook (shared)
- Publish/unpublish logic pattern (shared)
