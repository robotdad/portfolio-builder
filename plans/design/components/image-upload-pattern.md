# Component: Image Upload Pattern

**Purpose:** Standardize optimistic image upload behavior across the application  
**Customer insight:** Gallery images apply immediately; profile photos required extra "Save" click (inconsistent)  
**Used in:** Profile photo, hero image, gallery images, any image upload

---

## Interaction Flow

### Current (Inconsistent)
```
Click Upload → Select File → Preview → Click Save → Applied
                              ↑
                         Extra step (profile photo)
```

### Recommended (Optimistic)
```
Click Upload → Select File → Applied + Toast with Undo
                                  │
                                  └──→ Undo clicked?
                                      Yes: Revert to previous
                                      No (5s timeout): Committed
```

**Rationale:** Match existing gallery behavior. Immediate feedback feels faster. Undo provides safety net without blocking workflow.

---

## Visual States

### Idle State

```
┌──────────────────────────┐
│                          │
│     ┌──────────────┐     │
│     │   📷         │     │  ← Icon or current image
│     │              │     │
│     │  Click or    │     │  ← Instruction text
│     │  drag to     │     │
│     │  upload      │     │
│     └──────────────┘     │
│                          │
└──────────────────────────┘
```

**Styling:**
```css
.upload-zone {
  position: relative;
  border: 2px dashed var(--color-border);
  border-radius: 8px;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color var(--duration-quick) var(--ease-smooth),
              background-color var(--duration-quick) var(--ease-smooth);
}

.upload-zone:hover,
.upload-zone:focus-within {
  border-color: var(--color-accent);
  background: hsla(var(--color-accent-hsl), 0.05);
}

.upload-zone.drag-over {
  border-color: var(--color-accent);
  background: hsla(var(--color-accent-hsl), 0.1);
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-3);
}

.upload-text {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  text-align: center;
}

.upload-hint {
  font-size: var(--font-size-small);
  color: var(--color-text-tertiary);
  margin-top: var(--space-2);
}
```

---

### Uploading State

```
┌──────────────────────────┐
│                          │
│     ┌──────────────┐     │
│     │   ◠───◠      │     │  ← Progress ring overlay
│     │  ╱     ╲     │     │
│     │ ╱   42% ╲    │     │  ← Percentage (if known)
│     │ ╲       ╱    │     │
│     │  ╲─────╱     │     │
│     └──────────────┘     │
│                          │
└──────────────────────────┘
```

**Styling:**
```css
.upload-progress-overlay {
  position: absolute;
  inset: 0;
  background: hsla(0, 0%, 0%, 0.5);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring {
  width: 64px;
  height: 64px;
}

.progress-ring-circle {
  stroke: var(--color-accent);
  stroke-width: 4;
  fill: transparent;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dashoffset var(--duration-quick) var(--ease-smooth);
}

.progress-text {
  position: absolute;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: white;
}
```

**Behavior:**
- Show determinate progress if upload progress available
- Show indeterminate spinner if progress unknown
- Disable interaction during upload
- Allow cancel (optional, Phase 2)

---

### Success State (Toast)

```
┌─────────────────────────────────────────────┐
│  ✓  Photo updated              [Undo]       │  ← Toast notification
└─────────────────────────────────────────────┘
          ↑                        ↑
      Success icon            Undo button
          
Progress bar animation (5 seconds) ────────────→
```

**Toast styling:**
```css
.toast {
  position: fixed;
  bottom: var(--space-6);
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: var(--space-3) var(--space-4);
  box-shadow: 0 4px 12px hsla(0, 0%, 0%, 0.15);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  z-index: 1000;
  animation: slideUp var(--duration-standard) var(--ease-out);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.toast-icon {
  width: 20px;
  height: 20px;
  color: var(--color-success, #22c55e);
}

.toast-message {
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
}

.toast-undo {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-accent);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-2);
  margin: calc(-1 * var(--space-2));
  border-radius: 4px;
  transition: background var(--duration-quick) var(--ease-smooth);
}

.toast-undo:hover {
  background: hsla(var(--color-accent-hsl), 0.1);
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: var(--color-accent);
  border-radius: 0 0 8px 8px;
  animation: shrink 5s linear forwards;
}

@keyframes shrink {
  from { width: 100%; }
  to { width: 0%; }
}
```

---

### Error State (Toast)

```
┌─────────────────────────────────────────────┐
│  ⚠  Upload failed: File too large  [Retry]  │
└─────────────────────────────────────────────┘
```

**Error toast styling:**
```css
.toast-error .toast-icon {
  color: var(--color-error, #ef4444);
}

.toast-retry {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-accent);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-2);
}
```

**Error messages:**
| Error | Message |
|-------|---------|
| File too large | "Upload failed: File exceeds 10MB limit" |
| Invalid format | "Upload failed: Please use JPG, PNG, or WebP" |
| Network error | "Upload failed: Check your connection" |
| Server error | "Upload failed: Please try again" |

---

## Component Interface

