# Project Management UI

**Goal:** User can create, edit, and organize projects within their portfolio categories.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/DESIGN-SYSTEM.md
@plans/design/ADMIN-LAYOUT.md
@plans/design/CONTENT-MODEL.md
@plans/design/LAYOUT-PATTERNS.md

## Scope

**Included**:
- Project list view within category context
- Create new project with quick-add flow (title + featured image, expand for details)
- Edit project (title, year, venue, role, description, featured image, gallery)
- Delete project with confirmation dialog
- Project reordering within category (drag-and-drop)
- Featured image selection (upload new OR choose from gallery images)
- Gallery image management (add, reorder, remove)
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

## Tech Stack
- React components for project UI
- Existing API routes for projects and images
- Image Picker component for image selection
- Unified FeaturedImagePicker component (upload OR gallery)
- Confirmation dialog pattern
- @dnd-kit for drag-and-drop reordering

## Key Files
```
src/app/admin/categories/[id]/projects/page.tsx    # Project list page
src/components/admin/ProjectList.tsx               # List component
src/components/admin/ProjectCard.tsx               # Individual project display
src/components/admin/ProjectForm.tsx               # Create/edit form
src/components/admin/ProjectFormModal.tsx          # Modal wrapper for form
src/components/admin/FeaturedImagePicker.tsx       # Upload OR choose from gallery
src/components/admin/GalleryImageGrid.tsx          # Gallery management
src/components/admin/DeleteProjectModal.tsx        # Delete confirmation
src/hooks/useProjects.ts                           # Project data fetching/mutations
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
|  |  [Edit] [...]    |  |  [Edit] [...]    |  |  [Edit] [...]    | |
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

### Project Form Modal - Quick Add (Initial)

```
+------------------------------------------+
| New Project                          [X] |
+------------------------------------------+
|                                          |
|  Project Title *                         |
|  +------------------------------------+  |
|  | Hamlet 2024                        |  |
|  +------------------------------------+  |
|                                          |
|  Featured Image                          |
|  +------------------------------------+  |
|  |  [📷 Upload New]  [🖼️ Choose from   |  |
|  |                    Gallery]        |  |
|  +------------------------------------+  |
|                                          |
|          [Cancel]  [Add More Details]    |
|                    [Create Project]      |
+------------------------------------------+
```

### Project Form Modal - Full Details (Expanded)

```
+------------------------------------------+
| Edit Project                         [X] |
+------------------------------------------+
|                                          |
|  Project Title *                         |
|  +------------------------------------+  |
|  | Hamlet 2024                        |  |
|  +------------------------------------+  |
|                                          |
|  Year                                    |
|  +------------------------------------+  |
|  | 2024                               |  |
|  +------------------------------------+  |
|                                          |
|  Venue                                   |
|  +------------------------------------+  |
|  | Oregon Shakespeare Festival        |  |
|  +------------------------------------+  |
|                                          |
|  Role                                    |
|  +------------------------------------+  |
|  | Lead Costume Designer              |  |
|  +------------------------------------+  |
|                                          |
|  Description                             |
|  +------------------------------------+  |
|  | Classical production with...       |  |
|  |                                    |  |
|  +------------------------------------+  |
|                                          |
|  Featured Image                          |
|  +------------------------------------+  |
|  |  [Current Image]    [📷 Upload]    |  |
|  |                     [🖼️ Gallery]   |  |
|  |                     [Remove]       |  |
|  +------------------------------------+  |
|                                          |
|  Gallery Images (3)                      |
|  +------------------------------------+  |
|  | [thumb] [thumb] [thumb] [+ Add]    |  |
|  | Drag to reorder                    |  |
|  +------------------------------------+  |
|                                          |
|           [Cancel]  [Save Changes]       |
+------------------------------------------+
```

### FeaturedImagePicker Component

**Empty State:**
```
Featured Image
┌────────────────────────────────────┐
│         📷                         │
│  Tap to add featured image         │
│         or                         │
│  [Choose from Gallery] ────────────┼──→ Opens ImagePicker modal
└────────────────────────────────────┘
     ↑
  Opens file picker
