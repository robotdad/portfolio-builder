# Portfolio Builder: Vision & User Experience

> **Visual References**: See the `mockups/` folder for conceptual diagrams illustrating key interface elements and workflows.

## Project Vision

### Core Purpose
Build a **single-user portfolio builder** specifically for costume designers and creative professionals who need to showcase their work professionally online. The system prioritizes **speed of creation and ease of use** over complex customization options.

### Design Philosophy
- **Single-user focused**: One primary creator with occasional collaborator access, not a team platform
- **Theme-constrained creativity**: Users work within well-designed themes rather than building layouts from scratch
- **WYSIWYG editing**: Direct manipulation where users see exactly what visitors will see
- **Mobile-first content management**: Must work excellently on iPhone for quick updates and photo uploads
- **Leverage proven solutions**: Build on established open source libraries rather than custom implementations
- **DOM Parity Guarantee**: Editor canvas and published site must render identically using the same React components
- **Explicit Publishing Model**: Draft → Preview → Publish workflow with clear state management

### Success Vision
A costume designer can create a professional portfolio website in under 30 minutes, then easily maintain it from their phone by uploading photos directly from sets and adding project descriptions. The resulting site loads fast, looks professional, and showcases their work effectively to potential clients and employers.

---

## Detailed User Experience Flow

### Initial Site Creation

#### Step 1: Authentication & Welcome
**Action**: User visits admin URL (e.g., `yoursite.com/admin`)  
**Interface**: Simple login form with secure authentication  
**First-time experience**: Welcome screen with setup wizard option  
**Returning users**: Dashboard showing:
- Site publish status
- Recent edits summary
- Quick actions (Edit, Preview, Publish)
- Analytics summary (if enabled)

#### Step 2: Theme Selection (First Time Users)
**Interface**: Grid of 4-6 theme previews with clear visual differences:
- Modern Minimal (lots of white space, clean typography)
- Photography Focus (image-heavy layouts, minimal text)  
- Creative Bold (vibrant colors, expressive fonts)
- Classic Elegant (traditional layouts, serif fonts)

**Theme Information Display**:
- Live preview on hover/tap
- Mobile preview toggle
- Component compatibility matrix
- Performance rating
- Accessibility score

**User Action**: Click on preferred theme  
**Immediate Feedback**: Live preview loads showing theme with sample content  
**Decision Point**: "Use This Theme" button or "Compare Themes" option  
**Outcome**: Theme selected, user directed to page building interface

#### Step 3: Basic Site Setup
**Interface**: Simple form with essential fields:
- Portfolio Title (e.g., "Sasha Goodner - Costume Designer") [Required]
- Tagline (optional, e.g., "Theatre & Film Costume Design")
- Contact Email [Required]
- Site URL slug (auto-generated from title, editable)
- Privacy Settings (Public/Password Protected/Private)

**User Action**: Fill fields, click "Create Portfolio"  
**Outcome**: Basic homepage created with draft status, user enters page builder

### Core Page Building Experience

> **Visual Reference**: See `mockups/01-editor-interface-elements.svg` for labeled editor interface

#### Adding Content - The "+" Button Flow
**Trigger**: User clicks floating blue "+" button (always visible, bottom-right on desktop, bottom-center on mobile)  
**Interface**: Component picker overlay appears with large, touch-friendly options:
- Text Block (large "T" icon)
- Single Image (camera icon)
- Image Gallery (grid icon) 
- Video Embed (play icon)
- Spacer (horizontal lines icon)
- Contact Form (mail icon)
- Custom HTML (code icon)

**User Action**: Tap component type  
**Immediate Result**: Component appears on page at cursor location or bottom of content  
**Grid Behavior**: Component snaps to invisible 12-column grid for alignment with visual guides

#### Text Editing Flow
**Trigger**: User clicks on any text area (existing or newly added)  
**Interface**: Text becomes editable with floating toolbar appearing:
- Format selector (Paragraph, H1-H6)
- Text style (Bold, Italic, Underline, Strike)
- Alignment buttons (Left, Center, Right, Justify)
- Link button with URL/email/page options
- Clear formatting button
- Done button

**Advanced Options** (via "..." menu):
- Text color (from theme palette)
- Background color (from theme palette)
- Margin/padding adjustments
- Custom CSS class

**Mobile Consideration**: Toolbar positioned above keyboard, scrolls with content  
**User Action**: Type content, use toolbar for formatting  
**Completion**: Click "Done" or click outside text area  
**Result**: Formatted text saves automatically with save indicator

#### Image Upload Flow
**Trigger**: User clicks "Add Image" or clicks empty image placeholder  
**Interface Options**:
- Desktop: Drag-and-drop zone with "Browse" button and "Image Library" tab
- Mobile: Bottom sheet with options:
  - Take Photo (camera icon)
  - Choose from Library (gallery icon)
  - Browse Files (folder icon)

**Upload Process**:
1. User selects/captures image
2. Upload progress indicator appears with cancel option
3. Automatic optimization happens (user sees "Optimizing..." message)
4. Multiple versions generated (original, display, thumbnail, blur placeholder)
5. Image appears in layout with optimization complete indicator
6. Alt text field appears below (required, with "Mark as decorative" checkbox)
7. Optional caption field

