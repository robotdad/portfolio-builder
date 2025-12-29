# Custom Theme Creation System

**Purpose:** Allow user customization with quality guardrails  
**Status:** Design specification for Phase 2  
**Last Updated:** 2025-12-28

---

## Core Concept

**Principle:** Theme-constrained creativity

Users can create custom themes by:
1. **Starting from a preset** (Modern, Classic, or Bold as template)
2. **Customizing colors** (with algorithmic palette generation + validation)
3. **Selecting fonts** (from curated, tasteful set)

**Guardrails ensure quality:**
- ✅ Color palette algorithmically generated from 1-2 base colors
- ✅ Automatic contrast validation (WCAG AA enforced)
- ✅ Font choices curated (6-8 options, all high-quality)
- ✅ Font pairings validated (no Comic Sans disasters)

---

## Customization Flow

### Step 1: Choose Base Theme

```
Create Custom Theme
├─ Start from: Modern Minimal     (recommended for most)
├─ Start from: Classic Elegant    (if you want larger typography)
└─ Start from: Bold Editorial     (if you want sans-serif)
```

**What you inherit:**
- Typography scale (1.25 or 1.333 ratio)
- Spacing values (standard or generous)
- Component sizing and behavior
- Responsive patterns

**What you can customize:**
- Color palette (completely)
- Font families (from curated sets)

---

### Step 2: Define Color Palette

**User provides:** 1-2 colors

**Option A: Primary Color Only**
```
Primary color: [Color picker] → User selects brand color
              ↓
System generates complementary palette:
- Background: Neutral (white or near-white)
- Surface: Slightly darker than background
- Text: High-contrast (near-black or dark gray)
- Accent: User's primary color
- Accent-hover: Darker shade of primary
- Borders: Light gray derivatives
```

**Option B: Primary + Secondary Colors**
```
Primary color: [Color picker] → Main brand color
Secondary color: [Color picker] → Complementary or accent

System generates:
- Background: Neutral
- Accent: Primary color
- Secondary accent: Secondary color (used for CTAs, highlights)
- Text colors: High-contrast neutrals
- Borders: Derived from background
```

**Algorithm considerations:**
- Use HSL color space (easier to generate shades)
- Generate 5-7 shades of primary (50, 100, 300, 500, 700, 900)
- Validate all text/background combinations
- Reject if any combination fails WCAG AA

---

### Color Generation Algorithm

**Input:** User's primary color (e.g., `hsl(340, 85%, 55%)` - hot pink)

**Generate palette:**

```javascript
function generatePalette(primaryHue, primarySat, primaryLight) {
  return {
    // Backgrounds - Always neutral for photos
    background: hsl(0, 0%, 100%),           // Pure white
    surface: hsl(0, 0%, 98%),               // Off-white
    
    // Text - High contrast for readability
    textPrimary: hsl(0, 0%, 10%),           // Near black
    textSecondary: hsl(0, 0%, 40%),         // Medium gray
    textTertiary: hsl(0, 0%, 60%),          // Light gray
    
    // Accent - User's color with validation
    accent: hsl(primaryHue, primarySat, primaryLight),
    accentHover: hsl(primaryHue, primarySat, primaryLight - 8%),  // Darker
    
    // Borders - Neutral
    border: hsl(0, 0%, 90%),
    borderStrong: hsl(0, 0%, 70%),
  };
}
```

**Validation step:**
```javascript
// Check accent on background contrast
const contrastRatio = calculateContrast(accent, background);

if (contrastRatio < 3.0) {
  // Adjust lightness to meet minimum contrast
  accent = adjustLightness(accent, targetContrast: 4.5);
  
  // Show user: "We adjusted your color slightly for readability"
  // Show preview of adjustment
}
```

**Smart adjustments:**
- If primary is too light: Darken for contrast
- If primary is too dark: May work (validate)
- If primary is too saturated: May reduce slightly for neutrals
- Always show "before/after" preview

---

### Step 3: Select Fonts