```

**With Image Set:**
```
Featured Image
┌────────────────────────────────────┐
│  [Image Thumbnail]                 │
│  [Remove] ─────────────────────────┼──→ Clears featured image
└────────────────────────────────────┘

[📷 Replace Image]  [🖼️ Choose from Gallery]
```

### GalleryImageGrid Component

```
Gallery Images (5)
┌────────────────────────────────────┐
│ [thumb] [thumb] [thumb] [thumb]    │
│   ✕       ✕       ✕       ✕        │ ← Remove buttons on hover
│                                    │
│ [thumb] [+ Add Image]              │
│   ✕                                │
│                                    │
│ Drag thumbnails to reorder         │
└────────────────────────────────────┘
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
4. Click "+ Create First Project" - Quick-add modal opens
5. Enter "Hamlet 2024" for title
6. Click "📷 Upload New" - File picker opens
7. Select image - Upload completes, preview shows
8. Click "Create Project" - Modal closes, project appears in list
9. Project card shows: featured image, title, "Oregon Shakespeare Festival"
10. Click "Edit" - Full modal opens with all fields populated
11. Click "Add More Details" - Form expands showing year, venue, role, description
12. Click "🖼️ Choose from Gallery" for featured image - ImagePicker opens
13. Select different image from gallery - Becomes new featured image
14. Gallery section: Click "+ Add Image" - ImagePicker opens
15. Select multiple images - They appear as draggable thumbnails
16. Drag thumbnail to reorder - Order updates
17. Click "Save Changes" - Modal closes
18. Drag project card to reorder projects - Order persists
19. Click "..." menu -> "Delete" - Confirmation appears with warning
20. **Success**: Full project management within category context

## Success Criteria

### Functional Requirements
- [ ] Project list displays all projects for the category
- [ ] Each project shows: featured image, title, venue
- [ ] Breadcrumb navigation shows: Categories > [Category Name] > Projects
- [ ] "New Project" button opens quick-add modal
- [ ] Quick-add requires title and featured image
- [ ] "Add More Details" expands modal to full form
- [ ] Full form includes: title, year, venue, role, description
- [ ] Featured image supports BOTH upload new and choose from gallery
- [ ] Gallery section allows adding multiple images
- [ ] Gallery images can be reordered via drag-drop
- [ ] Gallery images can be removed individually
- [ ] Edit mode loads existing project data
- [ ] Delete shows confirmation with impact warning
- [ ] Delete removes project and updates category project count
- [ ] Projects can be reordered within category
- [ ] Order persists after page refresh
- [ ] Navigation back to category list works

### Design Requirements
- [ ] Project cards use consistent card styling from design system
- [ ] Cards display in responsive grid (3 columns desktop, 2 tablet, 1 mobile)
- [ ] Featured image shows as card header (aspect ratio 16:9 or 4:3)
- [ ] Venue uses secondary text color
- [ ] Action buttons have proper hover/focus states
- [ ] Modal follows design system modal patterns
- [ ] Form fields match design system input styles
- [ ] Quick-add modal is compact (fits mobile viewport)
- [ ] Full form modal is scrollable on mobile
- [ ] Empty state is centered with helpful messaging
- [ ] Loading state shows skeleton cards
- [ ] Breadcrumb uses design system navigation styles

### Accessibility Requirements
- [ ] Project cards are keyboard navigable
- [ ] Edit/delete actions accessible via keyboard
- [ ] Modal traps focus while open
- [ ] Breadcrumb navigation is keyboard accessible
- [ ] Delete confirmation is keyboard accessible
- [ ] Form labels properly associated with inputs
- [ ] Error messages announced to screen readers
- [ ] Drag-and-drop has keyboard alternative (up/down buttons)
- [ ] Featured image picker is keyboard accessible
- [ ] Gallery grid is keyboard navigable

