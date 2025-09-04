import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { parseMarkdown } from '../utils/markdownParser';

interface SyntaxHighlightedEditorProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
}

export interface SyntaxHighlightedEditorRef {
  getTextarea: () => HTMLTextAreaElement | null;
  focus: () => void;
}

/**
 * Syntax highlighted editor using contentEditable approach
 * - Direct HTML styling for syntax highlighting
 * - Simpler architecture with better performance
 * - Native text editing capabilities
 */
const SyntaxHighlightedEditor = forwardRef<SyntaxHighlightedEditorRef, SyntaxHighlightedEditorProps>(
  ({ value, onChange, onKeyDown, readOnly = false, placeholder = '', className = '' }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);

    // Expose textarea ref and methods
    useImperativeHandle(ref, () => ({
      getTextarea: () => textareaRef.current,
      focus: () => textareaRef.current?.focus(),
    }));

    // Synchronize scroll between textarea and highlight div
    const handleScroll = () => {
      if (textareaRef.current && highlightRef.current) {
        highlightRef.current.scrollTop = textareaRef.current.scrollTop;
        highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
      }
    };

    // Apply syntax highlighting to content
    const getHighlightedContent = (content: string): string => {
      if (!content) return '';

      try {
        const tokens = parseMarkdown(content);
        
        // Filter overlapping tokens
        const filteredTokens = filterOverlappingTokens(tokens);
        
        let result = '';
        let lastIndex = 0;
        
        for (const token of filteredTokens) {
          // Add text before this token (if any)
          if (token.start > lastIndex) {
            const beforeText = content.substring(lastIndex, token.start);
            result += escapeHtml(beforeText);
          }
          
          // Add the highlighted token
          const tokenContent = escapeHtml(token.content);
          const cssClass = `md-${token.type}`;
          result += `<span class="${cssClass}">${tokenContent}</span>`;
          
          lastIndex = token.end;
        }
        
        // Add any remaining text
        if (lastIndex < content.length) {
          result += escapeHtml(content.substring(lastIndex));
        }
        
        // Add a final newline to match textarea behavior
        result += '\n';
        
        return result;
      } catch (error) {
        console.warn('Syntax highlighting error:', error);
        return escapeHtml(content);
      }
    };

    return (
      <div className={`syntax-highlighted-editor ${className}`}>
        {/* Syntax highlighting backdrop */}
        <div
          ref={highlightRef}
          className="syntax-highlight-backdrop"
          dangerouslySetInnerHTML={{
            __html: getHighlightedContent(value)
          }}
        />
        
        {/* Actual textarea for input */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onScroll={handleScroll}
          readOnly={readOnly}
          placeholder={placeholder}
          className="syntax-editor-textarea"
          spellCheck={false}
        />
      </div>
    );
  }
);

SyntaxHighlightedEditor.displayName = 'SyntaxHighlightedEditor';

/**
 * Filter out overlapping tokens, keeping the most specific ones
 */
function filterOverlappingTokens(tokens: any[]): any[] {
  const sorted = [...tokens].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return (a.end - a.start) - (b.end - b.start);
  });
  
  const filtered: any[] = [];
  
  for (const token of sorted) {
    const hasOverlap = filtered.some(existing => 
      !(token.end <= existing.start || token.start >= existing.end)
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

export default SyntaxHighlightedEditor;