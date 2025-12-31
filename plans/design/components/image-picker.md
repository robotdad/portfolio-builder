# Component: Image Picker

**Purpose:** Select existing images from the site for use as featured content  
**Customer insight:** Two distinct workflows needed - upload new vs. pick existing (avoid duplicates)  
**Used in:** Featured image selection, cross-referencing gallery images, hero backgrounds

---

## Problem Analysis

### Current Workflow
```
Want to use existing image as featured?
→ Download from gallery page
→ Re-upload to new location
→ Creates duplicate storage
→ No connection between uses
```

### Image Picker Workflow
```
Want to use existing image as featured?
→ Open picker
→ Browse/search all site images
→ Select
→ References existing image
→ No duplication
```

---

## Visual Specification

### Modal Layout (Desktop)

```
┌────────────────────────────────────────────────────────────────┐
│ Choose Featured Image                                     [X]  │  ← Header
├────────────────────────────────────────────────────────────────┤
│ 🔍 Search images...                                            │  ← Search
│                                                                │
│ Filter: [All Pages ▾]                     View: [Grid] [List]  │  ← Controls
│                                                                │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │         │ │         │ │  ✓      │ │         │ │         │   │  ← Grid
│ │  img    │ │  img    │ │  img    │ │  img    │ │  img    │   │
│ │         │ │         │ │         │ │         │ │         │   │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│   About      About      Home ✓      Home        Work          │  ← Source
│                                                                │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│ │         │ │         │ │         │ │         │               │
│ │  img    │ │  img    │ │  img    │ │  img    │               │
│ │         │ │         │ │         │ │         │               │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
│   Work       Work       Theatre     Theatre                    │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                              [Cancel]  [Use Selected Image]    │  ← Actions
└────────────────────────────────────────────────────────────────┘
```

**Modal styling:**
```css
.image-picker-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 900px;
  max-height: 85vh;
  background: var(--color-background);
  border-radius: 12px;
  box-shadow: 0 8px 32px hsla(0, 0%, 0%, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 1001;
  animation: modalIn var(--duration-standard) var(--ease-out);
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.image-picker-backdrop {
  position: fixed;
  inset: 0;
  background: hsla(0, 0%, 0%, 0.5);
  z-index: 1000;
}
```

---

### Header

```css
.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.picker-title {
  font-family: var(--font-heading);
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.picker-close {
  width: var(--touch-min);  /* 44px */
  height: var(--touch-min);
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: background var(--duration-quick) var(--ease-smooth);
}

.picker-close:hover {
  background: hsla(var(--color-accent-hsl), 0.1);
}

.picker-close svg {
  width: 24px;
  height: 24px;
}
```

---

### Search and Filters

```css
.picker-controls {
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.picker-search {
  position: relative;
}

.picker-search-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  padding-left: 44px;  /* Space for icon */
  font-size: var(--font-size-body);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text-primary);
  transition: border-color var(--duration-quick) var(--ease-smooth);
}

.picker-search-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.picker-search-input::placeholder {
  color: var(--color-text-tertiary);
}

.picker-search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--color-text-tertiary);
}

.picker-filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.picker-filter-select {
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-small);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-text-primary);
  cursor: pointer;
}

.picker-view-toggle {
  display: flex;
  gap: var(--space-1);
}

.picker-view-btn {
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--duration-quick) var(--ease-smooth);
}

.picker-view-btn:first-child {
  border-radius: 6px 0 0 6px;
}

.picker-view-btn:last-child {
  border-radius: 0 6px 6px 0;
}

.picker-view-btn.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
}
```

---

### Image Grid

