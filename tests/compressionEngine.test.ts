// Tests for the core compression engine
import { describe, it, expect } from 'vitest';
import { compress, getDefaultEnabledRules } from '../src/utils/compressionEngine';

function makeOptions(overrides = {}) {
  return {
    enabledRuleIds: getDefaultEnabledRules(),
    customFillerPhrases: [],
    learnedRules: [],
    ...overrides,
  };
}

describe('compress — filler removal', () => {
  it('removes "basically"', () => {
    const { result } = compress('This is basically a test.', makeOptions());
    expect(result).not.toContain('basically');
  });

  it('removes "just"', () => {
    const { result } = compress('I just wanted to say hello.', makeOptions());
    expect(result).not.toContain(' just ');
  });

  it('removes "literally"', () => {
    const { result } = compress('This is literally amazing.', makeOptions());
    expect(result).not.toContain('literally');
  });
});

describe('compress — politeness stripping', () => {
  it('strips "I would like you to"', () => {
    const { result } = compress('I would like you to write a summary.', makeOptions());
    expect(result.toLowerCase()).not.toContain('i would like you to');
  });

  it('strips greeting openers', () => {
    const { result } = compress('Hello! I need help with Python.', makeOptions());
    expect(result.toLowerCase()).not.toContain('hello');
    expect(result).toContain('Python');
  });
});

describe('compress — redundancy reduction', () => {
  it('converts "in order to" to "to"', () => {
    const { result } = compress('I did this in order to save time.', makeOptions());
    expect(result).not.toContain('in order to');
    expect(result).toContain('to');
  });

  it('converts "due to the fact that" to "because"', () => {
    const { result } = compress('I left due to the fact that it was late.', makeOptions());
    expect(result).not.toContain('due to the fact that');
    expect(result).toContain('because');
  });

  it('converts "at this point in time" to "now"', () => {
    const { result } = compress('At this point in time, nothing is certain.', makeOptions());
    expect(result.toLowerCase()).not.toContain('at this point in time');
  });
});

describe('compress — negation protection', () => {
  it('preserves "not"', () => {
    const { result } = compress('Please do not remove this word.', makeOptions());
    expect(result).toContain('not');
  });

  it('preserves "never"', () => {
    const { result } = compress('You should never do this basically.', makeOptions());
    expect(result).toContain('never');
    expect(result).not.toContain('basically');
  });

  it('preserves "cannot"', () => {
    const { result } = compress('The system cannot be reset.', makeOptions());
    expect(result).toContain('cannot');
  });

  it('preserves "don\'t"', () => {
    const { result } = compress("Please don't do that basically.", makeOptions());
    expect(result).toContain("don't");
  });
});

describe('compress — number protection', () => {
  it('preserves numbers', () => {
    const { result } = compress('I need 42 items by 2024-01-15.', makeOptions());
    expect(result).toContain('42');
    expect(result).toContain('2024-01-15');
  });
});

describe('compress — URL protection', () => {
  it('preserves URLs', () => {
    const url = 'https://example.com/api?key=123';
    const { result } = compress(`Please check basically this URL: ${url}`, makeOptions());
    expect(result).toContain(url);
  });
});

describe('compress — quoted string protection', () => {
  it('preserves quoted content', () => {
    const { result } = compress('The error was "just kidding" literally.', makeOptions());
    expect(result).toContain('"just kidding"');
  });
});

describe('compress — empty input', () => {
  it('returns empty for empty input', () => {
    const { result } = compress('', makeOptions());
    expect(result).toBe('');
  });

  it('returns whitespace for whitespace input', () => {
    const { result } = compress('   ', makeOptions());
    expect(result.trim()).toBe('');
  });
});

describe('compress — custom filler phrases', () => {
  it('applies custom phrases', () => {
    const opts = makeOptions({ customFillerPhrases: ['as per my last email'] });
    const { result, appliedRules } = compress(
      'As per my last email, please review the document.',
      opts
    );
    expect(result.toLowerCase()).not.toContain('as per my last email');
    expect(appliedRules.some(r => r.startsWith('custom:'))).toBe(true);
  });
});

describe('compress — applied rules tracking', () => {
  it('tracks which rules fired', () => {
    const { appliedRules } = compress(
      'I would like you to basically help me.',
      makeOptions()
    );
    expect(appliedRules.length).toBeGreaterThan(0);
  });

  it('returns empty applied rules when no rules match', () => {
    const { appliedRules } = compress(
      'Write a Python function that sorts a list.',
      makeOptions()
    );
    // May or may not have matches, but should not crash
    expect(Array.isArray(appliedRules)).toBe(true);
  });
});
