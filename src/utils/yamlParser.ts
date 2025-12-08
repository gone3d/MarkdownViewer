/**
 * YAML Parser Utility
 *
 * Lightweight utility for parsing YAML syntax patterns and classifying tokens
 * for CSS-based syntax highlighting in the editor.
 */

import { YamlToken, YamlTokenType } from '../types/yaml';

/**
 * YAML regex patterns for syntax detection
 */
export const YamlPatterns = {
  // Comments (# text)
  comment: /#.*$/gm,

  // Document separators (--- or ...)
  documentSeparator: /^(---|\.\.\.)\s*$/gm,

  // Keys (word: or "quoted key":)
  key: /^(\s*)([a-zA-Z0-9_-]+|"[^"]+"|'[^']+')(\s*):/gm,

  // List markers (-)
  listMarker: /^(\s*)-(\s+)/gm,

  // Anchors (&anchor)
  anchor: /&[a-zA-Z0-9_-]+/g,

  // Aliases (*alias)
  alias: /\*[a-zA-Z0-9_-]+/g,

  // Quoted strings ("string" or 'string')
  quotedString: /"([^"\\]*(\\.[^"\\]*)*)"|'([^'\\]*(\\.[^'\\]*)*)'/g,

  // Numbers (integers, floats, scientific notation)
  number: /\b-?\d+(\.\d+)?([eE][+-]?\d+)?\b/g,

  // Booleans (true, false, yes, no, on, off)
  boolean: /\b(true|false|yes|no|on|off|True|False|Yes|No|On|Off|TRUE|FALSE|YES|NO|ON|OFF)\b/g,

  // Null values (null, ~, Null, NULL)
  null: /\b(null|~|Null|NULL)\b/g,

  // Multiline indicators (| or >)
  multilineIndicator: /[|>][-+]?\s*$/gm,
};

/**
 * YAML Parser class for tokenizing YAML content
 */
export class YamlParser {
  private content: string;
  private tokens: YamlToken[] = [];

  constructor(content: string) {
    this.content = content;
  }

  /**
   * Parse the content and return all tokens
   */
  parse(): YamlToken[] {
    this.tokens = [];

    // Parse different YAML elements in order of precedence
    this.parseComments();
    this.parseDocumentSeparators();
    this.parseKeys();
    this.parseListMarkers();
    this.parseAnchorsAndAliases();
    this.parseQuotedStrings();
    this.parseMultilineIndicators();
    this.parseBooleans();
    this.parseNumbers();
    this.parseNulls();

    // Sort tokens by position
    this.tokens.sort((a, b) => a.start - b.start);

    return this.tokens;
  }

  /**
   * Parse comments (# text)
   */
  private parseComments(): void {
    const matches = Array.from(this.content.matchAll(YamlPatterns.comment));

    for (const match of matches) {
      if (match.index !== undefined) {
        // Check if this is not inside a string
        if (!this.isInsideToken(match.index, match.index + match[0].length)) {
          this.tokens.push({
            type: 'comment',
            start: match.index,
            end: match.index + match[0].length,
            content: match[0],
            raw: match[0],
          });
        }
      }
    }
  }

  /**
   * Parse document separators (--- or ...)
   */
  private parseDocumentSeparators(): void {
    const matches = Array.from(this.content.matchAll(YamlPatterns.documentSeparator));

    for (const match of matches) {
      if (match.index !== undefined) {
        this.tokens.push({
          type: 'document-separator',
          start: match.index,
          end: match.index + match[0].length,
          content: match[1],
          raw: match[0],
        });
      }
    }
  }

  /**
   * Parse keys (word: or "quoted key":)
   */
  private parseKeys(): void {
    const matches = Array.from(this.content.matchAll(YamlPatterns.key));

    for (const match of matches) {
      if (match.index !== undefined && !this.isInsideToken(match.index, match.index + match[0].length)) {
        const indent = match[1]; // Leading whitespace
        const keyName = match[2]; // Key name
        const space = match[3]; // Space after key
        const colon = ':';

        // Add indent token if present
        if (indent.length > 0) {
          this.tokens.push({
            type: 'indent',
            start: match.index,
            end: match.index + indent.length,
            content: indent,
            raw: indent,
          });
        }

        // Add key token
        const keyStart = match.index + indent.length;
        this.tokens.push({
          type: 'key',
          start: keyStart,
          end: keyStart + keyName.length,
          content: keyName,
          raw: keyName,
        });

        // Add colon token
        const colonStart = keyStart + keyName.length + space.length;
        this.tokens.push({
          type: 'colon',
          start: colonStart,
          end: colonStart + 1,
          content: colon,
          raw: colon,
        });
      }
    }
  }

  /**
   * Parse list markers (-)
   */
  private parseListMarkers(): void {
    const matches = Array.from(this.content.matchAll(YamlPatterns.listMarker));

    for (const match of matches) {
      if (match.index !== undefined && !this.isInsideToken(match.index, match.index + match[0].length)) {
        const indent = match[1];
        const marker = '-';

        // Add indent token if present
        if (indent.length > 0) {
          this.tokens.push({
            type: 'indent',
            start: match.index,
            end: match.index + indent.length,
            content: indent,
            raw: indent,
          });
        }

        // Add list marker token
        const markerStart = match.index + indent.length;
        this.tokens.push({
          type: 'list-marker',
          start: markerStart,
          end: markerStart + 1,
          content: marker,
          raw: marker,
        });
      }
    }
  }

  /**
   * Parse anchors and aliases (&anchor, *alias)
   */
  private parseAnchorsAndAliases(): void {
    // Anchors
    const anchorMatches = Array.from(this.content.matchAll(YamlPatterns.anchor));
    for (const match of anchorMatches) {
      if (match.index !== undefined && !this.isInsideToken(match.index, match.index + match[0].length)) {
        this.tokens.push({
          type: 'anchor',
          start: match.index,
          end: match.index + match[0].length,
          content: match[0],
          raw: match[0],
        });
      }
    }

    // Aliases
    const aliasMatches = Array.from(this.content.matchAll(YamlPatterns.alias));
    for (const match of aliasMatches) {
      if (match.index !== undefined && !this.isInsideToken(match.index, match.index + match[0].length)) {
        this.tokens.push({
          type: 'alias',
          start: match.index,
          end: match.index + match[0].length,
          content: match[0],
          raw: match[0],
        });
      }
    }
  }

  /**
   * Parse quoted strings ("string" or 'string')
   */
  private parseQuotedStrings(): void {
    const matches = Array.from(this.content.matchAll(YamlPatterns.quotedString));

    for (const match of matches) {
      if (match.index !== undefined && !this.isInsideToken(match.index, match.index + match[0].length)) {
        const fullString = match[0];
        const quote = fullString[0]; // " or '
        const stringContent = fullString.slice(1, -1);

        // Add opening quote
        this.tokens.push({
          type: 'quote',
          start: match.index,
          end: match.index + 1,
          content: quote,
          raw: quote,
        });

        // Add string content
        this.tokens.push({
          type: 'value-string',
          start: match.index + 1,
          end: match.index + 1 + stringContent.length,
          content: stringContent,
          raw: stringContent,
        });

        // Add closing quote
        this.tokens.push({
          type: 'quote',
          start: match.index + fullString.length - 1,
          end: match.index + fullString.length,
          content: quote,
          raw: quote,
        });
      }
    }
  }

  /**
   * Parse multiline indicators (| or >)
   */
  private parseMultilineIndicators(): void {
    const matches = Array.from(this.content.matchAll(YamlPatterns.multilineIndicator));

    for (const match of matches) {
      if (match.index !== undefined && !this.isInsideToken(match.index, match.index + match[0].length)) {
        const indicator = match[0].trim()[0]; // | or >
        this.tokens.push({
          type: 'multiline-indicator',
          start: match.index + match[0].indexOf(indicator),
          end: match.index + match[0].indexOf(indicator) + 1,
          content: indicator,
          raw: indicator,
        });
      }
    }
  }

  /**
   * Parse booleans (true, false, yes, no, on, off)
   */
  private parseBooleans(): void {
    const matches = Array.from(this.content.matchAll(YamlPatterns.boolean));

    for (const match of matches) {
      if (match.index !== undefined && !this.isInsideToken(match.index, match.index + match[0].length)) {
        // Make sure it's a value, not part of a key or string
        if (this.isValueContext(match.index)) {
          this.tokens.push({
            type: 'value-boolean',
            start: match.index,
            end: match.index + match[0].length,
            content: match[0],
            raw: match[0],
          });
        }
      }
    }
  }

  /**
   * Parse numbers
   */
  private parseNumbers(): void {
    const matches = Array.from(this.content.matchAll(YamlPatterns.number));

    for (const match of matches) {
      if (match.index !== undefined && !this.isInsideToken(match.index, match.index + match[0].length)) {
        // Make sure it's a value, not part of a key or string
        if (this.isValueContext(match.index)) {
          this.tokens.push({
            type: 'value-number',
            start: match.index,
            end: match.index + match[0].length,
            content: match[0],
            raw: match[0],
          });
        }
      }
    }
  }

  /**
   * Parse null values (null, ~)
   */
  private parseNulls(): void {
    const matches = Array.from(this.content.matchAll(YamlPatterns.null));

    for (const match of matches) {
      if (match.index !== undefined && !this.isInsideToken(match.index, match.index + match[0].length)) {
        // Make sure it's a value, not part of a key or string
        if (this.isValueContext(match.index)) {
          this.tokens.push({
            type: 'value-null',
            start: match.index,
            end: match.index + match[0].length,
            content: match[0],
            raw: match[0],
          });
        }
      }
    }
  }

  /**
   * Check if a range is already inside another token
   */
  private isInsideToken(start: number, end: number): boolean {
    return this.tokens.some(
      token =>
        (start >= token.start && start < token.end) ||
        (end > token.start && end <= token.end) ||
        (start <= token.start && end >= token.end)
    );
  }

  /**
   * Check if position is in a value context (after a colon or list marker)
   */
  private isValueContext(position: number): boolean {
    // Find the line containing this position
    const lineStart = this.content.lastIndexOf('\n', position - 1) + 1;
    const lineEnd = this.content.indexOf('\n', position);
    const line = this.content.substring(
      lineStart,
      lineEnd === -1 ? this.content.length : lineEnd
    );

    const positionInLine = position - lineStart;

    // Check if there's a colon before this position on the same line
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1 && colonIndex < positionInLine) {
      return true;
    }

    // Check if line starts with a list marker
    if (line.trim().startsWith('-')) {
      return true;
    }

    return false;
  }

  /**
   * Get tokens in a specific range
   */
  getTokensInRange(start: number, end: number): YamlToken[] {
    return this.tokens.filter(token => !(token.end <= start || token.start >= end));
  }

  /**
   * Get all tokens
   */
  getAllTokens(): YamlToken[] {
    return this.tokens;
  }

  /**
   * Get tokens by type
   */
  getTokensByType(type: YamlTokenType): YamlToken[] {
    return this.tokens.filter(token => token.type === type);
  }
}

/**
 * Quick utility function to parse YAML content
 */
export function parseYaml(content: string): YamlToken[] {
  const parser = new YamlParser(content);
  return parser.parse();
}
