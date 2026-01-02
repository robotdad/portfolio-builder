# Simple Onboarding Flow

**Goal:** Guide new users through portfolio creation with their first category and project in under 5 minutes.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/DESIGN-SYSTEM.md
@plans/design/ONBOARDING-FLOW.md
@plans/design/ONBOARDING-FORM.md

## Scope

**Included**:
- Three-step wizard flow for first-time users
- Step 1: Portfolio details (name, slug)
- Step 2: Theme selection with visual previews
- Step 3: First category and project creation
- Progress indicators (step 1/3, 2/3, 3/3)
- Theme cards with color palette swatches
- Combined category + project form
- Atomic portfolio creation (all or nothing)
- Direct-to-admin fallback (skip onboarding)
- Mobile-first responsive design

**NOT Included**:
- Authentication or user accounts
- Multi-user support
- Full-screen theme preview modals
- Dashboard for multiple portfolios
- Skip/back navigation between steps
- Welcome marketing content
- Tutorial or help overlays

## Tech Stack
- Next.js App Router with client components
- React state management for wizard flow
- sessionStorage for step persistence
- Existing API routes for portfolio creation
- Theme definitions from theme system
- Form validation patterns

## Key Files
```
src/app/welcome/portfolio/page.tsx         # Step 1: Portfolio details
src/app/welcome/theme/page.tsx             # Step 2: Theme selection
src/app/welcome/first-project/page.tsx     # Step 3: Category + Project
src/components/onboarding/ProgressDots.tsx # Progress indicator
src/components/onboarding/ThemeCard.tsx    # Theme selection card
src/components/onboarding/StepLayout.tsx   # Wizard layout wrapper
src/hooks/useOnboardingState.ts            # Wizard state management
```

## UI Design

### Step 1: Portfolio Details

```
┌──────────────────────────────────────────────────────────────┐
│                         Step 1 of 3                           │
│                         ●○○                                   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│                    Create Your Portfolio                      │
│                                                               │
│  Portfolio Name *                                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ e.g., Sarah Chen - Costume Designer                    │  │
│  └────────────────────────────────────────────────────────┘  │
│  This appears in browser tabs and search results             │
│                                                               │
│  Portfolio URL *                                             │
│  ┌─────────┬──────────────────────────────────────────────┐  │
│  │ yoursite│ /sarah-chen                                  │  │
│  │ .com    │                                              │  │
│  └─────────┴──────────────────────────────────────────────┘  │
│  Auto-generated from name, editable                          │
│                                                               │
│                                    [Continue to Themes →]     │
└──────────────────────────────────────────────────────────────┘
```

### Step 2: Theme Selection

```
┌──────────────────────────────────────────────────────────────┐
│                         Step 2 of 3                           │
│                         ●●○                                   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│                    Choose Your Theme                          │
│                                                               │
│  ┌─────────────────────┐  ┌─────────────────────┐           │
│  │  Modern Minimal     │  │  Classic Elegant    │           │
│  │  ┌───────────────┐  │  │  ┌───────────────┐  │           │
│  │  │ [Color Swatch]│  │  │  │ [Color Swatch]│  │           │
│  │  └───────────────┘  │  │  └───────────────┘  │           │
│  │  ○ ○ ○ ○           │  │  ○ ○ ○ ○           │           │
│  │  Clean, neutral     │  │  Warm, established  │           │
│  │  professional       │  │  sophisticated      │           │
│  │  ✓ Selected         │  │                     │           │
│  └─────────────────────┘  └─────────────────────┘           │
│                                                               │
│  ┌─────────────────────┐                                     │
│  │  Bold Editorial     │                                     │
│  │  ┌───────────────┐  │                                     │
│  │  │ [Color Swatch]│  │                                     │
│  │  └───────────────┘  │                                     │
│  │  ○ ○ ○ ○           │                                     │
│  │  Dramatic, modern   │                                     │
│  │                     │                                     │
│  └─────────────────────┘                                     │
│                                                               │
│                    [← Back]  [Continue to Setup →]           │
└──────────────────────────────────────────────────────────────┘
```

### Step 3: Category + First Project