```css
.picker-grid {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4) var(--space-5);
}

.picker-grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--space-4);
}

.picker-grid-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: var(--color-surface);
  border: 2px solid transparent;
  transition: border-color var(--duration-quick) var(--ease-smooth),
              transform var(--duration-quick) var(--ease-smooth);
}

.picker-grid-item:hover {
  transform: scale(1.02);
}

.picker-grid-item:focus {
  outline: none;
  border-color: var(--color-accent);
}

.picker-grid-item.selected {
  border-color: var(--color-accent);
}

.picker-grid-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.picker-grid-item-check {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  width: 24px;
  height: 24px;
  background: var(--color-accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--duration-quick) var(--ease-smooth);
}

.picker-grid-item.selected .picker-grid-item-check {
  opacity: 1;
}

.picker-grid-item-check svg {
  width: 16px;
  height: 16px;
  color: white;
}

.picker-grid-item-source {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--space-2);
  background: linear-gradient(transparent, hsla(0, 0%, 0%, 0.7));
  font-size: var(--font-size-tiny);
  color: white;
  text-align: center;
}
```

---

### Footer Actions

```css
.picker-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
}

.picker-btn-cancel {
  padding: var(--space-3) var(--space-5);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--duration-quick) var(--ease-smooth);
}

.picker-btn-cancel:hover {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.picker-btn-confirm {
  padding: var(--space-3) var(--space-5);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: white;
  background: var(--color-accent);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background var(--duration-quick) var(--ease-smooth);
}

.picker-btn-confirm:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

.picker-btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## UI States

### Loading State

```
┌────────────────────────────────────────────────────────────────┐
│ Choose Featured Image                                     [X]  │
├────────────────────────────────────────────────────────────────┤
│ 🔍 Search images...                                            │
│                                                                │
│                                                                │
│                    ◠───◠                                       │
│                   ╱     ╲                                      │
│                  ╱       ╲    Loading images...                │
│                  ╲       ╱                                      │
│                   ╲─────╱                                       │
│                                                                │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                              [Cancel]  [Use Selected Image]    │
└────────────────────────────────────────────────────────────────┘
```

```css
.picker-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-10);
  gap: var(--space-4);
}

.picker-loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.picker-loading-text {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}
```

---

### Empty State

```
┌────────────────────────────────────────────────────────────────┐
│ Choose Featured Image                                     [X]  │
├────────────────────────────────────────────────────────────────┤
│ 🔍 Search images...                                            │
│                                                                │
│                                                                │
│                      📷                                        │
│                                                                │
│               No images yet                                    │
│                                                                │
│         Upload images to your pages first,                     │
│         then you can select them here.                         │
│                                                                │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                              [Cancel]                          │
└────────────────────────────────────────────────────────────────┘
```

```css
.picker-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-10);
  text-align: center;
}

.picker-empty-icon {
  width: 64px;
  height: 64px;
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-4);
}

.picker-empty-title {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.picker-empty-description {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  max-width: 300px;
}
```

---

### No Results State

```
┌────────────────────────────────────────────────────────────────┐
│ Choose Featured Image                                     [X]  │
├────────────────────────────────────────────────────────────────┤
│ 🔍 hamlet costumes                                      [X]    │
│                                                                │
│ Filter: [Theatre ▾]                                            │
│                                                                │
│                                                                │
│                      🔍                                        │
│                                                                │
│            No matching images                                  │
│                                                                │
│            [Clear filters]                                     │
│                                                                │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                              [Cancel]  [Use Selected Image]    │
└────────────────────────────────────────────────────────────────┘
```

```css
.picker-no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-10);
  text-align: center;
}

.picker-no-results-icon {
  width: 48px;
  height: 48px;
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-4);
}

.picker-no-results-title {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
}

.picker-clear-btn {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-body);
  color: var(--color-accent);
  background: none;
  border: 1px solid var(--color-accent);
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--duration-quick) var(--ease-smooth);
}

.picker-clear-btn:hover {
  background: hsla(var(--color-accent-hsl), 0.1);
}
```

---

## Data Model

```typescript
interface SiteImage {
  /** Unique identifier */
  id: string;
  
  /** Full-size image URL */
  url: string;
  
  /** Thumbnail URL (for grid display) */
  thumbnailUrl: string;
  
  /** Original filename */
  filename: string;
  
  /** Where this image lives */
  source: {
    pageId: string;
    pageTitle: string;
    sectionType: 'hero' | 'gallery' | 'content' | 'profile';
  };
  
