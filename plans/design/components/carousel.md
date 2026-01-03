# Featured Work Carousel Component

**Type:** Display Component  
**Context:** Homepage featured projects  
**Status:** Customer Required (Business Critical)

---

## Overview

Auto-rotating carousel for showcasing featured portfolio work on the homepage. Provides maximum visual impact for portfolio visitors while maintaining accessibility and mobile-first responsiveness.

**Customer Requirement:** Customer won't pay without carousel functionality (business critical).

---

## Component Behavior

### Auto-Rotation

```typescript
autoRotateInterval: 5000ms // 5 seconds per slide
pauseOnHover: true         // Desktop mouse interaction
pauseOnFocus: true         // Keyboard navigation
pauseOnTouch: true         // Mobile interaction
resumeDelay: 1000ms        // After user interaction ends
loopBehavior: 'continuous' // Last slide → First slide
```

**Rationale:** 5 seconds allows viewers to appreciate costume details (fabric, stitching, silhouette) without feeling rushed.

### Manual Navigation

**Desktop:**
- Previous/Next arrow buttons (left/right sides)
- Keyboard: ArrowLeft, ArrowRight, Home, End
- Indicator dots (click to jump to slide)
- Visible pause/play button

**Mobile:**
- Touch swipe (left/right)
- Indicator dots (tap to jump)
- Auto-pause on touch
- No arrow buttons (rely on swipe)

### Touch Gestures (Mobile)

```typescript
swipeThreshold: 50px      // Minimum swipe distance
swipeTimeout: 300ms       // Maximum duration to register as swipe
preventScroll: true       // During horizontal swipe
snapToSlide: true         // Always lands on slide, not between
```

### Keyboard Navigation

```typescript
ArrowLeft: Previous slide
ArrowRight: Next slide
Home: First slide
End: Last slide
Tab: Focus through controls (pause, prev, next, indicators)
Enter/Space: Activate focused control
Escape: Pause auto-rotation
```

**WCAG Requirement:** All functionality available via keyboard.

---

## Visual Design

### Slide Layout

```typescript
Container:
  width: 100%
  maxWidth: 1200px (matches featured-work grid container)
  aspectRatio: 16:9 (desktop/tablet)
  aspectRatio: 4:3 (mobile - more vertical space)
  borderRadius: var(--card-radius) // Theme-dependent

Image:
  objectFit: 'cover'
  width: 100%
  height: 100%
```

### Overlay Design

**Gradient Background:**
```css
background: linear-gradient(
  to top,
  rgba(0, 0, 0, 0.8) 0%,
  rgba(0, 0, 0, 0.4) 50%,
  transparent 100%
)
```

**Content Positioning:**
```typescript
position: bottom-left
padding: var(--space-6) // 24px desktop
padding: var(--space-4) // 16px mobile
```

**Typography:**
```typescript
title: {
  fontSize: var(--font-size-2xl), // 24px
  fontWeight: var(--font-weight-semibold),
  color: 'white',
  marginBottom: var(--space-2)
}

venue: {
  fontSize: var(--font-size-base), // 16px
  color: 'rgba(255, 255, 255, 0.9)',
  marginBottom: var(--space-1)
}

year: {
  fontSize: var(--font-size-sm), // 14px
  color: 'rgba(255, 255, 255, 0.7)'
}
```

### Navigation Controls

**Previous/Next Buttons:**
```typescript
size: 48px × 48px
background: 'rgba(0, 0, 0, 0.6)'
borderRadius: '50%' (circular)
color: 'white'
position: absolute (left/right sides, vertically centered)

hover: {
  background: 'rgba(0, 0, 0, 0.8)',
  transform: 'scale(1.05)'
}

hidden: '@media (max-width: 640px)' // Mobile uses swipe
```

**Indicator Dots:**
```typescript
size: 10px × 10px (visual dot)
touchTarget: 44px × 44px (WCAG requirement)
background: 'rgba(255, 255, 255, 0.4)' (inactive)
background: 'rgba(255, 255, 255, 0.9)' (active)
activeDot: scale(1.2)

position: bottom center
gap: var(--space-2) // 8px between dots
```

**Pause/Play Button:**
```typescript
size: 40px × 40px
background: 'rgba(0, 0, 0, 0.6)'
position: bottom-right
icon: Pause (‖) or Play (▶)

hover: {
  background: 'rgba(0, 0, 0, 0.8)'
}
```

