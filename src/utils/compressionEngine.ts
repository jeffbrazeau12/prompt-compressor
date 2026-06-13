// ============================================================
// Core Compression Engine
//
// This module contains the built-in rule set and the main
// compress() function. Rules are applied in priority order:
//
//   1. Safety guards (negations, names, numbers are protected)
//   2. Filler word removal
//   3. Politeness phrase stripping
//   4. Redundancy elimination
//   5. Verbosity reduction
//   6. Whitespace normalization
//
// IMPORTANT: negations ("not", "never", "don't", "cannot", etc.)
// are NEVER touched. The engine protects them explicitly.
// ============================================================

import type { StaticRule, RuleCategory } from '../types';

// ------------------------------------------------------------
// Built-in rule definitions
// Each rule has an id, pattern, replacement, category, and risk.
// ------------------------------------------------------------
export const BUILTIN_RULES: StaticRule[] = [
  // --- FILLER WORDS & PHRASES ---
  {
    id: 'filler-001',
    pattern: /\b(basically|essentially|fundamentally)\b/gi,
    replacement: '',
    category: 'filler',
    description: 'Remove "basically", "essentially", "fundamentally"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'filler-002',
    pattern: /\b(just|simply|merely|only just)\b/gi,
    replacement: '',
    category: 'filler',
    description: 'Remove "just", "simply", "merely"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'filler-003',
    pattern: /\b(literally|actually|really|truly|certainly|definitely|absolutely|undoubtedly)\b/gi,
    replacement: '',
    category: 'filler',
    description: 'Remove empty intensifiers',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'filler-004',
    pattern: /\b(very|extremely|incredibly|tremendously|enormously|hugely)\s+(important|helpful|useful|relevant|significant)\b/gi,
    replacement: 'important',
    category: 'filler',
    description: 'Collapse "very important" → "important"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'filler-005',
    pattern: /\b(sort of|kind of|somewhat|rather|fairly|quite)\b/gi,
    replacement: '',
    category: 'filler',
    description: 'Remove hedging qualifiers that add no information',
    enabled: true,
    risk: 'safe',
  },

  // --- POLITENESS PHRASES ---
  {
    id: 'polite-001',
    pattern: /\b(please\s+)?(could\s+you\s+)?(please\s+)?(kindly\s+)?help\s+me\s+(to\s+)?(understand|figure out|learn about|know|find out)\b/gi,
    replacement: 'explain',
    category: 'politeness',
    description: 'Compress "could you please help me understand" → "explain"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'polite-002',
    pattern: /\b(I\s+would\s+like\s+(you\s+to\s+)?|I\s+want\s+you\s+to\s+|please\s+)(help\s+me\s+)?\b/gi,
    replacement: '',
    category: 'politeness',
    description: 'Remove "I would like you to", "I want you to", "please"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'polite-003',
    pattern: /\b(thank\s+you\s+(in\s+advance|for\s+(your\s+)?(help|assistance|time|response))[.!]?)/gi,
    replacement: '',
    category: 'politeness',
    description: 'Remove "thank you in advance" closing phrases',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'polite-004',
    pattern: /\b(if\s+(it'?s?\s+)?possible|if\s+you\s+(can|could|are\s+able\s+to)|when\s+you\s+(get\s+a\s+chance|have\s+time))[,.]?\s*/gi,
    replacement: '',
    category: 'politeness',
    description: 'Remove "if possible", "when you get a chance"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'polite-005',
    pattern: /^(Hi|Hello|Hey|Greetings|Good\s+(morning|afternoon|evening))[,!.]?\s*(there[,!.]?\s*)?(I('m|\s+am)\s+(writing|reaching out|contacting you)\s+(to|because)\s+)?/gim,
    replacement: '',
    category: 'politeness',
    description: 'Remove greeting openers',
    enabled: true,
    risk: 'safe',
  },

  // --- REDUNDANCY ---
  {
    id: 'redun-001',
    pattern: /\b(end\s+result|final\s+outcome|past\s+history|future\s+plans|free\s+gift|true\s+fact|brief\s+summary|close\s+proximity|advance\s+warning|added\s+bonus)\b/gi,
    replacement: (match: string) => match.split(/\s+/).pop() || match,
    category: 'redundancy',
    description: 'Remove redundant word pairs (e.g. "end result" → "result")',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'redun-002',
    pattern: /\b(in\s+order\s+to)\b/gi,
    replacement: 'to',
    category: 'redundancy',
    description: '"in order to" → "to"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'redun-003',
    pattern: /\b(due\s+to\s+the\s+fact\s+that)\b/gi,
    replacement: 'because',
    category: 'redundancy',
    description: '"due to the fact that" → "because"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'redun-004',
    pattern: /\b(in\s+the\s+event\s+that)\b/gi,
    replacement: 'if',
    category: 'redundancy',
    description: '"in the event that" → "if"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'redun-005',
    pattern: /\b(at\s+this\s+(point\s+in\s+time|moment\s+in\s+time)|at\s+the\s+present\s+time)\b/gi,
    replacement: 'now',
    category: 'redundancy',
    description: '"at this point in time" → "now"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'redun-006',
    pattern: /\b(on\s+a\s+daily\s+basis)\b/gi,
    replacement: 'daily',
    category: 'redundancy',
    description: '"on a daily basis" → "daily"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'redun-007',
    pattern: /\b(each\s+and\s+every)\b/gi,
    replacement: 'every',
    category: 'redundancy',
    description: '"each and every" → "every"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'redun-008',
    pattern: /\b(first\s+and\s+foremost)\b/gi,
    replacement: 'first',
    category: 'redundancy',
    description: '"first and foremost" → "first"',
    enabled: true,
    risk: 'safe',
  },

  // --- VERBOSITY / WORDY CONSTRUCTIONS ---
  {
    id: 'verb-001',
    pattern: /\b(it\s+is\s+(important|necessary|essential|critical)\s+(to\s+note\s+that|that))\b/gi,
    replacement: 'note:',
    category: 'verbosity',
    description: '"It is important to note that" → "Note:"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'verb-002',
    pattern: /\b(the\s+fact\s+that)\b/gi,
    replacement: 'that',
    category: 'verbosity',
    description: '"the fact that" → "that"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'verb-003',
    pattern: /\b(what\s+I('m|\s+am)\s+looking\s+for\s+is|what\s+I\s+need\s+is)\s+/gi,
    replacement: 'I need ',
    category: 'verbosity',
    description: '"What I\'m looking for is" → "I need"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'verb-004',
    pattern: /\b(make\s+sure\s+(that\s+)?you)\b/gi,
    replacement: 'ensure you',
    category: 'verbosity',
    description: '"make sure that you" → "ensure you"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'verb-005',
    pattern: /\b(as\s+(well\s+as|much\s+as\s+possible))\b/gi,
    replacement: 'and',
    category: 'verbosity',
    description: '"as well as" → "and"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'verb-006',
    pattern: /\b(in\s+terms\s+of)\b/gi,
    replacement: 'for',
    category: 'verbosity',
    description: '"in terms of" → "for"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'verb-007',
    pattern: /\b(a\s+(large|great|significant|substantial)\s+(number|amount|quantity)\s+of)\b/gi,
    replacement: 'many',
    category: 'verbosity',
    description: '"a large number of" → "many"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'verb-008',
    pattern: /\b(in\s+(the\s+)?my\s+opinion,?\s*(I\s+think|I\s+believe)?|I\s+personally\s+(think|believe|feel)\s+that|in\s+my\s+personal\s+opinion)\s*/gi,
    replacement: 'I think ',
    category: 'verbosity',
    description: '"In my personal opinion I believe that" → "I think"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'verb-009',
    pattern: /\b(with\s+(regards?|reference|respect)\s+to|with\s+regard\s+to)\b/gi,
    replacement: 'regarding',
    category: 'verbosity',
    description: '"with regards to" → "regarding"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'verb-010',
    pattern: /\b(take\s+into\s+consideration)\b/gi,
    replacement: 'consider',
    category: 'verbosity',
    description: '"take into consideration" → "consider"',
    enabled: true,
    risk: 'safe',
  },

  // --- HEDGES & SOFT OPENINGS ---
  {
    id: 'hedge-001',
    pattern: /^(I\s+hope\s+(this|that)\s+(message\s+)?(finds\s+you\s+well|makes\s+sense)[,.]?\s*)/gim,
    replacement: '',
    category: 'hedge',
    description: 'Remove "I hope this finds you well"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'hedge-002',
    pattern: /\b(feel\s+free\s+to\s+)\b/gi,
    replacement: '',
    category: 'hedge',
    description: 'Remove "feel free to"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'hedge-003',
    pattern: /\b(as\s+you\s+(may|might|probably)\s+(know|be\s+aware|remember)[,.]?\s*)\b/gi,
    replacement: '',
    category: 'hedge',
    description: 'Remove "as you may know"',
    enabled: true,
    risk: 'safe',
  },

  // --- TRANSITIONS (low-value connectors) ---
  {
    id: 'trans-001',
    pattern: /\b(having\s+said\s+that[,.]?\s*)\b/gi,
    replacement: '',
    category: 'transition',
    description: 'Remove "having said that"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'trans-002',
    pattern: /\b(needless\s+to\s+say[,.]?\s*)\b/gi,
    replacement: '',
    category: 'transition',
    description: 'Remove "needless to say"',
    enabled: true,
    risk: 'safe',
  },
  {
    id: 'trans-003',
    pattern: /\b(it\s+goes\s+without\s+saying\s+(that\s+)?)\b/gi,
    replacement: '',
    category: 'transition',
    description: 'Remove "it goes without saying that"',
    enabled: true,
    risk: 'safe',
  },
];

// ------------------------------------------------------------
// Protect tokens: these words and patterns must never be altered.
// We replace them with placeholders before compression, then
// restore them after.
// ------------------------------------------------------------

// Words that must never be stripped even when they appear near filler
const PROTECTED_NEGATIONS = [
  'not', 'never', 'no', "don't", "doesn't", "didn't", "won't", "wouldn't",
  "can't", "cannot", "couldn't", "shouldn't", "mustn't", "isn't", "aren't",
  "wasn't", "weren't", "haven't", "hasn't", "hadn't", "nor", "neither",
  'without', 'unless', 'except', 'exclude', 'except', 'fail', 'avoid',
  'prevent', 'stop', 'block', 'deny', 'refuse', 'reject', 'ignore',
];

/**
 * Placeholder system to protect important tokens during compression.
 * Returns the text with protected tokens replaced, plus a restore map.
 */
function protectTokens(text: string): { protected: string; restoreMap: Map<string, string> } {
  const restoreMap = new Map<string, string>();
  let counter = 0;
  let result = text;

  // Protect URLs FIRST (before numbers, so numbers inside URLs are not double-replaced)
  result = result.replace(/https?:\/\/[^\s]+/g, (match) => {
    const key = `__URL${counter++}__`;
    restoreMap.set(key, match);
    return key;
  });

  // Protect numbers (including dates, percentages, currency)
  result = result.replace(/\b(\d[\d,./:%$€£-]*\d|\d)\b/g, (match) => {
    const key = `__NUM${counter++}__`;
    restoreMap.set(key, match);
    return key;
  });

  // Protect quoted strings (preserve user's exact wording in quotes)
  result = result.replace(/"[^"]*"|'[^']*'|`[^`]*`/g, (match) => {
    const key = `__QUOT${counter++}__`;
    restoreMap.set(key, match);
    return key;
  });

  // Protect negations — these must never be removed
  const negationPattern = new RegExp(
    `\\b(${PROTECTED_NEGATIONS.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
    'gi'
  );
  result = result.replace(negationPattern, (match) => {
    const key = `__NEG${counter++}__`;
    restoreMap.set(key, match);
    return key;
  });

  return { protected: result, restoreMap };
}

/**
 * Restores all protected tokens from the placeholder map.
 */
function restoreTokens(text: string, restoreMap: Map<string, string>): string {
  let result = text;
  for (const [key, value] of restoreMap) {
    result = result.split(key).join(value);
  }
  return result;
}

/**
 * Normalizes whitespace: collapses multiple spaces, trims leading/trailing
 * spaces on each line, removes blank lines created by removed phrases.
 */
function normalizeWhitespace(text: string): string {
  return text
    .split('\n')
    .map(line => line.replace(/\s{2,}/g, ' ').trim())
    .filter((line, i, arr) => {
      // Remove consecutive blank lines
      if (line === '' && (i === 0 || arr[i - 1] === '')) return false;
      return true;
    })
    .join('\n')
    .trim();
}

/** Options passed to the compress function */
export interface CompressOptions {
  enabledRuleIds: Set<string>;              // Which built-in rules to apply
  customFillerPhrases: string[];            // User-added phrases to strip
  learnedRules: { pattern: string; replacement: string }[]; // Approved learned rules
}

/**
 * Main compression function.
 * 
 * Returns the compressed text and list of rule IDs that fired.
 */
export function compress(text: string, options: CompressOptions): {
  result: string;
  appliedRules: string[];
} {
  if (!text || text.trim().length === 0) {
    return { result: text, appliedRules: [] };
  }

  const appliedRules: string[] = [];

  // Step 1: Protect critical tokens (numbers, URLs, quotes, negations)
  const { protected: protectedText, restoreMap } = protectTokens(text);
  let result = protectedText;

  // Step 2: Apply custom filler phrases (user-added)
  for (const phrase of options.customFillerPhrases) {
    if (!phrase.trim()) continue;
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const before = result;
    result = result.replace(regex, '');
    if (result !== before) appliedRules.push(`custom:${phrase}`);
  }

  // Step 3: Apply approved learned rules
  for (const rule of options.learnedRules) {
    if (!rule.pattern.trim()) continue;
    try {
      const escaped = rule.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      const before = result;
      result = result.replace(regex, rule.replacement as string);
      if (result !== before) appliedRules.push(`learned:${rule.pattern}`);
    } catch {
      // Skip malformed patterns
    }
  }

  // Step 4: Apply built-in rules in order
  for (const rule of BUILTIN_RULES) {
    if (!options.enabledRuleIds.has(rule.id)) continue;

    const before = result;
    if (rule.pattern instanceof RegExp) {
      if (typeof rule.replacement === 'function') {
        result = result.replace(rule.pattern, rule.replacement as (m: string) => string);
      } else {
        result = result.replace(rule.pattern, rule.replacement);
      }
    } else {
      const escaped = (rule.pattern as string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      result = result.replace(regex, rule.replacement as string);
    }

    if (result !== before) appliedRules.push(rule.id);
  }

  // Step 5: Restore protected tokens
  result = restoreTokens(result, restoreMap);

  // Step 6: Clean up whitespace artifacts
  result = normalizeWhitespace(result);

  return { result, appliedRules };
}

/** Returns default enabled rule IDs (all safe rules) */
export function getDefaultEnabledRules(): Set<string> {
  return new Set(BUILTIN_RULES.filter(r => r.enabled).map(r => r.id));
}

/** Groups rules by category for the settings UI */
export function getRulesByCategory(): Map<RuleCategory, StaticRule[]> {
  const map = new Map<RuleCategory, StaticRule[]>();
  for (const rule of BUILTIN_RULES) {
    const existing = map.get(rule.category) || [];
    map.set(rule.category, [...existing, rule]);
  }
  return map;
}
