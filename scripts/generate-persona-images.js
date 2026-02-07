#!/usr/bin/env node

/**
 * Generate images for personas using Gemini API
 * 
 * Supports both legacy and enhanced persona formats:
 * - Legacy: Reads persona.json, outputs to flat images/
 * - Enhanced: Reads persona-enhanced.json, outputs to organized images/profile/ and images/categories/
 * 
 * Image types and aspect ratios:
 *   Each photo entry can specify `imageType` and `aspectRatio` for realistic output.
 *   If omitted, the script infers sensible defaults from prompt text analysis.
 * 
 *   Supported imageTypes: bts_phone, production_stage, production_film,
 *     detail_closeup, candid_identity, studio_documentation, sketch_scan
 * 
 *   Supported aspectRatios (Gemini API): 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9
 * 
 * Usage:
 *   node scripts/generate-persona-images.js julian-vane              # Legacy format
 *   node scripts/generate-persona-images.js julian-vane --enhanced   # Enhanced format, all images
 *   node scripts/generate-persona-images.js julian-vane --enhanced --profile-only    # Profile images only
 *   node scripts/generate-persona-images.js julian-vane --enhanced --category=menswear-tailoring  # One category
 *   node scripts/generate-persona-images.js julian-vane --enhanced --project=bespoke-morning-coat # One project
 *   node scripts/generate-persona-images.js all --enhanced           # All personas, enhanced
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PERSONAS_DIR = path.join(PROJECT_ROOT, 'test-assets', 'personas');

// ---------------------------------------------------------------------------
// Aspect ratio + image type system
//
// Derived from analysis of real portfolio images (Sasha Goodner, UNCSA costume
// technician). Her actual photos showed zero 4:3 images — phone shots were
// overwhelmingly 3:4 portrait, production stills were 3:2 landscape, and
// social/shared images were 4:5 or 1:1.
//
// Image types and their default aspect ratios:
//
//   imageType              Default   When used
//   ─────────────────────  ───────   ─────────────────────────────────────────
//   bts_phone              3:4       Behind-the-scenes phone documentation
//   candid_identity        3:4       Coworker's phone snap of the persona
//   production_stage       3:2       DSLR production stills (theater/opera)
//   production_film        16:9      Cinematic on-set stills (film/TV)
//   detail_closeup         3:4       Tight shots of texture, stitching, detail
//   studio_documentation   3:4       Clean studio photos of garments on forms
//   sketch_scan            3:4       Scanned artwork, sketches, renderings
//
// Each photo doesn't just get the default — the script varies based on the
// prompt content to create realistic variety:
//
//   bts_phone (largest group):
//     - Overhead/table shots ("from above", "laid out") → 4:3 landscape
//     - Full-length person/dress form → 3:4 or 9:16 tall
//     - General mix → ~60% 3:4, 15% 4:3, 10% 9:16, 10% 1:1, 5% 4:5
//
//   production_stage:
//     - Ensemble/wide shots → 3:2 or 16:9 landscape
//     - Single performer → 2:3 portrait
//     - General mix → ~50% 3:2, 25% 2:3, 25% 16:9
//
//   production_film:
//     - Character portraits → 16:9, 2:3, or 3:2
//     - General → ~60% 16:9, 30% 3:2, 10% 2:3
//
//   detail_closeup:
//     - ~40% 1:1, 30% 3:4, 20% 4:5, 10% 4:3
//
// ---------------------------------------------------------------------------

const VALID_ASPECT_RATIOS = [
  '1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9'
];

/**
 * Default aspect ratio for each image type.
 * Based on analysis of real portfolio images (Sasha Goodner reference data):
 *   - Phone BTS shots are overwhelmingly 3:4 portrait (standard iPhone)
 *   - Stage production stills are 3:2 landscape (DSLR) or 2:3 portrait
 *   - Film/TV production stills tend toward 16:9 (cinematic)
 *   - Detail close-ups are 3:4 portrait or 1:1 square
 */
const IMAGE_TYPE_DEFAULTS = {
  bts_phone:              { aspectRatio: '3:4',  label: 'Behind-the-scenes phone' },
  production_stage:       { aspectRatio: '3:2',  label: 'Stage production' },
  production_film:        { aspectRatio: '16:9', label: 'Film/TV production' },
  detail_closeup:         { aspectRatio: '3:4',  label: 'Detail close-up' },
  candid_identity:        { aspectRatio: '3:4',  label: 'Candid identity' },
  studio_documentation:   { aspectRatio: '3:4',  label: 'Studio documentation' },
  sketch_scan:            { aspectRatio: '3:4',  label: 'Sketch/scan' },
};

