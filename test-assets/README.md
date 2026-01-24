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

**What it does** (in ~10-20 seconds):
- Creates portfolio with name, bio, and location
- Uploads profile photos (4 per persona)
- Creates all categories with descriptions and featured images
- Creates all projects with rich metadata and content
- Adds gallery images to each project
- Captures verification screenshots
- **Total**: 60-170 images uploaded per persona

**After population**:
- Admin: http://localhost:3000/admin
- Public: http://localhost:3000/{persona-id}
- Screenshots: `ai_working/{persona-id}-*.png`

---

## Available Personas

### Sarah Chen - Costume Designer

**Location**: Portland, OR  
**Specialties**: Theater Production, Film Production, Television Production, Fashion Design

```
Portfolio: sarah-chen
Images: 145 total
  - 4 profile images (headshot, selfie, candid, on-job)
  - 141 project images across 4 categories

Categories (4):
  └─ Theater Production
     ├─ The Obsidian Crown
     ├─ Neon Babel
     └─ A Doll's House Reimagined
  
  └─ Film Production
     ├─ Velvet and Ash
     ├─ The Last Correspondence
     └─ Paper Tigers
  
  └─ Television Production
     ├─ The Architect's Daughter
     └─ Beneath the Surface
  
  └─ Fashion Design
     └─ Urban Armor Collection
```

### Emma Rodriguez - Film Costume Supervisor

**Location**: Los Angeles, CA  
**Specialties**: Period Epic, Contemporary Drama, Action/Stunt, International Location

```
Portfolio: emma-rodriguez
Images: 60 total
  - 4 profile images
  - 56 project images across 4 categories

Categories (4):
  └─ Period Epic
     ├─ The Winter Palace
     └─ Letters from Saigon
  
  └─ Contemporary Drama
     ├─ The Quiet Leaving
     └─ Midnight Pastoral
  
  └─ Action/Stunt
     ├─ Freefall
     └─ The Matador's Shadow
  
  └─ International Location
     ├─ The Crossing
     └─ The Long Road
```

### Julian Vane - Professional First Hand

**Location**: London, UK  
**Specialties**: Film Production, Theater Production, Specialty Techniques (Corsetry, Leatherwork)

```
Portfolio: julian-vane
Images: 167 total
  - 4 profile images
  - 163 project images across 4 categories

Categories (4):
  └─ Film Production
     ├─ The Crimson Inheritance
     └─ Shadows and Smoke
  
  └─ Theater Production
     ├─ Much Ado (Miami)
     └─ The Negative Space
  
  └─ Specialty Techniques - Corsetry
     └─ Victorian Corset Commission
  
  └─ Specialty Techniques - Leatherwork
     └─ Renaissance Armor Doublet
```

---

## Persona JSON Structure

Each persona is defined by a `persona.json` file with the following structure:

