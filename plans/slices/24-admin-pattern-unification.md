# Admin Pattern Unification

**Goal:** Establish consistent interaction patterns across all admin interfaces to create a coherent management experience.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/ADMIN-LAYOUT.md
@plans/design/DESIGN-SYSTEM.md

## Scope

**Included**:
- Convert CategoryCard to CategoryListItem (list pattern for hierarchical management)
- Make category rows fully clickable for direct navigation
- Update ProjectCard to be fully clickable (entire card navigates to editor)
- Remove redundant Edit buttons and hidden dropdown menus
- Add visual navigation indicators (chevrons, hover states)
- Improve homepage indication (badge with "Home" text, not just icon)
- Add helper text for homepage routing behavior
- Establish consistent action button patterns (Edit, Delete, More)
- Update drag-and-drop to work with list items
- Ensure mobile touch-friendly interactions

**NOT Included**:
- Dashboard content or analytics
- Advanced filtering or search
- Bulk operations (multi-select)
- Undo/redo functionality
- Keyboard shortcuts
- Custom view modes (grid/list toggle)

## Tech Stack
- React components with TypeScript
- Existing @dnd-kit for drag-and-drop
- CSS Grid and Flexbox for layouts
- Existing design system tokens
- Next.js Link for navigation

## Key Files
```
src/components/admin/CategoryListItem.tsx      # New: list item replacing card
src/components/admin/CategoryList.tsx          # Update: render list items not cards
src/components/admin/ProjectCard.tsx           # Update: make fully clickable
src/components/admin/PageList.tsx              # Update: improve home indication
src/components/admin/HomeBadge.tsx             # New: home page indicator
src/app/admin/categories/page.tsx              # Update: use new patterns
src/app/admin/categories/[id]/projects/page.tsx # Update: use new patterns
```

## UI Design

### Category List (Before → After)

**Before (Card Grid):**
```
┌──────────────────┐  ┌──────────────────┐
│  [16:9 Image]    │  │  [16:9 Image]    │
│                  │  │                  │
│  Theatre         │  │  Film            │
│  3 projects      │  │  5 projects      │
│  [Edit]  [...]   │  │  [Edit]  [...]   │
└──────────────────┘  └──────────────────┘

Click card → Nothing
Click [...] → Menu → Click "View Projects" → Navigate
```

**After (List Pattern):**
```
┌─────────────────────────────────────────────────────────┐
│ ⋮⋮ [64px] Theatre          3 projects  [Edit] [Delete] →│
├─────────────────────────────────────────────────────────┤
│ ⋮⋮ [64px] Film             5 projects  [Edit] [Delete] →│
├─────────────────────────────────────────────────────────┤
│ ⋮⋮ [64px] Opera            2 projects  [Edit] [Delete] →│
└─────────────────────────────────────────────────────────┘

Click anywhere on row → Navigate to projects
Actions always visible, no hidden menus
```

### CategoryListItem Component

```
Desktop Layout:
┌──────────────────────────────────────────────────────────┐
│ [Drag] [Thumb] Category Name    Count    [Edit] [×]  [→] │
│  ⋮⋮    64x64   Typography      "3 proj"  Button  Btn Chev│
└──────────────────────────────────────────────────────────┘

Mobile Layout:
┌─────────────────────────┐
│ ⋮⋮ [48px] Category  → │
│   Name                  │
│   3 projects            │
│   [Edit]    [Delete]    │
└─────────────────────────┘
```

### ProjectCard (Before → After)

**Before:**
```
┌──────────────────┐
│  [Image]         │
│                  │
│  Hamlet 2024     │
│  Royal Theatre   │
│  [Edit]          │
└──────────────────┘

Click Edit → Navigate
```

**After:**
```
┌──────────────────┐
│  [Image]    [×]  │ ← Delete in corner
│                  │
│  Hamlet 2024     │
│  Royal Theatre   │
└──────────────────┘

Click anywhere → Navigate to editor
No redundant Edit button
```

### Homepage Indication (Before → After)

**Before:**
```
[Home] [About] [Contact]
  ↑
  14px house icon (easy to miss)
```

**After:**
```
[Home ★] [About] [Contact]
   ↑
   Badge with text + star
   Accent background color
```

## Component Interfaces

```typescript
// CategoryListItem.tsx
interface CategoryListItemProps {
  category: Category & {
    _count: {
      projects: number
    }
  }
  onNavigate: (categoryId: string) => void
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  isActive?: boolean
  isDragging?: boolean
}

// HomeBadge.tsx
interface HomeBadgeProps {
  variant?: 'compact' | 'full'  // compact = ★, full = "Home" text
  className?: string
}

// ProjectCard.tsx (updated)
interface ProjectCardProps {
  project: Project & {
    featuredImage?: Asset | null
    category?: Category
  }
  onDelete: (projectId: string) => void
  // No onEdit - entire card is Link now
}
```

