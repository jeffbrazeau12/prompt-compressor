// ============================================================
// useSettings hook
//
// Loads and persists app settings to localStorage.
// ============================================================

import { useState, useCallback } from 'react';
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from '../utils/settings';
import type { AppSettings } from '../types';

interface UseSettingsReturn {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
  addCustomPhrase: (phrase: string) => void;
  removeCustomPhrase: (phrase: string) => void;
  toggleBuiltinRule: (ruleId: string) => void;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    saveSettings(DEFAULT_SETTINGS);
    setSettings({ ...DEFAULT_SETTINGS });
  }, []);

  const addCustomPhrase = useCallback((phrase: string) => {
    const trimmed = phrase.trim().toLowerCase();
    if (!trimmed) return;
    setSettings(prev => {
      if (prev.customFillerPhrases.includes(trimmed)) return prev;
      const next = {
        ...prev,
        customFillerPhrases: [...prev.customFillerPhrases, trimmed],
      };
      saveSettings(next);
      return next;
    });
  }, []);

  const removeCustomPhrase = useCallback((phrase: string) => {
    setSettings(prev => {
      const next = {
        ...prev,
        customFillerPhrases: prev.customFillerPhrases.filter(p => p !== phrase),
      };
      saveSettings(next);
      return next;
    });
  }, []);

  const toggleBuiltinRule = useCallback((ruleId: string) => {
    setSettings(prev => {
      const disabled = prev.disabledBuiltinRules.includes(ruleId)
        ? prev.disabledBuiltinRules.filter(id => id !== ruleId)
        : [...prev.disabledBuiltinRules, ruleId];
      const next = { ...prev, disabledBuiltinRules: disabled };
      saveSettings(next);
      return next;
    });
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
    addCustomPhrase,
    removeCustomPhrase,
    toggleBuiltinRule,
  };
}
