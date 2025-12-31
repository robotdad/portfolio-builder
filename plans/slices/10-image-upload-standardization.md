# Image Upload Standardization

**Goal:** Consistent image upload experience across all upload points with optimistic apply and undo.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/DESIGN-SYSTEM.md
@plans/design/components/image-upload-pattern.md

## Scope

**Included**:
- Optimistic upload pattern (immediate apply + undo toast)
- Apply to profile photo in hero section
- Apply to featured image uploads
- Consistent with existing gallery upload behavior
- Toast notification with 5-second undo window
- Progress indicator during upload
- Error handling with retry option

**NOT Included**:
- Image picker from existing uploads
- Batch upload for non-gallery contexts
- Crop/resize before upload
- Cancel mid-upload
- Upload queue management

## Tech Stack
- Shared ImageUpload component
- Toast component for undo feedback
- React state for optimistic updates
- Sharp.js for image processing (existing)

## Key Files
```
src/components/shared/ImageUpload.tsx         # Unified upload component
src/components/shared/Toast.tsx               # Toast notification system
src/components/shared/ProgressRing.tsx        # Upload progress indicator
src/hooks/useImageUpload.ts                   # Shared upload logic with undo
src/components/editor/HeroSection.tsx         # Update to use new pattern
```

## Demo Script (30 seconds)
1. Open `/admin` editor, scroll to hero section
2. Click profile photo upload area
3. Select new image → Image immediately appears (optimistic)
4. Toast appears: "Profile photo updated" with [Undo] button
5. Wait 5 seconds → Toast disappears, change committed
6. Upload another image
7. Click [Undo] before toast expires → Previous image restored
8. Upload image to gallery → Same pattern applies
9. **Success**: Consistent upload experience with undo safety net

## Success Criteria

### Functional Requirements
- [ ] Image appears immediately after selection (optimistic)
- [ ] Toast with Undo appears for 5 seconds after upload
- [ ] Clicking Undo reverts to previous image
- [ ] Upload progress shown during processing
- [ ] Error toast appears on upload failure with Retry option
- [ ] Pattern works for profile photo, hero image, and featured images
- [ ] Behavior matches existing gallery upload

### Design Requirements
- [ ] Upload zone shows dashed border with hover state per design spec
- [ ] Progress ring displays percentage during upload
- [ ] Toast appears at bottom center, slides up with 250ms animation
- [ ] Toast progress bar shrinks over 5 seconds
- [ ] Error state uses distinct color (red) for warning icon
- [ ] All states accessible via keyboard (Tab to upload, Enter to select)
- [ ] Screen reader announces upload status changes

## Integration Points

These elements are designed to be extended:
- **ImageUpload component** - Reusable for any future image upload needs
- **Toast system** - Can handle other notifications (save, publish, etc.)
- **useImageUpload hook** - Encapsulates upload + undo logic for reuse
