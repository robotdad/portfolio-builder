# Test Assets - Portfolio Personas

This directory contains complete test personas for the Portfolio Builder application. Each persona includes realistic portfolio content (categories, projects, images) that can be quickly populated into a fresh database for testing, development, and demos.

---

## Quick Start

### Populate a Complete Portfolio

```bash
# From project root, populate any persona:
node scripts/populate-persona-api.js sarah-chen
node scripts/populate-persona-api.js emma-rodriguez
node scripts/populate-persona-api.js julian-vane
```

**What it does** (in ~5-10 seconds):
- Creates portfolio with name and bio
- Uploads profile photo
- Creates all categories with featured images
- Creates all projects with featured images
- Adds 8-image galleries to each project
- Captures verification screenshots
- **Total**: 50+ images uploaded per persona

**After population**:
- Admin: http://localhost:3000/admin
- Public: http://localhost:3000/{persona-id}
- Screenshots: `ai_working/{persona-id}-*.png`

---

## Available Personas

### Sarah Chen - Theatre Costume Designer

**Specialties**: Shakespearean Tragedy, High Concept Sci-Fi, Period Restoration

```
Portfolio: sarah-chen
Images: 77 total
  - 2 profile images (headshot, backstage selfie)
  - 75 project images (10 per project across 6 projects, with 1 reused as category featured)

Categories (3):
  └─ Shakespearean Tragedy
     ├─ The Obsidian Crown (10 images, featured)
     └─ Macbeth: Blood & Fog (10 images)
  
  └─ High Concept Sci-Fi
     ├─ Nebula Rising (10 images)
     └─ The Chromium Protocol (10 images)
  
  └─ Period Restoration
     ├─ The Gilded Court (10 images)
     └─ Letter from Vienna (10 images)
```

### Emma Rodriguez - Film Supervisor

**Specialties**: War Drama, Contemporary Realism, Period Western

```
Portfolio: emma-rodriguez
Images: 58 total
  - 2 profile images
  - 56 project images

Categories (3):
  └─ War Drama
     ├─ Operation: Broken Arrow
     └─ [Additional projects TBD]
  
  └─ Contemporary Realism
  └─ Period Western
```

### Julian Vane - Professional First Hand

**Specialties**: Menswear Tailoring, Historical Accuracy, Couture Construction

```
Portfolio: julian-vane
Images: 62 total
  - 2 profile images
  - 60 project images

Categories (3):
  └─ Menswear Tailoring
     ├─ Bespoke Morning Coat
     └─ [Additional projects TBD]
  
  └─ Historical Accuracy
  └─ Couture Construction
```

---

## Persona JSON Structure

Each persona is defined by a `persona.json` file with the following structure:

```json
{
  "persona": {
    "id": "sarah-chen",
    "name": "Sarah Chen",
    "role": "Theatre Costume Designer"
  },
  "profile": {
    "images": [
      {
        "file": "sarah-40opfzbgb.jpg",
        "description": "Headshot",
        "prompt": "AI generation prompt used (for reference)"
      }
    ]
  },
  "categories": [
    {
      "name": "Shakespearean Tragedy",
      "featuredPhoto": "sarah-zn1224dvq.jpg",
      "projects": [
        {
          "title": "The Obsidian Crown",
          "description": "Project description...",
          "isFeatured": true,
          "photos": [
            {
              "file": "sarah-zn1224dvq.jpg",
              "description": "Character Design Rendering",
              "isFeatured": true,
              "isIdentity": false
            },
            {
              "file": "sarah-ckyxh86xf.jpg",
              "description": "Fabrication Palette",
              "isFeatured": false,
              "isIdentity": false
            }
            // ... 8 more photos per project
          ]
        }
      ]
    }
  ]
}
```

### Key Fields

**Persona Level**:
- `id`: Unique identifier (used for portfolio URL slug)
- `name`: Full name displayed in portfolio
- `role`: Professional title/role

