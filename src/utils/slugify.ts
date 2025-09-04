/**
 * Shared slugify function to ensure consistent header ID generation
 * across MarkdownViewer (rehypeSlug) and TableOfContents
 * 
 * Algorithm:
 * 1. Remove all non-alphanumeric characters (except spaces)
 * 2. Replace multiple spaces with single space  
 * 3. Replace all spaces with hyphens
 * 4. Convert to lowercase
 */
export const slugify = (text: string): string => {
  const result = text
    .replace(/[^a-zA-Z0-9\s]/g, '')  // Remove all non-alphanumeric except spaces
    .replace(/\s+/g, ' ')            // Replace multiple spaces with single space
    .trim()                          // Remove leading/trailing spaces
    .replace(/\s/g, '-')             // Replace remaining spaces with hyphens
    .toLowerCase();                  // Convert to lowercase
  
  return result;
};

/**
 * Generate unique anchor ID with duplicate handling
 * Used by both MarkdownViewer and TableOfContents
 */
export const generateUniqueSlug = (text: string, existingIds: Set<string>): string => {
  const baseSlug = slugify(text) || 'heading';
  
  // If unique, return as-is
  if (!existingIds.has(baseSlug)) {
    existingIds.add(baseSlug);
    return baseSlug;
  }
  
  // Handle duplicates with numbered suffix
  let counter = 2;
  let uniqueSlug = `${baseSlug}-${counter}`;
  
  while (existingIds.has(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
  
  existingIds.add(uniqueSlug);
  return uniqueSlug;
};

/**
 * Pre-compute all header IDs from markdown content
 * Returns a Map of header text -> generated ID
 */
export const precomputeHeaderIds = (content: string): Map<string, string> => {
  if (!content) return new Map();

  // Match markdown headers (# Header, ## Header, etc.)
  const headerRegex = /^#{1,6}\s+(.+)$/gm;
  const matches = Array.from(content.matchAll(headerRegex));
  
  const headerIds = new Map<string, string>();
  const usedIds = new Set<string>();
  
  matches.forEach(match => {
    const text = match[1].trim();
    const id = generateUniqueSlug(text, usedIds);
    headerIds.set(text, id);
  });
  
  return headerIds;
};