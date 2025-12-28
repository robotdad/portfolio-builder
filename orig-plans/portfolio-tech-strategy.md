# Technical Strategy Document

## Architecture Philosophy

### Core Principles
- **Hosted Web Application**: Single deployable application serving both admin interface and published sites
- **Local-first, host-ready**: Runs fully local (SQLite + filesystem) with the same codepaths toggled for hosting later (DB/storage behind adapters).
- **Explicit Publishing Model**: Draft and published states are separate; publish is an atomic operation
- **DOM Parity Requirement**: Editor and published site use identical React components - no divergent renderers
- **Component-Driven Development**: Self-contained, reusable components with clear interfaces and predictable behavior
- **Mobile-First Technical Approach**: All technical decisions must support excellent mobile editing experiences
- **Leverage Proven Open Source**: Use established libraries with active communities rather than building custom solutions

---

## Core Technology Stack

### Frontend Framework: Next.js + React
**Rationale**: Server-side rendering for performance, excellent developer experience, built-in image optimization, strong ecosystem support for required libraries.

**Key Capabilities Utilized**:
- Server-side rendering for published portfolio pages (SEO-critical)
- Client-side interactivity for admin editing interface
- API routes for backend functionality
- Built-in image optimization pipeline
- Middleware for authentication
- Static generation for published pages

**Architecture Pattern**:
```typescript
// Shared component used by both editor and published site
export function GalleryComponent({ data, isEditing = false }: GalleryProps) {
  // Same component, different interaction modes
  return isEditing ? <EditableGallery {...data} /> : <StaticGallery {...data} />;
}
```

### WYSIWYG Page Builder Strategy

**Critical Requirements**:
- Mobile drag-and-drop support with touch gestures
- Stable serialization format
- Theme integration capability
- TypeScript support
- Active maintenance

**Evaluation Required in Phase 1** (Technical Spike):

**Option 1: Craft.js**
- Pros: React-native, good abstractions, designed for page builders
- Cons: Last release May 2023, smaller community
- Mobile support: Uncertain, needs testing

**Option 2: Builder.io SDK**
- Pros: Active development, proven mobile support, visual editing
- Cons: Heavier bundle, may be over-engineered for our needs
- Mobile support: Excellent

**Option 3: Custom with dnd-kit**
- Pros: Full control, modern library, touch-first
- Cons: More development effort, no built-in page builder features
- Mobile support: Excellent

**Evaluation Criteria**:
```typescript
interface BuilderRequirements {
  mobileTouch: boolean;        // Touch drag-and-drop
  serialization: boolean;      // Stable JSON format
  performance: boolean;        // <100ms interaction
  themeable: boolean;          // CSS variable support
  typescript: boolean;         // Type safety
  maintained: boolean;         // Active development
}
```

### Theme System: Tailwind CSS + Design Token Architecture
**Rationale**: Utility-first CSS framework enables rapid theme development while design tokens ensure consistency.

**Theme Structure**:
```typescript
interface PortfolioTheme {
  id: string;
  name: string;
  preview: string; // Screenshot URL
  
  // Component support matrix
  components: {
    [componentType: string]: {
      supported: boolean;
      fallback?: string; // Component type to use instead
      config?: ComponentConfig;
    }
  };
  
  // Design tokens
  tokens: {
    colors: {
      primary: ColorScale;
      secondary: ColorScale;
      neutral: ColorScale;
      // Semantic colors
      background: string;
      surface: string;
      text: string;
      textMuted: string;
      border: string;
    };
    typography: {
      fonts: {
        heading: string;
        body: string;
        mono: string;
      };
      scale: ResponsiveScale; // Mobile and desktop sizes
      weight: WeightScale;
      lineHeight: LineHeightScale;
    };
    spacing: SpacingScale; // 4px base unit
    layout: {
      maxWidth: string;
      gridColumns: 12 | 16 | 24;
      breakpoints: Breakpoints;
    };
    animation: {
      duration: DurationScale;
      easing: EasingFunctions;
    };
  };
  
  // Accessibility requirements
  a11y: {
    minContrastRatio: number; // 4.5 for AA
    minTouchTarget: number; // 44px
    focusIndicator: FocusStyle;
  };
}
```