**Curated font library (6-8 options each):**

#### Heading Fonts (Serif Options)
- **Playfair Display** (editorial, elegant) - Default in Modern/Classic
- **Cormorant Garamond** (refined, literary)
- **Lora** (traditional, readable)
- **Crimson Pro** (classic, scholarly)

#### Heading Fonts (Sans-Serif Options)
- **Sora** (geometric, warm) - Default in Bold
- **Outfit** (geometric, contemporary)
- **Space Grotesk** (modern, tech-forward)
- **Archivo** (clean, professional)

#### Body Fonts (Sans-Serif Only)
- **Inter** (readable, modern) - Default
- **Geist Sans** (clean, technical) - Default in Bold
- **Source Sans 3** (Adobe, professional)
- **Manrope** (friendly, rounded)
- **Work Sans** (versatile, clean)
- **Public Sans** (government-grade readability)

**UI shows pairings:**
```
Serif Heading + Sans Body: [Preview with user's name]
  Playfair Display + Inter
  Cormorant + Inter
  Lora + Source Sans
  
Sans Heading + Sans Body: [Preview with user's name]
  Sora + Geist Sans
  Outfit + Manrope
  Space Grotesk + Inter
```

**Validation:**
- All fonts tested for readability at scale
- All fonts have good web performance
- All fonts properly licensed (Google Fonts)
- Pairings pre-validated (no bad combinations shown)

**User selects:**
- Heading font from list
- Body font from list
- Preview updates immediately with their name + sample text

---

### Step 4: Preview & Refine

**Live preview panel:**
```
┌─────────────────────────────────────┐
│  Your Custom Theme Preview          │
│                                     │
│  [Sample landing page with:]        │
│  - Your colors applied              │
│  - Your fonts applied               │
│  - Real portfolio content           │
│                                     │
│  Try on different pages:            │
│  [Landing] [Project] [Gallery]      │
│                                     │
│  Accessibility Check:               │
│  ✅ All contrast ratios pass        │
│  ⚠️  Accent slightly adjusted       │
└─────────────────────────────────────┘

[Save Custom Theme] [Adjust Colors] [Try Different Fonts]
```

**What user sees:**
- Live preview with their actual content
- Accessibility validation results
- Any adjustments made automatically
- Comparison to base theme they started from

---

## Implementation Approach

### Color Palette Generator

**Algorithm:**

1. **User inputs primary color** (color picker or hex value)
2. **System validates:**
   - Contrast on white background ≥ 3.0 (UI minimum)
   - If fails: Adjust lightness automatically
3. **System generates derivatives:**
   - Hover state: -8% lightness (darker)
   - Light tint: +30% lightness (for backgrounds if needed)
4. **System validates all combinations:**
   - Text-primary on background: Must be ≥ 4.5:1
   - Text-secondary on background: Must be ≥ 4.5:1
   - Accent on background: Must be ≥ 3.0:1
5. **If any fail:** Auto-adjust with explanation
6. **Show preview:** Before/after comparison

**User sees:**
```
Your Color: #FF1744 (Hot Pink)
  ↓
Generated Palette:
  Background: #FFFFFF (White)
  Accent: #FF1744 (Your color)
  Accent Hover: #E60F39 (Darker for interaction)
  
Accessibility: ✅ All checks pass
  • Accent on background: 4.2:1 (AA)
  • Text on background: 21:1 (AAA)
```

**Advanced: Secondary Color (Optional)**
```
Primary: #FF1744 (Hot Pink)
Secondary: #00BCD4 (Cyan)
  ↓
Generated Palette:
  Accent 1: #FF1744 (Primary buttons, main CTAs)
  Accent 2: #00BCD4 (Secondary buttons, links)
  
Validation: Check both colors independently
```

---

### Font Library

**Implementation:**

