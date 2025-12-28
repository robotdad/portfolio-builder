# Portfolio Builder: Vertical Slice Breakdown

**Philosophy**: Each slice delivers complete user value and can be demoed immediately. Build incrementally, test continuously, avoid late integration risk.

**Design Principles**:
- Start with absolute minimum working system
- Each slice: 300-500 lines, truly self-contained
- Mobile support is incremental (not all in slice 1)
- Theme system comes later (focus on core value first)
- Follow ruthless simplicity throughout

---

## Slice 1: Static Page Foundation

**User Value**: User can create a basic portfolio page with text and see it published live.

### Scope

**Included**:
- Single page with title and text content
- Direct content entry (simple form, no WYSIWYG yet)
- Publish action that generates a viewable page
- Basic database schema (Site, Page models)
- Simple published site viewer

**NOT Included**:
- Image uploads
- Rich text editing (Tiptap)
- Drag-and-drop
- Multiple pages
- Authentication
- Mobile optimization
- Themes

### Size Estimate
400 lines total:
- Database schema (Prisma): 50 lines
- Page editor form: 100 lines
- Published page viewer: 50 lines
- API routes (save, publish): 100 lines
- Basic styling: 100 lines

### Tech Stack
- Next.js App Router (page routes only)
- Prisma + SQLite
- Tailwind CSS (default styling)
- No auth yet (open endpoints)

### Key Files
```
prisma/schema.prisma          # Site, Page models
src/app/admin/page.tsx        # Simple editor form
src/app/[slug]/page.tsx       # Published page viewer
src/app/api/pages/route.ts   # Save page endpoint
src/lib/db.ts                 # Prisma client
```

### Demo Script (30 seconds)
1. Navigate to `/admin`
2. Fill in page title: "My Portfolio"
3. Add text content: "Welcome to my costume design work"
4. Click "Publish"
5. Navigate to `/my-portfolio` → See published page
6. **Success**: Content is live and viewable

### Success Criteria
- [ ] Can create a page with title and text
- [ ] Publish action saves to database
- [ ] Published page displays at `/[slug]`
- [ ] Content persists across page reloads
- [ ] Basic responsive layout (Tailwind defaults)

### Integration Points
- **Page model** → Next slice will add rich text editing
- **Published viewer** → Next slice will enhance with styled components
- **Database** → Next slice will add Asset model for images

---

## Slice 2: Rich Text Editing

**User Value**: User can format text professionally with headings, bold, italic, and links.

### Scope

**Included**:
- Replace simple textarea with Tiptap editor
- Toolbar with: Paragraph, H1-H3, Bold, Italic, Link
- WYSIWYG editing (see formatting as you type)
- Content stored as HTML in database
- Published page renders HTML safely

**NOT Included**:
- Image insertion in text
- Advanced formatting (underline, strike, colors)
- Multiple text blocks (single editor only)
- Mobile-optimized toolbar (desktop first)

### Size Estimate
350 lines total:
- Tiptap setup and configuration: 80 lines
- Toolbar component: 120 lines
- Link dialog/popover: 80 lines
- HTML sanitization: 40 lines
- Updated page editor: 30 lines