  /** Image metadata */
  meta: {
    width: number;
    height: number;
    uploadedAt: string;  // ISO date
    fileSize: number;    // bytes
    alt?: string;        // Alt text if provided
  };
}
```

---

## Component Interface

```typescript
interface ImagePickerProps {
  /** Controls modal open/closed state */
  isOpen: boolean;
  
  /** Currently selected image ID (for pre-selection) */
  selectedId?: string;
  
  /** Called when user confirms selection */
  onSelect: (image: SiteImage) => void;
  
  /** Called when user cancels or closes */
  onCancel: () => void;
  
  /** Optional filters to constrain available images */
  filter?: {
    /** Exclude images from this page (e.g., current page) */
    excludePageId?: string;
    
    /** Minimum image width required */
    minWidth?: number;
    
    /** Minimum image height required */
    minHeight?: number;
    
    /** Only show images from specific section types */
    sectionTypes?: Array<'hero' | 'gallery' | 'content' | 'profile'>;
  };
  
  /** Modal title */
  title?: string;  // default: "Choose Image"
}

interface ImagePickerState {
  status: 'loading' | 'empty' | 'populated' | 'no-results';
  images: SiteImage[];
  filteredImages: SiteImage[];
  selectedId: string | null;
  searchQuery: string;
  pageFilter: string | null;  // null = all pages
}
```

**Usage:**
```tsx
<ImagePicker
  isOpen={showPicker}
  selectedId={currentFeaturedImageId}
  onSelect={(image) => {
    setFeaturedImage(image);
    setShowPicker(false);
  }}
  onCancel={() => setShowPicker(false)}
  filter={{
    excludePageId: currentPageId,
    minWidth: 800,
  }}
  title="Choose Featured Image"
/>
```

---

## Selection Flow

```typescript
const handleImageClick = (image: SiteImage) => {
  // Single click selects (toggles)
  if (selectedId === image.id) {
    setSelectedId(null);
  } else {
    setSelectedId(image.id);
  }
};

const handleConfirm = () => {
  if (!selectedId) return;
  
  const image = images.find(img => img.id === selectedId);
  if (image) {
    onSelect(image);
  }
};

