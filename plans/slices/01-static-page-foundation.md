# Static Page Foundation

**Goal:** User can create a basic portfolio page with text and see it published live.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/DESIGN-SYSTEM.md
@plans/design/TEMPLATE-SYSTEM.md
@plans/design/themes/modern-minimal.md
@plans/design/themes/classic-elegant.md
@plans/design/themes/bold-editorial.md

## Scope

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

## Tech Stack
- Next.js App Router (page routes only)
- Prisma + SQLite
- Tailwind CSS (default styling)
- No auth yet (open endpoints)

## Key Files
```
prisma/schema.prisma          # Site, Page models
src/app/admin/page.tsx        # Simple editor form
src/app/[slug]/page.tsx       # Published page viewer
src/app/api/pages/route.ts   # Save page endpoint
src/lib/db.ts                 # Prisma client
```

## Demo Script (30 seconds)
1. Navigate to `/admin`
2. Fill in page title: "My Portfolio"
3. Add text content: "Welcome to my costume design work"
4. Click "Publish"
5. Navigate to `/my-portfolio` → See published page
6. **Success**: Content is live and viewable

## Success Criteria

### Functional Requirements
- [ ] Can create a page with title and text
- [ ] Publish action saves to database
- [ ] Published page displays at `/[slug]`
- [ ] Content persists across page reloads

### Design Requirements
- [ ] CSS custom properties implement all design tokens from DESIGN-SYSTEM.md (colors, spacing, typography scales)
- [ ] Theme switching applies correct color palette and typography for each of 3 themes
- [ ] Base typography (headings, body text, links) renders with correct font families, sizes, and line heights per design system
- [ ] Responsive breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px) are configured and functional
- [ ] Page max-width constraint (1280px) is applied with proper centering

## Integration Points

These elements are designed to be extended:
- **Page model** - Can be extended with additional fields for rich content
- **Published viewer** - Can be enhanced with more sophisticated rendering
- **Database schema** - Can be extended with additional models (e.g., Asset)
