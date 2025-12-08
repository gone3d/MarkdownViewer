import React, { useMemo } from 'react';
import { UniversalFile } from '../types/markdown';
import YamlService from '../services/YamlService';
import { parseYaml } from '../utils/yamlParser';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface YamlViewerProps {
  file: UniversalFile;
}

/**
 * YamlViewer Component
 *
 * Displays YAML file content with syntax highlighting and validation status.
 * Shows file metadata and validation errors if present.
 */
const YamlViewer: React.FC<YamlViewerProps> = ({ file }) => {
  const yamlService = YamlService.getInstance();

  // Validate and extract metadata
  const validationErrors = useMemo(() => {
    return yamlService.validateYaml(file.content);
  }, [file.content]);

  const metadata = useMemo(() => {
    return yamlService.extractMetadata(file.content);
  }, [file.content]);

  const isValid = validationErrors.length === 0;

  // Extract comments for outline
  const comments = useMemo(() => {
    return yamlService.extractComments(file.content);
  }, [file.content]);

  // Apply syntax highlighting using custom parser with comment anchors
  const highlightedContent = useMemo(() => {
    if (!file.content) return '';

    try {
      const tokens = parseYaml(file.content);

      // Filter overlapping tokens
      const filteredTokens = filterOverlappingTokens(tokens);

      let result = '';
      let lastIndex = 0;
      let currentLine = 0;

      for (const token of filteredTokens) {
        // Add text before this token (if any)
        if (token.start > lastIndex) {
          const beforeText = file.content.substring(lastIndex, token.start);

          // Check if we're crossing line boundaries and need to add comment anchors
          for (let i = lastIndex; i < token.start; i++) {
            if (file.content[i] === '\n') {
              currentLine++;
              // Check if next line is a comment that needs an anchor
              const comment = comments.find(c => c.line === currentLine + 1);
              if (comment && i + 1 === token.start) {
                // Add anchor before the comment token
                result += escapeHtml(beforeText.substring(0, i - lastIndex + 1));
                result += `<span id="${comment.id}">`;
                lastIndex = i + 1;
                break;
              }
            }
          }

          if (lastIndex < token.start) {
            result += escapeHtml(file.content.substring(lastIndex, token.start));
          }
        }

        // Check if this token is a comment
        const tokenLineNumber = file.content.substring(0, token.start).split('\n').length;
        const comment = comments.find(c => c.line === tokenLineNumber);

        // Add the highlighted token
        const tokenContent = escapeHtml(token.content);
        if (comment && token.type === 'comment') {
          result += `<span id="${comment.id}" class="yaml-${token.type}">${tokenContent}</span>`;
        } else {
          result += `<span class="yaml-${token.type}">${tokenContent}</span>`;
        }

        lastIndex = token.end;
      }

      // Add any remaining text
      if (lastIndex < file.content.length) {
        result += escapeHtml(file.content.substring(lastIndex));
      }

      return result;
    } catch (error) {
      console.error('Syntax highlighting error:', error);
      return escapeHtml(file.content);
    }
  }, [file.content, comments]);

  return (
    <div className="yaml-viewer h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Validation Status Bar */}
      <div className="validation-status border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          {isValid ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                Valid YAML
              </span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                Invalid YAML - {validationErrors.length} error(s)
              </span>
            </>
          )}
        </div>

        {/* Metadata Summary */}
        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
          <span>{metadata.lineCount} lines</span>
          <span>{metadata.keyCount} keys</span>
          <span>Depth: {metadata.maxDepth}</span>
          {metadata.arrayCount > 0 && <span>{metadata.arrayCount} arrays</span>}
        </div>
      </div>

      {/* Validation Errors */}
      {!isValid && validationErrors.length > 0 && (
        <div className="validation-errors bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                Validation Errors:
              </p>
              <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="font-mono">
                    {error.line !== undefined && (
                      <span className="font-bold">Line {error.line}: </span>
                    )}
                    {error.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* YAML Content */}
      <div className="yaml-content flex-1 overflow-auto">
        <pre className="h-full m-0 p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <code
            className="text-sm font-mono"
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
          />
        </pre>
      </div>
    </div>
  );
};

/**
 * Filter out overlapping tokens, keeping the most specific ones
 */
function filterOverlappingTokens(tokens: any[]): any[] {
  const sorted = [...tokens].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return a.end - a.start - (b.end - b.start);
  });

  const filtered: any[] = [];

  for (const token of sorted) {
    const hasOverlap = filtered.some(
      existing => !(token.end <= existing.start || token.start >= existing.end)
    );

    if (!hasOverlap) {
      filtered.push(token);
    }
  }

  return filtered.sort((a, b) => a.start - b.start);
}

/**
 * Simple HTML escape function
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export default YamlViewer;
