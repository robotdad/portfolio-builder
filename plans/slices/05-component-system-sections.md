# Component System & Sections

**Slice:** 5 of 8  
**Phase:** 1 (Functional Prototype)  
**Estimated Duration:** 500 lines total  
**Previous Slice:** Mobile Editing Basics  
**Next Slice:** Image Gallery Component

**Prerequisites:**
- Read: `plans/VISION.md` - Product vision and design principles
- Read: `plans/USERS.md` - User personas and scenarios
- Read: `plans/ARCHITECTURE.md` - Technical architecture
- Read: `plans/IMPLEMENTATION_APPROACH.md` - Development methodology
- Read: `plans/IMPLEMENTATION_GUIDE.md` - Implementation patterns
- Previous slice deliverables: Static Page Foundation, Rich Text Editing, Single Image Upload, Mobile Editing Basics

---

**User Value**: User can structure pages with multiple sections of text and images.

## Scope

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

## Size Estimate
500 lines total:
- Section data model: 40 lines
- dnd-kit setup (touch config): 80 lines
- SectionList component: 120 lines
- Section type components: 150 lines
- Add section UI: 60 lines
- JSON serialization: 50 lines

## Tech Stack
- `@dnd-kit/core`, `@dnd-kit/sortable`
- Touch sensor configuration (150ms delay, 8px tolerance)
- React state management (sections array)

## Key Files
```
src/lib/content-schema.ts                    # Section type definitions
src/components/editor/SectionList.tsx        # dnd-kit sortable list
src/components/editor/TextSection.tsx        # Text block section
src/components/editor/ImageSection.tsx       # Image block section
src/components/editor/AddSectionButton.tsx   # + button with picker
src/lib/serialization.ts                     # Section JSON format
```

## Demo Script (30 seconds)
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

## Success Criteria
- [ ] Can add multiple sections to page
- [ ] Each section type (text, image) works independently
- [ ] Drag-and-drop reordering works on desktop
- [ ] Touch drag works on iPhone (tested on device)
- [ ] Sections serialize to clean JSON
- [ ] Published page renders sections in order
- [ ] Can delete sections
- [ ] Page with 10+ sections remains performant

## Integration Points
- **Section model** → Next slice will add gallery section type
- **dnd-kit config** → Will be reused for gallery reordering
- **Serialization** → Stable format for all content types
