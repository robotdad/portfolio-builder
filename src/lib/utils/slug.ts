/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, '') // Trim leading/trailing hyphens
}

/**
 * Ensure a slug is unique within a scope by appending a number if needed
 */
export async function ensureUniqueSlug(
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug
  let counter = 2
  
  // Check if slug already exists
  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }
  
  return slug
}
