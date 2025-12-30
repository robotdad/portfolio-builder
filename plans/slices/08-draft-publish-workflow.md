# Draft/Publish Workflow

**Goal:** User can work on changes without affecting live site, preview before publishing.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/AESTHETIC-GUIDE.md
@plans/design/DESIGN-SYSTEM.md

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

### Functional Requirements
- [ ] Draft content auto-saves every 30 seconds
- [ ] Manual save button works
- [ ] Published site serves publishedContent field
- [ ] Draft edits don't affect published site
- [ ] Preview route shows draftContent
- [ ] Publish action copies draft → published atomically
- [ ] Clear visual indicators of draft vs published state
- [ ] Can continue editing after publish

### Design Requirements
- [ ] Draft status is clearly visually distinguished from published status
- [ ] Auto-save feedback appears within 200ms with subtle animation per motion timing
- [ ] Preview mode accurately renders page as it will appear when published
- [ ] Publish action has confirmation step with clear state transition
- [ ] Status indicators (draft/published/saving) follow motion timing for state changes (200ms ease-out)

## Integration Points

These elements are designed to be extended:
- **Draft/published pattern** - Foundation for additional features (scheduled publish, approval workflows)
- **Auto-save** - Designed to be reusable across all editing interfaces
- **Preview mode** - Can be enhanced with shareable preview links with expiration
