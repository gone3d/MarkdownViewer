import React from 'react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Minus,
} from 'lucide-react';

interface EditorToolbarProps {
  onFormat: (format: string, text?: string) => void;
  className?: string;
}

interface ToolbarButton {
  icon: React.ReactNode;
  label: string;
  format: string;
  text?: string;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onFormat,
  className = '',
}) => {
  const toolbarButtons: ToolbarButton[] = [
    {
      icon: <Bold className="h-4 w-4" />,
      label: 'Bold',
      format: 'bold',
      text: '**text**',
    },
    {
      icon: <Italic className="h-4 w-4" />,
      label: 'Italic',
      format: 'italic',
      text: '*text*',
    },
    {
      icon: <Heading1 className="h-4 w-4" />,
      label: 'Heading 1',
      format: 'h1',
      text: '# ',
    },
    {
      icon: <Heading2 className="h-4 w-4" />,
      label: 'Heading 2',
      format: 'h2',
      text: '## ',
    },
    {
      icon: <Heading3 className="h-4 w-4" />,
      label: 'Heading 3',
      format: 'h3',
      text: '### ',
    },
    {
      icon: <List className="h-4 w-4" />,
      label: 'Bullet List',
      format: 'ul',
      text: '- ',
    },
    {
      icon: <ListOrdered className="h-4 w-4" />,
      label: 'Numbered List',
      format: 'ol',
      text: '1. ',
    },
    {
      icon: <Quote className="h-4 w-4" />,
      label: 'Quote',
      format: 'quote',
      text: '> ',
    },
    {
      icon: <Code className="h-4 w-4" />,
      label: 'Code',
      format: 'code',
      text: '`code`',
    },
    {
      icon: <Link className="h-4 w-4" />,
      label: 'Link',
      format: 'link',
      text: '[text](url)',
    },
    {
      icon: <Image className="h-4 w-4" />,
      label: 'Image',
      format: 'image',
      text: '![alt](url)',
    },
    {
      icon: <Minus className="h-4 w-4" />,
      label: 'Horizontal Rule',
      format: 'hr',
      text: '\n---\n',
    },
  ];

  const handleButtonClick = (button: ToolbarButton) => {
    onFormat(button.format, button.text);
  };

  return (
    <div
      className={`flex items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className}`}
    >
      {toolbarButtons.map((button, index) => (
        <React.Fragment key={button.format}>
          <button
            onClick={() => handleButtonClick(button)}
            className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            title={button.label}
            type="button"
          >
            {button.icon}
          </button>

          {/* Add separators after certain groups */}
          {(index === 1 || index === 4 || index === 6 || index === 8) && (
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default EditorToolbar;
