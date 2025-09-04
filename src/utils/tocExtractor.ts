import { precomputeHeaderIds, extractMarkdownHeaders } from './slugify';

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

  // Extract headers while avoiding code blocks
  const headerTexts = extractMarkdownHeaders(content);
  
  if (headerTexts.length === 0) return [];
  
  // Build flat items with proper level detection
  const flatItems: Array<{ id: string; text: string; level: number }> = [];
  
  // Re-scan content to get header levels for extracted headers
  const lines = content.split('\n');
  let inFencedCodeBlock = false;
  let fencePattern = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Track fenced code blocks
    const fenceMatch = trimmedLine.match(/^(`{3,}|~{3,})/);
    if (fenceMatch) {
      if (!inFencedCodeBlock) {
        inFencedCodeBlock = true;
        fencePattern = fenceMatch[1][0];
      } else if (trimmedLine.startsWith(fencePattern.repeat(3))) {
        inFencedCodeBlock = false;
        fencePattern = '';
      }
      continue;
    }
    
    if (inFencedCodeBlock) continue;
    if (line.match(/^(\s{4,}|\t+)/)) continue;
    
    const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const text = headerMatch[2].trim();
      
      // Only include if this header text was extracted by extractMarkdownHeaders
      if (headerTexts.includes(text)) {
        const id = idMap.get(text) || text.toLowerCase().replace(/\s+/g, '-');
        flatItems.push({ id, text, level });
      }
    }
  }

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