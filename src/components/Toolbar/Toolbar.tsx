import React from 'react';
import { Link } from 'react-router-dom';

interface ToolbarProps {
  fileInputRef: React.RefObject<HTMLInputElement>;
  presetFileInputRef: React.RefObject<HTMLInputElement>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPresetFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
}

export default function Toolbar({
  fileInputRef,
  presetFileInputRef,
  onFileSelect,
  onPresetFileSelect,
  onDrop,
  onDragOver
}: ToolbarProps) {
  return (
    <>
      {/* File Selection */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-2 text-gray-300">Load Image(s)</h2>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Select Image(s)
        </button>
        <p className="text-xs text-gray-400 mt-2">
          Single or multiple files • Drag & drop • Ctrl+V to paste
        </p>
      </div>

      {/* Custom Preset Loader */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold text-gray-300">Preset Source</h2>
          <Link to="/preset-editor" className="text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded" title="Create and manage custom presets">
            ⚙️ Preset Editor
          </Link>
        </div>
        <input
          ref={presetFileInputRef}
          type="file"
          accept=".json"
          onChange={onPresetFileSelect}
          className="hidden"
        />
      </div>
    </>
  );
}