### Mobile Requirements
- [ ] Single column layout on mobile
- [ ] Touch-friendly action buttons (44px min)
- [ ] Modal is full-screen on mobile
- [ ] Gallery grid is 2 columns on mobile
- [ ] Touch-friendly drag-drop with 150ms delay (prevents accidental drags)
- [ ] Upload button opens camera on iOS/Android
- [ ] Featured image picker works one-handed
- [ ] Form inputs use 16px font (prevents iOS zoom)

## Pattern Reference

### Drag-Drop Reordering Pattern

```typescript
// From existing CategoryList pattern
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// In component
const { attributes, listeners, setNodeRef, transform, transition } = 
  useSortable({ id: project.id })

const style = {
  transform: CSS.Transform.toString(transform),
  transition,
}

// Usage
<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
  <ProjectCard project={project} />
</div>
```

### Image Picker Integration Pattern

```typescript
// The ImagePicker component is available
import { ImagePicker } from '@/components/admin/ImagePicker'

// State
const [showImagePicker, setShowImagePicker] = useState(false)

// Handler
const handleImageSelect = (image: SiteImage) => {
  setFormData({ ...formData, featuredImageId: image.id })
  setShowImagePicker(false)
}

// Usage
<ImagePicker
  isOpen={showImagePicker}
  onClose={() => setShowImagePicker(false)}
  onSelect={handleImageSelect}
  currentImageId={formData.featuredImageId}
  portfolioId={portfolioId}
/>
```

### Form Validation Pattern

```typescript
// Existing pattern from CategoryForm
const [errors, setErrors] = useState<Record<string, string>>({})

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {}
  
  if (!formData.title.trim()) {
    newErrors.title = 'Project title is required'
  }
  
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

// Usage in input
<Input
  value={formData.title}
  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
  className={errors.title ? 'border-error' : ''}
/>
{errors.title && (
  <p className="text-error text-sm mt-1">{errors.title}</p>
)}
```

## Integration Points

These elements are designed to be extended:
- **ProjectList** - Pattern reusable for other list views
- **ProjectCard** - Foundation for public project cards
- **FeaturedImagePicker** - Reusable for category featured images
- **GalleryImageGrid** - Reusable for any multi-image management
- **Quick-add pattern** - Reusable for rapid content creation flows

## Component Props

```typescript
interface ProjectListProps {
  categoryId: string
  projects: Project[]
  onCreateClick: () => void
  onEditClick: (project: Project) => void
  onDeleteClick: (project: Project) => void
  onReorder: (orderedIds: string[]) => void
}

interface ProjectCardProps {
  project: Project
  onEdit: () => void
  onDelete: () => void
  onViewDetails?: () => void
}

interface ProjectFormProps {
  project?: Project  // undefined for create mode
  categoryId: string
  portfolioId: string
  onSubmit: (data: ProjectFormData) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  mode: 'quick-add' | 'full'  // Toggle between minimal and full form
}

interface ProjectFormData {
  title: string
  year?: number
  venue?: string
  role?: string
  description?: string
  featuredImageId?: string
  isFeatured?: boolean  // For homepage featured work
}

interface FeaturedImagePickerProps {
  currentImageId?: string | null
  availableGalleryImages?: Asset[]
  onImageSelect: (imageId: string | null) => void
  onImageUpload: (file: File) => Promise<Asset>
  portfolioId: string
  projectId?: string
  label?: string
  required?: boolean
}

interface GalleryImageGridProps {
  images: Asset[]
  onAdd: () => void  // Opens ImagePicker
  onRemove: (imageId: string) => void
  onReorder: (orderedIds: string[]) => void
  maxImages?: number
}
```

## API Integration

Uses existing endpoints:
- `GET /api/projects?categoryId={id}` - Load projects for category
- `POST /api/projects` - Create project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project
- `PUT /api/projects/reorder` - Reorder projects within category
- `POST /api/projects/[id]/images` - Add image to project gallery
- `DELETE /api/projects/[id]/images/[assetId]` - Remove from gallery
- `PUT /api/projects/[id]/images/reorder` - Reorder gallery images
- `POST /api/upload` - Upload new image

