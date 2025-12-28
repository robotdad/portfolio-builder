# Multiple Pages & Navigation

**Goal:** User can organize work into different pages (Theatre, Film, About).

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

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

These elements are designed to be extended:
- **Page model** - Can be extended with page hierarchy (parentId)
- **Navigation** - Can be enhanced with manual ordering and page visibility controls
- **Page switcher** - Designed to be reusable throughout admin interface
