// ============================================================
// Settings management — persists user preferences to localStorage
// ============================================================

import type { AppSettings } from '../types';

const STORAGE_KEY = 'promptCompressor:settings';

/** Default application settings */
export const DEFAULT_SETTINGS: AppSettings = {
  enableLearning: true,
  autoApplySafeRules: true,
  minOccurrencesBeforeLearn: 3,
  showTokenEstimates: true,
  theme: 'system',
  customFillerPhrases: [],
  disabledBuiltinRules: [],
};

/** Loads settings from localStorage, merging with defaults */
export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const stored = JSON.parse(raw);
    // Merge with defaults so new settings keys are always present
    return { ...DEFAULT_SETTINGS, ...stored };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** Saves settings to localStorage */
export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Could not save settings to localStorage:', e);
  }
}
