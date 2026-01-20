// Utility functions for search functionality

/**
 * Highlight search terms in text with HTML markup
 */
export function highlightSearchTerm(text: string, query: string): string {
  if (!text || !query) return text;
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  if (!lowerText.includes(lowerQuery)) return text;
  
  // Build highlighted text
  let result = '';
  let lastIndex = 0;
  let index = lowerText.indexOf(lowerQuery);
  
  while (index !== -1) {
    // Add text before match
    result += text.substring(lastIndex, index);
    
    // Add highlighted match
    result += `<mark class="search-highlight">${text.substring(index, index + query.length)}</mark>`;
    
    lastIndex = index + query.length;
    index = lowerText.indexOf(lowerQuery, lastIndex);
  }
  
  // Add remaining text
  result += text.substring(lastIndex);
  
  return result;
}

/**
 * Truncate text to maxLength, trying to preserve whole words
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.7) {
    // Found a good break point
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}
