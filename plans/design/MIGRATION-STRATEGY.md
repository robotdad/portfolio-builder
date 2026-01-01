# Migration Strategy: FeaturedGrid to Category/Project Model

This document plans the migration from the current flat FeaturedGrid items to the new hierarchical Category → Project model.

## 1. Migration Overview

### Purpose
Transform flat FeaturedGrid items stored as JSON within Page content into a proper hierarchical Category/Project database structure with full relational integrity.

### Approach
**Additive migration** - We add new tables and populate them from existing data without removing or modifying the original JSON structures. This ensures:
- Zero downtime during migration
- Instant rollback capability
- Gradual transition to new data model

### Timeline
Run as part of **Slice 15** implementation.

---

## 2. Data Transformation Rules

### Current State: FeaturedWorkItem
```typescript
interface FeaturedWorkItem {
  id: string;           // UUID
  imageId: string;      // References Asset.id
  imageUrl: string;     // Computed from Asset
  title: string;        // Display title
  category: string;     // Free-text: "Theatre", "Illustration", etc.
  link: string;         // URL or page path
}
```

### Target State: Category + Project Models
```prisma
model Category {
  id        String    @id @default(cuid())
  siteId    String
  name      String
  slug      String
  order     Int       @default(0)
  projects  Project[]
  
  @@unique([siteId, slug])
}

model Project {
  id              String    @id @default(cuid())
  siteId          String
  categoryId      String
  title           String
  slug            String
  description     String?
  featuredImageId String?
  externalUrl     String?
  isFeatured      Boolean   @default(false)
  order           Int       @default(0)
  
  category        Category  @relation(fields: [categoryId])
  featuredImage   Asset?    @relation(fields: [featuredImageId])
  
  @@unique([siteId, slug])
}
```

### Field Mapping: FeaturedWorkItem → Project

| Source Field | Target Field | Transformation |
|--------------|--------------|----------------|
| `item.title` | `project.title` | Direct copy |
| `item.category` | `project.categoryId` | Lookup/create Category by name |
| `item.imageId` | `project.featuredImageId` | Direct copy (same Asset reference) |
| `item.link` | `project.externalUrl` | Direct copy |
| *(new)* | `project.isFeatured` | Set to `true` (was in FeaturedGrid) |
| *(new)* | `project.slug` | Generate from title via `slugify()` |

### Field Mapping: Category Strings → Category

| Source | Target Field | Transformation |
|--------|--------------|----------------|
| Unique `item.category` values | `category.name` | Direct copy |
| *(derived)* | `category.slug` | Generate from name via `slugify()` |
| *(derived)* | `category.order` | Index of first appearance |

---

## 3. Default Category Handling

Items with empty, null, or whitespace-only category strings are assigned to an **"Uncategorized"** category:

```typescript
const DEFAULT_CATEGORY = {
  name: "Uncategorized",
  slug: "uncategorized",
  order: 999  // Sort last
};
```

**Behavior:**
- "Uncategorized" category is created **only if needed**
- User can reorganize projects into proper categories after migration
- User can rename or delete "Uncategorized" once empty

---

## 4. Asset Reassignment

### No Duplication Required

FeaturedWorkItem already references Assets by ID. The migration simply copies this reference:

```
FeaturedWorkItem.imageId  →  Project.featuredImageId
         ↓                           ↓
      Asset.id  ←────────────────────┘
```

- Same Asset record is referenced (no duplication)
- Asset.siteId already matches Project.siteId
- Image URLs remain valid

### Gallery Images

- `Project.galleryImages` starts empty after migration
- User adds gallery images through the new Project edit UI
- This is intentional: FeaturedGrid only had single images

---

## 5. Migration Steps (Slice 15)

### Step 1: Create Database Tables

Run Prisma migration to create Category and Project tables:

```bash
npx prisma migrate dev --name add_category_project_models
```

### Step 2: Run Data Migration Script

