# Public Category and Project Pages

**Goal:** Visitors can browse portfolio work organized by categories and view individual project details.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/DESIGN-SYSTEM.md
@plans/design/LAYOUT-PATTERNS.md
@plans/design/templates/featured-grid-landing.md
@plans/design/components/image-card-hover-overlay.md
@plans/design/components/navigation.md

## Scope

**Included**:
- Category landing page template (grid of project cards)
- Project detail page template (gallery-primary layout)
- Featured work integration on homepage (isFeatured flag)
- Category navigation in site header (dynamic dropdown for >5 categories)
- Breadcrumb navigation (Category > Project)
- Responsive layouts (3/2/1 columns for grids)
- Image card hover overlay pattern
- Project metadata display (title, year, venue, role, description)
- Gallery lightbox for project images
- SEO-friendly URLs (/[portfolio]/[category]/[project])

**NOT Included**:
- Search or filtering within categories
- Project comparison views
- Social sharing buttons
- Comments or feedback
- Project statistics or analytics
- Category descriptions on landing pages
- Related projects suggestions

## Tech Stack
- Next.js App Router with server components
- Dynamic routes for categories and projects
- Image optimization with next/image
- Existing theme system for styling
- Lightbox component for gallery
- Responsive grid layouts

## Key Files
```
src/app/[slug]/[categorySlug]/page.tsx         # Category landing page
src/app/[slug]/[categorySlug]/[projectSlug]/page.tsx  # Project detail page
src/components/public/CategoryLanding.tsx      # Category page template
src/components/public/ProjectDetail.tsx        # Project page template
src/components/public/ProjectCard.tsx          # Project card with hover
src/components/public/ProjectGallery.tsx       # Gallery grid component
src/components/public/Navigation.tsx           # Update with category links
src/components/public/Breadcrumb.tsx           # Breadcrumb navigation
```

## UI Design

### Category Landing Page

```
+------------------------------------------------------------------+
| [Name] | Theatre | Film | Opera | About | Resume                |
+------------------------------------------------------------------+
|                                                                   |
|  Theatre                                     Breadcrumb: Theatre  |
|  Professional theatre costume design                             |
|                                                                   |
|  +------------------+  +------------------+  +------------------+ |
|  |    [Image]       |  |    [Image]       |  |    [Image]       | |
|  |                  |  |                  |  |                  | |
|  |   (Hover shows)  |  |   (Hover shows)  |  |   (Hover shows)  | |
|  | Hamlet 2024      |  | Macbeth 2023     |  | Romeo & Juliet   | |
|  | Oregon Shakes    |  | Portland Center  |  | 5th Ave Theatre  | |
|  +------------------+  +------------------+  +------------------+ |
|                                                                   |
|  +------------------+  +------------------+  +------------------+ |
|  |    [Image]       |  |    [Image]       |  |    [Image]       | |
|  |                  |  |                  |  |                  | |
+------------------------------------------------------------------+
```

**Desktop behavior:**
- Hover over project card → Semi-transparent overlay appears
- Overlay shows: Project title, venue, year
- Clean image default (work is the star)

**Mobile behavior:**
- Project title and venue shown below image
- No hover interaction
- Same grid layout (2 columns on mobile)

### Project Detail Page

```
+------------------------------------------------------------------+
| [Name] | Theatre | Film | Opera | About | Resume                |
+------------------------------------------------------------------+
|                                                                   |
|  Theatre > Hamlet 2024                                           |
|                                                                   |
|  Hamlet 2024                                                     |
|  Oregon Shakespeare Festival, 2024                               |
|  Lead Costume Designer                                           |
|                                                                   |
|  Classical production with contemporary design elements,          |
|  featuring hand-dyed fabrics and period-accurate construction...  |
|                                                                   |
|  Gallery                                                         |
|  +----------------------------+  +----------------------------+   |
|  |                            |  |                            |   |
|  |      [Large Image 1]       |  |      [Large Image 2]       |   |
|  |         600x400            |  |         600x400            |   |
|  +----------------------------+  +----------------------------+   |
|                                                                   |
|  +----------------------------+  +----------------------------+   |
|  |      [Large Image 3]       |  |      [Large Image 4]       |   |
|  +----------------------------+  +----------------------------+   |
|                                                                   |
+------------------------------------------------------------------+
```

**Desktop:** 2-column gallery (larger images for visual impact)
**Mobile:** Single column gallery (scroll through)
**Click image:** Opens lightbox with prev/next navigation

### Homepage Featured Projects

