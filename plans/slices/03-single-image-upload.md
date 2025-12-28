# Single Image Upload

**Slice:** 3 of 8  
**Phase:** 1 (Functional Prototype)  
**Estimated Duration:** 450 lines total  
**Previous Slice:** Rich Text Editing  
**Next Slice:** Mobile Editing Basics

**Prerequisites:**
- Read: `plans/PROJECT_OVERVIEW.md`
- Read: `plans/SLICE_SESSION_GUIDE.md`
- Previous slice deliverables: Static Page Foundation, Rich Text Editing

---

**User Value**: User can add professional photos to their portfolio with proper optimization.

## Scope

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

## Size Estimate
450 lines total:
- Image upload component: 80 lines
- Image processing pipeline (Sharp): 120 lines
- API endpoint (upload): 100 lines
- Asset database model: 40 lines
- Image display component: 60 lines
- File storage abstraction: 50 lines

## Tech Stack
- Sharp.js for image processing
- Local file storage (./uploads directory)
- Prisma (Asset model)
- Next.js Image component for display

## Key Files
```
prisma/schema.prisma                      # Add Asset model
src/components/editor/ImageUpload.tsx    # Upload UI component
src/app/api/upload/route.ts              # Upload endpoint
src/lib/image-processor.ts               # Sharp.js pipeline
src/lib/storage/LocalStorage.ts          # Storage interface impl
src/components/ImageDisplay.tsx          # Published page image
```

## Demo Script (30 seconds)
1. Open `/admin` editor
2. Click "Add Image" button
3. Select image file from computer (JPEG, 5MB)
4. See upload progress, then "Optimizing..." message
5. Enter alt text: "Costume design for Hamlet"
6. Image appears in editor preview
7. Click "Publish"
8. View published page → Optimized image loads fast
9. **Success**: Professional image handling works

## Success Criteria
- [ ] File upload accepts JPEG/PNG/WebP
- [ ] Sharp.js generates 3 versions (display, thumbnail, placeholder)
- [ ] Images stored in ./uploads with organized paths
- [ ] Asset record saved to database with metadata
- [ ] Alt text validation prevents publish without it
- [ ] Published page uses Next.js Image optimization
- [ ] File size reduced by ~60% from original

## Integration Points
- **Asset model** → Next slice will support multiple images
- **Storage interface** → Can swap for S3 later without changes
- **Image processing** → Will be reused for all uploads
- **Alt text validation** → Foundation for accessibility gates