**Token Validation**:
```typescript
function validateThemeTokens(theme: PortfolioTheme): ValidationResult {
  const errors = [];
  
  // Check contrast ratios
  const textContrast = getContrast(theme.tokens.colors.text, theme.tokens.colors.background);
  if (textContrast < theme.a11y.minContrastRatio) {
    errors.push(`Text contrast ${textContrast} below minimum ${theme.a11y.minContrastRatio}`);
  }
  
  // Validate responsive scales
  if (!theme.tokens.typography.scale.mobile || !theme.tokens.typography.scale.desktop) {
    errors.push('Missing responsive typography scales');
  }
  
  return { valid: errors.length === 0, errors };
}
```

### UI Component Library: shadcn/ui (Radix + Tailwind)
**Rationale**: Accessible primitives with complete styling control, copy-paste integration, TypeScript support.

**Required Components**:
- Dialog/Modal (image lightbox, settings)
- Dropdown Menu (component options)
- Toggle (publishing, settings)
- Toast (notifications)
- Tooltip (help text)
- Form (accessible inputs)
- Tabs (settings organization)
- Alert (validation messages)

### Image Processing: Sharp.js
**Rationale**: High-performance Node.js image processing with comprehensive format support.

**Processing Pipeline**:
```typescript
interface ImagePipeline {
  async process(input: Buffer, metadata: ImageMetadata): Promise<ProcessedImageSet> {
    const sharp = Sharp(input);
    
    // Strip EXIF data for privacy
    sharp.rotate(); // Auto-rotate based on EXIF
    
    return {
      // Original for download (optional)
      original: await sharp
        .jpeg({ quality: 90, progressive: true })
        .toBuffer(),
        
      // Display version (max 1920px wide)
      display: await sharp
        .resize(1920, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality: 85 })
        .toBuffer(),
        
      // Gallery thumbnail (400x300)
      thumbnail: await sharp
        .resize(400, 300, { 
          fit: 'cover',
          position: metadata.focalPoint || 'centre'
        })
        .webp({ quality: 75 })
        .toBuffer(),
        
      // Blur placeholder (40px wide, base64)
      placeholder: await sharp
        .resize(40)
        .blur(20)
        .webp({ quality: 50 })
        .toBuffer()
        .then(buf => `data:image/webp;base64,${buf.toString('base64')}`),
        
      // Metadata for storage
      metadata: {
        width: metadata.width,
        height: metadata.height,
        aspectRatio: metadata.width / metadata.height,
        format: metadata.format,
        size: input.length,
        dominantColor: await sharp.stats().then(s => s.dominant)
      }
    };
  }
}
```

### Database: PostgreSQL + Prisma ORM
**Rationale**: Production-ready relational database with excellent Prisma TypeScript integration.

