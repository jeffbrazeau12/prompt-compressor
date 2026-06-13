// Tests for tokenEstimator utility
import { describe, it, expect } from 'vitest';
import { estimateTokens, calcReduction, formatTokenCount } from '../src/utils/tokenEstimator';

describe('estimateTokens', () => {
  it('returns 0 for empty string', () => {
    expect(estimateTokens('')).toBe(0);
    expect(estimateTokens('   ')).toBe(0);
  });

  it('estimates short words as single tokens', () => {
    // Each word 1-4 chars = 1 token each
    const result = estimateTokens('The cat ran');
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(6);
  });

  it('handles longer words with subword splitting', () => {
    const short = estimateTokens('run');
    const long = estimateTokens('internationalization');
    expect(long).toBeGreaterThan(short);
  });

  it('returns at least 1 for non-empty input', () => {
    expect(estimateTokens('x')).toBeGreaterThanOrEqual(1);
  });

  it('scales with text length', () => {
    const short = estimateTokens('Hello world');
    const long = estimateTokens('Hello world. This is a longer sentence with more words and content.');
    expect(long).toBeGreaterThan(short);
  });
});

describe('calcReduction', () => {
  it('returns 0 when original is 0', () => {
    expect(calcReduction(0, 0)).toBe(0);
    expect(calcReduction(0, 5)).toBe(0);
  });

  it('calculates correct percentage', () => {
    expect(calcReduction(100, 75)).toBe(25);
    expect(calcReduction(200, 100)).toBe(50);
    expect(calcReduction(100, 0)).toBe(100);
  });

  it('returns 0 when no reduction', () => {
    expect(calcReduction(50, 50)).toBe(0);
  });
});

describe('formatTokenCount', () => {
  it('uses singular for 1', () => {
    expect(formatTokenCount(1)).toBe('1 token');
  });

  it('uses plural for other counts', () => {
    expect(formatTokenCount(0)).toBe('0 tokens');
    expect(formatTokenCount(42)).toBe('42 tokens');
  });

  it('formats large numbers with commas', () => {
    expect(formatTokenCount(1234)).toBe('1,234 tokens');
  });
});
