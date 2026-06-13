// ============================================================
// useCompression hook
//
// Manages the compression state: input, output, token counts,
// and triggers the learning engine on each compression.
// ============================================================

import { useState, useCallback } from 'react';
import { compress, getDefaultEnabledRules } from '../utils/compressionEngine';
import { estimateTokens, calcReduction } from '../utils/tokenEstimator';
import { analyzeAndLearn, getApprovedRules } from '../utils/learningEngine';
import type { CompressionResult, AppSettings } from '../types';

interface UseCompressionReturn {
  input: string;
  setInput: (text: string) => void;
  result: CompressionResult | null;
  isCompressing: boolean;
  error: string | null;
  handleCompress: () => void;
  handleClear: () => void;
  loadExample: (prompt: string) => void;
}

export function useCompression(settings: AppSettings): UseCompressionReturn {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompress = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter a prompt to compress.');
      return;
    }

    setError(null);
    setIsCompressing(true);

    try {
      // Build the set of enabled rule IDs from settings
      const enabledRuleIds = getDefaultEnabledRules();
      for (const disabledId of settings.disabledBuiltinRules) {
        enabledRuleIds.delete(disabledId);
      }

      // Get approved learned rules
      const learnedRules = getApprovedRules();

      // Run compression
      const { result: compressed, appliedRules } = compress(input, {
        enabledRuleIds,
        customFillerPhrases: settings.customFillerPhrases,
        learnedRules,
      });

      // Calculate token metrics
      const originalTokens = estimateTokens(input);
      const compressedTokens = estimateTokens(compressed);
      const reductionPercent = calcReduction(originalTokens, compressedTokens);

      setResult({
        original: input,
        compressed,
        originalTokens,
        compressedTokens,
        reductionPercent,
        appliedRules,
      });

      // Feed into learning engine if enabled
      if (settings.enableLearning) {
        analyzeAndLearn(input, settings.minOccurrencesBeforeLearn);
      }
    } catch (err) {
      setError(`Compression failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsCompressing(false);
    }
  }, [input, settings]);

  const handleClear = useCallback(() => {
    setInput('');
    setResult(null);
    setError(null);
  }, []);

  const loadExample = useCallback((prompt: string) => {
    setInput(prompt);
    setResult(null);
    setError(null);
  }, []);

  return {
    input,
    setInput,
    result,
    isCompressing,
    error,
    handleCompress,
    handleClear,
    loadExample,
  };
}
