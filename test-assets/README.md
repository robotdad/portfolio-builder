# Test Assets - Portfolio Testing Personas

This directory contains test data for end-to-end testing of the portfolio application. Three complete personas are provided, each with professional images and structured metadata for comprehensive testing scenarios.

## Directory Structure

```
test-assets/
├── personas/
│   ├── emma-rodriguez/
│   │   ├── images/           # 58 professional portfolio images
│   │   └── persona.json      # Complete portfolio data structure
│   ├── julian-vane/
│   │   ├── images/           # 62 professional portfolio images
│   │   └── persona.json      # Complete portfolio data structure
│   └── sarah-chen/
│       ├── images/           # 77 professional portfolio images
│       └── persona.json      # Complete portfolio data structure
└── README.md                 # This file
```

**Note:** These personas were consolidated from multiple source directories (full-portfolio, portfolio-bundle, portfolio-package) to provide comprehensive test coverage with varied image sets.

## Available Personas

### Emma Rodriguez - Film Costume Supervisor

**Profile:**
- 48-year-old Latina woman, silver-streaked brown hair
- Film production specialist focusing on continuity and on-set management
- ID: `emma-rodriguez`

**Portfolio Categories:**
- **War Drama** (2 projects): "Operation: Broken Arrow", "The Trenches of 1917"
- **Western** (2 projects): "Red Dust Saloon", "Sheriff's Last Stand"
- **Modern Thriller** (2 projects): "Protocol 7", "Nightshade"

**Content Types:**
- Continuity logs and documentation
- Wardrobe trailer organization
- Distress work and aging techniques
- On-set monitoring and verification
- Scripted damage documentation
- Night shoots and set atmosphere

**Testing Use Cases:**
- Multi-category portfolio navigation
- Featured project highlighting
- On-set workflow documentation
- Professional film production context
- Mid-size portfolio testing (58 images)

---

### Julian Vane - Professional First Hand

**Profile:**
- 35-year-old British-Nigerian man
- Technical construction specialist in costume craftsmanship
- ID: `julian-vane`

**Portfolio Categories:**
- **Menswear Tailoring** (2 projects): "Bespoke Morning Coat", "The Diplomat's Suit"
- **Leather Work** (2 projects): "Wasteland Armor Build", "The Aviator Jacket"
- **Corsetry** (2 projects): "Victorian Silk Bodice", "Bridal Structure"

**Content Types:**
- Construction details (pad stitching, internal architecture)
- Pressing and finishing techniques
- Cutting layouts and pattern drafts
- Stitch quality close-ups
- Completed garment presentations
- Hardware and closure details

**Testing Use Cases:**
- Technical process documentation
- Craft-focused portfolio structure
- Multiple specialty categories
- Detail-oriented image descriptions
- Medium-large portfolio testing (62 images)

---

### Sarah Chen - Theatre Costume Designer

**Profile:**
- 32-year-old Korean-American woman
- Theatre designer specializing in character design and fabrication
- ID: `sarah-chen`

**Portfolio Categories:**
- **Shakespearean Tragedy** (2 projects): "The Obsidian Crown", "Macbeth: Blood & Fog"
- **High Concept Sci-Fi** (2 projects): "Nebula Rising", "The Chromium Protocol"
- **Period Restoration** (2 projects): "The Gilded Court", "Letter from Vienna"

**Content Types:**
- Character design renderings
- Fabrication palettes and material swatches
- Technical drafts and patterns
- Muslin prototypes and fittings
- Embroidery and detail work
- Production stills and ensemble shots
- Texture under stage lighting
- Movement tests

**Testing Use Cases:**
- Design process visualization
- Theatrical production context
- Largest image set (77 images) for pagination/loading tests
- Rich variety of content types

---

## Data Schema

Each `persona.json` file contains:

```json
{
  "persona": {
    "id": "persona-id",
    "name": "Full Name",
    "role": "Professional Title"
  },
  "profile": {
    "images": [
      {
        "file": "filename.jpg",
        "description": "Professional headshot description",
        "prompt": "Original generation prompt"
      }
    ]
  },
  "categories": [
    {
      "name": "Category Name",
      "featuredPhoto": "category-featured-image.jpg",
      "projects": [
        {
          "title": "Project Title",
          "description": "Project description",
          "isFeatured": true,
          "photos": [
            {
              "file": "project-photo.jpg",
              "description": "Detailed photo description",
              "isFeatured": true,
              "isIdentity": false
            }
          ]
        }
      ]
    }
  ]
}
```

### Key Fields

- **`isFeatured`**: Flags for featured projects and photos
- **`isIdentity`**: Indicates profile/identity photos
- **`description`**: Rich, detailed descriptions for each image
- **`prompt`**: Original AI generation prompts (for profile images)

---

## Usage Examples

### Basic Playwright Test

