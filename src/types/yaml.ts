export interface YamlFile {
  id: string;
  name: string;
  path: string;
  content: string;
  size: number;
  lastModified: Date;
  created: Date;
  metadata?: YamlMetadata;
  fileHandle?: FileSystemFileHandle;
}

export interface YamlMetadata {
  keyCount: number;
  maxDepth: number;
  arrayCount: number;
  objectCount: number;
  lineCount: number;
  charCount: number;
  isValid: boolean;
  validationErrors?: YamlValidationError[];
}

export interface YamlValidationError {
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning';
}

export interface YamlToken {
  type: YamlTokenType;
  start: number;
  end: number;
  content: string;
  raw: string;
}

export type YamlTokenType =
  | 'key'
  | 'colon'
  | 'value-string'
  | 'value-number'
  | 'value-boolean'
  | 'value-null'
  | 'list-marker'
  | 'anchor'
  | 'alias'
  | 'comment'
  | 'document-separator'
  | 'indent'
  | 'quote'
  | 'multiline-indicator'
  | 'text';