**Schema Design**:
```prisma
model Site {
  id            String   @id @default(cuid())
  title         String
  tagline       String?
  domain        String   @unique
  customDomain  String?  @unique
  theme         Theme    @relation(fields: [themeId], references: [id])
  themeId       String
  settings      Json     // Site-wide settings
  analytics     Json?    // GA/analytics config
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  pages         Page[]
  assets        Asset[]
}

model Page {
  id            String    @id @default(cuid())
  site          Site      @relation(fields: [siteId], references: [id])
  siteId        String
  
  slug          String    
  title         String
  description   String?
  
  // Separate draft and published content
  draftContent  Json      // Current editing state
  publishedContent Json?  // Live content
  publishedAt   DateTime?
  
  // Page configuration
  template      String?   // Template used
  settings      Json      // Page-specific settings
  metadata      Json      // SEO, OG tags
  
  isHomepage    Boolean   @default(false)
  inNavigation  Boolean   @default(true)
  navOrder      Int       @default(0)
  parentId      String?   // For nested pages
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@unique([siteId, slug])
  @@index([siteId, isHomepage])
}

model Asset {
  id            String   @id @default(cuid())
  site          Site     @relation(fields: [siteId], references: [id])
  siteId        String
  
  filename      String
  mimeType      String
  size          Int
  
  // Multiple versions stored
  originalUrl   String?  // Optional, for download
  displayUrl    String   // Optimized version
  thumbnailUrl  String   // Gallery thumbnail
  placeholder   String   // Base64 blur
  
  // Asset metadata
  width         Int
  height        Int
  altText       String?
  caption       String?
  focalPoint    Json?    // {x: 0.5, y: 0.5}
  metadata      Json     // EXIF, colors, etc.
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([siteId])
}

model Theme {
  id            String   @id @default(cuid())
  name          String
  description   String
  preview       String   // Screenshot URL
  
  // Theme configuration
  tokens        Json     // Design tokens
  components    Json     // Component support matrix
  layouts       Json     // Available layouts
  
  isDefault     Boolean  @default(false)
  isActive      Boolean  @default(true)
  
  sites         Site[]
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String   // Hashed
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  lastLogin     DateTime?
  
  sessions      Session[]
}

model Session {
  id            String   @id @default(cuid())
  user          User     @relation(fields: [userId], references: [id])
  userId        String
  token         String   @unique
  
  userAgent     String?
  ip            String?
  
  expiresAt     DateTime
  createdAt     DateTime @default(now())
  
  @@index([token])
  @@index([userId])
}
```

### File Storage Strategy

**Abstraction Layer**:
```typescript
interface StorageProvider {
  upload(file: Buffer, path: string, options?: UploadOptions): Promise<StorageResult>;
  delete(path: string): Promise<void>;
  getUrl(path: string, options?: UrlOptions): Promise<string>;
  list(prefix: string): Promise<StorageItem[]>;
}

// Development implementation
class LocalStorageProvider implements StorageProvider {
  private basePath = './uploads';
  // Implementation...
}

// Production implementation  
class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private cdnUrl: string;
  // Implementation...
}

// Factory based on environment
export function createStorageProvider(): StorageProvider {
  return process.env.NODE_ENV === 'production'
    ? new S3StorageProvider(config)
    : new LocalStorageProvider();
}
```

---

## Component Architecture

### Shared Component Contract
Every component must implement this interface to work in both editor and published contexts:

```typescript
interface PortfolioComponent<T = any> {
  // Unique identifier
  type: string; // e.g., 'gallery', 'text', 'image'
  version: string; // For migration support
  
  // The actual React component
  Component: React.FC<ComponentProps<T>>;
  
  // Editor-specific configuration
  editor?: {
    icon: React.ComponentType;
    label: string;
    category: 'content' | 'media' | 'layout' | 'interactive';
    
    // Default props when adding component
    defaultProps: T;
    
    // Controls shown in editor
    controls: {
      [key in keyof T]?: ControlDefinition;
    };
    
    // Validation for publishing
    validate: (props: T) => ValidationResult[];
  };
  
  // Theme compatibility
  compatibility: {
    themes: string[]; // Supported theme IDs
    fallback?: string; // Component type to use if unsupported
    responsive: boolean; // Mobile-ready
  };
  
  // Performance hints
  performance?: {
    lazyLoad?: boolean;
    priority?: 'high' | 'normal' | 'low';
    preload?: string[]; // Assets to preload
  };
}

// Example implementation
const GalleryComponent: PortfolioComponent<GalleryProps> = {
  type: 'gallery',
  version: '1.0.0',
  
  Component: ({ images, layout, columns, gap, isEditing }) => {
    // Same component for both contexts
    if (isEditing) {
      return <EditableGallery {...props} />;
    }
    return <StaticGallery {...props} />;
  },
  
  editor: {
    icon: GridIcon,
    label: 'Image Gallery',
    category: 'media',
    
    defaultProps: {
      images: [],
      layout: 'grid',
      columns: 3,
      gap: 'normal'
    },
    
    controls: {
      layout: {
        type: 'select',
        label: 'Layout',
        options: ['grid', 'carousel', 'masonry']
      },
      columns: {
        type: 'slider',
        label: 'Columns',
        min: 2,
        max: 6,
        visible: (props) => props.layout === 'grid'
      }
    },
    
    validate: (props) => {
      const errors = [];
      if (props.images.length === 0) {
        errors.push({ level: 'warning', message: 'Gallery has no images' });
      }
      props.images.forEach((img, i) => {
        if (!img.altText && !img.decorative) {
          errors.push({ 
            level: 'error', 
            message: `Image ${i + 1} needs alt text`,
            field: `images[${i}].altText`
          });
        }
      });
      return errors;
    }
  },
  
  compatibility: {
    themes: ['modern-minimal', 'photography-focus'],
    fallback: 'image-grid',
    responsive: true
  },
  
  performance: {
    lazyLoad: true,
    priority: 'normal'
  }
};
```