// Fallback when neither imageType nor aspectRatio is specified
const FALLBACK_ASPECT_RATIO = '3:4';

/**
 * Resolve the aspect ratio for a photo entry.
 * Priority: explicit aspectRatio > imageType default > prompt-based inference > fallback
 */
function resolveAspectRatio(image) {
  // 1. Explicit aspectRatio on the photo entry
  if (image.aspectRatio && VALID_ASPECT_RATIOS.includes(image.aspectRatio)) {
    return image.aspectRatio;
  }

  // 2. Default from imageType
  if (image.imageType && IMAGE_TYPE_DEFAULTS[image.imageType]) {
    return IMAGE_TYPE_DEFAULTS[image.imageType].aspectRatio;
  }

  // 3. Infer from prompt text (backward compatibility with existing personas)
  if (image.prompt) {
    return inferAspectRatioFromPrompt(image.prompt);
  }

  return FALLBACK_ASPECT_RATIO;
}

/**
 * Infer imageType from prompt text for backward compatibility.
 * Existing persona JSONs embed type hints in the prompt itself.
 */
function inferImageType(image) {
  if (image.imageType) return image.imageType;
  if (!image.prompt) return null;

  const p = image.prompt.toLowerCase();

  // Phone / BTS markers
  if (p.includes('iphone') || p.includes('smartphone') || p.includes('phone photo')) {
    if (image.isIdentity) return 'candid_identity';
    return 'bts_phone';
  }

  // Production photography markers
  if (p.includes('production photography') || p.includes('performance shot')) {
    if (p.includes('film') || p.includes('cinema') || p.includes('noir') || p.includes('on set')) {
      return 'production_film';
    }
    return 'production_stage';
  }

  // Studio / documentation
  if (p.includes('professional documentation') || p.includes('studio photography') ||
      p.includes('professional costume photography')) {
    return 'studio_documentation';
  }

  // Detail / close-up
  if (p.includes('close-up') || p.includes('closeup') || p.includes('detail') ||
      p.includes('macro') || p.includes('texture')) {
    return 'detail_closeup';
  }

  // Sketch / scan
  if (p.includes('sketch') || p.includes('rendering') || p.includes('illustration') ||
      p.includes('watercolor')) {
    return 'sketch_scan';
  }

  return null;
}

/**
 * Infer aspect ratio from prompt text when no explicit metadata exists.
 * Maps detected image type to its default ratio.
 */
function inferAspectRatioFromPrompt(prompt) {
  const p = prompt.toLowerCase();

  // Phone / BTS -> portrait 3:4
  if (p.includes('iphone') || p.includes('smartphone') || p.includes('phone photo')) {
    return '3:4';
  }

  // Film production -> cinematic 16:9
  if ((p.includes('film') || p.includes('cinema') || p.includes('noir')) &&
      p.includes('production photography')) {
    return '16:9';
  }

  // Stage production -> landscape 3:2
  if (p.includes('theatrical production photography') || p.includes('stage') ||
      p.includes('performance shot')) {
    return '3:2';
  }

  // Studio documentation -> portrait 3:4
  if (p.includes('professional documentation') || p.includes('professional costume photography')) {
    return '3:4';
  }

  // Detail close-up
  if (p.includes('close-up') || p.includes('detail shot') || p.includes('macro')) {
    return '1:1';
  }

  return FALLBACK_ASPECT_RATIO;
}

// ---------------------------------------------------------------------------
// Prompt enhancement system
// ---------------------------------------------------------------------------

/**
 * Prompt preambles by image type.
 * These replace the old pattern of starting prompts with "iPhone 14 Pro photo..."
 * which caused Gemini to render phones as props in the scene.
 * 
 * Strategy: describe the camera AESTHETIC (noise, dynamic range, composition
 * imperfections) rather than naming a device. Use first-person perspective
 * framing. Describe scene contents exhaustively so there's no room for
 * Gemini to hallucinate unwanted objects.
 */