```typescript
const HEADING_FONTS = [
  { id: 'playfair', name: 'Playfair Display', category: 'serif', style: 'editorial' },
  { id: 'cormorant', name: 'Cormorant Garamond', category: 'serif', style: 'refined' },
  { id: 'lora', name: 'Lora', category: 'serif', style: 'traditional' },
  { id: 'crimson', name: 'Crimson Pro', category: 'serif', style: 'classic' },
  { id: 'sora', name: 'Sora', category: 'sans-serif', style: 'geometric' },
  { id: 'outfit', name: 'Outfit', category: 'sans-serif', style: 'contemporary' },
  { id: 'space-grotesk', name: 'Space Grotesk', category: 'sans-serif', style: 'modern' },
  { id: 'archivo', name: 'Archivo', category: 'sans-serif', style: 'professional' },
];

const BODY_FONTS = [
  { id: 'inter', name: 'Inter', style: 'modern' },
  { id: 'geist', name: 'Geist Sans', style: 'technical' },
  { id: 'source-sans', name: 'Source Sans 3', style: 'professional' },
  { id: 'manrope', name: 'Manrope', style: 'friendly' },
  { id: 'work-sans', name: 'Work Sans', style: 'versatile' },
  { id: 'public-sans', name: 'Public Sans', style: 'authoritative' },
];
```

**UI for selection:**
```
Choose Heading Font:
[Preview cards showing each font:]

┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Sarah Chen   │ │ Sarah Chen   │ │ Sarah Chen   │
│ Playfair     │ │ Cormorant    │ │ Lora         │
│ Editorial    │ │ Refined      │ │ Traditional  │
└──────────────┘ └──────────────┘ └──────────────┘

Choose Body Font:
┌──────────────┐ ┌──────────────┐
│ Sample text  │ │ Sample text  │
│ Inter        │ │ Geist Sans   │
│ Modern       │ │ Technical    │
└──────────────┘ └──────────────┘
```

**Preview shows:**
- User's actual name in each font
- Sample text at body size
- Style descriptor (editorial, modern, etc.)

---

## Customization Levels

### Level 1: Preset Themes (Phase 1)

**User selects from:**
- Modern Minimal
- Classic Elegant
- Bold Editorial

**No customization** - Just pick one that fits

---

### Level 2: Color Customization (Phase 2)

**Starting from preset theme:**
1. Select base theme: "Modern Minimal"
2. Keep: Typography scale, spacing, fonts
3. Customize: Colors only
4. Input: Primary color (brand color)
5. System: Generates palette, validates
6. Result: Modern Minimal structure with custom colors

**Example:**
```
Base: Modern Minimal (blue accent)
Custom: User's brand color (terracotta)
Result: Modern structure + terracotta accent
  → "Modern Minimal - Terracotta Variant"
```

---

### Level 3: Full Customization (Phase 2)

**Starting from preset theme:**
1. Select base: "Classic Elegant"
2. Customize colors: Input primary color
3. Customize fonts: Select heading + body from curated set
4. Preview: See it on their content
5. Validate: System checks accessibility
6. Save: Custom theme stored

**Example:**
```
Base: Classic Elegant (warm, large scale, Playfair + Inter)
Color: User's brand navy (#1a237e)
Fonts: Cormorant (heading) + Source Sans (body)
Result: Custom theme with:
  - Large typography scale (from Classic)
  - Generous spacing (from Classic)
  - Navy accent (user's brand)
  - Cormorant + Source Sans (user's choice)
```

---

## Validation & Guardrails

### Color Validation

**Automatic checks:**
```javascript
function validateCustomPalette(primary, background = white) {
  const checks = {
    accentContrast: calculateContrast(primary, background),
    textContrast: calculateContrast(textPrimary, background),
    readability: true,
  };
  
  // Enforce minimum contrast
  if (checks.accentContrast < 3.0) {
    // Auto-adjust lightness
    primary = adjustForContrast(primary, background, 3.0);
    checks.adjusted = true;
    checks.message = "We darkened your color slightly for readability";
  }
  
  return checks;
}
```

