# Lib - Core Business Logic

Shared utilities, types, and business logic for the portfolio application.

## Key Concepts

### Draft/Publish Workflow

Content uses a **dual-field pattern** to separate work-in-progress from published content:

| Entity | Draft Field | Published Field |
|--------|-------------|-----------------|
| Portfolio | `draftTheme`, `draftTemplate` | `publishedTheme`, `publishedTemplate` |
| Page | `draftContent` | `publishedContent` |
| Project | `draftContent` | `publishedContent` |

**How it works:**

1. **Editing** always modifies `draft*` fields
2. **Publishing** copies draft → published and sets `lastPublishedAt`
3. **Public routes** (`/[slug]/*`) only read `published*` fields
4. **Preview routes** (`/preview/[slug]/*`) read `draft*` fields
5. **Admin** reads `draft*` for editing, shows publish status by comparing

**Why this pattern:**
- Users can safely edit without affecting the live site
- Preview before publishing catches mistakes
- `lastPublishedAt` tracks publish history
- Comparing draft vs published determines if there are unpublished changes

### Theme System

**Three themes available:**
- `modern-minimal` — Clean, professional, cool palette
- `classic-elegant` — Sophisticated, traditional, warm palette  
- `bold-editorial` — Fashion-forward, dramatic, dark palette

**Important: Theme separation from admin**

Themes apply ONLY to portfolio display, NOT to admin:

| Context | Theme Applied? | Styling Source |
|---------|----------------|----------------|
| Admin (`/admin/*`) | ❌ No | Base application styles |
| Welcome (`/welcome/*`) | ❌ No | Base application styles |
| Public (`/[slug]/*`) | ✅ Yes (`publishedTheme`) | Theme CSS variables |
| Preview (`/preview/*`) | ✅ Yes (`draftTheme`) | Theme CSS variables |

**Why separate:**
- Admin needs consistent, predictable UI for content management
- Theme changes shouldn't break admin usability
- Preview lets users see theme before publishing

**How themes work:**
1. Theme ID stored in `portfolio.draftTheme` / `portfolio.publishedTheme`
2. Portfolio layout sets `data-theme` attribute on container
3. CSS custom properties in `globals.css` define theme values
4. Components use `var(--color-*)` tokens, not hardcoded colors

## Directory Structure

### api/
Response helpers for consistent API responses.

- `response.ts` — `apiSuccess()`, `apiError()`, `apiNotFound()`, `apiValidationError()`

### messages/
Centralized user-facing messages.

- Error messages, success messages, validation messages
- Consistent tone and wording across the application

### storage/
File storage utilities.

- `local.ts` — Local filesystem storage for uploads
- Handles directory creation, file writing, cleanup

### types/
Shared TypeScript type definitions.

### utils/
General utilities.

- `slug.ts` — URL slug generation from titles

### validations/
Zod schemas for request validation.

- Used by API routes to validate incoming data
- Provides type-safe parsing with error messages

## Key Files

### content-schema.ts
Section-based content model. Defines all section types (Text, Image, Hero, Gallery, etc.) and type guards. See file for detailed documentation.

### prisma.ts
Prisma client instance. Simple re-export for consistent imports.

### image-processor.ts
Sharp-based image processing. Generates responsive variants (400w, 800w, 1200w, 1600w) and blur placeholders.

### serialization.ts
Content serialization utilities. Handles conversion between editor format and storage format.
