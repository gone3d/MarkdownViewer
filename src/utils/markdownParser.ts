/**
 * Markdown Parser Utility
 * 
 * Lightweight utility for parsing markdown syntax patterns and classifying tokens
 * for CSS-based syntax highlighting in the simple editor.
 */

export interface MarkdownToken {
  type: string;
  start: number;
  end: number;
  content: string;
  raw: string;
}

export type TokenType = 
  | 'header'
  | 'header-marker'
  | 'bold'
  | 'bold-marker' 
  | 'italic'
  | 'italic-marker'
  | 'code'
  | 'code-marker'
  | 'link'
  | 'link-text'
  | 'link-url'
  | 'image'
  | 'image-alt'
  | 'image-url'
  | 'list-marker'
  | 'list-item'
  | 'blockquote'
  | 'blockquote-marker'
  | 'strikethrough'
  | 'strikethrough-marker'
  | 'hr'
  | 'table'
  | 'text';

/**
 * Markdown regex patterns for syntax detection
 */
export const MarkdownPatterns = {
  // Headers (# ## ### etc.)
  header: /^(#{1,6})\s+(.+)$/gm,
  
  // Bold text (**text** or __text__)
  bold: /(\*\*|__)((?:(?!\1).)+?)\1/g,
  
  // Italic text (*text* or _text_)
  italic: /(\*|_)((?:(?!\*\*|__|\1).)+?)\1/g,
  
  // Inline code (`code`)
  inlineCode: /(`+)((?:(?!`).)*?)\1/g,
  
  // Code blocks (```lang or ~~~ )
  codeBlock: /^(```|~~~)([^\n]*)\n([\s\S]*?)\n\1\s*$/gm,
  
  // Links ([text](url) or [text][ref])
  link: /\[([^\]]*?)\]\(([^)]+)\)/g,
  
  // Images (![alt](url))
  image: /!\[([^\]]*?)\]\(([^)]+)\)/g,
  
  // Unordered list items (- or * or +)
  unorderedList: /^(\s*)([*+-])\s+(.+)$/gm,
  
  // Ordered list items (1. 2. etc.)
  orderedList: /^(\s*)(\d+\.)\s+(.+)$/gm,
  
  // Blockquotes (> text)
  blockquote: /^(\s*)(>+)\s*(.*)$/gm,
  
  // Strikethrough (~~text~~)
  strikethrough: /(~~)((?:(?!~~).)+?)\1/g,
  
  // Horizontal rules (--- or *** or ___)
  hr: /^(\s*)([-*_]){3,}\s*$/gm,
  
  // Table rows (| col1 | col2 |)
  table: /^(\s*\|.+\|\s*)$/gm,
  
  // Task list items (- [x] or - [ ])
  taskList: /^(\s*)([*+-])\s+(\[[ x]\])\s+(.+)$/gm,
};

/**
 * Parse markdown content and extract tokens for syntax highlighting
 */
export class MarkdownParser {
  private content: string;
  private tokens: MarkdownToken[] = [];

  constructor(content: string) {
    this.content = content;
  }

  /**
   * Parse the content and return all tokens
   */
  parse(): MarkdownToken[] {
    this.tokens = [];
    
    // Parse different markdown elements in order of precedence
    this.parseHeaders();
    this.parseCodeBlocks();
    this.parseInlineCode();
    this.parseLinks();
    this.parseImages();
    this.parseLists(); // Parse all lists (includes task lists with recursive markdown parsing)
    this.parseBold();
    this.parseItalic();
    this.parseStrikethrough();
    this.parseBlockquotes();
    this.parseHorizontalRules();
    this.parseTables();
    
    // Sort tokens by position
    this.tokens.sort((a, b) => a.start - b.start);
    
    return this.tokens;
  }

  /**
   * Parse headers (# ## ### etc.)
   */
  private parseHeaders(): void {
    const matches = Array.from(this.content.matchAll(MarkdownPatterns.header));
    
    for (const match of matches) {
      if (match.index !== undefined) {
        const fullMatch = match[0];
        const marker = match[1]; // ### part
        const text = match[2]; // header text
        
        // Add marker token
        this.tokens.push({
          type: 'header-marker',
          start: match.index,
          end: match.index + marker.length,
          content: marker,
          raw: marker
        });
        
        // Add header text token
        const textStart = match.index + marker.length + 1; // +1 for space
        this.tokens.push({
          type: 'header',
          start: textStart,
          end: match.index + fullMatch.length,
          content: text,
          raw: text
        });
      }
    }
  }

  /**
   * Parse code blocks (```lang)
   */
  private parseCodeBlocks(): void {
    const matches = Array.from(this.content.matchAll(MarkdownPatterns.codeBlock));
    
    for (const match of matches) {
      if (match.index !== undefined) {
        this.tokens.push({
          type: 'code',
          start: match.index,
          end: match.index + match[0].length,
          content: match[0],
          raw: match[0]
        });
      }
    }
  }

  /**
   * Parse inline code (`code`)
   */
  private parseInlineCode(): void {
    const matches = Array.from(this.content.matchAll(MarkdownPatterns.inlineCode));
    
    for (const match of matches) {
      if (match.index !== undefined) {
        const marker = match[1]; // ` part
        const code = match[2]; // code content
        
        // Add opening marker
        this.tokens.push({
          type: 'code-marker',
          start: match.index,
          end: match.index + marker.length,
          content: marker,
          raw: marker
        });
        
        // Add code content
        this.tokens.push({
          type: 'code',
          start: match.index + marker.length,
          end: match.index + marker.length + code.length,
          content: code,
          raw: code
        });
        
        // Add closing marker
        this.tokens.push({
          type: 'code-marker',
          start: match.index + marker.length + code.length,
          end: match.index + match[0].length,
          content: marker,
          raw: marker
        });
      }
    }
  }

  /**
   * Parse links ([text](url))
   */
  private parseLinks(): void {
    const matches = Array.from(this.content.matchAll(MarkdownPatterns.link));
    
    for (const match of matches) {
      if (match.index !== undefined) {
        const linkText = match[1];
        const linkUrl = match[2];
        
        this.tokens.push({
          type: 'link',
          start: match.index,
          end: match.index + match[0].length,
          content: match[0],
          raw: match[0]
        });
        
        // Add more specific tokens for text and URL parts
        const textStart = match.index + 1; // after [
        this.tokens.push({
          type: 'link-text',
          start: textStart,
          end: textStart + linkText.length,
          content: linkText,
          raw: linkText
        });
        
        const urlStart = match.index + match[0].indexOf('(') + 1;
        this.tokens.push({
          type: 'link-url',
          start: urlStart,
          end: urlStart + linkUrl.length,
          content: linkUrl,
          raw: linkUrl
        });
      }
    }
  }

  /**
   * Parse images (![alt](url))
   */
  private parseImages(): void {
    const matches = Array.from(this.content.matchAll(MarkdownPatterns.image));
    
    for (const match of matches) {
      if (match.index !== undefined) {
        const altText = match[1];
        const imageUrl = match[2];
        
        this.tokens.push({
          type: 'image',
          start: match.index,
          end: match.index + match[0].length,
          content: match[0],
          raw: match[0]
        });
        
        // Add more specific tokens for alt and URL parts
        const altStart = match.index + 2; // after ![
        this.tokens.push({
          type: 'image-alt',
          start: altStart,
          end: altStart + altText.length,
          content: altText,
          raw: altText
        });
        
        const urlStart = match.index + match[0].indexOf('(') + 1;
        this.tokens.push({
          type: 'image-url',
          start: urlStart,
          end: urlStart + imageUrl.length,
          content: imageUrl,
          raw: imageUrl
        });
      }
    }
  }

  /**
   * Parse bold text (**text**)
   */
  private parseBold(): void {
    const matches = Array.from(this.content.matchAll(MarkdownPatterns.bold));
    
    for (const match of matches) {
      if (match.index !== undefined && !this.isInsideToken(match.index, match.index + match[0].length)) {
        const marker = match[1]; // ** or __
        const text = match[2]; // bold text
        
        // Add opening marker
        this.tokens.push({
          type: 'bold-marker',
          start: match.index,
          end: match.index + marker.length,
          content: marker,
          raw: marker
        });
        
        // Add bold text
        this.tokens.push({
          type: 'bold',
          start: match.index + marker.length,
          end: match.index + marker.length + text.length,
          content: text,
          raw: text
        });
        
        // Add closing marker
        this.tokens.push({
          type: 'bold-marker',
          start: match.index + marker.length + text.length,
          end: match.index + match[0].length,
          content: marker,
          raw: marker
        });
      }
    }
  }

  /**
   * Parse italic text (*text*)
   */
  private parseItalic(): void {
    const matches = Array.from(this.content.matchAll(MarkdownPatterns.italic));
    
    for (const match of matches) {
      if (match.index !== undefined && !this.isInsideToken(match.index, match.index + match[0].length)) {
        const marker = match[1]; // * or _
        const text = match[2]; // italic text
        
        // Add opening marker
        this.tokens.push({
          type: 'italic-marker',
          start: match.index,
          end: match.index + marker.length,
          content: marker,
          raw: marker
        });
        
        // Add italic text
        this.tokens.push({
          type: 'italic',
          start: match.index + marker.length,
          end: match.index + marker.length + text.length,
          content: text,
          raw: text
        });
        
        // Add closing marker
        this.tokens.push({
          type: 'italic-marker',
          start: match.index + marker.length + text.length,
          end: match.index + match[0].length,
          content: marker,
          raw: marker
        });
      }
    }
  }

  /**
   * Parse strikethrough text (~~text~~)
   */
  private parseStrikethrough(): void {
    const matches = Array.from(this.content.matchAll(MarkdownPatterns.strikethrough));
    
    for (const match of matches) {
      if (match.index !== undefined) {
        const marker = match[1]; // ~~
        const text = match[2]; // strikethrough text
        
        // Add opening marker
        this.tokens.push({
          type: 'strikethrough-marker',
          start: match.index,
          end: match.index + marker.length,
          content: marker,
          raw: marker
        });
        
        // Add strikethrough text
        this.tokens.push({
          type: 'strikethrough',
          start: match.index + marker.length,
          end: match.index + marker.length + text.length,
          content: text,
          raw: text
        });
        
        // Add closing marker
        this.tokens.push({
          type: 'strikethrough-marker',
          start: match.index + marker.length + text.length,
          end: match.index + match[0].length,
          content: marker,
          raw: marker
        });
      }
    }
  }

  /**
   * Parse blockquotes (> text)
   */
  private parseBlockquotes(): void {
    const matches = Array.from(this.content.matchAll(MarkdownPatterns.blockquote));
    
    for (const match of matches) {
      if (match.index !== undefined) {
        const indent = match[1]; // leading whitespace
        const marker = match[2]; // > or >> etc.
        const text = match[3]; // quote text
        
        // Add marker token
        const markerStart = match.index + indent.length;
        this.tokens.push({
          type: 'blockquote-marker',
          start: markerStart,
          end: markerStart + marker.length,
          content: marker,
          raw: marker
        });
        
        // Add quote text if present
        if (text.trim()) {
          const textStart = markerStart + marker.length + 1; // +1 for space
          this.tokens.push({
            type: 'blockquote',
            start: textStart,
            end: match.index + match[0].length,
            content: text,
            raw: text
          });
        }
      }
    }
  }

  /**
   * Parse all list items (unordered, ordered, and task lists)
   */
  private parseLists(): void {
    // Parse unordered lists (- item, * item, + item)
    this.parseListType(MarkdownPatterns.unorderedList, 'unordered');
    
    // Parse ordered lists (1. item, 2. item, etc.)
    this.parseListType(MarkdownPatterns.orderedList, 'ordered');
    
    // Parse task lists (- [x] item, - [ ] item)
    this.parseListType(MarkdownPatterns.taskList, 'task');
  }

  /**
   * Parse a specific type of list and process markdown within each item
   */
  private parseListType(pattern: RegExp, listType: 'unordered' | 'ordered' | 'task'): void {
    const matches = Array.from(this.content.matchAll(pattern));
    
    for (const match of matches) {
      if (match.index !== undefined) {
        if (listType === 'task') {
          // Task list: - [x] text or - [ ] text
          const indent = match[1];      // leading whitespace
          const listMarker = match[2];  // -, *, or +
          const checkbox = match[3];    // [x] or [ ]
          const text = match[4];        // list item text
          
          this.parseTaskListItem(match.index, indent, listMarker, checkbox, text);
        } else {
          // Regular list: - text or 1. text
          const indent = match[1];      // leading whitespace  
          const marker = match[2];      // -, *, +, 1., 2., etc.
          const text = match[3];        // list item text
          
          this.parseRegularListItem(match.index, indent, marker, text);
        }
      }
    }
  }

  /**
   * Parse a regular list item and its markdown content
   */
  private parseRegularListItem(matchIndex: number, indent: string, marker: string, text: string): void {
    // Add list marker token
    const markerStart = matchIndex + indent.length;
    this.tokens.push({
      type: 'list-marker',
      start: markerStart,
      end: markerStart + marker.length,
      content: marker,
      raw: marker
    });
    
    // Parse markdown within the list item text
    const textStart = markerStart + marker.length + 1; // +1 for space
    this.parseMarkdownInText(text, textStart);
  }

  /**
   * Parse a task list item and its markdown content  
   */
  private parseTaskListItem(matchIndex: number, indent: string, listMarker: string, checkbox: string, text: string): void {
    // Add list marker token (- or * or +)
    const listMarkerStart = matchIndex + indent.length;
    this.tokens.push({
      type: 'list-marker',
      start: listMarkerStart,
      end: listMarkerStart + listMarker.length,
      content: listMarker,
      raw: listMarker
    });
    
    // Add checkbox token ([x] or [ ])
    const checkboxStart = listMarkerStart + listMarker.length + 1; // +1 for space
    this.tokens.push({
      type: 'list-marker',
      start: checkboxStart,
      end: checkboxStart + checkbox.length,
      content: checkbox,
      raw: checkbox
    });
    
    // Parse markdown within the task list item text
    const textStart = checkboxStart + checkbox.length + 1; // +1 for space
    this.parseMarkdownInText(text, textStart);
  }


  /**
   * Parse horizontal rules (--- *** ___)
   */
  private parseHorizontalRules(): void {
    const matches = Array.from(this.content.matchAll(MarkdownPatterns.hr));
    
    for (const match of matches) {
      if (match.index !== undefined) {
        this.tokens.push({
          type: 'hr',
          start: match.index,
          end: match.index + match[0].length,
          content: match[0],
          raw: match[0]
        });
      }
    }
  }

  /**
   * Parse tables (| col1 | col2 |)
   */
  private parseTables(): void {
    const matches = Array.from(this.content.matchAll(MarkdownPatterns.table));
    
    for (const match of matches) {
      if (match.index !== undefined) {
        this.tokens.push({
          type: 'table',
          start: match.index,
          end: match.index + match[0].length,
          content: match[0],
          raw: match[0]
        });
      }
    }
  }

  /**
   * Parse only inline markdown elements (for use within list items, etc.)
   */
  public parseInlineElements(): MarkdownToken[] {
    this.tokens = [];
    
    // Parse inline elements only (not block elements like lists, headers)
    this.parseBold();
    this.parseItalic();
    this.parseInlineCode();
    this.parseLinks();
    this.parseImages();
    this.parseStrikethrough();
    
    return this.tokens;
  }

  /**
   * Parse markdown syntax within a specific text segment
   */
  private parseMarkdownInText(text: string, startOffset: number): void {
    // Create a mini-parser for this text segment
    const tempParser = new MarkdownParser(text);
    const inlineTokens = tempParser.parseInlineElements();
    
    // Offset all tokens to match the original content position
    const offsetTokens = inlineTokens.map(token => ({
      ...token,
      start: token.start + startOffset,
      end: token.end + startOffset
    }));
    
    // Add tokens to main parser
    this.tokens.push(...offsetTokens);
  }

  /**
   * Check if a range is already inside another token
   */
  private isInsideToken(start: number, end: number): boolean {
    return this.tokens.some(token => 
      (start >= token.start && start < token.end) ||
      (end > token.start && end <= token.end) ||
      (start <= token.start && end >= token.end)
    );
  }

  /**
   * Get tokens that intersect with a given range
   */
  getTokensInRange(start: number, end: number): MarkdownToken[] {
    return this.tokens.filter(token => 
      !(token.end <= start || token.start >= end)
    );
  }

  /**
   * Get all tokens
   */
  getAllTokens(): MarkdownToken[] {
    return this.tokens;
  }

  /**
   * Get tokens by type
   */
  getTokensByType(type: TokenType): MarkdownToken[] {
    return this.tokens.filter(token => token.type === type);
  }
}

/**
 * Quick utility function to parse markdown content
 */
export function parseMarkdown(content: string): MarkdownToken[] {
  const parser = new MarkdownParser(content);
  return parser.parse();
}

/**
 * Validate markdown structure and return issues
 */
export function validateMarkdown(content: string): string[] {
  const issues: string[] = [];
  const parser = new MarkdownParser(content);
  const tokens = parser.parse();
  
  // Check for unmatched markers
  const boldMarkers = tokens.filter(t => t.type === 'bold-marker');
  const italicMarkers = tokens.filter(t => t.type === 'italic-marker');
  const codeMarkers = tokens.filter(t => t.type === 'code-marker');
  
  if (boldMarkers.length % 2 !== 0) {
    issues.push('Unmatched bold markers (**) detected');
  }
  
  if (italicMarkers.length % 2 !== 0) {
    issues.push('Unmatched italic markers (*) detected');
  }
  
  if (codeMarkers.length % 2 !== 0) {
    issues.push('Unmatched code markers (`) detected');
  }
  
  // Check for empty links
  const links = tokens.filter(t => t.type === 'link-text');
  for (const link of links) {
    if (!link.content.trim()) {
      issues.push('Empty link text detected');
    }
  }
  
  return issues;
}