### Content Serialization Format

```typescript
// Page content structure
interface PageContent {
  version: '1.0.0';
  
  // Page metadata
  meta: {
    title: string;
    description?: string;
    ogImage?: string;
    keywords?: string[];
  };
  
  // Theme configuration
  theme: {
    id: string;
    overrides?: Partial<ThemeTokens>;
  };
  
  // Content sections
  sections: Section[];
}

interface Section {
  id: string; // Unique identifier
  type: string; // Component type
  props: Record<string, any>; // Component props
  children?: Section[]; // Nested sections
  
  // Layout hints
  layout?: {
    width?: 'full' | 'contained' | 'narrow';
    padding?: ResponsivePadding;
    background?: string; // From theme tokens
  };
}

// Example serialized content
const pageContent: PageContent = {
  version: '1.0.0',
  meta: {
    title: 'Theatre Work',
    description: 'Costume design for theatrical productions'
  },
  theme: {
    id: 'photography-focus'
  },
  sections: [
    {
      id: 'hero-gallery',
      type: 'gallery',
      props: {
        images: [
          { id: 'img1', url: '...', altText: 'Hamlet costume design' }
        ],
        layout: 'carousel',
        autoplay: true
      }
    },
    {
      id: 'description',
      type: 'text',
      props: {
        content: '<h2>Recent Productions</h2><p>...</p>',
        alignment: 'center'
      }
    }
  ]
};
```

### Render Pipeline

```typescript
class PageRenderer {
  constructor(
    private components: Map<string, PortfolioComponent>,
    private theme: PortfolioTheme
  ) {}
  
  async render(content: PageContent, context: RenderContext): Promise<RenderedPage> {
    // 1. Validate content version
    if (content.version !== '1.0.0') {
      content = await this.migrate(content);
    }
    
    // 2. Apply theme
    const themedContent = this.applyTheme(content, this.theme);
    
    // 3. Process sections
    const sections = await Promise.all(
      content.sections.map(section => this.renderSection(section, context))
    );
    
    // 4. Generate HTML
    return {
      html: this.generateHTML(sections, content.meta),
      css: this.extractCSS(sections),
      props: content, // For hydration
      theme: this.theme.id
    };
  }
  
  private renderSection(section: Section, context: RenderContext): RenderedSection {
    const component = this.components.get(section.type);
    
    if (!component) {
      console.warn(`Unknown component type: ${section.type}`);
      return { html: '', css: '' };
    }
    
    // Check theme compatibility
    if (!component.compatibility.themes.includes(this.theme.id)) {
      // Use fallback component if available
      if (component.compatibility.fallback) {
        return this.renderSection({
          ...section,
          type: component.compatibility.fallback
        }, context);
      }
      return { html: '', css: '' };
    }
    
    // Render component
    return {
      html: renderToString(
        <component.Component 
          {...section.props} 
          isEditing={context.isEditing}
        />
      ),
      css: component.css || ''
    };
  }
}
```