## Component Behavior Details

### Quick-Add Flow

**Purpose:** Create project in <30 seconds from mobile

**Steps:**
1. User clicks "+ New Project"
2. Modal shows: Title field + FeaturedImagePicker
3. User enters title
4. User uploads image OR picks from gallery
5. "Create Project" button creates minimal project
6. "Add More Details" expands form to show year, venue, role, description

**Exit points:**
- "Create Project" → Saves minimal project, closes modal
- "Add More Details" → Expands modal in place
- "Cancel" → Closes without saving

### Featured Image Picker Behavior

**Empty state:**
- Shows upload dropzone
- Shows "Choose from Gallery" button
- If no gallery images exist, gallery button is disabled with tooltip

**With image:**
- Shows current image thumbnail
- Shows "Remove" button (clears featured image)
- Shows "📷 Replace Image" button (opens file picker)
- Shows "🖼️ Choose from Gallery" button (opens ImagePicker modal)

**Upload flow:**
1. User clicks upload dropzone or "Replace Image"
2. File picker opens
3. User selects file
4. Optimistic preview shown immediately
5. Upload to `/api/upload` with progress indicator
6. On success: Image becomes featured image
7. On failure: Error message shown, reverts to previous state

**Gallery pick flow:**
1. User clicks "Choose from Gallery"
2. ImagePicker modal opens, filtered to project's gallery images
3. User selects image
4. Modal closes
5. Selected image becomes featured image

### Gallery Image Management

**Add images:**
1. User clicks "+ Add Image" in gallery grid
2. ImagePicker modal opens (shows all site images)
3. User can select multiple images (checkbox selection)
4. Click "Add Selected" → Images added to project gallery
5. New thumbnails appear in gallery grid

**Reorder:**
1. User drags thumbnail to new position
2. Visual feedback shows drop position
3. On drop: Order updates immediately
4. Auto-save updates order in database

**Remove:**
1. User clicks ✕ on thumbnail (visible on hover)
2. Confirmation: "Remove from gallery?" (not delete from site)
3. Confirm → Thumbnail removed from grid
4. Auto-save updates gallery

## Validation Rules

```typescript
// Required field validation
const validateQuickAdd = (data: ProjectFormData): Record<string, string> => {
  const errors: Record<string, string> = {}
  
  if (!data.title?.trim()) {
    errors.title = 'Project title is required'
  }
  
  if (!data.featuredImageId) {
    errors.featuredImage = 'Featured image is required for project cards'
  }
  
  return errors
}

// Full form validation (additional fields)
const validateFullForm = (data: ProjectFormData): Record<string, string> => {
  const errors = validateQuickAdd(data)
  
  if (data.year && (data.year < 1900 || data.year > 2100)) {
    errors.year = 'Year must be between 1900 and 2100'
  }
  
  return errors
}
```

## Mobile Optimizations

### Touch Interactions
- **Drag delay:** 150ms before drag activates (prevents accidental drags)
- **Touch targets:** 44px minimum for all interactive elements
- **Swipe:** Optional swipe-to-delete on project cards (not required)

### Form Layout
- **Quick-add modal:** Compact, single screen (no scrolling needed)
- **Full modal:** Scrollable, sections grouped logically
- **Inputs:** 16px font size (prevents iOS zoom-in)
- **Buttons:** Full-width on mobile, inline on desktop

### Image Upload
- **Camera access:** Opens camera on iOS/Android
- **File input:** `accept="image/jpeg,image/png,image/webp,image/heic"`
- **Capture attribute:** `capture="environment"` on mobile devices

### Gallery Grid
- **Desktop:** 4 columns
- **Tablet:** 3 columns
- **Mobile:** 2 columns
- **Thumbnail size:** 80x80px with 8px gap

## Error Handling

### Upload Errors
- **File too large:** "Image must be under 10MB"
- **Invalid format:** "Please upload JPG, PNG, or WebP"
- **Network failure:** "Upload failed. Please try again."
- **Show error:** Below upload button, red text, with retry option