const PROMPT_WRAPPERS = {
  bts_phone: {
    preamble: `Casual behind-the-scenes documentation photograph with smartphone camera characteristics. ` +
      `First-person perspective showing only the subject — captured from the photographer's point of view ` +
      `with no devices, hands, screens, or camera equipment visible anywhere in the frame. ` +
      `Natural ambient lighting, subtle digital noise in shadow areas, phone-camera dynamic range ` +
      `with slightly overexposed highlights. Candid composition that is slightly imperfect and off-center, ` +
      `as if quickly snapped during work. 26mm wide-angle equivalent focal length.\n\nSUBJECT: `,
    suffix: `\n\nPHOTO STYLE: Authentic smartphone documentation photo. The entire frame contains only ` +
      `the described subject and its immediate surroundings. No phones, cameras, hands, fingers, ` +
      `UI overlays, timestamps, or watermarks exist in this image.`
  },

  candid_identity: {
    preamble: `Candid behind-the-scenes photograph with smartphone camera look. ` +
      `Shot by a colleague from across the room — natural, unposed moment. ` +
      `Ambient mixed lighting with slight color cast, phone-camera dynamic range, ` +
      `subtle digital noise. Casual framing, not perfectly composed. ` +
      `26mm wide-angle equivalent.\n\nSCENE: `,
    suffix: `\n\nPHOTO STYLE: Authentic candid snapshot taken by a coworker's phone. ` +
      `No phones, cameras, or recording devices visible in the frame. ` +
      `No UI overlays, no timestamps.`
  },

  production_stage: {
    preamble: `Professional theatrical production photography. ` +
      `Captured with a DSLR from the audience or wings during performance. ` +
      `Dramatic stage lighting, high-quality production still.\n\nSCENE: `,
    suffix: ''
  },

  production_film: {
    preamble: `Professional film unit photography on set. ` +
      `Cinematic lighting, shallow depth of field, widescreen composition. ` +
      `High-quality on-set still photography.\n\nSCENE: `,
    suffix: ''
  },

  detail_closeup: {
    preamble: `Tightly cropped documentation close-up photograph. ` +
      `First-person perspective showing only the subject detail — ` +
      `the entire frame is filled with the described subject. ` +
      `Clean, well-lit detail documentation.\n\nSUBJECT: `,
    suffix: `\n\nPHOTO STYLE: Clean detail documentation. The frame contains only the described ` +
      `subject. No hands, fingers, phones, or tools visible unless specifically described.`
  },

  studio_documentation: {
    preamble: `Professional studio documentation photograph. ` +
      `Clean backdrop, even lighting, accurate color representation. ` +
      `Garment or object fills the frame with professional presentation.\n\nSUBJECT: `,
    suffix: ''
  },

  sketch_scan: {
    preamble: `High-resolution scan or photograph of artwork. ` +
      `Clean, flat, evenly lit. The artwork fills the frame edge to edge.\n\nARTWORK: `,
    suffix: `\n\nPHOTO STYLE: Clean reproduction. Only the artwork is visible in the frame. ` +
      `No hands, fingers, phones, or surfaces visible.`
  }
};

/**
 * Determine whether a prompt already contains its own framing language
 * (i.e. it starts with "Professional..." or "iPhone..." etc.)
 * In that case we apply the legacy anti-artifact suffix but skip the preamble
 * to avoid doubling up.
 */
function hasExistingFraming(prompt) {
  const p = prompt.trimStart().toLowerCase();
  return (
    p.startsWith('professional ') ||
    p.startsWith('iphone ') ||
    p.startsWith('smartphone ') ||
    p.startsWith('candid iphone') ||
    p.startsWith('candid smartphone') ||
    p.startsWith('high-resolution scan') ||
    p.startsWith('casual behind-the-scenes') ||
    p.startsWith('casual documentation') ||
    p.startsWith('tightly cropped')
  );
}

/**
 * Legacy anti-artifact suffix applied to prompts that already have their own
 * framing (backward compatibility). Standardized version combining the best
 * of both Sarah and Julian patterns.
 */
const LEGACY_PHONE_SUFFIX =
  `\n\nCRITICAL FRAMING: The entire image is captured from first-person perspective. ` +
  `No phones, cameras, hands, fingers, recording devices, UI elements, timestamps, ` +
  `date stamps, or watermarks exist anywhere in this image. Only the described subject is visible.`;

/**
 * Build the final prompt for an image, applying type-appropriate wrapping.
 * 
 * For NEW prompts (without existing framing): wraps with preamble + suffix.
 * For EXISTING prompts (with "iPhone..." etc.): rewrites the phone reference
 * and appends standardized anti-artifact suffix.
 */