---

## Security Considerations

### Authentication Strategy
```typescript
// Session-based authentication with secure cookies
interface AuthConfig {
  sessionDuration: number; // 7 days
  refreshThreshold: number; // Refresh if < 1 day left
  secureCookie: boolean; // HTTPS only
  sameSite: 'strict' | 'lax' | 'none';
  csrfProtection: boolean;
}

// Authentication middleware
export function authMiddleware(req: Request): AuthContext {
  const session = validateSession(req.cookies.sessionId);
  
  if (!session) {
    throw new UnauthorizedError();
  }
  
  // Refresh if needed
  if (shouldRefresh(session)) {
    session = refreshSession(session);
  }
  
  // CSRF validation for state-changing operations
  if (isStateMutating(req)) {
    validateCSRFToken(req);
  }
  
  return { user: session.user, session };
}
```

### Content Security Policy
```typescript
// CSP headers for published sites
const publishedSiteCSP = {
  'default-src': ["'self'"],
  'img-src': ["'self'", 'data:', CDN_URL],
  'style-src': ["'self'", "'unsafe-inline'"], // For Tailwind
  'script-src': ["'self'", "'unsafe-inline'"], // For hydration
  'font-src': ["'self'", 'fonts.gstatic.com'],
  'connect-src': ["'self'"],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"]
};

// Stricter CSP for admin interface
const adminCSP = {
  ...publishedSiteCSP,
  'script-src': ["'self'"], // No inline scripts
  'style-src': ["'self'"], // No inline styles
};
```

### Input Sanitization
```typescript
import DOMPurify from 'isomorphic-dompurify';

// Rich text sanitization
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                   'p', 'a', 'strong', 'em', 'u', 's',
                   'blockquote', 'ul', 'ol', 'li', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false
  });
}

// File upload validation
export async function validateUpload(file: File): Promise<ValidationResult> {
  const errors = [];
  
  // Check MIME type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Invalid file type');
  }
  
  // Check file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    errors.push('File too large (max 10MB)');
  }
  
  // Verify file content matches MIME type
  const buffer = await file.arrayBuffer();
  const actualType = await detectFileType(buffer);
  if (actualType !== file.type) {
    errors.push('File content does not match type');
  }
  
  return { valid: errors.length === 0, errors };
}
```

---

## Performance Requirements & Implementation

### Performance Budgets
```typescript
const performanceBudgets = {
  // Page load metrics
  firstContentfulPaint: 1500, // 1.5s
  largestContentfulPaint: 2500, // 2.5s
  timeToInteractive: 3500, // 3.5s
  cumulativeLayoutShift: 0.1,
  firstInputDelay: 100, // 100ms
  
  // Resource budgets
  javascriptBundle: 200 * 1024, // 200KB
  cssBundle: 50 * 1024, // 50KB
  totalPageWeight: 1024 * 1024, // 1MB
  
  // Image budgets
  heroImage: 200 * 1024, // 200KB
  thumbnailImage: 50 * 1024, // 50KB
};

// Enforcement in CI/CD
export async function checkPerformanceBudgets(url: string): Promise<BudgetResult> {
  const metrics = await lighthouse(url, {
    onlyCategories: ['performance'],
    throttling: MOBILE_3G_THROTTLING
  });
  
  const violations = [];
  for (const [metric, budget] of Object.entries(performanceBudgets)) {
    if (metrics[metric] > budget) {
      violations.push({ metric, actual: metrics[metric], budget });
    }
  }
  
  return { passed: violations.length === 0, violations };
}
```

### Optimization Strategies

**Build-Time Optimizations**:
```typescript
// Next.js config for optimizations
const nextConfig = {
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Bundle optimization
  webpack: (config) => {
    config.optimization = {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              return `npm.${packageName.replace('@', '')}`;
            },
          },
        },
      },
    };
    return config;
  },
};
```

