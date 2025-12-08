export interface JsonFile {
  id: string;
  name: string;
  path: string;
  content: string;
  size: number;
  lastModified: Date;
  created: Date;
  metadata?: JsonMetadata;
  fileHandle?: FileSystemFileHandle;
}

export interface JsonMetadata {
  keyCount: number;
  maxDepth: number;
  arrayCount: number;
  objectCount: number;
  lineCount: number;
  charCount: number;
  isValid: boolean;
  validationErrors?: JsonValidationError[];
}

export interface JsonValidationError {
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning';
}

export interface JsonToken {
  type: JsonTokenType;
  start: number;
  end: number;
  content: string;
  raw: string;
}

export type JsonTokenType =
  | 'brace-open'
  | 'brace-close'
  | 'bracket-open'
  | 'bracket-close'
  | 'key'
  | 'colon'
  | 'comma'
  | 'value-string'
  | 'value-number'
  | 'value-boolean'
  | 'value-null'
  | 'quote'
  | 'text';
