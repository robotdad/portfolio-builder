# Technical Architecture

## Overview

This document captures all technical decisions, their rationale, and architectural patterns that guide implementation. These decisions are based on spike evaluations and validation against user requirements. This is the authoritative source for technical architecture - all implementation work should reference this document.

## Core Technology Stack

| Technology | Purpose | Version | Rationale |
|-----------|---------|---------|-----------|
| **Next.js** | Framework | 14+ (App Router) | SSR for published sites, excellent developer experience, built-in image optimization, API routes for backend |
| **React** | UI Library | 18+ | Industry standard, large ecosystem, excellent TypeScript support |
| **TypeScript** | Language | 5+ | Type safety, better developer experience, catches bugs at compile time |
| **dnd-kit** | Drag & Drop | 6.x (core), 8.x (sortable) | Best mobile touch support, smallest bundle (110KB), full control over implementation |
| **Tiptap** | Rich Text Editor | 2.x | ProseMirror foundation, excellent mobile support, sufficient for portfolio text needs |
| **Tailwind CSS** | Styling | 3.x | Utility-first CSS, rapid development, excellent with CSS custom properties |
| **shadcn/ui** | UI Components | Latest | Accessible Radix primitives, full styling control, copy-paste integration |
| **Sharp.js** | Image Processing | 0.33+ | High-performance Node.js image processing, comprehensive format support |
| **Prisma** | ORM | 5.x | Excellent TypeScript integration, abstracts SQLite/PostgreSQL differences |
| **SQLite** | Database (dev) | - | Local-first development, no external dependencies |
| **PostgreSQL** | Database (prod) | 14+ | Production-ready relational database |

---

## Key Technology Decisions

### Decision: dnd-kit for Page Builder

**Selected:** dnd-kit with custom implementation  
**Rejected:** Craft.js, Builder.io SDK

**Rationale:**
- **Only solution with reliable mobile touch support** - Validated on iPhone with real-world testing
- **Smallest bundle size** - 110KB vs 260KB for Craft.js
- **Full control over implementation** - Custom serialization format, no framework lock-in
- **Excellent TypeScript support** - First-class types throughout
- **Active maintenance** - Regular releases, responsive maintainers

**Spike Evaluation Results:**

**Craft.js: REJECTED**
- Partial mobile touch support (unreliable on iOS Safari)
- SSR hydration issues with Next.js App Router and React 19
- 260KB bundle size (2.4x larger than dnd-kit)
- Last major release May 2023 (maintenance concerns)
- Would require workarounds for mobile touch using react-dnd-touch-backend
- Outcome: Works well for desktop-first applications, insufficient for mobile-first approach

**Builder.io SDK: REJECTED**
- SDK is render-only (no editing capabilities)
- Editing requires their hosted platform (not viable for self-hosted)
- Would need Builder.io account and data stored externally
- Business model is hosting the visual editor as a service
- 90KB+ bundle overhead for features we cannot use
- Outcome: Fundamentally incompatible with self-hosted architecture requirements

**dnd-kit: ACCEPTED ✓**
- Full mobile touch support (tested on iPhone, works reliably)
- 110KB bundle (smallest option evaluated)
- 8/8 success criteria met in spike evaluation
- Active maintenance with regular releases
- Trade-off: ~770 lines of custom code vs pre-built solution
- Trade-off justified: Complete control over UX and architecture

**Implementation Requirements:**

```typescript
// Touch sensor configuration (CRITICAL for mobile)
import { useSensor, useSensors, TouchSensor, PointerSensor } from '@dnd-kit/core';

const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // Prevents accidental drags on desktop
    },
  }),
  useSensor(TouchSensor, {
    activationConstraint: {
      delay: 150,    // ms - prevents accidental drags, allows scrolling
      tolerance: 8,  // px - allows small movements before drag starts
    },
  })
);
```

**Critical CSS requirement:**
```css
/* REQUIRED for iOS Safari touch events to work properly */
.draggable {
  touch-action: none;
}
```

**Required Packages:**
```json
{
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^8.x",
  "@dnd-kit/utilities": "^3.x"
}
```

**References:**
- Full spike evaluation: `archive/work-packages/spikes/spike-dndkit.md`
- Working prototype with 770 lines demonstrates feasibility
- Validated on actual iPhone device (not just browser emulation)

---

### Decision: Tiptap for Rich Text Editing

**Selected:** Tiptap  
**Rejected:** Slate, Lexical, raw contentEditable

**Rationale:**
- **Sufficient for portfolio text needs** - Headings, bold, italic, links, lists
- **Excellent mobile support** - Touch-friendly toolbar patterns
- **ProseMirror foundation** - Battle-tested editor core
- **Great documentation** - Clear examples and guides
- **Extension ecosystem** - Tables, mentions, placeholders available if needed

**Why Not Others:**
- **Slate**: More complex than needed, mobile support concerns, lower-level API
- **Lexical**: Facebook's editor, newer with less ecosystem, overkill for portfolio text
- **contentEditable (raw)**: Too low-level, cross-browser issues, no structure

**Required Packages:**
```json
{
  "@tiptap/react": "^2.x",
  "@tiptap/starter-kit": "^2.x",
  "@tiptap/extension-link": "^2.x",
  "@tiptap/extension-placeholder": "^2.x"
}
```

**Usage Pattern:**
```typescript
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

**References:** `archive/work-packages/foundation/tech-decisions.md`

---

### Decision: CSS Custom Properties for Theming

**Selected:** CSS custom properties + Tailwind  
**Rejected:** CSS-in-JS (styled-components, Emotion), React Context + inline styles

**Rationale:**
- **CRITICAL: CSS-in-JS doesn't support pseudo-classes in theme tokens** - Cannot theme `:hover`, `:focus`, `:active` states dynamically
- **Better performance** - No runtime style injection, styles parsed once
- **Simpler mental model** - Declarative CSS, no JavaScript overhead
- **Works seamlessly with Tailwind** - Clean mapping to utility classes
- **Browser-native** - Leverages browser's CSS engine for optimal performance

**Theme System Pattern:**

```typescript
// 1. Theme Definition (JavaScript/TypeScript)
interface Theme {
  colors: {
    primary: { 50: string; 500: string; 900: string };
    background: string;
    text: string;
  };
  spacing: {
    sm: string;
    md: string;
    lg: string;
  };
  borderRadius: string;
}

