import { precomputeHeaderIds } from './slugify';

export interface TOCItem {
  id: string;
  text: string;
  level: number;
  children: TOCItem[];
}

/**
 * Extract table of contents from markdown content using pre-computed header IDs
 */
export const extractTableOfContents = (content: string, headerIds?: Map<string, string>): TOCItem[] => {
  if (!content) return [];

  // Pre-compute header IDs if not provided
  const idMap = headerIds || precomputeHeaderIds(content);

  // Match markdown headers (# Header, ## Header, etc.)
  const headerRegex = /^(#{1,6})\s+(.+)$/gm;
  const matches = Array.from(content.matchAll(headerRegex));

  if (matches.length === 0) return [];
  
  const flatItems: Array<{ id: string; text: string; level: number }> = matches.map(match => {
    const level = match[1].length; // Number of # characters
    const text = match[2].trim();
    const id = idMap.get(text) || text.toLowerCase().replace(/\s+/g, '-');
    
    return { id, text, level };
  });

  // Build nested structure
  return buildNestedTOC(flatItems);
};

/**
 * Build nested TOC structure from flat header list
 */
function buildNestedTOC(flatItems: Array<{ id: string; text: string; level: number }>): TOCItem[] {
  const result: TOCItem[] = [];
  const stack: TOCItem[] = [];

  for (const item of flatItems) {
    const tocItem: TOCItem = {
      id: item.id,
      text: item.text,
      level: item.level,
      children: []
    };

    // Find the appropriate parent level
    while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      // This is a top-level item
      result.push(tocItem);
    } else {
      // This is a child of the last item in the stack
      stack[stack.length - 1].children.push(tocItem);
    }

    stack.push(tocItem);
  }

  return result;
}

/**
 * Flatten nested TOC for easier rendering
 */
export const flattenTOC = (items: TOCItem[]): Array<TOCItem & { depth: number }> => {
  const result: Array<TOCItem & { depth: number }> = [];

  function traverse(items: TOCItem[], depth = 0) {
    for (const item of items) {
      result.push({ ...item, depth });
      traverse(item.children, depth + 1);
    }
  }

  traverse(items);
  return result;
};