## Interaction Patterns

### Direct Navigation Pattern

**Rule:** If an item has children or is editable, clicking it should perform the primary action.

**For Categories (have children):**
```typescript
// Primary action: Navigate to projects
<div 
  className="category-list-item"
  onClick={() => onNavigate(category.id)}
  role="button"
  tabIndex={0}
>
  {/* Content */}
  
  {/* Secondary actions prevent propagation */}
  <button 
    onClick={(e) => {
      e.stopPropagation()
      onEdit(category)
    }}
  >
    Edit
  </button>
</div>
```

**For Projects (leaf nodes, editable):**
```typescript
// Primary action: Edit project
<Link 
  href={`/admin/projects/${project.id}`}
  className="project-card"
>
  {/* Content */}
  
  {/* Destructive action prevents navigation */}
  <button
    onClick={(e) => {
      e.preventDefault()
      onDelete(project.id)
    }}
  >
    ×
  </button>
</Link>
```

### Visual Affordance Pattern

**Entire clickable items must indicate clickability:**

```css
.category-list-item {
  cursor: pointer;
  transition: background-color 150ms ease, box-shadow 150ms ease;
}

.category-list-item:hover {
  background: var(--color-neutral-50);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.category-list-item:focus-within {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

## CategoryListItem Implementation

### Desktop Layout

```typescript
<div
  className="category-list-item"
  onClick={handleNavigate}
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}  // Enter/Space to navigate
>
  {/* Drag handle */}
  <div className="drag-handle" {...listeners} {...attributes}>
    <svg width="16" height="16">
      <path d="M8 4h.01M8 8h.01M8 12h.01" />
    </svg>
  </div>
  
  {/* Thumbnail */}
  <div className="thumbnail">
    {category.featuredImage ? (
      <img src={category.featuredImage.thumbnailUrl} alt="" />
    ) : (
      <div className="thumbnail-placeholder">
        <FolderIcon />
      </div>
    )}
  </div>
  
  {/* Info */}
  <div className="info">
    <h3 className="name">{category.name}</h3>
    <span className="count">{category._count.projects} projects</span>
  </div>
  
  {/* Actions */}
  <button
    className="action-btn"
    onClick={handleEdit}
    aria-label={`Edit ${category.name}`}
  >
    <EditIcon />
    <span className="btn-text">Edit</span>
  </button>
  
  <button
    className="action-btn action-btn-danger"
    onClick={handleDelete}
    aria-label={`Delete ${category.name}`}
  >
    <TrashIcon />
    <span className="btn-text">Delete</span>
  </button>
  
  {/* Navigation indicator */}
  <ChevronRightIcon className="nav-indicator" aria-hidden="true" />
</div>
```

### Mobile Layout

```css
@media (max-width: 767px) {
  .category-list-item {
    grid-template-columns: auto 48px 1fr auto;
    grid-template-rows: auto auto;
    gap: 8px;
  }
  
  .thumbnail {
    width: 48px;
    height: 48px;
  }
  
  .info {
    grid-column: 3;
  }
  
  .nav-indicator {
    grid-column: 4;
    grid-row: 1;
  }
  
  .action-btn {
    grid-column: 3 / -1;
    grid-row: 2;
  }
  
  .btn-text {
    display: inline; /* Show text on mobile */
  }
}
```

## HomePage Badge Implementation

### HomeBadge Component

```typescript
export function HomeBadge({ variant = 'full', className }: HomeBadgeProps) {
  return (
    <span className={`home-badge home-badge--${variant} ${className || ''}`}>
      {variant === 'compact' ? '★' : 'Home'}
    </span>
  )
}
```

### CSS Styling

```css
.home-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: var(--color-accent);
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
  text-transform: uppercase;
  gap: 4px;
}

.home-badge--compact {
  padding: 2px 6px;
  font-size: 14px;
}
```

### Usage in PageList

```typescript
// Replace the small icon
{page.isHomepage && (
  <HomeBadge variant="compact" />
)}

// Or full version
{page.isHomepage && (
  <HomeBadge variant="full" />
)}
```

## Drag-and-Drop with List Items

### Pattern Update

```typescript
// From CategoryList component
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // 8px movement before drag starts
      delay: 150,  // 150ms delay (prevents accidental drags)
    },
  }),
  useSensor(KeyboardSensor)
)

// In CategoryListItem
const {
  attributes,
  listeners,
  setNodeRef,
  transform,
  transition,
  isDragging,
} = useSortable({ id: category.id })

