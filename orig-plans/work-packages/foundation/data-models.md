# Foundation: Data Models

This document defines the database schema (Prisma) and TypeScript interfaces for the portfolio builder.

## Database Schema (Prisma)

### Configuration

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"  // Use "postgresql" for production
  url      = env("DATABASE_URL")
}
```

### User & Authentication

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // Hashed with bcrypt
  name      String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  lastLogin DateTime?

  sessions  Session[]
  sites     Site[]
}

model Session {
  id        String   @id @default(cuid())
  token     String   @unique

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  userAgent String?
  ipAddress String?

  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([token])
  @@index([userId])
}
```

### Site & Pages

```prisma
model Site {
  id           String   @id @default(cuid())

  // Ownership
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Basic info
  title        String
  tagline      String?
  slug         String   @unique  // URL-safe identifier

  // Theme
  themeId      String   @default("modern-minimal")

  // Settings stored as JSON
  settings     String   @default("{}")  // SiteSettings JSON

  // Timestamps
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  publishedAt  DateTime?

  // Relations
  pages        Page[]
  assets       Asset[]

  @@index([userId])
  @@index([slug])
}

model Page {
  id           String   @id @default(cuid())

  // Parent site
  siteId       String
  site         Site     @relation(fields: [siteId], references: [id], onDelete: Cascade)

  // Page info
  title        String
  slug         String   // URL path segment
  description  String?

  // Content (JSON)
  draftContent    String  @default("{}")  // PageContent JSON - current editing state
  publishedContent String? // PageContent JSON - live content (null if never published)

  // Page settings
  template     String?  // Template ID used to create page
  isHomepage   Boolean  @default(false)
  inNavigation Boolean  @default(true)
  navOrder     Int      @default(0)

  // Hierarchy
  parentId     String?
  parent       Page?    @relation("PageHierarchy", fields: [parentId], references: [id])
  children     Page[]   @relation("PageHierarchy")

  // SEO metadata as JSON
  metadata     String   @default("{}")  // PageMetadata JSON

  // Timestamps
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  publishedAt  DateTime?

  @@unique([siteId, slug])
  @@index([siteId])
  @@index([siteId, isHomepage])
}
```

### Assets

```prisma
model Asset {
  id           String   @id @default(cuid())

  // Parent site
  siteId       String
  site         Site     @relation(fields: [siteId], references: [id], onDelete: Cascade)

  // File info
  filename     String   // Original filename
  mimeType     String
  size         Int      // Bytes

  // Processed versions (URLs or paths)
  originalUrl  String?  // Full resolution (optional, for download)
  displayUrl   String   // Optimized for viewing (max 1920px)
  thumbnailUrl String   // Gallery thumbnail (400x300)
  placeholder  String   // Base64 blur placeholder

  // Dimensions
  width        Int
  height       Int

  // User-provided metadata
  altText      String?
  caption      String?

  // Processing metadata as JSON
  metadata     String   @default("{}")  // AssetMetadata JSON

  // Timestamps
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([siteId])
}
```

## TypeScript Interfaces

### Site Settings

```typescript
// src/types/site.ts

interface SiteSettings {
  // Contact
  contactEmail?: string;

  // Social links
  socialLinks?: {
    platform: 'instagram' | 'twitter' | 'linkedin' | 'behance' | 'dribbble';
    url: string;
  }[];

  // Privacy
  visibility: 'public' | 'password' | 'private';
  password?: string;  // Hashed, for password-protected sites

  // Analytics
  analytics?: {
    googleAnalyticsId?: string;
  };

  // Custom domain (future)
  customDomain?: string;
}
```

### Page Content

Based on the dnd-kit spike serialization format:

```typescript
// src/types/content.ts

interface PageContent {
  version: '1.0';

  // Sections are droppable zones
  sections: {
    [sectionId: string]: Section;
  };

  // Components stored flat, referenced by ID
  components: {
    [componentId: string]: Component;
  };
}

interface Section {
  id: string;
  title: string;
  componentIds: string[];  // Ordered list of component IDs in this section
}

interface Component {
  id: string;
  type: ComponentType;
  props: ComponentProps;
}

type ComponentType =
  | 'text'
  | 'image'
  | 'gallery'
  | 'spacer'
  | 'button'
  | 'video'
  | 'contact-form';

// Union of all component prop types
type ComponentProps =
  | TextBlockProps
  | ImageProps
  | GalleryProps
  | SpacerProps
  | ButtonProps
  | VideoProps
  | ContactFormProps;
```

### Component Props

```typescript
// src/types/components.ts

interface TextBlockProps {
  content: string;  // HTML from Tiptap
  alignment?: 'left' | 'center' | 'right';
}

interface ImageProps {
  assetId: string;  // Reference to Asset
  altText: string;
  caption?: string;
  link?: string;
  aspectRatio?: 'original' | '1:1' | '4:3' | '16:9' | '3:2';
}

interface GalleryProps {
  assetIds: string[];  // Ordered list of Asset IDs
  layout: 'grid' | 'carousel' | 'masonry';
  columns?: 2 | 3 | 4 | 5 | 6;
  gap?: 'tight' | 'normal' | 'loose';

  // Carousel-specific
  autoplay?: boolean;
  autoplayInterval?: number;  // Seconds
  showIndicators?: boolean;
  showArrows?: boolean;
}

interface SpacerProps {
  height: 'sm' | 'md' | 'lg' | 'xl';
}

interface ButtonProps {
  text: string;
  link: string;
  style: 'primary' | 'secondary' | 'outline';
  alignment?: 'left' | 'center' | 'right';
}

interface VideoProps {
  url: string;  // YouTube or Vimeo URL
  aspectRatio?: '16:9' | '4:3' | '1:1';
  autoplay?: boolean;
}

interface ContactFormProps {
  recipientEmail: string;
  fields: ('name' | 'email' | 'phone' | 'message')[];
  submitText?: string;
  successMessage?: string;
}
```

