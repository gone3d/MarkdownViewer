import { TableOfContentsItem } from '../types/markdown';

class MarkdownService {
  private static instance: MarkdownService;

  public static getInstance(): MarkdownService {
    if (!MarkdownService.instance) {
      MarkdownService.instance = new MarkdownService();
    }
    return MarkdownService.instance;
  }

  public generateTableOfContents(content: string): TableOfContentsItem[] {
    const lines = content.split('\n');
    const tocItems: TableOfContentsItem[] = [];
    const stack: TableOfContentsItem[] = [];

    lines.forEach((line, index) => {
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const text = headerMatch[2].trim();
        const anchor = this.generateAnchor(text);

        const item: TableOfContentsItem = {
          id: `toc-${index}-${anchor}`,
          text,
          level,
          anchor,
          children: [],
        };

        // Handle nesting
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }

        if (stack.length === 0) {
          tocItems.push(item);
        } else {
          if (!stack[stack.length - 1].children) {
            stack[stack.length - 1].children = [];
          }
          stack[stack.length - 1].children!.push(item);
        }

        stack.push(item);
      }
    });

    return tocItems;
  }

  private generateAnchor(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  public addAnchorIds(content: string): string {
    return content.replace(/^(#{1,6})\s+(.+)$/gm, (_match, hashes, text) => {
      const anchor = this.generateAnchor(text.trim());
      return `${hashes} ${text.trim()} {#${anchor}}`;
    });
  }

  public extractFrontmatter(content: string): {
    frontmatter: Record<string, any> | null;
    content: string;
  } {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const frontmatterMatch = content.match(frontmatterRegex);

    if (!frontmatterMatch) {
      return { frontmatter: null, content };
    }

    try {
      // Simple YAML-like parsing (basic implementation)
      const frontmatterText = frontmatterMatch[1];
      const frontmatter: Record<string, any> = {};

      frontmatterText.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();

          // Remove quotes if present
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            frontmatter[key] = value.slice(1, -1);
          } else if (value === 'true' || value === 'false') {
            frontmatter[key] = value === 'true';
          } else if (!isNaN(Number(value))) {
            frontmatter[key] = Number(value);
          } else {
            frontmatter[key] = value;
          }
        }
      });

      return {
        frontmatter,
        content: frontmatterMatch[2],
      };
    } catch (error) {
      console.warn('Failed to parse frontmatter:', error);
      return { frontmatter: null, content };
    }
  }

  public getWordCount(content: string): number {
    return content
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]+`/g, '') // Remove inline code
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/[^\w\s]/g, ' ') // Replace non-word characters with space
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  }

  public getReadingTime(content: string): number {
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = this.getWordCount(content);
    return Math.ceil(wordCount / wordsPerMinute);
  }

  public extractImages(content: string): string[] {
    const imageRegex = /!\[.*?\]\(([^)]+)\)/g;
    const images: string[] = [];
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      images.push(match[1]);
    }

    return images;
  }

  public extractLinks(content: string): Array<{ text: string; url: string }> {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links: Array<{ text: string; url: string }> = [];
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      links.push({ text: match[1], url: match[2] });
    }

    return links;
  }
}

export default MarkdownService;
