import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { UniversalFile } from '../types/markdown';
import SyntaxHighlightedEditor, {
  SyntaxHighlightedEditorRef,
} from './SyntaxHighlightedEditor';
import { AlertCircle, CheckCircle, Hash } from 'lucide-react';
import YamlService from '../services/YamlService';

interface YamlEditorProps {
  file: UniversalFile | null;
  onChange?: (content: string) => void;
  onSave?: (content: string) => void;
  onScroll?: (scrollTop: number, scrollHeight: number, clientHeight: number) => void;
  onCursorPositionChange?: (position: number) => void;
  className?: string;
  readOnly?: boolean;
}

export interface YamlEditorRef {
  getScrollElement: () => HTMLElement | null;
  scrollToLine: (lineNumber: number) => void;
}

const YamlEditor = forwardRef<YamlEditorRef, YamlEditorProps>(({
  file,
  onChange,
  onSave,
  onScroll,
  onCursorPositionChange,
  className = '',
  readOnly = false,
}, ref) => {
  const [content, setContent] = useState(file?.content || '');
  const [validationErrors, setValidationErrors] = useState<Array<{ message: string; line?: number }>>([]);
  const [isValid, setIsValid] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const editorRef = useRef<SyntaxHighlightedEditorRef>(null);
  const yamlService = YamlService.getInstance();

  // Expose scroll element and methods for synchronization
  useImperativeHandle(ref, () => ({
    getScrollElement: () => {
      const textarea = editorRef.current?.getTextarea();
      return textarea || null;
    },
    scrollToLine: (lineNumber: number) => {
      const textarea = editorRef.current?.getTextarea();
      if (!textarea || !content) return;

      // Calculate character position for the target line
      const lines = content.split('\n');
      if (lineNumber < 1 || lineNumber > lines.length) return;

      // Calculate the character offset to the start of the target line
      let charOffset = 0;
      for (let i = 0; i < lineNumber - 1; i++) {
        charOffset += lines[i].length + 1; // +1 for newline
      }

      // Calculate scroll position based on line height
      const lineHeight = 21; // 14px font * 1.5 line-height
      const targetScrollTop = (lineNumber - 1) * lineHeight;

      // Scroll to the calculated position
      textarea.scrollTop = Math.max(0, targetScrollTop - 100); // Offset by 100px to center it better

      // Optional: Also set cursor to that line
      textarea.setSelectionRange(charOffset, charOffset);
      textarea.focus();
    }
  }));

  // Update content when file changes
  useEffect(() => {
    if (file?.content !== undefined) {
      setContent(file.content);
      validateContent(file.content);
    }
  }, [file?.content]);

  // Validate YAML content
  const validateContent = (yamlContent: string) => {
    const errors = yamlService.validateYaml(yamlContent);
    setValidationErrors(errors);
    setIsValid(errors.length === 0);
  };

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setContent(newContent);

    // Debounced validation
    validateContent(newContent);

    if (onChange && !readOnly) {
      onChange(newContent);
    }
  };

  // Handle scroll events from the editor
  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (onScroll) {
      const target = e.currentTarget;
      onScroll(target.scrollTop, target.scrollHeight, target.clientHeight);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          if (onSave && file) {
            onSave(content);
          }
          break;
        case '/':
          e.preventDefault();
          toggleComment();
          break;
      }
    }

    // Handle tab key for indentation (2 spaces for YAML)
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (e.shiftKey) {
        // Shift+Tab: Decrease indent
        decreaseIndent();
      } else {
        // Tab: Insert 2 spaces
        const newContent =
          content.substring(0, start) + '  ' + content.substring(end);
        handleContentChange(newContent);

        // Restore cursor position
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    }

    // Enter key: Smart newline with indentation
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      smartNewline();
    }
  };

  // Toggle comment on current line or selection
  const toggleComment = () => {
    const textarea = editorRef.current?.getTextarea();
    if (!textarea || readOnly) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Find line boundaries
    const beforeCursor = content.substring(0, start);
    const lineStart = beforeCursor.lastIndexOf('\n') + 1;
    const afterCursor = content.substring(end);
    const lineEndOffset = afterCursor.indexOf('\n');
    const lineEnd = lineEndOffset === -1 ? content.length : end + lineEndOffset;

    const line = content.substring(lineStart, lineEnd);
    const trimmed = line.trim();

    let newLine: string;
    if (trimmed.startsWith('#')) {
      // Remove comment
      newLine = line.replace(/^\s*#\s?/, '');
    } else {
      // Add comment
      const indent = line.match(/^\s*/)?.[0] || '';
      newLine = indent + '# ' + line.trim();
    }

    const newContent =
      content.substring(0, lineStart) + newLine + content.substring(lineEnd);
    handleContentChange(newContent);

    // Restore cursor position
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = lineStart + newLine.length;
    }, 0);
  };

  // Decrease indentation
  const decreaseIndent = () => {
    const textarea = editorRef.current?.getTextarea();
    if (!textarea || readOnly) return;

    const start = textarea.selectionStart;
    const beforeCursor = content.substring(0, start);
    const lineStart = beforeCursor.lastIndexOf('\n') + 1;
    const line = content.substring(lineStart, content.indexOf('\n', start));

    // Remove up to 2 spaces from the beginning
    const newLine = line.replace(/^ {1,2}/, '');
    const removed = line.length - newLine.length;

    if (removed > 0) {
      const afterLine = content.substring(lineStart + line.length);
      const newContent = content.substring(0, lineStart) + newLine + afterLine;
      handleContentChange(newContent);

      // Restore cursor position
      setTimeout(() => {
        const newPos = Math.max(lineStart, start - removed);
        textarea.selectionStart = textarea.selectionEnd = newPos;
      }, 0);
    }
  };

  // Smart newline with indentation matching
  const smartNewline = () => {
    const textarea = editorRef.current?.getTextarea();
    if (!textarea || readOnly) return;

    const start = textarea.selectionStart;
    const beforeCursor = content.substring(0, start);
    const lineStart = beforeCursor.lastIndexOf('\n') + 1;
    const currentLine = content.substring(lineStart, start);

    // Get current line's indentation
    const indentMatch = currentLine.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1] : '';

    // Check if current line ends with :  (key definition)
    const trimmedLine = currentLine.trim();
    let newIndent = indent;

    if (trimmedLine.endsWith(':')) {
      // Increase indent for nested content
      newIndent = indent + '  ';
    } else if (trimmedLine.startsWith('-')) {
      // List item - maintain indent
      newIndent = indent;
    }

    const newContent = content.substring(0, start) + '\n' + newIndent + content.substring(start);
    handleContentChange(newContent);

    // Set cursor position
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + 1 + newIndent.length;
    }, 0);
  };

  // Format YAML
  const formatYaml = () => {
    if (readOnly) return;
    try {
      const formatted = yamlService.formatYaml(content);
      handleContentChange(formatted);
    } catch (error) {
      console.error('Failed to format YAML:', error);
    }
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Editor Header */}
      {file && (
        <div className="flex items-center justify-between py-1 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-0">
            {/* Line Numbers Toggle */}
            <button
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              className="flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              style={{ width: '30px', minWidth: '30px', padding: '0' }}
              title={showLineNumbers ? 'Hide line numbers' : 'Show line numbers'}
              type="button"
            >
              <Hash className="h-4 w-4" />
            </button>

            {/* Divider */}
            <span className="text-gray-300 dark:text-gray-600" style={{ marginLeft: '0.25rem', marginRight: '0.25rem' }}>|</span>

            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Editing: {file.name}
            </span>
            {readOnly && (
              <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                Read Only
              </span>
            )}

            {/* Validation Status */}
            <div className="flex items-center gap-1">
              {isValid ? (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs">Valid YAML</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-xs">{validationErrors.length} error{validationErrors.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!readOnly && (
              <button
                onClick={formatYaml}
                className="text-xs px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                title="Format YAML (Ctrl+Shift+F)"
              >
                Format
              </button>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Ctrl+S to save • Ctrl+/ to comment
            </span>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
            YAML Validation Errors:
          </div>
          <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>
                {error.line !== undefined && `Line ${error.line}: `}
                {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Syntax Highlighted Editor */}
      {file && (
        <SyntaxHighlightedEditor
          ref={editorRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          onScroll={handleEditorScroll}
          onCursorPositionChange={onCursorPositionChange}
          readOnly={readOnly}
          placeholder="Start typing your YAML content..."
          className="flex-1 w-full"
          language="yaml"
          showLineNumbers={showLineNumbers}
        />
      )}

      {/* No file state */}
      {!file && (
        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2">
              No file selected for editing
            </h3>
            <p className="text-sm">Select a YAML file to start editing</p>
          </div>
        </div>
      )}
    </div>
  );
});

YamlEditor.displayName = 'YamlEditor';

export default YamlEditor;