**Editing Existing Images**:
- Click image to get overlay with options:
  - Replace Image
  - Edit Alt Text (required indicator if missing)
  - Edit Caption
  - Add Link
  - Adjust focal point (for responsive cropping)
  - Advanced settings (loading priority, sizes)
- Mobile: Long press for options menu

#### Gallery Creation Flow

> **Visual Reference**: See `mockups/03-gallery-layout-options.svg` for gallery layout types
**Trigger**: User selects "Image Gallery" from component picker  
**Initial State**: Empty gallery placeholder with "Add Images" button  

**Multi-Upload**:
1. User clicks "Add Images"
2. Can select multiple images (mobile: from camera roll with multi-select, desktop: browse multiple or drag group)
3. Upload progress shows for batch with individual file progress
4. Images appear in gallery as they finish processing
5. Bulk alt text option: "Apply to all" or individual editing

**Gallery Controls**:
- Layout selector: Grid, Carousel, Masonry
- For Grid:
  - Columns: 2, 3, 4, 5, 6 (responsive)
  - Gap: Tight (8px), Normal (16px), Loose (24px)
  - Aspect ratio: Original, Square, 4:3, 16:9
- For Carousel:
  - Autoplay toggle with duration (3-10 seconds)
  - Show indicators (dots/thumbs/numbers)
  - Transition type (slide/fade)
  - Loop toggle
  - Show arrows (always/hover/never)
- For Masonry:
  - Column count (auto/2/3/4)
  - Gap size
  - Order (original/height-balanced)

**Image Management Within Gallery**:
- Drag to reorder (both mobile and desktop)
- Mobile: Long-press to enter reorder mode with haptic feedback
- Tap image for options: Delete, Edit Caption, Edit Alt Text, Set as Cover
- Bulk operations: Select multiple for delete/reorder
- Add more images with inline "+" button

### Page Management

#### Creating Additional Pages
**Trigger**: User clicks "Pages" in left sidebar (desktop) or hamburger menu (mobile)  
**Interface**: List of current pages with visual hierarchy and status indicators  
**Page Creation Flow**:
1. Click "Add Page" button
2. Choose method:
   - Start from template (Gallery, About, Contact)
   - Duplicate existing page
   - Start blank
3. Enter page details:
   - Page title (e.g., "Theatre Work")
   - URL slug (auto-generated, editable)
   - Navigation label (if different from title)
   - Parent page (for hierarchy)
4. Page created in draft state and user enters page builder

**Navigation Management**:
- Toggle switches for "Show in navigation"
- Drag handles to reorder navigation items
- Indent/outdent for sub-navigation
- Preview navigation structure
- Set homepage (radio button selection)

#### Publishing Flow

> **Visual Reference**: See `mockups/06-draft-publish-workflow.svg` for workflow visualization

**Draft State**: 
- All changes auto-save every 30 seconds with indicator
- Manual save button available
- Draft badge in header
- Other users/visitors cannot see drafts

**Preview Mode**:
- "Preview" button opens site in new tab/window
- Exact representation of published state
- Responsive preview options (phone/tablet/desktop)
- Shareable preview link with expiration

**Publishing Requirements Check**:
Before publishing, system validates:
- ✓ All images have alt text (unless marked decorative)
- ✓ Heading hierarchy is valid (no skipped levels)
- ✓ Color contrast meets WCAG AA standards
- ✓ All links are valid
- ✓ Page has title and meta description
- ✓ Mobile responsive check passed

**Publishing Action**:
- "Publish" button shows status (Up to date/Changes pending)
- Click reveals publish dialog:
  - Summary of changes since last publish
  - Validation results (pass/fail with details)
  - Publish now / Schedule for later options
- After publish: Success message with view site link

### Mobile Editing Experience

> **Visual Reference**: See `mockups/02-mobile-desktop-editing.svg` for responsive interface comparison

#### Mobile Interface Adaptations
**Navigation**: Bottom tab bar with main actions (Edit, Pages, Media, Settings)  
**Component Picker**: Full-screen overlay with search and recent items  
**Text Editing**: 
- Keyboard-aware positioning
- Formatting toolbar above keyboard
- Done button in toolbar to dismiss keyboard

**Touch Interactions**:
- Minimum 44px touch targets throughout
- Long-press for context menus
- Pinch to zoom in editor
- Swipe between pages
- Pull-to-refresh for preview

#### Mobile-Specific Workflows

**Quick Photo Add**:
1. User on set, opens admin on phone
2. Taps camera button (prominent in tab bar)
3. Takes photo or selects recent
4. Quick caption/alt text overlay
5. Choose: Add to current page / Create new gallery / Save to library
6. Photo uploads in background
7. User can continue editing while uploading

**Mobile Editing Constraints**:
- Simplified formatting options (essential only)
- Single column component layout
- Larger UI elements for touch
- Gesture-based interactions
- Auto-save more frequent (every 15 seconds)
- Offline mode with sync when connected

