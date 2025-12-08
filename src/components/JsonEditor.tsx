import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { UniversalFile } from '../types/markdown';
import SyntaxHighlightedEditor, {
  SyntaxHighlightedEditorRef,
} from './SyntaxHighlightedEditor';
import { AlertCircle, CheckCircle, Hash } from 'lucide-react';
import JsonService from '../services/JsonService';

interface JsonEditorProps {
  file: UniversalFile | null;
  onChange?: (content: string) => void;
  onSave?: (content: string) => void;
  onScroll?: (scrollTop: number, scrollHeight: number, clientHeight: number) => void;
  onCursorPositionChange?: (position: number) => void;
  className?: string;
  readOnly?: boolean;
}

export interface JsonEditorRef {
  getScrollElement: () => HTMLElement | null;
  scrollToLine: (lineNumber: number) => void;
}

const JsonEditor = forwardRef<JsonEditorRef, JsonEditorProps>(({
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
  const jsonService = JsonService.getInstance();

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

  // Validate JSON content
  const validateContent = (jsonContent: string) => {
    const errors = jsonService.validateJson(jsonContent);
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
      }
    }

    // Handle tab key for indentation (2 spaces for JSON)
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

  // Decrease indentation
  const decreaseIndent = () => {
    const textarea = editorRef.current?.getTextarea();
    if (!textarea || readOnly) return;

    const start = textarea.selectionStart;
    const beforeCursor = content.substring(0, start);
    const lineStart = beforeCursor.lastIndexOf('\n') + 1;
    const lineEndPos = content.indexOf('\n', start);
    const lineEnd = lineEndPos === -1 ? content.length : lineEndPos;
    const line = content.substring(lineStart, lineEnd);

    // Remove up to 2 spaces from the beginning
    const newLine = line.replace(/^ {1,2}/, '');
    const removed = line.length - newLine.length;

    if (removed > 0) {
      const afterLine = content.substring(lineEnd);
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

    // Check if current line ends with { or [ (start of object/array)
    const trimmedLine = currentLine.trim();
    let newIndent = indent;

    if (trimmedLine.endsWith('{') || trimmedLine.endsWith('[')) {
      // Increase indent for nested content
      newIndent = indent + '  ';
    } else if (trimmedLine.endsWith(',')) {
      // Maintain indent for object/array items
      newIndent = indent;
    }

    const newContent = content.substring(0, start) + '\n' + newIndent + content.substring(start);
    handleContentChange(newContent);

    // Set cursor position
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + 1 + newIndent.length;
    }, 0);
  };

  // Format JSON
  const formatJson = () => {
    if (readOnly) return;
    try {
      const formatted = jsonService.formatJson(content, 2);
      handleContentChange(formatted);
    } catch (error) {
      console.error('Failed to format JSON:', error);
    }
  };

  // Minify JSON
  const minifyJson = () => {
    if (readOnly) return;
    try {
      const minified = jsonService.minifyJson(content);
      handleContentChange(minified);
    } catch (error) {
      console.error('Failed to minify JSON:', error);
    }
  };

  // Sort keys alphabetically
  const sortKeys = () => {
    if (readOnly) return;
    try {
      const sorted = jsonService.sortKeys(content, 2);
      handleContentChange(sorted);
    } catch (error) {
      console.error('Failed to sort keys:', error);
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
                  <span className="text-xs">Valid JSON</span>
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
              <>
                <button
                  onClick={formatJson}
                  className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  title="Format JSON"
                >
                  Format
                </button>
                <button
                  onClick={minifyJson}
                  className="text-xs px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                  title="Minify JSON"
                >
                  Minify
                </button>
                <button
                  onClick={sortKeys}
                  className="text-xs px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                  title="Sort Keys Alphabetically"
                >
                  Sort Keys
                </button>
              </>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Ctrl+S to save
            </span>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
            JSON Validation Errors:
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
          placeholder="Start typing your JSON content..."
          className="flex-1 w-full"
          language="json"
          showLineNumbers={showLineNumbers}
        />
      )}

      {/* No file state */}
      {!file && (
        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium mb-2">
              No file selected for editing
            </h3>
            <p className="text-sm">Select a JSON file to start editing</p>
          </div>
        </div>
      )}
    </div>
  );
});

JsonEditor.displayName = 'JsonEditor';

export default JsonEditor;
