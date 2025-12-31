# Image Gallery Component

**Goal:** User can showcase multiple costume photos in professional grid layouts.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/components/gallery-grid.md
@plans/design/components/image-card-hover-overlay.md
@plans/design/DESIGN-SYSTEM.md

## Scope

**Included**:
- Gallery section type (holds multiple images)
- Multi-image upload (file picker + drag-and-drop)
- Grid layout (2-4 columns, responsive)
- Reorder images within gallery (dnd-kit)
- Individual alt text for each image
- Gallery displays on published page
- Lightbox modal for viewing full-size images
- Drag-and-drop file upload onto gallery area

**NOT Included**:
- Carousel layout
- Masonry layout
- Bulk alt text editing
- Lightbox zoom/pan
- Lightbox thumbnail strip
- Lightbox share button

## Design Decisions

### Alt Text vs Caption (2024-12-30)
- **Alt text**: For screen readers only, provides accessibility description
- **Caption**: Visible text displayed on image cards in the gallery
- **Default behavior**: Images display with fallback alt text ("Gallery image") when user hasn't provided custom alt text
- **Rationale**: Requiring alt text before display creates friction for users uploading many images during initial site setup. Users can add meaningful alt text later. Silent filtering (hiding images without alt text) is a poor UX pattern - content should display with reasonable defaults.
- **Not pursuing at this time**: Status banners, bulk alt text editors, accessibility completion indicators

### Lightbox for Image Viewing (2024-12-30)
- **Rationale**: For a portfolio site, viewing work in detail IS the core product. A costume designer's portfolio where you can't see stitching detail fails its purpose. Lightbox is the industry-standard, user-expected pattern for portfolios.
- **Why not "open in new tab"**: Breaks flow, creates context switching, can't navigate between images, loses portfolio atmosphere. Worse UX than doing nothing.
- **Scope (middle-ground)**:
  - ✅ Full-screen overlay with image
  - ✅ Close button, click outside to close, Escape key
  - ✅ Prev/Next arrows + keyboard navigation (arrow keys)
  - ✅ Swipe gestures for mobile
  - ✅ Image counter (3/12)
  - ✅ Caption display (if available)
  - ❌ Thumbnail strip (v1 skip)
  - ❌ Zoom/pan (complexity explosion)
  - ❌ Share button (not core to viewing)

### Drag-and-Drop Upload (2024-12-30)
- **Rationale**: Expected UX in 2024 - users will try it instinctively. Low implementation cost, meaningful improvement for uploading 10-20 images.
- **Drop zone**: Entire gallery editor area (not just button) - larger target, more forgiving, more discoverable
- **Visual feedback**: Border highlight + "Drop images here" text on drag-over
- **Coexists with**: File picker button (both methods available)

## Tech Stack
- Existing dnd-kit setup (from Component System & Sections)
- Existing image upload (from Single Image Upload)
- CSS Grid for layout

## Key Files
```
src/components/editor/GallerySection.tsx      # Gallery editor
src/components/editor/GalleryUpload.tsx       # Multi-upload UI
src/components/editor/GalleryImage.tsx        # Individual image in gallery
src/components/GalleryDisplay.tsx             # Published gallery
src/lib/gallery-validation.ts                 # Alt text checks
```

## Demo Script (45 seconds)
1. Open `/admin` editor on existing page
2. Click "+", select "Gallery"
3. Drag 6 costume photos from Finder onto the gallery area
4. See upload progress for all 6
5. Each image shows alt text field
6. Fill alt text: "Hamlet costume, Act 1", etc.
7. Drag image 3 to position 1 (reorder)
8. Click "Publish"
9. View published page → Gallery displays in responsive grid
10. Click an image → Lightbox opens with full-size image
11. Use arrow keys to navigate between images
12. Press Escape to close
13. **Success**: Professional gallery with immersive viewing experience

## Success Criteria

### Functional Requirements
- [ ] Can upload multiple images in one action
- [ ] Gallery stores array of image IDs
- [ ] Reordering images within gallery works (desktop + mobile)
- [ ] Alt text field available for each image (uses "Gallery image" default if not provided)
- [ ] Published gallery uses responsive grid (2 col mobile, 3-4 col desktop)
- [ ] Gallery with 20+ images performs well
- [ ] Images lazy load in published gallery

### Design Requirements
- [ ] Gallery grid implements masonry layout with 16px gaps per component spec
- [ ] Grid columns: 3 (desktop lg+), 2 (tablet md), 1 (mobile sm) following responsive breakpoints
- [ ] Image cards in gallery use same hover overlay effect as featured cards
- [ ] Gallery handles mixed aspect ratios without distortion (object-fit: cover)
- [ ] Lightbox modal follows motion timing for open/close transitions (300ms ease-out)

### Lightbox Requirements
- [ ] Click image opens lightbox with full-size image
- [ ] Close via X button, click outside, or Escape key
- [ ] Prev/Next navigation with arrow buttons and keyboard (←/→)
- [ ] Mobile: swipe left/right for navigation, swipe down to close
- [ ] Image counter shows position (e.g., "3 / 12")
- [ ] Caption displays below image if available
- [ ] Focus trapped within lightbox for accessibility

### Drag-and-Drop Upload Requirements
- [ ] Entire gallery editor area accepts dropped files
- [ ] Visual feedback on drag-over (border highlight, "Drop images here" text)
- [ ] Dropped files trigger same upload flow as file picker
- [ ] Invalid file types show helpful error message
- [ ] File picker button still works alongside drag-drop

## Integration Points

These elements are designed to be extended:
- **Gallery section type** - Can be extended with carousel/masonry layouts
- **Image reordering pattern** - Designed to be reusable across all multi-image features
- **Alt text validation** - Enforces accessibility standards
