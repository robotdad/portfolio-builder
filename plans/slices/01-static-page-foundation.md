# Static Page Foundation

**Slice:** 1 of 8  
**Phase:** 1 (Functional Prototype)  
**Estimated Duration:** 400 lines total  
**Previous Slice:** None  
**Next Slice:** Rich Text Editing

**Prerequisites:**
- Read: `plans/VISION.md` - Product vision and design principles
- Read: `plans/USERS.md` - User personas and scenarios
- Read: `plans/ARCHITECTURE.md` - Technical architecture
- Read: `plans/IMPLEMENTATION_APPROACH.md` - Development methodology
- Read: `plans/IMPLEMENTATION_GUIDE.md` - Implementation patterns

---

**User Value**: User can create a basic portfolio page with text and see it published live.

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

## Size Estimate
400 lines total:
- Database schema (Prisma): 50 lines
- Page editor form: 100 lines
- Published page viewer: 50 lines
- API routes (save, publish): 100 lines
- Basic styling: 100 lines

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
- [ ] Can create a page with title and text
- [ ] Publish action saves to database
- [ ] Published page displays at `/[slug]`
- [ ] Content persists across page reloads
- [ ] Basic responsive layout (Tailwind defaults)

## Integration Points
- **Page model** → Next slice will add rich text editing
- **Published viewer** → Next slice will enhance with styled components
- **Database** → Next slice will add Asset model for images
