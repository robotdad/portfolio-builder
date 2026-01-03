# About Section (Optional Bio)

**Goal:** Portfolio owners can add an optional About section to their homepage with photo and bio text.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/DESIGN-SYSTEM.md
@plans/design/templates/featured-grid-landing.md

## Scope

**Included**:
- About section component for homepage
- Portfolio bio and profile photo fields
- Toggle control to show/hide About section
- Side-by-side layout (desktop): photo left, bio right
- Stacked layout (mobile): photo top, bio bottom
- Optional bio in onboarding flow (extend Slice 19)
- About section works with all templates and themes
- Responsive design (mobile/tablet/desktop)

**NOT Included**:
- Dedicated About page (users can create via Pages if desired)
- Extended bio with multiple paragraphs
- Social media links
- Contact information
- Awards or credentials sections
- Photo gallery in About section

## Tech Stack
- React component for About section
- Existing Portfolio model (bio field exists)
- Add profilePhotoId field to Portfolio
- Asset model for profile photo
- CSS for responsive layout
- Existing section rendering system

## Key Files
```
src/components/portfolio/AboutSection.tsx       # About component
src/app/[slug]/page.tsx                         # Update: render About if bio exists
src/app/welcome/portfolio/page.tsx              # Update: add optional bio fields
prisma/schema.prisma                            # Add profilePhotoId field
src/components/admin/SettingsDropdown.tsx       # Add About toggle
```

## UI Design

### Desktop Layout (Side-by-Side)

```
┌──────────────────────────────────────────────┐
│                                              │
│  About                                       │
│                                              │
│  ┌────────────┐  Sarah is a costume         │
│  │            │  designer with 10+ years     │
│  │  Profile   │  experience in regional      │
│  │   Photo    │  theatre, specializing in    │
│  │  400x400   │  period drama and            │
│  │            │  historical accuracy.        │
│  └────────────┘                              │
│                                              │
└──────────────────────────────────────────────┘

Photo: 400px square (or circle)
Bio: 2-4 paragraphs, max-width 600px
Gap: --space-8 (48px)
```

### Mobile Layout (Stacked)

```
┌───────────────────────┐
│                       │
│  About                │
│                       │
│   ┌─────────────┐     │
│   │             │     │
│   │   Profile   │     │
│   │    Photo    │     │
│   │   300x300   │     │
│   │             │     │
│   └─────────────┘     │
│                       │
│  Sarah is a costume   │
│  designer with 10+    │
│  years experience...  │
│                       │
└───────────────────────┘

Photo: 300px square, centered
Bio: Full-width, centered text
Gap: --space-6 (24px)
```

### Onboarding Bio Fields (Step 1 Extension)

```
┌──────────────────────────────────────────────┐
│  Create Your Portfolio                       │
│  Step 1 of 3                                 │
│                                              │
│  Portfolio Name *                            │
│  [Sarah Chen                            ]    │
│                                              │
│  Your Title (optional)                       │
│  [Theatre Costume Designer              ]    │
│                                              │
│  ▼ Add a short bio (optional)                │
│  ┌──────────────────────────────────────┐   │
│  │ Tell visitors a bit about your       │   │
│  │ work and experience...               │   │
│  └──────────────────────────────────────┘   │
│  Max 500 characters                          │
│                                              │
│  ▼ Add a profile photo (optional)            │
│  [📷 Upload Photo]                           │
│                                              │
│                      [Continue to Themes →]  │
└──────────────────────────────────────────────┘
```

### Settings Toggle

```
┌──────────────────────────────────────────────┐
│  Portfolio Settings                      [×] │
├──────────────────────────────────────────────┤
│                                              │
│  About Section                               │
│  ☑ Show About section on homepage            │
│                                              │
│  Bio                                         │
│  ┌──────────────────────────────────────┐   │
│  │ I specialize in period drama with    │   │
│  │ 10+ years experience...              │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  Profile Photo                               │
│  [Current photo thumbnail]                   │
│  [Change Photo] [Remove]                     │
│                                              │
└──────────────────────────────────────────────┘
```

