# Featured Work Carousel

**Goal:** Homepage displays featured work in an auto-rotating carousel that provides maximum visual impact for portfolio visitors.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/DESIGN-SYSTEM.md
@plans/design/components/carousel.md
@plans/design/components/image-card-hover-overlay.md

**Business Context:** Customer requires carousel functionality (won't pay without it) - this is business critical.

## Scope

**Included**:
- FeaturedCarousel component for homepage
- Auto-rotation (5 seconds per slide, pausable)
- Manual navigation (prev/next buttons, keyboard arrows)
- Touch swipe support (mobile left/right gestures)
- Indicator dots (click/tap to jump to slide)
- Pause/play button (WCAG requirement)
- Image overlay with project title/venue/year
- Responsive layout (16:9 desktop, 4:3 mobile)
- Accessibility (keyboard, screen readers, reduced motion)
- Click slide → Navigate to project page
- Integration with existing featured projects data
- Theme compatibility (all 3 themes)

**NOT Included**:
- Multiple carousel variants or styles
- Admin toggle between carousel/grid (can add later)
- Carousel for category pages (homepage only)
- Video support in carousel
- Thumbnail preview strip
- Zoom/pan effects on images
- Custom transition effects

## Tech Stack
- React with TypeScript
- CSS animations (GPU-accelerated)
- Touch event handling
- Keyboard event handling
- Next.js Image component
- Existing featured projects query
- CSS custom properties

## Key Files
```
src/components/portfolio/FeaturedCarousel.tsx   # Main carousel component
src/components/portfolio/CarouselSlide.tsx      # Individual slide
src/components/portfolio/CarouselControls.tsx   # Nav buttons and indicators
src/app/[slug]/page.tsx                         # Update: use carousel
src/app/globals.css                             # Carousel styles
```

## UI Design

### Desktop Layout

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                    Featured Work                           │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                                                [◀] [▶]│ │
│  │                                                      │ │
│  │              [Large Project Image]                   │ │
│  │                                                      │ │
│  │   Hamlet 2024                               ‖       │ │
│  │   Royal Shakespeare Theatre · 2024          ○●○○○   │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘

16:9 aspect ratio
Overlay with title/venue/year at bottom-left
Pause button (‖) at bottom-right
Progress dots at bottom-center
Previous/Next arrows on sides (hover to see)
```

### Mobile Layout

```
┌──────────────────────────┐
│                          │
│   Featured Work          │
│                          │
│ ┌──────────────────────┐ │
│ │                      │ │
│ │   [Project Image]    │ │
│ │                      │ │
│ │   Hamlet 2024        │ │
│ │   Royal Shakespeare  │ │
│ │                      │ │
│ │   ○●○○○      ‖      │ │
│ └──────────────────────┘ │
│   ← Swipe left/right →  │
│                          │
└──────────────────────────┘

4:3 aspect ratio (taller)
No arrow buttons (swipe instead)
Dots and pause button visible
Touch-friendly indicators
```

## Component Structure

```typescript
interface FeaturedCarouselProps {
  portfolioSlug: string
  projects: Array<{
    slug: string
    title: string
    venue: string | null
    year: string | null
    featuredImageUrl: string | null
    featuredImageAlt: string
    categorySlug: string
  }>
  heading?: string
  autoRotate?: boolean
  autoRotateInterval?: number
}

export function FeaturedCarousel({
  portfolioSlug,
  projects,
  heading = 'Featured Work',
  autoRotate = true,
  autoRotateInterval = 5000
}: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoRotate)
  const [isPaused, setIsPaused] = useState(false)
  
  // Auto-rotation effect
  // Touch swipe handling
  // Keyboard navigation
  // Render slides
}
```

## Auto-Rotation Logic

```typescript
const intervalRef = useRef<NodeJS.Timeout | null>(null)

// Start auto-rotation
useEffect(() => {
  if (!isPlaying || projects.length <= 1) return
  
  intervalRef.current = setInterval(() => {
    setCurrentIndex((prev) => (prev + 1) % projects.length)
  }, autoRotateInterval)
  
  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }
}, [isPlaying, projects.length, autoRotateInterval])