const modernTheme: Theme = {
  colors: {
    primary: { 50: '#eff6ff', 500: '#3b82f6', 900: '#1e3a8a' },
    background: '#ffffff',
    text: '#1f2937',
  },
  spacing: { sm: '8px', md: '16px', lg: '24px' },
  borderRadius: '8px',
};

// 2. CSS Custom Properties (Generated)
:root[data-theme="modern"] {
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;
  --color-background: #ffffff;
  --color-text: #1f2937;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --border-radius: 8px;
}

// 3. Tailwind Config (References CSS vars)
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          500: 'var(--color-primary-500)',
          900: 'var(--color-primary-900)',
        },
        background: 'var(--color-background)',
        text: 'var(--color-text)',
      },
      spacing: {
        'theme-sm': 'var(--spacing-sm)',
        'theme-md': 'var(--spacing-md)',
        'theme-lg': 'var(--spacing-lg)',
      },
    },
  },
};

// 4. Components Use Tailwind (Pseudo-classes work!)
<button className="bg-primary-500 hover:bg-primary-900 focus:ring-2 focus:ring-primary-500">
  Click me
</button>
```

**Theme Switching (Simple):**
```typescript
// Single attribute change, CSS handles everything
document.documentElement.setAttribute('data-theme', 'modern');
```

**Why This Works:**
- Pseudo-classes (`:hover`, `:focus`) reference the CSS variable
- Browser applies pseudo-class styles natively
- No JavaScript re-renders on theme change
- Instant visual update

**Why CSS-in-JS Fails:**
```typescript
// CSS-in-JS Problem: Cannot theme pseudo-classes dynamically
const Button = styled.button`
  background: ${props => props.theme.primary};
  &:hover {
    background: ${props => props.theme.primaryHover}; // ❌ Fixed at render time
  }
`;
// Hover color doesn't update when theme changes without re-render
```

**References:** `archive/work-packages/foundation/theme-system.md`

---

### Decision: Local-First, Host-Ready Architecture

**Pattern:** Same codebase runs locally (dev) and hosted (prod) with provider abstraction

**Development Environment:**
- **Database:** SQLite (`./data/dev.db`)
- **File Storage:** Local filesystem (`./uploads`)
- **Auth:** Simple session cookies
- **No external services required** - Complete offline development

**Production Environment:**
- **Database:** PostgreSQL (connection string)
- **File Storage:** S3-compatible (Cloudflare R2, AWS S3, MinIO)
- **Auth:** Same session cookies (secure flags enabled)
- **CDN:** Optional for asset delivery

**Abstraction Pattern:**
```typescript
// Storage Provider Interface
interface StorageProvider {
  upload(file: Buffer, path: string, options?: UploadOptions): Promise<string>;
  delete(path: string): Promise<void>;
  getUrl(path: string, options?: UrlOptions): string;
  list(prefix: string): Promise<StorageItem[]>;
}

// Local Implementation (Development)
class LocalStorageProvider implements StorageProvider {
  private basePath = './uploads';
  
  async upload(file: Buffer, path: string): Promise<string> {
    const fullPath = join(this.basePath, path);
    await fs.writeFile(fullPath, file);
    return `/uploads/${path}`;
  }
  
  getUrl(path: string): string {
    return `/uploads/${path}`; // Served by Next.js
  }
}

// S3 Implementation (Production)
class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private cdnUrl: string;
  
  async upload(file: Buffer, path: string): Promise<string> {
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: path,
      Body: file,
    }));
    return `${this.cdnUrl}/${path}`;
  }
  
  getUrl(path: string): string {
    return `${this.cdnUrl}/${path}`; // CDN URL
  }
}

// Factory (Environment-based)
export function createStorageProvider(): StorageProvider {
  return process.env.NODE_ENV === 'production'
    ? new S3StorageProvider(config)
    : new LocalStorageProvider();
}
```

**Benefits:**
- **Local development without AWS credentials** - No cloud dependencies
- **Same code paths in dev and prod** - Reduces environment-specific bugs
- **Easy to test storage logic** - No mocking required
- **Flexible hosting options** - Swap providers without code changes

**Database Abstraction (Prisma):**
```prisma
// schema.prisma
datasource db {
  provider = env("DATABASE_PROVIDER") // "sqlite" or "postgresql"
  url      = env("DATABASE_URL")
}
```

```bash
# Development
DATABASE_PROVIDER=sqlite
DATABASE_URL=file:./data/dev.db

# Production
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://user:pass@host:5432/db
```

---

## Component Architecture

### Serialization Format (Normalized Schema)

**Pattern:** Normalized state for efficient updates and reordering

**Why Normalized Over Nested:**
1. **Prevents duplication** - Components stored once, referenced by ID
2. **Efficient updates** - Change props without touching arrays
3. **Clean reordering** - Move IDs in arrays, not entire component data
4. **Easy to validate** - Check references exist
5. **Atomic operations** - Update one component without traversing tree

```typescript
interface PageContent {
  version: '1.0'; // For future migrations
  
  // Normalized structure
  sections: {
    [sectionId: string]: {
      id: string;
      title: string;
      componentIds: string[]; // Ordered references
    };
  };
  
  components: {
    [componentId: string]: {
      id: string;
      type: ComponentType;
      props: ComponentProps;
    };
  };
}

// Example
const pageContent: PageContent = {
  version: '1.0',
  sections: {
    'header': {
      id: 'header',
      title: 'Header Section',
      componentIds: ['comp-1', 'comp-2']
    },
    'content': {
      id: 'content',
      title: 'Content Section',
      componentIds: ['comp-3']
    }
  },
  components: {
    'comp-1': {
      id: 'comp-1',
      type: 'text',
      props: { content: 'Welcome', isBold: true }
    },
    'comp-2': {
      id: 'comp-2',
      type: 'image',
      props: { url: '/img.jpg', altText: 'Portfolio work' }
    },
    'comp-3': {
      id: 'comp-3',
      type: 'gallery',
      props: { images: [...], layout: 'grid' }
    }
  }
};
```

**Reordering Operation (Efficient):**
```typescript
// Move component from header to content
function moveComponent(state: PageContent, compId: string, toSection: string) {
  // Find and remove from current section
  const fromSection = Object.values(state.sections).find(
    s => s.componentIds.includes(compId)
  );
  fromSection.componentIds = fromSection.componentIds.filter(id => id !== compId);
  
  // Add to target section
  state.sections[toSection].componentIds.push(compId);
  
  // Component data never moved - only reference updated
}
```

**Alternative Considered: Nested Tree Structure**
```typescript
// ❌ Nested approach (REJECTED)
interface NestedSection {
  id: string;
  components: Array<{
    id: string;
    type: string;
    props: any;
  }>;
}
```

**Why Nested Was Rejected:**
- Deep updates require cloning entire tree
- Reordering requires array manipulation (splice/insert)
- Component duplication if reused
- Harder to implement undo/redo
- More prone to inconsistency

**Migration Strategy:**
```typescript
// Version field enables migrations
function migrateContent(content: any): PageContent {
  switch (content.version) {
    case undefined: // Legacy format
      return migrateLegacyToV1(content);
    case '1.0':
      return content; // Current format
    default:
      throw new Error(`Unknown version: ${content.version}`);
  }
}
```

---

### Component Contract

All page components implement this interface:

```typescript
interface PageComponent<TProps = any> {
  // Metadata
  type: string; // e.g., 'gallery', 'text', 'image'
  version: string; // For migration support
  
