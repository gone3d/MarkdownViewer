import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropDownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean; // Add a divider line after this item
}

interface DropDownProps {
  trigger: {
    label: string;
    icon?: React.ReactNode;
    className?: string;
  };
  items: DropDownItem[];
  align?: 'left' | 'right';
  className?: string;
}

const DropDown: React.FC<DropDownProps> = ({ 
  trigger, 
  items, 
  align = 'left',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item: DropDownItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  const alignmentClasses = align === 'right' 
    ? 'right-0 origin-top-right' 
    : 'left-0 origin-top-left';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={handleTriggerClick}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium
          ${trigger.className || 'bg-primary-600 hover:bg-primary-700 text-white'}
        `}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger.icon}
        <span>{trigger.label}</span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 z-10 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Items */}
          <div
            className={`
              absolute z-20 mt-2 w-56 rounded-lg shadow-lg
              bg-white dark:bg-gray-800 
              border border-gray-200 dark:border-gray-700
              ring-1 ring-black ring-opacity-5
              focus:outline-none
              ${alignmentClasses}
            `}
            role="menu"
            aria-orientation="vertical"
          >
            <div className="py-1">
              {items.map((item, index) => (
                <React.Fragment key={item.id}>
                  <button
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                    className={`
                      w-full text-left px-4 py-2 text-sm flex items-center gap-3
                      transition-colors duration-150
                      ${item.disabled
                        ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                      }
                      ${index === 0 ? 'rounded-t-lg' : ''}
                      ${index === items.length - 1 ? 'rounded-b-lg' : ''}
                    `}
                    role="menuitem"
                  >
                    {item.icon && (
                      <span className="flex-shrink-0 w-4 h-4">
                        {item.icon}
                      </span>
                    )}
                    <span className="flex-grow">{item.label}</span>
                  </button>
                  
                  {/* Divider */}
                  {item.divider && index < items.length - 1 && (
                    <div className="border-t border-gray-200 dark:border-gray-600 my-1" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DropDown;