import { JsonMetadata, JsonValidationError } from '../types/json';

/**
 * JsonService - Singleton service for JSON operations
 * Handles parsing, validation, formatting, minifying, and metadata extraction
 */
class JsonService {
  private static instance: JsonService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): JsonService {
    if (!JsonService.instance) {
      JsonService.instance = new JsonService();
    }
    return JsonService.instance;
  }

  /**
   * Parse JSON content to JavaScript object
   */
  public parseJson(content: string): any {
    try {
      return JSON.parse(content);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate JSON content and return any errors
   */
  public validateJson(content: string): JsonValidationError[] {
    const errors: JsonValidationError[] = [];

    if (!content || content.trim() === '') {
      errors.push({
        message: 'Empty JSON content',
        severity: 'warning',
      });
      return errors;
    }

    try {
      JSON.parse(content);
    } catch (error: any) {
      // Try to extract line and column information from error message
      const lineMatch = error.message.match(/at position (\d+)/);
      let line: number | undefined;
      let column: number | undefined;

      if (lineMatch) {
        const position = parseInt(lineMatch[1], 10);
        const lines = content.substring(0, position).split('\n');
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }

      errors.push({
        message: error.message || 'Invalid JSON syntax',
        line,
        column,
        severity: 'error',
      });
    }

    return errors;
  }

  /**
   * Format JSON content with indentation
   */
  public formatJson(content: string, indent: number = 2): string {
    try {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, indent);
    } catch (error) {
      throw new Error('Cannot format invalid JSON');
    }
  }

  /**
   * Minify JSON content (remove all whitespace)
   */
  public minifyJson(content: string): string {
    try {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed);
    } catch (error) {
      throw new Error('Cannot minify invalid JSON');
    }
  }

  /**
   * Sort JSON object keys alphabetically
   */
  public sortKeys(content: string, indent: number = 2): string {
    try {
      const parsed = JSON.parse(content);
      const sorted = this.sortObjectKeys(parsed);
      return JSON.stringify(sorted, null, indent);
    } catch (error) {
      throw new Error('Cannot sort invalid JSON');
    }
  }

  /**
   * Recursively sort object keys
   */
  private sortObjectKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item));
    }

    const sorted: Record<string, any> = {};
    Object.keys(obj)
      .sort()
      .forEach(key => {
        sorted[key] = this.sortObjectKeys(obj[key]);
      });

    return sorted;
  }

  /**
   * Extract metadata from JSON content
   */
  public extractMetadata(content: string): JsonMetadata {
    const validationErrors = this.validateJson(content);
    const isValid = validationErrors.length === 0 || validationErrors.every(e => e.severity === 'warning');

    const metadata: JsonMetadata = {
      keyCount: 0,
      maxDepth: 0,
      arrayCount: 0,
      objectCount: 0,
      lineCount: content.split('\n').length,
      charCount: content.length,
      isValid,
      validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
    };

    if (isValid) {
      try {
        const parsed = JSON.parse(content);
        metadata.maxDepth = this.getDepth(parsed);
        metadata.keyCount = this.countKeys(parsed);
        metadata.arrayCount = this.countArrays(parsed);
        metadata.objectCount = this.countObjects(parsed);
      } catch (error) {
        // If parsing fails, metadata will have default values
      }
    }

    return metadata;
  }

  /**
   * Calculate maximum nesting depth
   */
  private getDepth(obj: any, currentDepth: number = 0): number {
    if (obj === null || typeof obj !== 'object') {
      return currentDepth;
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) return currentDepth + 1;
      return Math.max(...obj.map(item => this.getDepth(item, currentDepth + 1)));
    }

    const keys = Object.keys(obj);
    if (keys.length === 0) return currentDepth + 1;

    return Math.max(...keys.map(key => this.getDepth(obj[key], currentDepth + 1)));
  }

  /**
   * Count total number of keys in object
   */
  private countKeys(obj: any): number {
    if (obj === null || typeof obj !== 'object') {
      return 0;
    }

    if (Array.isArray(obj)) {
      return obj.reduce((sum, item) => sum + this.countKeys(item), 0);
    }

    const keys = Object.keys(obj);
    return keys.length + keys.reduce((sum, key) => sum + this.countKeys(obj[key]), 0);
  }

  /**
   * Count number of arrays in structure
   */
  private countArrays(obj: any): number {
    if (obj === null || typeof obj !== 'object') {
      return 0;
    }

    if (Array.isArray(obj)) {
      return 1 + obj.reduce((sum: number, item) => sum + this.countArrays(item), 0);
    }

    return Object.values(obj).reduce((sum: number, value) => sum + this.countArrays(value), 0);
  }

  /**
   * Count number of objects in structure
   */
  private countObjects(obj: any): number {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
      if (Array.isArray(obj)) {
        return obj.reduce((sum: number, item) => sum + this.countObjects(item), 0);
      }
      return 0;
    }

    return 1 + Object.values(obj).reduce((sum: number, value) => sum + this.countObjects(value), 0);
  }

  /**
   * Extract top-level keys for outline/navigation
   */
  public extractOutline(content: string): Array<{ key: string; line: number; type: string; depth: number }> {
    const outline: Array<{ key: string; line: number; type: string; depth: number }> = [];

    try {
      const parsed = JSON.parse(content);
      this.extractOutlineRecursive(parsed, outline, content, 0);
    } catch (error) {
      // If invalid JSON, return empty outline
    }

    return outline;
  }

  /**
   * Recursively extract outline items
   */
  private extractOutlineRecursive(
    obj: any,
    outline: Array<{ key: string; line: number; type: string; depth: number }>,
    content: string,
    depth: number,
    parentKey: string = ''
  ): void {
    if (obj === null || typeof obj !== 'object') {
      return;
    }

    if (Array.isArray(obj)) {
      // For arrays, we don't add individual items to outline
      return;
    }

    Object.keys(obj).forEach(key => {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      const value = obj[key];
      let type: string;

      if (value === null) {
        type = 'null';
      } else if (Array.isArray(value)) {
        type = 'array';
      } else if (typeof value === 'object') {
        type = 'object';
      } else {
        type = typeof value;
      }

      // Find line number by searching for the key in content
      const lines = content.split('\n');
      let lineNumber = 1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`"${key}"`)) {
          lineNumber = i + 1;
          break;
        }
      }

      outline.push({
        key: fullKey,
        line: lineNumber,
        type,
        depth,
      });

      // Recursively process nested objects
      if (type === 'object') {
        this.extractOutlineRecursive(value, outline, content, depth + 1, fullKey);
      }
    });
  }
}

export default JsonService;
