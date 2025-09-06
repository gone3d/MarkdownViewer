import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { MarkdownFile } from '../types/markdown';
import EditorToolbar from './EditorToolbar';
import SyntaxHighlightedEditor, {
  SyntaxHighlightedEditorRef,
} from './SyntaxHighlightedEditor';

interface MarkdownEditorProps {
  file: MarkdownFile | null;
  onChange?: (content: string) => void;
  onSave?: (content: string) => void;
  onScroll?: (scrollTop: number, scrollHeight: number, clientHeight: number) => void;
  onCursorPositionChange?: (position: number) => void;
  className?: string;
  readOnly?: boolean;
}

export interface MarkdownEditorRef {
  getScrollElement: () => HTMLElement | null;
}

const MarkdownEditor = forwardRef<MarkdownEditorRef, MarkdownEditorProps>(({
  file,
  onChange,
  onSave,
  onScroll,
  onCursorPositionChange,
  className = '',
  readOnly = false,
}, ref) => {
  const [content, setContent] = useState(file?.content || '');
  const editorRef = useRef<SyntaxHighlightedEditorRef>(null);

  // Expose scroll element for synchronization
  useImperativeHandle(ref, () => ({
    getScrollElement: () => {
      const textarea = editorRef.current?.getTextarea();
      return textarea || null;
    }
  }));

  // Update content when file changes
  useEffect(() => {
    if (file?.content !== undefined) {
      setContent(file.content);
    }
  }, [file?.content]);

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
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
        case 'b':
          e.preventDefault();
          formatText('bold');
          break;
        case 'i':
          e.preventDefault();
          formatText('italic');
          break;
      }
    }

    // Handle tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent =
        content.substring(0, start) + '  ' + content.substring(end);
      handleContentChange(newContent);

      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Format text helper
  const formatText = (format: string, text?: string) => {
    const textarea = editorRef.current?.getTextarea();
    if (!textarea || readOnly) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let insertText = text || '';
    let newCursorPos = start;

    switch (format) {
      case 'bold':
        insertText = selectedText ? `**${selectedText}**` : '**text**';
        newCursorPos = selectedText ? end + 4 : start + 2;
        break;
      case 'italic':
        insertText = selectedText ? `*${selectedText}*` : '*text*';
        newCursorPos = selectedText ? end + 2 : start + 1;
        break;
      case 'code':
        insertText = selectedText ? `\`${selectedText}\`` : '`code`';
        newCursorPos = selectedText ? end + 2 : start + 1;
        break;
      case 'link':
        insertText = selectedText ? `[${selectedText}](url)` : '[text](url)';
        newCursorPos = selectedText ? end + 2 : start + 1;
        break;
      case 'image':
        insertText = selectedText ? `![${selectedText}](url)` : '![alt](url)';
        newCursorPos = selectedText ? end + 3 : start + 2;
        break;
      case 'h1':
      case 'h2':
      case 'h3': {
        // Find the start of the current line
        const beforeCursor = content.substring(0, start);
        const lineStart = beforeCursor.lastIndexOf('\n') + 1;
        const afterCursor = content.substring(end);
        const lineEnd = afterCursor.indexOf('\n');
        const lineEndPos = lineEnd === -1 ? content.length : end + lineEnd;

        const lineText = content.substring(lineStart, lineEndPos);
        const headerPrefix = text || '';
        insertText = `${headerPrefix}${lineText}`;

        const newContent =
          content.substring(0, lineStart) +
          insertText +
          content.substring(lineEndPos);
        handleContentChange(newContent);

        // Set cursor position
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            lineStart + headerPrefix.length;
        }, 0);
        return;
      }
      case 'ul':
      case 'ol':
      case 'quote': {
        // Find the start of the current line
        const beforeCursorPos = content.substring(0, start);
        const lineStartPos = beforeCursorPos.lastIndexOf('\n') + 1;
        const prefix = text || '';

        const newContentWithPrefix =
          content.substring(0, lineStartPos) +
          prefix +
          content.substring(lineStartPos);
        handleContentChange(newContentWithPrefix);

        // Set cursor position
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            lineStartPos + prefix.length;
        }, 0);
        return;
      }
      case 'hr':
        insertText = text || '\n---\n';
        break;
    }

    if (
      format !== 'h1' &&
      format !== 'h2' &&
      format !== 'h3' &&
      format !== 'ul' &&
      format !== 'ol' &&
      format !== 'quote'
    ) {
      const newContent =
        content.substring(0, start) + insertText + content.substring(end);
      handleContentChange(newContent);

      // Set cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectedText
          ? newCursorPos
          : start + insertText.length;
      }, 0);
    }
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Editor Header */}
      {file && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Editing: {file.name}
            </span>
            {readOnly && (
              <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                Read Only
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Ctrl+S to save
            </span>
          </div>
        </div>
      )}

      {/* Editor Toolbar */}
      {file && !readOnly && <EditorToolbar onFormat={formatText} />}

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
          placeholder="Start typing your markdown content..."
          className="flex-1 w-full"
        />
      )}

      {/* No file state */}
      {!file && (
        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-4">✏️</div>
            <h3 className="text-lg font-medium mb-2">
              No file selected for editing
            </h3>
            <p className="text-sm">Select a markdown file to start editing</p>
          </div>
        </div>
      )}
    </div>
  );
});

MarkdownEditor.displayName = 'MarkdownEditor';

export default MarkdownEditor;