```
+------------------------------------------------------------------+
| [Name] | Theatre | Film | Opera | About | Resume                |
+------------------------------------------------------------------+
|                                                                   |
|  Sarah Chen                                                      |
|  Costume Designer                                                |
|                                                                   |
|  [Resume Button]                                                 |
|                                                                   |
|  Featured Work                                                   |
|  +------------------+  +------------------+  +------------------+ |
|  |    [Image]       |  |    [Image]       |  |    [Image]       | |
|  | Hamlet 2024      |  | Period Drama     |  | Spring Runway    | |
|  | Theatre          |  | Film             |  | Fashion          | |
|  +------------------+  +------------------+  +------------------+ |
|                                                                   |
+------------------------------------------------------------------+
```

**Featured work selection:**
- Projects marked with `isFeatured = true` boolean
- Ordered by `order` field for prominence control
- Shows featured image, title, and category
- Links to project detail page

### Navigation - Dynamic Categories

**≤5 categories:**
```
[Name] | Theatre | Film | Opera | About | Resume
```

**>5 categories:**
```
[Name] | Work ▾ | About | Resume

Click "Work" dropdown:
┌──────────────────┐
│ Theatre          │
│ Film             │
│ Opera            │
│ Commercial       │
│ Music Theatre    │
│ Television       │
└──────────────────┘
```

## Component Props

```typescript
interface CategoryLandingProps {
  portfolio: Portfolio
  category: Category & {
    projects: (Project & {
      featuredImage: Asset | null
    })[]
  }
}

interface ProjectDetailProps {
  portfolio: Portfolio
  category: Category
  project: Project & {
    featuredImage: Asset | null
    galleryImages: Array<{
      asset: Asset
      order: number
    }>
  }
}

interface ProjectCardProps {
  project: {
    slug: string
    title: string
    venue?: string
    year?: number
    featuredImage: Asset
  }
  categorySlug: string
  portfolioSlug: string
  className?: string
}

interface BreadcrumbProps {
  items: Array<{
    label: string
    href?: string
  }>
}
```

## Data Loading

### Category Page

```typescript
// src/app/[slug]/[categorySlug]/page.tsx
export default async function CategoryPage({
  params,
}: {
  params: { slug: string; categorySlug: string }
}) {
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug: params.slug },
    include: {
      categories: {
        where: { slug: params.categorySlug },
        include: {
          projects: {
            where: { 
              // Only published projects (future enhancement)
            },
            include: {
              featuredImage: true,
            },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })
  
  if (!portfolio || portfolio.categories.length === 0) {
    notFound()
  }
  
  const category = portfolio.categories[0]
  
  return <CategoryLanding portfolio={portfolio} category={category} />
}
```

### Project Page

```typescript
// src/app/[slug]/[categorySlug]/[projectSlug]/page.tsx
export default async function ProjectPage({
  params,
}: {
  params: { slug: string; categorySlug: string; projectSlug: string }
}) {
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug: params.slug },
    include: {
      categories: {
        where: { slug: params.categorySlug },
        include: {
          projects: {
            where: { slug: params.projectSlug },
            include: {
              featuredImage: true,
              galleryImages: {
                include: { asset: true },
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      },
    },
  })
  
  if (!portfolio || portfolio.categories.length === 0) {
    notFound()
  }
  
  const category = portfolio.categories[0]
  const project = category.projects[0]
  
  if (!project) {
    notFound()
  }
  
  return <ProjectDetail portfolio={portfolio} category={category} project={project} />
}
```

## Image Card Hover Overlay Pattern

### Desktop Implementation

```typescript
function ProjectCard({ project, categorySlug, portfolioSlug }: ProjectCardProps) {
  return (
    <Link
      href={`/${portfolioSlug}/${categorySlug}/${project.slug}`}
      className="project-card group relative overflow-hidden rounded-lg"
    >
      {/* Featured image */}
      <div className="aspect-video relative">
        <Image
          src={project.featuredImage.url}
          alt={project.featuredImage.altText}
          fill
          className="object-cover"
        />
        
        {/* Hover overlay (desktop only) */}
        <div className="overlay absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex flex-col justify-end p-4">
          <h3 className="text-white font-semibold text-lg">{project.title}</h3>
          {project.venue && (
            <p className="text-white/90 text-sm">{project.venue}</p>
          )}
          {project.year && (
            <p className="text-white/75 text-sm">{project.year}</p>
          )}
        </div>
      </div>
      
      {/* Mobile: Show text below image */}
      <div className="md:hidden p-3">
        <h3 className="font-semibold">{project.title}</h3>
        {project.venue && (
          <p className="text-text-muted text-sm">{project.venue}</p>
        )}
      </div>
    </Link>
  )
}
```

## Navigation Component Updates

### Dynamic Category Links