**Profile Level**:
- `images[0]`: Primary profile photo (headshot)
- `images[1]`: Optional secondary photo

**Category Level**:
- `name`: Category name
- `featuredPhoto`: Filename of category's featured image (must exist in a project's photos)

**Project Level**:
- `title`: Project name
- `description`: Project description
- `isFeatured`: Whether project appears on homepage
- `photos[]`: Array of 10 images per project
  - Exactly 1 must have `isFeatured: true` (used as project thumbnail)
  - Others are gallery images

**Photo Level**:
- `file`: Filename in `images/` directory
- `description`: Alt text and caption
- `isFeatured`: If true, this is the project's featured/thumbnail image
- `isIdentity`: (Currently unused)

---

## Directory Structure

```
test-assets/
├── README.md (this file)
└── personas/
    ├── sarah-chen/
    │   ├── persona.json (portfolio structure)
    │   └── images/ (77 images)
    │       ├── sarah-40opfzbgb.jpg (profile photo)
    │       ├── sarah-zn1224dvq.jpg (project featured image)
    │       └── ... (75 more images)
    │
    ├── emma-rodriguez/
    │   ├── persona.json
    │   └── images/ (58 images)
    │
    └── julian-vane/
        ├── persona.json
        └── images/ (62 images)
```

---

## The Population Script

**Location**: `scripts/populate-persona-api.js`

### What It Does

The script uses **direct API calls** (not UI automation) to:

1. **Check for existing portfolio** or create new one
2. **Upload profile photo** via `POST /api/upload`
3. **Update portfolio settings** with bio and profile photo
4. **Create categories** via `POST /api/categories`
5. **For each project**:
   - Upload featured image
   - Create project with `POST /api/projects`
   - Upload 8 gallery images
   - Add gallery section to project via `PUT /api/projects/{id}`
6. **Set category featured images** via `PUT /api/categories/{id}`
7. **Capture verification screenshots**

### Performance

**API-based approach** (current):
- Completes in ~5-10 seconds
- Uploads 50+ images per persona
- No timeout issues
- Reliable and repeatable

**UI automation alternative** (deprecated):
- Would take minutes
- Prone to race conditions and timeouts
- Hard to debug

### Output

**Console output**:
```
🎭 Populating Portfolio for: sarah-chen
============================================================

📋 Setting up portfolio...
✓ Using existing portfolio: cmk2921ei0000185r7nrfbpqm

📸 Setting up profile...
✓ Profile configured

📁 Creating categories...
  ✓ Shakespearean Tragedy
  ✓ High Concept Sci-Fi
  ✓ Period Restoration

📝 Creating projects with images...

📁 Shakespearean Tragedy
  The Obsidian Crown
    ✓ Created with featured image
    📷 Uploading 8 gallery images...
    ✓ Added 8 gallery images
  ...

==================================================
📊 Population Complete!
==================================================
Categories:          3
Projects:            6
Total Images:        55
  - Profile:         1
  - Featured:        6
  - Gallery:         48
Time:                7.3s
```

**Generated files**:
- `ai_working/{persona-id}-admin-dashboard.png` - Admin interface
- `ai_working/{persona-id}-admin-categories.png` - Categories with featured images
- `ai_working/{persona-id}-public-home.png` - Public homepage
- `ai_working/{persona-id}-population-summary.json` - Stats and metadata

---

## Use Cases

### 1. Acceptance Testing

Quickly populate a complete portfolio to test:
- UI rendering with real content
- Image galleries and lightboxes
- Category navigation
- Project detail pages
- Responsive layouts

### 2. UI/UX Exploration

Explore the application with realistic content to discover:
- Visual design issues
- Layout problems
- Navigation bugs
- Performance with multiple images

### 3. Demo Preparation

Generate a polished portfolio in seconds for:
- Client demos
- Stakeholder presentations
- Feature showcases

### 4. Development

Reset database and repopulate to:
- Test new features with realistic data
- Validate database migrations
- Debug with consistent test data

---

## Adding New Personas

