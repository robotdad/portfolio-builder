# Vertical Slice Specifications

## Overview

This directory contains self-contained slice specifications for the portfolio builder. Each slice delivers complete end-to-end user value.

**Current Status:** Slices 1-22 implemented with UX issues. Slices 23-25 ready for admin coherence remediation.

## Build Order

| # | Slice | Duration | Status |
|---|-------|----------|--------|
| 1 | [Static Page Foundation](01-static-page-foundation.md) | 2-3 weeks | ✅ Complete |
| 2 | [Rich Text Editing](02-rich-text-editing.md) | 2-3 weeks | ✅ Complete |
| 3 | [Single Image Upload](03-single-image-upload.md) | 2-3 weeks | ✅ Complete |
| 4 | [Mobile Editing Basics](04-mobile-editing-basics.md) | 1-2 weeks | ✅ Complete |
| 5 | [Component System & Sections](05-component-system-sections.md) | 2-3 weeks | ✅ Complete |
| 6 | [Image Gallery Component](06-image-gallery-component.md) | 2-3 weeks | ✅ Complete |
| 7 | [Multiple Pages & Navigation](07-multiple-pages-navigation.md) | 2-3 weeks | ✅ Complete |
| 8 | [Draft/Publish Workflow](08-draft-publish-workflow.md) | 2-3 weeks | ✅ Complete |
| 9 | [Theme Selection UI](09-theme-selector.md) | 4-6 hours | ✅ Complete |
| 10 | [Image Upload Standardization](10-image-upload-standardization.md) | 2-4 hours | ✅ Complete |
| 11 | [Smart Add Section Button](11-smart-add-section.md) | 4-6 hours | ✅ Complete |
| 12 | [Settings to Header](12-settings-to-header.md) | 3-4 hours | ✅ Complete |
| 13 | [Home Page Routing](13-home-page-routing.md) | 2-3 hours | ✅ Complete |
| 14 | [Content Model Schema Design](14-content-model-schema.md) | 4-6 hours | ✅ Complete |
| 15 | [Category & Project Models](15-category-project-models.md) | 8-12 hours | ✅ Complete |
| 16 | [Image Picker Component](16-image-picker.md) | 8-12 hours | ✅ Complete |
| 17 | [Category Management UI](17-category-management.md) | 8-12 hours | ✅ Complete |
| 18 | [Project Management UI](18-project-management-ui.md) | 12-16 hours | ✅ Complete |
| 19 | [Simple Onboarding Flow](19-simple-onboarding-flow.md) | 8-10 hours | ✅ Complete |
| 20 | [Admin Sidebar Navigation](20-admin-sidebar.md) | 8-12 hours | ✅ Complete |
| 21 | [Mobile Drawer Navigation](21-mobile-drawer.md) | 4-6 hours | ✅ Complete |
| 22 | [Public Category/Project Pages](22-public-category-project-pages.md) | 10-12 hours | ✅ Complete |
| 23 | [Admin Navigation Structure](23-admin-navigation-structure.md) | 14-22 hours | 📝 Ready |
| 24 | [Admin Pattern Unification](24-admin-pattern-unification.md) | 10-14 hours | 📝 Ready |
| 25 | [Admin Code Quality](25-admin-code-quality.md) | 8-13 hours | 📝 Ready |

## Completed Work

**Slices 1-22 deliver:**
- ✅ Single-page portfolio creation with sections
- ✅ Mobile-first editing experience
- ✅ Draft/publish workflow
- ✅ Image upload and management
- ✅ Multi-page navigation
- ✅ Theme system foundation (3 preset themes)
- ✅ Category and Project data models
- ✅ Category and Project management UI
- ✅ Image picker for site-wide image browsing
- ✅ Simple onboarding flow (portfolio + theme + first project)
- ✅ Public category and project pages (visitor-facing)
- ✅ Admin sidebar (desktop) and drawer (mobile) structure

## Current Status: UX Coherence Issues

**After Slices 18-22, admin interface has fragmentation issues:**
- Navigation structure incomplete (drawer empty, pages not in nav)
- Card pattern misused for hierarchical management
- Indirect interactions (hidden menus instead of direct clicks)
- Inconsistent patterns across admin

## Next Implementation Priority

**Admin Interface Remediation (Slices 23-25):**

1. **Slice 23: Admin Navigation Structure** - Populate drawer/sidebar with pages, categories tree, breadcrumbs
2. **Slice 24: Admin Pattern Unification** - Replace cards with lists, direct navigation, consistent interactions
3. **Slice 25: Admin Code Quality** - Extract CSS, document patterns, improve maintainability

## Implementation Guidance

### Before Starting Any Slice

1. **[VISION.md](../VISION.md)** - Understand the "why" and success criteria
2. **[USERS.md](../USERS.md)** - Understand who you're building for
3. **[PRINCIPLES.md](../PRINCIPLES.md)** - Core implementation principles
4. **[TECH_STACK.md](../TECH_STACK.md)** - Technology decisions and patterns

### When Starting a Specific Slice

1. Read the slice spec (e.g., `18-project-management-ui.md`)
2. Review design context files referenced via @mentions
3. Check existing patterns in codebase that the slice references
4. Set up test data as needed
5. Begin implementation following the demo script as validation

## Slice Structure

Each slice specification includes:

- **Goal** - User value delivered by this slice
- **Context** - References to principles and design materials
- **Scope** - What's included and explicitly NOT included
- **Tech Stack** - Technologies used in this slice
- **Key Files** - Files created/modified
- **Demo Script** - 30-second test scenario
- **Success Criteria** - Measurable checkboxes with categories:
  - Functional Requirements
  - Design Requirements
  - Accessibility Requirements
  - Mobile Requirements
- **Pattern Reference** - Code examples from existing codebase
- **Integration Points** - Elements designed to be extended
- **Effort Estimate** - Time breakdown by component

## References

- **[../VISION.md](../VISION.md)** - Product vision and design principles
- **[../USERS.md](../USERS.md)** - User personas and success scenarios
- **[../ARCHITECTURE.md](../ARCHITECTURE.md)** - Technical architecture and decisions
- **[../IMPLEMENTATION_APPROACH.md](../IMPLEMENTATION_APPROACH.md)** - Development methodology
- **[../IMPLEMENTATION_GUIDE.md](../IMPLEMENTATION_GUIDE.md)** - Practical implementation guide
- **[../test-data/](../test-data/)** - Test user profiles and sample data

## Questions?

If slice specs are unclear or contradictory, refer to the core documents above or flag issues before starting implementation.
