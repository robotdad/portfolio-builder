# Foundation: Technology Decisions

This document records the technology choices for the portfolio builder. All subsequent work packages should follow these decisions.

## Page Builder: dnd-kit (Custom Solution)

### Decision

Build a custom page builder using `@dnd-kit/core` and `@dnd-kit/sortable`.

### Alternatives Evaluated

| Option | Outcome |
|--------|---------|
| Craft.js | Partial mobile touch support, SSR issues with Next.js App Router |
| Builder.io SDK | Not viable - SDK is render-only, editing requires their hosted platform |
| dnd-kit (custom) | **Selected** - Full mobile touch, smaller bundle, full control |

### Rationale

1. **Mobile touch is critical** - dnd-kit was the only option where drag-and-drop worked reliably on iPhone
2. **Smaller bundle** - ~110KB vs ~260KB for Craft.js
3. **Full control** - Custom serialization format, no framework lock-in
4. **Active maintenance** - dnd-kit has regular releases and responsive maintainers

### Implementation Reference

See `spikes/dndkit/` for working patterns:
- Touch sensor configuration: 150ms delay, 8px tolerance
- Critical CSS: `touch-action: none` on all draggable elements
- State management: useReducer with normalized component/section structure
- Serialization schema in `spikes/dndkit/DELIVERABLES.md`

### Required Packages

```json
{
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^8.x",
  "@dnd-kit/utilities": "^3.x"
}
```

---

## Rich Text Editor: Tiptap

### Decision

Use Tiptap for all rich text editing (text blocks, bio fields, descriptions).

### Alternatives Considered

| Option | Assessment |
|--------|------------|
| Slate | Lower-level, more work for standard features |
| Lexical | Facebook's editor, newer, less ecosystem |
| Tiptap | **Selected** - ProseMirror foundation, batteries-included |
| contentEditable (raw) | Used in spike, insufficient for production |

### Rationale

1. **Sufficient for portfolio needs** - Headings, bold, italic, links, lists
2. **Good mobile support** - Touch-friendly toolbar patterns documented
3. **Extension ecosystem** - Tables, mentions, placeholders available if needed
4. **Excellent documentation** - Clear examples and guides

### Required Packages

```json
{
  "@tiptap/react": "^2.x",
  "@tiptap/starter-kit": "^2.x",
  "@tiptap/extension-link": "^2.x",
  "@tiptap/extension-placeholder": "^2.x"
}
```

### Usage Pattern

```tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

const editor = useEditor({
  extensions: [
    StarterKit,
    Link.configure({ openOnClick: false }),
  ],
  content: initialContent,
  onUpdate: ({ editor }) => {
    onChange(editor.getHTML());
  },
});
```

---

## Theme System: CSS Custom Properties + Tailwind

### Decision

Use CSS custom properties (CSS variables) for theme tokens, integrated with Tailwind CSS.

### Alternatives Considered

| Option | Assessment |
|--------|------------|
| React Context + inline styles | Used in spike, no pseudo-class support |
| Tailwind dark mode only | Limited to light/dark, not custom themes |
| CSS-in-JS (styled-components) | Adds bundle size and complexity |
| CSS custom properties | **Selected** - Full CSS support, performant |

### Rationale

1. **Full CSS support** - Pseudo-classes (`:hover`, `:focus`) work correctly
2. **Performant** - No runtime style generation
3. **Tailwind integration** - Clean mapping to utility classes
4. **Multiple themes** - Not limited to light/dark binary

### Implementation

See `foundation/theme-system.md` for full specification.

---

## Framework: Next.js 14+ (App Router)

### Decision

Use Next.js with the App Router for the application framework.

### Notes

- Use dynamic imports with `ssr: false` for dnd-kit components (hydration mismatch fix)
- API routes for backend functionality
- Static generation for published portfolio pages

### Required Packages

```json
{
  "next": "^14.x",
  "react": "^18.x",
  "react-dom": "^18.x"
}
```

---

## Styling: Tailwind CSS

### Decision

Use Tailwind CSS for all styling, integrated with CSS custom properties for theming.

### Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        secondary: 'var(--color-secondary)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        border: 'var(--color-border)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        lg: 'var(--radius-lg)',
      },
      spacing: {
        // Use default Tailwind spacing, theme tokens for specific values
      },
    },
  },
};
```

---

## UI Components: shadcn/ui

### Decision

Use shadcn/ui (Radix primitives + Tailwind) for accessible UI components.

### Components to Install

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add toggle
npx shadcn-ui@latest add tooltip
```

### Notes

- shadcn/ui components are copied into the project (not a dependency)
- Customize to use theme CSS variables
- All components are accessible by default (Radix foundation)

---

## Image Processing: Sharp.js

### Decision

Use Sharp.js for server-side image optimization.

### Processing Pipeline

1. Accept upload (validate type, size)
2. Strip EXIF data (privacy)
3. Auto-rotate based on EXIF orientation
4. Generate versions:
   - Display: max 1920px wide, WebP, quality 85
   - Thumbnail: 400x300, WebP, quality 75
   - Placeholder: 40px wide, blurred, base64

### Required Packages

```json
{
  "sharp": "^0.33.x"
}
```

---

## Database: SQLite (dev) / PostgreSQL (prod)

### Decision

Use Prisma ORM with SQLite for local development, PostgreSQL for production.

### Rationale

- **Local-first development** - No external database needed to run locally
- **Same codebase** - Prisma abstracts the differences
- **Production-ready** - PostgreSQL for hosting

### Required Packages

```json
{
  "prisma": "^5.x",
  "@prisma/client": "^5.x"
}
```

### Configuration

```prisma
// schema.prisma
datasource db {
  provider = "sqlite" // Change to "postgresql" for production
  url      = env("DATABASE_URL")
}
```

---

## Authentication: Session-based

### Decision

Use session-based authentication with secure HTTP-only cookies.

### Implementation Notes

- Session token stored in HTTP-only, secure, SameSite=Strict cookie
- Session data stored in database (Session model)
- 7-day session duration, refresh when < 1 day remaining
- CSRF protection for state-changing operations

### No External Auth Provider

For simplicity, implement auth directly rather than using NextAuth or similar. The app is single-user focused.

---

## File Storage: Local (dev) / S3-compatible (prod)

### Decision

Abstract file storage behind an interface. Local filesystem for development, S3-compatible for production.

### Interface

```typescript
interface StorageProvider {
  upload(file: Buffer, path: string): Promise<string>; // Returns URL
  delete(path: string): Promise<void>;
  getUrl(path: string): string;
}
```

### Implementations

- `LocalStorageProvider` - Writes to `./uploads/`, serves via Next.js
- `S3StorageProvider` - Uploads to S3/R2/MinIO, returns CDN URL

---

## Development Ports

To avoid conflicts when running multiple implementations:

| Context | Port |
|---------|------|
| Main application | 4000 |
| Spikes (completed) | 4001-4003 |

---

## Summary Checklist

When implementing any work package, ensure:

- [ ] Using dnd-kit for drag-and-drop (not Craft.js or native HTML5 DnD)
- [ ] Using Tiptap for rich text (not raw contentEditable)
- [ ] Theme values come from CSS custom properties
- [ ] Tailwind classes reference theme variables
- [ ] shadcn/ui for UI primitives
- [ ] Sharp.js for image processing
- [ ] Prisma for database access
- [ ] Session-based auth pattern
- [ ] Storage provider interface for file uploads
