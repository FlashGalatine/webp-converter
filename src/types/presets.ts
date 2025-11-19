export type DefaultSelection = 'Square' | 'Landscape' | 'Portrait' | '';

export interface PresetEditorPreset {
  id: number;
  name: string;
  cropRatio: string;
  maxWidth: string;
  maxHeight: string;
  maxFilesize: string;
  maxFilesizeUnit: 'KB' | 'MB' | 'GB';
  defaultSelection: DefaultSelection;
}