### Step 1: Create Directory Structure

```bash
mkdir -p test-assets/personas/your-persona-id/images
```

### Step 2: Create persona.json

Copy and modify an existing `persona.json`:

```bash
cp test-assets/personas/sarah-chen/persona.json \
   test-assets/personas/your-persona-id/persona.json
```

Edit to include:
- Unique `id` (will be the portfolio URL)
- Person's `name` and `role`
- 2 profile images
- 3 categories (or more)
- 2 projects per category (or more)
- 10 images per project (1 featured + 9 gallery)

### Step 3: Add Images

Place all images in `images/` directory. Ensure:
- Filenames match those in `persona.json`
- Profile photos exist
- All project photos exist
- Category `featuredPhoto` refers to an existing project photo

### Step 4: Validate

```bash
# Check JSON is valid
jq '.' test-assets/personas/your-persona-id/persona.json

# Verify all image files exist
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('test-assets/personas/your-persona-id/persona.json'));
const missing = [];
data.profile.images.forEach(img => {
  if (!fs.existsSync('test-assets/personas/your-persona-id/images/' + img.file)) {
    missing.push(img.file);
  }
});
data.categories.forEach(cat => {
  cat.projects.forEach(proj => {
    proj.photos.forEach(photo => {
      if (!fs.existsSync('test-assets/personas/your-persona-id/images/' + photo.file)) {
        missing.push(photo.file);
      }
    });
  });
});
if (missing.length > 0) {
  console.log('Missing images:', missing);
} else {
  console.log('✓ All images found');
}
"
```

### Step 5: Populate

```bash
node scripts/populate-persona-api.js your-persona-id
```

---

## Image Requirements

### Formats
- **Supported**: JPEG, PNG, WebP
- **Max size**: 10MB per file
- **Recommended**: JPEG at 2400x1792 or similar (app will resize)

### Types

**Profile Photo** (`profile.images[0]`):
- Professional headshot
- Clear face visibility
- Neutral background preferred

**Project Featured Images** (`isFeatured: true`):
- Representative of the project
- High visual impact
- Used as thumbnail in grid views

**Gallery Images** (`isFeatured: false`):
- Detail shots, process documentation
- Can be sketches, swatches, production stills
- 8-9 images per project recommended

**Category Featured Images**:
- Must reference a photo from one of the category's projects
- Specified in `category.featuredPhoto` field
- Used as category thumbnail

---

## Database Reset Workflow

To start fresh with a new persona:

```bash
# 1. Stop the dev server (Ctrl+C)

# 2. Reset database
rm src/prisma/dev.db
npx prisma migrate dev --name init

# 3. Start server
npm run dev

# 4. Populate persona (in another terminal)
node scripts/populate-persona-api.js sarah-chen

# 5. Verify
open http://localhost:3000/sarah-chen
```

---

## Troubleshooting

### "Persona not found"
- Check that `test-assets/personas/{id}/persona.json` exists
- Verify the persona ID matches the directory name

### "Image not found" during population
- Verify image files exist in `images/` directory
- Check filenames match exactly (case-sensitive)
- Ensure no typos in `persona.json`

### "Featured image is required" errors
- Each project must have exactly 1 photo with `isFeatured: true`
- Check the `photos` array in `persona.json`

### Gallery images not showing in admin
- Gallery sections require specific JSON structure
- Script generates correct structure automatically
- If manually editing, ensure: `{id, imageId, imageUrl, altText, caption}`

### Publish All button doesn't work
- Requires fix in `src/app/api/categories/route.ts` (add `includeProjects` support)
- Check network tab for API errors
- Verify all projects have `draftContent`

---

## Script Requirements

### Dependencies
- Playwright (for API client and screenshots): `npm install -D playwright`
- Node.js 18+ (for native fetch support)

### Installation
```bash
# Install Playwright browsers (one-time)
npx playwright install chromium
```

---

## Technical Details

### API Endpoints Used