```typescript
function Navigation({ categories }: { categories: Category[] }) {
  const showDropdown = categories.length > 5
  
  return (
    <nav className="navigation">
      <ul>
        <li><Link href="/">Name</Link></li>
        
        {!showDropdown ? (
          // Direct links (≤5 categories)
          categories.map(cat => (
            <li key={cat.id}>
              <Link href={`/${portfolio.slug}/${cat.slug}`}>
                {cat.name}
              </Link>
            </li>
          ))
        ) : (
          // Dropdown menu (>5 categories)
          <li>
            <DropdownMenu>
              <DropdownMenuTrigger>Work ▾</DropdownMenuTrigger>
              <DropdownMenuContent>
                {categories.map(cat => (
                  <DropdownMenuItem key={cat.id} asChild>
                    <Link href={`/${portfolio.slug}/${cat.slug}`}>
                      {cat.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        )}
        
        <li><Link href="/about">About</Link></li>
        <li><Link href="/resume">Resume</Link></li>
      </ul>
    </nav>
  )
}
```

## Breadcrumb Component

```typescript
function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb mb-6">
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {item.href ? (
              <Link 
                href={item.href}
                className="text-text-muted hover:text-text transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-text" aria-current="page">
                {item.label}
              </span>
            )}
            {index < items.length - 1 && (
              <span className="text-text-muted" aria-hidden="true">›</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Usage on project page
<Breadcrumb items={[
  { label: category.name, href: `/${portfolio.slug}/${category.slug}` },
  { label: project.title }
]} />
```

## Gallery Layout

### Desktop: 2-Column Large Images

```typescript
function ProjectGallery({ images }: { images: Asset[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  
  return (
    <>
      <div className="gallery-grid grid md:grid-cols-2 gap-4">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setLightboxIndex(index)}
            className="gallery-item relative aspect-[3/2] overflow-hidden rounded-lg cursor-zoom-in"
          >
            <Image
              src={image.url}
              alt={image.altText}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </button>
        ))}
      </div>
      
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNext={() => setLightboxIndex((lightboxIndex + 1) % images.length)}
          onPrev={() => setLightboxIndex((lightboxIndex - 1 + images.length) % images.length)}
        />
      )}
    </>
  )
}
```

### Mobile: Single Column

```css
@media (max-width: 767px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }
}
```

## Homepage Featured Work

### Query Logic

```typescript
// src/app/[slug]/page.tsx
const featuredProjects = await prisma.project.findMany({
  where: {
    category: {
      portfolioId: portfolio.id,
    },
    isFeatured: true,
  },
  include: {
    featuredImage: true,
    category: true,
  },
  orderBy: { order: 'asc' },
  take: 6,  // Maximum 6 featured projects
})
```

### Featured Grid Display

```typescript
<section className="featured-work">
  <h2 className="text-2xl font-semibold mb-6">Featured Work</h2>
  
  <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
    {featuredProjects.map(project => (
      <ProjectCard
        key={project.id}
        project={project}
        categorySlug={project.category.slug}
        portfolioSlug={portfolio.slug}
      />
    ))}
  </div>
</section>
```

## Demo Script (30 seconds)
1. Visit published portfolio at `/sarah-chen`
2. See homepage with name, optional about, featured work grid
3. Featured work shows 3 projects (from different categories)
4. Header navigation shows: Theatre | Film | Opera | About | Resume
5. Hover over featured project card - overlay appears with title/venue
6. Click project card - navigate to project detail page
7. See breadcrumb: "Theatre > Hamlet 2024"
8. Project page shows: title, year, venue, role, description
9. Gallery shows 8 images in 2-column layout
10. Click gallery image - lightbox opens, full-screen image
11. Press → arrow key - next image
12. Press Escape - lightbox closes
13. Click "Theatre" breadcrumb - navigate to category page
14. Category page shows all theatre projects in grid
15. Resize to mobile - navigation collapses to hamburger
16. Project cards show title below image (no hover)
17. Gallery becomes single column
18. **Success**: Complete visitor experience through category/project hierarchy

## Success Criteria

### Functional Requirements
- [ ] Category page route works: `/[portfolio]/[category]`
- [ ] Category page displays all projects in category
- [ ] Projects ordered by `order` field
- [ ] Project cards show featured image, title, venue
- [ ] Project card links to project detail page
- [ ] Project page route works: `/[portfolio]/[category]/[project]`
- [ ] Project page displays all metadata (title, year, venue, role, description)
- [ ] Project gallery displays all gallery images
- [ ] Gallery images ordered by `order` field
- [ ] Click gallery image opens lightbox
- [ ] Lightbox supports keyboard navigation (arrow keys, Escape)
- [ ] Homepage displays featured projects (isFeatured = true)
- [ ] Featured projects ordered by `order` field
- [ ] Featured projects limited to 6 maximum
- [ ] Navigation shows categories ≤5 as direct links
- [ ] Navigation shows dropdown for >5 categories
- [ ] Breadcrumb shows on project page
- [ ] Breadcrumb links work for navigation
- [ ] 404 page for invalid category/project slugs

