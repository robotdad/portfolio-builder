# Content Model Schema Design

**Goal:** Design and document the evolved Category -> Project content model schema.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/CONTENT-MODEL.md
@plans/design/DESIGN-SYSTEM.md

## Scope

**Included**:
- Design Category database schema with all fields
- Design Project database schema with all fields
- Document relationships (Portfolio -> Categories -> Projects)
- Plan migration strategy from flat sections to hierarchical model
- Define backward compatibility approach for existing FeaturedGrid items
- Update CONTENT-MODEL.md with finalized schema
- Document data transformation rules for migration

**NOT Included**:
- Actual database migration (Slice 15)
- Prisma schema changes (Slice 15)
- API routes implementation (Slice 15)
- UI changes (Slice 17)
- Image picker component (Slice 16)

## Tech Stack
- Markdown documentation
- Prisma schema design (documentation only)
- Migration planning

## Key Files
```
plans/design/CONTENT-MODEL.md              # Update with finalized schema
plans/design/MIGRATION-STRATEGY.md         # New: Migration approach document
ai_working/schema-design-notes.md          # Working notes (optional)
```

## Deliverables

### 1. Category Schema Design

```prisma
model Category {
  id          String    @id @default(cuid())
  name        String
  slug        String
  description String?
  order       Int       @default(0)
  
  // Featured image (references existing Asset)
  featuredImageId String?
  featuredImage   Asset?    @relation(fields: [featuredImageId], references: [id])
  
  // Relationships
  portfolio   Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
  portfolioId String
  projects    Project[]
  
  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@unique([portfolioId, slug])
}
```

### 2. Project Schema Design

```prisma
model Project {
  id          String   @id @default(cuid())
  title       String
  slug        String
  year        String?
  venue       String?
  role        String?
  description String?  @db.Text
  isFeatured  Boolean  @default(false)
  order       Int      @default(0)
  
  // Featured image (references existing Asset)
  featuredImageId String?
  featuredImage   Asset?   @relation("ProjectFeaturedImage", fields: [featuredImageId], references: [id])
  
  // Relationships
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId  String
  images      Asset[]  @relation("ProjectImages")
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([categoryId, slug])
}
```

### 3. Asset Model Updates

```prisma
model Asset {
  // ... existing fields ...
  
  // New optional relationships
  projectId   String?
  project     Project? @relation("ProjectImages", fields: [projectId], references: [id])
  
  // For featured images (reverse relations)
  categoryFeatured Category[]
  projectFeatured  Project[] @relation("ProjectFeaturedImage")
}
```

### 4. Migration Strategy Document

Document must address:
- How existing FeaturedGrid section items map to Projects
- Default category creation for orphaned content
- Asset reassignment approach
- Rollback strategy
- Data validation checks

## Demo Script (30 seconds)
1. Open `plans/design/CONTENT-MODEL.md`
2. Review the Category schema - fields, relationships, constraints
3. Review the Project schema - all metadata fields present
4. Check relationship diagram showing Portfolio -> Categories -> Projects
5. Open `plans/design/MIGRATION-STRATEGY.md`
6. Review migration steps and rollback plan
7. Verify backward compatibility notes for existing content
8. **Success**: Schema design is complete and documented

## Success Criteria

### Documentation Requirements
- [ ] Category schema documented with all fields and types
- [ ] Project schema documented with all fields and types
- [ ] Asset model updates documented for new relationships
- [ ] Relationship diagram shows Portfolio -> Categories -> Projects -> Assets
- [ ] Unique constraints defined (slug uniqueness per parent)
- [ ] Cascade delete behavior documented
- [ ] Index recommendations documented

### Migration Planning Requirements
- [ ] Migration strategy document created
- [ ] FeaturedGrid to Project mapping defined
- [ ] Default category handling specified
- [ ] Asset reassignment approach documented
- [ ] Rollback procedure documented
- [ ] Data validation checklist created
- [ ] Estimated migration time noted

### Design Decisions
- [ ] Featured image uses reference (not copy) to existing Asset
- [ ] Projects belong to exactly one Category
- [ ] Categories belong to exactly one Portfolio
- [ ] Slug uniqueness scoped to parent (category slug unique per portfolio, project slug unique per category)
- [ ] Soft delete vs hard delete decision documented

## Integration Points

These elements are designed to be extended:
- **Category/Project schemas** - Foundation for Slice 15 Prisma implementation
- **Migration strategy** - Guide for Slice 15 database migration
- **Asset relationships** - Used by Slice 16 Image Picker for source tracking
- **Content hierarchy** - Informs Slice 17 Category Management UI navigation

## Open Questions to Resolve

Document decisions for these questions:
1. Should Projects be movable between Categories after creation?
2. What happens to a Category's projects when Category is deleted?
3. Should there be a maximum number of featured projects?
4. How are project slugs generated (auto from title vs user-defined)?
5. Should Categories support nesting (sub-categories)? Decision: NO for v1

## Effort Estimate

**Total: 4-6 hours**
- Schema design: 2-3 hours
- Migration planning: 1-2 hours
- Documentation updates: 1 hour
