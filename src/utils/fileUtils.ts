/**
 * Utility functions for file operations and formatting
 */

/**
 * Format file size in bytes to human readable format
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.2 MB", "345 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 * @param filename - The filename
 * @returns File extension without the dot (e.g., "md", "txt")
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex > 0 ? filename.slice(lastDotIndex + 1).toLowerCase() : '';
}

/**
 * Get filename without extension
 * @param filename - The filename
 * @returns Filename without extension
 */
export function getFileNameWithoutExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex > 0 ? filename.slice(0, lastDotIndex) : filename;
}

/**
 * Check if file is a markdown file
 * @param filename - The filename
 * @returns True if file has markdown extension
 */
export function isMarkdownFile(filename: string): boolean {
  const extension = getFileExtension(filename);
  return ['md', 'markdown', 'mdown', 'mkd', 'mdwn', 'mdtxt', 'mdtext'].includes(extension);
}

/**
 * Generate unique filename with timestamp
 * @param baseName - Base name for the file
 * @param extension - File extension (without dot)
 * @returns Unique filename with timestamp
 */
export function generateUniqueFilename(baseName: string, extension: string = 'md'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${baseName}-${timestamp}.${extension}`;
}

/**
 * Sanitize filename for safe filesystem usage
 * @param filename - The filename to sanitize
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove or replace characters that are problematic in filenames
  return filename
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/**
 * Calculate estimated read time based on word count
 * @param wordCount - Number of words in the text
 * @param wordsPerMinute - Reading speed (default: 200 words per minute)
 * @returns Estimated read time in minutes
 */
export function calculateReadTime(wordCount: number, wordsPerMinute: number = 200): number {
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Format duration in minutes to human readable format
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 1) return 'Less than 1 minute';
  if (minutes === 1) return '1 minute';
  if (minutes < 60) return `${minutes} minutes`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 1 && remainingMinutes === 0) return '1 hour';
  if (remainingMinutes === 0) return `${hours} hours`;
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Check if a file path is valid
 * @param path - File path to validate
 * @returns True if path appears valid
 */
export function isValidFilePath(path: string): boolean {
  // Basic validation - not empty and doesn't contain invalid characters
  return path.length > 0 && !/[<>"|?*]/.test(path);
}