function buildWrappedPrompt(rawPrompt, imageType) {
  if (!rawPrompt) return rawPrompt;

  const type = imageType || 'bts_phone';
  const wrapper = PROMPT_WRAPPERS[type];

  // If prompt already has its own framing, use legacy compatibility mode
  if (hasExistingFraming(rawPrompt)) {
    // Rewrite "iPhone 14 Pro photo" / "Smartphone photo" prefixes
    // to avoid Gemini rendering the device as a prop
    let rewritten = rawPrompt
      .replace(/^(?:Candid\s+)?iPhone\s+\d+\s+Pro\s+photo\s+/i, 'Casual smartphone-style documentation photograph ')
      .replace(/^Smartphone\s+photo\s+/i, 'Casual smartphone-style documentation photograph ');

    // Strip old anti-artifact blocks (we'll add a standardized one)
    rewritten = rewritten
      .replace(/\s*No visible phone[^.]*\.\s*/gi, ' ')
      .replace(/\s*HEIC format quality[^.]*\.\s*/gi, ' ')
      .replace(/\s*,?\s*clean (?:professional )?documentation photograph\.?\s*$/i, '')
      .trim();

    // Only add phone suffix for phone-type images
    if (type === 'bts_phone' || type === 'candid_identity' || type === 'detail_closeup' || type === 'sketch_scan') {
      return rewritten + LEGACY_PHONE_SUFFIX;
    }
    return rewritten;
  }

  // New prompt without existing framing — apply full wrapper
  if (wrapper) {
    return wrapper.preamble + rawPrompt + wrapper.suffix;
  }

  return rawPrompt;
}

// ---------------------------------------------------------------------------
// API key loading
// ---------------------------------------------------------------------------

async function loadApiKey() {
  const envPath = path.join(PROJECT_ROOT, '.env');
  try {
    const envContent = await fs.readFile(envPath, 'utf-8');
    const match = envContent.match(/GEMINI_API_KEY[=:]?\s*["']?([^"'\n]+)["']?/);
    if (match) {
      return match[1].trim().replace(/^["']|["']$/g, '');
    }
  } catch {
    throw new Error('Could not read .env - make sure GEMINI_API_KEY is set');
  }
  throw new Error('GEMINI_API_KEY not found in .env');
}

// ---------------------------------------------------------------------------
// Image generation
// ---------------------------------------------------------------------------

/**
 * Generate a single image via Gemini API.
 * 
 * @param {object} ai - GoogleGenAI instance
 * @param {string} prompt - The scene/subject prompt
 * @param {object} options
 * @param {boolean} options.isAnchorGeneration - Master headshot generation mode
 * @param {string|null} options.referenceImageB64 - Base64 identity reference image
 * @param {string} options.aspectRatio - Gemini aspect ratio string (e.g. "3:4")
 * @param {string|null} options.imageType - Image type for prompt wrapping
 */
async function generateImage(ai, prompt, {
  isAnchorGeneration = false,
  referenceImageB64 = null,
  aspectRatio = FALLBACK_ASPECT_RATIO,
  imageType = null
} = {}) {
  // Validate aspect ratio
  const ratio = VALID_ASPECT_RATIOS.includes(aspectRatio) ? aspectRatio : FALLBACK_ASPECT_RATIO;

  // Apply prompt wrapping based on image type (unless identity/anchor modes override)
  let wrappedPrompt = prompt;
  if (!isAnchorGeneration && !referenceImageB64) {
    wrappedPrompt = buildWrappedPrompt(prompt, imageType);
  }

  // Build final prompt with identity instructions
  let finalPrompt = '';
  
  if (referenceImageB64) {
    // Identity consistency mode — wrap the already-enhanced prompt
    const enhancedScene = buildWrappedPrompt(prompt, imageType);
    finalPrompt = `STRICT IDENTITY CONSISTENCY MODE: 
The person in the attached reference image is the ONLY valid character for this scene.
- MAINTAIN EXACT FACIAL BIOMETRICS: Replicate eye shape, nose bridge, jawline, and brow structure exactly.
- SKIN TONE & ETHNICITY: Match the specific skin tone depth and undertones precisely.
- HAIR & GROOMING: Ensure the hair texture and style matches the master reference.
- SCENE INTEGRATION: Place this specific person into the scene described below.

SCENE DESCRIPTION: ${enhancedScene}`;
  } else if (isAnchorGeneration) {
    finalPrompt = `MASTER IDENTITY GENERATION:
Generate a high-fidelity, high-resolution professional image to serve as a character's master reference.

CHARACTER SPEC: ${prompt}
STYLE: 85mm lens, sharp focus, professional studio lighting, realistic textures, neutral background.`;
  } else {
    finalPrompt = wrappedPrompt;
  }

  // Build contents (correct format per Gemini docs)
  let contents;
  if (referenceImageB64) {
    contents = [
      { text: finalPrompt },
      {
        inlineData: {
          mimeType: 'image/png',
          data: referenceImageB64
        }
      }
    ];
  } else {
    contents = finalPrompt;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: contents,
    config: {
      responseModalities: ['IMAGE'],
      imageConfig: {
        aspectRatio: ratio
      }
    }
  });

  // Extract image from response
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
  }

  throw new Error('No image returned from API');
}

