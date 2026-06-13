// ============================================================
// useLearnedRules hook
//
// Manages learned rule state with CRUD operations.
// ============================================================

import { useState, useCallback } from 'react';
import {
  getLearnedRules,
  approveRule,
  rejectRule,
  deleteRule,
  updateRuleReplacement,
  resetAllLearning,
  getPendingRuleCount,
} from '../utils/learningEngine';
import type { LearnedRule } from '../types';

interface UseLearnedRulesReturn {
  rules: LearnedRule[];
  pendingCount: number;
  handleApprove: (id: string) => void;
  handleReject: (id: string) => void;
  handleDelete: (id: string) => void;
  handleUpdateReplacement: (id: string, replacement: string) => void;
  handleReset: () => void;
  refresh: () => void;
}

export function useLearnedRules(): UseLearnedRulesReturn {
  const [rules, setRules] = useState<LearnedRule[]>(() => getLearnedRules());

  const refresh = useCallback(() => {
    setRules(getLearnedRules());
  }, []);

  const handleApprove = useCallback((id: string) => {
    approveRule(id);
    refresh();
  }, [refresh]);

  const handleReject = useCallback((id: string) => {
    rejectRule(id);
    refresh();
  }, [refresh]);

  const handleDelete = useCallback((id: string) => {
    deleteRule(id);
    refresh();
  }, [refresh]);

  const handleUpdateReplacement = useCallback((id: string, replacement: string) => {
    updateRuleReplacement(id, replacement);
    refresh();
  }, [refresh]);

  const handleReset = useCallback(() => {
    if (window.confirm('Reset all learned data? This cannot be undone.')) {
      resetAllLearning();
      refresh();
    }
  }, [refresh]);

  const pendingCount = rules.filter(r => r.status === 'pending').length;

  return {
    rules,
    pendingCount,
    handleApprove,
    handleReject,
    handleDelete,
    handleUpdateReplacement,
    handleReset,
    refresh,
  };
}