## Component Implementation

### AboutSection Component

```typescript
interface AboutSectionProps {
  bio: string
  profilePhoto?: {
    url: string
    altText: string
  }
  name: string
  theme: string
  className?: string
}

export function AboutSection({
  bio,
  profilePhoto,
  name,
  theme,
  className
}: AboutSectionProps) {
  if (!bio) return null // Don't render if no bio
  
  return (
    <section className={`about-section ${className || ''}`} data-theme={theme}>
      <h2 className="about-heading">About</h2>
      
      <div className="about-content">
        {profilePhoto && (
          <div className="about-photo">
            <img
              src={profilePhoto.url}
              alt={profilePhoto.altText || `Photo of ${name}`}
              className="about-photo-image"
            />
          </div>
        )}
        
        <div className="about-bio">
          <p className="about-bio-text">{bio}</p>
        </div>
      </div>
    </section>
  )
}
```

### Integration in Homepage

```tsx
// src/app/[slug]/page.tsx

export default async function PortfolioPage({ params }: PageProps) {
  // ... fetch portfolio data ...
  
  return (
    <div className="portfolio-page" data-theme={portfolio.publishedTheme}>
      <Navigation ... />
      
      <main>
        {/* Hero section */}
        <SectionRenderer sections={heroSection} />
        
        {/* About section (if bio exists and toggle enabled) */}
        {portfolio.bio && portfolio.showAboutSection && (
          <AboutSection
            bio={portfolio.bio}
            profilePhoto={portfolio.profilePhoto}
            name={portfolio.name}
            theme={portfolio.publishedTheme}
          />
        )}
        
        {/* Featured work */}
        <FeaturedWork projects={featuredProjects} />
      </main>
    </div>
  )
}
```

## Database Schema Updates

### Portfolio Model

```prisma
model Portfolio {
  id String @id @default(cuid())
  slug String @unique
  name String
  
  // About section fields
  title String?              // Professional title
  bio String?                // Short bio (already exists)
  profilePhotoId String?     // NEW: Reference to Asset
  profilePhoto Asset? @relation(fields: [profilePhotoId], references: [id])
  showAboutSection Boolean @default(false)  // NEW: Toggle visibility
  
  // ... existing fields
}
```

## Onboarding Integration

### Updated Step 1 Fields

```typescript
// Current onboarding Step 1
interface OnboardingStep1Data {
  name: string
  slug: string
  
  // NEW: Optional About fields
  title?: string         // "Theatre Costume Designer"
  bio?: string           // 2-4 sentences, max 500 chars
  profilePhotoId?: string // Upload during onboarding
}
```

### Onboarding Completion Logic

```typescript
// When completing onboarding
const createPortfolio = async (data: OnboardingData) => {
  const portfolio = await prisma.portfolio.create({
    data: {
      name: data.step1.name,
      slug: data.step1.slug,
      title: data.step1.title,
      bio: data.step1.bio,
      profilePhotoId: data.step1.profilePhotoId,
      showAboutSection: data.step1.bio ? true : false, // Auto-enable if bio provided
      theme: data.step2.theme,
      // ...
    }
  })
}
```

## Settings UI for About

### Toggle Control

```tsx
<div className="settings-field">
  <label className="settings-label">
    <input
      type="checkbox"
      checked={portfolio.showAboutSection}
      onChange={(e) => updatePortfolio({ showAboutSection: e.target.checked })}
    />
    Show About section on homepage
  </label>
  <p className="settings-helper">
    Display your bio and profile photo below the hero section
  </p>
</div>
```

### Bio Editor