The population script uses these API endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/portfolio` | GET | Get portfolio ID |
| `/api/portfolio` | POST | Create new portfolio |
| `/api/portfolio` | PUT | Update bio and settings |
| `/api/upload` | POST | Upload images (multipart) |
| `/api/categories` | GET | List categories |
| `/api/categories` | POST | Create category |
| `/api/categories/{id}` | PUT | Update category (featured image) |
| `/api/projects` | POST | Create project |
| `/api/projects/{id}` | PUT | Update project (add gallery) |

### Gallery Content Structure

Projects store gallery images in `draftContent` as JSON:

```json
{
  "sections": [
    {
      "id": "section_1767683965619_abc123",
      "type": "gallery",
      "heading": "",
      "images": [
        {
          "id": "gallery_image_1767683964644_xyz789",
          "imageId": "cmk29e4f40021185r2jsje4px",
          "imageUrl": "/uploads/cmk29e4f40021185r2jsje4px/display.webp",
          "altText": "Fabrication Palette",
          "caption": "Fabrication Palette"
        }
      ]
    }
  ]
}
```

**Important**: Gallery images use `imageId` and `imageUrl` (not `id` and `url`)

---

## Extending the Test Assets

### Adding More Projects to Existing Personas

Edit the `persona.json` file:

1. Add new project to a category's `projects` array
2. Include 10 photos (1 featured + 9 gallery)
3. Add corresponding image files to `images/` directory
4. Re-run population script

### Adding More Categories

1. Add new category object to `categories` array
2. Include `name` and `featuredPhoto`
3. Add at least 2 projects with photos
4. Re-run population script

### Customizing Project Metadata

The script hardcodes some values - to customize:
- **Year**: Edit line ~170 in `scripts/populate-persona-api.js`
- **Venue**: Edit line ~171
- **Role**: Edit line ~172
- **Bio**: Edit line ~70 (uses template, can be customized per persona)

---

## Best Practices

### For Testing
- Reset database between test runs for consistency
- Use Sarah Chen (most complete) for comprehensive testing
- Use other personas to test variety and edge cases

### For Demos
- Populate the night before (takes seconds to refresh)
- Verify screenshots before presenting
- Keep personas in `test-assets` out of git (already in `.gitignore`)

### For Development
- Use personas to test new features with realistic content
- Keep `persona.json` structure up-to-date as schema evolves
- Add new personas when testing specific edge cases

---

## File Naming Convention

Images use randomized IDs to prevent collisions:

```
{persona-id}-{random-id}.jpg

Examples:
- sarah-40opfzbgb.jpg (profile photo)
- sarah-zn1224dvq.jpg (project image)
- emma-vzeucwp2w.jpg (profile photo)
```

---

## Notes

### Why API Automation vs UI?

The population script uses **direct API calls** rather than UI automation because:

✅ **Much faster** - Seconds instead of minutes
✅ **More reliable** - No race conditions or timeouts
✅ **Easier to debug** - Direct HTTP responses
✅ **Reusable** - Same script works for all personas

UI automation (Playwright) is still used for:
- Screenshot capture
- Visual verification
- Exploratory testing

### Image Generation

All persona images were AI-generated using prompts documented in `persona.json`. The prompts are preserved for reference but not required for script operation.

---

## Contributing

When adding new personas:

1. Follow the established naming conventions
2. Include complete `persona.json` with all required fields
3. Provide at least 2 profile images
4. Include 3 categories with 2+ projects each
5. Ensure 10 images per project (1 featured + 9 gallery)
6. Test population script succeeds before committing

---

## Related Files

- **Population Script**: `scripts/populate-persona-api.js`
- **Test Scripts**: `tests/` (Playwright UI tests)
- **Working Directory**: `ai_working/` (screenshots, reports - gitignored)
- **Agent Guide**: `.amplifier/AGENTS.md` (AI session learnings)

---

**Last Updated**: 2026-01-06
**Maintained By**: Development team
**Questions?**: See `.amplifier/AGENTS.md` for detailed testing patterns
