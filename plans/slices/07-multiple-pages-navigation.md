# Multiple Pages & Navigation

**Slice:** 7 of 8  
**Phase:** 1 (Functional Prototype)  
**Estimated Duration:** 420 lines total  
**Previous Slice:** Image Gallery Component  
**Next Slice:** Draft/Publish Workflow

**Prerequisites:**
- Read: `plans/PROJECT_OVERVIEW.md`
- Read: `plans/SLICE_SESSION_GUIDE.md`
- Previous slice deliverables: Static Page Foundation, Rich Text Editing, Single Image Upload, Mobile Editing Basics, Component System & Sections, Image Gallery Component

---

**User Value**: User can organize work into different pages (Theatre, Film, About).

## Scope

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

## Size Estimate
420 lines total:
- Page list UI: 100 lines
- Create page flow: 80 lines
- Navigation component: 80 lines
- Page switcher: 60 lines
- Homepage logic: 40 lines
- Page deletion: 60 lines

## Tech Stack
- Existing Prisma Page model (extend with navigation fields)
- shadcn/ui: Sheet (for mobile page list)

## Key Files
```
src/components/admin/PageList.tsx            # List all pages
src/components/admin/CreatePageDialog.tsx    # New page form
src/components/admin/PageSwitcher.tsx        # Switch between pages
src/components/Navigation.tsx                # Published site nav
src/app/api/pages/[id]/route.ts             # Delete endpoint
```

## Demo Script (30 seconds)
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

## Success Criteria
- [ ] Can create multiple pages
- [ ] Each page has independent content (sections)
- [ ] Page list shows all pages with edit/delete actions
- [ ] Can switch between pages in admin
- [ ] Published site auto-generates navigation menu
- [ ] Homepage (/) shows designated home page
- [ ] Other pages accessible at /[slug]
- [ ] Navigation is responsive (hamburger on mobile)

## Integration Points
- **Page model** → Future: add parentId for hierarchy
- **Navigation** → Future: manual ordering, hide pages
- **Page switcher** → Used throughout admin interface