### Transition Style

```typescript
type: 'crossfade' // Overlapping fade
duration: 800ms (auto-advance)
duration: 600ms (manual navigation - faster response)
easing: 'cubic-bezier(0.4, 0, 0.2, 1)' // Material standard

// Implementation
currentSlide: opacity 1 → 0.3 → 0
nextSlide: opacity 0 → 0.3 → 1
overlap: 400ms (creates smooth blend)
```

**Rationale:** Crossfade is gallery-appropriate. Slide transitions feel corporate. Fade respects the work.

---

## Motion Timing Protocol

### Auto-Rotation Choreography

```
Display Duration: 5000ms
  ├─ Idle: 4200ms (slide fully visible)
  └─ Transition: 800ms (crossfade to next)

Total cycle: 5000ms per slide
```

### Manual Navigation Choreography

```
User clicks Next:
  ├─ Pause auto-rotation immediately
  ├─ Crossfade to next slide: 600ms (faster than auto)
  └─ Resume auto-rotation after 10s idle
```

### Touch Swipe Choreography

```
User swipes:
  ├─ Detect swipe: <300ms
  ├─ Snap to next slide: 400ms spring animation
  ├─ Pause auto-rotation
  └─ Resume after 10s idle
```

### Keyboard Navigation Choreography

```
User presses arrow:
  ├─ Immediate response: <100ms
  ├─ Crossfade: 600ms
  ├─ Focus indicator visible
  └─ Auto-rotation paused (until Escape or blur)
```

---

## Pause Behavior States

### State 1: Playing (Default)
```
Auto-rotation active
Progress indicator animating (ring drawing around dot)
Pause button visible (‖ icon)
Transitions every 5 seconds
```

### State 2: Paused (User Hover)
```
Auto-rotation stopped
Progress indicator frozen
Pause button shows visual "paused" state (dimmed)
Overlay shows "Click to view" hint (subtle)
```

### State 3: Paused (User Focus)
```
Auto-rotation stopped
Focus outline visible on active control
Screen reader announces "Rotation paused"
Resume on blur (if not manually paused)
```

### State 4: Paused (Manual)
```
Auto-rotation stopped
Play button visible (▶ icon)
Progress indicator hidden
Stays paused until user clicks play
```

### State 5: User Interaction
```
User clicks prev/next or swipes:
  ├─ Immediate visual feedback (<100ms)
  ├─ Auto-rotation paused for 10s
  ├─ Multiple interactions reset 10s timer
  └─ Resume auto-rotation after idle period
```

---

## Accessibility Motion Guidelines

### WCAG 2.2.2: Pause, Stop, Hide

```typescript
// Required controls
pauseButton: Always visible and accessible
keyboard: Escape key pauses
hover: Mouse hover pauses
focus: Keyboard focus pauses

// Screen reader announcement
aria-live="polite": Announces slide changes
aria-roledescription="carousel": Identifies component type
```

### Reduced Motion Support (prefers-reduced-motion)

```typescript
if (prefersReducedMotion) {
  autoRotate: false            // Disable auto-rotation entirely
  transitionDuration: 0        // Instant slide changes
  progressIndicator: hidden    // No animated progress
  userControl: full            // All navigation available
}

// CSS
@media (prefers-reduced-motion: reduce) {
  .carousel-slide {
    transition: none !important;
  }
  
  .progress-ring {
    display: none; // Hide animated progress
  }
  
  .carousel-pause-button {
    display: none; // Not needed if no auto-rotation
  }
}
```

**Rationale:** Vestibular disorders require no auto-animation. Provide instant manual control only.

### Focus State Communication

```css
/* Carousel has focus */
.featured-carousel:focus-within {
  outline: 2px solid var(--color-accent);
  outline-offset: 4px;
}

/* Control has focus */
.carousel-nav-button:focus-visible,
.carousel-indicator:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
}
```

### Loading State Motion

```css
/* Skeleton placeholder (before images load) */
.carousel-loading {
  background: linear-gradient(
    90deg,
    var(--color-surface) 0%,
    var(--color-surface-hover) 50%,
    var(--color-surface) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .carousel-loading {
    animation: none;
    background: var(--color-surface);
  }
}
```

---

## Progress Indication Animation

### Animated Ring Around Active Dot

