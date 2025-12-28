# Rich Text Editing

**Slice:** 2 of 8  
**Phase:** 1 (Functional Prototype)  
**Estimated Duration:** 350 lines total  
**Previous Slice:** Static Page Foundation  
**Next Slice:** Single Image Upload

**Prerequisites:**
- Read: `plans/VISION.md` - Product vision and design principles
- Read: `plans/USERS.md` - User personas and scenarios
- Read: `plans/ARCHITECTURE.md` - Technical architecture
- Read: `plans/IMPLEMENTATION_APPROACH.md` - Development methodology
- Read: `plans/IMPLEMENTATION_GUIDE.md` - Implementation patterns
- Previous slice deliverables: Static Page Foundation

---

**User Value**: User can format text professionally with headings, bold, italic, and links.

## Scope

**Included**:
- Replace simple textarea with Tiptap editor
- Toolbar with: Paragraph, H1-H3, Bold, Italic, Link
- WYSIWYG editing (see formatting as you type)
- Content stored as HTML in database
- Published page renders HTML safely

**NOT Included**:
- Image insertion in text
- Advanced formatting (underline, strike, colors)
- Multiple text blocks (single editor only)
- Mobile-optimized toolbar (desktop first)

## Size Estimate
350 lines total:
- Tiptap setup and configuration: 80 lines
- Toolbar component: 120 lines
- Link dialog/popover: 80 lines
- HTML sanitization: 40 lines
- Updated page editor: 30 lines

## Tech Stack
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`
- `isomorphic-dompurify` for HTML sanitization
- shadcn/ui: Button, Popover (for link dialog)

## Key Files
```
src/components/editor/RichTextEditor.tsx  # Tiptap editor wrapper
src/components/editor/Toolbar.tsx         # Formatting toolbar
src/components/editor/LinkDialog.tsx      # Link insertion UI
src/lib/sanitize.ts                       # HTML sanitization
```

## Demo Script (30 seconds)
1. Open `/admin` editor
2. Type text, select it, click "H1" → Text becomes heading
3. Type more text, select it, click "B" → Text becomes bold
4. Select text, click link icon, enter URL → Text becomes link
5. Click "Publish"
6. View published page → Formatting preserved
7. **Success**: Professional text formatting works end-to-end

## Success Criteria
- [ ] Tiptap editor renders and accepts input
- [ ] Toolbar buttons work (H1-H3, Bold, Italic)
- [ ] Link insertion/editing works
- [ ] HTML content saves to database
- [ ] Published page renders formatted content safely
- [ ] No XSS vulnerabilities (sanitization works)

## Integration Points
- **RichTextEditor component** → Next slice will make it a draggable block
- **Content format** → HTML with sanitization (stable contract)
- **Toolbar pattern** → Will be reused for mobile editing
