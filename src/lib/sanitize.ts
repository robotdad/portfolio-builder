import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML content for safe rendering
 * Only allows basic formatting tags used by the rich text editor
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'strong', 'em', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  })
}

/**
 * Strip all HTML tags from content, returning plain text
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}