### Page Metadata

```typescript
// src/types/metadata.ts

interface PageMetadata {
  // SEO
  metaTitle?: string;       // Falls back to page title
  metaDescription?: string; // Falls back to page description

  // Open Graph
  ogImage?: string;  // Asset URL
  ogTitle?: string;
  ogDescription?: string;

  // Indexing
  noIndex?: boolean;
  canonicalUrl?: string;
}
```

### Asset Metadata

```typescript
// src/types/asset.ts

interface AssetMetadata {
  // Image info
  format: string;  // 'jpeg' | 'png' | 'webp' | 'gif'
  aspectRatio: number;

  // Dominant color (for placeholders)
  dominantColor?: string;  // Hex color

  // Focal point for smart cropping
  focalPoint?: {
    x: number;  // 0-1, left to right
    y: number;  // 0-1, top to bottom
  };

  // Original EXIF (stripped from output, kept for reference)
  originalWidth?: number;
  originalHeight?: number;
  originalSize?: number;  // Bytes before optimization
}
```

### User-Facing Types

```typescript
// src/types/index.ts

// Re-export all types
export * from './site';
export * from './content';
export * from './components';
export * from './metadata';
export * from './asset';

// Hydrated types (with relations resolved)
interface SiteWithPages {
  id: string;
  title: string;
  tagline: string | null;
  slug: string;
  themeId: string;
  settings: SiteSettings;
  pages: PageSummary[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

interface PageSummary {
  id: string;
  title: string;
  slug: string;
  isHomepage: boolean;
  inNavigation: boolean;
  navOrder: number;
  publishedAt: Date | null;
}

interface PageWithContent {
  id: string;
  siteId: string;
  title: string;
  slug: string;
  description: string | null;
  draftContent: PageContent;
  publishedContent: PageContent | null;
  isHomepage: boolean;
  inNavigation: boolean;
  metadata: PageMetadata;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}
```

## Database Utilities

### JSON Field Helpers

Since SQLite stores JSON as strings, create helpers:

```typescript
// src/lib/db-helpers.ts

import { PageContent, SiteSettings, PageMetadata, AssetMetadata } from '@/types';

// Parse JSON fields from database
export function parsePageContent(json: string): PageContent {
  const parsed = JSON.parse(json);
  // Validate version
  if (parsed.version !== '1.0') {
    throw new Error(`Unsupported content version: ${parsed.version}`);
  }
  return parsed;
}

export function parseSiteSettings(json: string): SiteSettings {
  return JSON.parse(json);
}

export function parsePageMetadata(json: string): PageMetadata {
  return JSON.parse(json);
}

export function parseAssetMetadata(json: string): AssetMetadata {
  return JSON.parse(json);
}

// Stringify for database storage
export function stringifyPageContent(content: PageContent): string {
  return JSON.stringify(content);
}

export function stringifySiteSettings(settings: SiteSettings): string {
  return JSON.stringify(settings);
}

// Default empty content
export function emptyPageContent(): PageContent {
  return {
    version: '1.0',
    sections: {
      main: {
        id: 'main',
        title: 'Main Content',
        componentIds: [],
      },
    },
    components: {},
  };
}
```

### ID Generation

```typescript
// src/lib/id.ts

// Generate unique IDs for components
export function generateComponentId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Generate URL-safe slugs
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
```

## Seed Data

For development and testing, create seed data matching user scenarios:

```typescript
// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Test users from user-success-scenarios.md
  const users = [
    {
      email: 'sarah.chen@test.costume.design',
      password: 'TheatrePro2024!',
      name: 'Sarah Chen',
    },
    {
      email: 'marcus.williams@test.costume.design',
      password: 'FirstPortfolio2024!',
      name: 'Marcus Williams',
    },
    {
      email: 'emma.rodriguez@test.costume.design',
      password: 'FilmVeteran2024!',
      name: 'Emma Rodriguez',
    },
    {
      email: 'test@costume.design',
      password: 'TestUser2024!',
      name: 'Test User',
    },
  ];

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
      },
    });
  }

  console.log('Seed data created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Migration Commands

```bash
# Generate migration after schema changes
npx prisma migrate dev --name <migration_name>

# Apply migrations
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio
```

## Package.json Scripts

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:reset": "prisma migrate reset",
    "db:studio": "prisma studio"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

## Deliverables Checklist

When implementing data models, ensure:

- [ ] Prisma schema created at `prisma/schema.prisma`
- [ ] All TypeScript interfaces in `src/types/`
- [ ] JSON helper functions in `src/lib/db-helpers.ts`
- [ ] ID generation utilities in `src/lib/id.ts`
- [ ] Seed script at `prisma/seed.ts`
- [ ] Initial migration generated
- [ ] Test users can be seeded successfully
- [ ] Prisma Client generates without errors
