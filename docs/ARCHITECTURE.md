# Architecture Overview

This document describes the architecture and design patterns of the Portfolio Builder application.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| React | React 19 |
| Database | SQLite via Prisma |
| Styling | Tailwind CSS v4 + CSS Custom Properties |
| Rich Text | TipTap |
| Image Processing | Sharp |
| Drag & Drop | @dnd-kit |
| Icons | Lucide React |
| Validation | Zod |

---

## Project Structure

```
portfolio-builder/
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── playwright.config.ts      # E2E test configuration
├── prisma.config.ts          # Prisma configuration
├── next.config.ts            # Next.js configuration
├── eslint.config.mjs         # ESLint configuration
├── scripts/                  # Utility scripts (populate, generate)
├── test-assets/              # Test personas and images
├── docs/                     # Documentation
└── src/                      # Application source
    ├── app/                  # Next.js App Router
    │   ├── api/              # REST API routes
    │   ├── admin/            # Admin dashboard pages
    │   ├── welcome/          # Onboarding wizard
    │   ├── preview/          # Draft preview mode
    │   └── [slug]/           # Public portfolio routes
    ├── components/
    │   ├── admin/            # Admin UI components
    │   ├── editor/           # Rich text & section editors
    │   ├── onboarding/       # Welcome flow components
    │   ├── portfolio/        # Public display components
    │   │   └── templates/    # Homepage templates
    │   ├── providers/        # React context providers
    │   ├── shared/           # Reusable UI components
    │   └── ui/               # Base primitives (Button, Card)
    ├── hooks/                # Custom React hooks
    ├── lib/
    │   ├── api/              # API response helpers
    │   ├── messages/         # Centralized error/success messages
    │   ├── storage/          # File storage utilities
    │   ├── types/            # TypeScript definitions
    │   ├── utils/            # Utility functions
    │   └── validations/      # Zod schemas
    ├── prisma/               # Database schema and migrations
    ├── public/               # Static assets & uploads
    └── tests/                # Test infrastructure
        └── e2e/              # Playwright E2E tests
```

---

## Route Structure

### Application Routes

| Route | Purpose |
|-------|---------|
| `/` | Root redirect to portfolio or onboarding |
| `/welcome/*` | Onboarding wizard (portfolio, first-project, theme) |
| `/admin/*` | Admin dashboard with nested routes |
| `/preview/[slug]/*` | Preview unpublished content |
| `/[slug]` | Published portfolio homepage |
| `/[slug]/[page]` | Published portfolio pages |
| `/[slug]/[category]/[project]` | Published project detail |

### Layout Hierarchy

```
app/layout.tsx              # Root: Providers, fonts, global CSS
├── app/admin/layout.tsx    # Admin: Sidebar, header
└── app/[slug]/layout.tsx   # Portfolio: Theme, public nav
```

### API Routes

```
api/
├── portfolio/            # Portfolio CRUD + publish
├── categories/           # Category CRUD + reorder
│   └── [id]/
├── projects/             # Project CRUD + reorder
│   └── [id]/
│       └── publish/
├── pages/                # Page CRUD + reorder + publish
│   └── [id]/
├── images/               # Image asset management
└── upload/               # File upload handler
```

---

## Data Model

### Entity Relationships

```
Portfolio (1)
├── Page (*)              # Homepage + custom pages
├── Category (*)          # Project groupings
│   └── Project (*)       # Individual works
│       └── ProjectGalleryImage (*)
├── Asset (*)             # Uploaded images
└── profilePhoto (1)      # Profile image reference
```

### Draft/Publish Workflow

Content uses a dual-field pattern for draft and published states:

| Content Type | Draft Fields | Published Fields |
|--------------|--------------|------------------|
| Portfolio | `draftTheme`, `draftTemplate` | `publishedTheme`, `publishedTemplate` |
| Page | `draftContent` | `publishedContent`, `lastPublishedAt` |
| Project | `draftContent` | `publishedContent`, `lastPublishedAt` |

- Admin interface reads and writes `draft*` fields
- Public routes only read `published*` fields
- Preview routes read `draft*` fields
- Publish action copies draft → published

---

## Component Architecture

### Organization

| Directory | Purpose | Examples |
|-----------|---------|----------|
| `admin/` | Admin dashboard UI | `AdminLayout`, `CategoryForm`, `ProjectCard` |
| `editor/` | Content editing | `RichTextEditor`, `SectionList`, `ImageUpload` |
| `portfolio/` | Public display | `Navigation`, `FeaturedWork`, `ProjectDetail` |
| `shared/` | Cross-cutting UI | `FormField`, `ImagePicker`, `Toast`, `Modal` |
| `ui/` | Atomic primitives | `Button`, `Card`, `Skeleton` |

### Patterns

**Functional Components Only**
- All components are functional with hooks
- `'use client'` directive for interactive components
- Server Components for data fetching pages

**Props Typing**
```typescript
export interface ComponentProps {
  // Props defined here
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Implementation
}
```

**Barrel Exports**
Each directory has an `index.ts` exporting public components:
```typescript
export { AdminLayout } from './AdminLayout'
export type { AdminLayoutProps } from './AdminLayout'
```

---

## State Management

### Approach