```
┌──────────────────────────────────────────────────────────────┐
│                         Step 3 of 3                           │
│                         ●●●                                   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│                  Create Your First Project                    │
│                                                               │
│  Category Name *                                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ e.g., Theatre, Film, Commercial                        │  │
│  └────────────────────────────────────────────────────────┘  │
│  Choose a category to organize your work                     │
│                                                               │
│  First Project Name *                                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ e.g., Hamlet 2024, Period Drama, Spring Collection     │  │
│  └────────────────────────────────────────────────────────┘  │
│  Your first project in this category                         │
│                                                               │
│  Featured Image (Optional)                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         📷                                              │  │
│  │  Tap to add featured image                             │  │
│  │         or                                             │  │
│  │  [🖼️ Choose from Gallery]                              │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│                    [← Back]  [Create My Portfolio →]         │
└──────────────────────────────────────────────────────────────┘
```

### Mobile Layout (All Steps)

```
┌──────────────────────┐
│    Step 2 of 3       │
│        ●●○            │
├──────────────────────┤
│                      │
│  Choose Theme        │
│                      │
│  ┌────────────────┐  │
│  │ Modern Minimal │  │
│  │ [Color Grid]   │  │
│  │ ○ ○ ○ ○       │  │
│  │ Clean, neutral │  │
│  │ ✓ Selected     │  │
│  └────────────────┘  │
│                      │
│  ┌────────────────┐  │
│  │ Classic Elegant│  │
│  │ [Color Grid]   │  │
│  │ ...            │  │
│  └────────────────┘  │
│                      │
│  ┌────────────────┐  │
│  │ Continue →     │  │ ← Full width, thumb zone
│  ├────────────────┤  │
│  │ ← Back         │  │
│  └────────────────┘  │
└──────────────────────┘
```

## Demo Script (30 seconds)
1. Visit homepage at `/` - Click "Get Started"
2. Redirect to `/welcome/portfolio` - See Step 1/3 indicator
3. Enter "Sarah Chen - Costume Designer" for name
4. Slug auto-generates to "sarah-chen-costume-designer"
5. Click "Continue to Themes" - Navigate to Step 2
6. See three theme cards with color palette swatches
7. "Modern Minimal" has checkmark (default selected)
8. Click "Classic Elegant" - Selection changes, checkmark moves
9. Click "Continue to Setup" - Navigate to Step 3
10. See combined form: Category + Project + Image
11. Enter "Theatre" for category
12. Enter "Hamlet 2024" for project
13. Click upload dropzone - File picker opens
14. Select image - Upload completes with preview
15. Click "Create My Portfolio" - All items created atomically
16. Redirect to `/admin` - Portfolio loaded with category and project ready
17. **Success**: Complete onboarding in <5 minutes

## Success Criteria

### Functional Requirements
- [ ] `/welcome/portfolio` route displays Step 1
- [ ] Portfolio name field is required
- [ ] Slug auto-generates from name (lowercase, hyphenated)
- [ ] Slug is editable by user
- [ ] Slug validation: lowercase letters, numbers, hyphens only
- [ ] Continue button disabled if required fields empty
- [ ] Progress indicator shows 1/3 on Step 1
- [ ] `/welcome/theme` route displays Step 2
- [ ] Three theme cards display with color swatches
- [ ] Default theme is "modern-minimal"
- [ ] Click theme card selects it (shows checkmark)
- [ ] Selected theme persists in sessionStorage
- [ ] Progress indicator shows 2/3 on Step 2
- [ ] `/welcome/first-project` route displays Step 3
- [ ] Category field is required with placeholder examples
- [ ] Project field is required with placeholder examples
- [ ] Featured image is optional
- [ ] Featured image supports upload new
- [ ] Featured image supports choose from gallery (disabled if no images)
- [ ] Validation shows red border + error on blur if empty
- [ ] Progress indicator shows 3/3 on Step 3
- [ ] "Create My Portfolio" creates portfolio + category + project atomically
- [ ] Successful creation redirects to `/admin`
- [ ] Error shows if creation fails
- [ ] Direct `/admin` access still works (skip onboarding)

### Design Requirements
- [ ] Each step uses consistent layout wrapper
- [ ] Progress dots use primary accent color
- [ ] Max width: 640px, centered
- [ ] Padding: 24px on mobile, 32px on desktop
- [ ] Typography follows design system hierarchy
- [ ] Form inputs match design system styles
- [ ] Theme cards display in responsive grid (2 columns desktop, 1 mobile)
- [ ] Color swatches show 4 colors from theme palette
- [ ] Selected theme has accent border + checkmark
- [ ] Continue buttons use primary accent background
- [ ] Back buttons use neutral/outline style
- [ ] Empty state messaging is encouraging, not intimidating
- [ ] Loading state during creation shows spinner

