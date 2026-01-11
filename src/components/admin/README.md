# Admin Components

Components for the admin dashboard interface.

## Important: Theme Separation

**The admin interface has its own consistent styling independent of portfolio themes.**

- Admin uses neutral grays and the application's base design tokens
- Portfolio themes (`modern-minimal`, `classic-elegant`, `bold-editorial`) apply ONLY to:
  - Public portfolio pages (`/[slug]/*`)
  - Preview mode (`/preview/[slug]/*`)
- Never apply `data-theme` attributes to admin components
- Theme selection in admin shows a preview but doesn't change admin styling

## Layout

### AdminLayout
The main admin shell with sidebar navigation and header.

**Provides:** Navigation context, portfolio data, responsive sidebar  
**Used by:** All `/admin/*` pages via layout.tsx  
**Pattern:** Uses `useNavigationData` hook for sidebar data

### AdminHeader
Top header bar with breadcrumbs and actions.

**Expects:** `title`, optional `actions` slot

### AdminSidebar
Collapsible navigation sidebar with category/project tree.

**Pattern:** Categories expand to show nested projects

## Forms

### CategoryForm
Create/edit category form.

**Props:** `category?` (edit mode), `onSubmit`, `onCancel`  
**Validation:** Name required, description max 500 chars  
**Pattern:** Uses `ImagePicker` for featured image selection

### ProjectForm
Create/edit project form.

**Props:** `project?` (edit mode), `categoryId`, `onSubmit`, `onCancel`  
**Validation:** Title required, various max lengths  
**Pattern:** Uses `ImagePicker` for featured image

### SettingsForm
Portfolio settings (name, bio, profile photo).

**Used by:** `/admin/settings` page

## Lists

### CategoryList / CategoryListItem
Displays categories with drag-to-reorder.

**Uses:** `@dnd-kit` for drag and drop  
**Pattern:** Optimistic reorder, calls `useCategories.reorder()`

### ProjectList / ProjectCard
Displays projects within a category.

**Uses:** `@dnd-kit` for drag and drop  
**Shows:** Featured image, title, draft/publish status

## Publishing

### PublishButton
Publish action with confirmation and status feedback.

**States:** Ready, publishing, published, error  
**Pattern:** Calls publish API, shows toast on success/error  
**Note:** Only enabled when draft differs from published

### DraftIndicator
Shows current draft/publish status.

**States:** 
- `draft` - Has unpublished changes
- `published` - In sync with published version
- `saving` - Auto-save in progress
- `saved` - Recently saved
- `error` - Save failed

## Image Management

### ImagePicker
Modal for selecting existing images or uploading new ones.

**Uses:** `useImagePicker` hook  
**Pattern:** Opens as modal, returns selected asset ID

### GalleryManager
Manage project gallery images with drag-to-reorder.

**Uses:** `@dnd-kit`, `useImageUpload`  
**Pattern:** Inline upload, reorder, delete
