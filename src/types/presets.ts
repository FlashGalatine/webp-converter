export type DefaultSelection = 'Square' | 'Landscape' | 'Portrait' | '';

export type EditorQualityMode = 'quality' | 'filesize' | 'lossless' | '';
export type EditorResampling = 'bicubic' | 'lanczos' | 'bilinear' | 'nearest' | 'browser' | '';

export interface PresetEditorPreset {
  id: number;
  name: string;
  cropRatio: string;
  maxWidth: string;
  maxHeight: string;
  maxFilesize: string;
  maxFilesizeUnit: 'KB' | 'MB' | 'GB';
  defaultSelection: DefaultSelection;
  // Export settings (new schema)
  resampling: EditorResampling;
  qualityMode: EditorQualityMode;
  quality: string;
  exportMaxFilesizeKb: string;
}