### Accessibility Requirements
- [ ] Each step has descriptive page title
- [ ] Progress indicator has aria-label: "Step 2 of 3"
- [ ] Form labels properly associated with inputs
- [ ] Required fields marked with asterisk
- [ ] Placeholder text is not read as pre-filled value
- [ ] Error messages have role="alert"
- [ ] Error messages announced to screen readers
- [ ] Theme cards are keyboard selectable
- [ ] Selected theme has aria-selected="true"
- [ ] Continue/Back buttons keyboard accessible
- [ ] Focus moves logically through form
- [ ] Skip link available on each step
- [ ] Color contrast meets WCAG AA

### Mobile Requirements
- [ ] Single column layout on mobile (<768px)
- [ ] Touch targets ≥ 44px
- [ ] Form inputs use 16px font (prevents iOS zoom)
- [ ] Continue button in thumb zone (bottom of viewport)
- [ ] Back button full-width below continue
- [ ] Theme cards stack vertically on mobile
- [ ] Featured image picker mobile-optimized
- [ ] Upload opens camera on iOS/Android
- [ ] Keyboard respects safe areas on notched devices

### Onboarding Flow Requirements
- [ ] Homepage detects if portfolio exists
- [ ] If no portfolio: redirect to `/welcome/portfolio`
- [ ] If portfolio exists: allow direct `/admin` access
- [ ] Step 1 data persists in sessionStorage
- [ ] Step 2 theme persists in sessionStorage
- [ ] If user refreshes, resume at current step
- [ ] Back button clears current step data
- [ ] Cancel returns to homepage (data discarded)
- [ ] Complete flow takes <5 minutes
- [ ] Atomic creation: all entities created or none

## Component Structure

### StepLayout Component

```typescript
interface StepLayoutProps {
  currentStep: 1 | 2 | 3
  totalSteps: 3
  title: string
  description?: string
  children: React.ReactNode
  onBack?: () => void
  onCancel?: () => void
}

// Usage
<StepLayout
  currentStep={2}
  totalSteps={3}
  title="Choose Your Theme"
  description="Pick a style that matches your aesthetic"
  onBack={() => router.push('/welcome/portfolio')}
>
  {/* Step content */}
</StepLayout>
```

### ProgressDots Component

```typescript
interface ProgressDotsProps {
  current: number
  total: number
  'aria-label'?: string
}

// Usage
<ProgressDots current={2} total={3} aria-label="Step 2 of 3" />

// Renders: ●●○
```

### ThemeCard Component

```typescript
interface ThemeCardProps {
  theme: {
    id: string
    name: string
    description: string
    colorPalette: string[]  // 4 colors for swatches
  }
  isSelected: boolean
  onSelect: () => void
}

// Usage
<ThemeCard
  theme={modernMinimal}
  isSelected={selectedThemeId === 'modern-minimal'}
  onSelect={() => setSelectedThemeId('modern-minimal')}
/>
```

## Form Validation

### Step 1: Portfolio Details

```typescript
const validatePortfolio = (data: PortfolioData): Record<string, string> => {
  const errors: Record<string, string> = {}
  
  if (!data.name?.trim()) {
    errors.name = 'Portfolio name is required'
  }
  
  if (!data.slug?.trim()) {
    errors.slug = 'URL slug is required'
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens'
  } else if (data.slug.startsWith('-') || data.slug.endsWith('-')) {
    errors.slug = 'Slug cannot start or end with a hyphen'
  }
  
  return errors
}
```

### Step 3: Category + Project

```typescript
const validateFirstProject = (data: FirstProjectData): Record<string, string> => {
  const errors: Record<string, string> = {}
  
  if (!data.categoryName?.trim()) {
    errors.categoryName = 'Category name is required'
  }
  
  if (!data.projectTitle?.trim()) {
    errors.projectTitle = 'Project title is required'
  }
  
  // Featured image is optional in onboarding
  // User can add it later in the editor
  
  return errors
}
```

## Placeholder Text Pattern

### Category Field

```typescript
<Input
  id="categoryName"
  placeholder="e.g., Theatre, Film, Commercial"
  value={formData.categoryName}
  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
  onBlur={validateField}
  className={errors.categoryName ? 'border-error' : ''}
  required
  aria-invalid={!!errors.categoryName}
  aria-describedby="category-help category-error"
/>
<p id="category-help" className="text-text-muted text-sm mt-1">
  Choose a category to organize your work
</p>
{errors.categoryName && (
  <p id="category-error" className="text-error text-sm mt-1" role="alert">
    {errors.categoryName}
  </p>
)}
```