**User sees:**
```
Your Color: #87CEEB (Sky Blue - Too Light)
  ↓
Adjusted: #4A90A4 (Darker Blue)
Reason: Original was too light to read on white (contrast: 2.1:1)
New contrast: 4.5:1 ✅

[Preview Both] [Use Adjusted] [Try Different Color]
```

**Validation rules:**
- Accent on background: ≥ 3.0:1 (UI minimum)
- Target: ≥ 4.5:1 for primary interactive elements
- Text remains high-contrast (≥ 7:1 when possible)
- Borders maintain subtle contrast

---

### Font Pairing Validation

**Pre-validated pairings:**
```typescript
const RECOMMENDED_PAIRINGS = [
  { heading: 'playfair', body: 'inter', style: 'editorial' },
  { heading: 'cormorant', body: 'source-sans', style: 'refined' },
  { heading: 'lora', body: 'work-sans', style: 'traditional' },
  { heading: 'sora', body: 'geist', style: 'contemporary' },
  { heading: 'outfit', body: 'manrope', style: 'friendly' },
  { heading: 'space-grotesk', body: 'inter', style: 'modern' },
];
```

**User can:**
- Choose from recommended pairings (easiest)
- Mix any heading + any body font (advanced)
- Preview shows: "This pairing works well" or "Unconventional but acceptable"

**No restrictions** (all fonts work), but **guidance provided:**
- ✅ "Excellent pairing" (serif heading + sans body)
- ⚠️ "Unconventional" (sans heading + serif body - rare)
- ✅ "Modern pairing" (sans heading + sans body)

---

## UI Mockup (Text Description)

### Custom Theme Creator

```
┌────────────────────────────────────────────────────────┐
│ Create Custom Theme                                    │
│                                                        │
│ 1. Start From                                          │
│    ○ Modern Minimal  ● Classic Elegant  ○ Bold        │
│                                                        │
│ 2. Choose Your Colors                                  │
│    Primary Color:  [#FF6B6B] 🎨                       │
│    (Optional) Secondary: [        ] 🎨                 │
│                                                        │
│    Generated Palette:                   Preview:       │
│    ┌─────┐ Background (#FFFFFF)        ┌──────────┐  │
│    ┌─────┐ Accent (#FF6B6B)            │ Your     │  │
│    ┌─────┐ Text (#1A1A1A)              │ Portfolio│  │
│                                         │ Preview  │  │
│    ✅ All contrast checks pass          └──────────┘  │
│                                                        │
│ 3. Choose Fonts                                        │
│    Heading: [Cormorant Garamond ▼]                    │
│    Body:    [Source Sans 3 ▼]                         │
│                                                        │
│    Preview:                                            │
│    Sarah Chen  ← Heading font                         │
│    This is body text showing how it looks...          │
│    ✅ Refined pairing                                  │
│                                                        │
│ 4. Preview Your Theme                                  │
│    [Full-screen preview with your content]            │
│                                                        │
│    [Save as "My Custom Theme"] [Back] [Start Over]    │
└────────────────────────────────────────────────────────┘
```

---

## Saved Custom Themes

**User can create multiple:**
- "Brand Colors" (for client work)
- "Personal Style" (for personal site)
- "Festival Edition" (for specific events)

**Each custom theme stored:**
```json
{
  "id": "custom-sarah-brand",
  "name": "My Brand Theme",
  "base": "classic-elegant",
  "colors": {
    "primary": "#8B4513",
    "secondary": null
  },
  "fonts": {
    "heading": "cormorant",
    "body": "source-sans"
  },
  "created": "2025-12-28",
  "validated": true
}
```

**User can:**
- Switch between preset and custom themes
- Edit custom themes
- Delete custom themes
- Share custom themes (Phase 3? Export/import)

---

## Phase Planning

### Phase 1 (Current Scope)
- ✅ 3 preset themes (Modern, Classic, Bold)
- ✅ Theme swapping
- ❌ No customization yet

**Validation:** Preset themes prove system works

---

