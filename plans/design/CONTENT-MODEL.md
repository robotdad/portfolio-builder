# Content Model for Portfolio Builder

**Purpose:** Define how content is structured and organized  
**Status:** Design specification (pre-implementation)  
**Last Updated:** 2025-12-28

---

## Overview

The content model defines how users organize their work. Templates and themes adapt to whatever structure users create.

**Key principle:** User-defined organization, system-provided patterns.

---

## Content Hierarchy

```
Portfolio (one per user)
├── Settings
│   ├── Selected Template (Featured Grid, Hero Carousel, Clean Minimal)
│   ├── Selected Theme (Modern Minimal, Classic Elegant, Bold Editorial)
│   └── Resume PDF (optional)
│
├── Categories (user-defined, unlimited)
│   ├── Name (user provides: "Theatre", "Film", "Opera", "Personal", etc.)
│   ├── Description (optional)
│   ├── Display order (user controls)
│   └── Projects []
│
└── Projects (within categories)
    ├── Title (user provides: "Hamlet 2024", "Romeo & Juliet")
    ├── Metadata
    │   ├── Year (optional)
    │   ├── Venue (optional: "Shakespeare Theatre")
    │   ├── Role (optional: "Lead Designer", "First Hand")
    │   ├── Collaborators (optional)
    │   └── Description (optional, text block)
    ├── Featured status (boolean - shows on landing page)
    ├── Featured image (one image for cards/carousels)
    ├── Images [] (gallery)
    │   ├── Image file
    │   ├── Alt text (required for accessibility)
    │   ├── Caption (optional)
    │   └── Display order (user controls)
    └── Display order within category (user controls)
```

---

## User-Defined Elements

**Categories:**
- User creates and names (NOT preset)
- Examples: "Theatre", "Film", "Opera", "Crafts", "Sketches", "Personal"
- Can reorganize, rename, delete
- Navigation menu reflects user's categories

**Projects:**
- User creates and names within categories
- Examples: "Hamlet 2024", "Romeo & Juliet", "Period Drama Film"
- Can move between categories
- Can mark as featured (shows on landing page)

**Metadata:**
- ALL metadata is optional
- System works with minimal input (just images)
- Hover overlays show whatever metadata exists
- Templates adapt to available content

---

## Featured Work Selection

**Principle:** User controls what's prominent on landing page.

**Mechanism:**
- User marks projects as "featured" (toggle)
- Featured projects appear on landing page
- Template determines HOW they appear (carousel, grid, etc.)

**Limits:**
- Featured Grid template: 4-6 featured projects recommended
- Hero Carousel template: 3-8 featured projects
- Clean Minimal template: 6 featured projects

**User flow:**
1. Upload project images
2. Mark project as "Featured" (checkbox or toggle)
3. Landing page automatically includes it
4. Reorder featured projects (drag-and-drop)

---

## Content Slots (What Templates Expect)

### All Templates Expect:

**Portfolio Level:**
- `name` (required): "Sarah Chen"
- `title` (optional): "Theatre Costume Designer"
- `resume_pdf` (optional): Uploaded PDF file
- `featured_projects[]` (required for landing): List of projects marked as featured

**Category Level:**
- `category_name` (required, user-defined): "Theatre Work"
- `category_description` (optional): "Classical and contemporary productions"
- `projects[]` (required): List of projects in this category

**Project Level:**
- `project_title` (required): "Hamlet 2024"
- `featured_image` (required): One image representing project (used in cards)
- `year` (optional): "2024"
- `venue` (optional): "Shakespeare Theatre"
- `description` (optional): Text block about the project
- `images[]` (required): Gallery images for this project

**Image Level:**
- `image_file` (required): The actual image
- `alt_text` (required for accessibility): "Elizabethan court costumes"
- `caption` (optional): Hover/click to reveal

---

## Upload Workflows

### Workflow 1: Create New Project

```
1. User navigates to category (or creates new category)
   → "Theatre Work" category

2. Clicks "New Project"
   → Form appears

3. Provides project info:
   - Title: "Hamlet 2024" (required)
   - Year: "2024" (optional)
   - Venue: "Shakespeare Theatre" (optional)
   - Description: "Elaborate Elizabethan court costumes..." (optional)

4. Uploads images (drag-and-drop or file picker)
   → Multiple images at once (batch upload)

5. Selects featured image
   → Which image represents this project in cards/carousel

6. Optionally adds captions to individual images
   → Can skip this, add later

7. Marks as "Featured" if should appear on landing
   → Toggle checkbox

8. Saves project
   → Appears in category
   → If featured, appears on landing page
```

