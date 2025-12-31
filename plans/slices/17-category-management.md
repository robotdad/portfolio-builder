# Category Management UI

**Goal:** User can create, edit, and organize categories for their portfolio projects.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/DESIGN-SYSTEM.md
@plans/design/ADMIN-LAYOUT.md
@plans/design/CONTENT-MODEL.md

## Scope

**Included**:
- Category list view in admin area
- Create new category form/modal
- Edit category (name, description, featured image)
- Delete category with confirmation dialog
- Category reordering (drag-and-drop or up/down buttons)
- Featured image selection using Image Picker (Slice 16)
- Project count display per category
- Empty state for no categories
- Navigation to category's projects

**NOT Included**:
- Project management UI (separate future slice)
- Public category pages (separate future slice)
- Category nesting/sub-categories
- Bulk category operations
- Category archiving
- SEO settings per category

## Tech Stack
- React components for category UI
- Existing API routes from Slice 15
- Image Picker component from Slice 16
- Confirmation dialog (existing or new)
- Drag-and-drop library (optional: @dnd-kit or native)

## Key Files
```
src/app/admin/categories/page.tsx              # Category list page
src/components/admin/CategoryList.tsx          # List component
src/components/admin/CategoryCard.tsx          # Individual category display
src/components/admin/CategoryForm.tsx          # Create/edit form
src/components/admin/CategoryFormModal.tsx     # Modal wrapper for form
src/hooks/useCategories.ts                     # Category data fetching/mutations
```

## UI Design

### Category List View

```
+------------------------------------------------------------------+
| Categories                                    [+ New Category]    |
+------------------------------------------------------------------+
|                                                                   |
|  +------------------+  +------------------+  +------------------+ |
|  |    [image]       |  |    [image]       |  |    [image]       | |
|  |                  |  |                  |  |                  | |
|  |  Theatre         |  |  Film            |  |  Opera           | |
|  |  12 projects     |  |  8 projects      |  |  5 projects      | |
|  |  [Edit] [...]    |  |  [Edit] [...]    |  |  [Edit] [...]    | |
|  +------------------+  +------------------+  +------------------+ |
|                                                                   |
|  +------------------+                                             |
|  |  [+ placeholder] |                                             |
|  |                  |                                             |
|  |  Add Category    |                                             |
|  |                  |                                             |
|  +------------------+                                             |
|                                                                   |
+------------------------------------------------------------------+
```

### Category Form (Modal)

```
+------------------------------------------+
| Create Category                      [X] |
+------------------------------------------+
|                                          |
|  Name *                                  |
|  +------------------------------------+  |
|  | Theatre Work                       |  |
|  +------------------------------------+  |
|                                          |
|  Description                             |
|  +------------------------------------+  |
|  | Classical and contemporary         |  |
|  | productions...                     |  |
|  +------------------------------------+  |
|                                          |
|  Featured Image                          |
|  +------------------------------------+  |
|  |  [image preview]    [Choose Image] |  |
|  |                     [Remove]       |  |
|  +------------------------------------+  |
|                                          |
|           [Cancel]  [Create Category]    |
+------------------------------------------+
```

### Empty State

```
+------------------------------------------------------------------+
|                                                                   |
|                         [folder icon]                             |
|                                                                   |
|                    No categories yet                              |
|                                                                   |
|         Create categories to organize your projects               |
|                                                                   |
|                   [+ Create First Category]                       |
|                                                                   |
+------------------------------------------------------------------+
```

## Demo Script (30 seconds)
1. Open `/admin/categories` - See empty state with prompt
2. Click "Create First Category" - Modal opens
3. Enter "Theatre Work" for name
4. Click "Choose Image" - Image Picker opens (Slice 16)
5. Select an image - Picker closes, preview shows
6. Click "Create Category" - Modal closes, category appears in list
7. Category card shows: image, name, "0 projects"
8. Click "Edit" on category - Edit modal opens with current values
9. Change name to "Theatre" - Click "Save Changes"
10. Drag category to reorder (or use up/down buttons)
11. Click "..." menu -> "Delete" -> Confirmation appears
12. Confirm delete -> Category removed from list
13. **Success**: Full CRUD for categories with image selection

## Success Criteria

### Functional Requirements
- [ ] Category list displays all categories in order
- [ ] Each category shows: featured image, name, project count
- [ ] "New Category" button opens create modal
- [ ] Create form validates required name field
- [ ] Create form allows optional description
- [ ] Create form integrates Image Picker for featured image
- [ ] Edit mode loads existing category data
- [ ] Edit saves changes to category
- [ ] Delete shows confirmation dialog
- [ ] Delete removes category (confirms cascade behavior)
- [ ] Categories can be reordered
- [ ] Order persists after page refresh

### Design Requirements
- [ ] Category cards use consistent card styling from design system
- [ ] Cards display in responsive grid (3 columns desktop, 2 tablet, 1 mobile)
- [ ] Featured image shows as card header (aspect ratio 16:9 or 4:3)
- [ ] Project count uses secondary text color
- [ ] Action buttons have proper hover/focus states
- [ ] Modal follows design system modal patterns
- [ ] Form fields match design system input styles
- [ ] Empty state is centered with helpful messaging
- [ ] Loading state shows skeleton cards

### Accessibility Requirements
- [ ] Category cards are keyboard navigable
- [ ] Edit/delete actions accessible via keyboard
- [ ] Modal traps focus while open
- [ ] Delete confirmation is keyboard accessible
- [ ] Form labels properly associated with inputs
- [ ] Error messages announced to screen readers
- [ ] Drag-and-drop has keyboard alternative (up/down buttons)

### Mobile Requirements
- [ ] Single column layout on mobile
- [ ] Touch-friendly action buttons (44px min)
- [ ] Modal is full-screen on mobile
- [ ] Swipe actions optional (tap to open menu)

## Integration Points

These elements are designed to be extended:
- **Category list** - Foundation for admin sidebar navigation (Phase 3)
- **Category cards** - Pattern reusable for Project list
- **CategoryForm** - Pattern reusable for Project form
- **Image Picker integration** - Pattern for any featured image selection
- **Reorder functionality** - Pattern reusable for Project reordering

## Component Props

```typescript
interface CategoryListProps {
  categories: Category[];
  onCreateClick: () => void;
  onEditClick: (category: Category) => void;
  onDeleteClick: (category: Category) => void;
  onReorder: (orderedIds: string[]) => void;
}

interface CategoryCardProps {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
  onViewProjects: () => void;
}

interface CategoryFormProps {
  category?: Category;  // undefined for create mode
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

interface CategoryFormData {
  name: string;
  description?: string;
  featuredImageId?: string;
}
```

## API Integration

Uses endpoints from Slice 15:
- `GET /api/categories` - Load category list
- `POST /api/categories` - Create category
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category
- `PUT /api/categories/reorder` - Reorder categories

## Effort Estimate

**Total: 8-12 hours**
- Category list page: 2 hours
- CategoryCard component: 1-2 hours
- CategoryForm/Modal: 2-3 hours
- Image Picker integration: 1 hour
- Reorder functionality: 1-2 hours
- Delete confirmation: 1 hour
- Testing and polish: 1-2 hours
