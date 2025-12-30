# Rich Text Editing

**Goal:** User can format text professionally with headings, bold, italic, and links.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/DESIGN-SYSTEM.md
@plans/design/AESTHETIC-GUIDE.md

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

### Functional Requirements
- [ ] Tiptap editor renders and accepts input
- [ ] Toolbar buttons work (H1-H3, Bold, Italic)
- [ ] Link insertion/editing works
- [ ] HTML content saves to database
- [ ] Published page renders formatted content safely
- [ ] No XSS vulnerabilities (sanitization works)

### Design Requirements
- [ ] Editor supports all heading levels (H1-H4) with typography scale from design system
- [ ] Content spacing uses 8px grid system (paragraphs, headings, lists)
- [ ] Typography rendering in editor matches published page appearance (WYSIWYG)
- [ ] Toolbar UI follows spacing and interaction patterns from aesthetic guide
- [ ] Text formatting (bold, italic, links) applies correct font weights and styles

## Integration Points

These elements are designed to be extended:
- **RichTextEditor component** - Can be extended to support draggable blocks
- **Content format** - HTML with sanitization (stable contract)
- **Toolbar pattern** - Designed to be reusable for mobile editing
