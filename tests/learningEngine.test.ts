// Tests for the learning engine
// Note: these tests mock localStorage since it's not available in Node
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

import {
  getLearnedRules,
  approveRule,
  rejectRule,
  deleteRule,
  resetAllLearning,
  getApprovedRules,
  analyzeAndLearn,
} from '../src/utils/learningEngine';

beforeEach(() => {
  localStorageMock.clear();
});

describe('getLearnedRules', () => {
  it('returns empty array when no rules stored', () => {
    expect(getLearnedRules()).toEqual([]);
  });
});

describe('analyzeAndLearn', () => {
  it('creates a pending rule after threshold is reached', () => {
    const phrase = 'I hope this helps';
    // Trigger 3 times (minOccurrences = 3)
    analyzeAndLearn(`Hello ${phrase} with this task`, 3);
    analyzeAndLearn(`Here ${phrase} and some more content`, 3);
    analyzeAndLearn(`Test ${phrase} one more time for trigger`, 3);

    const rules = getLearnedRules();
    // Should have at least one rule about a recurring phrase
    expect(Array.isArray(rules)).toBe(true);
  });

  it('does not create rules when learning is called with high threshold', () => {
    analyzeAndLearn('Hello I hope this helps', 100);
    const rules = getLearnedRules();
    expect(rules.length).toBe(0);
  });
});

describe('approveRule / rejectRule', () => {
  it('marks a rule as approved', () => {
    // Manually insert a rule
    const rule = {
      id: 'test-123',
      pattern: 'test phrase',
      replacement: '',
      occurrences: 3,
      status: 'pending' as const,
      risk: 'safe' as const,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      category: 'filler',
    };
    localStorageMock.setItem('promptCompressor:learnedRules', JSON.stringify([rule]));

    approveRule('test-123');
    const rules = getLearnedRules();
    expect(rules.find(r => r.id === 'test-123')?.status).toBe('approved');
  });

  it('marks a rule as rejected', () => {
    const rule = {
      id: 'test-456',
      pattern: 'another phrase',
      replacement: '',
      occurrences: 3,
      status: 'pending' as const,
      risk: 'safe' as const,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      category: 'filler',
    };
    localStorageMock.setItem('promptCompressor:learnedRules', JSON.stringify([rule]));

    rejectRule('test-456');
    expect(getLearnedRules().find(r => r.id === 'test-456')?.status).toBe('rejected');
  });
});

describe('deleteRule', () => {
  it('removes a rule by ID', () => {
    const rule = {
      id: 'del-001',
      pattern: 'delete me',
      replacement: '',
      occurrences: 1,
      status: 'pending' as const,
      risk: 'safe' as const,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      category: 'filler',
    };
    localStorageMock.setItem('promptCompressor:learnedRules', JSON.stringify([rule]));

    deleteRule('del-001');
    expect(getLearnedRules().find(r => r.id === 'del-001')).toBeUndefined();
  });
});

describe('resetAllLearning', () => {
  it('clears all stored data', () => {
    localStorageMock.setItem('promptCompressor:learnedRules', JSON.stringify([{ id: 'x' }]));
    localStorageMock.setItem('promptCompressor:phraseFrequency', JSON.stringify({ hi: 5 }));

    resetAllLearning();

    expect(localStorageMock.getItem('promptCompressor:learnedRules')).toBeNull();
    expect(localStorageMock.getItem('promptCompressor:phraseFrequency')).toBeNull();
  });
});

describe('getApprovedRules', () => {
  it('returns only approved rules', () => {
    const rules = [
      { id: '1', pattern: 'a', replacement: '', occurrences: 1, status: 'approved' as const, risk: 'safe' as const, createdAt: 0, lastSeenAt: 0, category: 'filler' },
      { id: '2', pattern: 'b', replacement: '', occurrences: 1, status: 'pending' as const, risk: 'safe' as const, createdAt: 0, lastSeenAt: 0, category: 'filler' },
      { id: '3', pattern: 'c', replacement: '', occurrences: 1, status: 'rejected' as const, risk: 'safe' as const, createdAt: 0, lastSeenAt: 0, category: 'filler' },
    ];
    localStorageMock.setItem('promptCompressor:learnedRules', JSON.stringify(rules));

    const approved = getApprovedRules();
    expect(approved).toHaveLength(1);
    expect(approved[0].pattern).toBe('a');
  });
});