```tsx
<div className="settings-field">
  <label htmlFor="bio" className="settings-label">Bio</label>
  <textarea
    id="bio"
    value={portfolio.bio || ''}
    onChange={(e) => updatePortfolio({ bio: e.target.value })}
    placeholder="Tell visitors about your work and experience..."
    maxLength={500}
    rows={4}
  />
  <p className="settings-helper">
    {portfolio.bio?.length || 0} / 500 characters
  </p>
</div>
```

### Profile Photo Editor

```tsx
<div className="settings-field">
  <label className="settings-label">Profile Photo</label>
  
  {portfolio.profilePhoto ? (
    <div className="profile-photo-current">
      <img
        src={portfolio.profilePhoto.thumbnailUrl}
        alt="Current profile photo"
        className="profile-photo-thumbnail"
      />
      <div className="profile-photo-actions">
        <button onClick={handleChangePhoto}>Change Photo</button>
        <button onClick={handleRemovePhoto}>Remove</button>
      </div>
    </div>
  ) : (
    <button onClick={handleUploadPhoto} className="upload-button">
      📷 Upload Profile Photo
    </button>
  )}
</div>
```

## CSS Patterns

### About Section Layout

```css
.about-section {
  margin-top: var(--space-12);
  padding-top: var(--space-8);
  border-top: 1px solid var(--color-border);
}

.about-heading {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-family-primary);
  color: var(--color-text-primary);
  text-align: center;
  margin: 0 0 var(--space-8) 0;
}

.about-content {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: var(--space-8);
  max-width: 1000px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .about-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

.about-photo {
  width: 400px;
  height: 400px;
  border-radius: var(--card-radius);
  overflow: hidden;
  background: var(--color-surface);
}

@media (max-width: 768px) {
  .about-photo {
    width: 300px;
    height: 300px;
    margin: 0 auto;
  }
}

.about-photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.about-bio {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.about-bio-text {
  font-size: var(--font-size-lg);
  line-height: var(--leading-relaxed);
  color: var(--color-text);
  margin: 0;
  white-space: pre-wrap;
}
```

## Demo Script (30 seconds)
1. Complete onboarding - Add bio and profile photo in Step 1
2. Finish onboarding - Portfolio created
3. Visit homepage - See About section below hero
4. About section shows profile photo and bio side-by-side
5. Resize to mobile - About section stacks vertically
6. Open portfolio settings in admin
7. See "Show About section" checkbox (checked)
8. Uncheck box - Save settings
9. Refresh homepage - About section hidden
10. Re-check box in settings
11. Edit bio text - Update and save
12. Refresh homepage - See updated bio
13. Upload new profile photo - Save
14. Homepage shows new photo
15. Test with all 3 themes - About section styles adapt
16. **Success**: Optional About section with photo and bio

## Success Criteria

### Functional Requirements
- [ ] Portfolio.title field exists
- [ ] Portfolio.bio field exists (already exists)
- [ ] Portfolio.profilePhotoId field exists
- [ ] Portfolio.showAboutSection field exists
- [ ] Onboarding Step 1 has optional title field
- [ ] Onboarding Step 1 has optional bio field (collapsible)
- [ ] Onboarding Step 1 has optional photo upload (collapsible)
- [ ] Bio auto-enables showAboutSection if provided
- [ ] Homepage renders AboutSection if bio exists and toggle enabled
- [ ] AboutSection hidden if bio empty
- [ ] AboutSection hidden if toggle disabled
- [ ] Settings has bio text editor
- [ ] Settings has profile photo upload
- [ ] Settings has show/hide toggle
- [ ] Updating bio updates homepage
- [ ] Updating photo updates homepage
- [ ] About section works with Featured Grid template
- [ ] About section works with Clean Minimal template

### Design Requirements
- [ ] Desktop: Side-by-side layout (400px photo, 600px text)
- [ ] Mobile: Stacked layout (300px photo, full-width text)
- [ ] Photo: Square or circular, proper aspect ratio
- [ ] Bio: Readable line-length (max-width 600px)
- [ ] Spacing: --space-8 between photo and text
- [ ] Typography: --font-size-lg for bio text
- [ ] Heading: "About" centered above content
- [ ] Section: Border-top separator from hero
- [ ] Margin: --space-12 top spacing
- [ ] Works with all 3 themes