const style = {
  transform: CSS.Transform.toString(transform),
  transition,
  opacity: isDragging ? 0.5 : 1,
}

<div ref={setNodeRef} style={style} className="category-list-item">
  <div className="drag-handle" {...listeners} {...attributes}>
    ⋮⋮
  </div>
  {/* Rest of item */}
</div>
```

## Helper Text for Homepage Routing

### Add to Page Settings Modal

```tsx
{page.isHomepage && (
  <div className="info-message">
    <InfoIcon />
    <p>
      This is your homepage. It publishes to{' '}
      <code>yoursite.com/{portfolio.slug}</code>
    </p>
  </div>
)}

{!page.isHomepage && page.slug && (
  <div className="info-message">
    <InfoIcon />
    <p>
      This page publishes to{' '}
      <code>yoursite.com/{portfolio.slug}/{page.slug}</code>
    </p>
  </div>
)}
```

## Demo Script (30 seconds)
1. Open `/admin/categories` - See category list (not cards)
2. Categories displayed as compact rows with thumbnails
3. Hover over "Theatre" row - Entire row highlights
4. Click anywhere on Theatre row - Navigate to projects
5. No menu needed, no extra clicks
6. Breadcrumb shows: "Categories > Theatre > Projects"
7. See project cards in grid
8. Click project card anywhere - Navigate to editor
9. No redundant Edit button on cards
10. Navigate to `/admin` - See page tabs
11. Homepage tab shows "Home" badge with accent background
12. Hover over page settings - See helper text about routing
13. Resize to mobile - All patterns work on touch
14. **Success**: Consistent, direct interactions across all admin

## Success Criteria

### Functional Requirements
- [ ] CategoryListItem component created
- [ ] CategoryList renders list items instead of cards
- [ ] Click category row → Navigate to projects list
- [ ] Drag handle on category items works for reordering
- [ ] Edit button on category row opens edit modal
- [ ] Delete button on category row opens delete confirmation
- [ ] Actions stop propagation (don't trigger navigation)
- [ ] ProjectCard wrapped in Link component
- [ ] Click project card anywhere → Navigate to editor
- [ ] Delete button on project card prevents navigation
- [ ] Edit button removed from project cards (redundant)
- [ ] HomeBadge component created
- [ ] Homepage tab shows "Home" badge with text
- [ ] Page settings show routing helper text
- [ ] Helper text explains homepage vs page routing
- [ ] All patterns work on mobile touch

### Design Requirements
- [ ] Category list items: horizontal layout on desktop
- [ ] Category thumbnails: 64x64px (not 16:9 hero)
- [ ] Category rows: full-width, hover background change
- [ ] Navigation chevron (→) visible on category rows
- [ ] Action buttons: consistent styling (Edit, Delete)
- [ ] Edit button: neutral color
- [ ] Delete button: red/danger color
- [ ] Project cards: maintain current visual style
- [ ] Project delete button: positioned in top-right corner
- [ ] HomeBadge: accent background, white text, uppercase
- [ ] HomeBadge star (★): accent color
- [ ] Helper text: muted color, small font (14px)
- [ ] Info icon: muted color, inline with text
- [ ] Hover states: subtle background change
- [ ] Active/focus states: accent outline

### Accessibility Requirements
- [ ] Category list items have role="button"
- [ ] Category list items are keyboard navigable
- [ ] Enter/Space on category row triggers navigation
- [ ] Tab key moves through action buttons
- [ ] Focus indicators visible (2px outline)
- [ ] Action buttons have aria-label with context
- [ ] Delete confirmations are keyboard accessible
- [ ] Project cards have accessible click target
- [ ] HomeBadge has aria-label="Homepage"
- [ ] Helper text uses semantic markup
- [ ] Screen readers announce interactive elements
- [ ] Color contrast meets WCAG AA

### Mobile Requirements
- [ ] Category list items: vertical layout on mobile
- [ ] Touch targets ≥ 44px
- [ ] Actions stack below content on mobile
- [ ] Drag handle works with touch (150ms delay)
- [ ] Project cards work on touch
- [ ] Delete buttons large enough for touch
- [ ] No hover states on touch devices
- [ ] Chevron indicators visible on mobile

## CategoryListItem Component Structure

```typescript
export function CategoryListItem({
  category,
  onNavigate,
  onEdit,
  onDelete,
  isActive,
  isDragging,
}: CategoryListItemProps) {
  const handleNavigate = useCallback(() => {
    onNavigate(category.id)
  }, [category.id, onNavigate])
  
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(category)
  }, [category, onEdit])
  
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(category)
  }, [category, onDelete])
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleNavigate()
    }
  }, [handleNavigate])
  
  return (
    <div
      className={`category-list-item ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View ${category.name} projects`}
    >
      {/* Implementation as shown in UI Design section */}
    </div>
  )
}
```

## ProjectCard Update

```typescript
// Wrap entire card in Link
export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault()  // Don't navigate
    if (confirm(`Delete "${project.title}"?`)) {
      onDelete(project.id)
    }
  }, [project.id, project.title, onDelete])
  
  return (
    <Link
      href={`/admin/projects/${project.id}`}
      className="project-card"
    >
      {/* Featured image */}
      <div className="project-card-image">
        {project.featuredImage && (
          <img src={project.featuredImage.url} alt="" />
        )}
        
        {/* Delete button */}
        <button
          className="delete-btn"
          onClick={handleDelete}
          aria-label={`Delete ${project.title}`}
        >
          ×
        </button>
      </div>
      
      {/* Content */}
      <div className="project-card-content">
        <h3>{project.title}</h3>
        {project.venue && <p>{project.venue}</p>}
        {project.year && <span className="year">{project.year}</span>}
      </div>
    </Link>
  )
}
```

## Helper Text Component

```typescript
function RoutingHelperText({ page, portfolioSlug }: {
  page: Page
  portfolioSlug: string
}) {
  return (
    <div className="helper-text">
      <svg className="info-icon" width="16" height="16">
        <circle cx="8" cy="8" r="7" />
        <path d="M8 11V8M8 5h.01" />
      </svg>
      
      {page.isHomepage ? (
        <p>
          This is your homepage. It publishes to{' '}
          <code className="url">yoursite.com/{portfolioSlug}</code>
        </p>
      ) : (
        <p>
          This page publishes to{' '}
          <code className="url">yoursite.com/{portfolioSlug}/{page.slug}</code>
        </p>
      )}
    </div>
  )
}
```

## CSS Patterns

### List Item Styling

```css
.category-list-item {
  display: grid;
  grid-template-columns: auto 64px 1fr auto auto auto auto;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg);
  cursor: pointer;
  transition: background-color 150ms ease, box-shadow 150ms ease;
}