**Characteristics:**
- Placeholder text is gray, disappears when user types (NOT pre-filled)
- Multiple examples shown ("Theatre, Film, Commercial")
- Helper text always visible below field
- Error message replaces helper text when validation fails
- Red border when invalid

### Project Field

```typescript
<Input
  id="projectTitle"
  placeholder="e.g., Hamlet 2024, Period Drama, Spring Collection"
  value={formData.projectTitle}
  onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
  onBlur={validateField}
  className={errors.projectTitle ? 'border-error' : ''}
  required
  aria-invalid={!!errors.projectTitle}
  aria-describedby="project-help project-error"
/>
<p id="project-help" className="text-text-muted text-sm mt-1">
  Your first project in this category
</p>
{errors.projectTitle && (
  <p id="project-error" className="text-error text-sm mt-1" role="alert">
    {errors.projectTitle}
  </p>
)}
```

## State Management

### useOnboardingState Hook

```typescript
interface OnboardingState {
  portfolio: {
    name: string
    slug: string
  }
  themeId: string
  firstProject: {
    categoryName: string
    projectTitle: string
    featuredImageId?: string
  }
}

function useOnboardingState() {
  const [state, setState] = useState<OnboardingState>({
    portfolio: { name: '', slug: '' },
    themeId: 'modern-minimal',
    firstProject: { categoryName: '', projectTitle: '' }
  })
  
  // Load from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('onboarding_state')
    if (saved) {
      setState(JSON.parse(saved))
    }
  }, [])
  
  // Save to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem('onboarding_state', JSON.stringify(state))
  }, [state])
  
  return { state, setState }
}
```

## Atomic Creation Flow

### Final Step Submission

```typescript
const handleCreatePortfolio = async () => {
  setIsSubmitting(true)
  
  try {
    // 1. Create portfolio with theme
    const portfolioResponse = await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: state.portfolio.name,
        slug: state.portfolio.slug,
        title: state.portfolio.name,
        bio: '',
        theme: state.themeId,
      }),
    })
    
    const { portfolio } = await portfolioResponse.json()
    
    // 2. Create category
    const categoryResponse = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: state.firstProject.categoryName,
        description: '',
        order: 0,
      }),
    })
    
    const { category } = await categoryResponse.json()
    
    // 3. Create project
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoryId: category.id,
        title: state.firstProject.projectTitle,
        featuredImageId: state.firstProject.featuredImageId,
        order: 0,
      }),
    })
    
    // Clear onboarding state
    sessionStorage.removeItem('onboarding_state')
    
    // Redirect to admin
    router.push('/admin')
    
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Failed to create portfolio')
  } finally {
    setIsSubmitting(false)
  }
}
```

**Note:** Portfolio API creates homepage automatically. Category and project are created separately.

## Routing Logic

### Homepage Detection

```typescript
// src/app/page.tsx
export default async function HomePage() {
  // Check if portfolio exists
  const portfolio = await prisma.portfolio.findFirst()
  
  if (portfolio) {
    // Has portfolio - go to admin
    redirect('/admin')
  }
  
  // No portfolio - show landing with Get Started
  return (
    <div>
      <h1>Build Your Portfolio</h1>
      <Link href="/welcome/portfolio">
        <Button>Get Started</Button>
      </Link>
    </div>
  )
}
```

### Direct Admin Access

```typescript
// src/app/admin/page.tsx
export default function AdminPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  
  useEffect(() => {
    // Load portfolio
    fetch('/api/portfolio')
      .then(res => res.json())
      .then(data => setPortfolio(data.portfolio))
      .catch(() => {
        // No portfolio - show inline creation form
        // This is the fallback if user navigates directly to /admin
      })
  }, [])
  
  // If no portfolio, show creation form on /admin
  // If portfolio exists, show editor
  return portfolio ? <Editor /> : <InlinePortfolioCreation />
}
```

## Theme Card Design

### Color Palette Swatches

