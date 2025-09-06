import React, { useEffect, useRef, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { MarkdownFile } from '../types/markdown';
import { precomputeHeaderIds } from '../utils/slugify';

interface MarkdownViewerProps {
  file: MarkdownFile | null;
  className?: string;
  headerIds?: Map<string, string>;
  onScroll?: (scrollTop: number, scrollHeight: number, clientHeight: number) => void;
}

export interface MarkdownViewerRef {
  getScrollElement: () => HTMLElement | null;
}

const MarkdownViewer = forwardRef<MarkdownViewerRef, MarkdownViewerProps>(({
  file,
  className = '',
  headerIds,
  onScroll,
}, ref) => {
  const contentRef = useRef<HTMLElement>(null);

  // Expose scroll element for synchronization
  useImperativeHandle(ref, () => ({
    getScrollElement: () => contentRef.current
  }));

  // Helper to extract text from React children
  const extractTextFromChildren = useCallback((children: any): string => {
    if (typeof children === 'string') return children;
    if (Array.isArray(children))
      return children.map(extractTextFromChildren).join('');
    if (children?.props?.children)
      return extractTextFromChildren(children.props.children);
    return '';
  }, []);

  // Pre-compute or use provided header IDs
  const idMap = useMemo(() => {
    return (
      headerIds ||
      (file?.content ? precomputeHeaderIds(file.content) : new Map())
    );
  }, [file?.content, headerIds]);

  // Memoize the custom header components to prevent double renders
  const headerComponents = useMemo(
    () => ({
      h1: ({ children, ...props }: any) => {
        const text = extractTextFromChildren(children);
        const id = idMap.get(text) || text.toLowerCase().replace(/\s+/g, '-');
        return (
          <h1 id={id} {...props}>
            {children}
            <a
              href={`#${id}`}
              className="anchor-link"
              aria-label="Link to section"
            >
              {' '}
              #
            </a>
          </h1>
        );
      },
      h2: ({ children, ...props }: any) => {
        const text = extractTextFromChildren(children);
        const id = idMap.get(text) || text.toLowerCase().replace(/\s+/g, '-');
        return (
          <h2 id={id} {...props}>
            {children}
            <a
              href={`#${id}`}
              className="anchor-link"
              aria-label="Link to section"
            >
              {' '}
              #
            </a>
          </h2>
        );
      },
      h3: ({ children, ...props }: any) => {
        const text = extractTextFromChildren(children);
        const id = idMap.get(text) || text.toLowerCase().replace(/\s+/g, '-');
        return (
          <h3 id={id} {...props}>
            {children}
            <a
              href={`#${id}`}
              className="anchor-link"
              aria-label="Link to section"
            >
              {' '}
              #
            </a>
          </h3>
        );
      },
      h4: ({ children, ...props }: any) => {
        const text = extractTextFromChildren(children);
        const id = idMap.get(text) || text.toLowerCase().replace(/\s+/g, '-');
        return (
          <h4 id={id} {...props}>
            {children}
            <a
              href={`#${id}`}
              className="anchor-link"
              aria-label="Link to section"
            >
              {' '}
              #
            </a>
          </h4>
        );
      },
      h5: ({ children, ...props }: any) => {
        const text = extractTextFromChildren(children);
        const id = idMap.get(text) || text.toLowerCase().replace(/\s+/g, '-');
        return (
          <h5 id={id} {...props}>
            {children}
            <a
              href={`#${id}`}
              className="anchor-link"
              aria-label="Link to section"
            >
              {' '}
              #
            </a>
          </h5>
        );
      },
      h6: ({ children, ...props }: any) => {
        const text = extractTextFromChildren(children);
        const id = idMap.get(text) || text.toLowerCase().replace(/\s+/g, '-');
        return (
          <h6 id={id} {...props}>
            {children}
            <a
              href={`#${id}`}
              className="anchor-link"
              aria-label="Link to section"
            >
              {' '}
              #
            </a>
          </h6>
        );
      },
    }),
    [idMap, extractTextFromChildren]
  );

  // Apply progressive indentation after content is rendered
  useEffect(() => {
    if (!contentRef.current || !file) return;

    const content = contentRef.current;

    const headers = content.querySelectorAll('h1, h2, h3, h4, h5, h6');

    headers.forEach((header, index) => {
      const headerLevel = parseInt(header.tagName.charAt(1));
      const indentValues = {
        1: '0',
        2: '0.75rem',
        3: '1.5rem',
        4: '2.25rem',
        5: '3rem',
        6: '3.75rem',
      };

      const currentIndent =
        indentValues[headerLevel as keyof typeof indentValues];

      // Find the next header to know where this section ends
      const nextHeader = headers[index + 1];

      // Get all elements between this header and the next header
      let currentElement = header.nextElementSibling;
      const sectionElements: Element[] = [];

      while (currentElement && currentElement !== nextHeader) {
        if (currentElement.tagName.match(/^H[1-6]$/)) {
          break; // Stop at any header
        }
        sectionElements.push(currentElement);
        currentElement = currentElement.nextElementSibling;
      }

      // Apply the same indentation to all elements in this section
      sectionElements.forEach(element => {
        (element as HTMLElement).style.paddingLeft = currentIndent;
      });
    });
  }, [file?.content, file]);

  if (!file) {
    return (
      <div
        className={`flex items-center justify-center h-full text-gray-500 ${className}`}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-lg font-medium mb-2">No file selected</h3>
          <p className="text-sm">Choose a markdown file to view its content</p>
        </div>
      </div>
    );
  }

  // Handle scroll events
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (onScroll) {
      const target = e.currentTarget;
      onScroll(target.scrollTop, target.scrollHeight, target.clientHeight);
    }
  };

  return (
    <div className={`h-full overflow-auto ${className}`} onScroll={handleScroll}>
      <div className="max-w-none p-6">
        {/* File Header */}
        <header className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {file.name}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Last modified: {file.lastModified.toLocaleDateString()}</span>
            <span>Size: {(file.size / 1024).toFixed(1)} KB</span>
          </div>
        </header>

        {/* Markdown Content */}
        <article ref={contentRef} className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            components={{
              // Use memoized header components
              ...headerComponents,
              // Custom link renderer for external links
              a: ({ href, ...props }) => {
                const isExternal = href && href.startsWith('http');
                return (
                  <a
                    href={href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    {...props}
                  />
                );
              },
              // Custom image renderer with lazy loading
              img: ({ alt, src, ...props }) => (
                <img
                  alt={alt}
                  src={src}
                  loading="lazy"
                  className="rounded-lg shadow-md"
                  {...props}
                />
              ),
              // Custom code block renderer
              pre: ({ ...props }) => (
                <pre className="relative overflow-x-auto" {...props} />
              ),
            }}
          >
            {file.content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
});

MarkdownViewer.displayName = 'MarkdownViewer';

export default MarkdownViewer;