```css
.carousel-indicator.active::after {
  content: '';
  position: absolute;
  inset: -4px; /* 4px outside dot */
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  
  /* SVG dasharray animation */
  stroke-dasharray: 0 100;
  animation: progress-fill 5000ms linear;
  animation-play-state: running;
}

.carousel.paused .carousel-indicator.active::after {
  animation-play-state: paused; /* Freeze on pause */
}

@keyframes progress-fill {
  from {
    stroke-dasharray: 0 100;
  }
  to {
    stroke-dasharray: 100 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .carousel-indicator.active::after {
    display: none; /* No progress animation */
  }
}
```

**What this communicates:** 
- Time remaining before auto-advance
- Visual countdown creates anticipation
- Pause state is immediately visible (ring stops)

---

## Interaction State Choreography

### Hover State (Desktop)

```
User hovers over carousel:
  ├─ t=0ms: Pause auto-rotation
  ├─ t=100ms: Fade in prev/next buttons (opacity 0 → 1)
  ├─ t=100ms: Dim pause button slightly (indicates paused)
  ├─ t=100ms: Freeze progress ring
  └─ On mouse leave: Resume after 1000ms delay
```

**Easing:** `cubic-bezier(0.25, 0.1, 0.25, 1)` (ease-out)

### Click State (Navigation)

```
User clicks next button:
  ├─ t=0ms: Pause auto-rotation
  ├─ t=0ms: Button scale 0.95 (press down)
  ├─ t=100ms: Button scale 1.0 (release)
  ├─ t=0ms: Start crossfade transition (600ms)
  ├─ t=600ms: New slide fully visible
  └─ t=10000ms: Resume auto-rotation (10s idle)
```

**User experience:** Immediate feedback, faster transition than auto-rotate.

### Swipe Gesture (Mobile)

```
User swipes left:
  ├─ t=0ms: Pause auto-rotation
  ├─ During swipe: Current slide follows finger (rubber band effect)
  ├─ On release: Snap to next slide (400ms spring)
  ├─ Easing: cubic-bezier(0.25, 0.46, 0.45, 0.94) (ease-out-quad)
  └─ t=10000ms: Resume auto-rotation (10s idle)
```

**Spring animation:** Feels natural and responsive, like native mobile gestures.

---

## What Motion Should Communicate

### Primary Message: **"Your Work Deserves Contemplation"**

**How motion supports this:**
- \u2705 **5-second viewing** - Respects craft, not rushed
- \u2705 **Smooth crossfade** - Professional, gallery-appropriate
- \u2705 **Pause on hover** - "Take your time, explore at your pace"
- \u2705 **Manual control** - User agency over viewing experience

### Secondary Message: **"Professional Presentation"**

**How motion supports this:**
- \u2705 **Graceful transitions** - Not flashy or distracting
- \u2705 **Consistent timing** - Predictable, reliable
- \u2705 **Accessible controls** - Inclusive, thoughtful design

### Anti-Patterns to Avoid

**Motion that would undermine professionalism:**
- \u274c Fast auto-rotation (<3s) - Feels rushed, disrespectful to craft
- \u274c Slide transitions - Corporate PowerPoint vibes
- \u274c Zoom/pan effects - Distracting from the work
- \u274c Bouncing/elastic animations - Unprofessional
- \u274c Hidden controls - Frustrating, inaccessible

---

## Animation is Communication

**What the carousel motion communicates to visitors:**

### 5-Second Display
**Says:** "This work has depth worth studying"  
**Not:** "Quickly flip through these"

### 800ms Crossfade
**Says:** "Professional gallery experience"  
**Not:** "Flashy slideshow"

### Pause on Hover
**Says:** "Explore at your own pace"  
**Not:** "Watch passively"

### Progress Ring
**Says:** "Time remaining to view this piece"  
**Not:** "Hurry up"

### Instant Pause Response
**Says:** "Your input matters immediately"  
**Not:** "Wait for the system"

---

## Technical Specifications

### Transition Timing

```typescript
// Auto-advance transition
duration: 800ms
easing: 'cubic-bezier(0.4, 0, 0.2, 1)' // Material standard ease

// Manual navigation (faster response)
duration: 600ms
easing: 'cubic-bezier(0.4, 0, 0.2, 1)'

// Hover state controls
duration: 200ms
easing: 'ease-out'

// Touch snap animation
duration: 400ms
easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' // Ease-out-quad (spring-like)
```