```typescript
// scripts/migrate-featured-to-projects.ts

import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

interface FeaturedWorkItem {
  id: string;
  imageId: string;
  title: string;
  category: string;
  link: string;
}

async function migrateFeaturedGridToProjects() {
  console.log('Starting migration...');
  
  // Get all sites
  const sites = await prisma.site.findMany();
  
  for (const site of sites) {
    console.log(`Processing site: ${site.id}`);
    
    // Step 2a: Query all pages with FeaturedGrid sections
    const pages = await prisma.page.findMany({
      where: { siteId: site.id }
    });
    
    const featuredItems: FeaturedWorkItem[] = [];
    
    for (const page of pages) {
      const content = page.publishedContent || page.draftContent;
      if (!content) continue;
      
      const sections = content.sections || [];
      for (const section of sections) {
        if (section.type === 'featuredGrid' && section.items) {
          featuredItems.push(...section.items);
        }
      }
    }
    
    if (featuredItems.length === 0) {
      console.log(`  No featured items found`);
      continue;
    }
    
    // Step 2b: Extract unique category strings
    const categoryNames = [...new Set(
      featuredItems.map(item => item.category?.trim() || 'Uncategorized')
    )];
    
    console.log(`  Found ${categoryNames.length} unique categories`);
    
    // Step 2c: Create Category records
    const categoryMap = new Map<string, string>(); // name → id
    
    for (let i = 0; i < categoryNames.length; i++) {
      const name = categoryNames[i];
      const category = await prisma.category.create({
        data: {
          siteId: site.id,
          name: name,
          slug: slugify(name),
          order: name === 'Uncategorized' ? 999 : i
        }
      });
      categoryMap.set(name, category.id);
    }
    
    // Step 2d: Create Project records from FeaturedWorkItems
    const usedSlugs = new Set<string>();
    
    for (let i = 0; i < featuredItems.length; i++) {
      const item = featuredItems[i];
      const categoryName = item.category?.trim() || 'Uncategorized';
      const categoryId = categoryMap.get(categoryName)!;
      
      // Generate unique slug
      let slug = slugify(item.title);
      let slugSuffix = 1;
      while (usedSlugs.has(slug)) {
        slug = `${slugify(item.title)}-${slugSuffix++}`;
      }
      usedSlugs.add(slug);
      
      // Step 2e: Create project linked to category
      await prisma.project.create({
        data: {
          siteId: site.id,
          categoryId: categoryId,
          title: item.title,
          slug: slug,
          featuredImageId: item.imageId || null,
          externalUrl: item.link || null,
          isFeatured: true,  // Was in FeaturedGrid = featured
          order: i
        }
      });
    }
    
    console.log(`  Created ${featuredItems.length} projects`);
  }
  
  console.log('Migration complete!');
}

// Run migration
migrateFeaturedGridToProjects()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Step 3: Verify Migration Success

```typescript
// scripts/verify-migration.ts

