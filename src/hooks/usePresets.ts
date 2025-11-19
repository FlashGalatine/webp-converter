import { useState, useCallback, useMemo, useEffect } from 'react';
import { BUILT_IN_PRESETS } from '../constants/presets';
import { parseAspectRatio } from '../utils/presets/parser';
import type { CustomPresetsRaw, CustomPresets } from '../types';

export interface UsePresetsReturn {
  useCustomPresets: boolean;
  customPresets: CustomPresets;
  customPresetsRaw: CustomPresetsRaw;
  customPresetsFileName: string;
  currentPresets: typeof BUILT_IN_PRESETS | CustomPresets;
  getCurrentPresets: () => typeof BUILT_IN_PRESETS | CustomPresets;
  loadCustomPresets: (file: File) => void;
  switchToBuiltIn: () => void;
  applyPresetSettings: (presetName: string) => {
    maxWidth: string;
    maxHeight: string;
    targetSize: string;
    webOptimize: boolean;
  };
}

export function usePresets(): UsePresetsReturn {
  const [useCustomPresets, setUseCustomPresets] = useState(false);
  const [customPresets, setCustomPresets] = useState<CustomPresets>({});
  const [customPresetsRaw, setCustomPresetsRaw] = useState<CustomPresetsRaw>({});
  const [customPresetsFileName, setCustomPresetsFileName] = useState('');

  const currentPresets = useMemo(() => {
    return useCustomPresets ? customPresets : BUILT_IN_PRESETS;
  }, [useCustomPresets, customPresets]);

  const getCurrentPresets = useCallback(() => currentPresets, [currentPresets]);

  const loadCustomPresets = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string) as CustomPresetsRaw;
        setCustomPresetsRaw(jsonData);

        // Convert JSON presets to internal format
        const converted: CustomPresets = {};
        for (const [name, config] of Object.entries(jsonData)) {
          if (config['crop-ratio']) {
            converted[name] = parseAspectRatio(config['crop-ratio']);
          } else if (config['max-width'] && config['max-height']) {
            converted[name] = config['max-width'] / config['max-height'];
          } else {
            converted[name] = null;
          }
        }

        setCustomPresets(converted);
        setCustomPresetsFileName(file.name);
        setUseCustomPresets(true);
      } catch (error) {
        alert(`Error loading preset file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
  }, []);

  const switchToBuiltIn = useCallback(() => {
    setUseCustomPresets(false);
    setCustomPresets({});
    setCustomPresetsRaw({});
    setCustomPresetsFileName('');
  }, []);

  const applyPresetSettings = useCallback((presetName: string) => {
    let maxWidth = '';
    let maxHeight = '';
    let targetSize = '10';
    let webOptimize = false;

    if (useCustomPresets && customPresetsRaw[presetName]) {
      const config = customPresetsRaw[presetName];

      if (config['max-width']) {
        maxWidth = config['max-width'].toString();
      }

      if (config['max-height']) {
        maxHeight = config['max-height'].toString();
      }

      if (config['max-filesize']) {
        const size = config['max-filesize'];
        const unit = config['max-filesize-unit'] || 'MB';

        let sizeInMB = size;
        if (unit === 'KB') {
          sizeInMB = size / 1024;
        } else if (unit === 'GB') {
          sizeInMB = size * 1024;
        }

        targetSize = sizeInMB.toString();
        webOptimize = true;
      }
    }

    return { maxWidth, maxHeight, targetSize, webOptimize };
  }, [useCustomPresets, customPresetsRaw]);

  // Auto-load presets.json on mount
  useEffect(() => {
    const loadPresetsFromFile = async () => {
      try {
        const response = await fetch('/presets.json');
        if (response.ok) {
          const jsonData = await response.json() as CustomPresetsRaw;
          setCustomPresetsRaw(jsonData);

          const converted: CustomPresets = {};
          for (const [name, config] of Object.entries(jsonData)) {
            if (config['crop-ratio']) {
              converted[name] = parseAspectRatio(config['crop-ratio']);
            } else if (config['max-width'] && config['max-height']) {
              converted[name] = config['max-width'] / config['max-height'];
            } else {
              converted[name] = null;
            }
          }

          setCustomPresets(converted);
          setUseCustomPresets(true);
          setCustomPresetsFileName('presets.json (auto-loaded)');
        }
      } catch (error) {
        console.log('[Presets] No presets.json found or failed to load, using built-in presets');
      }
    };

    loadPresetsFromFile();
  }, []);

  return {
    useCustomPresets,
    customPresets,
    customPresetsRaw,
    customPresetsFileName,
    currentPresets,
    getCurrentPresets,
    loadCustomPresets,
    switchToBuiltIn,
    applyPresetSettings
  };
}

