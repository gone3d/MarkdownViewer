import * as yaml from 'js-yaml';
import { YamlMetadata, YamlValidationError } from '../types/yaml';

/**
 * Service for YAML parsing, validation, and metadata extraction
 */
class YamlService {
  private static instance: YamlService;

  private constructor() {}

  public static getInstance(): YamlService {
    if (!YamlService.instance) {
      YamlService.instance = new YamlService();
    }
    return YamlService.instance;
  }

  /**
   * Parse YAML content to JavaScript object
   */
  public parseYaml(content: string): any {
    try {
      return yaml.load(content);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Parse multiple YAML documents (separated by ---)
   */
  public parseAllYaml(content: string): any[] {
    try {
      return yaml.loadAll(content);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate YAML syntax and return errors
   */
  public validateYaml(content: string): YamlValidationError[] {
    const errors: YamlValidationError[] = [];

    try {
      yaml.loadAll(content);
    } catch (error: any) {
      const yamlError = error as yaml.YAMLException;

      errors.push({
        message: yamlError.message || 'Invalid YAML syntax',
        line: yamlError.mark?.line ? yamlError.mark.line + 1 : undefined,
        column: yamlError.mark?.column ? yamlError.mark.column + 1 : undefined,
        severity: 'error',
      });
    }

    return errors;
  }

  /**
   * Format YAML content with consistent indentation while preserving comments
   * Note: This is a basic formatter that preserves comments but may not handle all edge cases
   */
  public formatYaml(content: string, indentSize: 2 | 4 = 2): string {
    try {
      const lines = content.split('\n');
      const formatted: string[] = [];
      let currentIndent = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Preserve empty lines
        if (!trimmed) {
          formatted.push('');
          continue;
        }

        // Preserve comments (including their indentation context)
        if (trimmed.startsWith('#')) {
          // Keep comment at current indent level
          formatted.push(' '.repeat(currentIndent) + trimmed);
          continue;
        }

        // Document separator
        if (trimmed === '---') {
          formatted.push('---');
          currentIndent = 0;
          continue;
        }

        // Calculate proper indentation based on structure
        const isListItem = trimmed.startsWith('-');
        const isKeyValue = trimmed.includes(':') && !isListItem;

        // Get current line indentation
        const originalIndent = line.search(/\S/);

        // Determine if we should increase or decrease indent
        if (i > 0) {
          const prevLine = lines[i - 1].trim();
          const prevIsKey = prevLine.includes(':') && !prevLine.startsWith('-');

          if (prevIsKey && prevLine.endsWith(':')) {
            // Previous line was a key, increase indent
            if (originalIndent > lines[i - 1].search(/\S/)) {
              currentIndent = Math.floor(originalIndent / indentSize) * indentSize;
            }
          } else if (originalIndent < lines[i - 1].search(/\S/)) {
            // Decrease indent
            currentIndent = Math.floor(originalIndent / indentSize) * indentSize;
          }
        }

        // Apply formatting
        formatted.push(' '.repeat(currentIndent) + trimmed);
      }

      return formatted.join('\n');
    } catch (error) {
      // If formatting fails, return original content
      return content;
    }
  }

  /**
   * Extract comprehensive metadata from YAML content
   */
  public extractMetadata(content: string): YamlMetadata {
    const metadata: YamlMetadata = {
      keyCount: 0,
      maxDepth: 0,
      arrayCount: 0,
      objectCount: 0,
      lineCount: content.split('\n').length,
      charCount: content.length,
      isValid: true,
      validationErrors: [],
    };

    // Validate first
    const errors = this.validateYaml(content);
    if (errors.length > 0) {
      metadata.isValid = false;
      metadata.validationErrors = errors;

      // Still try to extract basic metrics from text
      this.extractBasicMetrics(content, metadata);
      return metadata;
    }

    // If valid, parse and analyze structure
    try {
      const parsed = yaml.loadAll(content);

      // Analyze each document
      parsed.forEach(doc => {
        if (doc !== null && doc !== undefined) {
          this.analyzeObject(doc, metadata, 0);
        }
      });
    } catch (error) {
      // Fallback to basic text analysis
      this.extractBasicMetrics(content, metadata);
    }

    return metadata;
  }

  /**
   * Recursively analyze YAML object structure
   */
  private analyzeObject(obj: any, metadata: YamlMetadata, depth: number): void {
    // Update max depth
    if (depth > metadata.maxDepth) {
      metadata.maxDepth = depth;
    }

    if (obj === null || obj === undefined) {
      return;
    }

    if (Array.isArray(obj)) {
      metadata.arrayCount++;
      obj.forEach(item => {
        this.analyzeObject(item, metadata, depth + 1);
      });
    } else if (typeof obj === 'object') {
      metadata.objectCount++;
      const keys = Object.keys(obj);
      metadata.keyCount += keys.length;

      keys.forEach(key => {
        this.analyzeObject(obj[key], metadata, depth + 1);
      });
    }
  }

  /**
   * Extract basic metrics from raw text (fallback when parsing fails)
   */
  private extractBasicMetrics(content: string, metadata: YamlMetadata): void {
    const lines = content.split('\n');

    // Count keys (lines with colons, excluding comments and strings)
    metadata.keyCount = lines.filter(line => {
      const trimmed = line.trim();
      return (
        trimmed &&
        !trimmed.startsWith('#') &&
        trimmed.includes(':') &&
        !trimmed.startsWith('-')
      );
    }).length;

    // Count arrays (lines starting with -)
    metadata.arrayCount = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('- ');
    }).length;

    // Estimate depth from indentation
    let maxIndent = 0;
    lines.forEach(line => {
      if (line.trim()) {
        const indent = line.search(/\S/);
        if (indent > maxIndent) {
          maxIndent = indent;
        }
      }
    });
    metadata.maxDepth = Math.floor(maxIndent / 2);
  }

  /**
   * Get schema/structure of YAML content
   */
  public getSchema(content: string): any {
    try {
      const parsed = yaml.load(content);
      return this.extractSchema(parsed);
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract schema structure recursively
   */
  private extractSchema(obj: any, visited = new WeakSet()): any {
    if (obj === null || obj === undefined) {
      return { type: 'null' };
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        return { type: 'array', items: [] };
      }
      // Use first item as schema template
      return {
        type: 'array',
        items: this.extractSchema(obj[0], visited),
      };
    }

    if (typeof obj === 'object') {
      // Prevent circular reference issues
      if (visited.has(obj)) {
        return { type: 'circular' };
      }
      visited.add(obj);

      const schema: any = { type: 'object', properties: {} };
      Object.keys(obj).forEach(key => {
        schema.properties[key] = this.extractSchema(obj[key], visited);
      });
      return schema;
    }

    // Primitives
    return { type: typeof obj };
  }

  /**
   * Convert YAML to JSON string
   */
  public toJSON(content: string, pretty: boolean = true): string {
    try {
      const parsed = yaml.load(content);
      return pretty ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed);
    } catch (error) {
      throw new Error('Failed to convert YAML to JSON: ' + (error as Error).message);
    }
  }

  /**
   * Convert JSON to YAML string
   */
  public fromJSON(jsonString: string, indentSize: 2 | 4 = 2): string {
    try {
      const parsed = JSON.parse(jsonString);
      return yaml.dump(parsed, { indent: indentSize, lineWidth: -1 });
    } catch (error) {
      throw new Error('Failed to convert JSON to YAML: ' + (error as Error).message);
    }
  }

  /**
   * Check if content contains multiple YAML documents
   */
  public hasMultipleDocuments(content: string): boolean {
    // Check for document separator (---)
    const separatorPattern = /^---\s*$/m;
    const matches = content.match(new RegExp(separatorPattern, 'g'));
    return matches ? matches.length > 1 : false;
  }

  /**
   * Get depth of nesting at a specific line
   */
  public getDepthAtLine(content: string, lineNumber: number): number {
    const lines = content.split('\n');
    if (lineNumber < 0 || lineNumber >= lines.length) {
      return 0;
    }

    const line = lines[lineNumber];
    if (!line.trim()) {
      return 0;
    }

    const indent = line.search(/\S/);
    return Math.floor(indent / 2);
  }

  /**
   * Extract comments from YAML content for outline/navigation
   * Returns array of comments with their line numbers and indentation levels
   */
  public extractComments(content: string): Array<{
    text: string;
    line: number;
    indent: number;
    id: string;
  }> {
    const lines = content.split('\n');
    const comments: Array<{
      text: string;
      line: number;
      indent: number;
      id: string;
    }> = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Check if line is a comment
      if (trimmed.startsWith('#')) {
        // Remove the # and any leading/trailing whitespace
        const commentText = trimmed.substring(1).trim();

        // Skip empty comments
        if (!commentText) {
          return;
        }

        // Calculate indentation level
        const indent = line.search(/\S/);
        const indentLevel = Math.floor(indent / 2);

        // Create unique ID for this comment
        const id = `yaml-comment-${index}`;

        comments.push({
          text: commentText,
          line: index + 1, // Line numbers are 1-indexed for display
          indent: indentLevel,
          id,
        });
      }
    });

    return comments;
  }
}

export default YamlService;