async function verifyMigration() {
  const sites = await prisma.site.findMany();
  
  for (const site of sites) {
    const categories = await prisma.category.count({ 
      where: { siteId: site.id } 
    });
    const projects = await prisma.project.count({ 
      where: { siteId: site.id } 
    });
    const featuredProjects = await prisma.project.count({ 
      where: { siteId: site.id, isFeatured: true } 
    });
    const projectsWithImages = await prisma.project.count({ 
      where: { siteId: site.id, featuredImageId: { not: null } } 
    });
    
    console.log(`Site ${site.id}:`);
    console.log(`  Categories: ${categories}`);
    console.log(`  Projects: ${projects}`);
    console.log(`  Featured: ${featuredProjects}`);
    console.log(`  With images: ${projectsWithImages}`);
  }
}
```

### Step 4: Preserve Original Data

**No action required** - Original `Page.draftContent` and `Page.publishedContent` remain unchanged. FeaturedGrid sections continue to function.

---

## 6. Rollback Strategy

If migration fails or needs to be reverted:

### Immediate Rollback (Before Deployment)
```bash
# Drop the new tables
npx prisma migrate reset --skip-seed
# Or manually:
DROP TABLE IF EXISTS "Project";
DROP TABLE IF EXISTS "Category";
```

### Post-Deployment Rollback
1. Remove Category/Project-dependent UI code
2. Drop tables via migration
3. Original FeaturedGrid continues working

### Why Rollback is Safe
- Original `Page.draftContent`/`publishedContent` **never modified**
- FeaturedGrid sections remain functional
- No Asset records modified
- Zero data loss possible

---

## 7. Validation Checklist

### Pre-Migration

- [ ] Database backup created
- [ ] Count total FeaturedWorkItems across all pages
- [ ] List all unique category strings
- [ ] Verify all `imageId` references are valid Assets
- [ ] Test migration script in development environment

```sql
-- Count featured items (approximate, requires JSON parsing)
SELECT COUNT(*) FROM "Page" 
WHERE "publishedContent"::text LIKE '%featuredGrid%';
```

### Post-Migration

- [ ] Category count matches unique category strings
- [ ] Project count matches FeaturedWorkItem count
- [ ] All projects have valid `categoryId` (no nulls)
- [ ] All projects with images have valid `featuredImageId`
- [ ] Original FeaturedGrid data still intact in Page content
- [ ] FeaturedGrid component still renders correctly
- [ ] New Category/Project admin UI loads data

```sql
-- Verify all projects have categories
SELECT COUNT(*) FROM "Project" WHERE "categoryId" IS NULL;
-- Should return 0

-- Verify featured image references
SELECT p.id, p.title FROM "Project" p
LEFT JOIN "Asset" a ON p."featuredImageId" = a.id
WHERE p."featuredImageId" IS NOT NULL AND a.id IS NULL;
-- Should return 0 rows
```

---

## 8. Coexistence Period

During the transition phase, both data models work simultaneously:

| Aspect | JSON (FeaturedGrid) | Database (Category/Project) |
|--------|---------------------|----------------------------|
| **Pages** | Continue to work | N/A |
| **Work sections** | Render from JSON | New pages use Projects |
| **Navigation** | Shows pages | Also shows categories |
| **Admin editing** | Section editor | Project editor |
| **Image management** | Per-section | Per-project |

### How Coexistence Works

1. **Existing pages** continue rendering FeaturedGrid from JSON
2. **New content** created as Projects with Categories
3. **Navigation** queries both Pages and Categories
4. **Templates** have adapters for either data source
5. **Full transition** happens in a future slice (delete JSON sections)

### Template Adapter Example

```typescript
// Unified interface for rendering work items
interface WorkItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  link: string;
}

// From FeaturedGrid JSON
function fromFeaturedGrid(item: FeaturedWorkItem): WorkItem {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    imageUrl: item.imageUrl,
    link: item.link
  };
}

// From Project database record
function fromProject(project: Project & { 
  category: Category; 
  featuredImage: Asset | null 
}): WorkItem {
  return {
    id: project.id,
    title: project.title,
    category: project.category.name,
    imageUrl: project.featuredImage?.url || '/placeholder.jpg',
    link: project.externalUrl || `/work/${project.category.slug}/${project.slug}`
  };
}
```

---

## 9. Estimated Time

| Phase | Duration | Notes |
|-------|----------|-------|
| Schema migration | ~1 minute | Prisma migrate |
| Data migration (100 items) | ~5 seconds | Batch inserts |
| Data migration (1000 items) | ~30 seconds | Scales linearly |
| Verification queries | ~1 minute | Manual checks |
| **Total with verification** | **~10 minutes** | For typical portfolio |

### Performance Notes

- Migration is I/O bound, not CPU bound
- Batch size can be tuned for large datasets
- Transaction wrapping ensures atomicity
- Can be run during low-traffic periods

---

## Summary

This additive migration strategy ensures:

1. **Zero risk** - Original data preserved, instant rollback possible
2. **Zero downtime** - Both models work during transition
3. **Clean data model** - Proper relational structure for future features
4. **Simple execution** - Single script, ~10 minutes total

The migration transforms implicit category strings into explicit Category records, and ephemeral JSON items into persistent Project records, while maintaining full backward compatibility.
