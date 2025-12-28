# Image Gallery Component

**Goal:** User can showcase multiple costume photos in professional grid layouts.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

## Scope

**Included**:
- Gallery section type (holds multiple images)
- Multi-image upload (select multiple files)
- Grid layout (2-4 columns, responsive)
- Reorder images within gallery (dnd-kit)
- Individual alt text for each image
- Gallery displays on published page

**NOT Included**:
- Carousel layout
- Masonry layout
- Lightbox/modal view
- Bulk alt text editing
- Image captions (alt text only)

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

## Demo Script (30 seconds)
1. Open `/admin` editor on existing page
2. Click "+", select "Gallery"
3. Click "Add Images", select 6 costume photos
4. See upload progress for all 6
5. Each image shows alt text field
6. Fill alt text: "Hamlet costume, Act 1", etc.
7. Drag image 3 to position 1 (reorder)
8. Set gallery to 3 columns
9. Click "Publish"
10. View published page → Gallery displays in 3-column grid
11. **Success**: Professional gallery showcases work

## Success Criteria
- [ ] Can upload multiple images in one action
- [ ] Gallery stores array of image IDs
- [ ] Reordering images within gallery works (desktop + mobile)
- [ ] Alt text required for each image before publish
- [ ] Published gallery uses responsive grid (2 col mobile, 3-4 col desktop)
- [ ] Gallery with 20+ images performs well
- [ ] Images lazy load in published gallery

## Integration Points

These elements are designed to be extended:
- **Gallery section type** - Can be extended with carousel/masonry layouts
- **Image reordering pattern** - Designed to be reusable across all multi-image features
- **Alt text validation** - Enforces accessibility standards