### Workflow 2: Add Images to Existing Project

```
1. Navigate to project page
2. Click "Add Images" button
3. Upload new images (batch)
4. Optionally add captions
5. Images appear in project gallery
```

### Workflow 3: Reorganize Featured Work

```
1. Go to landing page (or settings)
2. See all featured projects
3. Drag-and-drop to reorder
4. Landing page updates immediately (draft mode)
5. Publish when ready
```

---

## Template Adaptability

**Key requirement:** Templates adapt to user's content structure

**Example: User with 2 categories**
```
Navigation:
- Home
- Theatre (user-defined category)
- Film (user-defined category)
- About
- Contact
```

**Example: User with 6 categories**
```
Navigation:
- Home
- Theatre (user-defined)
- Film (user-defined)
- Opera (user-defined)
- Sketches (user-defined)
- Crafts (user-defined)
- Personal (user-defined)
- About
- Contact
```

**Template handles this by:**
- Dynamically generating navigation from user's categories
- Adapting grid layouts to content volume
- Maintaining visual consistency regardless of content amount

---

## Graceful Degradation

**Principle:** Templates work beautifully with minimal input.

**Minimal viable content:**
- Portfolio name: "Sarah Chen"
- One category: "Work"
- One project: "Recent Production"
- One image: uploaded
- Result: Complete, professional-looking site

**Progressive enhancement:**
- Add resume → Appears in navigation
- Add more images → Gallery populates
- Add descriptions → Hover overlays show them
- Mark as featured → Appears on landing
- Create categories → Navigation organizes them

**Design implication:**
- Components designed for "empty states" (placeholder text)
- Hover overlays work with just project title (no year/venue)
- Cards work without descriptions
- Galleries work with 1 image or 100

---

## Database Schema Implications

**For tech session to consider:**

```typescript
// User creates these (NOT preset)
Category {
  id: string
  user_id: string
  name: string              // User-defined: "Theatre", "Film", etc.
  description?: string      // Optional
  display_order: number     // User controls
}

Project {
  id: string
  category_id: string
  title: string             // User-defined: "Hamlet 2024"
  year?: string             // Optional
  venue?: string            // Optional
  description?: string      // Optional
  featured: boolean         // Show on landing page?
  featured_image_id: string // Which image represents project
  display_order: number     // Within category, user controls
}

Image {
  id: string
  project_id: string
  file_url: string          // Optimized images (display, thumb, placeholder)
  alt_text: string          // Required for accessibility
  caption?: string          // Optional, for hover/lightbox
  display_order: number     // Within project, user controls
}

PortfolioSettings {
  user_id: string
  template: string          // "featured-grid-landing" | "hero-carousel" | "clean-minimal"
  theme: string             // "modern-minimal" | "classic-elegant" | "bold-editorial"
  resume_pdf_url?: string   // Optional
  name: string              // "Sarah Chen"
  title?: string            // Optional: "Theatre Costume Designer"
}
```

**Important for templates:**
- Featured projects query: `SELECT * FROM projects WHERE featured = true ORDER BY display_order`
- Category projects query: `SELECT * FROM projects WHERE category_id = ? ORDER BY display_order`
- Landing page needs: PortfolioSettings + featured projects + their featured images

---

## Template Requirements from Content Model

**All templates must:**
- Render with 0 featured projects (show prompt to mark some)
- Render with 1-100 featured projects (grid pagination or carousel)
- Handle 1-20 categories in navigation
- Handle 1-100 projects per category
- Handle 1-100 images per project
- Work with minimal metadata (just title + image)
- Work with rich metadata (title + year + venue + description)

**Performance considerations:**
- Lazy-load images below fold
- Paginate if >50 projects in category
- Optimize featured images (critical for landing page load time)

---

## Validation Questions for Templates

When implementing templates, validate:

- [ ] Works with user-defined category names (not hardcoded "Theatre/Film")?
- [ ] Adapts to 2 categories vs 10 categories?
- [ ] Handles 0 featured projects gracefully (prompts user)?
- [ ] Handles 20 featured projects (pagination or limits)?
- [ ] Works with no metadata (just images)?
- [ ] Works with rich metadata (descriptions, credits)?
- [ ] Mobile navigation works with many categories?
- [ ] Featured work selection is obvious to user?

---

## Next: Template Specifications

With this content model defined, templates can specify:
- Which content slots they use
- How they organize the content
- What happens with minimal vs maximal content
- How swapping templates preserves content

**Proceeding to template specs now...**