```json
{
  "persona": {
    "id": "sarah-chen",
    "name": "Sarah Chen",
    "role": "Costume Designer",
    "location": "Portland, OR",
    "bio": "Award-nominated costume designer...",
    "yearsActive": "2016-present"
  },
  "profile": {
    "images": [
      {
        "file": "profile/headshot-primary.jpg",
        "type": "headshot_primary",
        "title": "Professional Headshot",
        "description": "Studio portrait...",
        "prompt": "AI generation prompt (for reference)"
      }
    ]
  },
  "categories": [
    {
      "id": "theater-production",
      "name": "Theater Production",
      "slug": "theater-production",
      "description": "Category description...",
      "order": 1,
      "featuredPhoto": "categories/theater-production/the-obsidian-crown/queen-gown-production.jpg",
      "categoryContent": {
        "headline": "Designing Stories for the Stage",
        "introduction": "...",
        "approach": "..."
      },
      "projects": [
        {
          "id": "the-obsidian-crown",
          "title": "The Obsidian Crown",
          "slug": "the-obsidian-crown",
          "description": "Project description...",
          "isFeatured": true,
          "order": 1,
          "projectDetails": {
            "role": "Lead Costume Designer",
            "production": "The Obsidian Crown - Original Work",
            "venue": "Blackfriars Repertory Theatre, London",
            "year": 2024,
            "director": "Marcus Winters",
            "timeline": "4 weeks design, 12 weeks build",
            "budget": "$45,000",
            "scale": "28 principal costumes, 50+ ensemble"
          },
          "projectContent": {
            "challenge": "...",
            "approach": "...",
            "outcome": "..."
          },
          "techniques": ["Color theory", "Fabric deterioration"],
          "recognition": ["Award nomination"],
          "photos": [
            {
              "file": "categories/theater-production/the-obsidian-crown/concept-sketches.jpg",
              "title": "Character Arc Sketches",
              "description": "Initial concept sketches...",
              "tags": [],
              "prompt": "AI generation prompt..."
            }
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
- `location`: City, State/Country
- `bio`: Professional biography
- `yearsActive`: Career span

**Profile Level**:
- `images[]`: Array of 4 profile photos
  - `type`: `headshot_primary`, `selfie`, `candid`, or `on_job`
  - `file`: Path relative to `images/` directory

**Category Level**:
- `id`, `slug`: URL-safe identifiers
- `name`: Display name
- `description`: Short description
- `order`: Display order
- `featuredPhoto`: Path to category's featured image
- `categoryContent`: Extended content (headline, introduction, approach)

**Project Level**:
- `id`, `slug`: URL-safe identifiers
- `title`: Project name
- `description`: Project description
- `isFeatured`: Whether project appears on homepage
- `order`: Display order within category
- `projectDetails`: Metadata (role, venue, year, director, budget, scale)
- `projectContent`: Extended content (challenge, approach, outcome)
- `techniques`: Array of techniques used
- `recognition`: Array of awards/recognition

**Photo Level**:
- `file`: Path relative to `images/` directory
- `title`: Short title
- `description`: Alt text and caption
- `tags`: Array of tags
- `prompt`: AI generation prompt (for reference)

---

## Directory Structure

```
test-assets/
├── README.md (this file)
└── personas/
    ├── sarah-chen/
    │   ├── persona.json (portfolio structure)
    │   └── images/
    │       ├── profile/
    │       │   ├── headshot-primary.jpg
    │       │   ├── selfie-design-studio.jpg
    │       │   ├── candid-fabric-selection.jpg
    │       │   └── on-job-action.jpg
    │       └── categories/
    │           ├── theater-production/
    │           │   ├── the-obsidian-crown/
    │           │   │   ├── concept-sketches.jpg
    │           │   │   ├── queen-gown-production.jpg
    │           │   │   └── ... (more images)
    │           │   └── neon-babel/
    │           │       └── ...
    │           ├── film-production/
    │           │   └── ...
    │           └── ...
    │
    ├── emma-rodriguez/
    │   ├── persona.json
    │   └── images/
    │       ├── profile/ (4 images)
    │       └── categories/ (56 images)
    │
    └── julian-vane/
        ├── persona.json
        └── images/
            ├── profile/ (4 images)
            └── categories/ (163 images)
```

---

## The Population Script

**Location**: `scripts/populate-persona-api.js`

### What It Does

The script uses **direct API calls** (not UI automation) to:

1. **Check for existing portfolio** or create new one
2. **Upload profile photos** (all 4 types)
3. **Update portfolio settings** with bio, location, and profile photo
4. **Create categories** with descriptions and content
5. **For each project**:
   - Create project with rich metadata (venue, year, budget, etc.)
   - Upload all project images
   - Add gallery section to project
6. **Set category featured images**
7. **Capture verification screenshots**

### Performance

- Completes in ~10-20 seconds per persona
- Uploads 60-170 images depending on persona
- No timeout issues
- Reliable and repeatable

### Output

**Console output**:
```
🎭 Populating Portfolio for: sarah-chen
============================================================

📋 Setting up portfolio...
✓ Using existing portfolio: cmk2921ei0000185r7nrfbpqm

📸 Setting up profile...
✓ Profile configured with 4 images

📁 Creating categories...
  ✓ Theater Production (with content)
  ✓ Film Production (with content)
  ...

📝 Creating projects with images...

📁 Theater Production
  The Obsidian Crown
    ✓ Created with metadata and featured image
    📷 Uploading gallery images...
    ✓ Added 19 gallery images
  ...