**Runtime Optimizations**:
```typescript
// Lazy loading for below-fold content
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
      { rootMargin: '50px' }
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

---

## Mobile Technical Requirements

### Touch Interaction Handling
```typescript
import { useGesture } from '@use-gesture/react';

export function DraggableComponent({ children, onDragEnd }: DraggableProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const bind = useGesture({
    onDrag: ({ offset: [x, y] }) => {
      setPosition({ x, y });
    },
    onDragEnd: ({ offset: [x, y], velocity }) => {
      // Snap to grid
      const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
      const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;
      
      setPosition({ x: snappedX, y: snappedY });
      onDragEnd({ x: snappedX, y: snappedY });
      
      // Haptic feedback on iOS
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  });
  
  return (
    <div
      {...bind()}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        touchAction: 'none', // Prevent scrolling while dragging
      }}
    >
      {children}
    </div>
  );
}
```

### Progressive Web App Configuration
```json
// manifest.json
{
  "name": "Portfolio Builder",
  "short_name": "Portfolio",
  "description": "Create beautiful portfolio websites",
  "start_url": "/admin",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker for Offline Support
```typescript
// service-worker.ts
const CACHE_NAME = 'portfolio-v1';
const STATIC_ASSETS = [
  '/',
  '/admin',
  '/offline.html',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }
      
      // Clone the request
      const fetchRequest = event.request.clone();
      
      return fetch(fetchRequest).then((response) => {
        // Check if valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone the response
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      }).catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
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

## Development & Deployment Strategy

### Deployment Modes
- **Development:** Local SQLite + filesystem, no CDN
- **Staging:** Hosted DB + object storage, optional CDN
- **Production:** Hosted DB + object storage + CDN
- **Feature flags:** storageProvider, imageCDN, publishTarget


### Development Environment
```yaml
# docker-compose.yml for local development
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:pass@db:5432/portfolio
    volumes:
      - .:/app
      - /app/node_modules
      - uploads:/app/uploads
    depends_on:
      - db
      - redis
      
  db:
    image: postgres:14
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=portfolio
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  postgres_data:
  uploads:
```

### Testing Strategy
```typescript
// Unit test example
describe('GalleryComponent', () => {
  it('should require alt text for images', () => {
    const result = GalleryComponent.editor.validate({
      images: [
        { url: 'test.jpg', altText: '' }
      ]
    });
    
    expect(result).toContainEqual(
      expect.objectContaining({
        level: 'error',
        message: expect.stringContaining('alt text')
      })
    );
  });
});

// E2E test example
test('should publish page with validation', async ({ page }) => {
  await page.goto('/admin');
  await page.click('[data-testid="add-image"]');
  await page.setInputFiles('input[type="file"]', 'test.jpg');
  await page.click('[data-testid="publish"]');
  
  // Should show validation error
  await expect(page.locator('.error')).toContainText('alt text required');
  
  // Add alt text
  await page.fill('[data-testid="alt-text"]', 'Test image');
  await page.click('[data-testid="publish"]');
  
  // Should succeed
  await expect(page.locator('.success')).toBeVisible();
});
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e
      
  lighthouse:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm run build
      - run: npm run lighthouse
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: lighthouse-report
          path: lighthouse-report.html
          
  deploy:
    needs: [test, lighthouse]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm run build
      - run: npm run deploy
```

### Monitoring & Observability
```typescript
// Performance monitoring
import { metrics } from '@opentelemetry/api-metrics';

const meter = metrics.getMeter('portfolio-builder');
const requestDuration = meter.createHistogram('request_duration');
const activeUsers = meter.createUpDownCounter('active_users');

// Error tracking
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Sanitize sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }
    return event;
  }
});
```

This completes the comprehensive technical strategy document with all implementation details, security considerations, and deployment strategies.