  // React component (works in both contexts)
  Component: React.FC<ComponentProps<TProps>>;
  
  // Editor configuration
  editor: {
    icon: React.ComponentType;
    label: string;
    category: 'content' | 'media' | 'layout' | 'interactive';
    
    // Default props when adding component
    defaultProps: TProps;
    
    // Controls shown in editor sidebar
    controls: {
      [K in keyof TProps]?: ControlDefinition;
    };
    
    // Validation for publishing
    validate: (props: TProps) => ValidationResult[];
  };
  
  // Theme compatibility
  compatibility: {
    themes: string[]; // Supported theme IDs
    fallback?: string; // Component type to use if unsupported
    responsive: boolean; // Mobile-ready
  };
}

// Component props include editing context
interface ComponentProps<T> {
  // Component-specific props
  ...T;
  
  // Global context
  isEditing: boolean; // Editor vs published mode
  theme: Theme; // Current theme
}
```

**DOM Parity Guarantee:**
Both editor and published site render identical DOM structure. This ensures:
- Visual consistency between editing and viewing
- No "what you see is NOT what you get" issues
- Simpler mental model for developers
- Easier to debug (same components, different mode)

```typescript
// Example component with DOM parity
export function GalleryComponent({ images, layout, isEditing }: GalleryProps) {
  return (
    <div className="gallery" data-layout={layout}>
      {images.map(img => (
        <div key={img.id} className="gallery-item">
          {isEditing && <EditOverlay image={img} />}
          <img src={img.url} alt={img.altText} />
        </div>
      ))}
    </div>
  );
}
// Same DOM structure, editing overlay is additional (not replacement)
```

---

## Database Schema

### Core Models

```prisma
model Site {
  id        String   @id @default(cuid())
  userId    String   @unique // Single-user system
  title     String
  slug      String   @unique // e.g., "john-smith"
  theme     String   // Theme ID
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  pages     Page[]
  assets    Asset[]
  
  @@index([slug])
}

model Page {
  id               String    @id @default(cuid())
  siteId           String
  title            String
  slug             String
  
  // Draft/Published Separation (Atomic Publishing)
  draftContent     Json      // PageContent schema (always present)
  publishedContent Json?     // null = never published
  publishedAt      DateTime?
  
  // Page metadata
  description      String?
  ogImage          String?   // Open Graph image URL
  
  // Navigation
  isHomepage       Boolean   @default(false)
  inNavigation     Boolean   @default(true)
  navOrder         Int       @default(0)
  
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  site             Site      @relation(fields: [siteId], references: [id])
  
  @@unique([siteId, slug])
  @@index([siteId, isHomepage])
  @@index([siteId, navOrder])
}

model Asset {
  id             String   @id @default(cuid())
  siteId         String
  
  // File information
  filename       String
  mimeType       String
  size           Int      // Bytes
  
  // Multiple versions (from Sharp.js pipeline)
  displayUrl     String   // Optimized for display (max 1920px)
  thumbnailUrl   String   // Gallery thumbnail (400x300)
  placeholderUrl String   // Base64 blur hash (40px)
  
  // Image metadata
  altText        String?  // REQUIRED for publishing
  width          Int
  height         Int
  aspectRatio    Float    // width / height
  
  createdAt      DateTime @default(now())
  
  site           Site     @relation(fields: [siteId], references: [id])
  
  @@index([siteId])
  @@index([siteId, createdAt]) // For recent uploads
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String   // bcrypt with 12 salt rounds
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  lastLogin     DateTime?
  
  sessions      Session[]
}