### Validation Errors
- **Empty title:** "Project title is required"
- **Invalid year:** "Year must be between 1900 and 2100"
- **No featured image:** "Featured image is required for project cards"
- **Show inline:** Below each field, red text

### Delete Errors
- **API failure:** "Failed to delete project. Please try again."
- **Show in modal:** Replace confirmation with error message

## Success Criteria

### Functional Requirements
- [ ] Navigate from category list to project list
- [ ] Breadcrumb shows: Categories > [Category Name] > Projects
- [ ] Empty state displays when category has no projects
- [ ] Click "+ New Project" opens quick-add modal
- [ ] Quick-add creates project with title + featured image only
- [ ] "Add More Details" expands to full form in same modal
- [ ] Full form includes all metadata fields
- [ ] Featured image picker supports upload new
- [ ] Featured image picker supports choose from gallery
- [ ] Gallery button disabled if project has no gallery images
- [ ] Upload shows progress indicator
- [ ] Upload handles errors gracefully
- [ ] ImagePicker modal opens for gallery selection
- [ ] Gallery image grid displays all project gallery images
- [ ] Click "+ Add Image" opens ImagePicker for gallery
- [ ] Gallery images can be reordered via drag-drop
- [ ] Gallery images can be removed with ✕ button
- [ ] Delete confirmation shows project title
- [ ] Delete updates category project count
- [ ] Projects can be reordered within category
- [ ] Auto-save triggers after changes
- [ ] Manual save button available
- [ ] Create/edit/delete updates category card count immediately

### Design Requirements
- [ ] Project cards: 3/2/1 columns responsive
- [ ] Featured image: 16:9 aspect ratio on cards
- [ ] Quick-add modal: max-width 480px
- [ ] Full modal: max-width 640px
- [ ] Gallery grid: 4/3/2 columns responsive
- [ ] Gallery thumbnails: 80x80px square
- [ ] Upload button: Primary accent color
- [ ] Gallery button: Secondary/neutral color
- [ ] Remove button: Subtle, red on hover
- [ ] All spacing uses 8px grid system
- [ ] Typography follows design system scales
- [ ] Loading states use skeleton components
- [ ] Empty state uses muted text colors

### Accessibility Requirements
- [ ] Breadcrumb has proper ARIA labels
- [ ] Project cards keyboard navigable
- [ ] Modal focus trap active when open
- [ ] Form labels associated with inputs
- [ ] Required fields marked with asterisk
- [ ] Error messages have role="alert"
- [ ] Upload button has aria-label
- [ ] Gallery button shows count (aria-label: "Choose from 5 gallery images")
- [ ] Drag-drop has keyboard alternative
- [ ] Image picker modal is accessible (already implemented)
- [ ] All interactive elements have visible focus indicators
- [ ] Color contrast meets WCAG AA

### Mobile Requirements
- [ ] Works on iOS Safari and Android Chrome
- [ ] Touch targets ≥ 44px
- [ ] Upload opens camera on mobile devices
- [ ] Gallery grid is 2 columns on mobile
- [ ] Drag gesture has 150ms delay
- [ ] Modal is full-screen on mobile (<768px)
- [ ] Form inputs don't trigger zoom (16px font)
- [ ] Buttons are full-width on mobile
- [ ] Breadcrumb wraps gracefully on small screens

### Performance Requirements
- [ ] Project list loads in <500ms
- [ ] Image upload shows optimistic preview
- [ ] Drag-drop updates order immediately
- [ ] Gallery thumbnails lazy load
- [ ] Auto-save debounced to 30 seconds

## Effort Estimate

**Total: 12-16 hours**
- ProjectList page with breadcrumb: 2 hours
- ProjectCard component: 1-2 hours
- ProjectForm quick-add + full modal: 3-4 hours
- FeaturedImagePicker component: 2-3 hours
- GalleryImageGrid component: 2-3 hours
- useProjects hook: 1-2 hours
- Delete confirmation: 1 hour
- Testing and polish: 2-3 hours
