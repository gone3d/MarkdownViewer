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
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove all non-alphanumeric except spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim() // Remove leading/trailing spaces
    .replace(/\s/g, '-') // Replace remaining spaces with hyphens
    .toLowerCase(); // Convert to lowercase

  return result;
};

/**
 * Generate unique anchor ID with duplicate handling
 * Used by both MarkdownViewer and TableOfContents
 */
export const generateUniqueSlug = (
  text: string,
  existingIds: Set<string>
): string => {
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

  // Extract real headers, excluding those in code blocks
  const headers = extractMarkdownHeaders(content);

  const headerIds = new Map<string, string>();
  const usedIds = new Set<string>();

  headers.forEach(text => {
    const id = generateUniqueSlug(text, usedIds);
    headerIds.set(text, id);
  });

  return headerIds;
};

/**
 * Extract markdown headers while ignoring those inside code blocks
 */
export const extractMarkdownHeaders = (content: string): string[] => {
  if (!content) return [];

  const lines = content.split('\n');
  const headers: string[] = [];
  let inFencedCodeBlock = false;
  let fencePattern = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Check for fenced code block start/end
    const fenceMatch = trimmedLine.match(/^(`{3,}|~{3,})/);
    if (fenceMatch) {
      if (!inFencedCodeBlock) {
        // Starting a code block
        inFencedCodeBlock = true;
        fencePattern = fenceMatch[1][0]; // Either ` or ~
      } else if (trimmedLine.startsWith(fencePattern.repeat(3))) {
        // Ending a code block (must be same character and at least 3 of them)
        inFencedCodeBlock = false;
        fencePattern = '';
      }
      continue;
    }

    // Skip if we're inside a fenced code block
    if (inFencedCodeBlock) continue;

    // Skip indented code blocks (4+ spaces or 1+ tabs at start)
    if (line.match(/^(\s{4,}|\t+)/)) continue;

    // Check for headers (# Header, ## Header, etc.)
    const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const headerText = headerMatch[2].trim();

      // Additional check: skip if the header text contains only backticks or is inside inline code
      if (
        !headerText.match(/^`+$/) &&
        !isInsideInlineCode(line, headerMatch.index || 0)
      ) {
        headers.push(headerText);
      }
    }
  }

  return headers;
};

/**
 * Check if a position in a line is inside inline code (`...`)
 */
function isInsideInlineCode(line: string, position: number): boolean {
  let inInlineCode = false;
  let i = 0;

  while (i < position && i < line.length) {
    if (line[i] === '`') {
      // Count consecutive backticks
      let backtickCount = 0;
      while (i < line.length && line[i] === '`') {
        backtickCount++;
        i++;
      }

      if (backtickCount === 1) {
        inInlineCode = !inInlineCode;
      }
      // For multiple backticks, we'd need more complex logic
      // but for now, assume single backticks are most common
    } else {
      i++;
    }
  }

  return inInlineCode;
}