### Performance Constraints

```typescript
// GPU-accelerated properties ONLY
animatedProperties: ['opacity']
transform: none // Don't animate transforms
willChange: 'opacity' (set during transition only)

// Force hardware acceleration
.carousel-slide {
  backface-visibility: hidden;
  perspective: 1000px;
}

// Cleanup after transition
removeWillChange: 'after transition completes'
```

**60fps guarantee:** Only animating opacity ensures smooth performance on all devices.

### Reduced Motion

```typescript
@media (prefers-reduced-motion: reduce) {
  autoRotate: disabled
  transitionDuration: 0ms
  progressAnimation: disabled
  allTransitions: 'none'
}
```

**Safety:** Vestibular disorders require zero auto-animation.

---

## Integration Points

### Homepage Placement

```tsx
<main className="portfolio-main">
  {/* Hero section / custom sections */}
  <SectionRenderer sections={sections} />
  
  {/* Featured Work - Carousel */}
  {featuredProjects.length > 0 && (
    <FeaturedCarousel
      portfolioSlug={portfolio.slug}
      projects={featuredProjects}
      heading="Featured Work"
    />
  )}
</main>
```

### Admin Control (Optional)

```tsx
// Add to Portfolio settings
displayMode: 'carousel' | 'grid'

// Conditional render
{portfolio.displayMode === 'carousel' ? (
  <FeaturedCarousel projects={featuredProjects} />
) : (
  <FeaturedWork projects={featuredProjects} /> // Current grid
)}
```

### Theme Compatibility

Works with all themes via CSS custom properties:
- `--card-radius` (theme-specific rounding)
- `--font-family-primary` (theme typography)
- `--space-*` (theme spacing scale)

---

## Component Interface

```typescript
interface FeaturedCarouselProps {
  portfolioSlug: string
  projects: FeaturedProject[]
  heading?: string
  autoRotate?: boolean
  autoRotateInterval?: number
  className?: string
}

interface FeaturedProject {
  id: string
  slug: string
  title: string
  venue: string | null
  year: string | null
  featuredImageUrl: string | null
  featuredImageAlt: string
  categorySlug: string
}
```

---

## Success Criteria

### Functionality
- [ ] Auto-rotates every 5 seconds
- [ ] Pauses on hover (desktop)
- [ ] Pauses on touch (mobile)
- [ ] Previous/Next buttons work
- [ ] Indicator dots work (jump to slide)
- [ ] Touch swipe works (50px threshold)
- [ ] Keyboard arrows work
- [ ] Clicking image navigates to project
- [ ] Loops continuously

### Accessibility (WCAG AA)
- [ ] Pause button always visible
- [ ] All controls keyboard accessible
- [ ] Screen reader announcements work
- [ ] role="region" and aria-labels
- [ ] Color contrast 4.5:1 minimum
- [ ] Touch targets 44×44px minimum
- [ ] Reduced motion disables auto-rotate
- [ ] Focus indicators visible

### Performance
- [ ] 60fps smooth transitions
- [ ] Current + next image preloaded
- [ ] GPU-accelerated (opacity only)
- [ ] No layout shifts
- [ ] Works on 3G mobile

### Mobile
- [ ] Touch swipe works (left/right)
- [ ] 4:3 aspect ratio on mobile
- [ ] Auto-rotate pauses on touch
- [ ] Indicator dots tappable
- [ ] No arrow buttons (swipe only)
- [ ] Safe area padding

### Design
- [ ] Matches ImageCard overlay aesthetic
- [ ] Works with all 3 themes
- [ ] Responsive (16:9 desktop, 4:3 mobile)
- [ ] Smooth crossfade transitions
- [ ] Professional presentation
- [ ] Doesn't distract from work

---

## Implementation Notes

**Reuse existing patterns:**
- Lightbox component has swipe/keyboard logic (reference for touch gestures)
- ProjectCard has overlay pattern (reference for visual design)
- ImagePicker has focus trap (reference for accessibility)

**Estimated effort:** 6-10 hours
- Component structure: 2-3 hours
- Auto-rotation + pause logic: 2-3 hours
- Touch swipe implementation: 1-2 hours
- Accessibility + keyboard: 1-2 hours
- Testing + polish: 1-2 hours

**Quick ship strategy:** Build Phase 1 (manual navigation) first, add auto-rotate Phase 2.