model Session {
  id            String   @id @default(cuid())
  userId        String
  token         String   @unique // Random token
  
  expiresAt     DateTime // 7 days from creation
  createdAt     DateTime @default(now())
  
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([token])
  @@index([userId])
  @@index([expiresAt]) // For cleanup of expired sessions
}
```

**Key Design Decisions:**

**Draft/Published Separation:**
- Draft and published content stored separately in same model
- Publishing is atomic operation (update `publishedContent` and `publishedAt`)
- `publishedContent = null` means page never published
- Enables "unpublish" by setting `publishedContent = null`

**JSON for Content:**
- Flexibility - no schema migrations when adding component types
- Fast queries - Prisma handles JSON serialization
- Validation happens at application layer
- Trade-off: Cannot query inside JSON structure efficiently (acceptable for single-user system)

**Asset Metadata in Database:**
- Fast queries without reading files
- Validation before publishing (missing alt text, etc.)
- Easy to generate asset library UI
- File storage can be replaced without database migration

---

## Media Processing

### Image Upload Pipeline

**Goal:** Optimize images for web delivery while maintaining quality

**Pipeline Steps:**

```typescript
async function processImage(input: Buffer): Promise<ProcessedImage> {
  // 1. Load image with Sharp
  let image = sharp(input);
  
  // 2. Strip EXIF data (privacy protection)
  //    Auto-rotate based on EXIF before stripping
  image = image.rotate(); // Reads EXIF orientation, rotates, removes EXIF
  
  // 3. Generate Display Version (max 1920px wide)
  const displayBuffer = await image
    .clone()
    .resize(1920, null, { 
      withoutEnlargement: true, // Don't upscale small images
      fit: 'inside'              // Maintain aspect ratio
    })
    .webp({ quality: 85 })       // WebP for smaller size
    .toBuffer();
  
  // 4. Generate Thumbnail (400x300, cropped)
  const thumbnailBuffer = await image
    .clone()
    .resize(400, 300, { 
      fit: 'cover',              // Crop to exact size
      position: 'centre'         // Center crop (could use focalPoint)
    })
    .webp({ quality: 75 })
    .toBuffer();
  
  // 5. Generate Blur Placeholder (40px, base64)
  const placeholderBuffer = await image
    .clone()
    .resize(40, null)            // Very small
    .blur(20)                    // Heavy blur
    .webp({ quality: 50 })
    .toBuffer();
  
  const placeholder = `data:image/webp;base64,${placeholderBuffer.toString('base64')}`;
  
  // 6. Extract Metadata
  const metadata = await image.metadata();
  
  return {
    display: displayBuffer,
    thumbnail: thumbnailBuffer,
    placeholder,
    width: metadata.width,
    height: metadata.height,
    aspectRatio: metadata.width / metadata.height,
    originalSize: input.length,
    displaySize: displayBuffer.length,
  };
}
```

**Success Criteria:**
- **60-80% size reduction** from original (JPEG → WebP)
- **SSIM quality score >85** (perceptual quality)
- **Upload success rate >98%**
- **Processing time <3s per image**

**Supported Formats:**
- **Input:** JPEG, PNG, WebP, GIF (first frame)
- **Output:** WebP (browser support >95% as of 2024)

**File Size Limits:**
- **Upload:** 10MB maximum
- **Display version:** Target <200KB
- **Thumbnail:** Target <50KB
- **Placeholder:** Always <5KB (base64 inline)

**EXIF Handling:**
- **Strip all EXIF data** - Privacy protection (location, camera model, etc.)
- **Auto-rotate first** - Respects orientation tag before stripping
- **Preserve dimensions** - Width/height stored in database

**Image Versions Strategy:**
- **Display:** For hero images, full-width layouts
- **Thumbnail:** For galleries, previews, asset library
- **Placeholder:** Inline base64 for instant LCP improvement

---

## Security Architecture

### Authentication

**Pattern:** Session-based with secure HTTP-only cookies (NOT JWT)

**Why Sessions Over JWT:**
- **Single-user app** - Stateless auth not needed
- **Simpler revocation** - Delete session row = instant logout
- **No token refresh complexity** - Server manages expiry
- **Smaller cookies** - Session ID vs full JWT payload

**Implementation:**

```typescript
// Password Hashing
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12; // REQUIRED: 12 rounds minimum

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Password Requirements
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  // No special character requirement (per UX best practices)
};
```

**Cookie Configuration:**
```typescript
const SESSION_COOKIE_CONFIG = {
  name: 'session',
  httpOnly: true,        // ✓ REQUIRED: Prevents XSS access to cookie
  secure: true,          // ✓ REQUIRED: HTTPS only (dev: false)
  sameSite: 'strict',    // ✓ REQUIRED: CSRF protection
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  path: '/',
};

// Setting cookie (Next.js API route)
export async function POST(request: Request) {
  // ... validate credentials ...
  
  const session = await createSession(user.id);
  
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Set-Cookie': serialize('session', session.token, SESSION_COOKIE_CONFIG),
    },
  });
}
```

**Session Management:**
```typescript
// Session Creation
async function createSession(userId: string): Promise<Session> {
  const token = generateSecureToken(); // crypto.randomBytes(32)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  return prisma.session.create({
    data: { userId, token, expiresAt },
  });
}

// Session Validation Middleware
export async function requireAuth(request: Request): Promise<User> {
  const token = getTokenFromCookie(request);
  
  if (!token) {
    throw new UnauthorizedError('No session cookie');
  }
  
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  
  if (!session) {
    throw new UnauthorizedError('Invalid session');
  }
  
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    throw new UnauthorizedError('Session expired');
  }
  
  // Refresh session if < 1 day remaining
  if (session.expiresAt.getTime() - Date.now() < 24 * 60 * 60 * 1000) {
    await prisma.session.update({
      where: { id: session.id },
      data: { expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });
  }
  
  return session.user;
}

// Logout
async function logout(token: string): Promise<void> {
  await prisma.session.delete({ where: { token } });
}
```

---

### Content Security Policy

**Published Site CSP (Moderate):**
```typescript
const publishedSiteCSP = {
  'default-src': ["'self'"],
  'img-src': [
    "'self'",
    'data:', // For blur placeholders
    process.env.CDN_URL, // Asset CDN
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind
  ],
  'script-src': [
    "'self'",
  ],
  'font-src': [
    "'self'",
    'fonts.gstatic.com', // Google Fonts (if used)
  ],
  'connect-src': ["'self'"],
  'frame-ancestors': ["'none'"], // Prevent embedding
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};
```

**Admin CSP (Stricter):**
```typescript
const adminCSP = {
  ...publishedSiteCSP,
  'style-src': ["'self'"], // No inline styles in admin
  'script-src': ["'self'"], // No inline scripts in admin
  'img-src': ["'self'", 'data:'], // No external images in admin
};
```

**CSP Header Generation:**
```typescript
export function generateCSPHeader(isAdmin: boolean): string {
  const policy = isAdmin ? adminCSP : publishedSiteCSP;
  
  return Object.entries(policy)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

// Next.js middleware
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  const isAdmin = request.nextUrl.pathname.startsWith('/admin');
  response.headers.set('Content-Security-Policy', generateCSPHeader(isAdmin));
  
  return response;
}
```

---

### Input Sanitization

**HTML Sanitization (User Content):**
```typescript
import DOMPurify from 'isomorphic-dompurify';

// Rich text sanitization (from Tiptap)
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'a', 'strong', 'em', 'u', 's',
      'blockquote', 'ul', 'ol', 'li', 'br',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):)/i, // Only http(s) and mailto
  });
}
```

**File Upload Validation:**
```typescript
export async function validateImageUpload(file: File): Promise<ValidationResult> {
  const errors: string[] = [];
  
  // 1. Check MIME type (client-provided)
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!ALLOWED_TYPES.includes(file.type)) {
    errors.push(`Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF`);
  }
  
  // 2. Check file size (10MB max)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    errors.push(`File too large: ${file.size} bytes. Maximum: ${MAX_SIZE} bytes (10MB)`);
  }
  
  // 3. Verify actual content matches MIME type (prevent type confusion)
  const buffer = await file.arrayBuffer();
  const actualType = await detectImageType(buffer);
  
  if (actualType !== file.type) {
    errors.push(`File content (${actualType}) doesn't match declared type (${file.type})`);
  }
  
  // 4. Check image dimensions
  try {
    const image = sharp(Buffer.from(buffer));
    const metadata = await image.metadata();
    
    // Reject extremely large images (DoS protection)
    const MAX_DIMENSION = 10000; // 10k pixels
    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
      errors.push(`Image dimensions too large: ${metadata.width}x${metadata.height}`);
    }
  } catch (error) {
    errors.push('Invalid image file - cannot process');
  }
  
  return { valid: errors.length === 0, errors };
}