```typescript
interface ThemeDefinition {
  id: string
  name: string
  description: string
  colorPalette: string[]  // 4 colors
}

const themes: ThemeDefinition[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Clean, professional, neutral - lets work shine',
    colorPalette: ['#1a1a1a', '#4a5568', '#ffffff', '#3b82f6'],  // text, muted, bg, accent
  },
  {
    id: 'classic-elegant',
    name: 'Classic Elegant',
    description: 'Sophisticated, established - signals experience',
    colorPalette: ['#2c1810', '#8b4513', '#fdf6ec', '#c2794b'],  // text, muted, bg, accent
  },
  {
    id: 'bold-editorial',
    name: 'Bold Editorial',
    description: 'Dramatic, contemporary - makes a statement',
    colorPalette: ['#ffffff', '#d1d5db', '#0f0f0f', '#ec4899'],  // text, muted, bg, accent
  },
]
```

### ThemeCard Component

```tsx
<div className={cn(
  'theme-card p-4 rounded-lg border-2 cursor-pointer transition-all',
  isSelected 
    ? 'border-primary shadow-md' 
    : 'border-border hover:border-primary/50'
)}>
  {/* Color swatches */}
  <div className="color-swatches mb-3 flex gap-2">
    {theme.colorPalette.map((color, i) => (
      <div
        key={i}
        className="w-8 h-8 rounded-full border border-border"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
    ))}
  </div>
  
  {/* Theme info */}
  <div className="flex items-center justify-between mb-2">
    <h3 className="font-medium">{theme.name}</h3>
    {isSelected && (
      <span className="text-primary text-sm font-medium">✓ Selected</span>
    )}
  </div>
  
  <p className="text-text-muted text-sm">{theme.description}</p>
</div>
```

## Error Handling

### Network Errors
- **Step 1:** Show error if slug already exists
- **Step 3:** Show error if category/project creation fails
- **All steps:** Preserve form data on error (don't clear)
- **Retry:** Keep form filled, let user try again

### Validation Errors
- **Show on blur:** Red border + error message when field loses focus
- **Clear on fix:** Error disappears when valid input entered
- **Submit validation:** Check all fields before attempting creation
- **Focus first error:** Move focus to first invalid field

### Upload Errors
- **File too large:** "Image must be under 10MB"
- **Invalid format:** "Please upload JPG, PNG, or WebP"
- **Network failure:** "Upload failed. Please try again."
- **Show inline:** Below upload button with retry option

## Mobile Optimizations

### Form Inputs
```css
.onboarding-input {
  min-height: 48px;  /* Android touch target */
  padding: 12px 16px;
  font-size: 16px;   /* Prevents iOS zoom-in */
}
```

### Button Layout
```css
/* Desktop: Inline right-aligned */
@media (min-width: 768px) {
  .step-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

/* Mobile: Stacked full-width, primary first */
@media (max-width: 767px) {
  .step-actions {
    display: flex;
    flex-direction: column-reverse;
    gap: 12px;
  }
  
  .step-actions button {
    width: 100%;
  }
}
```

### Theme Selection
```css
/* Desktop: 2-column grid */
@media (min-width: 768px) {
  .theme-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

/* Mobile: Single column */
@media (max-width: 767px) {
  .theme-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}
```

## Integration Points

These elements are designed to be extended:
- **StepLayout** - Reusable for other multi-step flows
- **ProgressDots** - Reusable for any stepped UI
- **ThemeCard** - Pattern for theme selection in settings
- **useOnboardingState** - Pattern for wizard state management
- **Atomic creation** - Pattern for multi-entity transactions

## Success Metrics

**Time to complete:**
- Step 1 (Portfolio): 30 seconds
- Step 2 (Theme): 30 seconds
- Step 3 (Category + Project): 1-2 minutes (with image upload)
- **Total: 2-3 minutes** (well under 5 minute target)

**Conversion:**
- Users who start Step 1 complete all 3 steps: >80%
- Users who skip onboarding and go direct to /admin: <20%

**User feedback:**
- "I knew what my portfolio would look like" (theme confidence)
- "Creating first project was easy" (guided structure)
- "Didn't feel overwhelming" (minimal fields, clear progress)

## Effort Estimate

**Total: 8-10 hours**
- StepLayout component: 1 hour
- ProgressDots component: 30 minutes
- Step 1 (Portfolio) page: 1-2 hours
- Step 2 (Theme) page: 2-3 hours
- ThemeCard component: 1 hour
- Step 3 (Category + Project) page: 2-3 hours
- useOnboardingState hook: 1 hour
- Routing logic: 1 hour
- Testing and polish: 1-2 hours
