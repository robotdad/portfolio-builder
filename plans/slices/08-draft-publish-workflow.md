# Draft/Publish Workflow

**Slice:** 8 of 8  
**Phase:** 1 (Functional Prototype)  
**Estimated Duration:** 450 lines total  
**Previous Slice:** Multiple Pages & Navigation  
**Next Slice:** Complete

**Prerequisites:**
- Read: `plans/PROJECT_OVERVIEW.md`
- Read: `plans/SLICE_SESSION_GUIDE.md`
- Previous slice deliverables: All previous slices (1-7)

---

**User Value**: User can work on changes without affecting live site, preview before publishing.

## Scope

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

## Size Estimate
450 lines total:
- Draft state management: 80 lines
- Auto-save logic: 80 lines
- Preview mode: 100 lines
- Publish action: 60 lines
- Draft/published indicators: 50 lines
- API endpoints (save draft, publish): 80 lines

## Tech Stack
- Prisma schema update (draftContent, publishedContent fields)
- React state + useEffect for auto-save
- Next.js route for preview

## Key Files
```
prisma/schema.prisma                      # Update Page model
src/hooks/useAutoSave.ts                  # Auto-save hook
src/components/admin/DraftIndicator.tsx   # Draft/published badge
src/components/admin/PublishButton.tsx    # Publish action
src/app/preview/[slug]/page.tsx          # Preview route
src/app/api/pages/[id]/publish/route.ts  # Publish endpoint
```

## Demo Script (30 seconds)
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

## Success Criteria
- [ ] Draft content auto-saves every 30 seconds
- [ ] Manual save button works
- [ ] Published site serves publishedContent field
- [ ] Draft edits don't affect published site
- [ ] Preview route shows draftContent
- [ ] Publish action copies draft → published atomically
- [ ] Clear visual indicators of draft vs published state
- [ ] Can continue editing after publish

## Integration Points
- **Draft/published pattern** → Foundation for future features (scheduled publish, approval)
- **Auto-save** → Used across all editing interfaces
- **Preview mode** → Will support preview links with expiration
