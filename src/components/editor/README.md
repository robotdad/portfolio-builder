# Editor Components

Rich text and section-based content editing components.

## Content Model

Pages and projects use a **section-based content model** stored as JSON in `draftContent`/`publishedContent` fields.

```typescript
type Section = 
  | TextSection      // Rich text via TipTap
  | ImageSection     // Single image with caption
  | HeroSection      // Large hero image
  | GallerySection   // Image gallery grid
  | FeaturedGridSection    // Featured projects grid
  | FeaturedCarouselSection // Featured projects carousel
```

See `lib/content-schema.ts` for full type definitions and type guards.

## Core Components

### SectionList
Manages an array of sections with add/edit/delete/reorder.

**Props:** `sections`, `onChange`  
**Uses:** `@dnd-kit` for drag-to-reorder  
**Pattern:** Each section rendered via `SectionRenderer`, edit via `SectionEditor`

### SectionRenderer
Read-only rendering of a section by type.

**Pattern:** Switch on `section.type`, render appropriate display component

### SectionEditor
Edit mode for a section, type-specific form.

**Pattern:** Switch on `section.type`, render appropriate editor

### AddSectionButton
Dropdown menu to add new sections.

**Options:** Text, Image, Hero, Gallery, Featured Grid, Featured Carousel

## Rich Text

### RichTextEditor
TipTap-based rich text editor.

**Features:** Bold, italic, headings, lists, links  
**Props:** `content` (TipTap JSON), `onChange`  
**Note:** Content stored as TipTap JSON, not HTML

### Toolbar
Formatting toolbar for RichTextEditor.

**Pattern:** Connected to TipTap editor instance via context

## Image Components

### ImageUpload
Drag-and-drop or click-to-upload image component.

**Uses:** `useImageUpload` hook  
**Pattern:** Shows upload progress, optimistic preview  
**Note:** Mobile uses native file input for better UX

### ImageSection / ImageSectionEditor
Display and edit single image with optional caption.

### GallerySection / GallerySectionEditor  
Display and edit image gallery grid.

**Pattern:** Uses `GalleryManager` for editing

## Section Types

### TextSection
Rich text content block.

**Fields:** `content` (TipTap JSON)

### ImageSection
Single image with caption.

**Fields:** `imageId`, `caption`, `altText`

### HeroSection
Large hero/banner image.

**Fields:** `imageId`, `title`, `subtitle`

### GallerySection
Grid of images.

**Fields:** `images[]` (array of image refs), `columns`

### FeaturedGridSection / FeaturedCarouselSection
Display featured projects from the portfolio.

**Fields:** `title`, `projectIds[]` or `showAll`  
**Note:** These pull from Project records, not inline content
