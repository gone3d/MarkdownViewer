import React, { useEffect, useRef, useState } from 'react';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { search, searchKeymap } from '@codemirror/search';
import { autocompletion } from '@codemirror/autocomplete';
import { MarkdownFile } from '../types/markdown';
import { useTheme } from '../hooks/useTheme';
import EditorToolbar from './EditorToolbar';

interface MarkdownEditorProps {
  file: MarkdownFile | null;
  onChange?: (content: string) => void;
  onSave?: (content: string) => void;
  className?: string;
  readOnly?: boolean;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  file,
  onChange,
  onSave,
  className = '',
  readOnly = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { actualTheme } = useTheme();

  // Initialize CodeMirror
  useEffect(() => {
    if (!editorRef.current) return;

    const extensions = [
      // Language support
      markdown(),
      
      // Key bindings
      keymap.of([
        ...defaultKeymap,
        ...searchKeymap,
        indentWithTab,
        {
          key: 'Mod-s',
          preventDefault: true,
          run: () => {
            if (onSave && file) {
              const content = viewRef.current?.state.doc.toString() || '';
              onSave(content);
            }
            return true;
          },
        },
      ]),
      
      // Features
      search(),
      autocompletion(),
      
      // Line wrapping
      EditorView.lineWrapping,
      
      // Syntax highlighting using reference color palette
      syntaxHighlighting(HighlightStyle.define([
        // Headers - RED text for headers/titles (like reference image)
        { tag: tags.heading1, color: actualTheme === 'dark' ? '#ff6b6b' : '#d73a49', fontSize: '1.5em', fontWeight: 'bold' },
        { tag: tags.heading2, color: actualTheme === 'dark' ? '#ff6b6b' : '#d73a49', fontSize: '1.3em', fontWeight: 'bold' },
        { tag: tags.heading3, color: actualTheme === 'dark' ? '#ff6b6b' : '#d73a49', fontSize: '1.1em', fontWeight: 'bold' },
        { tag: tags.heading4, color: actualTheme === 'dark' ? '#ff6b6b' : '#d73a49', fontWeight: 'bold' },
        { tag: tags.heading5, color: actualTheme === 'dark' ? '#ff6b6b' : '#d73a49', fontWeight: 'bold' },
        { tag: tags.heading6, color: actualTheme === 'dark' ? '#ff6b6b' : '#d73a49', fontWeight: 'bold' },
        
        // Text formatting - Regular text in white/dark gray
        { tag: tags.strong, color: actualTheme === 'dark' ? '#f0f6fc' : '#24292e', fontWeight: 'bold' },
        { tag: tags.emphasis, color: actualTheme === 'dark' ? '#f0f6fc' : '#24292e', fontStyle: 'italic' },
        { tag: tags.strikethrough, color: actualTheme === 'dark' ? '#8b949e' : '#6a737d', textDecoration: 'line-through' },
        
        // Links - Keep some color variation
        { tag: tags.link, color: actualTheme === 'dark' ? '#58a6ff' : '#0969da', textDecoration: 'underline' },
        { tag: tags.url, color: actualTheme === 'dark' ? '#58a6ff' : '#0969da' },
        
        // Code - GREEN with no background (matching reference)
        { tag: tags.monospace, color: actualTheme === 'dark' ? '#7ee787' : '#22863a' },
        
        // Formatting characters - GREEN (###, **, -, etc.)
        { tag: tags.punctuation, color: actualTheme === 'dark' ? '#7ee787' : '#22863a' },
        { tag: tags.operator, color: actualTheme === 'dark' ? '#7ee787' : '#22863a' },
        { tag: tags.meta, color: actualTheme === 'dark' ? '#7ee787' : '#22863a' },
        { tag: tags.processingInstruction, color: actualTheme === 'dark' ? '#7ee787' : '#22863a' },
        { tag: tags.definition, color: actualTheme === 'dark' ? '#7ee787' : '#22863a' },
        { tag: tags.modifier, color: actualTheme === 'dark' ? '#7ee787' : '#22863a' },
        { tag: tags.special, color: actualTheme === 'dark' ? '#7ee787' : '#22863a' },
        
        // Quotes - Slightly dimmed
        { tag: tags.quote, color: actualTheme === 'dark' ? '#8b949e' : '#6a737d', fontStyle: 'italic' },
        
        // List content - GRAY text (not green)
        { tag: tags.list, color: actualTheme === 'dark' ? '#d1d5db' : '#374151' },
        
        // Other syntax elements
        { tag: tags.keyword, color: actualTheme === 'dark' ? '#7ee787' : '#22863a' },
        { tag: tags.string, color: actualTheme === 'dark' ? '#f0f6fc' : '#24292e' },
        { tag: tags.comment, color: actualTheme === 'dark' ? '#8b949e' : '#6a737d', fontStyle: 'italic' },
        { tag: tags.number, color: actualTheme === 'dark' ? '#79c0ff' : '#0969da' },
        { tag: tags.tagName, color: actualTheme === 'dark' ? '#7ee787' : '#22863a' },
        { tag: tags.attributeName, color: actualTheme === 'dark' ? '#7ee787' : '#22863a' },
        { tag: tags.variableName, color: actualTheme === 'dark' ? '#ffa657' : '#e36209' },
        
        // Additional markdown-specific formatting tags
        { tag: tags.atom, color: actualTheme === 'dark' ? '#7ee787' : '#22863a' },
        { tag: tags.bool, color: actualTheme === 'dark' ? '#7ee787' : '#22863a' },
        { tag: tags.labelName, color: actualTheme === 'dark' ? '#7ee787' : '#22863a' },
        { tag: tags.bracket, color: actualTheme === 'dark' ? '#7ee787' : '#22863a' },
        { tag: tags.paren, color: actualTheme === 'dark' ? '#7ee787' : '#22863a' },
        { tag: tags.brace, color: actualTheme === 'dark' ? '#7ee787' : '#22863a' },
        { tag: tags.separator, color: actualTheme === 'dark' ? '#7ee787' : '#22863a' },
      ])),
      
      // Additional theme styling for markdown formatting consistency
      EditorView.theme({
        // Base text styling - White/dark gray per reference
        '.cm-content': {
          color: actualTheme === 'dark' ? '#f0f6fc' : '#24292e',
        },
        
        // Force green colors for all markdown formatting characters
        '.cm-formatting': {
          color: actualTheme === 'dark' ? '#7ee787 !important' : '#22863a !important',
        },
        '.cm-formatting-header': {
          color: actualTheme === 'dark' ? '#7ee787 !important' : '#22863a !important',
        },
        '.cm-formatting-list': {
          color: actualTheme === 'dark' ? '#7ee787 !important' : '#22863a !important',
        },
        '.cm-formatting-strong': {
          color: actualTheme === 'dark' ? '#7ee787 !important' : '#22863a !important',
        },
        '.cm-formatting-em': {
          color: actualTheme === 'dark' ? '#7ee787 !important' : '#22863a !important',
        },
        '.cm-formatting-code': {
          color: actualTheme === 'dark' ? '#7ee787 !important' : '#22863a !important',
        },
        '.cm-formatting-quote': {
          color: actualTheme === 'dark' ? '#7ee787 !important' : '#22863a !important',
        },
        
        // Markdown-specific syntax highlighting
        '.cm-header': { 
          color: actualTheme === 'dark' ? '#58a6ff' : '#005cc5', 
          fontWeight: 'bold' 
        },
        '.cm-header.cm-header-1': { fontSize: '1.5em' },
        '.cm-header.cm-header-2': { fontSize: '1.3em' },
        '.cm-header.cm-header-3': { fontSize: '1.1em' },
        '.cm-strong': { 
          fontWeight: 'bold',
          color: actualTheme === 'dark' ? '#f0f6fc' : '#24292e'
        },
        '.cm-emphasis': { 
          fontStyle: 'italic',
          color: actualTheme === 'dark' ? '#f0f6fc' : '#24292e'
        },
        '.cm-strikethrough': { 
          textDecoration: 'line-through',
          color: actualTheme === 'dark' ? '#8b949e' : '#6a737d'
        },
        '.cm-link': { 
          color: actualTheme === 'dark' ? '#58a6ff' : '#005cc5',
          textDecoration: 'underline'
        },
        '.cm-url': { 
          color: actualTheme === 'dark' ? '#58a6ff' : '#005cc5'
        },
        '.cm-monospace': { 
          color: actualTheme === 'dark' ? '#7ee787' : '#22863a',
          fontFamily: 'JetBrains Mono, Consolas, monospace'
        },
        '.cm-quote': { 
          color: actualTheme === 'dark' ? '#8b949e' : '#6a737d',
          fontStyle: 'italic'
        },
        '.cm-list': { 
          color: actualTheme === 'dark' ? '#ff7b72' : '#d73a49'
        },
        '.cm-hr': { 
          color: actualTheme === 'dark' ? '#8b949e' : '#6a737d'
        },
        
        // Generic syntax elements that might be present
        '.cm-keyword': { color: actualTheme === 'dark' ? '#ff7b72' : '#d73a49' },
        '.cm-string': { color: actualTheme === 'dark' ? '#a5d6ff' : '#032f62' },
        '.cm-comment': { color: actualTheme === 'dark' ? '#8b949e' : '#6a737d', fontStyle: 'italic' },
        '.cm-number': { color: actualTheme === 'dark' ? '#79c0ff' : '#005cc5' },
        '.cm-operator': { color: actualTheme === 'dark' ? '#ff7b72' : '#d73a49' },
        '.cm-punctuation': { color: actualTheme === 'dark' ? '#f0f6fc' : '#6f42c1' },
        '.cm-meta': { color: actualTheme === 'dark' ? '#ffa657' : '#735c0f' },
        '.cm-tag': { color: actualTheme === 'dark' ? '#7ee787' : '#22863a' },
        '.cm-attribute': { color: actualTheme === 'dark' ? '#f0f6fc' : '#6f42c1' },
        '.cm-variable': { color: actualTheme === 'dark' ? '#ffa657' : '#e36209' },
      }),
      
      // Read-only mode
      EditorState.readOnly.of(readOnly),
      
      // Change handler
      EditorView.updateListener.of((update) => {
        if (update.docChanged && onChange && !readOnly) {
          const content = update.state.doc.toString();
          onChange(content);
        }
      }),
    ];

    const initialContent = file?.content || '';
    
    const state = EditorState.create({
      doc: initialContent,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;
    setIsReady(true);

    return () => {
      view.destroy();
      viewRef.current = null;
      setIsReady(false);
    };
  }, [actualTheme, readOnly]); // Recreate when theme or readOnly changes

  // Update content when file changes
  useEffect(() => {
    if (!viewRef.current || !file || !isReady) return;

    const currentContent = viewRef.current.state.doc.toString();
    if (currentContent !== file.content) {
      const transaction = viewRef.current.state.update({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: file.content,
        },
      });
      viewRef.current.dispatch(transaction);
    }
  }, [file?.content, isReady]);

  // Focus management
  const focusEditor = () => {
    if (viewRef.current && !readOnly) {
      viewRef.current.focus();
    }
  };

  // Format text helper
  const formatText = (format: string, text?: string) => {
    if (!viewRef.current || readOnly) return;

    const editor = viewRef.current;
    const state = editor.state;
    const selection = state.selection.main;
    const selectedText = state.doc.sliceString(selection.from, selection.to);
    
    let insertText = text || '';
    let newCursorPos = selection.from;

    switch (format) {
      case 'bold':
        insertText = selectedText ? `**${selectedText}**` : '**text**';
        newCursorPos = selectedText ? selection.to + 4 : selection.from + 2;
        break;
      case 'italic':
        insertText = selectedText ? `*${selectedText}*` : '*text*';
        newCursorPos = selectedText ? selection.to + 2 : selection.from + 1;
        break;
      case 'code':
        insertText = selectedText ? `\`${selectedText}\`` : '`code`';
        newCursorPos = selectedText ? selection.to + 2 : selection.from + 1;
        break;
      case 'link':
        insertText = selectedText ? `[${selectedText}](url)` : '[text](url)';
        newCursorPos = selectedText ? selection.to + 2 : selection.from + 1;
        break;
      case 'image':
        insertText = selectedText ? `![${selectedText}](url)` : '![alt](url)';
        newCursorPos = selectedText ? selection.to + 3 : selection.from + 2;
        break;
      case 'h1':
      case 'h2':
      case 'h3':
        const lineStart = state.doc.lineAt(selection.from).from;
        const lineEnd = state.doc.lineAt(selection.from).to;
        const lineText = state.doc.sliceString(lineStart, lineEnd);
        const headerPrefix = text || '';
        insertText = `${headerPrefix}${lineText}`;
        
        // Replace the entire line
        const transaction = state.update({
          changes: { from: lineStart, to: lineEnd, insert: insertText },
          selection: { anchor: lineStart + headerPrefix.length }
        });
        editor.dispatch(transaction);
        return;
      case 'ul':
      case 'ol':
      case 'quote':
        const lineStartPos = state.doc.lineAt(selection.from).from;
        const prefix = text || '';
        const transaction2 = state.update({
          changes: { from: lineStartPos, insert: prefix },
          selection: { anchor: lineStartPos + prefix.length }
        });
        editor.dispatch(transaction2);
        return;
      case 'hr':
        insertText = text || '\n---\n';
        break;
    }

    if (format !== 'h1' && format !== 'h2' && format !== 'h3' && format !== 'ul' && format !== 'ol' && format !== 'quote') {
      const transaction = state.update({
        changes: { from: selection.from, to: selection.to, insert: insertText },
        selection: { anchor: selectedText ? newCursorPos : selection.from + insertText.length }
      });
      editor.dispatch(transaction);
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
      {file && !readOnly && (
        <EditorToolbar onFormat={formatText} />
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        className="flex-1 overflow-hidden"
        onClick={focusEditor}
      />

      {/* No file state */}
      {!file && (
        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-4">✏️</div>
            <h3 className="text-lg font-medium mb-2">No file selected for editing</h3>
            <p className="text-sm">Select a markdown file to start editing</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;