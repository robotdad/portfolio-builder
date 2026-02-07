#!/usr/bin/env node

/**
 * Migration script: Add imageType and aspectRatio to all persona photo entries.
 * 
 * Analyzes each photo's prompt text to determine the correct imageType,
 * then assigns a realistic aspectRatio based on the type and content.
 * 
 * Usage:
 *   node scripts/migrate-persona-image-types.js                    # Dry run (default)
 *   node scripts/migrate-persona-image-types.js --write            # Write changes
 *   node scripts/migrate-persona-image-types.js --persona=sarah-chen --write  # One persona
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PERSONAS_DIR = path.join(PROJECT_ROOT, 'test-assets', 'personas');

// ---------------------------------------------------------------------------
// Image type inference from prompt text
// ---------------------------------------------------------------------------

function inferImageType(photo) {
  if (photo.imageType) return photo.imageType; // Already set
  if (!photo.prompt) return null;

  const p = photo.prompt.toLowerCase();
  const startsWithIphone = /^(?:candid\s+)?iphone/i.test(photo.prompt);
  const startsWithSmartphone = /^(?:candid\s+)?smartphone/i.test(photo.prompt);
  const isPhoneShot = startsWithIphone || startsWithSmartphone || p.includes('phone photo');

  // Candid identity (person in frame, phone shot)
  if (isPhoneShot && photo.isIdentity) {
    return 'candid_identity';
  }

  // Phone BTS (behind the scenes documentation)
  if (isPhoneShot) {
    return 'bts_phone';
  }

  // Film production photography
  if (p.includes('film production photography') ||
      p.includes('cinematic') ||
      (p.includes('on set') && p.includes('professional')) ||
      (p.includes('noir') && p.includes('professional')) ||
      p.includes('unit photography')) {
    return 'production_film';
  }

  // Stage production photography
  if (p.includes('theatrical production photography') ||
      p.includes('production photography') ||
      p.includes('performance shot') ||
      (p.includes('stage') && p.includes('professional'))) {
    return 'production_stage';
  }

  // Studio documentation
  if (p.includes('professional documentation') ||
      p.includes('professional costume photography') ||
      p.includes('studio photography') ||
      p.includes('mannequin') ||
      p.includes('dress form')) {
    return 'studio_documentation';
  }

  // Detail close-up (non-phone)
  if (p.includes('close-up') || p.includes('closeup') ||
      p.includes('detail shot') || p.includes('macro') ||
      p.includes('texture detail')) {
    return 'detail_closeup';
  }

  // Sketch/scan
  if ((p.includes('sketch') || p.includes('rendering') ||
       p.includes('illustration') || p.includes('watercolor')) &&
      !isPhoneShot) {
    return 'sketch_scan';
  }

  // Default for professional photos without clear category
  if (p.includes('professional')) {
    return 'studio_documentation';
  }

  return 'bts_phone'; // Safe fallback
}

// ---------------------------------------------------------------------------
// Aspect ratio assignment with realistic variety
// ---------------------------------------------------------------------------

/**
 * Weighted random selection for natural variety.
 * Uses a seeded approach based on prompt content for determinism.
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function weightedPick(options, seed) {
  // options: [{value, weight}, ...]
  const totalWeight = options.reduce((sum, o) => sum + o.weight, 0);
  let roll = (seed % 1000) / 1000 * totalWeight;
  for (const opt of options) {
    roll -= opt.weight;
    if (roll <= 0) return opt.value;
  }
  return options[options.length - 1].value;
}

function assignAspectRatio(photo, imageType, index) {
  if (photo.aspectRatio) return photo.aspectRatio; // Already set

  const p = (photo.prompt || '').toLowerCase();
  const seed = simpleHash(photo.file + (photo.prompt || '') + index);

  switch (imageType) {
    case 'bts_phone': {
      // Content-aware overrides first
      if (p.includes('from above') || p.includes('overhead') || p.includes('bird') ||
          p.includes('table') || p.includes('laid out') || p.includes('flat lay') ||
          p.includes('workspace') || p.includes('mood board on') ||
          p.includes('cutting table') || p.includes('work table')) {
        return '4:3'; // Landscape phone - looking down at table
      }
      if (p.includes('full-length') || p.includes('full length') ||
          p.includes('head to toe') || p.includes('dress form') ||
          p.includes('mannequin') || p.includes('hanging')) {
        // Tall subjects - sometimes 9:16
        return weightedPick([
          { value: '3:4', weight: 60 },
          { value: '9:16', weight: 40 }
        ], seed);
      }
      // General BTS phone distribution
      return weightedPick([
        { value: '3:4', weight: 60 },
        { value: '4:3', weight: 15 },
        { value: '9:16', weight: 10 },
        { value: '1:1', weight: 10 },
        { value: '4:5', weight: 5 }
      ], seed);
    }

    case 'candid_identity': {
      if (p.includes('working at') || p.includes('workshop') || p.includes('fitting')) {
        return weightedPick([
          { value: '3:4', weight: 50 },
          { value: '4:3', weight: 30 },
          { value: '9:16', weight: 20 }
        ], seed);
      }
      return weightedPick([
        { value: '3:4', weight: 65 },
        { value: '4:3', weight: 20 },
        { value: '9:16', weight: 15 }
      ], seed);
    }

    case 'production_stage': {
      // Content-aware
      if (p.includes('ensemble') || p.includes('full cast') || p.includes('wide') ||
          p.includes('group') || p.includes('scene')) {
        return weightedPick([
          { value: '3:2', weight: 50 },
          { value: '16:9', weight: 50 }
        ], seed);
      }
      if (p.includes('single') || p.includes('solo') || p.includes('portrait') ||
          p.includes('actor in') || p.includes('actress in') || p.includes('performer')) {
        return weightedPick([
          { value: '2:3', weight: 50 },
          { value: '3:2', weight: 30 },
          { value: '3:4', weight: 20 }
        ], seed);
      }
      return weightedPick([
        { value: '3:2', weight: 50 },
        { value: '2:3', weight: 25 },
        { value: '16:9', weight: 25 }
      ], seed);
    }

    case 'production_film': {
      if (p.includes('portrait') || p.includes('solo') ||
          p.includes('actor in') || p.includes('actress in')) {
        return weightedPick([
          { value: '16:9', weight: 40 },
          { value: '2:3', weight: 35 },
          { value: '3:2', weight: 25 }
        ], seed);
      }
      return weightedPick([
        { value: '16:9', weight: 60 },
        { value: '3:2', weight: 30 },
        { value: '2:3', weight: 10 }
      ], seed);
    }

    case 'detail_closeup': {
      return weightedPick([
        { value: '1:1', weight: 40 },
        { value: '3:4', weight: 30 },
        { value: '4:5', weight: 20 },
        { value: '4:3', weight: 10 }
      ], seed);
    }

    case 'studio_documentation': {
      if (p.includes('dress form') || p.includes('mannequin') ||
          p.includes('full') || p.includes('complete')) {
        return weightedPick([
          { value: '3:4', weight: 50 },
          { value: '2:3', weight: 30 },
          { value: '4:5', weight: 20 }
        ], seed);
      }
      return weightedPick([
        { value: '3:4', weight: 50 },
        { value: '4:5', weight: 25 },
        { value: '4:3', weight: 15 },
        { value: '1:1', weight: 10 }
      ], seed);
    }

    case 'sketch_scan': {
      if (p.includes('landscape') || p.includes('spread') || p.includes('panoramic')) {
        return '4:3';
      }
      return weightedPick([
        { value: '3:4', weight: 60 },
        { value: '4:3', weight: 25 },
        { value: '1:1', weight: 15 }
      ], seed);
    }

    default:
      return '3:4';
  }
}

// ---------------------------------------------------------------------------
// Profile image handling
// ---------------------------------------------------------------------------

function assignProfileImageType(photo) {
  if (photo.imageType) return photo.imageType;
  if (!photo.prompt) return null;

  // Headshot primary uses anchor generation - no imageType needed for wrapping
  // but we still assign for metadata consistency
  if (photo.type === 'headshot_primary') return null;

  if (photo.isIdentity) return 'candid_identity';

  const p = photo.prompt.toLowerCase();
  if (p.includes('selfie') || p.includes('candid')) return 'candid_identity';
  if (p.includes('professional') || p.includes('studio')) return 'studio_documentation';
  if (p.includes('iphone') || p.includes('smartphone')) return 'bts_phone';

  return 'candid_identity'; // Default for profile images with prompts
}

function assignProfileAspectRatio(photo, imageType) {
  if (photo.aspectRatio) return photo.aspectRatio;
  if (photo.type === 'headshot_primary') return '3:4'; // Standard headshot

  const p = (photo.prompt || '').toLowerCase();
  const seed = simpleHash(photo.file + (photo.prompt || ''));

  if (p.includes('selfie')) {
    return weightedPick([
      { value: '3:4', weight: 60 },
      { value: '9:16', weight: 30 },
      { value: '1:1', weight: 10 }
    ], seed);
  }

  if (p.includes('workshop') || p.includes('on set') || p.includes('backstage')) {
    return weightedPick([
      { value: '3:4', weight: 50 },
      { value: '4:3', weight: 30 },
      { value: '9:16', weight: 20 }
    ], seed);
  }

  return '3:4';
}

// ---------------------------------------------------------------------------
// JSON manipulation helpers
// ---------------------------------------------------------------------------

/**
 * Insert imageType and aspectRatio right after the "file" key.
 * We manipulate the object key order by rebuilding the object.
 */