// Magic byte detection
async function detectImageType(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer.slice(0, 12));
  
  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return 'image/jpeg';
  }
  
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return 'image/png';
  }
  
  // WebP: RIFF ... WEBP
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return 'image/webp';
  }
  
  // GIF: GIF87a or GIF89a
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return 'image/gif';
  }
  
  throw new Error('Unknown image type');
}
```

---

## Performance Architecture

### Performance Budgets (Hard Limits)

**These are CI/CD gates - builds fail if exceeded:**

```typescript
const PERFORMANCE_BUDGETS = {
  // Core Web Vitals (Mobile 3G)
  firstContentfulPaint: 1500,     // 1.5s - HARD LIMIT
  largestContentfulPaint: 2500,   // 2.5s - HARD LIMIT
  timeToInteractive: 3500,        // 3.5s - HARD LIMIT
  cumulativeLayoutShift: 0.1,     // 0.1 - HARD LIMIT
  firstInputDelay: 100,           // 100ms - HARD LIMIT
  
  // Bundle Sizes (Gzipped)
  javascriptBundle: 200 * 1024,   // 200KB - HARD LIMIT
  cssBundle: 50 * 1024,           // 50KB - HARD LIMIT
  
  // Page Weight (With Images)
  totalPageWeight: 1024 * 1024,   // 1MB - SOFT LIMIT
  
  // Media Budgets
  heroImage: 200 * 1024,          // 200KB - HARD LIMIT
  thumbnailImage: 50 * 1024,      // 50KB - HARD LIMIT
};
```

**Enforcement (CI/CD Pipeline):**
```typescript
// lighthouse-check.ts
import lighthouse from 'lighthouse';
import { launch } from 'puppeteer';

export async function checkPerformanceBudgets(url: string): Promise<BudgetResult> {
  const browser = await launch();
  
  const { lhr } = await lighthouse(url, {
    port: new URL(browser.wsEndpoint()).port,
    onlyCategories: ['performance'],
    throttling: {
      // Mobile 3G simulation
      rttMs: 150,
      throughputKbps: 1.6 * 1024,
      cpuSlowdownMultiplier: 4,
    },
  });
  
  const violations: Violation[] = [];
  
  // Check FCP
  const fcp = lhr.audits['first-contentful-paint'].numericValue;
  if (fcp > PERFORMANCE_BUDGETS.firstContentfulPaint) {
    violations.push({
      metric: 'FCP',
      actual: fcp,
      budget: PERFORMANCE_BUDGETS.firstContentfulPaint,
    });
  }
  
  // Check LCP
  const lcp = lhr.audits['largest-contentful-paint'].numericValue;
  if (lcp > PERFORMANCE_BUDGETS.largestContentfulPaint) {
    violations.push({
      metric: 'LCP',
      actual: lcp,
      budget: PERFORMANCE_BUDGETS.largestContentfulPaint,
    });
  }
  
  // Check bundle sizes
  const totalJS = lhr.audits['total-byte-weight'].details.items
    .filter(item => item.resourceType === 'Script')
    .reduce((sum, item) => sum + item.transferSize, 0);
  
  if (totalJS > PERFORMANCE_BUDGETS.javascriptBundle) {
    violations.push({
      metric: 'JavaScript Bundle',
      actual: totalJS,
      budget: PERFORMANCE_BUDGETS.javascriptBundle,
    });
  }
  
  return {
    passed: violations.length === 0,
    violations,
    score: lhr.categories.performance.score * 100,
  };
}

// CI/CD usage
const result = await checkPerformanceBudgets(deploymentUrl);
if (!result.passed) {
  console.error('Performance budget violations:', result.violations);
  process.exit(1); // Fail the build
}
```

---

### Image Optimization Strategy

**1. WebP Format (30% smaller than JPEG)**
```typescript
// All images converted to WebP during upload
const displayBuffer = await sharp(input)
  .webp({ quality: 85 })
  .toBuffer();
```

**2. Responsive Images (Serve appropriate size)**
```tsx
<img
  src={asset.displayUrl}
  srcSet={`
    ${asset.thumbnailUrl} 400w,
    ${asset.displayUrl} 1920w
  `}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  alt={asset.altText}
  loading="lazy"
/>
```

**3. Lazy Loading (Load as they enter viewport)**
```typescript
export function LazyImage({ src, alt, ...props }: ImageProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' } // Start loading 50px before visible
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <img
      ref={imgRef}
      src={isIntersecting ? src : undefined}
      data-src={src}
      alt={alt}
      loading="lazy"
      {...props}
    />
  );
}
```

**4. Placeholder Blur (Fast perceived load)**
```tsx
export function ImageWithPlaceholder({ asset }: Props) {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <div className="relative">
      {/* Blur placeholder (inline base64, instant) */}
      <img
        src={asset.placeholderUrl}
        alt=""
        className="absolute inset-0 w-full h-full blur-xl"
        style={{ opacity: loaded ? 0 : 1, transition: 'opacity 300ms' }}
      />
      
      {/* Actual image */}
      <img
        src={asset.displayUrl}
        alt={asset.altText}
        onLoad={() => setLoaded(true)}
        className="relative z-10"
      />
    </div>
  );
}
```

**5. CDN Delivery (Edge caching)**
```typescript
// S3 + CloudFront pattern
const cdnUrl = `https://cdn.example.com/${asset.path}`;