### Accessibility Requirements
- [ ] Profile photo has descriptive alt text
- [ ] Bio text has proper paragraph structure
- [ ] Heading hierarchy correct (h2 for "About")
- [ ] Color contrast meets WCAG AA
- [ ] Text readable (line-height relaxed)
- [ ] Focus indicators if interactive elements

### Mobile Requirements
- [ ] Photo centered on mobile
- [ ] Photo 300px on mobile (not 400px)
- [ ] Text centered on mobile
- [ ] Readable on small screens
- [ ] Proper touch spacing
- [ ] No horizontal scroll

### Onboarding Requirements
- [ ] Title field collapsible (default collapsed)
- [ ] Bio field collapsible (default collapsed)
- [ ] Photo upload collapsible (default collapsed)
- [ ] All fields optional (can skip)
- [ ] Placeholder text helpful
- [ ] Character count for bio (500 max)
- [ ] Onboarding completes in <5 min even with bio
- [ ] Mobile-friendly onboarding fields

## Onboarding Updates

### Step 1: Add Optional Fields

```tsx
// Current fields
<Input name="name" required />
<Input name="slug" />

// NEW: Optional collapsible fields
<CollapsibleField
  trigger="Add a professional title (optional)"
  defaultOpen={false}
>
  <Input
    name="title"
    placeholder="e.g., Costume Designer, Freelance Stylist"
    maxLength={100}
  />
</CollapsibleField>

<CollapsibleField
  trigger="Add a short bio (optional)"
  defaultOpen={false}
>
  <Textarea
    name="bio"
    placeholder="Tell visitors about your work and experience..."
    maxLength={500}
    rows={4}
  />
  <p className="char-count">{bioLength} / 500 characters</p>
</CollapsibleField>

<CollapsibleField
  trigger="Add a profile photo (optional)"
  defaultOpen={false}
>
  <FeaturedImagePicker
    onUpload={handlePhotoUpload}
    label="Profile Photo"
    helperText="A professional photo helps visitors connect with you"
  />
</CollapsibleField>
```

## Pattern Reference

### Collapsible Field Pattern

```typescript
interface CollapsibleFieldProps {
  trigger: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function CollapsibleField({
  trigger,
  defaultOpen = false,
  children
}: CollapsibleFieldProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="collapsible-field">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="collapsible-trigger"
        aria-expanded={isOpen}
      >
        <ChevronIcon direction={isOpen ? 'down' : 'right'} />
        {trigger}
      </button>
      
      {isOpen && (
        <div className="collapsible-content">
          {children}
        </div>
      )}
    </div>
  )
}
```

### About Section Rendering Logic

```typescript
// Only render if:
// 1. Bio exists
// 2. Toggle is enabled (or bio is new and toggle not explicitly disabled)

const shouldShowAbout = portfolio.bio && 
  (portfolio.showAboutSection ?? true) // Default true if bio exists

{shouldShowAbout && (
  <AboutSection
    bio={portfolio.bio}
    profilePhoto={portfolio.profilePhoto}
    name={portfolio.name}
    theme={portfolio.publishedTheme}
  />
)}
```

## Integration Points

These elements are designed to be extended:
- **AboutSection** - Can add contact info, social links later
- **CollapsibleField** - Reusable for other optional onboarding fields
- **Profile photo** - Can add cropping tool later
- **Bio editor** - Can upgrade to rich text later

## Effort Estimate

**Total: 6-8 hours**
- Portfolio schema updates: 30 minutes
- AboutSection component: 1-2 hours
- Onboarding Step 1 updates: 2-3 hours
- Settings UI updates: 1-2 hours
- CollapsibleField component: 1 hour
- Integration and testing: 1-2 hours
