import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { MarkdownFile } from '../types/markdown';

interface MarkdownViewerProps {
  file: MarkdownFile | null;
  className?: string;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ file, className = '' }) => {
  const contentRef = useRef<HTMLElement>(null);

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
        6: '3.75rem'
      };
      
      const currentIndent = indentValues[headerLevel as keyof typeof indentValues];
      
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
  }, [file?.content]);

  if (!file) {
    return (
      <div className={`flex items-center justify-center h-full text-gray-500 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-lg font-medium mb-2">No file selected</h3>
          <p className="text-sm">Choose a markdown file to view its content</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full overflow-auto ${className}`}>
      <div className="max-w-none p-6">
        {/* File Header */}
        <header className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {file.name}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>
              Last modified: {file.lastModified.toLocaleDateString()}
            </span>
            <span>
              Size: {(file.size / 1024).toFixed(1)} KB
            </span>
          </div>
        </header>

        {/* Markdown Content */}
        <article ref={contentRef} className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[
              rehypeHighlight, 
              rehypeRaw, 
              [rehypeSlug, {
                prefix: '',
                slugify: (text: string) => {
                  return text
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                }
              }],
              [rehypeAutolinkHeadings, {
                behavior: 'append',
                properties: {
                  className: ['anchor-link'],
                  ariaLabel: 'Link to section'
                },
                content: {
                  type: 'text',
                  value: ' #'
                }
              }]
            ]}
            components={{
              // Custom link renderer for external links
              a: ({ node, href, ...props }) => {
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
              img: ({ node, alt, src, ...props }) => (
                <img
                  alt={alt}
                  src={src}
                  loading="lazy"
                  className="rounded-lg shadow-md"
                  {...props}
                />
              ),
              // Custom code block renderer
              pre: ({ node, ...props }) => (
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
};

export default MarkdownViewer;