==================================================
📊 Population Complete!
==================================================
Categories:          4
Projects:            10
Total Images:        145
Time:                15.3s
```

---

## Image Generation Script

**Location**: `scripts/generate-persona-images.js`

This script generates AI images for personas using the prompts defined in `persona.json`. It:
- Reads prompts from the persona's JSON file
- Generates images via AI image generation API
- Saves images to the organized directory structure
- Tracks progress and handles rate limits

---

## Adding New Personas

### Step 1: Create Directory Structure

```bash
mkdir -p test-assets/personas/your-persona-id/images/profile
mkdir -p test-assets/personas/your-persona-id/images/categories
```

### Step 2: Create persona.json

Copy and modify an existing `persona.json`:

```bash
cp test-assets/personas/sarah-chen/persona.json \
   test-assets/personas/your-persona-id/persona.json
```

Edit to include:
- Unique `id` (will be the portfolio URL)
- Person's `name`, `role`, `location`, and `bio`
- 4 profile images (headshot, selfie, candid, on-job)
- 3+ categories with descriptions
- 2+ projects per category with full metadata
- 10-20 images per project

### Step 3: Add Images

Place images in the organized structure:
- `images/profile/` - 4 profile images
- `images/categories/{category-slug}/{project-slug}/` - project images

Ensure:
- Filenames match those in `persona.json`
- All referenced images exist
- Category `featuredPhoto` refers to an existing project photo

### Step 4: Validate

```bash
# Check JSON is valid
jq '.' test-assets/personas/your-persona-id/persona.json

# Verify all image files exist
node -e "
const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync('test-assets/personas/your-persona-id/persona.json'));
const missing = [];
const baseDir = 'test-assets/personas/your-persona-id/images/';
data.profile.images.forEach(img => {
  if (!fs.existsSync(baseDir + img.file)) {
    missing.push(img.file);
  }
});
data.categories.forEach(cat => {
  cat.projects.forEach(proj => {
    proj.photos.forEach(photo => {
      if (!fs.existsSync(baseDir + photo.file)) {
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

### Profile Photo Types

| Type | Description |
|------|-------------|
| `headshot_primary` | Professional studio headshot |
| `selfie` | Casual selfie in work environment |
| `candid` | Candid shot taken by colleague |
| `on_job` | Action shot during work |

### Project Images

Project images should document the creative process:
- Concept sketches and mood boards
- Fabric/material selection
- Construction in progress
- Fittings and adjustments
- Final production shots
- Behind-the-scenes documentation

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
- Verify image files exist in the correct subdirectory
- Check filenames match exactly (case-sensitive)
- Ensure paths in `persona.json` are relative to `images/`

### Images not showing in admin
- Verify the upload completed successfully
- Check the API response for errors
- Ensure the server has write permissions to uploads directory

---

## Script Requirements

### Dependencies
- Playwright (for screenshots): `npm install -D playwright`
- Node.js 18+ (for native fetch support)

### Installation
```bash
# Install Playwright browsers (one-time)
npx playwright install chromium
```

---

## Technical Details

### API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/portfolio` | GET | Get portfolio ID |
| `/api/portfolio` | POST | Create new portfolio |
| `/api/portfolio` | PUT | Update bio and settings |
| `/api/upload` | POST | Upload images (multipart) |
| `/api/categories` | GET | List categories |
| `/api/categories` | POST | Create category |
| `/api/categories/{id}` | PUT | Update category |
| `/api/projects` | POST | Create project |
| `/api/projects/{id}` | PUT | Update project |

---

## Notes

### Why API Automation vs UI?

The population script uses **direct API calls** rather than UI automation because:

- **Much faster** - Seconds instead of minutes
- **More reliable** - No race conditions or timeouts
- **Easier to debug** - Direct HTTP responses
- **Reusable** - Same script works for all personas

UI automation (Playwright) is still used for:
- Screenshot capture
- Visual verification
- Exploratory testing

### Image Generation

All persona images were AI-generated using prompts documented in `persona.json`. The prompts are preserved for reference and can be used with `scripts/generate-persona-images.js` to regenerate images.

---

## Related Files

- **Population Script**: `scripts/populate-persona-api.js`
- **Image Generation**: `scripts/generate-persona-images.js`
- **Test Scripts**: `src/tests/` (Playwright tests)
- **Working Directory**: `ai_working/` (screenshots, reports - gitignored)
- **Agent Guide**: `AGENTS.md` (AI session learnings)

---

**Last Updated**: 2026-01-24
**Maintained By**: Development team