```javascript
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('Load Emma Rodriguez portfolio', async ({ page }) => {
  // Load persona data
  const personaPath = path.join(__dirname, '../test-assets/personas/emma-rodriguez/persona.json');
  const persona = JSON.parse(fs.readFileSync(personaPath, 'utf-8'));
  
  // Navigate and populate
  await page.goto('/admin');
  
  // Fill persona info
  await page.fill('[name="name"]', persona.persona.name);
  await page.fill('[name="role"]', persona.persona.role);
  
  // Upload headshot
  const headshotPath = path.join(__dirname, '../test-assets/personas/emma-rodriguez/images/', 
    persona.profile.images[0].file);
  await page.setInputFiles('[type="file"]', headshotPath);
  
  // Verify
  await expect(page.getByText(persona.persona.name)).toBeVisible();
});
```

### Data-Driven Tests

```javascript
const personas = ['emma-rodriguez', 'julian-vane', 'sarah-chen'];

for (const personaId of personas) {
  test.describe(`${personaId} portfolio`, () => {
    const personaData = require(`../test-assets/personas/${personaId}/persona.json`);
    
    test('should display all categories', async ({ page }) => {
      // Test category navigation
      for (const category of personaData.categories) {
        await expect(page.getByText(category.name)).toBeVisible();
      }
    });
    
    test('should show featured projects', async ({ page }) => {
      // Find and verify featured projects
      const featured = personaData.categories
        .flatMap(cat => cat.projects)
        .filter(proj => proj.isFeatured);
      
      expect(featured.length).toBeGreaterThan(0);
    });
  });
}
```

### Image Upload Testing

```javascript
test('Bulk image upload for project', async ({ page }) => {
  const persona = require('../test-assets/personas/sarah-chen/persona.json');
  const imagesDir = path.join(__dirname, '../test-assets/personas/sarah-chen/images');
  
  // Get first project's photos
  const project = persona.categories[0].projects[0];
  const imagePaths = project.photos.map(photo => 
    path.join(imagesDir, photo.file)
  );
  
  // Upload all images for the project
  await page.setInputFiles('[type="file"][multiple]', imagePaths);
  
  // Verify count
  await expect(page.locator('.uploaded-image')).toHaveCount(imagePaths.length);
});
```

---

## Testing Scenarios

### Portfolio Creation
- Create complete portfolios from persona data
- Test form validation with real persona information
- Verify correct data storage and retrieval

### Image Management
- Upload multiple images per project
- Test featured image selection
- Verify image ordering and display
- Test lazy loading with large image sets (Sarah: 77 images)

### Category & Project Navigation
- Navigate between multiple categories (3 per persona)
- Switch between projects within categories (2 per category)
- Test featured project highlighting
- Verify correct filtering and display

### Content Rendering
- Display rich image descriptions
- Render category-specific content correctly
- Test different content types (process, production, design)
- Verify responsive image galleries

### Search & Filter
- Search across image descriptions
- Filter by category
- Filter by featured status
- Full-text search through metadata

### Performance Testing
- Load time with varying image counts (58, 62, 77 images)
- Pagination performance
- Gallery rendering optimization
- Concurrent portfolio loads

---

## Image Inventory

| Persona | Categories | Projects | Images | Use Case |
|---------|-----------|----------|--------|----------|
| Emma Rodriguez | 3 | 6 | 58 | Mid-size portfolio, film production |
| Julian Vane | 3 | 6 | 62 | Technical process, craft focus |
| Sarah Chen | 3 | 6 | 77 | Large portfolio, theatrical design |

**Total:** 197 professional images across 3 personas and 18 projects

---

## Maintenance Guidelines

### Adding New Personas

1. Create directory: `test-assets/personas/new-persona-id/`
2. Add `images/` subdirectory with portfolio images
3. Create `persona.json` following the schema above
4. Update this README with persona details

### Updating Persona Data

- Maintain consistent JSON structure across all personas
- Include detailed descriptions for new images
- Mark featured content appropriately
- Verify image file paths match actual files

### Image Guidelines

- Use `.jpg` format for consistency
- Maintain reasonable file sizes (< 5MB per image)
- Use descriptive filenames (e.g., `persona-identifier.jpg`)
- Ensure images represent realistic portfolio content

---

## Credits

These test personas were created with:
- AI-generated character profiles and project descriptions
- AI-generated portfolio images
- Structured metadata for comprehensive testing coverage

**Purpose:** These assets exist solely for testing and development of the portfolio application. They represent realistic portfolio content across multiple creative industries.

---

## Quick Reference

```bash
# Count images per persona
ls test-assets/personas/*/images/*.jpg | wc -l

# Validate JSON files
for json in test-assets/personas/*/persona.json; do
  echo "Validating $json"
  jq empty "$json" && echo "✓ Valid" || echo "✗ Invalid"
done

# Get persona IDs
ls test-assets/personas/

# Get category names for a persona
jq -r '.categories[].name' test-assets/personas/emma-rodriguez/persona.json
```

---

**Last Updated:** 2026-01-04  
**Personas:** 3 (Emma Rodriguez, Julian Vane, Sarah Chen)  
**Total Images:** 197  
**Total Projects:** 18
