#!/usr/bin/env node

/**
 * Generate images for personas using Gemini API
 * 
 * Reads persona.json for each persona, generates profile and project images
 * via Gemini image generation, organized into images/profile/ and images/categories/.
 * 
 * Each photo entry in persona.json should have an `imageType` field that determines
 * the Gemini aspect ratio and prompt wrapping style. See IMAGE_TYPE_DEFAULTS below.
 * 
 * Usage:
 *   node scripts/generate-persona-images.js sarah-chen                              # One persona
 *   node scripts/generate-persona-images.js all                                     # All personas
 *   node scripts/generate-persona-images.js sarah-chen --profile-only               # Profile images only
 *   node scripts/generate-persona-images.js sarah-chen --category=theater-production # One category
 *   node scripts/generate-persona-images.js sarah-chen --project=the-obsidian-crown  # One project
 *   node scripts/generate-persona-images.js sarah-chen --pro                        # Use gemini-3-pro-image-preview
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
// The imageType field on each photo in persona.json is the single source of
// truth for aspect ratio. The type name indicates orientation and camera type.
//
//   Phone shots (smartphone aesthetic, casual):
//     bts_phone              3:4    Portrait phone — standard BTS documentation
//     bts_phone_landscape    4:3    Landscape phone — overhead tables, wide workspace
//
//   Production stills (DSLR / professional):
//     production_wide        16:9   Wide — full stage, cinematic establishing shots
//     production_landscape   3:2    Landscape DSLR — standard pro production still
//     production_portrait    2:3    Portrait DSLR — single performer, character shot
//
//   Studio documentation (controlled lighting, clean):
//     studio_portrait        3:4    Portrait — garment on form, standing display
//     studio_landscape       4:3    Landscape — flat lay, table arrangement
//
//   Detail (tight crop):
//     detail_square          1:1    Square — texture, stitching, embroidery detail
//     detail_portrait        4:5    Portrait — Instagram-style detail crop
//
//   Other:
//     candid_identity        3:4    Coworker's phone snap of the persona at work
//     sketch                 3:4    Phone photo of a sketch or rendering
//     sketch_landscape       4:3    Phone photo of a landscape sketch or spread
//
// To change the ratio for a type, edit IMAGE_TYPE_DEFAULTS below.
// To give a single photo a different ratio than its type, add an explicit
// aspectRatio field to that photo entry in the persona JSON (override).
//
// ---------------------------------------------------------------------------

/**
 * Aspect ratio for each image type — the single source of truth.
 * Edit this table to change ratios globally for a type.
 */
const IMAGE_TYPE_DEFAULTS = {
  // Phone shots
  bts_phone:              { aspectRatio: '3:4',  label: 'BTS phone portrait' },
  bts_phone_landscape:    { aspectRatio: '4:3',  label: 'BTS phone landscape' },

  // Production stills (DSLR)
  production_wide:        { aspectRatio: '16:9', label: 'Production wide' },
  production_landscape:   { aspectRatio: '3:2',  label: 'Production landscape' },
  production_portrait:    { aspectRatio: '2:3',  label: 'Production portrait' },

  // Studio documentation
  studio_portrait:        { aspectRatio: '3:4',  label: 'Studio portrait' },
  studio_landscape:       { aspectRatio: '4:3',  label: 'Studio landscape' },

  // Detail
  detail_square:          { aspectRatio: '1:1',  label: 'Detail square' },
  detail_portrait:        { aspectRatio: '4:5',  label: 'Detail portrait' },

  // Other
  candid_identity:        { aspectRatio: '3:4',  label: 'Candid identity' },
  sketch:                 { aspectRatio: '3:4',  label: 'Sketch portrait' },
  sketch_landscape:       { aspectRatio: '4:3',  label: 'Sketch landscape' },
};

const FALLBACK_ASPECT_RATIO = '3:4';

// ---------------------------------------------------------------------------
// Model selection
// ---------------------------------------------------------------------------

const MODELS = {
  default: 'gemini-3.1-flash-image-preview',
  pro:     'gemini-3-pro-image-preview',
};

const VALID_ASPECT_RATIOS = [
  '1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9'
];

/**
 * Resolve the aspect ratio for a photo entry.
 * Priority: explicit aspectRatio override on photo > imageType lookup > fallback
 */
function resolveAspectRatio(image, imageType) {
  // 1. Explicit per-photo override (rare, for one-offs)
  if (image.aspectRatio && VALID_ASPECT_RATIOS.includes(image.aspectRatio)) {
    return image.aspectRatio;
  }

  // 2. Look up from imageType (normal path)
  if (imageType && IMAGE_TYPE_DEFAULTS[imageType]) {
    return IMAGE_TYPE_DEFAULTS[imageType].aspectRatio;
  }

  return FALLBACK_ASPECT_RATIO;
}

