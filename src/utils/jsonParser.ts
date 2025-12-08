import { JsonToken, JsonTokenType } from '../types/json';

/**
 * JsonParser - Custom parser for JSON syntax highlighting
 * Provides token-based parsing for precise syntax highlighting control
 */
export class JsonParser {
  private content: string;
  private tokens: JsonToken[] = [];

  constructor(content: string) {
    this.content = content;
  }

  /**
   * Main parsing method - returns all tokens
   */
  public parse(): JsonToken[] {
    this.tokens = [];

    // Parse in order of precedence
    this.parseStrings();
    this.parseNumbers();
    this.parseBooleans();
    this.parseNull();
    this.parseBraces();
    this.parseBrackets();
    this.parseColons();
    this.parseCommas();

    // Sort tokens by start position
    this.tokens.sort((a, b) => a.start - b.start);

    return this.tokens;
  }

  /**
   * Get tokens within a specific range
   */
  public getTokensInRange(start: number, end: number): JsonToken[] {
    return this.tokens.filter(token => token.start >= start && token.end <= end);
  }

  /**
   * Parse string values and keys
   */
  private parseStrings(): void {
    // Match quoted strings (keys and values)
    const stringRegex = /"([^"\\]*(\\.[^"\\]*)*)"/g;
    let match;

    while ((match = stringRegex.exec(this.content)) !== null) {
      const raw = match[0];
      const content = match[1];
      const start = match.index;
      const end = start + raw.length;

      // Determine if this is a key or value by looking ahead for colon
      const afterString = this.content.substring(end).trimStart();
      const isKey = afterString.startsWith(':');

      // Add opening quote
      this.tokens.push({
        type: 'quote',
        start,
        end: start + 1,
        content: '"',
        raw: '"',
      });

      // Add string content (key or value)
      this.tokens.push({
        type: isKey ? 'key' : 'value-string',
        start: start + 1,
        end: end - 1,
        content,
        raw: content,
      });

      // Add closing quote
      this.tokens.push({
        type: 'quote',
        start: end - 1,
        end,
        content: '"',
        raw: '"',
      });
    }
  }

  /**
   * Parse numeric values
   */
  private parseNumbers(): void {
    // Match numbers (integer, decimal, scientific notation)
    const numberRegex = /-?\d+(\.\d+)?([eE][+-]?\d+)?/g;
    let match;

    while ((match = numberRegex.exec(this.content)) !== null) {
      const raw = match[0];
      const start = match.index;
      const end = start + raw.length;

      // Make sure this number isn't part of a string
      if (!this.isPositionInToken(start)) {
        this.tokens.push({
          type: 'value-number',
          start,
          end,
          content: raw,
          raw,
        });
      }
    }
  }

  /**
   * Parse boolean values (true/false)
   */
  private parseBooleans(): void {
    const booleanRegex = /\b(true|false)\b/g;
    let match;

    while ((match = booleanRegex.exec(this.content)) !== null) {
      const raw = match[0];
      const start = match.index;
      const end = start + raw.length;

      // Make sure this boolean isn't part of a string
      if (!this.isPositionInToken(start)) {
        this.tokens.push({
          type: 'value-boolean',
          start,
          end,
          content: raw,
          raw,
        });
      }
    }
  }

  /**
   * Parse null values
   */
  private parseNull(): void {
    const nullRegex = /\bnull\b/g;
    let match;

    while ((match = nullRegex.exec(this.content)) !== null) {
      const raw = match[0];
      const start = match.index;
      const end = start + raw.length;

      // Make sure this null isn't part of a string
      if (!this.isPositionInToken(start)) {
        this.tokens.push({
          type: 'value-null',
          start,
          end,
          content: raw,
          raw,
        });
      }
    }
  }

  /**
   * Parse braces { }
   */
  private parseBraces(): void {
    for (let i = 0; i < this.content.length; i++) {
      const char = this.content[i];

      if (!this.isPositionInToken(i)) {
        if (char === '{') {
          this.tokens.push({
            type: 'brace-open',
            start: i,
            end: i + 1,
            content: '{',
            raw: '{',
          });
        } else if (char === '}') {
          this.tokens.push({
            type: 'brace-close',
            start: i,
            end: i + 1,
            content: '}',
            raw: '}',
          });
        }
      }
    }
  }

  /**
   * Parse brackets [ ]
   */
  private parseBrackets(): void {
    for (let i = 0; i < this.content.length; i++) {
      const char = this.content[i];

      if (!this.isPositionInToken(i)) {
        if (char === '[') {
          this.tokens.push({
            type: 'bracket-open',
            start: i,
            end: i + 1,
            content: '[',
            raw: '[',
          });
        } else if (char === ']') {
          this.tokens.push({
            type: 'bracket-close',
            start: i,
            end: i + 1,
            content: ']',
            raw: ']',
          });
        }
      }
    }
  }

  /**
   * Parse colons :
   */
  private parseColons(): void {
    for (let i = 0; i < this.content.length; i++) {
      const char = this.content[i];

      if (char === ':' && !this.isPositionInToken(i)) {
        this.tokens.push({
          type: 'colon',
          start: i,
          end: i + 1,
          content: ':',
          raw: ':',
        });
      }
    }
  }

  /**
   * Parse commas ,
   */
  private parseCommas(): void {
    for (let i = 0; i < this.content.length; i++) {
      const char = this.content[i];

      if (char === ',' && !this.isPositionInToken(i)) {
        this.tokens.push({
          type: 'comma',
          start: i,
          end: i + 1,
          content: ',',
          raw: ',',
        });
      }
    }
  }

  /**
   * Check if a position is already part of an existing token
   */
  private isPositionInToken(position: number): boolean {
    return this.tokens.some(token => position >= token.start && position < token.end);
  }
}

/**
 * Helper function to get CSS class for token type
 */
export function getJsonTokenClass(type: JsonTokenType): string {
  const classMap: Record<JsonTokenType, string> = {
    'brace-open': 'json-brace',
    'brace-close': 'json-brace',
    'bracket-open': 'json-bracket',
    'bracket-close': 'json-bracket',
    key: 'json-key',
    colon: 'json-colon',
    comma: 'json-comma',
    'value-string': 'json-value-string',
    'value-number': 'json-value-number',
    'value-boolean': 'json-value-boolean',
    'value-null': 'json-value-null',
    quote: 'json-quote',
    text: 'json-text',
  };

  return classMap[type] || 'json-text';
}