### Tech Stack
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`
- `isomorphic-dompurify` for HTML sanitization
- shadcn/ui: Button, Popover (for link dialog)

### Key Files
```
src/components/editor/RichTextEditor.tsx  # Tiptap editor wrapper
src/components/editor/Toolbar.tsx         # Formatting toolbar
src/components/editor/LinkDialog.tsx      # Link insertion UI
src/lib/sanitize.ts                       # HTML sanitization
```

### Demo Script (30 seconds)
1. Open `/admin` editor
2. Type text, select it, click "H1" → Text becomes heading
3. Type more text, select it, click "B" → Text becomes bold
4. Select text, click link icon, enter URL → Text becomes link
5. Click "Publish"
6. View published page → Formatting preserved
7. **Success**: Professional text formatting works end-to-end

### Success Criteria
- [ ] Tiptap editor renders and accepts input
- [ ] Toolbar buttons work (H1-H3, Bold, Italic)
- [ ] Link insertion/editing works
- [ ] HTML content saves to database
- [ ] Published page renders formatted content safely
- [ ] No XSS vulnerabilities (sanitization works)

### Integration Points
- **RichTextEditor component** → Next slice will make it a draggable block
- **Content format** → HTML with sanitization (stable contract)
- **Toolbar pattern** → Will be reused for mobile editing

---

## Slice 3: Single Image Upload

**User Value**: User can add professional photos to their portfolio with proper optimization.

### Scope

**Included**:
- Upload single image via file input
- Server-side processing with Sharp.js (resize, WebP conversion)
- Store optimized versions (display, thumbnail, placeholder)
- Display image on published page
- Alt text field (required for publish)
- Asset model in database

**NOT Included**:
- Multiple image galleries
- Drag-and-drop upload
- Image cropping/editing
- Mobile camera integration (desktop file upload only)
- Image library/reuse

### Size Estimate
450 lines total:
- Image upload component: 80 lines
- Image processing pipeline (Sharp): 120 lines
- API endpoint (upload): 100 lines
- Asset database model: 40 lines
- Image display component: 60 lines
- File storage abstraction: 50 lines

### Tech Stack
- Sharp.js for image processing
- Local file storage (./uploads directory)
- Prisma (Asset model)
- Next.js Image component for display

### Key Files
```
prisma/schema.prisma                      # Add Asset model
src/components/editor/ImageUpload.tsx    # Upload UI component
src/app/api/upload/route.ts              # Upload endpoint
src/lib/image-processor.ts               # Sharp.js pipeline
src/lib/storage/LocalStorage.ts          # Storage interface impl
src/components/ImageDisplay.tsx          # Published page image
```

### Demo Script (30 seconds)
1. Open `/admin` editor
2. Click "Add Image" button
3. Select image file from computer (JPEG, 5MB)
4. See upload progress, then "Optimizing..." message
5. Enter alt text: "Costume design for Hamlet"
6. Image appears in editor preview
7. Click "Publish"
8. View published page → Optimized image loads fast
9. **Success**: Professional image handling works

### Success Criteria
- [ ] File upload accepts JPEG/PNG/WebP
- [ ] Sharp.js generates 3 versions (display, thumbnail, placeholder)
- [ ] Images stored in ./uploads with organized paths
- [ ] Asset record saved to database with metadata
- [ ] Alt text validation prevents publish without it
- [ ] Published page uses Next.js Image optimization
- [ ] File size reduced by ~60% from original

### Integration Points
- **Asset model** → Next slice will support multiple images
- **Storage interface** → Can swap for S3 later without changes
- **Image processing** → Will be reused for all uploads
- **Alt text validation** → Foundation for accessibility gates

---

## Slice 4: Mobile Editing Basics

**User Value**: Sarah can update her portfolio from iPhone backstage in <5 minutes.

### Scope

**Included**:
- Responsive editor layout (stacked, not sidebar)
- Touch-friendly buttons (44px minimum)
- Mobile text editing (toolbar above keyboard)
- Mobile image upload (from photo library)
- Quick save indicator
- Test on actual iPhone

**NOT Included**:
- Mobile camera capture (library only for now)
- Touch drag-and-drop
- Offline editing
- Progressive Web App features
- Mobile-specific gestures (pinch, swipe)

### Size Estimate
400 lines total:
- Responsive layout wrapper: 80 lines
- Mobile toolbar component: 100 lines
- Touch-optimized buttons: 60 lines
- Mobile file input handling: 80 lines
- Viewport meta tags and CSS: 40 lines
- Mobile testing utilities: 40 lines

### Tech Stack
- Tailwind responsive utilities (`md:`, `lg:`)
- CSS `touch-action` properties
- Mobile viewport meta tags
- No additional libraries

### Key Files
```
src/components/editor/MobileLayout.tsx       # Mobile-first layout
src/components/editor/MobileToolbar.tsx      # Toolbar above keyboard
src/components/editor/TouchButton.tsx        # 44px touch targets
src/components/editor/MobileImageUpload.tsx  # Mobile file picker
src/app/admin/layout.tsx                     # Responsive wrapper
```

### Demo Script (30 seconds)
**On iPhone**:
1. Navigate to `/admin` on iPhone
2. Tap into text editor → Keyboard appears with toolbar above
3. Select text, tap "B" button → Text becomes bold
4. Tap "Add Image" → iOS photo picker opens
5. Select photo from library → Upload starts
6. Enter alt text using mobile keyboard
7. Tap "Publish" → Success message
8. View published page on phone → Looks professional
9. **Success**: Complete edit flow works on mobile

### Success Criteria
- [ ] Editor layout works on iPhone (tested on real device)
- [ ] All buttons are 44px minimum (touch target size)
- [ ] Text editing works with mobile keyboard
- [ ] Toolbar doesn't get hidden by keyboard
- [ ] Image upload works from photo library
- [ ] No horizontal scrolling on mobile
- [ ] Load time < 3 seconds on 3G
- [ ] Complete edit → publish flow under 5 minutes

### Integration Points
- **Mobile layout patterns** → Will be used for all mobile features
- **Touch targets** → Standard for all interactive elements
- **Responsive patterns** → Foundation for galleries, pages, etc.

---

## Slice 5: Component System & Sections

**User Value**: User can structure pages with multiple sections of text and images.

### Scope

**Included**:
- Page as array of sections (text blocks, image blocks)
- Add/remove sections with "+" button
- Reorder sections with dnd-kit (desktop and mobile)
- Each section editable independently
- Sections serialize to JSON

**NOT Included**:
- Galleries (multiple images in one section)
- Column layouts (single column only)
- Section templates
- Copy/paste sections
- Undo/redo

### Size Estimate
500 lines total:
- Section data model: 40 lines
- dnd-kit setup (touch config): 80 lines
- SectionList component: 120 lines
- Section type components: 150 lines
- Add section UI: 60 lines
- JSON serialization: 50 lines

### Tech Stack
- `@dnd-kit/core`, `@dnd-kit/sortable`
- Touch sensor configuration (150ms delay, 8px tolerance)
- React state management (sections array)

### Key Files
```
src/lib/content-schema.ts                    # Section type definitions
src/components/editor/SectionList.tsx        # dnd-kit sortable list
src/components/editor/TextSection.tsx        # Text block section
src/components/editor/ImageSection.tsx       # Image block section
src/components/editor/AddSectionButton.tsx   # + button with picker
src/lib/serialization.ts                     # Section JSON format
```

### Demo Script (30 seconds)
1. Open `/admin` editor
2. Page shows one text section by default
3. Click floating "+" button → Section picker appears
4. Select "Image" → New image section added below
5. Upload image to new section
6. Drag text section below image (touch or mouse) → Order changes
7. Click "+" again, add another text section
8. Click "Publish"
9. View published page → Sections appear in correct order
10. **Success**: Multi-section page building works

### Success Criteria
- [ ] Can add multiple sections to page
- [ ] Each section type (text, image) works independently
- [ ] Drag-and-drop reordering works on desktop
- [ ] Touch drag works on iPhone (tested on device)
- [ ] Sections serialize to clean JSON
- [ ] Published page renders sections in order
- [ ] Can delete sections
- [ ] Page with 10+ sections remains performant

### Integration Points
- **Section model** → Next slice will add gallery section type
- **dnd-kit config** → Will be reused for gallery reordering
- **Serialization** → Stable format for all content types

---

## Slice 6: Image Gallery Component

**User Value**: User can showcase multiple costume photos in professional grid layouts.

### Scope

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

### Size Estimate
480 lines total:
- Gallery section component: 120 lines
- Multi-upload UI: 100 lines
- Gallery image item: 80 lines
- Gallery reordering (dnd): 80 lines
- Published gallery display: 80 lines
- Gallery validation: 20 lines

### Tech Stack
- Existing dnd-kit setup (from slice 5)
- Existing image upload (from slice 3)
- CSS Grid for layout

### Key Files
```
src/components/editor/GallerySection.tsx      # Gallery editor
src/components/editor/GalleryUpload.tsx       # Multi-upload UI
src/components/editor/GalleryImage.tsx        # Individual image in gallery
src/components/GalleryDisplay.tsx             # Published gallery
src/lib/gallery-validation.ts                 # Alt text checks
```

### Demo Script (30 seconds)
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

### Success Criteria
- [ ] Can upload multiple images in one action
- [ ] Gallery stores array of image IDs
- [ ] Reordering images within gallery works (desktop + mobile)
- [ ] Alt text required for each image before publish
- [ ] Published gallery uses responsive grid (2 col mobile, 3-4 col desktop)
- [ ] Gallery with 20+ images performs well
- [ ] Images lazy load in published gallery

### Integration Points
- **Gallery section type** → Will add carousel/masonry in future
- **Image reordering pattern** → Used across all multi-image features
- **Alt text validation** → Enforces accessibility

---

## Slice 7: Multiple Pages & Navigation

**User Value**: User can organize work into different pages (Theatre, Film, About).

### Scope

**Included**:
- Create additional pages
- Page list/switcher in admin
- Simple navigation menu on published site
- Set homepage
- Page slugs (URLs)
- Delete pages

**NOT Included**:
- Page hierarchy (parent/child)
- Navigation customization (auto-generated only)
- Page templates
- Page duplication
- Navigation reordering (alphabetical only)

### Size Estimate
420 lines total:
- Page list UI: 100 lines
- Create page flow: 80 lines
- Navigation component: 80 lines
- Page switcher: 60 lines
- Homepage logic: 40 lines
- Page deletion: 60 lines

### Tech Stack
- Existing Prisma Page model (extend with navigation fields)
- shadcn/ui: Sheet (for mobile page list)

### Key Files
```
src/components/admin/PageList.tsx            # List all pages
src/components/admin/CreatePageDialog.tsx    # New page form
src/components/admin/PageSwitcher.tsx        # Switch between pages
src/components/Navigation.tsx                # Published site nav
src/app/api/pages/[id]/route.ts             # Delete endpoint
```

### Demo Script (30 seconds)
1. Open `/admin`, currently editing "Home"
2. Click "Pages" → See list: [Home]
3. Click "New Page"
4. Enter title: "Theatre Work", slug auto-fills: "theatre-work"
5. Click "Create" → New empty page editor opens
6. Add sections with theatre costume photos
7. Click "Publish"
8. View published site → Navigation shows: Home | Theatre Work
9. Click "Theatre Work" in nav → New page displays
10. **Success**: Multi-page portfolio works

### Success Criteria
- [ ] Can create multiple pages
- [ ] Each page has independent content (sections)
- [ ] Page list shows all pages with edit/delete actions
- [ ] Can switch between pages in admin
- [ ] Published site auto-generates navigation menu
- [ ] Homepage (/) shows designated home page
- [ ] Other pages accessible at /[slug]
- [ ] Navigation is responsive (hamburger on mobile)

### Integration Points
- **Page model** → Future: add parentId for hierarchy
- **Navigation** → Future: manual ordering, hide pages
- **Page switcher** → Used throughout admin interface

---

## Slice 8: Draft/Publish Workflow

**User Value**: User can work on changes without affecting live site, preview before publishing.

### Scope

**Included**:
- Separate draft and published content per page
- Auto-save drafts (every 30 seconds)
- Manual save button
- Preview mode (shows draft in published layout)
- Publish action (draft → published)
- Visual indicators (Draft/Published badges)

**NOT Included**:
- Version history
- Rollback to previous versions
- Scheduled publishing
- Publish confirmation dialog (just click publish)
- Change summary

### Size Estimate
450 lines total:
- Draft state management: 80 lines
- Auto-save logic: 80 lines
- Preview mode: 100 lines
- Publish action: 60 lines
- Draft/published indicators: 50 lines
- API endpoints (save draft, publish): 80 lines

### Tech Stack
- Prisma schema update (draftContent, publishedContent fields)
- React state + useEffect for auto-save
- Next.js route for preview

### Key Files
```
prisma/schema.prisma                      # Update Page model
src/hooks/useAutoSave.ts                  # Auto-save hook
src/components/admin/DraftIndicator.tsx   # Draft/published badge
src/components/admin/PublishButton.tsx    # Publish action
src/app/preview/[slug]/page.tsx          # Preview route
src/app/api/pages/[id]/publish/route.ts  # Publish endpoint
```

### Demo Script (30 seconds)
1. Open `/admin`, editing "Home" page
2. See "Draft" badge in header
3. Make changes: add new text section
4. See "Saving..." indicator briefly
5. Wait 30 seconds → "All changes saved" appears
6. Click "Preview" → New tab opens showing draft in published layout
7. Close preview, make more changes
8. Click "Publish" → Success message, badge changes to "Published"
9. View published site → Changes are now live
10. Edit again → Badge returns to "Draft"
11. **Success**: Safe draft/publish workflow prevents accidental changes

### Success Criteria
- [ ] Draft content auto-saves every 30 seconds
- [ ] Manual save button works
- [ ] Published site serves publishedContent field
- [ ] Draft edits don't affect published site
- [ ] Preview route shows draftContent
- [ ] Publish action copies draft → published atomically
- [ ] Clear visual indicators of draft vs published state
- [ ] Can continue editing after publish

### Integration Points
- **Draft/published pattern** → Foundation for future features (scheduled publish, approval)
- **Auto-save** → Used across all editing interfaces
- **Preview mode** → Will support preview links with expiration

---

## Implementation Strategy

### Build Order
1. **Slice 1** → Validate database, API, and routing patterns
2. **Slice 2** → Validate rich text editing approach
3. **Slice 3** → Validate image pipeline and storage
4. **Slice 4** → Validate mobile experience (highest risk)
5. **Slice 5** → Validate component architecture
6. **Slice 6** → Validate complex component (gallery)
7. **Slice 7** → Validate multi-page architecture
8. **Slice 8** → Validate publishing workflow

### Testing Approach
After each slice:
- [ ] Manual testing on desktop (Chrome, Safari)
- [ ] Manual testing on iPhone (Safari)
- [ ] Verify no console errors
- [ ] Check database state (Prisma Studio)
- [ ] Test with realistic content (photos, text)
- [ ] Verify performance (page load, interactions)

### Integration Checkpoints
After slices 3, 5, and 8:
- Full end-to-end test of all features
- Test scenario: Marcus creating first portfolio (Scenario 1)
- Test scenario: Sarah mobile update (Scenario 2)
- Fix any integration issues before continuing

### What Comes After Slice 8?

**Phase 2 Slices** (not specified here, but likely):
- Slice 9: Authentication & Security
- Slice 10: Theme System (colors, fonts)
- Slice 11: Gallery Layouts (carousel, masonry)
- Slice 12: Lightbox/Modal Image View
- Slice 13: Page Organization (hierarchy, reordering)
- Slice 14: Accessibility Validation
- Slice 15: Performance Optimization
- Slice 16: Analytics Integration

### Success Metrics

**After Slice 4**: Can Marcus create a basic portfolio in 30 minutes? (Text + images)
**After Slice 6**: Can Sarah update from phone in 5 minutes? (Add gallery)
**After Slice 8**: Can Emma organize work into multiple pages safely? (Draft/publish)

---

## Architecture Principles Per Slice

### Data Flow (Every Slice)
```
User Action → React State → API Route → Prisma → Database
         ↓
    Auto-save (draft)
         ↓
    Manual Publish
         ↓
    Published Content → Public Route → Visitor
