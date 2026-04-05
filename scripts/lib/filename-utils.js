/**
 * Filename utilities for real-photo imports.
 *
 * When importing photos from a real client (not AI-generated), camera filenames
 * like "IMG_3481.jpg" or "250325_193119.jpg" need to be converted to readable
 * titles. This module provides the cleaning logic extracted from the original
 * a one-time real-photo client import script.
 *
 * For AI-generated personas this is unnecessary — their persona.json entries
 * have explicit titles. Use this when building a "generate persona from real
 * photos" workflow.
 */

/**
 * Convert a messy image path into a human-readable title.
 *
 * Detects seven filename patterns that should fall back to the parent directory
 * name instead of using the filename itself:
 *   - Pure numbers ("1.jpg", "250.jpg")
 *   - Camera timestamps ("250325_193119.jpg", "20250905_ios.jpg")
 *   - Camera prefixes ("IMG_3481.jpg", "DSC_0042.jpg")
 *   - Generic stubs ("img.jpg", "photo.jpg", "copy.jpg")
 *   - View angles ("back.jpg", "close up 3.jpg", "ref 2.jpg")
 *   - Concatenated words ("uncsawinteropera.jpg" — 15+ lowercase chars)
 *   - Abbreviation + view ("tmm back.jpg", "laj front 2.jpg")
 *
 * @param {string} imgPath - Relative path like "buchanan-butler/1.jpg"
 * @returns {string} Title-cased human-readable name
 */
export function cleanTitle(imgPath) {
  const parts = imgPath.split('/');
  const filename = parts[parts.length - 1];
  const parentDir = parts.length > 1 ? parts[parts.length - 2] : null;

  const nameOnly = filename.replace(/\.\w+$/, '');
  const normalized = nameOnly.toLowerCase().replace(/[-_]/g, ' ').trim();

  // --- Patterns that should fall back to parent directory name ---

  // Pure numbers: "1", "10", "250"
  const isPureNumeric = /^\d+$/.test(nameOnly);

  // Camera timestamps: "250325_193119", "20250905_230236000_ios"
  const isTimestamp = /^\d{6}/.test(nameOnly);

  // Camera file prefixes: "IMG_3481", "DSC_0042", "MG_1234", "DCIM_001"
  const isCameraFile = /^(img|image|photo|pic|copy|dsc|dcim|mg)[-_ ]?\d+/i.test(nameOnly);

  // Generic stub names (exact match): "img", "image", "photo", "copy"
  const isGenericStub = /^(img|image|photo|pic|copy|dsc\w*|mg\d*)$/i.test(nameOnly);

  // View angles and generic process labels (with optional trailing number)
  const isViewAngle = /^(front|back|side|top|bottom|close[-_ ]?up|detail|ref(erence)?|alt|fitting|mock[-_ ]?up|final|progress|inside|outside|display)(\s*\d*)$/i.test(normalized);

  // Concatenated folder names (single lowercase word, 15+ chars)
  const isConcatenated = /^[a-z]{15,}$/i.test(nameOnly);

  // Short abbreviation + view angle: "tmm back", "laj front 2"
  const isAbbrevViewAngle = /^[a-z]{2,4}\s+(back|front|side|ref|alt|detail|close[-_ ]?up)(\s*\d*)$/i.test(normalized);

  if (isPureNumeric || isTimestamp || isCameraFile || isGenericStub || isViewAngle || isConcatenated || isAbbrevViewAngle) {
    return parentDir ? toTitleCase(parentDir) : '';
  }

  const cleaned = toTitleCase(nameOnly);

  // Titles of 2 characters or fewer after cleanup are not useful
  if (cleaned.replace(/\s/g, '').length <= 2) {
    return parentDir ? toTitleCase(parentDir) : cleaned;
  }

  return cleaned;
}

/**
 * Recursively list all image files under a directory.
 *
 * @param {import('fs')} fs - Node fs module
 * @param {import('path')} pathMod - Node path module
 * @param {string} dir - Absolute path to scan
 * @param {string} [prefix=''] - Path prefix for relative paths
 * @returns {string[]} Sorted array of relative paths
 */
export function listImagesRecursive(fs, pathMod, dir, prefix = '') {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isFile() && /\.(jpe?g|png|gif|webp)$/i.test(e.name)) {
      results.push(rel);
    } else if (e.isDirectory()) {
      results.push(...listImagesRecursive(fs, pathMod, pathMod.join(dir, e.name), rel));
    }
  }
  return results.sort();
}

function toTitleCase(s) {
  return s
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}