// Cache-Control headers
response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
```

---

## Mobile Architecture

### Touch Interaction Patterns

**Requirements (Apple Human Interface Guidelines):**
- **44px minimum touch target size** - REQUIRED for accessibility
- **150ms long-press delay** - Prevents accidental drags, allows scrolling
- **8px tolerance** - Allows small movements before drag starts
- **Haptic feedback** - For snap points and actions (iOS)

**Gesture Mappings:**
```typescript
const GESTURES = {
  // Component manipulation
  'long-press + drag': 'Reorder sections/components',
  'tap': 'Select/edit component',
  'double-tap': 'Enter quick edit mode',
  
  // Navigation
  'swipe-left': 'Next page (page list)',
  'swipe-right': 'Previous page (page list)',
  
  // Preview
  'pinch-zoom': 'Scale preview (disabled in edit mode)',
  
  // Toolbar
  'long-press (toolbar)': 'Show component info',
  'drag (toolbar)': 'Add component to canvas',
};
```

**Mobile-Specific CSS:**
```css
/* Prevent iOS zoom on input focus */
input, textarea, select {
  font-size: 16px; /* Minimum to prevent zoom */
}

/* Smooth scrolling */
.scroll-container {
  -webkit-overflow-scrolling: touch;
}

/* Disable text selection during drag */
.dragging {
  user-select: none;
  -webkit-user-select: none;
}

/* Prevent pull-to-refresh during drag */
.drag-active {
  overscroll-behavior: none;
}

/* Touch target size enforcement */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}
```

**Haptic Feedback (iOS):**
```typescript
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'medium') {
  if ('vibrate' in navigator) {
    const duration = { light: 5, medium: 10, heavy: 15 };
    navigator.vibrate(duration[type]);
  }
}