```

### Component Pattern (Slices 5+)
```typescript
// Section components implement this contract
interface Section {
  id: string;
  type: 'text' | 'image' | 'gallery';
  content: Record<string, any>;
}

// Editor component
<SectionEditor section={section} onChange={handleChange} />

// Published component  
<SectionDisplay section={section} />
```

### Mobile-First CSS (Slice 4+)
```css
/* Default: Mobile */
.button { font-size: 16px; padding: 12px; }

/* Desktop: Override */
@media (min-width: 768px) {
  .button { font-size: 14px; padding: 8px; }
}
```

### File Size Budgets (All Slices)
- Each slice adds max 50KB to bundle (gzipped)
- Total bundle after slice 8: < 200KB
- Each page load: < 1MB total (including images)

---

## Risk Mitigation

### Slice 4 Risk: Mobile Touch
**Risk**: Touch drag-and-drop might not work well
**Mitigation**: Test on real iPhone in slice 4, adjust before slice 5

### Slice 5 Risk: dnd-kit Complexity
**Risk**: Section reordering might be complex to implement
**Mitigation**: Start with simple implementation, reference spike code

### Slice 6 Risk: Multi-Upload Performance
**Risk**: Uploading 20+ images might be slow/crash
**Mitigation**: Implement queue with 3 concurrent uploads max

### Slice 8 Risk: Auto-Save Conflicts
**Risk**: Auto-save might conflict with manual edits
**Mitigation**: Use optimistic UI updates, debounce saves

---

## Definition of Done (Every Slice)

- [ ] Code implements all "Included" items
- [ ] Code omits all "NOT Included" items (resist scope creep)
- [ ] Demo script works end-to-end
- [ ] All success criteria met
- [ ] No console errors or warnings
- [ ] Works on desktop (Chrome, Safari)
- [ ] Works on iPhone (if slice 4+)
- [ ] Code is under line count estimate (or justified)
- [ ] Integration points documented for next slice
- [ ] Committed to git with clear commit message

---

## Next Steps

1. Review this breakdown with stakeholders
2. Confirm slice order and scope
3. Begin Slice 1 implementation
4. Demo after each slice
5. Gather feedback, adjust subsequent slices as needed

**Remember**: The goal is learning and feedback, not perfect architecture. Build, demo, learn, iterate.