```typescript
interface ImageUploadProps {
  /** Current image URL (undefined = no image) */
  currentImage?: string;
  
  /** Called when file selected, returns new image URL */
  onUpload: (file: File) => Promise<string>;
  
  /** Called when user clicks Undo (receives previous URL) */
  onRevert?: (previousUrl: string | undefined) => void;
  
  /** Context determines aspect ratio and messaging */
  context: 'profile' | 'gallery' | 'featured' | 'hero';
  
  /** Aspect ratio constraint for cropping/display */
  aspectRatio?: '1:1' | '16:9' | '4:3' | 'free';
  
  /** Maximum file size in megabytes */
  maxSizeMB?: number;  // default: 10
  
  /** Time in ms before undo expires */
  undoTimeout?: number;  // default: 5000
  
  /** Accessible label for the upload zone */
  'aria-label'?: string;
  
  /** Additional class names */
  className?: string;
  
  /** Disable upload interaction */
  disabled?: boolean;
}

interface ImageUploadState {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress?: number;  // 0-100 if known
  error?: string;
  previousImage?: string;  // For undo functionality
}
```

**Usage:**
```tsx
<ImageUpload
  currentImage={user.profilePhoto}
  onUpload={async (file) => {
    const url = await uploadImage(file, 'profile');
    await updateUser({ profilePhoto: url });
    return url;
  }}
  onRevert={async (previousUrl) => {
    await updateUser({ profilePhoto: previousUrl });
  }}
  context="profile"
  aspectRatio="1:1"
  aria-label="Upload profile photo"
/>
```

---

## Context-Specific Behavior

| Context | Aspect Ratio | Placeholder Text | Success Message |
|---------|--------------|------------------|-----------------|
| profile | 1:1 | "Add profile photo" | "Profile photo updated" |
| gallery | free | "Add images" | "Image added" |
| featured | 4:3 | "Add featured image" | "Featured image updated" |
| hero | 16:9 | "Add hero image" | "Hero image updated" |

---

## Undo Flow

```typescript
const handleUpload = async (file: File) => {
  // 1. Store previous image for potential revert
  const previousImage = currentImage;
  
  // 2. Upload and immediately apply
  const newUrl = await onUpload(file);
  setCurrentImage(newUrl);
  
  // 3. Show toast with undo
  showToast({
    message: getSuccessMessage(context),
    action: {
      label: 'Undo',
      onClick: () => {
        setCurrentImage(previousImage);
        onRevert?.(previousImage);
      }
    },
    duration: undoTimeout
  });
};
```

---

## Drag and Drop

**Supported:**
- Drag files from desktop
- Drag from other browser windows
- Multiple files (gallery context only)

**Validation on drop:**
```typescript
const validateFile = (file: File): string | null => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (!validTypes.includes(file.type)) {
    return 'Please use JPG, PNG, or WebP format';
  }
  
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `File exceeds ${maxSizeMB}MB limit`;
  }
  
  return null; // Valid
};
```

---

## Accessibility

**Keyboard navigation:**
- Tab to upload zone
- Enter/Space opens file picker
- Focus visible (2px outline)

**Screen reader:**
```html
<div
  role="button"
  tabindex="0"
  aria-label="Upload profile photo. Current photo: Sarah Chen headshot"
  aria-describedby="upload-hint"
>
  <input
    type="file"
    accept="image/jpeg,image/png,image/webp"
    aria-hidden="true"
    tabindex="-1"
  />
  <span id="upload-hint">
    Drag and drop or click to select. Maximum 10MB.
  </span>
</div>
```

**Toast announcements:**
```html
<div role="status" aria-live="polite">
  Photo updated. Press Undo within 5 seconds to revert.
</div>
```

**Error announcements:**
```html
<div role="alert" aria-live="assertive">
  Upload failed: File exceeds 10MB limit
</div>
```

---

## Mobile Considerations

**Touch interactions:**
- Tap upload zone → Opens native file picker
- Camera option available on mobile (capture="environment")
- No drag-and-drop on mobile (fallback to tap)

**File picker options:**
```html
<input
  type="file"
  accept="image/*"
  capture="environment"  /* Rear camera for gallery */
/>

<input
  type="file"
  accept="image/*"
  capture="user"  /* Front camera for profile */
/>
```

**Toast position:**
- Mobile: Bottom of screen, full width minus padding
- Safe area inset for notched devices

---

## Theme Integration

**Theme controls:**
- Border color (idle, hover, drag-over)
- Accent color (progress ring, undo button)
- Surface color (toast background)
- Text colors (primary, secondary, tertiary)

**Theme does NOT control:**
- Upload overlay opacity (constant for visibility)
- Toast shadow (constant for elevation)
- Progress ring stroke width (constant)

---

## Validation Checklist

- [ ] Click to upload opens file picker
- [ ] Drag and drop accepts valid files
- [ ] Drag over shows visual feedback
- [ ] Invalid file shows error toast
- [ ] Uploading state shows progress
- [ ] Success immediately shows new image
- [ ] Toast appears with Undo button
- [ ] Undo reverts to previous image
- [ ] Toast auto-dismisses after 5 seconds
- [ ] Error toast shows clear message
- [ ] Retry button works on error
- [ ] Keyboard navigable (Tab, Enter, Space)
- [ ] Screen reader announces state changes
- [ ] Focus indicator visible
- [ ] Touch target ≥ 44px on mobile
- [ ] Works with all contexts (profile, gallery, hero, featured)
- [ ] Works with all themes (Modern, Classic, Bold)

---

## Implementation Notes

**Dependencies:**
- Toast component (can extract from this pattern)
- File upload API endpoint
- Image optimization pipeline

**Estimate:** 4-6 hours

**Shared components to extract:**
- `Toast` with action button and progress
- `ProgressRing` for upload feedback

---

**Related:** gallery-grid.md (uses this for image uploads), image-picker.md (alternative to upload)