.category-list-item:hover {
  background: var(--color-neutral-50);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.category-list-item.active {
  background: var(--color-primary-50);
  border-color: var(--color-primary-200);
}

.category-list-item:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Drag handle */
.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--color-text-muted);
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}

/* Thumbnail */
.thumbnail {
  width: 64px;
  height: 64px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--color-neutral-100);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Navigation indicator */
.nav-indicator {
  width: 20px;
  height: 20px;
  color: var(--color-text-muted);
}
```

### HomePage Badge Styling

```css
.home-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: var(--color-accent);
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
  text-transform: uppercase;
  line-height: 1.4;
}

.home-badge--compact {
  padding: 2px 6px;
  font-size: 14px;
}
```

### Helper Text Styling

```css
.helper-text {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: var(--color-info-bg, #eff6ff);
  border: 1px solid var(--color-info-border, #bfdbfe);
  border-radius: 6px;
  margin-top: 12px;
}

.info-icon {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--color-info, #3b82f6);
}

.helper-text p {
  margin: 0;
  font-size: 14px;
  color: var(--color-text);
  line-height: 1.5;
}

.helper-text code.url {
  padding: 2px 6px;
  background: var(--color-neutral-100);
  border-radius: 3px;
  font-family: var(--font-mono, 'Courier New', monospace);
  font-size: 13px;
}
```

## Pattern Documentation

### When to Use Each Pattern

**List Items (CategoryListItem):**
- Hierarchical data with children
- Primary action: Navigate to children
- Secondary actions: Edit, Delete
- Examples: Categories, folders, parent items

**Cards (ProjectCard):**
- Leaf nodes (no children)
- Visual preview important
- Primary action: Edit/view item
- Secondary actions: Delete only
- Examples: Projects, media assets, documents

**Tabs (PageList):**
- Small number of peer items (3-8)
- Frequent switching between items
- All items visible at once
- Examples: Pages, settings sections

## Integration Points

These elements are designed to be extended:
- **CategoryListItem** - Pattern for any hierarchical management list
- **HomeBadge** - Reusable for any special page indicators
- **Helper text pattern** - Reusable for contextual help anywhere
- **Direct navigation pattern** - Apply to any clickable management items

## Effort Estimate

**Total: 10-14 hours**
- CategoryListItem component: 3-4 hours
- CategoryList updates: 1-2 hours
- ProjectCard updates: 1-2 hours
- HomeBadge component: 1 hour
- Helper text component: 1 hour
- Integration and testing: 2-3 hours
- Mobile responsive refinement: 1-2 hours
