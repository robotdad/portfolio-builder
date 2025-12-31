# Category & Project Models

**Goal:** Implement Category and Project data models with CRUD API routes.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/CONTENT-MODEL.md
@plans/slices/14-content-model-schema.md

## Scope

**Included**:
- Prisma schema updates for Category and Project models
- Database migration execution
- Asset model updates for project relationships
- CRUD API routes for Categories
- CRUD API routes for Projects
- Reorder endpoints for both models
- Seed data for testing
- Basic validation and error handling

**NOT Included**:
- Category management UI (Slice 17)
- Project management UI (future slice)
- Image picker integration (Slice 16)
- Migration of existing FeaturedGrid content (separate task)
- Public category/project pages (future slice)

## Tech Stack
- Prisma ORM for schema and migrations
- Next.js API routes
- Zod for request validation
- TypeScript types generation

## Key Files
```
prisma/schema.prisma                           # Add Category, Project models
prisma/migrations/xxx_add_categories/          # Migration files
src/app/api/categories/route.ts                # GET (list), POST (create)
src/app/api/categories/[id]/route.ts           # GET, PUT, DELETE
src/app/api/categories/reorder/route.ts        # PUT (batch reorder)
src/app/api/projects/route.ts                  # GET (list), POST (create)
src/app/api/projects/[id]/route.ts             # GET, PUT, DELETE
src/app/api/projects/reorder/route.ts          # PUT (batch reorder)
src/lib/validations/category.ts                # Zod schemas
src/lib/validations/project.ts                 # Zod schemas
prisma/seed-categories.ts                      # Test data seeder
```

## API Design

### Categories API

```typescript
// GET /api/categories
// Returns all categories for the portfolio with project counts
{
  categories: [{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    order: number;
    featuredImageId: string | null;
    featuredImage: Asset | null;
    projectCount: number;
    createdAt: string;
    updatedAt: string;
  }]
}

// POST /api/categories
// Create new category
Request: { name: string; description?: string; featuredImageId?: string; }
Response: { category: Category }

// GET /api/categories/[id]
// Get category with projects
Response: { category: Category; projects: Project[] }

// PUT /api/categories/[id]
// Update category
Request: { name?: string; description?: string; featuredImageId?: string; }
Response: { category: Category }

// DELETE /api/categories/[id]
// Delete category (cascades to projects)
Response: { success: true }

// PUT /api/categories/reorder
// Reorder categories
Request: { orderedIds: string[] }
Response: { success: true }
```

### Projects API

```typescript
// GET /api/projects
// Returns all projects, optionally filtered by category
Query: ?categoryId=xxx&featured=true
Response: {
  projects: [{
    id: string;
    title: string;
    slug: string;
    year: string | null;
    venue: string | null;
    role: string | null;
    description: string | null;
    isFeatured: boolean;
    order: number;
    categoryId: string;
    category: { id: string; name: string; };
    featuredImageId: string | null;
    featuredImage: Asset | null;
    imageCount: number;
  }]
}

// POST /api/projects
// Create new project
Request: {
  title: string;
  categoryId: string;
  year?: string;
  venue?: string;
  role?: string;
  description?: string;
  isFeatured?: boolean;
  featuredImageId?: string;
}
Response: { project: Project }

// GET /api/projects/[id]
// Get project with images
Response: { project: Project; images: Asset[] }

// PUT /api/projects/[id]
// Update project
Request: { ...partial project fields }
Response: { project: Project }

// DELETE /api/projects/[id]
// Delete project
Response: { success: true }

// PUT /api/projects/reorder
// Reorder projects within category
Request: { categoryId: string; orderedIds: string[] }
Response: { success: true }
```

## Demo Script (30 seconds)
1. Run `npx prisma migrate dev` - Migration succeeds
2. Run seed script - Categories and projects created
3. Open API client (Postman/curl)
4. `GET /api/categories` - Returns seeded categories with counts
5. `POST /api/categories` with `{"name": "Theatre"}` - Creates category
6. `POST /api/projects` with `{"title": "Hamlet", "categoryId": "xxx"}` - Creates project
7. `PUT /api/projects/[id]` with `{"isFeatured": true}` - Marks as featured
8. `GET /api/projects?featured=true` - Returns featured projects
9. `DELETE /api/categories/[id]` - Cascades delete to projects
10. **Success**: Full CRUD operations work for both models

## Success Criteria

### Database Requirements
- [ ] Category model created in Prisma schema
- [ ] Project model created in Prisma schema
- [ ] Asset model updated with project relationships
- [ ] Migration runs without errors
- [ ] Unique constraints work (duplicate slug rejected)
- [ ] Cascade delete works (delete category removes projects)
- [ ] Indexes created for foreign keys

### API Requirements - Categories
- [ ] GET /api/categories returns all categories with project counts
- [ ] POST /api/categories creates category with auto-generated slug
- [ ] GET /api/categories/[id] returns category with projects
- [ ] PUT /api/categories/[id] updates category fields
- [ ] DELETE /api/categories/[id] deletes category and projects
- [ ] PUT /api/categories/reorder updates order for all categories
- [ ] Validation rejects invalid input with clear error messages

### API Requirements - Projects
- [ ] GET /api/projects returns projects with category info
- [ ] GET /api/projects?categoryId=xxx filters by category
- [ ] GET /api/projects?featured=true filters featured only
- [ ] POST /api/projects creates project with auto-generated slug
- [ ] GET /api/projects/[id] returns project with images
- [ ] PUT /api/projects/[id] updates project fields
- [ ] DELETE /api/projects/[id] deletes project
- [ ] PUT /api/projects/reorder updates order within category
- [ ] Validation ensures categoryId exists

### Testing Requirements
- [ ] Seed script creates test categories and projects
- [ ] At least 3 categories with 2-4 projects each
- [ ] Some projects marked as featured
- [ ] Featured images assigned to some items

## Integration Points

These elements are designed to be extended:
- **Category/Project models** - Used by Slice 17 Category Management UI
- **Project model** - Used by future Project Management UI slice
- **Featured projects query** - Used for landing page featured grid
- **Asset relationships** - Used by Slice 16 Image Picker source tracking
- **API patterns** - Reusable for future entity APIs

## Validation Schemas

```typescript
// src/lib/validations/category.ts
export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  featuredImageId: z.string().cuid().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// src/lib/validations/project.ts
export const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  categoryId: z.string().cuid(),
  year: z.string().max(20).optional(),
  venue: z.string().max(200).optional(),
  role: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  isFeatured: z.boolean().optional(),
  featuredImageId: z.string().cuid().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();
```

## Effort Estimate

**Total: 8-12 hours**
- Prisma schema updates: 1-2 hours
- Database migration: 1 hour
- Category API routes: 2-3 hours
- Project API routes: 2-3 hours
- Validation schemas: 1 hour
- Seed data: 1 hour
- Testing and fixes: 1-2 hours
