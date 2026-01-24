#!/usr/bin/env node

/**
 * Generate images for personas using Gemini API
 * 
 * Supports both legacy and enhanced persona formats:
 * - Legacy: Reads persona.json, outputs to flat images/
 * - Enhanced: Reads persona-enhanced.json, outputs to organized images/profile/ and images/categories/
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

// Load API key from .env
async function loadApiKey() {
  const envPath = path.join(PROJECT_ROOT, '.env');
  try {
    const envContent = await fs.readFile(envPath, 'utf-8');
    const match = envContent.match(/GEMINI_API_KEY[=:]?\s*["']?([^"'\n]+)["']?/);
    if (match) {
      return match[1].trim().replace(/^["']|["']$/g, '');
    }
  } catch (e) {
    throw new Error('Could not read .env - make sure GEMINI_API_KEY is set');
  }
  throw new Error('GEMINI_API_KEY not found in .env');
}

// Generate single image
async function generateImage(ai, prompt, isAnchorGeneration = false, referenceImageB64 = null) {
  // Build final prompt with identity instructions
  let finalPrompt = '';
  
  if (referenceImageB64) {
    finalPrompt = `STRICT IDENTITY CONSISTENCY MODE: 
The person in the attached reference image is the ONLY valid character for this scene.
- MAINTAIN EXACT FACIAL BIOMETRICS: Replicate eye shape, nose bridge, jawline, and brow structure exactly.
- SKIN TONE & ETHNICITY: Match the specific skin tone depth and undertones precisely.
- HAIR & GROOMING: Ensure the hair texture and style matches the master reference.
- SCENE INTEGRATION: Place this specific person into the scene described below.

SCENE DESCRIPTION: ${prompt}`;
  } else if (isAnchorGeneration) {
    finalPrompt = `MASTER IDENTITY GENERATION:
Generate a high-fidelity, high-resolution professional image to serve as a character's master reference.

CHARACTER SPEC: ${prompt}
STYLE: 85mm lens, sharp focus, professional studio lighting, realistic textures, neutral background.`;
  } else {
    finalPrompt = prompt;
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
        aspectRatio: "4:3"
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

// Generate images for enhanced format persona
async function generateEnhancedPersona(ai, personaId, options = {}) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎭 Generating Images (Enhanced): ${personaId}`);
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
    console.log(`\n📸 Profile Images (${personaData.profile.images.length}):`);
    console.log('-'.repeat(60));
  
    for (let i = 0; i < personaData.profile.images.length; i++) {
      const image = personaData.profile.images[i];
      console.log(`\n[${i + 1}/${personaData.profile.images.length}] ${image.file}`);
      console.log(`   Type: ${image.type || 'unknown'}`);

      if (!image.prompt) {
        console.log(`   ⚠️  No prompt defined, skipping`);
        continue;
      }

      // Check if image already exists
      const outputPath = path.join(baseDir, image.file);
      try {
        await fs.access(outputPath);
        console.log(`   ⏭️  Already exists, skipping`);
        
        // If this is the headshot, load it for identity consistency
        if (image.type === 'headshot_primary' && !headshotBase64) {
          const buffer = await fs.readFile(outputPath);
          headshotBase64 = buffer.toString('base64');
          console.log(`   🔗 Loaded for identity consistency`);
        }
        continue;
      } catch (e) {
        // File doesn't exist, proceed with generation
      }

      try {
        const isHeadshot = image.type === 'headshot_primary';
        const needsIdentity = image.isIdentity && !isHeadshot;

        let imageBase64;
        
        if (isHeadshot) {
          console.log(`   🎯 Generating master headshot (anchor)...`);
          imageBase64 = await generateImage(ai, image.prompt, true, null);
          headshotBase64 = imageBase64;
        } else if (needsIdentity && headshotBase64) {
          console.log(`   🔗 Using headshot for identity consistency...`);
          imageBase64 = await generateImage(ai, image.prompt, false, headshotBase64);
        } else {
          console.log(`   📷 Generating scene image...`);
          imageBase64 = await generateImage(ai, image.prompt, false, null);
        }

        // Save to organized path
        const outputPath = path.join(baseDir, image.file);
        const outputDir = path.dirname(outputPath);
        await fs.mkdir(outputDir, { recursive: true });
        
        const buffer = Buffer.from(imageBase64, 'base64');
        await fs.writeFile(outputPath, buffer);
        totalGenerated++;

        console.log(`   ✅ Saved: ${image.file}`);
      } catch (error) {
        console.error(`   ❌ Failed: ${error.message}`);
      }
    }
  }
  
  // If profile-only, we're done
  if (profileOnly) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Completed: ${personaData.persona.name} (Profile only)`);
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
      console.log(`\n🔗 Loaded existing headshot for identity consistency`);
    } catch (e) {
      console.log(`\n⚠️  No headshot found - generating without identity reference`);
    }
  }

  // 2. Generate project images (with filtering)
  console.log(`\n\n🎨 Project Images:`);
  console.log('='.repeat(60));
  
  for (const category of personaData.categories || []) {
    // Skip if category filter specified and doesn't match
    if (categoryFilter && category.slug !== categoryFilter) {
      continue;
    }
    
    console.log(`\n📁 ${category.name}`);
    console.log('-'.repeat(60));
    
    for (const project of category.projects || []) {
      // Skip if project filter specified and doesn't match
      if (projectFilter && project.slug !== projectFilter) {
        continue;
      }
      
      const projectPhotos = project.photos || [];
      console.log(`\n  📂 ${project.title} (${projectPhotos.length} images)`);
      
      for (let i = 0; i < projectPhotos.length; i++) {
        const image = projectPhotos[i];
        console.log(`\n  [${i + 1}/${projectPhotos.length}] ${path.basename(image.file)}`);

        if (!image.prompt) {
          console.log(`     ⚠️  No prompt defined, skipping`);
          continue;
        }

        // Check if image already exists
        const outputPath = path.join(baseDir, image.file);
        try {
          await fs.access(outputPath);
          console.log(`     ⏭️  Already exists, skipping`);
          continue;
        } catch (e) {
          // File doesn't exist, proceed with generation
        }

        try {
          const needsIdentity = image.isIdentity && headshotBase64;
          
          let imageBase64;
          if (needsIdentity) {
            console.log(`     🔗 Using headshot for identity...`);
            imageBase64 = await generateImage(ai, image.prompt, false, headshotBase64);
          } else {
            console.log(`     📷 Generating image...`);
            imageBase64 = await generateImage(ai, image.prompt, false, null);
          }

          // Save to organized path
          const outputPath = path.join(baseDir, image.file);
          const outputDir = path.dirname(outputPath);
          await fs.mkdir(outputDir, { recursive: true });
          
          const buffer = Buffer.from(imageBase64, 'base64');
          await fs.writeFile(outputPath, buffer);
          totalGenerated++;

          console.log(`     ✅ Saved`);
        } catch (error) {
          console.error(`     ❌ Failed: ${error.message}`);
        }
      }
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Completed: ${personaData.persona.name}`);
  console.log(`   Images generated: ${totalGenerated}`);
  console.log(`   Output: ${baseDir}`);
  console.log(`${'='.repeat(60)}`);
}

// Generate images for legacy format persona
async function generateLegacyPersona(ai, personaId) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎭 Generating Images (Legacy): ${personaId}`);
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
    console.log(`\n[${i + 1}/${profileImages.length}] ${image.file}`);
    console.log(`   Type: ${image.type || 'unknown'}`);

    if (!image.prompt) {
      console.log(`   ⚠️  No prompt defined, skipping`);
      continue;
    }

    try {
      const isHeadshot = image.type === 'headshot_primary';
      const needsIdentity = image.isIdentity && !isHeadshot;

      let imageBase64;
      
      if (isHeadshot) {
        console.log(`   🎯 Generating master headshot (anchor)...`);
        imageBase64 = await generateImage(ai, image.prompt, true, null);
        headshotBase64 = imageBase64;
      } else if (needsIdentity && headshotBase64) {
        console.log(`   🔗 Using headshot for identity consistency...`);
        imageBase64 = await generateImage(ai, image.prompt, false, headshotBase64);
      } else {
        console.log(`   📷 Generating scene image...`);
        imageBase64 = await generateImage(ai, image.prompt, false, null);
      }

      // Save as JPG
      const outputPath = path.join(outputDir, image.file);
      const buffer = Buffer.from(imageBase64, 'base64');
      await fs.writeFile(outputPath, buffer);

      console.log(`   ✅ Saved: ${outputPath}`);
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
    }
  }

  console.log(`\n✅ Completed: ${personaData.persona.name}`);
  console.log(`   Output: ${outputDir}`);
}

// Main
async function main() {
  console.log('\n🚀 Persona Image Generator');
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
      console.error(`\n❌ Failed for ${personaId}: ${error.message}`);
    }
  }

  console.log('\n✨ All done!\n');
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
