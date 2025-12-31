# Home Page Routing

**Goal:** User can publish a page to the site root (/) instead of a slug-based URL.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/DESIGN-SYSTEM.md

## Scope

**Included**:
- "Set as home page" toggle in page settings
- Home page publishes to `/` instead of `/[slug]`
- Only one page can be home at a time
- Confirmation dialog when changing home page
- Visual indicator showing which page is home
- Original slug still works (redirects or serves same content)

**NOT Included**:
- Custom URL paths beyond home
- URL redirects management
- 301/302 redirect configuration
- Multiple home pages
- Conditional home page (by user type, etc.)

## Tech Stack
- Prisma schema update (isHomePage boolean on Page)
- Next.js dynamic routing for `/` 
- Transaction to ensure single home page
- Confirmation dialog component

## Key Files
```
prisma/schema.prisma                          # Add isHomePage field to Page
src/app/page.tsx                              # Dynamic home page routing
src/app/[slug]/page.tsx                       # Update to handle home redirect
src/components/admin/PageSettings.tsx         # Home page toggle
src/components/shared/ConfirmDialog.tsx       # Confirmation modal
src/app/api/pages/[id]/set-home/route.ts     # Set home page endpoint
```

## Demo Script (30 seconds)
1. Open `/admin` with multiple pages created
2. Navigate to "About" page settings
3. Toggle "Set as home page" → Confirmation dialog appears
4. Dialog: "Make 'About' your home page? This will replace 'Portfolio' as your home page."
5. Click Confirm → Toggle activates, success feedback
6. Notice "About" page now shows home icon indicator
7. Previous home page ("Portfolio") no longer shows indicator
8. Visit `/` in new tab → "About" page content displays
9. Visit `/about` → Same content (or redirect to `/`)
10. **Success**: Site root serves designated home page

## Success Criteria

### Functional Requirements
- [ ] Toggle to set page as home page exists in page settings
- [ ] Only one page can be home at a time
- [ ] Setting new home page clears previous home page flag
- [ ] Confirmation required when changing home page
- [ ] Home page serves at `/` route
- [ ] Visual indicator shows which page is currently home
- [ ] Original slug URL still accessible (serves content or redirects)
- [ ] New portfolios default first page as home

### Design Requirements
- [ ] Home page toggle clearly labeled with explanation text
- [ ] Confirmation dialog follows modal design patterns
- [ ] Dialog has clear Cancel and Confirm actions
- [ ] Home indicator icon visible in page list/navigation
- [ ] Toggle uses standard switch component styling
- [ ] Confirmation dialog is keyboard accessible (Escape to cancel)
- [ ] Success feedback appears after setting home page

## Integration Points

These elements are designed to be extended:
- **Page settings pattern** - Foundation for additional per-page settings
- **ConfirmDialog component** - Reusable for destructive/important actions
- **Routing logic** - Can support custom paths in future