// ---------------------------------------------------------------------------
// Enhanced format persona generation
// ---------------------------------------------------------------------------

async function generateEnhancedPersona(ai, personaId, options = {}) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Generating Images (Enhanced): ${personaId}`);
  console.log(`${'='.repeat(60)}`);

  // Load persona-enhanced.json
  const personaPath = path.join(PERSONAS_DIR, personaId, 'persona-enhanced.json');
  let personaData;
  try {
    const content = await fs.readFile(personaPath, 'utf-8');
    personaData = JSON.parse(content);
  } catch (e) {
    throw new Error(`Could not load ${personaPath}: ${e.message}`);
  }

  console.log(`   Name: ${personaData.persona.name}`);
  console.log(`   Role: ${personaData.persona.role}`);
  
  // Parse filter options
  const { profileOnly, categoryFilter, projectFilter } = options;
  
  if (profileOnly) {
    console.log(`   Filter: Profile images only`);
  } else if (categoryFilter) {
    console.log(`   Filter: Category = ${categoryFilter}`);
  } else if (projectFilter) {
    console.log(`   Filter: Project = ${projectFilter}`);
  }
  
  const baseDir = path.join(PERSONAS_DIR, personaId, 'images');
  let headshotBase64 = null;
  let totalGenerated = 0;

  // 1. Generate profile images (if not filtered out)
  if (!categoryFilter && !projectFilter) {
    console.log(`\nProfile Images (${personaData.profile.images.length}):`);
    console.log('-'.repeat(60));
  
    for (let i = 0; i < personaData.profile.images.length; i++) {
      const image = personaData.profile.images[i];
      const imageType = inferImageType(image);
      const aspectRatio = resolveAspectRatio(image);
      
      console.log(`\n[${i + 1}/${personaData.profile.images.length}] ${image.file}`);
      console.log(`   Type: ${image.type || 'unknown'} | imageType: ${imageType || 'auto'} | ratio: ${aspectRatio}`);

      if (!image.prompt) {
        console.log(`   -- No prompt defined, skipping`);
        continue;
      }

      // Check if image already exists
      const outputPath = path.join(baseDir, image.file);
      try {
        await fs.access(outputPath);
        console.log(`   >> Already exists, skipping`);
        
        // If this is the headshot, load it for identity consistency
        if (image.type === 'headshot_primary' && !headshotBase64) {
          const buffer = await fs.readFile(outputPath);
          headshotBase64 = buffer.toString('base64');
          console.log(`   -> Loaded for identity consistency`);
        }
        continue;
      } catch {
        // File doesn't exist, proceed with generation
      }

      try {
        const isHeadshot = image.type === 'headshot_primary';
        const needsIdentity = image.isIdentity && !isHeadshot;

        let imageBase64;
        
        if (isHeadshot) {
          console.log(`   ** Generating master headshot (anchor)...`);
          imageBase64 = await generateImage(ai, image.prompt, {
            isAnchorGeneration: true,
            aspectRatio: image.aspectRatio || '3:4'
          });
          headshotBase64 = imageBase64;
        } else if (needsIdentity && headshotBase64) {
          console.log(`   -> Using headshot for identity consistency...`);
          imageBase64 = await generateImage(ai, image.prompt, {
            referenceImageB64: headshotBase64,
            aspectRatio,
            imageType
          });
        } else {
          console.log(`   >> Generating scene image...`);
          imageBase64 = await generateImage(ai, image.prompt, {
            aspectRatio,
            imageType
          });
        }

        // Save to organized path
        const finalOutputPath = path.join(baseDir, image.file);
        const outputDir = path.dirname(finalOutputPath);
        await fs.mkdir(outputDir, { recursive: true });
        
        const buffer = Buffer.from(imageBase64, 'base64');
        await fs.writeFile(finalOutputPath, buffer);
        totalGenerated++;

        console.log(`   OK Saved: ${image.file}`);
      } catch (error) {
        console.error(`   FAIL: ${error.message}`);
      }
    }
  }
  
  // If profile-only, we're done
  if (profileOnly) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Completed: ${personaData.persona.name} (Profile only)`);
    console.log(`   Images generated: ${totalGenerated}`);
    console.log(`   Output: ${baseDir}`);
    console.log(`${'='.repeat(60)}`);
    return;
  }
  
  // Load headshot for identity consistency if we're generating projects
  if (!headshotBase64 && (categoryFilter || projectFilter)) {
    // Try to load existing headshot
    const headshotPath = path.join(baseDir, 'profile/headshot-primary.jpg');
    try {
      const headshotBuffer = await fs.readFile(headshotPath);
      headshotBase64 = headshotBuffer.toString('base64');
      console.log(`\n-> Loaded existing headshot for identity consistency`);
    } catch {
      console.log(`\n-- No headshot found - generating without identity reference`);
    }
  }

  // 2. Generate project images (with filtering)
  console.log(`\n\nProject Images:`);
  console.log('='.repeat(60));
  
  for (const category of personaData.categories || []) {
    // Skip if category filter specified and doesn't match
    if (categoryFilter && category.slug !== categoryFilter) {
      continue;
    }
    
    console.log(`\n>> ${category.name}`);
    console.log('-'.repeat(60));
    
    for (const project of category.projects || []) {
      // Skip if project filter specified and doesn't match
      if (projectFilter && project.slug !== projectFilter) {
        continue;
      }
      
      const projectPhotos = project.photos || [];
      console.log(`\n  >> ${project.title} (${projectPhotos.length} images)`);
      
      for (let i = 0; i < projectPhotos.length; i++) {
        const image = projectPhotos[i];
        const imageType = inferImageType(image);
        const aspectRatio = resolveAspectRatio(image);
        
        console.log(`\n  [${i + 1}/${projectPhotos.length}] ${path.basename(image.file)}`);
        console.log(`     imageType: ${imageType || 'auto'} | ratio: ${aspectRatio}`);

        if (!image.prompt) {
          console.log(`     -- No prompt defined, skipping`);
          continue;
        }

        // Check if image already exists
        const outputPath = path.join(baseDir, image.file);
        try {
          await fs.access(outputPath);
          console.log(`     >> Already exists, skipping`);
          continue;
        } catch {
          // File doesn't exist, proceed with generation
        }

        try {
          const needsIdentity = image.isIdentity && headshotBase64;
          
          let imageBase64;
          if (needsIdentity) {
            console.log(`     -> Using headshot for identity...`);
            imageBase64 = await generateImage(ai, image.prompt, {
              referenceImageB64: headshotBase64,
              aspectRatio,
              imageType
            });
          } else {
            console.log(`     >> Generating image...`);
            imageBase64 = await generateImage(ai, image.prompt, {
              aspectRatio,
              imageType
            });
          }

          // Save to organized path
          const finalOutputPath = path.join(baseDir, image.file);
          const outputDir = path.dirname(finalOutputPath);
          await fs.mkdir(outputDir, { recursive: true });
          
          const buffer = Buffer.from(imageBase64, 'base64');
          await fs.writeFile(finalOutputPath, buffer);
          totalGenerated++;

          console.log(`     OK Saved`);
        } catch (error) {
          console.error(`     FAIL: ${error.message}`);
        }
      }
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Completed: ${personaData.persona.name}`);
  console.log(`   Images generated: ${totalGenerated}`);
  console.log(`   Output: ${baseDir}`);
  console.log(`${'='.repeat(60)}`);
}

// ---------------------------------------------------------------------------
// Legacy format persona generation
// ---------------------------------------------------------------------------

async function generateLegacyPersona(ai, personaId) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Generating Images (Legacy): ${personaId}`);
  console.log(`${'='.repeat(60)}`);

  // Load persona.json
  const personaPath = path.join(PERSONAS_DIR, personaId, 'persona.json');
  let personaData;
  try {
    const content = await fs.readFile(personaPath, 'utf-8');
    personaData = JSON.parse(content);
  } catch (e) {
    throw new Error(`Could not load ${personaPath}: ${e.message}`);
  }

  console.log(`   Name: ${personaData.persona.name}`);
  console.log(`   Role: ${personaData.persona.role}`);
  console.log(`   Images: ${personaData.profile.images.length}`);

  const outputDir = path.join(PERSONAS_DIR, personaId, 'images');
  await fs.mkdir(outputDir, { recursive: true });

  let headshotBase64 = null;
  const profileImages = personaData.profile.images;

  for (let i = 0; i < profileImages.length; i++) {
    const image = profileImages[i];
    const imageType = inferImageType(image);
    const aspectRatio = resolveAspectRatio(image);

    console.log(`\n[${i + 1}/${profileImages.length}] ${image.file}`);
    console.log(`   Type: ${image.type || 'unknown'} | imageType: ${imageType || 'auto'} | ratio: ${aspectRatio}`);

    if (!image.prompt) {
      console.log(`   -- No prompt defined, skipping`);
      continue;
    }

    try {
      const isHeadshot = image.type === 'headshot_primary';
      const needsIdentity = image.isIdentity && !isHeadshot;

      let imageBase64;
      
      if (isHeadshot) {
        console.log(`   ** Generating master headshot (anchor)...`);
        imageBase64 = await generateImage(ai, image.prompt, {
          isAnchorGeneration: true,
          aspectRatio: image.aspectRatio || '3:4'
        });
        headshotBase64 = imageBase64;
      } else if (needsIdentity && headshotBase64) {
        console.log(`   -> Using headshot for identity consistency...`);
        imageBase64 = await generateImage(ai, image.prompt, {
          referenceImageB64: headshotBase64,
          aspectRatio,
          imageType
        });
      } else {
        console.log(`   >> Generating scene image...`);
        imageBase64 = await generateImage(ai, image.prompt, {
          aspectRatio,
          imageType
        });
      }

      // Save as JPG
      const finalOutputPath = path.join(outputDir, image.file);
      const buffer = Buffer.from(imageBase64, 'base64');
      await fs.writeFile(finalOutputPath, buffer);

      console.log(`   OK Saved: ${finalOutputPath}`);
    } catch (error) {
      console.error(`   FAIL: ${error.message}`);
    }
  }

  console.log(`\nCompleted: ${personaData.persona.name}`);
  console.log(`   Output: ${outputDir}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\nPersona Image Generator');
  console.log('====================================\n');

  const apiKey = await loadApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const args = process.argv.slice(2);
  const personaArg = args[0] || 'julian-vane';
  const isEnhanced = args.includes('--enhanced');
  
  // Parse filter options
  const profileOnly = args.includes('--profile-only');
  const categoryArg = args.find(arg => arg.startsWith('--category='));
  const projectArg = args.find(arg => arg.startsWith('--project='));
  
  const categoryFilter = categoryArg ? categoryArg.split('=')[1] : null;
  const projectFilter = projectArg ? projectArg.split('=')[1] : null;

  let personaIds = [];
  if (personaArg === 'all') {
    // Discover all persona directories
    const entries = await fs.readdir(PERSONAS_DIR, { withFileTypes: true });
    personaIds = entries
      .filter(e => e.isDirectory())
      .map(e => e.name)
      .filter(name => !name.startsWith('.'));
  } else {
    personaIds = [personaArg];
  }

  console.log(`Mode: ${isEnhanced ? 'Enhanced' : 'Legacy'}`);
  console.log(`Generating for: ${personaIds.join(', ')}\n`);

  const options = {
    profileOnly,
    categoryFilter,
    projectFilter
  };

  for (const personaId of personaIds) {
    try {
      if (isEnhanced) {
        await generateEnhancedPersona(ai, personaId, options);
      } else {
        await generateLegacyPersona(ai, personaId);
      }
    } catch (error) {
      console.error(`\nFailed for ${personaId}: ${error.message}`);
    }
  }

  console.log('\nAll done!\n');
}

main().catch(error => {
  console.error('\nFatal error:', error.message);
  process.exit(1);
});