// Pause on hover
const handleMouseEnter = () => {
  setIsPaused(true)
  setIsPlaying(false)
}

const handleMouseLeave = () => {
  setIsPaused(false)
  setTimeout(() => {
    if (!isPaused) setIsPlaying(true)
  }, 1000) // Resume after 1s delay
}

// Toggle pause/play
const toggleAutoRotation = () => {
  setIsPlaying(!isPlaying)
  setIsPaused(!isPlaying)
}
```

## Touch Swipe Implementation

```typescript
const [touchStart, setTouchStart] = useState<number | null>(null)
const [touchEnd, setTouchEnd] = useState<number | null>(null)

const handleTouchStart = (e: React.TouchEvent) => {
  setTouchEnd(null)
  setTouchStart(e.targetTouches[0].clientX)
  setIsPlaying(false) // Pause on touch
}

const handleTouchMove = (e: React.TouchEvent) => {
  setTouchEnd(e.targetTouches[0].clientX)
}

const handleTouchEnd = () => {
  if (!touchStart || !touchEnd) return
  
  const distance = touchStart - touchEnd
  const isLeftSwipe = distance > 50  // Next
  const isRightSwipe = distance < -50 // Previous
  
  if (isLeftSwipe) {
    setCurrentIndex((prev) => (prev + 1) % projects.length)
  }
  if (isRightSwipe) {
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length)
  }
  
  // Resume after 10s
  setTimeout(() => {
    if (!isPaused) setIsPlaying(true)
  }, 10000)
}
```

## Keyboard Navigation

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length)
        setIsPlaying(false)
        break
      case 'ArrowRight':
        e.preventDefault()
        setCurrentIndex((prev) => (prev + 1) % projects.length)
        setIsPlaying(false)
        break
      case 'Home':
        e.preventDefault()
        setCurrentIndex(0)
        setIsPlaying(false)
        break
      case 'End':
        e.preventDefault()
        setCurrentIndex(projects.length - 1)
        setIsPlaying(false)
        break
      case 'Escape':
        setIsPlaying(false)
        setIsPaused(true)
        break
    }
  }
  
  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [projects.length])
```

## Demo Script (30 seconds)
1. Visit published portfolio homepage
2. See carousel with first featured project displayed
3. Wait 5 seconds - Carousel automatically transitions to next slide
4. Hover mouse over carousel - Auto-rotation pauses
5. Progress ring around active dot freezes
6. Move mouse away - Auto-rotation resumes after 1 second
7. Click next arrow - Immediately transitions to next slide (600ms)
8. Click indicator dot (3rd dot) - Jumps to 3rd slide
9. Press ArrowRight key - Advances to next slide
10. Press Home key - Jumps to first slide
11. Resize to mobile - Aspect ratio changes to 4:3
12. Swipe left - Next slide appears
13. Swipe right - Previous slide appears
14. Tap indicator dot - Jumps to that slide
15. Click project image - Navigate to project detail page
16. **Success**: Professional carousel with full user control

## Success Criteria

### Functional Requirements
- [ ] Auto-rotates through featured projects (5s interval)
- [ ] Previous/Next buttons work (desktop)
- [ ] Indicator dots work (jump to any slide)
- [ ] Touch swipe works (left/right on mobile)
- [ ] Keyboard navigation works (arrows, home, end, escape)
- [ ] Clicking slide navigates to project page
- [ ] Loops continuously (last → first)
- [ ] Pause button toggles auto-rotation
- [ ] Pauses on hover (desktop)
- [ ] Pauses on touch (mobile)
- [ ] Pauses on keyboard focus
- [ ] Resumes after 10s idle (after manual interaction)
- [ ] Resumes after 1s (after hover)
- [ ] Shows projects 1-6 (uses existing featured data)