/**
 * Infer imageType from prompt text for backward compatibility.
 * Persona JSONs should have explicit imageType on every photo, but this
 * handles any that don't.
 */
function inferImageType(image) {
  if (image.imageType) return image.imageType;
  if (!image.prompt) return null;

  const p = image.prompt.toLowerCase();

  // Phone / BTS markers
  if (p.includes('iphone') || p.includes('smartphone') || p.includes('phone photo')) {
    if (image.isIdentity) return 'candid_identity';
    // Landscape hints for phone shots
    if (p.includes('from above') || p.includes('overhead') || p.includes('table') ||
        p.includes('laid out') || p.includes('flat lay') || p.includes('mood board on')) {
      return 'bts_phone_landscape';
    }
    return 'bts_phone';
  }

  // Production photography markers
  if (p.includes('production photography') || p.includes('performance shot')) {
    if (p.includes('wide') || p.includes('ensemble') || p.includes('full cast') ||
        p.includes('full stage')) {
      return 'production_wide';
    }
    if (p.includes('actor in') || p.includes('actress in') || p.includes('performer') ||
        p.includes('solo') || p.includes('portrait')) {
      return 'production_portrait';
    }
    return 'production_landscape';
  }

  // Studio / documentation
  if (p.includes('professional documentation') || p.includes('studio photography') ||
      p.includes('professional costume photography')) {
    if (p.includes('flat lay') || p.includes('laid out') || p.includes('from above') ||
        p.includes('table')) {
      return 'studio_landscape';
    }
    return 'studio_portrait';
  }

  // Detail / close-up
  if (p.includes('close-up') || p.includes('closeup') || p.includes('macro') ||
      p.includes('texture detail')) {
    return 'detail_square';
  }

  // Sketch
  if (p.includes('sketch') || p.includes('rendering') || p.includes('illustration') ||
      p.includes('watercolor')) {
    return 'sketch';
  }

  return null;
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
// Phone-style anti-artifact suffix shared by all phone/casual types
const PHONE_SUFFIX =
  `\n\nPHOTO STYLE: Authentic smartphone documentation photo. The entire frame contains only ` +
  `the described subject and its immediate surroundings. No phones, cameras, hands, fingers, ` +
  `UI overlays, timestamps, or watermarks exist in this image.`;

const PHONE_PREAMBLE =
  `Casual behind-the-scenes documentation photograph with smartphone camera characteristics. ` +
  `First-person perspective showing only the subject — captured from the photographer's point of view ` +
  `with no devices, hands, screens, or camera equipment visible anywhere in the frame. ` +
  `Natural ambient lighting, subtle digital noise in shadow areas, phone-camera dynamic range ` +
  `with slightly overexposed highlights. Candid composition that is slightly imperfect and off-center, ` +
  `as if quickly snapped during work. 26mm wide-angle equivalent focal length.\n\nSUBJECT: `;

const PROMPT_WRAPPERS = {
  // Phone shots — share the same aesthetic, just different orientation
  bts_phone:           { preamble: PHONE_PREAMBLE, suffix: PHONE_SUFFIX },
  bts_phone_landscape: { preamble: PHONE_PREAMBLE, suffix: PHONE_SUFFIX },

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

  // Production stills — DSLR aesthetic, orientation varies
  production_wide: {
    preamble: `Professional production photography, wide composition. ` +
      `Captured with a DSLR, dramatic lighting, high-quality production still.\n\nSCENE: `,
    suffix: ''
  },
  production_landscape: {
    preamble: `Professional production photography. ` +
      `Captured with a DSLR from the audience or wings during performance. ` +
      `Dramatic stage lighting, high-quality production still.\n\nSCENE: `,
    suffix: ''
  },
  production_portrait: {
    preamble: `Professional production photography, vertical portrait composition. ` +
      `Captured with a DSLR, dramatic lighting, shallow depth of field, ` +
      `high-quality character or performer portrait.\n\nSCENE: `,
    suffix: ''
  },

  // Studio documentation
  studio_portrait: {
    preamble: `Professional studio documentation photograph, vertical composition. ` +
      `Clean backdrop, even lighting, accurate color representation. ` +
      `Garment or object fills the frame with professional presentation.\n\nSUBJECT: `,
    suffix: ''
  },
  studio_landscape: {
    preamble: `Professional studio documentation photograph, horizontal composition. ` +
      `Clean backdrop, even lighting, accurate color representation. ` +
      `Objects arranged across the frame.\n\nSUBJECT: `,
    suffix: ''
  },

  // Detail
  detail_square: {
    preamble: `Tightly cropped documentation close-up photograph, square composition. ` +
      `First-person perspective — the entire frame is filled with the described detail. ` +
      `Clean, well-lit detail documentation.\n\nSUBJECT: `,
    suffix: `\n\nPHOTO STYLE: Clean detail documentation. The frame contains only the described ` +
      `subject. No hands, fingers, phones, or tools visible unless specifically described.`
  },
  detail_portrait: {
    preamble: `Tightly cropped documentation close-up photograph, vertical composition. ` +
      `First-person perspective — the entire frame is filled with the described detail. ` +
      `Clean, well-lit detail documentation.\n\nSUBJECT: `,
    suffix: `\n\nPHOTO STYLE: Clean detail documentation. The frame contains only the described ` +
      `subject. No hands, fingers, phones, or tools visible unless specifically described.`
  },

  // Sketches (phone photos of artwork)
  sketch: {
    preamble: `Casual smartphone photograph of artwork or sketch. ` +
      `First-person perspective, natural lighting, the artwork fills the frame. ` +
      `Slight phone-camera characteristics.\n\nARTWORK: `,
    suffix: PHONE_SUFFIX
  },
  sketch_landscape: {
    preamble: `Casual smartphone photograph of artwork or sketch, landscape orientation. ` +
      `First-person perspective, natural lighting, the artwork fills the frame. ` +
      `Slight phone-camera characteristics.\n\nARTWORK: `,
    suffix: PHONE_SUFFIX
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
    if (type.startsWith('bts_phone') || type === 'candid_identity' ||
        type.startsWith('detail_') || type.startsWith('sketch')) {
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
  const keys = ['GEMINI_API_KEY', 'GOOGLE_API_KEY'];

  // 1. Check environment variables
  for (const key of keys) {
    if (process.env[key]) return process.env[key];
  }

  // 2. Check .env file
  const envPath = path.join(PROJECT_ROOT, '.env');
  try {
    const envContent = await fs.readFile(envPath, 'utf-8');
    for (const key of keys) {
      const match = envContent.match(new RegExp(`${key}[=:]?\\s*["']?([^"'\\n]+)["']?`));
      if (match) {
        return match[1].trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch {
    // No .env file, that's fine if env var was set
  }

  throw new Error('Set GEMINI_API_KEY or GOOGLE_API_KEY in environment or .env');
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
 * @param {string} options.model - Gemini model ID to use
 */
async function generateImage(ai, prompt, {
  isAnchorGeneration = false,
  referenceImageB64 = null,
  aspectRatio = FALLBACK_ASPECT_RATIO,
  imageType = null,
  model = MODELS.default
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
    model,
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
// Persona generation
// ---------------------------------------------------------------------------

async function generatePersona(ai, personaId, options = {}) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Generating Images: ${personaId}`);
  console.log(`${'='.repeat(60)}`);

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
  console.log(`   Model: ${options.model || MODELS.default}`);
  
  // Parse filter options
  const { profileOnly, categoryFilter, projectFilter, model } = options;
  
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
      const aspectRatio = resolveAspectRatio(image, imageType);
      
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
            aspectRatio: image.aspectRatio || '3:4',
            model
          });
          headshotBase64 = imageBase64;
        } else if (needsIdentity && headshotBase64) {
          console.log(`   -> Using headshot for identity consistency...`);
          imageBase64 = await generateImage(ai, image.prompt, {
            referenceImageB64: headshotBase64,
            aspectRatio,
            imageType,
            model
          });
        } else {
          console.log(`   >> Generating scene image...`);
          imageBase64 = await generateImage(ai, image.prompt, {
            aspectRatio,
            imageType,
            model
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
        const aspectRatio = resolveAspectRatio(image, imageType);
        
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
              imageType,
              model
            });
          } else {
            console.log(`     >> Generating image...`);
            imageBase64 = await generateImage(ai, image.prompt, {
              aspectRatio,
              imageType,
              model
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
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\nPersona Image Generator');
  console.log('====================================\n');

  const apiKey = await loadApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const args = process.argv.slice(2);
  const personaArg = args[0] || 'julian-vane';
  
  // Parse filter options
  const profileOnly = args.includes('--profile-only');
  const usePro = args.includes('--pro');
  const categoryArg = args.find(arg => arg.startsWith('--category='));
  const projectArg = args.find(arg => arg.startsWith('--project='));
  
  const categoryFilter = categoryArg ? categoryArg.split('=')[1] : null;
  const projectFilter = projectArg ? projectArg.split('=')[1] : null;
  const model = usePro ? MODELS.pro : MODELS.default;

  let personaIds = [];
  if (personaArg === 'all') {
    const entries = await fs.readdir(PERSONAS_DIR, { withFileTypes: true });
    personaIds = entries
      .filter(e => e.isDirectory())
      .map(e => e.name)
      .filter(name => !name.startsWith('.'));
  } else {
    personaIds = [personaArg];
  }

  console.log(`Generating for: ${personaIds.join(', ')}`);
  console.log(`Model: ${model}\n`);

  const options = {
    profileOnly,
    categoryFilter,
    projectFilter,
    model
  };

  for (const personaId of personaIds) {
    try {
      await generatePersona(ai, personaId, options);
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