### Design Requirements
- [ ] Category page: 3/2/1 column responsive grid
- [ ] Project cards: 16:9 aspect ratio featured images
- [ ] Desktop hover: Semi-transparent overlay (60% black)
- [ ] Hover transition: 300ms ease
- [ ] Mobile: Title/venue below image, no hover
- [ ] Project page: Header with breadcrumb, metadata section, gallery
- [ ] Gallery: 2/1 column responsive layout
- [ ] Gallery images: 3:2 aspect ratio
- [ ] Lightbox: Full-screen with prev/next controls
- [ ] Typography follows theme system scales
- [ ] Spacing uses design system tokens (space-4, space-6)
- [ ] All layouts respect theme CSS variables
- [ ] Featured work grid matches homepage template

### Accessibility Requirements
- [ ] All images have descriptive alt text
- [ ] Hover overlay information available to screen readers
- [ ] Breadcrumb uses semantic nav element
- [ ] Breadcrumb has aria-label="Breadcrumb"
- [ ] Current page in breadcrumb has aria-current="page"
- [ ] Gallery images have role="button"
- [ ] Gallery images have aria-label with image description
- [ ] Lightbox focus trapped when open
- [ ] Lightbox prev/next buttons keyboard accessible
- [ ] Lightbox has aria-label="Image gallery"
- [ ] Close button has aria-label="Close gallery"
- [ ] Navigation dropdown keyboard accessible
- [ ] Color contrast meets WCAG AA

### Mobile Requirements
- [ ] Category grid: 2 columns on mobile
- [ ] Project cards stack on mobile (<640px)
- [ ] Gallery: Single column on mobile
- [ ] Touch targets ≥ 44px (navigation links)
- [ ] Lightbox swipe gestures work on touch
- [ ] Images lazy load below fold
- [ ] Responsive images use appropriate srcset
- [ ] Page loads in <2 seconds on 3G

### SEO Requirements
- [ ] Category pages have descriptive meta titles
- [ ] Project pages have descriptive meta titles
- [ ] Featured images included in Open Graph tags
- [ ] Project descriptions in meta descriptions
- [ ] Semantic HTML5 structure (header, nav, main, article)
- [ ] Breadcrumb structured data (JSON-LD)
- [ ] Canonical URLs set correctly

## Theme Integration

### Theme Variables Applied

```typescript
// All public components use theme CSS variables
<div className="category-landing" style={{
  backgroundColor: 'var(--color-background)',
  color: 'var(--color-text)',
}}>
  <h1 style={{
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--text-3xl)',
  }}>
    {category.name}
  </h1>
</div>
```

**Theme system ensures:**
- Modern Minimal: White background, blue accents
- Classic Elegant: Cream background, terracotta accents
- Bold Editorial: Dark background, pink accents

All layouts adapt to theme variables automatically.

## Responsive Grid Patterns

### Category Grid

```css
.category-grid {
  display: grid;
  gap: var(--space-6);
  
  /* Mobile: 1 column */
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .category-grid {
    /* Tablet: 2 columns */
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .category-grid {
    /* Desktop: 3 columns */
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Project Gallery Grid

```css
.project-gallery {
  display: grid;
  gap: var(--space-4);
  
  /* Mobile: 1 column */
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .project-gallery {
    /* Desktop: 2 columns */
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## Image Optimization

### Responsive Images

```typescript
<Image
  src={image.url}
  alt={image.altText}
  width={800}
  height={533}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
/>
```

### Lazy Loading

```typescript
// Images below fold lazy load
<Image
  src={image.url}
  alt={image.altText}
  loading="lazy"
  placeholder="blur"
  blurDataURL={image.placeholderUrl}
/>
```

## Integration Points

These elements are designed to be extended:
- **ProjectCard** - Reusable on homepage, category pages, search results
- **ProjectGallery** - Reusable for any image collection display
- **Breadcrumb** - Reusable for any hierarchical navigation
- **Navigation** - Categories can be extended with other sections
- **Lightbox** - Reusable for any full-screen image viewing

## Effort Estimate

**Total: 10-12 hours**
- CategoryLanding template: 2-3 hours
- ProjectDetail template: 2-3 hours
- ProjectCard component: 1-2 hours
- ProjectGallery component: 1-2 hours
- Lightbox component: 1-2 hours
- Navigation updates: 1-2 hours
- Breadcrumb component: 1 hour
- Data loading logic: 1-2 hours
- Testing and polish: 2-3 hours