### Design Requirements
- [ ] 16:9 aspect ratio on desktop/tablet
- [ ] 4:3 aspect ratio on mobile
- [ ] Max width 1200px (matches grid)
- [ ] Overlay gradient (bottom to top)
- [ ] Title at 24px (20px mobile)
- [ ] Venue/year in overlay
- [ ] Previous/Next buttons: 48px circular
- [ ] Hidden on mobile (buttons only)
- [ ] Indicator dots: 10px visual, 44px touch target
- [ ] Pause button: 40px, bottom-right
- [ ] Smooth crossfade (800ms auto, 600ms manual)
- [ ] Works with all 3 themes
- [ ] Matches existing card overlay aesthetic

### Accessibility Requirements
- [ ] role="region" with aria-label="Featured work"
- [ ] Slides have aria-roledescription="slide"
- [ ] Current slide announced via aria-live
- [ ] Pause button has aria-label
- [ ] All controls keyboard accessible
- [ ] Focus indicators visible (2px white outline)
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)
- [ ] Touch targets minimum 44×44px
- [ ] Screen reader announces slide changes
- [ ] Escape key pauses rotation

### Mobile Requirements
- [ ] Touch swipe works (50px threshold)
- [ ] Swipe within 300ms registers
- [ ] Horizontal scroll prevented during swipe
- [ ] Aspect ratio 4:3 on mobile
- [ ] Overlay text readable on small screens
- [ ] Indicators tappable (44px targets)
- [ ] Auto-rotation works on mobile
- [ ] Pauses when user touches
- [ ] No arrow buttons on mobile (<640px)

### Performance Requirements
- [ ] Smooth 60fps transitions
- [ ] Only opacity animated (GPU-accelerated)
- [ ] Current image loaded with priority
- [ ] Next image preloaded
- [ ] Remaining images lazy loaded
- [ ] willChange removed after transition
- [ ] No layout shifts during transition
- [ ] Works on slow connections

### Reduced Motion Requirements
- [ ] Auto-rotation disabled if prefers-reduced-motion
- [ ] Transitions instant (0ms)
- [ ] Progress animation disabled
- [ ] Pause button hidden (not needed)
- [ ] Manual navigation still works

## Pattern Reference

### Touch Swipe Pattern

The Lightbox component has working touch swipe implementation:

```typescript
// From existing Lightbox.tsx
const handleTouchStart = (e: React.TouchEvent) => {
  setTouchEnd(null)
  setTouchStart(e.targetTouches[0].clientX)
}

const handleTouchMove = (e: React.TouchEvent) => {
  setTouchEnd(e.targetTouches[0].clientX)
}

const handleTouchEnd = () => {
  if (!touchStart || !touchEnd) return
  const distance = touchStart - touchEnd
  
  if (distance > 50) {
    // Swipe left - next
    nextImage()
  }
  if (distance < -50) {
    // Swipe right - previous
    previousImage()
  }
}
```

Reuse this pattern for carousel swipe.

### Overlay Pattern

The ProjectCard component has working overlay pattern:

```typescript
// Overlay gradient
background: linear-gradient(
  to top,
  rgba(0, 0, 0, 0.8) 0%,
  rgba(0, 0, 0, 0.4) 50%,
  transparent 100%
)

// Content positioning
<div className="overlay">
  <h3>{title}</h3>
  <p>{venue}</p>
  <span>{year}</span>
</div>
```

Reuse this pattern for carousel slide overlay.

## Integration Points

These elements are designed to be extended:
- **FeaturedCarousel** - Can be used on category pages (future)
- **CarouselControls** - Reusable for other carousel needs
- **Touch swipe logic** - Reusable for other swipeable components
- **Progress indicator** - Reusable for timed interactions

## Effort Estimate

**Total: 6-10 hours**
- FeaturedCarousel component: 2-3 hours
- Auto-rotation logic: 1-2 hours
- Touch swipe implementation: 1-2 hours
- Keyboard navigation: 1 hour
- Accessibility (pause button, aria): 1-2 hours
- CSS styling and responsive: 1-2 hours
- Testing and polish: 1-2 hours

**Quick ship option:** Build manual navigation first (4-6 hours), add auto-rotate later (2-3 hours).