function insertFieldsAfterFile(photo, imageType, aspectRatio) {
  const result = {};
  for (const [key, value] of Object.entries(photo)) {
    result[key] = value;
    if (key === 'file') {
      if (imageType) result.imageType = imageType;
      result.aspectRatio = aspectRatio;
    }
  }
  // Remove any existing imageType/aspectRatio that were in the original position
  // (they're now right after "file")
  return result;
}

// ---------------------------------------------------------------------------
// Main migration
// ---------------------------------------------------------------------------

async function migratePersona(personaId, dryRun) {
  const personaPath = path.join(PERSONAS_DIR, personaId, 'persona.json');
  
  let content;
  try {
    content = await fs.readFile(personaPath, 'utf-8');
  } catch {
    console.log(`  Skipping ${personaId} - no persona.json found`);
    return { skipped: true };
  }

  const data = JSON.parse(content);
  let totalPhotos = 0;
  let modifiedPhotos = 0;
  const typeCounts = {};
  const ratioCounts = {};

  // Process profile images
  if (data.profile?.images) {
    for (let i = 0; i < data.profile.images.length; i++) {
      const photo = data.profile.images[i];
      if (!photo.prompt) continue;
      totalPhotos++;

      const imageType = assignProfileImageType(photo);
      const aspectRatio = assignProfileAspectRatio(photo, imageType);

      if (!photo.imageType || !photo.aspectRatio) {
        data.profile.images[i] = insertFieldsAfterFile(photo, imageType, aspectRatio);
        modifiedPhotos++;
      }

      typeCounts[imageType || 'headshot'] = (typeCounts[imageType || 'headshot'] || 0) + 1;
      ratioCounts[aspectRatio] = (ratioCounts[aspectRatio] || 0) + 1;
    }
  }

  // Process category/project photos
  let photoIndex = 0;
  for (const category of data.categories || []) {
    for (const project of category.projects || []) {
      if (!project.photos) continue;
      for (let i = 0; i < project.photos.length; i++) {
        const photo = project.photos[i];
        if (!photo.prompt) continue;
        totalPhotos++;
        photoIndex++;

        const imageType = inferImageType(photo);
        const aspectRatio = assignAspectRatio(photo, imageType, photoIndex);

        if (!photo.imageType || !photo.aspectRatio) {
          project.photos[i] = insertFieldsAfterFile(photo, imageType, aspectRatio);
          modifiedPhotos++;
        }

        typeCounts[imageType] = (typeCounts[imageType] || 0) + 1;
        ratioCounts[aspectRatio] = (ratioCounts[aspectRatio] || 0) + 1;
      }
    }
  }

  // Report
  console.log(`\n  ${personaId}:`);
  console.log(`    Total photos with prompts: ${totalPhotos}`);
  console.log(`    Modified: ${modifiedPhotos}`);
  console.log(`    Image types: ${JSON.stringify(typeCounts)}`);
  console.log(`    Aspect ratios: ${JSON.stringify(ratioCounts)}`);

  // Write
  if (!dryRun && modifiedPhotos > 0) {
    await fs.writeFile(personaPath, JSON.stringify(data, null, 2) + '\n');
    console.log(`    Written to ${personaPath}`);
  } else if (dryRun) {
    console.log(`    [DRY RUN - no changes written]`);
  }

  return { totalPhotos, modifiedPhotos, typeCounts, ratioCounts };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--write');
  const personaArg = args.find(a => a.startsWith('--persona='));
  const personaFilter = personaArg ? personaArg.split('=')[1] : null;

  console.log('\nPersona Image Type Migration');
  console.log('====================================');
  console.log(`Mode: ${dryRun ? 'DRY RUN (use --write to apply)' : 'WRITING CHANGES'}`);

  let personaIds;
  if (personaFilter) {
    personaIds = [personaFilter];
  } else {
    const entries = await fs.readdir(PERSONAS_DIR, { withFileTypes: true });
    personaIds = entries
      .filter(e => e.isDirectory())
      .map(e => e.name)
      .filter(name => !name.startsWith('.'));
  }

  console.log(`Personas: ${personaIds.join(', ')}`);

  const allRatios = {};
  const allTypes = {};

  for (const id of personaIds) {
    const result = await migratePersona(id, dryRun);
    if (!result.skipped) {
      for (const [k, v] of Object.entries(result.ratioCounts || {})) {
        allRatios[k] = (allRatios[k] || 0) + v;
      }
      for (const [k, v] of Object.entries(result.typeCounts || {})) {
        allTypes[k] = (allTypes[k] || 0) + v;
      }
    }
  }

  console.log('\n====================================');
  console.log('TOTALS:');
  console.log(`  Image types: ${JSON.stringify(allTypes)}`);
  console.log(`  Aspect ratios: ${JSON.stringify(allRatios)}`);
  
  if (dryRun) {
    console.log('\n  Run with --write to apply changes.');
  }
  console.log('');
}

main().catch(error => {
  console.error('\nFatal error:', error.message);
  process.exit(1);
});