// Usage: When component snaps to grid
onDragEnd={(event) => {
  const snappedPosition = snapToGrid(event.position);
  updateComponentPosition(snappedPosition);
  triggerHaptic('light'); // Feedback on snap
}}
```

---

### Progressive Web App (PWA) Configuration

**Manifest:**
```json
{
  "name": "Portfolio Builder",
  "short_name": "Portfolio",
  "description": "Create beautiful portfolio websites on mobile",
  "start_url": "/admin",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

**Service Worker (Offline Support):**
```typescript
// service-worker.ts
const CACHE_NAME = 'portfolio-v1';
const STATIC_ASSETS = [
  '/',
  '/admin',
  '/offline.html',
  '/manifest.json',
];

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          
          // Show offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          
          throw new Error('Network and cache failed');
        });
      })
  );
});

// Background sync for uploads
self.addEventListener('sync', (event) => {
  if (event.tag === 'upload-queue') {
    event.waitUntil(processUploadQueue());
  }
});
```

---

## Validation & Publishing

### Accessibility Publishing Gates

**CANNOT PUBLISH if any of these errors exist:**

```typescript
interface PublishValidation {
  canPublish: boolean;
  errors: ValidationError[];   // MUST fix before publishing
  warnings: ValidationWarning[]; // Should fix, but not blocking
}

// Validation rules
const PUBLISHING_RULES = {
  // Images
  'missing-alt-text': {
    level: 'error',
    message: 'All images must have alt text or be marked decorative',
    check: (component) => {
      if (component.type === 'image' || component.type === 'gallery') {
        return component.props.images.every(img => 
          img.altText || img.decorative === true
        );
      }
      return true;
    },
  },
  
  // Headings
  'broken-heading-hierarchy': {
    level: 'error',
    message: 'Heading hierarchy cannot skip levels (e.g., h1 → h3)',
    check: (page) => {
      const headings = extractHeadings(page.draftContent);
      return validateHeadingHierarchy(headings);
    },
  },
  
  // Contrast
  'insufficient-contrast': {
    level: 'error',
    message: 'Text contrast must meet WCAG AA (4.5:1 normal, 3:1 large)',
    check: (theme) => {
      const textContrast = getContrast(theme.colors.text, theme.colors.background);
      return textContrast >= 4.5;
    },
  },
  
  // Forms (if component exists)
  'unlabeled-form-inputs': {
    level: 'error',
    message: 'All form inputs must have associated labels',
    check: (component) => {
      if (component.type === 'contact-form') {
        return component.props.fields.every(field => field.label);
      }
      return true;
    },
  },
  
  // Page metadata
  'missing-page-title': {
    level: 'error',
    message: 'Page must have a title',
    check: (page) => page.title && page.title.trim().length > 0,
  },
  
  // Keyboard navigation
  'broken-focus-order': {
    level: 'error',
    message: 'Interactive elements must have logical tab order',
    check: (page) => validateTabOrder(page.draftContent),
  },
};

// Warning rules (non-blocking)
const WARNING_RULES = {
  'missing-meta-description': {
    level: 'warning',
    message: 'Page should have meta description for SEO',
    impact: 'SEO only',
  },
  
  'verbose-alt-text': {
    level: 'warning',
    message: 'Alt text longer than 125 characters may be too verbose',
    impact: 'Screen reader UX',
  },
  
  'very-long-page': {
    level: 'warning',
    message: 'Page has >5000px height without internal navigation',
    impact: 'User experience',
  },
};
```

**Implementation:**
```typescript
export async function validateForPublishing(page: Page): Promise<PublishValidation> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Load theme
  const site = await prisma.site.findUnique({ where: { id: page.siteId } });
  const theme = await loadTheme(site.theme);
  
  // Check all error rules
  for (const [ruleId, rule] of Object.entries(PUBLISHING_RULES)) {
    const passed = await rule.check(page, theme);
    if (!passed) {
      errors.push({
        ruleId,
        level: 'error',
        message: rule.message,
        page: page.slug,
      });
    }
  }
  
  // Check warning rules
  for (const [ruleId, rule] of Object.entries(WARNING_RULES)) {
    const passed = await rule.check(page, theme);
    if (!passed) {
      warnings.push({
        ruleId,
        level: 'warning',
        message: rule.message,
        impact: rule.impact,
        page: page.slug,
      });
    }
  }
  
  return {
    canPublish: errors.length === 0,
    errors,
    warnings,
  };
}

// Publishing flow
export async function publishPage(pageId: string): Promise<PublishResult> {
  const page = await prisma.page.findUnique({ where: { id: pageId } });
  
  // Validate
  const validation = await validateForPublishing(page);
  
  if (!validation.canPublish) {
    return {
      success: false,
      errors: validation.errors,
      message: 'Cannot publish: accessibility errors must be fixed',
    };
  }
  
  // Publish (atomic operation)
  await prisma.page.update({
    where: { id: pageId },
    data: {
      publishedContent: page.draftContent,
      publishedAt: new Date(),
    },
  });
  
  return {
    success: true,
    warnings: validation.warnings,
    message: 'Page published successfully',
  };
}
```

**Validation UI:**
```tsx
export function PublishButton({ pageId }: Props) {
  const [validation, setValidation] = useState<PublishValidation | null>(null);
  
  const handleValidate = async () => {
    const result = await validateForPublishing(pageId);
    setValidation(result);
  };
  
  const handlePublish = async () => {
    if (!validation?.canPublish) return;
    
    await publishPage(pageId);
    toast.success('Page published!');
  };
  
  return (
    <div>
      <Button onClick={handleValidate}>Check for Issues</Button>
      
      {validation && (
        <ValidationPanel>
          {validation.errors.length > 0 && (
            <ErrorList>
              {validation.errors.map(error => (
                <ErrorItem key={error.ruleId}>
                  ❌ {error.message}
                </ErrorItem>
              ))}
            </ErrorList>
          )}
          
          {validation.warnings.length > 0 && (
            <WarningList>
              {validation.warnings.map(warning => (
                <WarningItem key={warning.ruleId}>
                  ⚠️ {warning.message} (Impact: {warning.impact})
                </WarningItem>
              ))}
            </WarningList>
          )}
          
          <Button
            onClick={handlePublish}
            disabled={!validation.canPublish}
          >
            {validation.canPublish ? 'Publish Page' : 'Fix Errors to Publish'}
          </Button>
        </ValidationPanel>
      )}
    </div>
  );
}
```

---

## Error Handling & Edge Cases

### Network Resilience

**Poor Connection Handling:**
```typescript
// Retry with exponential backoff
async function uploadWithRetry(
  file: File,
  maxRetries = 3
): Promise<string> {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return await uploadFile(file);
    } catch (error) {
      attempt++;
      
      if (attempt >= maxRetries) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Upload queue (background sync)
class UploadQueue {
  private queue: QueueItem[] = [];
  private processing = false;
  
  async add(file: File): Promise<void> {
    this.queue.push({ file, status: 'pending' });
    this.processQueue();
  }
  
  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;
    
    while (this.queue.length > 0) {
      const item = this.queue[0];
      
      try {
        item.status = 'uploading';
        const url = await uploadWithRetry(item.file);
        item.status = 'completed';
        item.url = url;
        this.queue.shift(); // Remove from queue
      } catch (error) {
        item.status = 'failed';
        item.error = error.message;
        // Keep in queue for retry later
      }
    }
    
    this.processing = false;
  }
}
```

**Session Expiry Detection:**
```typescript
// API wrapper that detects expiry
async function apiCall(endpoint: string, options: RequestInit) {
  const response = await fetch(endpoint, options);
  
  if (response.status === 401) {
    // Session expired
    const pendingChanges = hasPendingChanges();
    
    if (pendingChanges) {
      // Save to IndexedDB
      await savePendingChanges();
      
      // Show modal
      showModal({
        title: 'Session Expired',
        message: 'Your session has expired. Log in to save your changes.',
        actions: [
          { label: 'Log In', onClick: () => redirectToLogin() },
        ],
      });
    } else {
      redirectToLogin();
    }
  }
  
  return response;
}
```

---

### Content Recovery

**Auto-save (Every 30s):**
```typescript
export function useAutoSave(pageId: string) {
  const [content, setContent] = useState<PageContent | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  useEffect(() => {
    if (!content) return;
    
    const interval = setInterval(async () => {
      try {
        await saveDraft(pageId, content);
        setLastSaved(new Date());
        
        // Also save to IndexedDB as backup
        await saveToIndexedDB(pageId, content);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [content, pageId]);
  
  return { lastSaved, setContent };
}
```

**Browser Crash Recovery:**
```typescript
// On app load
export async function checkForRecovery(pageId: string): Promise<RecoveryData | null> {
  const saved = await getFromIndexedDB(pageId);
  const server = await fetchDraft(pageId);
  
  if (saved && saved.timestamp > server.updatedAt) {
    return {
      hasRecovery: true,
      localContent: saved.content,
      localTimestamp: saved.timestamp,
      serverTimestamp: server.updatedAt,
    };
  }
  
  return null;
}

// Recovery UI
export function RecoveryPrompt({ pageId }: Props) {
  const [recovery, setRecovery] = useState<RecoveryData | null>(null);
  
  useEffect(() => {
    checkForRecovery(pageId).then(setRecovery);
  }, [pageId]);
  
  if (!recovery?.hasRecovery) return null;
  
  return (
    <Modal>
      <h2>Unsaved Changes Found</h2>
      <p>
        We found changes from {formatTimestamp(recovery.localTimestamp)} that weren't saved to the server.
      </p>
      <div className="actions">
        <Button onClick={() => restoreContent(recovery.localContent)}>
          Restore Changes
        </Button>
        <Button variant="secondary" onClick={() => dismissRecovery(pageId)}>
          Discard
        </Button>
      </div>
    </Modal>
  );
}
```

**Undo/Redo:**
```typescript
export function useHistory<T>(initial: T, maxHistory = 10) {
  const [history, setHistory] = useState<T[]>([initial]);
  const [index, setIndex] = useState(0);
  
  const current = history[index];
  
  const push = (state: T) => {
    // Remove any history after current index
    const newHistory = history.slice(0, index + 1);
    newHistory.push(state);
    
    // Keep only last maxHistory items
    if (newHistory.length > maxHistory) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setIndex(newHistory.length - 1);
  };
  
  const undo = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };
  
  const redo = () => {
    if (index < history.length - 1) {
      setIndex(index + 1);
    }
  };
  
  const canUndo = index > 0;
  const canRedo = index < history.length - 1;
  
  return { current, push, undo, redo, canUndo, canRedo };
}
```

---

### Large Content Handling

**100+ Image Upload (Batch Processing):**
```typescript
export function useBatchUpload(maxConcurrent = 3) {
  const [queue, setQueue] = useState<File[]>([]);
  const [uploading, setUploading] = useState<Map<string, UploadProgress>>(new Map());
  
  const addFiles = (files: File[]) => {
    setQueue(prev => [...prev, ...files]);
  };
  
  useEffect(() => {
    if (queue.length === 0) return;
    
    const activeUploads = Array.from(uploading.values())
      .filter(p => p.status === 'uploading').length;
    
    if (activeUploads >= maxConcurrent) return;
    
    const file = queue[0];
    const fileId = generateId();
    
    setQueue(prev => prev.slice(1));
    setUploading(prev => new Map(prev).set(fileId, {
      file: file.name,
      status: 'uploading',
      progress: 0,
    }));
    
    uploadFile(file, {
      onProgress: (progress) => {
        setUploading(prev => {
          const next = new Map(prev);
          next.set(fileId, { ...next.get(fileId), progress });
          return next;
        });
      },
    }).then(() => {
      setUploading(prev => {
        const next = new Map(prev);
        next.set(fileId, { ...next.get(fileId), status: 'completed' });
        return next;
      });
    }).catch((error) => {
      setUploading(prev => {
        const next = new Map(prev);
        next.set(fileId, { ...next.get(fileId), status: 'failed', error });
        return next;
      });
    });
  }, [queue, uploading, maxConcurrent]);
  
  return {
    addFiles,
    queue: queue.length,
    uploading: Array.from(uploading.values()),
  };
}
```

**50+ Page Portfolio (Virtual Scrolling):**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

export function PageList({ pages }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: pages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated item height
    overscan: 5, // Render 5 items outside viewport
  });
  
  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const page = pages[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <PageListItem page={page} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## Deployment Architecture

### Development Environment

```bash
# Local development setup
git clone <repo>
cd portfolio-builder

# Install dependencies
npm install

# Set up database
cp .env.example .env.local
# Edit .env.local:
#   DATABASE_URL="file:./data/dev.db"
#   NODE_ENV="development"

# Initialize database
npx prisma migrate dev

# Start dev server
npm run dev
# → http://localhost:4000
```

**Local Stack:**
- **Database:** SQLite at `./data/dev.db`
- **File Storage:** Local filesystem at `./uploads`
- **Port:** 4000 (avoid conflicts with other projects)
- **Hot Reload:** Full Next.js fast refresh

---

### Production Environment

```yaml
# docker-compose.yml or similar
version: '3.8'

services:
  app:
    image: portfolio-builder:latest
    ports:
      - "3000:3000"
    environment:
      # Database
      DATABASE_PROVIDER: postgresql
      DATABASE_URL: postgresql://user:pass@db:5432/portfolio
      
      # Storage
      STORAGE_PROVIDER: s3
      S3_BUCKET: portfolio-assets
      S3_REGION: us-east-1
      S3_ACCESS_KEY_ID: ${S3_ACCESS_KEY}
      S3_SECRET_ACCESS_KEY: ${S3_SECRET}
      CDN_URL: https://cdn.example.com
      
      # Auth
      SESSION_SECRET: ${SESSION_SECRET}
      
      # Environment
      NODE_ENV: production
      NEXT_PUBLIC_APP_URL: https://portfolio.example.com
    
    depends_on:
      - db
  
  db:
    image: postgres:14
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: portfolio

volumes:
  postgres_data:
```

**Production Checklist:**
- [ ] PostgreSQL database configured
- [ ] S3-compatible storage configured
- [ ] CDN for asset delivery (optional but recommended)
- [ ] HTTPS certificate (Let's Encrypt)
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Performance budgets passing
- [ ] Security headers configured

---

## Testing Strategy

### Testing Pyramid

**60% Unit Tests** - Fast, isolated, test business logic
**30% Integration Tests** - Test component interactions
**10% End-to-End Tests** - Test critical user journeys

### Unit Test Example

```typescript
// components/validation.test.ts
import { validateForPublishing } from './validation';

describe('Publishing Validation', () => {
  it('should require alt text for images', async () => {
    const page = {
      draftContent: {
        components: {
          'img-1': {
            type: 'image',
            props: { url: '/test.jpg', altText: '' }
          }
        }
      }
    };
    
    const result = await validateForPublishing(page);
    
    expect(result.canPublish).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        ruleId: 'missing-alt-text',
        level: 'error'
      })
    );
  });
  
  it('should allow decorative images without alt text', async () => {
    const page = {
      draftContent: {
        components: {
          'img-1': {
            type: 'image',
            props: { url: '/test.jpg', decorative: true }
          }
        }
      }
    };
    
    const result = await validateForPublishing(page);
    
    expect(result.canPublish).toBe(true);
  });
});
```

### E2E Test Example

```typescript
// e2e/publish-flow.spec.ts
import { test, expect } from '@playwright/test';

test('should publish page with validation', async ({ page }) => {
  // Login
  await page.goto('/admin/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'testpassword');
  await page.click('button[type="submit"]');
  
  // Navigate to page editor
  await page.goto('/admin/pages/home');
  
  // Add image without alt text
  await page.click('[data-testid="add-image"]');
  await page.setInputFiles('input[type="file"]', 'test-image.jpg');
  
  // Try to publish (should fail)
  await page.click('[data-testid="publish-button"]');
  
  // Should show validation error
  await expect(page.locator('.validation-error')).toContainText('alt text');
  
  // Add alt text
  await page.fill('[data-testid="alt-text-input"]', 'Test image description');
  
  // Publish again (should succeed)
  await page.click('[data-testid="publish-button"]');
  await expect(page.locator('.success-message')).toBeVisible();
  
  // Verify published
  const publishedIndicator = page.locator('[data-testid="published-status"]');
  await expect(publishedIndicator).toContainText('Published');
});
```

---

## References & Related Documents

### Archived Specifications (Complete Technical Details)

For historical context and deep implementation details, see:

- **`archive/portfolio-tech-strategy.md`** - Original 1164-line technical deep-dive
- **`archive/work-packages/foundation/tech-decisions.md`** - Technology selection rationale
- **`archive/work-packages/spikes/`** - Evaluation reports and proof-of-concepts:
  - `spike-dndkit.md` - dnd-kit evaluation (ACCEPTED)
  - `spike-craftjs.md` - Craft.js evaluation (REJECTED)
  - `spike-builderio.md` - Builder.io evaluation (REJECTED)

### Current Planning Documents

- **`plans/VISION.md`** - Product vision and design principles
- **`plans/USERS.md`** - User personas and usage scenarios
- **`plans/IMPLEMENTATION_APPROACH.md`** - Vertical slice methodology

---

## Document Status

**This document is the authoritative source for technical architecture.**

When this document conflicts with content in `archive/`, this document takes precedence. The archive is maintained for historical context only.

**Last Updated:** 2025-12-28  
**Status:** Active  
**Version:** 1.0