### Phase 2 (Custom Themes)
- ✅ Color customization (primary color input)
- ✅ Palette generation algorithm
- ✅ Automatic contrast validation
- ✅ Font selection from curated library
- ✅ Custom theme preview
- ✅ Save custom themes

**Estimate:** 1-2 weeks after Phase 1 complete

**Components needed:**
- Color picker component
- Palette generator (algorithm)
- Contrast validator (WCAG checker)
- Font preview component
- Custom theme save/manage UI

---

### Phase 3 (Advanced Customization - Future)
- Secondary color input (two-accent systems)
- Spacing adjustments (within base grid)
- Typography scale tweaks (1.2, 1.25, 1.333, 1.5 ratios)
- Dark mode toggle (auto-generate dark variants)
- Theme export/import (share with others)

---

## Curated Font Library Rationale

**Why limit fonts:**
- ✅ Prevents Comic Sans / Papyrus disasters
- ✅ All fonts tested for web performance
- ✅ All fonts readable at portfolio scales
- ✅ All fonts pair well with body fonts
- ✅ Maintains professional baseline

**Why 6-8 options:**
- ✅ Enough variety for expression
- ✅ Not overwhelming (decision paralysis)
- ✅ Manageable to load (performance)
- ✅ Curated quality (no bad choices)