// Double-click for quick select + confirm
const handleImageDoubleClick = (image: SiteImage) => {
  onSelect(image);
};
```

---

## Search and Filter Logic

```typescript
const filterImages = (
  images: SiteImage[],
  searchQuery: string,
  pageFilter: string | null
): SiteImage[] => {
  return images.filter(image => {
    // Page filter
    if (pageFilter && image.source.pageId !== pageFilter) {
      return false;
    }
    
    // Search query (matches filename, page title, alt text)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesFilename = image.filename.toLowerCase().includes(query);
      const matchesPage = image.source.pageTitle.toLowerCase().includes(query);
      const matchesAlt = image.meta.alt?.toLowerCase().includes(query);
      
      if (!matchesFilename && !matchesPage && !matchesAlt) {
        return false;
      }
    }
    
    return true;
  });
};
```

---

## Mobile Layout

On mobile (< 768px), modal becomes full-screen:

```
┌──────────────────────────────────────┐
│ ← Choose Featured Image              │  ← Back arrow + title
├──────────────────────────────────────┤
│ 🔍 Search images...                  │
│                                      │
│ Filter: [All Pages ▾]                │
├──────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐    │
│ │        │ │   ✓    │ │        │    │  ← 3 columns
│ │  img   │ │  img   │ │  img   │    │
│ └────────┘ └────────┘ └────────┘    │
│   About     Home ✓     Work          │
│                                      │
│ ┌────────┐ ┌────────┐ ┌────────┐    │
│ │        │ │        │ │        │    │
│ │  img   │ │  img   │ │  img   │    │
│ └────────┘ └────────┘ └────────┘    │
│                                      │
├──────────────────────────────────────┤
│         [Use Selected Image]         │  ← Sticky footer
└──────────────────────────────────────┘
```

```css
@media (max-width: 767px) {
  .image-picker-modal {
    position: fixed;
    inset: 0;
    max-width: none;
    max-height: none;
    border-radius: 0;
    transform: none;
  }
  
  .picker-header {
    padding: var(--space-3) var(--space-4);
  }
  
  .picker-title {
    font-size: var(--font-size-body);
  }
  
  .picker-close {
    /* Replace X with back arrow */
  }
  
  .picker-grid-container {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-2);
  }
  
  .picker-footer {
    position: sticky;
    bottom: 0;
    padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom));
  }
  
  .picker-btn-cancel {
    display: none;  /* Back arrow serves as cancel */
  }
  
  .picker-btn-confirm {
    flex: 1;
  }
}
```

---

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move between search, filter, grid items |
| `Arrow keys` | Navigate grid (2D navigation) |
| `Enter` / `Space` | Select focused image |
| `Escape` | Close picker (Cancel) |

**Grid navigation:**
```typescript
const handleGridKeyDown = (e: KeyboardEvent, index: number) => {
  const columns = getColumnCount();  // Based on viewport
  let newIndex = index;
  
  switch (e.key) {
    case 'ArrowRight':
      newIndex = index + 1;
      break;
    case 'ArrowLeft':
      newIndex = index - 1;
      break;
    case 'ArrowDown':
      newIndex = index + columns;
      break;
    case 'ArrowUp':
      newIndex = index - columns;
      break;
  }
  
  // Clamp to valid range
  newIndex = Math.max(0, Math.min(newIndex, images.length - 1));
  
  if (newIndex !== index) {
    e.preventDefault();
    gridItemRefs[newIndex].current?.focus();
  }
};
```

---

## Accessibility

**ARIA structure:**
```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="picker-title"
>
  <h2 id="picker-title">Choose Featured Image</h2>
  
  <input
    type="search"
    aria-label="Search images"
    placeholder="Search images..."
  />
  
  <div
    role="listbox"
    aria-label="Available images"
    aria-multiselectable="false"
  >
    <button
      role="option"
      aria-selected="true"
      aria-label="Hamlet costumes from Theatre page, 1200x800 pixels"
    >
      <img src="..." alt="" />  <!-- Decorative, label provides info -->
    </button>
  </div>
</div>
```

**Focus management:**
- Focus moves to search input when modal opens
- Focus trapped within modal
- Focus returns to trigger when modal closes

**Screen reader:**
- Announces modal title when opened
- Announces selected state on images
- Announces result count after search/filter

---

## Theme Integration

**Theme controls:**
- Background color (modal, surface)
- Border color
- Text colors (primary, secondary, tertiary)
- Accent color (selection, buttons)

**Theme does NOT control:**
- Modal border radius (12px)
- Grid gap (design system token)
- Shadow depth (constant)
- Overlay opacity (50%)

---

## Validation Checklist

- [ ] Modal opens centered on desktop
- [ ] Modal is full-screen on mobile
- [ ] Search filters images by filename, page, alt
- [ ] Page filter dropdown works
- [ ] Single click selects image
- [ ] Double click selects and confirms
- [ ] Selection shows checkmark overlay
- [ ] Cancel button closes without selection
- [ ] Confirm button disabled when nothing selected
- [ ] Escape key closes modal
- [ ] Loading state shows spinner
- [ ] Empty state shows guidance
- [ ] No results shows clear filters button
- [ ] Arrow keys navigate grid
- [ ] Enter/Space select image
- [ ] Focus trapped within modal
- [ ] Screen reader announces state changes
- [ ] Works with all themes (Modern, Classic, Bold)

---

## Implementation Notes

**Dependencies:**
- Modal component (or create inline)
- Image catalog API endpoint
- Focus trap hook

**API endpoint needed:**
```typescript
GET /api/images
Query params:
  - pageId?: string (filter by page)
  - search?: string (search query)
  - minWidth?: number
  - minHeight?: number

Response:
{
  images: SiteImage[];
  totalCount: number;
}
```

**Estimate:** 8-12 hours

**Shared components:**
- `Modal` base component
- `SearchInput` with clear button
- `SelectDropdown` for filter

---

**Related:** image-upload-pattern.md (upload new), gallery-grid.md (display images)
