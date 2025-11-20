import React from 'react';
import { FolderOpen } from 'lucide-react';

interface FolderPickerModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Simple app-styled modal before showing browser's folder picker
 */
export const FolderPickerModal: React.FC<FolderPickerModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-sm w-full mx-4 p-6 border border-slate-200 dark:border-slate-700">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <FolderOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-center text-slate-900 dark:text-slate-100 mb-6">
          Open a folder?
        </h2>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors shadow-sm"
          >
            Open Folder
          </button>
        </div>
      </div>
    </div>
  );
};