**Font selection criteria:**
1. Professional appearance (no novelty fonts)
2. High readability (at display and body sizes)
3. Good web performance (optimized font files)
4. Proper licensing (Google Fonts = free, open)
5. Diverse styles (editorial, modern, traditional, contemporary)
6. Works with costume photography (doesn't compete)

---

## User Scenarios

### Scenario: Marcus (Brand Colors)

**Need:** Marcus has a personal brand color (coral #FF6B6B) from his logo

**Flow:**
1. Starts with Modern Minimal (likes the structure)
2. Clicks "Customize Theme"
3. Inputs coral color (#FF6B6B)
4. System generates palette, validates (passes)
5. Keeps default fonts (Playfair + Inter)
6. Previews: Coral accent looks great with his fashion work
7. Saves as "Marcus Brand Theme"
8. Switches to it on his published site

**Result:** Professional structure + his brand identity

---

### Scenario: Sarah (Subtle Customization)

**Need:** Sarah likes Classic Elegant but wants cooler tone (not warm cream)

**Flow:**
1. Starts with Classic Elegant (likes larger typography)
2. Clicks "Customize Theme"
3. Inputs cool blue-gray (#546E7A)
4. System adjusts background to cool gray (#F5F5F5)
5. Keeps Classic fonts (Playfair + Inter)
6. Previews: Cooler, more contemporary than Classic
7. Saves as "Contemporary Classic"

**Result:** Classic structure + contemporary cool palette

---

### Scenario: Emma (Conservative Customization)

**Need:** Emma wants navy (traditional) instead of blue/terracotta

**Flow:**
1. Starts with Modern Minimal
2. Customizes color to navy (#1A237E)
3. System validates (passes)
4. Switches to Lora + Source Sans (more traditional fonts)
5. Previews: Professional, conservative, authoritative
6. Saves as "Film Industry Standard"

**Result:** Traditional aesthetic with precise control

---

## Technical Implementation

### Color Palette Storage

```sql
custom_themes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(100),  -- "My Brand Theme"
  base_theme VARCHAR(50),  -- "modern-minimal"
  
  -- Color overrides
  color_primary VARCHAR(20),  -- "#FF6B6B"
  color_secondary VARCHAR(20),  -- NULL or "#00BCD4"
  
  -- Font overrides
  font_heading VARCHAR(50),  -- "cormorant"
  font_body VARCHAR(50),  -- "source-sans"
  
  -- Metadata
  created_at TIMESTAMP,
  validated BOOLEAN,  -- Passed accessibility checks
  validation_adjustments JSONB  -- What was auto-adjusted
)
```

### CSS Generation

**Runtime CSS generation:**
```javascript
function generateCustomThemeCSS(customTheme) {
  const palette = generatePalette(customTheme.color_primary);
  
  return `
    [data-theme="custom-${customTheme.id}"] {
      --color-accent: ${palette.accent};
      --color-accent-hover: ${palette.accentHover};
      --font-heading: '${customTheme.font_heading}', serif;
      --font-body: '${customTheme.font_body}', sans-serif;
    }
  `;
}
```

**Injected dynamically:**
```tsx
<style>{generateCustomThemeCSS(user.customThemes)}</style>
```

---

## Accessibility Guardrails

**Never let user create inaccessible theme:**

```javascript
function enforceAccessibility(userColor) {
  let adjustedColor = userColor;
  let adjusted = false;
  
  // Check accent on background
  while (calculateContrast(adjustedColor, WHITE) < 3.0) {
    adjustedColor = darkenColor(adjustedColor, 5%);
    adjusted = true;
  }
  
  if (adjusted) {
    showMessage(
      `We adjusted your color from ${userColor} to ${adjustedColor} ` +
      `to meet accessibility standards (readable for users with low vision).`
    );
  }
  
  return { color: adjustedColor, adjusted };
}
```

**User benefits:**
- Can't accidentally create unreadable sites
- Learns about accessibility (educational)
- Maintains professional quality (9.5/10 standard)

---

## Implementation Estimate

### Phase 2: Color Customization Only
**Effort:** 3-5 days
- Color picker component (1 day)
- Palette generation algorithm (1 day)
- Contrast validation (1 day)
- Preview integration (1 day)
- Save/manage UI (1 day)

### Phase 2: + Font Customization
**Additional effort:** 2-3 days
- Font preview component (1 day)
- Font loading optimization (1 day)
- Pairing recommendations (1 day)

**Total Phase 2 customization:** 1-1.5 weeks

---

## Recommendation

**Phase 1:** Ship with 3 preset themes
- Proves template + theme system works
- Validates with real users
- Gathers feedback on what customization is needed

**Phase 2:** Add custom theme creation
- Color customization (primary color input)
- Font selection (curated library)
- Based on Phase 1 learnings

**Why this order:**
- Validate core system first (don't over-build)
- Learn what users actually customize (might only be colors)
- Simpler implementation (preset themes are just CSS)
- Custom themes add complexity (database, validation, UI)

---

## Questions for Consideration

**1. How many custom themes per user?**
- Unlimited? (complex UI to manage)
- Limit to 3-5? (keeps UI simple)

**2. Should custom themes be shareable?**
- Export/import theme JSON?
- Community theme library?
- Might enable brand consistency across users

**3. Advanced controls in Phase 3?**
- Spacing adjustments? (probably not - too complex)
- Typography scale selection? (1.2, 1.25, 1.333, 1.5 ratios)
- Border radius adjustments? (rounded vs sharp)

**4. Dark mode auto-generation?**
- User creates light theme → System generates dark variant?
- Useful for Bold Editorial-style themes
- Added complexity (validate both modes)

---

## Updated Design Specs Summary

**Your themes now:**

**Preset Themes (Phase 1):**
1. Modern Minimal (default)
2. Classic Elegant (sophisticated)
3. Bold Editorial (contemporary)

**Custom Themes (Phase 2):**
4. Custom from Modern base (user colors + optional fonts)
5. Custom from Classic base (user colors + optional fonts)
6. Custom from Bold base (user colors + optional fonts)

**All themes:**
- ✅ Validated for accessibility
- ✅ Work with all templates
- ✅ Swappable without losing content
- ✅ Professional quality maintained

---

## Add to HANDOFF-TO-TECH.md

**New section for tech session:**

**Phase 2 Addition: Custom Theme System**
- Allow color customization (primary color input)
- Palette generation with validation
- Curated font library (6-8 heading, 6-8 body)
- Custom theme save/manage
- Preview with user's content
- All validation automated (no bad themes possible)

**Estimate:** 1-1.5 weeks after Phase 1

**See:** plans/design/CUSTOM-THEME-SYSTEM.md for complete specification

---

**Should I add this to the handoff document now?**
