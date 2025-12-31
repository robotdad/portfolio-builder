# Image Picker Component

**Goal:** User can select existing site images for featured content without re-uploading.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/DESIGN-SYSTEM.md
@plans/design/components/image-picker.md

## Scope

**Included**:
- Image picker modal component
- API endpoint to list all site images with source metadata
- Grid view of available images
- Page/section filter dropdown
- Search by filename, alt text, page title
- Single image selection with visual feedback
- Double-click for quick select and confirm
- Loading, empty, and no-results states
- Mobile-responsive layout (full-screen on mobile)
- Keyboard navigation (arrow keys, Enter, Escape)

**NOT Included**:
- Uploading new images (existing upload flow handles this)
- Image editing (crop, resize, filters)
- Multi-select mode
- Drag-and-drop reordering
- Image deletion from picker
- Batch operations

## Tech Stack
- React modal component
- Next.js API route for image listing
- CSS Grid for image layout
- React Portal for modal rendering
- Focus trap for accessibility

## Key Files
```
src/components/shared/ImagePicker.tsx          # Main picker modal component
src/components/shared/ImagePickerGrid.tsx      # Grid of selectable images
src/components/shared/ImagePickerControls.tsx  # Search and filter controls
src/app/api/images/route.ts                    # GET endpoint for all site images
src/hooks/useImagePicker.ts                    # State management hook
src/hooks/useFocusTrap.ts                      # Focus trap for modal
src/lib/types/image-picker.ts                  # TypeScript interfaces
```

## Component Interface

```typescript
interface ImagePickerProps {
  /** Controls modal open/closed state */
  isOpen: boolean;
  
  /** Currently selected image ID (for pre-selection) */
  selectedId?: string;
  
  /** Called when user confirms selection */
  onSelect: (image: SiteImage) => void;
  
  /** Called when user cancels or closes */
  onCancel: () => void;
  
  /** Modal title */
  title?: string;  // default: "Choose Image"
  
  /** Optional filters */
  filter?: {
    excludePageId?: string;
    minWidth?: number;
    minHeight?: number;
  };
}

interface SiteImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  filename: string;
  source: {
    pageId: string;
    pageTitle: string;
    sectionType: 'hero' | 'gallery' | 'content' | 'profile';
  };
  meta: {
    width: number;
    height: number;
    uploadedAt: string;
    fileSize: number;
    alt?: string;
  };
}
```

## API Design

```typescript
// GET /api/images
// Query params:
//   - pageId?: string (filter by page)
//   - search?: string (search filename, alt, page title)
//   - minWidth?: number
//   - minHeight?: number

// Response:
{
  images: SiteImage[];
  totalCount: number;
  pages: Array<{ id: string; title: string; imageCount: number; }>;
}
```

## Demo Script (30 seconds)
1. Open admin editor, navigate to a project (or any featured image field)
2. Click "Choose Image" button next to featured image
3. Image picker modal opens with all site images in grid
4. See source labels below each image (e.g., "About page", "Gallery")
5. Type "hamlet" in search -> Grid filters to matching images
6. Click page filter dropdown -> Select "Theatre" page
7. Click an image -> Blue border and checkmark appear
8. Click different image -> Selection moves
9. Click "Use Selected Image" -> Modal closes, image applied
10. Re-open picker, double-click an image -> Instant select and close
11. Press Escape -> Modal closes without selection
12. **Success**: Image selection works without re-uploading

## Success Criteria

### Functional Requirements
- [ ] Modal opens centered on desktop, full-screen on mobile
- [ ] All site images displayed in responsive grid
- [ ] Source page/section shown below each image thumbnail
- [ ] Search filters by filename, alt text, and page title
- [ ] Page filter dropdown shows all pages with image counts
- [ ] Single click selects image (shows checkmark)
- [ ] Double-click selects and confirms immediately
- [ ] "Use Selected Image" button confirms selection
- [ ] Cancel button closes without selection
- [ ] Escape key closes modal
- [ ] Close (X) button closes modal

### Design Requirements
- [ ] Grid uses 140px minimum column width with auto-fill
- [ ] Selected image shows 2px accent border and checkmark overlay
- [ ] Hover shows subtle scale transform (1.02)
- [ ] Modal has 12px border radius on desktop
- [ ] Modal max-width: 900px, max-height: 85vh
- [ ] Search input has search icon and clear button
- [ ] Loading state shows centered spinner
- [ ] Empty state shows helpful message
- [ ] No-results state shows "Clear filters" button

### Accessibility Requirements
- [ ] Modal traps focus while open
- [ ] Focus moves to search input when modal opens
- [ ] Focus returns to trigger element on close
- [ ] Arrow keys navigate grid (2D navigation)
- [ ] Enter/Space selects focused image
- [ ] Screen reader announces selected state
- [ ] ARIA attributes: role="dialog", aria-modal="true"
- [ ] Images have role="option", aria-selected state

### Mobile Requirements
- [ ] Full-screen modal on viewports < 768px
- [ ] 3-column grid on mobile
- [ ] Back arrow replaces X button
- [ ] Sticky footer with confirm button
- [ ] Safe area padding for notched devices

## Integration Points

These elements are designed to be extended:
- **ImagePicker component** - Used by Category Management (Slice 17) for featured images
- **ImagePicker component** - Used by Project Management for featured images
- **Images API** - Can add pagination for large image collections
- **SiteImage type** - Standard interface for image references across app
- **useFocusTrap hook** - Reusable for other modals

## State Management

```typescript
interface ImagePickerState {
  status: 'loading' | 'empty' | 'populated' | 'no-results';
  images: SiteImage[];
  filteredImages: SiteImage[];
  selectedId: string | null;
  searchQuery: string;
  pageFilter: string | null;  // null = all pages
}
```

## Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move between search, filter, grid items |
| Arrow keys | Navigate grid (2D navigation) |
| Enter / Space | Select focused image |
| Escape | Close picker (Cancel) |

## Effort Estimate

**Total: 8-12 hours**
- ImagePicker modal structure: 2-3 hours
- Image grid component: 2 hours
- Search and filter controls: 1-2 hours
- Images API endpoint: 1-2 hours
- Focus trap and keyboard nav: 1-2 hours
- Mobile responsive layout: 1 hour
- Testing and polish: 1-2 hours