### Published Site Experience

#### Visitor Journey
**Homepage**: Clean, theme-appropriate layout featuring:
- Portfolio title and tagline
- Navigation menu (responsive)
- Featured work (hero image or gallery)
- Brief introduction text
- Contact call-to-action

**Gallery Pages**: 
- Project title and description
- Optimized image galleries with chosen layout
- Progressive image loading with blur-up effect
- Touch-friendly on mobile (swipe, pinch-to-zoom)
- Keyboard navigation on desktop

**Image Viewing**:
- Click/tap image to open lightbox
- Full-resolution viewing with zoom
- Previous/next navigation
- Caption and metadata display
- Share buttons (optional)
- Download protection (optional)
- Keyboard shortcuts (arrows, escape)
- Mobile: Swipe between images, pinch to zoom, double-tap to zoom

#### Performance Expectations
- Initial page load under 2 seconds on 3G
- Image optimization reduces file sizes by 60-80%
- Lazy loading for below-fold content
- Responsive images serve appropriate sizes
- Browser caching configured
- Service worker for offline viewing

### Accessibility Requirements

#### Component-Level Requirements
**Images**:
- Alt text required (with decorative option)
- Meaningful filenames preserved
- Color contrast overlay for text on images
- Focus indicators on interactive images

**Text**:
- Heading hierarchy validation
- Minimum font size enforcement (14px)
- Line height minimums (1.5 for body)
- Color contrast checking (WCAG AA)

**Interactive Elements**:
- Keyboard navigable
- Focus indicators (visible, high contrast)
- Touch targets minimum 44px
- Hover states distinct from focus
- Screen reader labels for icons

**Forms**:
- Labels associated with inputs
- Error messages linked to fields
- Required fields indicated
- Instructions before form
- Success/error announcements

#### Page-Level Requirements
- Skip navigation links
- Landmark regions (header, main, footer)
- Page language declared
- Meaningful page titles
- Focus management for SPAs
- Live regions for dynamic content
- Reduced motion options respected

#### Publishing Gates
Cannot publish if:
- Images missing alt text (except decorative)
- Heading hierarchy broken
- Contrast ratios below WCAG AA
- Forms missing labels
- No page title
- Keyboard navigation broken

Warning but allow publish:
- Missing meta descriptions
- Long alt text (>125 chars)
- Very long pages without structure
- External links without indication

### Theme System & Compatibility

#### Theme Component Matrix
Each theme declares component support:

**Modern Minimal**:
- ✓ Text Block (full support)
- ✓ Single Image (full support)
- ✓ Grid Gallery (full support)
- ⚠️ Carousel (limited - no autoplay)
- ✗ Masonry (falls back to Grid)
- ✓ Contact Form (styled)

**Photography Focus**:
- ⚠️ Text Block (limited formatting)
- ✓ All image components (optimized)
- ✓ All gallery types (enhanced)
- ✓ Video embed (full support)
- ✗ Contact Form (falls back to email link)

**Theme Switching Behavior**:
1. User selects new theme
2. System shows compatibility report:
   - Components that will change
   - Features that will be lost
   - Recommended adjustments
3. User confirms or cancels
4. If confirmed:
   - Content preserved
   - Incompatible components use fallbacks
   - Layout adjusts to new grid
   - User can undo for 24 hours

### Error Handling & Recovery

#### User-Friendly Error Messages
- **Upload failed**: "Upload failed - file may be too large. Try again or choose a smaller image (max 10MB)."
- **Network issues**: "Connection lost. Your changes are saved locally and will sync when reconnected."
- **Theme conflict**: "Carousel galleries aren't available in this theme. They'll display as grid galleries instead."
- **Validation error**: "Please add alt text to all images before publishing (3 images need alt text)."
- **Save conflict**: "This page was edited elsewhere. Review changes before saving."

#### Recovery Options
- Retry buttons with backoff
- Undo/redo last 20 actions
- Version history (last 30 days)
- Download backup option
- Conflict resolution UI
- Auto-recovery from crashes

#### Error Prevention
- Validation during editing (not just publish)
- Warnings before destructive actions
- Autosave with conflict detection
- Input validation with helpful hints
- Progressive disclosure of complex features

### Integration Points

#### How Editor Changes Reflect on Published Site

> **Visual Reference**: See `mockups/05-editor-vs-published-parity.svg` for DOM parity illustration
**Publishing Model**: Explicit publish action required (not real-time)
- Draft changes are isolated from published site
- Preview shows exact published state
- Publish is atomic (all or nothing)
- Rollback to previous version available

**Component Rendering**: Same React components used in both editor and published site
- No separate "preview" renderer
- WYSIWYG guaranteed through shared components
- Theme tokens applied identically
- Responsive behavior identical

**Performance Optimizations Applied on Publish**:
- Static HTML generation
- Image optimization
- CSS/JS minification
- Critical CSS extraction
- Sitemap generation

**Mobile Sync**: Changes made on any device sync to all editors
- Conflict resolution for simultaneous edits
- Offline changes queue for sync
- Push notifications for publish status