- **No external state library** (no Redux, Zustand)
- **React hooks** for local state (`useState`, `useRef`, `useCallback`)
- **Context API** for cross-cutting concerns (Toast only)
- **Custom hooks** for domain logic

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useAutoSave` | Periodic content saving (30s interval) |
| `useCategories` | Category CRUD with optimistic updates |
| `useProjects` | Project CRUD with optimistic updates |
| `useImageUpload` | File upload with progress |
| `useImagePicker` | Image selection modal state |
| `useNavigationData` | Admin sidebar data loading |
| `useFocusTrap` | Modal accessibility |
| `usePopoverPosition` | Viewport-aware positioning |

### Data Fetching Pattern

```typescript
// Custom hooks return standardized shape
interface UseDataReturn<T> {
  data: T[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  // CRUD operations
  create: (data) => Promise<T>
  update: (id, data) => Promise<T>
  delete: (id) => Promise<boolean>
}
```

### Optimistic Updates

Hooks implement optimistic updates with rollback:
```typescript
const update = async (id, data) => {
  const previous = items           // Store for rollback
  setItems(optimisticUpdate)       // Update immediately
  try {
    await fetch(...)               // Sync with server
  } catch {
    setItems(previous)             // Rollback on error
  }
}
```

---

## Styling Architecture

### Approach

- **Tailwind CSS v4** for utility classes
- **CSS Custom Properties** for design tokens
- **CSS Modules** for component-specific styles
- **styled-jsx** for scoped styles in components

### Design Tokens

Global tokens defined in `globals.css`:
```css
:root {
  /* Typography */
  --font-size-base: clamp(1rem, 0.925rem + 0.375vw, 1.125rem);
  
  /* Spacing (8px base) */
  --space-4: 1rem;
  
  /* Components */
  --button-radius: var(--radius-md);
  --card-radius: var(--radius-lg);
}
```

### Theme System

Three themes applied via `data-theme` attribute:

| Theme | Aesthetic |
|-------|-----------|
| `modern-minimal` | Clean, professional, cool palette |
| `classic-elegant` | Sophisticated, traditional, warm palette |
| `bold-editorial` | Fashion-forward, dramatic, dark palette |

```css
[data-theme="bold-editorial"] {
  --color-background: hsl(0, 0%, 5%);
  --color-text-primary: hsl(0, 0%, 98%);
}
```

### Responsive Design

- Mobile-first breakpoints: 640px, 768px, 1024px, 1280px
- Touch targets minimum 44px (WCAG compliant)
- Fluid typography using `clamp()`

---

## Image Pipeline

### Upload Flow

```
[File Upload] → [Sharp Processing] → [Asset Record]
                       ↓
              ┌───────────────────┐
              │ Responsive Images │
              │ 400w, 800w,       │
              │ 1200w, 1600w      │
              │ + 20px placeholder│
              └───────────────────┘
```

### Asset Storage

Images stored in `public/uploads/{assetId}/`:
- `display.webp` — Full size
- `thumbnail.webp` — 400px thumbnail
- `placeholder.webp` — 20px blur
- `srcset-{size}.webp` — Responsive variants

---

## Template System

Homepage templates in `components/portfolio/templates/`:

| Template | Description |
|----------|-------------|
| `featured-grid` | Grid layout with hover overlays |
| `clean-minimal` | Full-width stacked images |

Selected via `portfolio.publishedTemplate`, rendered dynamically:
```typescript
const Templates = {
  'featured-grid': FeaturedGridTemplate,
  'clean-minimal': CleanMinimalTemplate,
}
```

---

## API Response Patterns

### Standard Wrapper

Used by Categories, Projects:
```typescript
// Success
{ data: T, success: true }

// Error
{ error: string, code: string, success: false }
```

### Direct Response

Used by Portfolio, Pages, Upload:
```typescript
// Success: direct data
T

// Error
{ message: string }
```

### Response Helpers

```typescript
import { apiSuccess, apiError, apiNotFound } from '@/lib/api/response'

return apiSuccess(data)           // 200 with data
return apiNotFound('Project')     // 404
return apiValidationError('...')  // 400
```

---

## Form Handling

### Approach

- **No form library** (custom validation)
- **Controlled inputs** with `useState`
- **Zod schemas** for server-side validation
- **Per-field validation** with touched state

### Pattern

```typescript
const [errors, setErrors] = useState({})
const [touched, setTouched] = useState({})

const validate = (field, value) => {
  // Return error message or undefined
}

const handleBlur = (field) => {
  setTouched(prev => ({ ...prev, [field]: true }))
  setErrors(prev => ({ ...prev, [field]: validate(field, value) }))
}
```

---

## File Conventions

### Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `CategoryForm.tsx` |
| Hooks | camelCase with `use` | `useAutoSave.ts` |
| Utilities | kebab-case | `content-schema.ts` |
| CSS Modules | Component.module.css | `CategoryList.module.css` |

### Import Aliases

```typescript
import { prisma } from '@/lib/prisma'
import { AdminLayout } from '@/components/admin'
import { Button } from '@/components/ui'
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js App Router                           │
├──────────────────────┬──────────────────────────────────────────┤
│  Server Components   │         Client Components                │
│  - Prisma queries    │         - Interactive UI                 │
│  - Initial render    │         - Custom hooks                   │
│  - Redirects         │         - Form handling                  │
├──────────────────────┴──────────────────────────────────────────┤
│                    State Management                              │
│  ┌─────────────────┐  ┌──────────────┐  ┌─────────────────┐    │
│  │  Custom Hooks   │  │   Context    │  │   Local State   │    │
│  │  useCategories  │  │   (Toast)    │  │   (per form)    │    │
│  │  useProjects    │  │              │  │                 │    │
│  └─────────────────┘  └──────────────┘  └─────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                    API Layer (Route Handlers)                    │
│  Zod validation → Prisma queries → Standardized responses       │
├─────────────────────────────────────────────────────────────────┤
│                    Database (SQLite + Prisma)                    │
└─────────────────────────────────────────────────────────────────┘
```
